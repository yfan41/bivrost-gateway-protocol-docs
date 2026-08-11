# Docs AI Proxy（参考实现）

文档站「问 AI / Ask AI」面板（`src/components/AskAI.astro`）的后端参考实现。
下方「接口契约」一节即前后端之间的唯一约定：只要遵守它，代理可以换任意实现与上游，
前端无需改动。

本目录是**独立包**，不属于仓库根目录的 pnpm workspace —— 文档站构建与 CI 不受它影响。

## 接口契约

**请求** —— `POST /api/assistant/chat`，`Content-Type: application/json`：

```json
{
  "messages": [{ "role": "user", "content": "..." }],
  "page": "/gateway-protocol/http/auth/",
  "locale": "zh-CN"
}
```

- `messages`：对话历史，每条 `role` ∈ `user` | `assistant`；最多 20 条；每条 `content`
  最长 4000 字符；最后一条必须为 `user`。违反任一条 → `400` + JSON `{"error": "..."}`。
- `page`：当前文档页路径（供模型参考的上下文）。
- `locale`：`zh-CN` 或 `en`，模型以该语言作答。

**响应** —— `200`，`Content-Type: text/event-stream; charset=utf-8`。SSE 帧（每个
`data:` 行以空行结束；以 `:` 开头的注释行可用作心跳）：

```
data: {"type":"text","text":"<答案增量>"}

data: {"type":"error","message":"<本地化提示>"}

data: {"type":"done"}
```

- `text` 帧按序携带答案增量；`error` 取代答案（前端丢弃已累积文本）；每条流均以 `done` 结束。
- 流开始前的失败：`429`（限流）或 `503`（上游不可用），返回 JSON `{"error": "..."}`。
- 代理固定发送 `Cache-Control: no-store` 与 `X-Accel-Buffering: no`。
- 生产环境同源部署，无需 CORS；开发时用 `ALLOWED_ORIGIN` 放开跨域。

## 运行

```bash
cd server/ai-proxy
pnpm install --ignore-workspace   # 必须带该参数，否则 pnpm 会误装到仓库根 workspace
cp .env.example .env              # 填入 ANTHROPIC_API_KEY
pnpm dev                          # tsx 直接运行 src/server.ts，监听 127.0.0.1:8787
```

默认只监听回环地址（`HOST`，默认 `127.0.0.1`）——生产环境由 nginx 终止 TLS 并限流，
直接暴露 `:8787` 会绕过两者。仅当跑在容器/独立网络命名空间中时才设 `HOST=0.0.0.0`。

## 上游模型

默认上游为 Anthropic（`ANTHROPIC_API_KEY`，模型 `claude-opus-5`）。若部署环境访问
Anthropic 受限，可切换到 [DeepSeek 的 Anthropic 兼容接口](https://api-docs.deepseek.com/guides/anthropic_api)：
`.env` 中设 `AI_PROVIDER=deepseek` 并填入 `DEEPSEEK_API_KEY`（模型默认 `deepseek-v4-pro`，
用 `AI_MODEL` 可覆盖）。DeepSeek 不支持 prompt caching、adaptive thinking 与 refusal
fallback beta，代理在该模式下自动省略这些参数；SSE 输出契约完全一致，前端无需改动。

语料来源二选一（`.env` 中配置）：

- `DOCS_LLMS_FILE=../../dist/llms-full.txt` — 先在仓库根目录 `pnpm build` 生成
- `DOCS_LLMS_URL=https://docs.bivrost.cn/gateway-protocol/llms-full.txt` — 启动时从线上抓取

## 冒烟测试

```bash
curl -N -X POST localhost:8787/api/assistant/chat \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"readAlarm 接口的返回格式是什么？"}],"page":"/","locale":"zh-CN"}'
```

预期：一串 `data: {"type":"text",...}` 帧，以 `data: {"type":"done"}` 结束。

配合文档站本地联调：仓库根目录 `pnpm dev`（Vite 已将 `/api/assistant` 代理到 :8787），在页面右下角的面板中提问即可。

## 生产部署（ops）

- systemd 服务运行 `pnpm build && pnpm start`（或直接 `tsx`），环境变量注入 `ANTHROPIC_API_KEY`
  （或 `AI_PROVIDER=deepseek` + `DEEPSEEK_API_KEY`，见上）
- 本服务只监听 `127.0.0.1:8787`，**由 nginx 反向代理**到文档站同一个 vhost 下（同源，
  因此不需要 CORS，`ALLOWED_ORIGIN` 留空）：

  ```nginx
  # http {} 层：限流区（本接口无鉴权且每次请求都产生上游费用）
  limit_req_zone $binary_remote_addr zone=askai:10m rate=10r/m;

  # 文档站 server {} 内，放在静态文件 location 之前
  location /api/assistant/ {
      proxy_pass http://127.0.0.1:8787;   # 末尾不加 /，URI 原样透传
      proxy_http_version 1.1;             # 默认 1.0 会破坏 chunked 流式输出
      proxy_set_header Connection '';
      proxy_set_header Host $host;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_buffering off;                # 必须，否则流式输出退化为一次性下发
      proxy_cache off;
      proxy_read_timeout 300s;            # 需大于最长一次生成耗时
      client_max_body_size 256k;          # 与服务端 readBody() 上限一致
      limit_req zone=askai burst=5 nodelay;
  }
  ```

  两个易漏项：`proxy_http_version 1.1`（服务端发的 `X-Accel-Buffering: no` 只能兜住
  buffering，兜不住 HTTP/1.0）、以及本 location 必须排在静态资源规则之前。
- 每次文档站部署后重启本服务（或改用 `DOCS_LLMS_URL` 并定期重启）以更新语料
