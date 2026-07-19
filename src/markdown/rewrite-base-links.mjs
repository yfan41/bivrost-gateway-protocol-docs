// Content links/images are written as root-absolute site paths (e.g.
// `/conventions/identifiers/`), per the authoring convention in the README.
// Astro does not rewrite raw markdown hrefs to include a non-root `base`,
// so this hast plugin prefixes them at build time — keeping content free of
// the base path and resilient to it changing later.
export function rewriteBaseLinks(base) {
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;

  return {
    name: 'rewrite-base-links',
    element: {
      filter: ['a', 'img'],
      visit(node, ctx) {
        const attr = node.tagName === 'img' ? 'src' : 'href';
        const value = node.properties?.[attr];
        if (typeof value !== 'string') return;
        // Only root-absolute site paths need the base prefix; leave
        // external URLs, protocol-relative URLs, and same-page anchors
        // untouched.
        if (!value.startsWith('/') || value.startsWith('//')) return;
        if (value === normalizedBase || value.startsWith(`${normalizedBase}/`)) return;

        ctx.setProperty(node, attr, normalizedBase + value);
      },
    },
  };
}
