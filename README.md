# 彼络物联网关 通讯协议（文档站）

基于 [Astro Starlight](https://starlight.astro.build/) 的《彼络物联网关 通讯协议》在线文档，内容对应通讯协议 **v1.19.7**（完整转录：HTTP ~150 个接口、MODBUS 地址表、MQTT 报文格式与 RPC、数据库通讯、MCP 服务、常见问题与全部版本变更历史）。

配套的《说明书》文档站位于 `../bivrost-gateway-docs`（线上 https://gateway.docs.bivrost.cn ）；本站中所有《说明书》引用均为指向该站的绝对链接。

站点已支持中英双语（Starlight i18n，默认简体中文，`/en/` 下为英文版），语言切换器位于站点右上角导航栏。英文内容位于 `src/content/docs/en/`，与根目录（简体中文）的文件结构一一对应。

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

## 导出 PDF

整本通讯协议可导出为 PDF（中英文各一份），供离线阅读与打印。站点右上角的 **下载 PDF** 按钮即指向该文件。

```bash
pnpm exec playwright install chromium   # 仅首次：下载与 playwright 版本匹配的 Chromium
pnpm build && pnpm pdf                  # 生成 dist/bivrost-gateway-protocol-{zh-CN,en}-v<版本>.pdf
```

- PDF 由 `/print/`（中文）与 `/en/print/`（英文）两个路由渲染。这两个页面把侧边栏顺序中的全部 29 章合并为一篇长文档，前面加封面与目录；用浏览器打开并 Ctrl-P 预览，是调整 `src/styles/print-protocol.css` 最快的方式
- 章节顺序的唯一来源是 `src/sidebar.mjs`，侧边栏、PDF 与 llms.txt 共用，三者不会脱节。章节标题取自各页 frontmatter 的 `title`；侧边栏节点若显式写了 `label`（目前只有首页「简介」），则以侧边栏为准
- 分组若没有自己的页面（「一、重要说明」），其标题会作为小标题印在该组第一章之上，并使该组各章在目录中缩进一级；分组名与首章标题相同时（「二、HTTP 通讯」即 `http/index.md` 的标题、「2.5. 数据读写接口」即 `http/direct-read.md` 的标题）自动省略，该章即代表该组本身
- 版式按说明书惯例设置：正文宋体、标题黑体、表格加框、提示框改为线框、页眉页脚含书名与页码，封面不含日期且不带页眉页脚（生成器把封面单独渲染一次再换入第 1 页，以保留 Chromium 生成的书签树）
- 合并后各页锚点会重名，页面上的内联脚本会给每章的 `id` 加上 `<章节>--` 前缀，并把站内链接改写为文档内锚点，因此 PDF 里的交叉引用可直接跳转
- `pnpm pdf` 不挂在 `pnpm build` 上：没装浏览器也能正常构建站点。`pnpm install` 同样不会下载浏览器（见 `pnpm-workspace.yaml` 的 `allowBuilds`）
- CI 在第一次构建后生成一次 PDF，同一份文件同时发布到 `/gateway-protocol/` 与 `/gateway-protocol/v<版本>/`；runner 上需要 `fonts-noto-cjk`，否则中文会渲染成方框
- 不生成 PDF 的构建请设 `PUBLIC_PDF_DOWNLOAD=off`，否则顶栏会给出指向不存在文件的下载链接

## 目录结构

- `src/content/docs/conventions/` — 一、重要说明（标识、25 个数据类、变量枚举）
- `src/content/docs/http/` — 二、HTTP 通讯（鉴权、数据读写、文件管理、数据分析、历史数据、网关配置、网关功能）
- `src/content/docs/modbus.md` / `mqtt/` / `database.md` — 三～五、MODBUS / MQTT / 数据库通讯
- `src/content/docs/mcp.md` — 六、MCP 服务（网关/云端 MCP 服务端、鉴权、33 个只读工具）
- `src/content/docs/mock-testing.md` / `faq.md` / `changelog.md` — 七～八、模拟机台、常见问题、版本变更历史
- `public/img/protocol/` — 截图（取自当前版本网关 Web 管理页面）
- `astro.config.mjs` — 站点配置（对应原 Docusaurus 的 `docusaurus.config.ts`）
- `src/sidebar.mjs` — 章节顺序：侧边栏、PDF 与 llms.txt 共用（对应原 `sidebars.ts`）
- `src/styles/print-protocol.css` — 整本 PDF 的分页、代码块与表格样式
- `src/components/SocialIcons.astro` — 顶栏「下载 PDF」按钮（Starlight 在顶栏与移动端菜单都会渲染此组件）
- `src/pages/print.astro`、`src/pages/en/print.astro` — 整本合并的打印页
- `scripts/generate-pdf.mjs` — 用 headless Chromium 把打印页导出为 PDF
- `src/lib/llms.ts` + `src/pages/**/llms*.txt.ts` — llms.txt 生成（见下文「AI 支持」）
- `src/components/AskAI.astro` — 「问 AI」侧边栏面板（见下文「AI 支持」）
- `specs/` — 产品/功能规格
- `server/ai-proxy/` — AI 助手后端代理参考实现（独立包，不属于站点 workspace）

## AI 支持

### llms.txt（供 AI 代理读取文档）

构建时自动生成三个纯文本文件（llmstxt.org 约定），随 `dist/` 一起部署，无需改动 CI：

- `/llms.txt` — 中英双语逐页索引（绝对 URL）
- `/llms-full.txt` — 简体中文完整文档（单文件）
- `/en/llms-full.txt` — 英文完整文档（单文件）

页面顺序取自 `src/sidebar.mjs`（与侧边栏、PDF 同源，无需人工同步；侧边栏未列出的新页面会按字母序追加，不会丢失）。URL 前缀跟随 `DOCS_BASE`；面向公网的部署产物中为 `https://docs.bivrost.cn/gateway-protocol/...`。

### 「问 AI」面板

每个页面右下角的「问 AI / Ask AI」按钮打开侧边栏问答面板，前端为零依赖的 `src/components/AskAI.astro`（经 `Footer.astro` 挂载）。面板调用同源代理接口（默认 `POST /api/assistant/chat`，SSE 流式返回），接口契约与后端参考实现见 `server/ai-proxy/`（需单独部署，静态站点本身不含任何密钥）。代理不可用时面板显示本地化的「暂时不可用」提示，不影响站点其他功能。

- 构建期环境变量 `PUBLIC_AI_ASSISTANT_ENDPOINT` 可改写接口地址；设为 `off` 则完全移除面板。
- 本地联调：先启动 `server/ai-proxy`（见其 README），再 `pnpm dev` —— Vite 已将 `/api/assistant` 代理到 `:8787`。

## 编写约定

- 正文全部为 `.md` 文件，**不要**使用 `.mdx`（首页 `index.mdx` 例外，用到卡片与步骤组件）；`<type>`/`<field>` 等尖括号记号必须放在行内代码中
- 页面标题写在 frontmatter `title` 中（Starlight 自动渲染 H1），侧边栏名称写在 frontmatter `sidebar.label` 中；正文从 `##` 二级标题开始
- 标题自定义锚点使用 `## 标题 {#anchor}` 语法（由 satteri 的 `headingAttributes` 支持），锚点 = 接口名小写（如 `{#readalarm}`）
- 提示块使用带方括号标题的语法 `:::note[注] … :::`（与 Starlight Aside 语法一致）
- 站内链接使用站点绝对路径并带尾部斜杠（如 `/conventions/identifiers/#machineid`），不要用相对 `.md` 文件路径
- 构建时 `starlight-links-validator` 对断链/断锚全部报错，修改后请 `pnpm build` 验证
- 更新版本号时改根目录 `VERSION` 即可，它驱动侧边栏 changelog 徽标、页脚、PDF 封面「文档版本」与文件名、部署路径与 llms.txt；另需手工同步两处正文字面量——`README.md` 首段与 `src/content/docs/{,en/}index.mdx` 首句，`pnpm build` 前置的 `check-version` 会校验三者与 `VERSION` 一致
- **文档版本与网关固件版本是两条线，不要混写。** 文档版本即 `VERSION`；`v1.19.7.16`～`v1.19.7.22` 一类是固件版本，只应出现在 `changelog.md` 正文，不得写进首页、页脚或本 README
- 原 PDF 中经与网关 Web 前端源码比对确认的接口地址勘误已修正（`users`、`update-settings`、`update-security`、`update-database-settings`、`update-remote-access`）

## 中文中性 PDF（按需生成）

品牌版继续使用 `pnpm pdf`。中性版仅处理中文，通过同一份正文和打印页派生，不改网站页面、英文版和下载按钮，也不自动发布到网站。

```bash
# 首次需安装 Chromium 和 Poppler（最终 PDF 文本验收使用 pdftotext）
pnpm exec playwright install chromium
# macOS：brew install poppler；Debian/Ubuntu：apt-get install poppler-utils
pnpm build && pnpm pdf:neutral
pnpm test:neutral
```

使用 Node.js 22.12 或更高版本。配置了 `DOCS_BASE` 时，构建与导出必须传入相同的值；`PDF_PORT` 可指定临时本机预览端口。运行中性命令时会检查 Poppler 是否可用，缺失即终止。

产物位于 `output/pdf/`，与部署用的 `dist/` 分开；同名 `.pdf.audit.json` 记录版本、页数、图片原始及处理后 SHA-256、最终 PDF SHA-256 和生成时间。正式文件通过全部自动检查后才替换；失败退出不会把旧文件报告为本次成功产物。仅交付 PDF，不向客户附带内部审查报告。

中性模式去除封面、页眉、正文及图片中的彼络品牌和联系方式；说明书排除整章《产品使用协议》。跨册品牌站点链接保留书名与章节文字，本册引用保留内部跳转。示例中的自定义 MCP 名称改为 `gateway`／`hub`，许可示例与返回参数表均省略 `company` 字段；真实接口、字段定义、设备 IP 和旧设备登录所需的 `BIV-` 前缀保留。上述转换集中在 `scripts/neutral.mjs`，交付件中若出现“中性”、`neutral` 或未知品牌残留会阻止导出，禁止用全局删词来绕过检查。

### 截图更新与复核

`scripts/neutral-images.json` 是人工维护的审查清单，**不是自动生成后即可批准的文件**。每张实际引用的中文截图都必须登记，包括无需清除的截图：

- `sha256`：原始文件的 SHA-256；`width`／`height`：原始像素尺寸；`reviewed`：人工复核日期。
- `regions`：经复核的像素区域，含 `x`／`y`／`width`／`height`、背景色 `background`、替换文字 `text`、处理原因 `reason`；空数组表示已确认无需处理。
- 有文字替换时，使用 `fontSize`／`fontFamily`／`color` 描述样式。坐标均以原图像素为准，空文字表示清除。

更新流程：先检查完整原图，定位所有品牌、域名、联系方式和 Logo；记录清除区域，使用 `neutralImage` 生成临时副本，与原图逐区域比对并对完整图片做 OCR 辅助检查；确认参数、按钮及操作说明未受损后，才更新哈希、尺寸与 `reviewed`。可用 `shasum -a 256 public/img/...png` 读取哈希。不得只更新哈希使检查通过，不得自动接受旧区域。

导出逐张核对清单和源图，同时比对 `dist/` 实际提供的图片，防止使用旧构建。新增图片、同尺寸内容变化、尺寸变化、缺少审查记录、区域越界或旧构建都会报错，必须人工复核或重新构建后再运行。品牌清除直接修改副本像素，PDF 不嵌入原始品牌图片或可移除的遮盖层。

自动检查涵盖正文、替代文本、链接、PDF 书签／注释／元数据及失效页面目标；发布前仍需渲染 PDF 检查封面、目录、表格、代码分行和所有处理过的截图。图片 OCR 只作复核辅助，不代替人工审查，也不会自动更新清单。

本册交付文件名：`gateway-protocol-zh-CN-v<版本>.pdf`。
