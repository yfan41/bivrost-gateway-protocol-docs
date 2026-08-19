// @ts-check
/**
 * Single source of truth for the protocol reference's chapter order.
 *
 * Imported by astro.config.mjs (for the Starlight sidebar), by
 * src/components/PrintProtocol.astro (for the PDF's section order) and by
 * src/lib/llms.ts (for the llms.txt reading order), so none of the three can
 * drift from the others.
 *
 * NOTE: no filesystem access in this module. It is bundled into the SSR build for
 * the print routes, where `import.meta.url` points into a temp dist chunk and fs
 * paths would break — the same trap src/lib/llms.ts documents. The version is
 * therefore passed in rather than read from VERSION here.
 */

/**
 * @typedef {{ 'zh-CN': string, en?: string }} LocalizedLabel
 * @typedef {{ label: LocalizedLabel, first: boolean }} SidebarGroup
 * @typedef {{ slug: string, label?: LocalizedLabel, groups: SidebarGroup[] }} PrintChapter
 */

/**
 * @param {string} version doc version, for the changelog badge
 * @returns {import('@astrojs/starlight/types').StarlightUserConfig['sidebar']}
 */
export function getSidebar(version) {
  return [
  { label: '简介', translations: { en: 'Introduction' }, link: '/' },
  {
    label: '一、重要说明',
    translations: { en: '1. Important Notes' },
    items: [
      'conventions/identifiers',
      'conventions/data-classes',
      'conventions/variables',
    ],
  },
  {
    label: '二、HTTP 通讯',
    translations: { en: '2. HTTP Communication' },
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
    translations: { en: '4. MQTT Communication' },
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
  ];
}

/** @param {any} node @returns {LocalizedLabel} */
const localized = (node) => ({ 'zh-CN': node.label, en: node.translations?.en });

/**
 * Doc slug for an internal sidebar `link` ('/' → 'index', '/faq/' → 'faq').
 * Returns null for anything that leaves the site.
 *
 * @param {string} link
 * @returns {string | null}
 */
function slugFromLink(link) {
  if (!link.startsWith('/') || link.startsWith('//')) return null;
  const path = link.replace(/^\/+|\/+$/g, '');
  return path === '' ? 'index' : path;
}

/**
 * The reading order, depth-first — every page the sidebar links to, once.
 *
 * Two things beyond the bare slug come out of the sidebar, both needed to give the
 * merged PDF the same structure a reader sees on the site:
 *
 * - `label` — the sidebar names a chapter explicitly. Normally the page's own
 *   frontmatter `title` is the chapter heading (sidebar labels are abbreviated nav
 *   text: 'Overview' where the title is '二、HTTP 通讯'), but where the sidebar does
 *   name a node, that name wins. Today that is only the landing page, whose title is
 *   the whole document's title ('彼络物联网关 通讯协议') and whose sidebar label is the
 *   chapter it actually is ('简介').
 * - `groups` — the chain of sidebar groups enclosing the page, innermost last, each
 *   flagged with whether this page opens that group. PrintProtocol.astro turns the
 *   chain into the printed contents' indentation and into part headings: a group
 *   named after its own opening page ('二、HTTP 通讯' is the title of http/index.md,
 *   '2.5. 数据读写接口' the title of http/direct-read.md) contributes neither, while
 *   '一、重要说明', which has no page of its own, contributes both — without it the
 *   PDF would jump from 简介 straight to 1.1. 标识说明 with the 一、 heading missing.
 *
 * External links (the cross-link to 《彼络物联网关 说明书》) are skipped.
 *
 * @param {ReturnType<typeof getSidebar>} items
 * @returns {PrintChapter[]}
 */
export function flattenSidebar(items) {
  /** @type {PrintChapter[]} */
  const out = [];

  /**
   * `groups` is the chain of sidebar groups enclosing the current node, each
   * carrying whether this branch is still that group's FIRST child. A node is the
   * first child of an outer group only if it is at index 0 at every level below it,
   * which is what narrowing the whole chain by `i === 0` expresses.
   *
   * @param {any[]} nodes
   * @param {SidebarGroup[]} groups
   */
  const walk = (nodes, groups) => {
    nodes.forEach((node, i) => {
      const chain = groups.map((g) => ({ ...g, first: g.first && i === 0 }));

      if (typeof node === 'string') {
        out.push({ slug: node, groups: chain });
        return;
      }
      if (Array.isArray(node.items)) {
        walk(node.items, [...chain, { label: localized(node), first: true }]);
        return;
      }
      const slug =
        typeof node.slug === 'string'
          ? node.slug
          : typeof node.link === 'string'
            ? slugFromLink(node.link)
            : null;
      if (!slug) return; // external link — not part of this document
      out.push({ slug, label: node.label ? localized(node) : undefined, groups: chain });
    });
  };

  walk(items ?? [], []);
  return out;
}

/**
 * @param {LocalizedLabel | undefined} label
 * @param {boolean} isEnglish
 * @returns {string | undefined}
 */
export function pickLabel(label, isEnglish) {
  if (!label) return undefined;
  return (isEnglish && label.en) || label['zh-CN'];
}

/**
 * Canonical collection key for an entry id, collapsing index files onto their
 * directory: 'index' → '', 'en/index' → 'en', 'http/index' → 'http'.
 *
 * Astro's loaders have gone both ways on whether a trailing `/index` survives in
 * the id, so normalise both sides rather than depending on one of them.
 *
 * @param {string} id
 */
export function canonicalId(id) {
  return id.replace(/(^|\/)index$/, '$1').replace(/\/+$/, '');
}

/**
 * Sidebar slug → canonical collection key for a locale.
 * ('faq', 'en') → 'en/faq';  ('index', 'en') → 'en';  ('index', undefined) → ''.
 *
 * @param {string} slug
 * @param {'en' | undefined} locale
 */
export function entryKeyFor(slug, locale) {
  const path = slug === 'index' ? '' : slug;
  if (!locale) return path;
  return path === '' ? locale : `${locale}/${path}`;
}

/**
 * Sidebar slug → the site path key the browser derives from a URL
 * (/gateway-protocol/en/http/auth/ → 'en/http/auth'; each tree's root
 * normalises to 'index' / 'en').
 *
 * @param {string} slug
 * @param {'en' | undefined} locale
 */
export function pathKeyFor(slug, locale) {
  if (!locale) return slug;
  return slug === 'index' ? locale : `${locale}/${slug}`;
}
