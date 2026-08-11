// Reference proxy for the docs "Ask AI" panel.
// Wire contract: see "接口契约" in ./README.md. The static site never holds a key;
// this service owns the upstream API key and the docs corpus (llms-full.txt).
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { readFileSync } from 'node:fs';
import Anthropic from '@anthropic-ai/sdk';

const PORT = Number(process.env.PORT ?? 8787);
// Loopback by default: nginx terminates TLS and enforces rate limits in front of
// this service, so binding 0.0.0.0 would expose a bypass around both. Override
// with HOST=0.0.0.0 only when the proxy runs in a container/network namespace.
const HOST = process.env.HOST ?? '127.0.0.1';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN;
const MAX_MESSAGES = 20;
const MAX_CONTENT_CHARS = 4000;

// Upstream: Anthropic by default; AI_PROVIDER=deepseek targets DeepSeek's
// Anthropic-compatible API (https://api-docs.deepseek.com/guides/anthropic_api).
const PROVIDER = process.env.AI_PROVIDER ?? 'anthropic';
if (PROVIDER !== 'anthropic' && PROVIDER !== 'deepseek') {
  throw new Error(`AI_PROVIDER must be "anthropic" or "deepseek", got "${PROVIDER}"`);
}
// Without an explicit apiKey the SDK would fall back to ANTHROPIC_API_KEY and
// send the Anthropic key to DeepSeek — fail fast instead.
if (PROVIDER === 'deepseek' && !process.env.DEEPSEEK_API_KEY) {
  throw new Error('DEEPSEEK_API_KEY is required when AI_PROVIDER=deepseek');
}
const MODEL =
  process.env.AI_MODEL ?? (PROVIDER === 'deepseek' ? 'deepseek-v4-pro' : 'claude-opus-5');

const client =
  PROVIDER === 'deepseek'
    ? new Anthropic({
        baseURL: 'https://api.deepseek.com/anthropic',
        apiKey: process.env.DEEPSEEK_API_KEY,
      })
    : new Anthropic(); // reads ANTHROPIC_API_KEY from the environment

async function loadDocsContext(): Promise<string> {
  if (process.env.DOCS_LLMS_FILE) {
    return readFileSync(process.env.DOCS_LLMS_FILE, 'utf8');
  }
  const url =
    process.env.DOCS_LLMS_URL ?? 'https://docs.bivrost.cn/gateway-protocol/llms-full.txt';
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch docs corpus from ${url}: HTTP ${res.status}`);
  return res.text();
}

// Optional context cap (chars). Useful for providers without prompt caching
// (DeepSeek pays full prefill per request) and for network paths where large
// request bodies stall. Cuts at a llms-full.txt page boundary (pages start
// with a "# heading" line followed by "URL: ..."), dropping the partial page.
function truncateAtPageBoundary(corpus: string, max: number): string {
  if (max <= 0 || corpus.length <= max) return corpus;
  const urlIdx = corpus.lastIndexOf('\nURL:', max);
  const cut = corpus.lastIndexOf('\n#', urlIdx < 0 ? max : urlIdx);
  return corpus.slice(0, cut > 0 ? cut : max);
}

const rawDocsContext = await loadDocsContext();
const docsContext = truncateAtPageBoundary(
  rawDocsContext,
  Number(process.env.DOCS_CONTEXT_MAX_CHARS ?? 0),
);
console.log(
  `Docs corpus loaded (${(docsContext.length / 1024).toFixed(0)} KB` +
    (docsContext.length < rawDocsContext.length
      ? `, truncated from ${(rawDocsContext.length / 1024).toFixed(0)} KB`
      : '') +
    ')',
);

const BASE_SYSTEM = `You are the Bivrost gateway protocol assistant, embedded in the official
documentation site for the Bivrost Gateway Communication Protocol (彼络物联网关 通讯协议).

Answer questions about the gateway protocol using ONLY the documentation provided below.
Answer in the user's language (the request indicates zh-CN or en). When helpful, cite the
relevant documentation page by its URL so the reader can follow up. If a question cannot be
answered from the documentation, say so briefly instead of guessing. Keep answers focused
and concise; use fenced code blocks for JSON examples and request/response bodies.`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  page?: string;
  locale?: string;
}

function unavailableMsg(locale: string | undefined): string {
  return locale === 'en'
    ? 'The assistant is currently unavailable. Please try again later.'
    : 'AI 助手暂时不可用，请稍后再试。';
}

function validate(body: unknown): { ok: true; req: ChatRequest } | { ok: false; error: string } {
  if (typeof body !== 'object' || body === null) return { ok: false, error: 'invalid JSON body' };
  const { messages } = body as ChatRequest;
  if (!Array.isArray(messages) || messages.length === 0)
    return { ok: false, error: 'messages must be a non-empty array' };
  if (messages.length > MAX_MESSAGES)
    return { ok: false, error: `messages must contain at most ${MAX_MESSAGES} items` };
  for (const msg of messages) {
    if (msg.role !== 'user' && msg.role !== 'assistant')
      return { ok: false, error: 'message role must be "user" or "assistant"' };
    if (typeof msg.content !== 'string' || msg.content.length === 0)
      return { ok: false, error: 'message content must be a non-empty string' };
    if (msg.content.length > MAX_CONTENT_CHARS)
      return { ok: false, error: `message content must be at most ${MAX_CONTENT_CHARS} chars` };
  }
  if (messages[messages.length - 1].role !== 'user')
    return { ok: false, error: 'last message must have role "user"' };
  return { ok: true, req: body as ChatRequest };
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 256 * 1024) reject(new Error('body too large'));
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function sse(res: ServerResponse, obj: unknown): void {
  res.write(`data: ${JSON.stringify(obj)}\n\n`);
}

function json(res: ServerResponse, status: number, obj: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

createServer(async (req, res) => {
  if (ALLOWED_ORIGIN) {
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
      res.writeHead(204).end();
      return;
    }
  }

  if (req.method !== 'POST' || req.url !== '/api/assistant/chat') {
    json(res, 404, { error: 'not found' });
    return;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(await readBody(req));
  } catch {
    json(res, 400, { error: 'invalid JSON body' });
    return;
  }
  const result = validate(parsed);
  if (!result.ok) {
    json(res, 400, { error: result.error });
    return;
  }
  const { messages, page, locale } = result.req;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Accel-Buffering': 'no',
  });

  try {
    const last = messages[messages.length - 1];
    // Stable-first system blocks with the cache breakpoint on the corpus:
    // instructions + corpus cache together; volatile page/locale rides in
    // the final user message, after the breakpoint. DeepSeek's compatible API
    // has no prompt caching, adaptive thinking, or fallback betas — the plain
    // streaming call omits them (cache_control et al. are unsupported there).
    const request = {
      model: MODEL,
      max_tokens: 8192,
      system: [
        { type: 'text' as const, text: BASE_SYSTEM },
        ...(PROVIDER === 'deepseek'
          ? [{ type: 'text' as const, text: docsContext }]
          : [
              {
                type: 'text' as const,
                text: docsContext,
                cache_control: { type: 'ephemeral' as const },
              },
            ]),
      ],
      messages: [
        ...messages.slice(0, -1),
        {
          role: 'user' as const,
          content: `[locale: ${locale ?? 'zh-CN'}; current docs page: ${page ?? '/'}]\n\n${last.content}`,
        },
      ],
    };
    const onText = (delta: string) => sse(res, { type: 'text', text: delta });
    const stream =
      PROVIDER === 'deepseek'
        ? client.messages.stream(request).on('text', onText)
        : client.beta.messages.stream({
            ...request,
            thinking: { type: 'adaptive' },
            betas: ['server-side-fallback-2026-07-01'],
            fallbacks: 'default',
          }).on('text', onText);

    const final = await stream.finalMessage();
    if (final.stop_reason === 'refusal') {
      sse(res, { type: 'error', message: unavailableMsg(locale) });
    }
    sse(res, { type: 'done' });
  } catch (err) {
    console.error('upstream error:', err);
    sse(res, { type: 'error', message: unavailableMsg(locale) });
    sse(res, { type: 'done' });
  }
  res.end();
}).listen(PORT, HOST, () => {
  console.log(`ai-proxy listening on http://${HOST}:${PORT} (${PROVIDER}, model ${MODEL})`);
});
