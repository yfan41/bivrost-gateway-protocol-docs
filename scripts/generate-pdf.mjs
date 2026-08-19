#!/usr/bin/env node
/**
 * Render the whole protocol reference to one PDF per language.
 *
 * Serves the already-built dist/ with `astro preview` (which honours `base`, so
 * DOCS_BASE flows straight through), drives headless Chromium over /print/ and
 * /en/print/, and writes the PDFs into dist/ so they rsync with the site and
 * survive the deploy's --delete.
 *
 * Deliberately NOT wired into `astro build`: a developer who has never run
 * `pnpm exec playwright install chromium` must still be able to build the site.
 *
 *   pnpm build && pnpm pdf
 *   DOCS_BASE=/gateway-protocol pnpm build && DOCS_BASE=/gateway-protocol pnpm pdf
 */
import { spawn } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';
import { pdfFileName } from '../src/pdf-name.mjs';

const root = new URL('..', import.meta.url);
const version = readFileSync(new URL('VERSION', root), 'utf8').trim();
const base = (process.env.DOCS_BASE || '/').replace(/\/+$/, '');
const port = Number(process.env.PDF_PORT || 4321);
const origin = `http://127.0.0.1:${port}`;

const targets = [
  { locale: 'zh-CN', path: `${base}/print/`, title: '彼络物联网关 通讯协议' },
  { locale: 'en', path: `${base}/en/print/`, title: 'Bivrost Gateway Protocol' },
];

if (!existsSync(new URL('dist/index.html', root))) {
  throw new Error('dist/ is missing or empty — run `pnpm build` first.');
}

/** @type {import('playwright').BrowserType} */
let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch (cause) {
  throw new Error('playwright is not installed — run `pnpm install`.', { cause });
}

// --- serve dist/ --------------------------------------------------------------
// Not file://: images and cross-links are root-absolute /img/protocol/... paths
// (rebased to /gateway-protocol/img/... under a base), which would resolve to
// file:///img/ and 404.
const preview = spawn('pnpm', ['exec', 'astro', 'preview', '--port', String(port), '--host', '127.0.0.1'], {
  cwd: new URL('.', root),
  stdio: ['ignore', 'inherit', 'inherit'],
  env: process.env,
});
const stopPreview = () => {
  if (!preview.killed) preview.kill('SIGTERM');
};
process.on('exit', stopPreview);
for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    stopPreview();
    process.exit(1);
  });
}

let ready = false;
for (let i = 0; i < 120 && !ready; i++) {
  try {
    ready = (await fetch(`${origin}${base}/`)).ok;
  } catch {
    /* not up yet */
  }
  if (!ready) await sleep(500);
}
if (!ready) throw new Error(`astro preview never answered at ${origin}${base}/`);

// --- capture ------------------------------------------------------------------
let browser;
try {
  browser = await chromium.launch();
} catch (cause) {
  console.error('\nCould not launch Chromium. Install it once with:\n  pnpm exec playwright install chromium\n');
  throw cause;
}

try {
  for (const { locale, path, title } of targets) {
    const page = await browser.newPage({ colorScheme: 'light' });
    /** @type {string[]} */
    const failures = [];
    page.on('requestfailed', (r) => failures.push(`${r.failure()?.errorText} ${r.url()}`));
    page.on('response', (r) => {
      if (r.status() >= 400) failures.push(`HTTP ${r.status()} ${r.url()}`);
    });

    await page.goto(`${origin}${path}`, { waitUntil: 'load', timeout: 180_000 });

    // The id/link rewrite has run.
    await page.waitForFunction(() => window.__printProtocol?.ready === true, null, { timeout: 60_000 });

    // Fonts loaded and every screenshot decoded. `networkidle` is not enough:
    // a fetched-but-undecoded image still prints blank.
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        Array.from(document.images).map((img) =>
          img.complete
            ? img.decode().catch(() => {})
            : new Promise((resolve) => {
                img.onload = img.onerror = resolve;
              })
        )
      );
    });

    const stats = await page.evaluate(() => window.__printProtocol);
    if (stats.sections !== stats.expected) {
      throw new Error(`[${locale}] rendered ${stats.sections} sections, expected ${stats.expected}`);
    }
    console.log(
      `[${locale}] ${stats.sections} sections · ${stats.ids} ids prefixed · ${stats.rewritten} links rewritten`
    );
    if (stats.unresolved.length) {
      console.warn(`[${locale}] ${stats.unresolved.length} links are not resolvable inside the PDF:`);
      for (const u of stats.unresolved.slice(0, 20)) console.warn(`    ${u.from}: ${u.href}`);
    }
    if (failures.length) {
      console.error(failures.join('\n'));
      throw new Error(`[${locale}] ${failures.length} failed requests while rendering`);
    }

    const out = new URL(`dist/${pdfFileName(locale, version)}`, root);
    // Header/footer render in a separate Chromium document that resolves fonts
    // against the system only, so keep the running head ASCII — a CJK string here
    // is the one place that turns into tofu on a runner without Noto CJK.
    const chrome = 'font-size:8px; width:100%; padding:0 14mm; color:#666;';
    await page.pdf({
      path: out.pathname,
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      margin: { top: '18mm', bottom: '18mm', left: '14mm', right: '14mm' },
      headerTemplate: `<div style="${chrome} text-align:center;">Bivrost Gateway Protocol · v${version}</div>`,
      footerTemplate: `<div style="${chrome} text-align:center;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>`,
      timeout: 300_000,
    });

    const { size } = statSync(out);
    // Sanity floor, not a target: this document is nearly all text, so most of the
    // weight is the subsetted CJK font. A blank or half-rendered capture lands well
    // under this.
    if (size < 200_000) {
      throw new Error(`[${locale}] ${out.pathname} is only ${size} bytes — something rendered blank`);
    }
    console.log(`[${locale}] wrote dist/${pdfFileName(locale, version)} (${(size / 1e6).toFixed(1)} MB) — ${title}`);
    await page.close();
  }
} finally {
  await browser.close();
  stopPreview();
}
