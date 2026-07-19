// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { satteri } from '@astrojs/markdown-satteri';
import starlightLinksValidator from 'starlight-links-validator';

// Default '/' keeps the standalone protocol.bivrost.cn deploy working; the
// gateway build sets DOCS_BASE=/app/docs so the site can be served from the
// gateway's wwwroot/app/docs (mirrors the Angular UI's baseHref=/app/gateway/).
const docsBase = process.env.DOCS_BASE || '/';
// Prefix used to rebase hand-authored root-absolute links (see plugin below):
// '' when serving from root, otherwise the base with any trailing slash removed.
const basePrefix = docsBase === '/' ? '' : docsBase.replace(/\/+$/, '');

// The docs author internal links and images as root-absolute paths
// (e.g. [x](/conventions/data-classes/), ![](/img/protocol/...)). Astro/Starlight
// only rebase their OWN generated URLs (assets, sidebar, relative links) under a
// non-root `base`; hand-authored absolute paths are left untouched and would 404
// once served from /app/docs. This hast plugin prefixes them with the base at
// build time - a no-op for the standalone (base '/') build - so the site works
// under a subfolder and the links validator stays green.
const rebaseAbsoluteLinks = {
  name: 'rebase-absolute-links',
  element: [
    {
      filter: ['a', 'img'],
      visit(node, ctx) {
        if (!basePrefix) return;
        const key = node.tagName === 'img' ? 'src' : 'href';
        const url = node.properties?.[key];
        if (
          typeof url === 'string' &&
          url.startsWith('/') &&
          !url.startsWith('//') && // protocol-relative → external, leave alone
          !url.startsWith(basePrefix + '/') &&
          url !== basePrefix
        ) {
          ctx.setProperty(node, key, basePrefix + url);
        }
      },
    },
  ],
};

export default defineConfig({
  site: 'https://protocol.bivrost.cn',
  base: docsBase,

  markdown: {
    // headingAttributes：支持自定义标题锚点语法 ## 标题 {#anchor}
    processor: satteri({
      features: { headingAttributes: true },
      hastPlugins: [rebaseAbsoluteLinks],
    }),
  },

  integrations: [
    starlight({
      title: '彼络物联网关 通讯协议',
      description: '网关 HTTP / MODBUS / MQTT / 数据库通讯协议参考',
      locales: {
        root: { label: '简体中文', lang: 'zh-CN' },
      },
      logo: {
        src: './src/assets/logo.png',
        alt: 'Bivrost',
      },
      favicon: '/img/favicon.ico',
      social: [
        { icon: 'open-book', label: '说明书', href: 'https://docs.bivrost.cn/' },
      ],
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 4 },
      customCss: ['./src/styles/custom.css'],
      components: {
        Footer: './src/components/Footer.astro',
      },
      // 构建时校验所有内部链接与锚点（对应 Docusaurus 的 onBrokenLinks: 'throw'）
      plugins: [starlightLinksValidator()],
      sidebar: [
        { label: '简介', link: '/' },
        {
          label: '一、重要说明',
          items: [
            'conventions/identifiers',
            'conventions/data-classes',
            'conventions/variables',
          ],
        },
        {
          label: '二、HTTP 通讯',
          items: [
            'http',
            'http/auth',
            {
              label: '2.5. 数据读写接口',
              collapsed: true,
              items: [
                'http/direct-read',
                'http/direct-offset-plc',
                'http/direct-toollife',
                'http/cached-read',
              ],
            },
            'http/file-management',
            {
              label: '2.7. 数据分析接口',
              collapsed: true,
              items: ['http/analysis-machine', 'http/analysis-group'],
            },
            'http/history',
            {
              label: '2.9. 网关配置接口',
              collapsed: true,
              items: [
                'http/config-global',
                'http/config-users',
                'http/config-machines',
                'http/config-groups',
                'http/config-tasks',
                'http/config-communication',
              ],
            },
            {
              label: '2.10. 网关功能接口',
              collapsed: true,
              items: ['http/core-functions', 'http/gateway-functions'],
            },
          ],
        },
        'modbus',
        {
          label: '四、MQTT 通讯',
          collapsed: true,
          items: ['mqtt/upload-format', 'mqtt/rpc'],
        },
        'database',
        'mock-testing',
        'faq',
        { slug: 'changelog', badge: { text: 'v1.19.7', variant: 'note' } },
        {
          label: '《彼络物联网关 说明书》',
          link: 'https://docs.bivrost.cn/',
          attrs: { target: '_blank' },
        },
      ],
    }),
  ],
});
