# 彼络物联网关 通讯协议（文档站）

基于 [Astro Starlight](https://starlight.astro.build/) 的《彼络物联网关 通讯协议》在线文档，内容对应通讯协议 **v1.19.6**（完整转录：HTTP ~150 个接口、MODBUS 地址表、MQTT 报文格式与 RPC、数据库通讯、常见问题与全部版本变更历史）。

配套的《说明书》文档站位于 `../bivrost-gateway-docs`（线上 https://docs.bivrost.cn ）；本站中所有《说明书》引用均为指向该站的绝对链接。

## 开发

```bash
pnpm install
pnpm start        # 本地开发服务器（热更新）
```

## 构建与预览

```bash
pnpm build        # 生成静态站点到 dist/（校验所有链接与锚点，失败即报错）
pnpm serve        # 本地预览 dist/ 产物
```

## 部署

推送到 `main` 分支时，`.github/workflows/deploy.yml` 会自动构建并通过 rsync/SSH 部署到
`https://bivrost.cn/docs/gateway-protocol`（也可在 Actions 页手动触发）。

站点以 `base: /docs/gateway-protocol` 构建；正文中按约定书写的站点绝对路径链接/图片
（如 `/conventions/identifiers/`）由 `src/markdown/rewrite-base-links.mjs`
（一个 satteri hast 插件）在构建期自动补上 base 前缀，内容文件本身无需改动。

需要在仓库 Settings → Secrets and variables → Actions 中配置：

| Secret            | 说明                                                              |
| ------------------ | ----------------------------------------------------------------- |
| `DEPLOY_HOST`      | 目标服务器主机名/IP                                                |
| `DEPLOY_USER`      | SSH 用户名                                                        |
| `DEPLOY_SSH_KEY`   | 有权限登录 `DEPLOY_USER@DEPLOY_HOST` 的 SSH 私钥                   |
| `DEPLOY_PATH`      | 服务器上对应 `/docs/gateway-protocol` 路径的绝对目录，例如 `/var/www/bivrost.cn/docs/gateway-protocol` |
| `DEPLOY_PORT`      | 可选，SSH 端口，默认 `22`                                          |

若实际托管方式并非「SSH/rsync 到自有服务器」（例如改用对象存储 + CDN 或 Vercel/Netlify/Cloudflare
Pages），需要替换 `deploy.yml` 中的部署步骤。

## 目录结构

- `src/content/docs/conventions/` — 一、重要说明（标识、25 个数据类、变量枚举）
- `src/content/docs/http/` — 二、HTTP 通讯（鉴权、数据读写、文件管理、数据分析、历史数据、网关配置、网关功能）
- `src/content/docs/modbus.md` / `mqtt/` / `database.md` — 三～五、MODBUS / MQTT / 数据库通讯
- `src/content/docs/mock-testing.md` / `faq.md` / `changelog.md` — 六～七、模拟机台、常见问题、版本变更历史
- `public/img/protocol/` — 截图（取自当前版本网关 Web 管理页面）
- `astro.config.mjs` — 站点配置与侧边栏结构（对应原 Docusaurus 的 `docusaurus.config.ts` + `sidebars.ts`）

## 编写约定

- 全部为 `.md` 文件，**不要**使用 `.mdx`；`<type>`/`<field>` 等尖括号记号必须放在行内代码中
- 页面标题写在 frontmatter `title` 中（Starlight 自动渲染 H1），侧边栏名称写在 frontmatter `sidebar.label` 中；正文从 `##` 二级标题开始
- 标题自定义锚点使用 `## 标题 {#anchor}` 语法（由 `remark-heading-id` 支持），锚点 = 接口名小写（如 `{#readalarm}`）
- 提示块使用带方括号标题的语法 `:::note[注] … :::`（与 Starlight Aside 语法一致）
- 站内链接使用站点绝对路径并带尾部斜杠（如 `/conventions/identifiers/#machineid`），不要用相对 `.md` 文件路径
- 构建时 `starlight-links-validator` 对断链/断锚全部报错，修改后请 `pnpm build` 验证
- 更新版本号时需同步修改三处：`src/content/docs/` 内容、`astro.config.mjs` 侧边栏 changelog 徽标、`src/components/Footer.astro` 页脚
- 原 PDF 中经与网关 Web 前端源码比对确认的接口地址勘误已修正（`users`、`update-settings`、`update-security`、`update-database-settings`、`update-remote-access`）
