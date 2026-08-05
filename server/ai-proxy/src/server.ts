// Reference proxy for the docs "Ask AI" panel.
// Wire contract: specs/ai-assistant-v1.md. The static site never holds a key;
// this service owns ANTHROPIC_API_KEY and the docs corpus (llms-full.txt).
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { readFileSync } from 'node:fs';
import Anthropic from '@anthropic-ai/sdk';

const PORT = Number(process.env.PORT ?? 8787);
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN;
const MAX_MESSAGES = 20;
const MAX_CONTENT_CHARS = 4000;

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment

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

const docsContext = await loadDocsContext();
console.log(`Docs corpus loaded (${(docsContext.length / 1024).toFixed(0)} KB)`);

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
    const stream = client.beta.messages.stream({
      model: 'claude-opus-5',
      max_tokens: 8192,
      thinking: { type: 'adaptive' },
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      // Stable-first system blocks with the cache breakpoint on the corpus:
      // instructions + corpus cache together; volatile page/locale rides in
      // the final user message, after the breakpoint.
      system: [
        { type: 'text', text: BASE_SYSTEM },
        { type: 'text', text: docsContext, cache_control: { type: 'ephemeral' } },
      ],
      messages: [
        ...messages.slice(0, -1),
        {
          role: 'user',
          content: `[locale: ${locale ?? 'zh-CN'}; current docs page: ${page ?? '/'}]\n\n${last.content}`,
        },
      ],
    });

    stream.on('text', (delta) => sse(res, { type: 'text', text: delta }));

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
}).listen(PORT, () => {
  console.log(`ai-proxy listening on http://localhost:${PORT}`);
});
