import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getCollection, type CollectionEntry } from 'astro:content';

// Same single source of truth as astro.config.mjs. Resolved from the project
// root (build cwd) rather than import.meta.url — this module gets bundled into
// dist/.prerender/ at build time, where a file-relative path would not exist.
export const version = readFileSync(resolve(process.cwd(), 'VERSION'), 'utf8').trim();

const siteOrigin = 'https://docs.bivrost.cn';
// Mirrors the basePrefix derivation in astro.config.mjs so llms.txt URLs match
// the deployed base path (/gateway-protocol, /gateway-protocol/v<version>, …).
const docsBase = process.env.DOCS_BASE || '/';
const basePrefix = docsBase === '/' ? '' : docsBase.replace(/\/+$/, '');

/** Absolute site URL for a root-absolute path ('/http/auth/' → full URL). */
export function absUrl(path: string): string {
  return siteOrigin + basePrefix + path;
}

// Reading order for llms output, mirroring the sidebar in astro.config.mjs.
// Entries not listed here are appended alphabetically (never dropped), so a
// forgotten sync only affects ordering. Keep in sync when the sidebar changes.
const PAGE_ORDER = [
  '',
  'conventions/identifiers',
  'conventions/data-classes',
  'conventions/variables',
  'http',
  'http/auth',
  'http/direct-read',
  'http/direct-offset-plc',
  'http/direct-toollife',
  'http/cached-read',
  'http/file-management',
  'http/analysis-machine',
  'http/analysis-group',
  'http/history',
  'http/config-global',
  'http/config-users',
  'http/config-machines',
  'http/config-groups',
  'http/config-tasks',
  'http/config-communication',
  'http/core-functions',
  'http/gateway-functions',
  'modbus',
  'mqtt/upload-format',
  'mqtt/rpc',
  'database',
  'mock-testing',
  'faq',
  'changelog',
];

export type Locale = 'zh' | 'en';

export interface LlmsDoc {
  /** Locale-relative slug ('' for the landing page, 'http/auth', …). */
  slug: string;
  title: string;
  body: string;
  /** Root-absolute site path with trailing slash ('/http/auth/', '/en/http/auth/'). */
  path: string;
}

/** 'index' → '', 'en/index' → 'en' (docsLoader keeps literal file-derived ids). */
function normalizeId(id: string): string {
  return id.replace(/(^|\/)index$/, '$1').replace(/\/$/, '');
}

/**
 * The landing pages are MDX (card grid / steps components); reduce their JSX
 * scaffolding to the plain markdown it renders as, so the llms text output
 * stays prose-only. Applied to .mdx bodies only — .md bodies can legitimately
 * contain `import`/JSX-looking lines inside code samples.
 */
function stripMdxScaffolding(mdx: string): string {
  return (
    mdx
      // Top-level import/export statements (single-line only, which is all we author).
      .replace(/^(import|export)\s.*\n?/gm, '')
      // <LinkCard title=… href=… description=… /> → a markdown list item. href is
      // either {`${base}/…`} (internal, rebased at render) or a plain "https://…".
      .replace(
        /^[ \t]*<LinkCard\s+title="([^"]*)"\s+href=(?:\{`\$\{base\}([^`]*)`\}|"([^"]*)")\s+description="([^"]*)"\s*\/>/gm,
        (_m, title: string, path: string | undefined, url: string | undefined, desc: string) =>
          `- [${title}](${path || url}): ${desc}`,
      )
      // Layout-only wrappers with no text of their own.
      .replace(/^[ \t]*<\/?(CardGrid|Steps)>\n?/gm, '')
      // <Aside type=… title=…>…</Aside> → the ::: aside syntax used in .md pages.
      .replace(
        /^[ \t]*<Aside type="([a-z]+)" title="([^"]*)">\n([\s\S]*?)^[ \t]*<\/Aside>/gm,
        (_m, type: string, title: string, content: string) =>
          `:::${type}[${title}]\n${content.replace(/^ {2}/gm, '')}:::`,
      )
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
}

export async function getDocs(locale: Locale): Promise<LlmsDoc[]> {
  const entries = await getCollection('docs', (entry: CollectionEntry<'docs'>) => {
    const isEnglish = entry.id === 'en' || entry.id === 'en/index' || entry.id.startsWith('en/');
    return locale === 'en' ? isEnglish : !isEnglish;
  });

  const docs = entries.map((entry) => {
    const normalized = normalizeId(entry.id);
    const slug = locale === 'en' ? normalized.replace(/^en\/?/, '') : normalized;
    const rawBody = (entry.body ?? '').trim();
    return {
      slug,
      title: entry.data.title,
      body: entry.filePath?.endsWith('.mdx') ? stripMdxScaffolding(rawBody) : rawBody,
      path: locale === 'en' ? (slug === '' ? '/en/' : `/en/${slug}/`) : slug === '' ? '/' : `/${slug}/`,
    };
  });

  const orderOf = (slug: string) => {
    const i = PAGE_ORDER.indexOf(slug);
    return i === -1 ? PAGE_ORDER.length : i;
  };
  docs.sort((a, b) => orderOf(a.slug) - orderOf(b.slug) || a.slug.localeCompare(b.slug));
  return docs;
}

/**
 * Rewrites the docs' hand-authored root-absolute links/images to absolute site
 * URLs — the text-output twin of the rebaseAbsoluteLinks hast plugin in
 * astro.config.mjs (protocol-relative '//' left alone, same rule).
 */
export function absolutizeBody(markdown: string): string {
  return markdown.replace(/\]\((\/(?!\/)[^)\s]*)\)/g, (_match, path: string) => `](${absUrl(path)})`);
}

const FULL_HEADER: Record<Locale, (v: string) => string> = {
  zh: (v) =>
    [
      '# 彼络物联网关 通讯协议（完整文档）',
      '',
      `> 彼络物联网关 HTTP / MODBUS / MQTT / 数据库通讯协议参考，版本 v${v}。`,
      `> 本文件由文档站自动生成，供 AI 助手/LLM 整体读取。逐页索引见 ${absUrl('/llms.txt')}。`,
    ].join('\n'),
  en: (v) =>
    [
      '# Bivrost Gateway Communication Protocol (full documentation)',
      '',
      `> HTTP / MODBUS / MQTT / database protocol reference for the Bivrost IIoT gateway, v${v}.`,
      `> This file is generated by the docs site for AI assistants/LLMs. Per-page index: ${absUrl('/llms.txt')}.`,
    ].join('\n'),
};

/** Renders llms-full.txt for one locale: header, then every page with title + URL. */
export async function renderFull(locale: Locale): Promise<string> {
  const docs = await getDocs(locale);
  const sections = docs.map((doc) =>
    [`# ${doc.title}`, '', `URL: ${absUrl(doc.path)}`, '', absolutizeBody(doc.body)].join('\n'),
  );
  return [FULL_HEADER[locale](version), '', sections.join('\n\n---\n\n'), ''].join('\n');
}

export function textResponse(body: string): Response {
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
