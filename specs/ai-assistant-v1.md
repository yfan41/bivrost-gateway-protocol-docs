# Spec: Docs AI Assistant v1

```
status: ready-for-agent
date: 2026-08-05
source: plan session (llms.txt + Ask AI panel + proxy contract, all decisions user-confirmed)
```

## Problem Statement

The gateway protocol documentation is ~60 pages across four transports (HTTP, MODBUS, MQTT, database) in two languages. Integrators arrive with narrow questions — "what does errorCode 142 mean?", "how do I send a program file to a Fanuc?" — and have to know which chapter answers them. Meanwhile AI coding assistants, which integrators increasingly use to write gateway client code, have no machine-friendly way to ingest the docs: the site ships only HTML pages designed for humans.

Two gaps, one theme: the documentation has no AI-agent surface — neither for third-party agents reading the docs, nor for readers who want to ask questions in place.

## Solution

Two features, both shipped from the docs repository:

1. **llms.txt** — the site publishes `/llms.txt` (bilingual per-page index following llmstxt.org conventions), `/llms-full.txt` (complete Simplified Chinese docs as one plain-text file), and `/en/llms-full.txt` (English). Generated at build time from the same content collection that renders the site, so they can never drift from the published pages. Any AI agent can now ingest the entire protocol in one fetch.

2. **Ask AI panel** — every docs page renders a floating "问 AI / Ask AI" button opening a side drawer chat. The panel calls a **Bivrost-hosted proxy** at a same-origin path; the proxy holds the Anthropic API key and the docs corpus (it loads `llms-full.txt`) and streams answers back. The static site never contains a secret, and the panel degrades to a localized "assistant unavailable" message when the proxy is absent (local preview, on-device build).

This repo delivers the frontend, this contract, and a reference proxy implementation under `server/ai-proxy/`. Deploying the proxy (systemd unit, nginx route, API key custody) is Bivrost ops work outside this repo.

## User Stories

1. As an integrator using an AI coding assistant, I want the full protocol docs available at a stable `llms-full.txt` URL, so that my assistant can answer gateway questions from the authoritative source.
2. As an AI agent crawling the site, I want `/llms.txt` to index every page with absolute URLs in both languages, so that I can fetch exactly the pages relevant to a question.
3. As a docs reader, I want to ask a question in a side panel without leaving the page, so that I don't have to guess which chapter holds the answer.
4. As a Chinese-speaking reader on the zh site (or an English speaker on `/en/`), I want the panel UI and the answers in my language, so that the assistant matches the docs I'm reading.
5. As a reader, I want answers streamed token-by-token with doc links I can click, so that long answers feel responsive and verifiable.
6. As a reader on a deployment without the proxy (or during an outage), I want a clear localized "assistant unavailable" message, so that a missing backend never looks like a broken site.
7. As Bivrost ops, I want the proxy contract pinned in this spec, so that the frontend and any future proxy implementation can evolve independently.

## Implementation Decisions

### llms.txt generation

- Hand-built Astro static endpoints (`src/pages/llms.txt.ts`, `src/pages/llms-full.txt.ts`, `src/pages/en/llms-full.txt.ts`) sharing `src/lib/llms.ts`; no third-party plugin (unverifiable compatibility with Astro 7 + the satteri markdown pipeline).
- Page order mirrors the sidebar via a `PAGE_ORDER` list in `src/lib/llms.ts`; unknown pages are appended alphabetically, never dropped (soft sync point, noted in the README).
- Root-absolute links in page bodies are rewritten to absolute `https://docs.bivrost.cn` URLs honoring `DOCS_BASE` — the plain-text twin of the site's `rebaseAbsoluteLinks` plugin.
- The version comes from the repo-root `VERSION` file (same source as `astro.config.mjs`); no new version-sync point.
- Files land in `dist/`, so the existing rsync deploy publishes them with no CI change.

### Ask AI panel (frontend)

- `src/components/AskAI.astro`, mounted via the existing `Footer.astro` override (renders on every page). Vanilla TypeScript, zero new dependencies; styles use only Starlight CSS variables so light/dark theming is automatic.
- Endpoint defaults to `/api/assistant/chat`; configurable at build time via `PUBLIC_AI_ASSISTANT_ENDPOINT`; the value `off` (or empty) removes the widget — intended for the on-device `/app/docs` build.
- Conversation history lives in `sessionStorage` (`bivrost-ai-chat:<locale>`), per-locale, capped at the last 20 messages per request. No server-side persistence.
- Answers are rendered by a minimal hand-rolled markdown renderer (HTML-escape first; fenced/inline code, bold, links, lists). No remote scripts.
- Failure of any kind (non-2xx, network error, empty stream) shows the localized unavailable message; the user's question is kept in history for retry, the failed assistant turn is not.

### Wire contract (proxy API)

**Request** — `POST /api/assistant/chat`, `Content-Type: application/json`:

```json
{
  "messages": [{ "role": "user", "content": "..." }],
  "page": "/gateway-protocol/http/auth/",
  "locale": "zh-CN"
}
```

- `messages`: alternating-ish chat history, each `role` ∈ `user` | `assistant`; max 20 items; each `content` max 4000 chars; the last item must have role `user`. Violations → `400` with JSON `{"error": "..."}`.
- `page`: current docs page path (informational context for the model).
- `locale`: `zh-CN` or `en`; the model answers in this language.

**Response** — `200` with `Content-Type: text/event-stream; charset=utf-8`. SSE frames (each `data:` line terminated by a blank line; comment lines beginning `:` may be used as heartbeats):

```
data: {"type":"text","text":"<answer delta>"}

data: {"type":"error","message":"<localized message>"}

data: {"type":"done"}
```

- `text` frames carry answer deltas in order; `error` replaces the answer (frontend discards accumulated text); every stream ends with `done`.
- Pre-stream failures: `429` (rate limited) or `503` (upstream down) with JSON `{"error": "..."}`.
- The proxy sets `Cache-Control: no-store` and `X-Accel-Buffering: no`.

### Reference proxy (`server/ai-proxy/`)

- Standalone Node package (plain `node:http`, official `@anthropic-ai/sdk`); deliberately **not** part of the pnpm workspace so the docs site's lockfile and CI stay untouched.
- Docs context: loads `llms-full.txt` at startup — from a local file (`DOCS_LLMS_FILE`, e.g. the build output) or by fetching the live site (`DOCS_LLMS_URL`). Chinese corpus only by default (halves the context; the model answers in the request locale regardless).
- Claude call: model `claude-opus-5`, streaming, adaptive thinking, `max_tokens: 8192`, no sampling parameters (removed on Opus 5). Server-side refusal fallbacks enabled (`fallbacks: "default"` with the `server-side-fallback-2026-07-01` beta).
- Alternative upstream: `AI_PROVIDER=deepseek` switches to DeepSeek's Anthropic-compatible API (`https://api.deepseek.com/anthropic`, key `DEEPSEEK_API_KEY`, default model `deepseek-v4-pro`, override with `AI_MODEL`). The Anthropic-only extras — `cache_control`, adaptive thinking, the refusal-fallback beta — are omitted on that path; the SSE surface is identical.
- Prompt caching: system blocks ordered stable-first — instructions, then the docs corpus with `cache_control: {"type": "ephemeral"}` on the corpus block; volatile per-request data (page path, locale) rides in the final user message, after the breakpoint. Steady-state input cost is ~0.1× for the corpus.
- `stop_reason: "refusal"` on the final message → localized `error` frame, never raw model internals.
- Same-origin in production (no CORS); `ALLOWED_ORIGIN` env var enables CORS for development.

### Deployment (ops runbook, outside this repo)

- Run the proxy on the docs host (e.g. port 8787) with `ANTHROPIC_API_KEY` (or `AI_PROVIDER=deepseek` + `DEEPSEEK_API_KEY`) in the service environment.
- nginx: `location /api/assistant/ { proxy_pass http://127.0.0.1:8787; proxy_buffering off; proxy_read_timeout 300s; }` — `proxy_buffering off` is required or streaming degrades to one big flush.
- After each docs deploy the proxy should be restarted (or re-fetch `DOCS_LLMS_URL`) to pick up the new corpus; the corpus embeds the docs version string, so staleness is diagnosable.

## Testing Decisions

- **llms.txt**: `pnpm build` must stay green (links validator included); assert `dist/llms.txt`, `dist/llms-full.txt`, `dist/en/llms-full.txt` exist, carry the current `VERSION`, one `URL:` header per docs page, and absolute URLs honoring `DOCS_BASE` (verified for both `/` and `/gateway-protocol`).
- **Panel**: `pnpm build && pnpm serve` — button and drawer present on zh and `/en/` pages with the correct localized strings; submitting without a proxy shows the localized unavailable message (this is the required graceful-degradation behavior, testable with no backend at all).
- **Proxy**: with a real `ANTHROPIC_API_KEY`, `curl -N -X POST localhost:8787/api/assistant/chat -H 'Content-Type: application/json' -d '{"messages":[{"role":"user","content":"readAlarm 接口的返回格式是什么？"}],"page":"/","locale":"zh-CN"}'` must stream `text` frames and end with `done`. Validation tests (too many messages, wrong last role, oversized content) need no key and must return 400.
- **End-to-end dev**: `pnpm dev` (Vite proxies `/api/assistant` → :8787) + the panel; verify streaming, sessionStorage persistence across page navigations, and the clear button.

## Out of Scope

- Authentication/rate limiting on the proxy beyond basic request validation (add at nginx if abused).
- Server-side conversation persistence, analytics, or feedback (thumbs up/down) UI.
- RAG / chunked retrieval — full-corpus context with prompt caching is deliberately chosen for v1 (the corpus fits comfortably in the 1M-token window; revisit only if the docs grow ~10×).
- Proxy deployment automation (systemd/nginx config live with ops, not in this repo).
- Answering questions outside the protocol docs (the system prompt restricts the assistant to the provided corpus).

## Further Notes

- The two features compose: the proxy's knowledge base *is* the llms-full.txt artifact, so improving one improves the other and there is exactly one docs-extraction code path to maintain.
- `PUBLIC_AI_ASSISTANT_ENDPOINT` is inlined at build time by Vite; changing the endpoint requires a rebuild, which matches how this site is deployed (every change is a rebuild + rsync).
- The frozen `/v<version>/` snapshot builds include the panel pointing at the same `/api/assistant/chat` path — the assistant always answers from the *latest* corpus. Acceptable for v1; if version-pinned answers are ever needed, add a `version` field to the request.
- If Anthropic API access becomes a constraint for the deployment region, the contract above is provider-neutral — a replacement proxy can keep the exact same SSE surface with a different upstream, and the frontend never changes. The reference proxy ships one such option built in (`AI_PROVIDER=deepseek`).
