import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { chromium } from 'playwright';
import { PDFDocument, PDFName, PDFString } from 'pdf-lib';
import { readFileSync, mkdtempSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { validateImage, neutralImage, sha256, neutralizeDocument, assertNeutral, validateNeutralPdf, writeNeutralPdf, retargetPageReferences } from './neutral.mjs';
import { pdfFileName, neutralPdfFileName } from '../src/pdf-name.mjs';

const bytes = await sharp({ create: { width: 40, height: 30, channels: 3, background: '#123456' } }).png().toBuffer();
const record = { sha256: sha256(bytes), width: 40, height: 30, reviewed: '2026-09-08', regions: [] };
test('reviewed clean image preserves its bytes', async () => assert.deepEqual(await neutralImage(bytes, record, '/img/manual/test.png'), bytes));
test('unregistered image fails', async () => assert.rejects(validateImage(bytes, undefined, 'new.png'), /新增截图/));
test('same-size content change fails', async () => {
  const changed = await sharp({ create: { width: 40, height: 30, channels: 3, background: '#654321' } }).png().toBuffer();
  await assert.rejects(validateImage(changed, record, 'changed.png'), /原图哈希变化/);
});
test('dimension change fails even with an updated hash', async () => {
  const changed = await sharp(bytes).resize(50, 30).png().toBuffer();
  await assert.rejects(validateImage(changed, { ...record, sha256: sha256(changed) }, 'resized.png'), /原图尺寸变化/);
});
test('missing review fails', async () => assert.rejects(validateImage(bytes, { ...record, reviewed: '' }, 'unreviewed.png'), /审查记录/));
test('out-of-bounds and negative rectangles fail', async () => {
  for (const x of [-1, 39]) await assert.rejects(validateImage(bytes, { ...record, regions: [{ x, y: 0, width: 4, height: 4, text: '', background: '#ffffff', reason: 'test' }] }, 'bad.png'), /区域越界/);
});
test('pixel replacement changes only its rectangle', async () => {
  const changed = await neutralImage(bytes, { ...record, regions: [{ x: 5, y: 6, width: 10, height: 8, background: '#ffffff', text: '', reason: 'test' }] }, 'redact.png');
  const pixels = await sharp(changed).removeAlpha().raw().toBuffer();
  for (let y = 0; y < 30; y++) for (let x = 0; x < 40; x++) assert.deepEqual([...pixels.subarray((y * 40 + x) * 3, (y * 40 + x) * 3 + 3)], x >= 5 && x < 15 && y >= 6 && y < 14 ? [255, 255, 255] : [18, 52, 86]);
});
test('every registered screenshot is current and valid', async () => {
  const manifest = JSON.parse(readFileSync(new URL('./neutral-images.json', import.meta.url)));
  for (const [path, rec] of Object.entries(manifest.images)) await validateImage(readFileSync(new URL('../public' + path, import.meta.url)), rec, path);
});
test('filenames separate neutral output and preserve branded names', () => {
  assert.match(pdfFileName('en', '1.2'), /^bivrost-gateway-(manual|protocol)-en-v1\.2\.pdf$/);
  assert.equal(neutralPdfFileName('1.2'), 'gateway-protocol-zh-CN-v1.2.pdf');
  assert.doesNotMatch(neutralPdfFileName('1.2'), /中性|neutral/iu);
});
test('residual brand is rejected including spaced PDF extraction', () => {
  for (const text of ['中 性', 'N E U T R A L', '彼 络', 'B I V R O S T', 'https://tb.bivrost.cn', '188 2467 2282']) assert.throws(() => assertNeutral(text, 'test'));
  assert.doesNotThrow(() => assertNeutral('http://BIV-152KUCG.local /api/core/license-info company String', 'technical'));
});
test('DOM transformation removes agreement and chrome, preserves technical meaning and links', async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto('about:blank');
    await page.setContent(`<div class="copyright">彼络 18824672282</div><main><div class="sl-markdown-content"><div class="print-manual">
      <section class="print-cover"><div class="print-cover-mark">Logo</div><h1 class="print-cover-title">彼络物联网关</h1><p class="print-cover-meta">V1</p><div class="print-cover-qr">扫码添加微信客服</div></section>
      <nav class="print-toc"><li><a href="#sec-license">产品使用协议</a></li><li><a href="#sec-usage-login">登录</a></li></nav>
      <section data-slug="license" class="print-section" id="sec-license">深圳市彼络科技有限公司</section>
      <section data-slug="usage/login" data-prefix="usage-login--" class="print-section" id="sec-usage-login"><h1 id="usage-login--login-by-name">登录</h1><p>彼络物联网关：联系彼络公司</p><code>http://BIV-152KUCG.local</code><a href="#sec-license">协议</a></section>
      <section data-slug="reference/mcp" class="print-section"><div class="expressive-code"><pre><code><div class="ec-line"><div class="code">claude mcp add --transport http <span>bivrost-gateway</span> http://192.168.100.1/mcp</div></div></code></pre><div class="copy"><button data-code="bivrost-gateway">Copy</button></div></div></section>
      <section data-slug="http/core-functions" class="print-section"><pre><code>{"license":{"company":"Bivrost","product":"IoT Gateway"}}</code></pre><table><tbody><tr><td>company</td><td>String</td><td>授权该许可的公司名称。中性化版本不返回。</td></tr><tr><td>product</td><td>String</td><td>产品名称</td></tr></tbody></table></section>
      <section class="print-section"><a href="https://docs.bivrost.cn/gateway/usage/login/#login-by-name">本册引用</a><a href="https://docs.bivrost.cn/gateway-protocol/">通讯协议</a><a href="https://example.com/technical">第三方资料</a></section>
    </div></div></main>`);
    await page.evaluate(() => { window.__printManual = { sections: 5, expected: 5 }; });
    await page.evaluate(neutralizeDocument, { kind: 'manual', version: '1.2' });
    const text = await page.locator('body').textContent();
    assertNeutral(text, 'fixture');
    assert.equal(await page.locator('.expressive-code .copy').count(), 0);
    assert.equal(await page.locator('[data-slug="reference/mcp"] .ec-line .code').count(), 1);
    assert.match(text, /联系产品供应商/);
    assert.match(text, /BIV-152KUCG\.local/);
    assert.match(text, /http gateway http:\/\/192.168.100.1\/mcp/);
    assert.equal(await page.locator('[data-slug="license"]').count(), 0);
    assert.equal(await page.getByText('本册引用').getAttribute('href'), '#usage-login--login-by-name');
    assert.equal(await page.locator('a[href*="bivrost"]').count(), 0);
    assert.equal(await page.locator('a[href="https://example.com/technical"]').count(), 1);
    const json = JSON.parse(await page.locator('[data-slug="http/core-functions"] code').textContent());
    assert.deepEqual(json, { license: { product: 'IoT Gateway' } });
    assert.equal(await page.locator('[data-slug="http/core-functions"] tr').count(), 1);
    assert.equal(await page.locator('[data-slug="http/core-functions"] tr').textContent(), 'productString产品名称');
    assert.deepEqual(await page.evaluate(() => window.__printManual), { sections: 4, expected: 4 });
  } finally { await browser.close(); }
});
test('final PDF audit catches hidden brand URI annotations', async () => {
  const doc = await PDFDocument.create();
  const page = doc.addPage();
  page.drawText('Technical manual', { x: 20, y: 750, size: 12 });
  for (let i = 0; i < 20; i++) page.drawText('Protocol '.repeat(15), { x: 20, y: 720 - i * 20, size: 6 });
  page.node.set(PDFName.of('Annots'), doc.context.obj([{ Type: 'Annot', Subtype: 'Link', Rect: [0, 0, 10, 10], A: { S: 'URI', URI: PDFString.of('https://docs.bivrost.cn') } }]));
  const pdf = await doc.save();
  assert.throws(() => validateNeutralPdf(pdf, doc, 'Technical manual'), /残留禁用标识/);
});
test('atomic publication writes matching PDF and audit hash', () => {
  const dir = mkdtempSync(join(tmpdir(), 'neutral-test-'));
  try {
    const out = pathToFileURL(join(dir, 'manual.pdf'));
    writeNeutralPdf(out, bytes, { pages: 1 });
    assert.deepEqual(readFileSync(out), bytes);
    assert.equal(JSON.parse(readFileSync(new URL(out.href + '.audit.json'))).pdfSha256, sha256(bytes));
    assert.equal(existsSync(new URL(out.href + `.${process.pid}.tmp`)), false);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('cover replacement keeps bookmark and tagged page references valid', async () => {
  const doc = await PDFDocument.create();
  const old = doc.addPage();
  const destination = doc.context.obj([old.ref, 'XYZ', 0, 0, 0]);
  const item = doc.context.obj({ Dest: destination, Pg: old.ref });
  doc.context.register(item);
  doc.removePage(0);
  const replacement = doc.addPage();
  retargetPageReferences(doc, old.ref, replacement.ref);
  assert.equal(destination.get(0).toString(), replacement.ref.toString());
  assert.equal(item.get(PDFName.of('Pg')).toString(), replacement.ref.toString());
});
