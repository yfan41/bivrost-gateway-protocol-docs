// @ts-check
import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { satteri } from '@astrojs/markdown-satteri';
import starlightLinksValidator from 'starlight-links-validator';

// Single source of truth for the doc version (also drives the CI base path and
// the deploy subdir). See VERSION at the repo root.
const version = readFileSync(new URL('./VERSION', import.meta.url), 'utf8').trim();

// The standalone web deploy sets DOCS_BASE=/gateway-protocol (latest, served in
// place) or /gateway-protocol/v<version> (a frozen snapshot); the on-device gateway
// build sets DOCS_BASE=/app/docs so it can be served from the gateway's
// wwwroot/app/docs (mirrors the Angular UI's baseHref=/app/gateway/). Default '/'
// for local dev.
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
      /**
       * @param {any} node hast element node (satteri does not type its hastPlugins)
       * @param {any} ctx satteri visitor context (exposes setProperty)
       */
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
  site: 'https://docs.bivrost.cn',
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
      title: {
        'zh-CN': '彼络物联网关 通讯协议',
        en: 'Bivrost Gateway Protocol',
      },
      description: '网关 HTTP / MODBUS / MQTT / 数据库通讯协议参考',
      locales: {
        root: { label: '简体中文', lang: 'zh-CN' },
        en: { label: 'English', lang: 'en' },
      },
      logo: {
        src: './src/assets/logo.png',
        alt: 'Bivrost',
      },
      favicon: '/img/favicon.ico',
      social: [
        { icon: 'open-book', label: 'Manual / 说明书', href: 'https://docs.bivrost.cn/gateway/' },
      ],
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 4 },
      customCss: ['./src/styles/custom.css'],
      components: {
        Footer: './src/components/Footer.astro',
      },
      // 构建时校验所有内部链接与锚点（对应 Docusaurus 的 onBrokenLinks: 'throw'）
      plugins: [starlightLinksValidator()],
      sidebar: [
        { label: '简介', translations: { en: 'Introduction' }, link: '/' },
        {
          label: '一、重要说明',
          translations: { en: 'I. Important Notes' },
          items: [
            'conventions/identifiers',
            'conventions/data-classes',
            'conventions/variables',
          ],
        },
        {
          label: '二、HTTP 通讯',
          translations: { en: 'II. HTTP Communication' },
          items: [
            'http',
            'http/auth',
            {
              label: '2.5. 数据读写接口',
              translations: { en: '2.5. Data Read/Write APIs' },
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
              translations: { en: '2.7. Data Analysis APIs' },
              collapsed: true,
              items: ['http/analysis-machine', 'http/analysis-group'],
            },
            'http/history',
            {
              label: '2.9. 网关配置接口',
              translations: { en: '2.9. Gateway Configuration APIs' },
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
              translations: { en: '2.10. Gateway Function APIs' },
              collapsed: true,
              items: ['http/core-functions', 'http/gateway-functions'],
            },
          ],
        },
        'modbus',
        {
          label: '四、MQTT 通讯',
          translations: { en: 'IV. MQTT Communication' },
          collapsed: true,
          items: ['mqtt/upload-format', 'mqtt/rpc'],
        },
        'database',
        'mock-testing',
        'faq',
        { slug: 'changelog', badge: { text: `v${version}`, variant: 'note' } },
        {
          label: '《彼络物联网关 说明书》',
          translations: { en: 'Bivrost Gateway Manual' },
          link: 'https://docs.bivrost.cn/gateway/',
          attrs: { target: '_blank' },
        },
      ],
    }),
  ],
});
