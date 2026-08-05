# Docs AI Proxy（参考实现）

文档站「问 AI / Ask AI」面板的后端参考实现。完整契约（请求/响应格式、部署要求）见
[`specs/ai-assistant-v1.md`](../../specs/ai-assistant-v1.md)。

本目录是**独立包**，不属于仓库根目录的 pnpm workspace —— 文档站构建与 CI 不受它影响。

## 运行

```bash
cd server/ai-proxy
pnpm install --ignore-workspace   # 必须带该参数，否则 pnpm 会误装到仓库根 workspace
cp .env.example .env              # 填入 ANTHROPIC_API_KEY
pnpm dev                          # tsx 直接运行 src/server.ts，监听 :8787
```

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
- nginx：`location /api/assistant/ { proxy_pass http://127.0.0.1:8787; proxy_buffering off; proxy_read_timeout 300s; }`
- 每次文档站部署后重启本服务（或改用 `DOCS_LLMS_URL` 并定期重启）以更新语料
