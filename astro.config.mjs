// @ts-check
import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { satteri } from '@astrojs/markdown-satteri';
import starlightLinksValidator from 'starlight-links-validator';
// Chapter order lives in one place so the PDF export and llms.txt cannot drift
// from the nav.
import { getSidebar } from './src/sidebar.mjs';

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

  // Dev only: forward the Ask AI panel's requests to a locally running proxy
  // (server/ai-proxy, port 8787). Ignored by `astro build`; in production the
  // reverse proxy on docs.bivrost.cn routes /api/assistant/ to the service.
  vite: {
    server: {
      proxy: {
        '/api/assistant': 'http://localhost:8787',
      },
    },
  },

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
        // Starlight renders SocialIcons in BOTH the desktop header right-group and
        // the mobile menu drawer (MobileMenuFooter.astro), so this one override puts
        // the PDF download link in every header placement without forking
        // Header.astro. It renders the default icons (the Manual cross-link) first.
        SocialIcons: './src/components/SocialIcons.astro',
      },
      // 构建时校验所有内部链接与锚点（对应 Docusaurus 的 onBrokenLinks: 'throw'）
      plugins: [starlightLinksValidator()],
      sidebar: getSidebar(version),
    }),
  ],
});
