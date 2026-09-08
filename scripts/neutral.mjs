/** Local-only PDF export policy. Kept in each independently buildable docs repo. */
import { createHash } from 'node:crypto';
import { readFileSync, mkdirSync, writeFileSync, renameSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import sharp from 'sharp';
import { PDFArray, PDFDict, PDFString, PDFHexString, PDFRef } from 'pdf-lib';

export const forbidden = /中\s*性|n\s*e\s*u\s*t\s*r\s*a\s*l|彼\s*络|b\s*i\s*v\s*r\s*o\s*s\s*t|188[\s-]*2467[\s-]*2282|扫码添加微信客服|封面的二维码/iu;
export const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

export function requirePdfTextTool() {
  const check = spawnSync('pdftotext', ['-v'], { encoding: 'utf8' });
  if (check.error || check.status !== 0) throw new Error('中性 PDF 验收需要 Poppler 的 pdftotext：macOS 用 brew install poppler；Linux 安装 poppler-utils。');
}

export async function validateImage(bytes, record, path) {
  if (!record) throw new Error(`新增截图，需人工复核并登记：${path}`);
  const { width, height } = await sharp(bytes).metadata();
  const issues = [];
  if (sha256(bytes) !== record.sha256) issues.push('原图哈希变化');
  if (width !== record.width || height !== record.height) issues.push('原图尺寸变化');
  if (!record.reviewed || !Array.isArray(record.regions)) issues.push('缺少审查记录');
  for (const r of record.regions ?? []) {
    if (![r.x, r.y, r.width, r.height].every(Number.isInteger) || r.x < 0 || r.y < 0 || r.width <= 0 || r.height <= 0 || r.x + r.width > width || r.y + r.height > height) issues.push('处理区域越界或无效');
    if (!/^#[0-9a-f]{6}$/i.test(r.background ?? '') || !r.reason || typeof r.text !== 'string') issues.push('区域缺少背景、替换文字或说明');
  }
  if (issues.length) throw new Error(`${path}：${issues.join('；')}，需人工复核`);
}

const escapeXml = (s) => s.replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export async function neutralImage(bytes, record, path) {
  await validateImage(bytes, record, path);
  if (!record.regions.length) return bytes;
  const overlays = record.regions.map((r) => ({
    left: r.x, top: r.y,
    input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${r.width}" height="${r.height}"><rect width="100%" height="100%" fill="${r.background}"/><text x="0" y="${r.fontSize ?? 14}" font-family="${r.fontFamily ?? 'monospace'}" font-size="${r.fontSize ?? 14}" fill="${r.color ?? '#20242b'}">${escapeXml(r.text)}</text></svg>`),
  }));
  // The output contains replaced pixels, never a removable PDF overlay.
  return sharp(bytes).composite(overlays).png().toBuffer();
}

/** Runs only in the Chromium page, after existing chapter/link rewriting. */
export function neutralizeDocument({ kind, version }) {
  const doc = document.querySelector('.print-manual, .print-doc');
  if (!doc) throw new Error('打印正文不存在');
  const title = `物联网关 ${kind === 'manual' ? '说明书' : '通讯协议'}`;
  // Keep ancestor layout/CSS but remove ALL site chrome, including hidden footer
  // text which can otherwise leak into the PDF accessibility structure.
  let branch = doc;
  while (branch !== document.body) {
    for (const sibling of [...branch.parentElement.children]) if (sibling !== branch && !['STYLE', 'LINK'].includes(sibling.tagName)) sibling.remove();
    branch = branch.parentElement;
  }
  document.querySelectorAll('script, meta[name="description"], link[rel="canonical"]').forEach((el) => el.remove());
  document.title = `${title} v${version}`;
  const printStyle = document.createElement('style');
  printStyle.textContent = '@media print { .print-manual, .print-doc, .sl-markdown-content, .sl-container, main, .content-panel, .main-pane, .main-frame { margin-bottom: 0 !important; padding-bottom: 0 !important; } .print-section:last-child > :last-child { margin-bottom: 0 !important; } }';
  document.head.append(printStyle);
  doc.querySelectorAll('.print-cover-mark, .print-cover-sub, .print-cover-org, .print-cover-org-en, .print-cover-qr, .print-cover-imprint hr').forEach((el) => el.remove());
  doc.querySelector('.print-cover-title').textContent = '物联网关';
  doc.querySelector('.print-cover-meta').textContent = `文档版本 V${version}`;
  // Keep the title block vertically centred after removing the top logo.
  const spacer = document.createElement('div');
  spacer.style.height = '24mm';
  spacer.setAttribute('aria-hidden', 'true');
  doc.querySelector('.print-cover').prepend(spacer);
  if (kind === 'manual') {
    const license = doc.querySelector('[data-slug="license"]');
    if (!license) throw new Error('未找到应排除的产品使用协议，需复核打印结构');
    doc.querySelectorAll('.print-toc a[href="#sec-license"]').forEach((a) => a.closest('li').remove());
    license.remove();
    window.__printManual.sections--;
    window.__printManual.expected--;
  }
  doc.querySelectorAll('.expressive-code .copy').forEach((el) => el.remove());
  // Prose substitutions are explicit phrases, never a global brand deletion.
  const prose = [
    ['请通过封面的二维码联系客服，描述遇到的问题，客服会安排相应技术人员对接。', '请联系产品供应商，描述遇到的问题，由供应商安排技术人员对接。'],
    ['彼络已搭建了一个标准云平台服务器 tb.bivrost.cn，可以联系客服试用（详见《云平台说明》）。', '云平台服务器地址由部署方提供（详见《云平台说明》）。'],
    ['联系彼络公司', '联系产品供应商'], ['联系彼络', '联系产品供应商'],
    ['彼络物联网关', '物联网关'], ['彼络云平台', '云平台'],
  ];
  const replaceProse = (s) => prose.reduce((text, [from, to]) => text.split(from).join(to), s);
  // Highlighting splits strings into tokens: operate on whole known examples,
  // retaining every API path, key and operational value other than these aliases.
  for (const code of doc.querySelectorAll('pre code')) {
    const section = code.closest('[data-slug]')?.dataset.slug;
    const lines = [...code.querySelectorAll('.ec-line')];
    const before = lines.length ? lines.map((line) => line.textContent).join('\n') : code.textContent;
    let after = before;
    if (section === 'mcp' || section === 'reference/mcp') after = after.replace(/\bbivrost-(gateway|hub)\b/g, '$1');
    if (section === 'http/core-functions' && /"company"\s*:\s*"Bivrost"/.test(after)) {
      const example = JSON.parse(after);
      if (example.license?.company !== 'Bivrost') throw new Error('许可示例结构变化，需复核');
      delete example.license.company;
      after = JSON.stringify(example, null, 2);
    }
    if (after !== before) {
      if (lines.length) {
        code.replaceChildren(...after.split('\n').map((text) => {
          const line = document.createElement('div');
          line.className = 'ec-line';
          const content = document.createElement('div');
          content.className = 'code';
          content.textContent = text || ' ';
          line.append(content);
          return line;
        }));
      } else code.textContent = after;
    }
  }
  const coreFunctions = doc.querySelector('[data-slug="http/core-functions"]');
  if (coreFunctions) {
    const companyRows = [...coreFunctions.querySelectorAll('tr')].filter((row) => row.querySelector('td')?.textContent.trim() === 'company');
    if (companyRows.length !== 1) throw new Error(`company 返回参数行数量异常：${companyRows.length}，需复核`);
    companyRows[0].remove();
  }
  const walker = document.createTreeWalker(doc, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!node.parentElement.closest('pre, code, script, style')) node.textContent = replaceProse(node.textContent);
  }
  for (const el of doc.querySelectorAll('[alt], [title], [aria-label]')) {
    for (const attr of ['alt', 'title', 'aria-label']) if (el.hasAttribute(attr)) el.setAttribute(attr, replaceProse(el.getAttribute(attr)));
  }
  for (const a of doc.querySelectorAll('a[href]')) {
    const href = a.getAttribute('href');
    if (href.startsWith('#')) {
      if (!document.getElementById(decodeURIComponent(href.slice(1)))) {
        // References to the excluded agreement become plain text; other missing
        // targets indicate a document bug, not something to silently unlink.
        if (href.startsWith('#sec-license') || href.startsWith('#license--')) a.replaceWith(...a.childNodes);
        else throw new Error(`文档内引用目标不存在：${href}`);
      }
      continue;
    }
    const url = new URL(href, location.href);
    if (url.hostname === 'bivrost.cn' || url.hostname.endsWith('.bivrost.cn')) {
      // Convert canonical links into the current book where possible.
      const prefix = kind === 'manual' ? '/gateway/' : '/gateway-protocol/';
      let target;
      if (url.pathname.startsWith(prefix)) {
        const slug = url.pathname.slice(prefix.length).replace(/^v[^/]+\//, '').replace(/\/$/, '') || 'index';
        const section = [...doc.querySelectorAll('[data-slug]')].find((s) => s.dataset.slug === slug);
        if (section) target = url.hash ? section.dataset.prefix + decodeURIComponent(url.hash.slice(1)) : section.id;
      }
      if (target && document.getElementById(target)) a.setAttribute('href', '#' + encodeURIComponent(target));
      else a.replaceWith(...a.childNodes);
    }
  }
  return { title, sections: doc.querySelectorAll('.print-section').length };
}

export async function prepareNeutralPage(page, root, kind, version) {
  await page.evaluate(neutralizeDocument, { kind, version });
  const manifest = JSON.parse(readFileSync(new URL('scripts/neutral-images.json', root), 'utf8'));
  if (manifest.schemaVersion !== 1) throw new Error('截图清单版本不受支持');
  const images = await page.locator('.print-section img').evaluateAll((imgs) => imgs.map((img) => ({ src: img.currentSrc || img.src })));
  const replacements = {};
  const issues = [];
  const report = [];
  for (const { src } of images) {
    if (replacements[src]) continue;
    const url = new URL(src);
    const index = url.pathname.indexOf('/img/');
    if (url.origin !== new URL(page.url()).origin || index < 0) { issues.push(`未知图片来源，需复核：${src}`); continue; }
    const path = decodeURIComponent(url.pathname.slice(index));
    if (path.includes('..') || !/^\/img\/(manual|protocol)\//.test(path)) { issues.push(`不支持的图片路径：${path}`); continue; }
    try {
      const bytes = readFileSync(new URL('public' + path, root));
      await validateImage(bytes, manifest.images[path], path);
      // Also verify the served build: a stale dist must not reuse a newer manifest.
      const response = await page.request.get(src);
      if (!response.ok() || sha256(await response.body()) !== sha256(bytes)) throw new Error('dist 图片与源图不一致，请重新构建');
      const result = await neutralImage(bytes, manifest.images[path], path);
      replacements[src] = `data:image/png;base64,${result.toString('base64')}`;
      report.push({ path, sha256: sha256(bytes), outputSha256: sha256(result), regions: manifest.images[path].regions.length });
    } catch (e) { issues.push(`${path}：${e.message}`); }
  }
  if (issues.length) throw new Error('中性截图检查失败：\n' + issues.join('\n'));
  await page.evaluate(async (replacements) => {
    for (const img of document.querySelectorAll('.print-section img')) {
      const replacement = replacements[img.currentSrc || img.src];
      if (!replacement) throw new Error('缺少中性截图');
      img.closest('picture')?.querySelectorAll('source').forEach((el) => el.remove());
      img.removeAttribute('srcset');
      img.src = replacement;
      await img.decode();
    }
  }, replacements);
  const audit = await page.evaluate(() => {
    const doc = document.querySelector('.print-manual, .print-doc');
    const attrs = [...doc.querySelectorAll('*')].flatMap((el) => [...el.attributes].filter((a) => a.name !== 'src').map((a) => a.value));
    return [document.title, doc.textContent, ...attrs].join('\n');
  });
  assertNeutral(audit, '打印正文／链接／替代文本');
  console.log(`[neutral] ${report.length} 张截图校验通过；${report.filter((r) => r.regions).length} 张完成像素处理`);
  return { kind, version, images: report };
}

export function assertNeutral(text, label) {
  const match = text.match(forbidden);
  if (match) throw new Error(`${label}残留禁用标识、品牌或联系方式：${text.slice(Math.max(0, match.index - 100), match.index + 150)}，需补充明确的中性化规则`);
}


/** Retarget cover destinations and accessibility page references after replacement. */
export function retargetPageReferences(doc, oldRef, newRef) {
  const seen = new Set();
  const visit = (obj) => {
    if (seen.has(obj)) return;
    seen.add(obj);
    if (obj instanceof PDFDict) {
      for (const [key, value] of obj.entries()) {
        if (value instanceof PDFRef && value.toString() === oldRef.toString()) obj.set(key, newRef);
        else visit(value);
      }
    } else if (obj instanceof PDFArray) {
      for (let i = 0; i < obj.size(); i++) {
        const value = obj.get(i);
        if (value instanceof PDFRef && value.toString() === oldRef.toString()) obj.set(i, newRef);
        else visit(value);
      }
    } else if (obj?.dict instanceof PDFDict) visit(obj.dict);
  };
  for (const [, obj] of doc.context.enumerateIndirectObjects()) visit(obj);
}

export function validateNeutralPdf(bytes, doc, title) {
  // Inspect actual final bytes, not only the source DOM. Poppler decodes subset
  // fonts and compressed streams which a raw byte search cannot audit.
  const extracted = spawnSync('pdftotext', ['-enc', 'UTF-8', '-', '-'], { input: bytes, maxBuffer: 32 * 1024 * 1024 });
  if (extracted.error || extracted.status !== 0) throw new Error('PDF 文本提取失败：' + (extracted.error?.message ?? extracted.stderr));
  const text = extracted.stdout.toString('utf8');
  if (text.replace(/\s/g, '').length < 1000 || !text.replace(/\s/g, '').includes(title.replace(/\s/g, ''))) throw new Error('中性 PDF 正文为空或标题不符');
  assertNeutral(text, 'PDF 正文');
  const pageRefs = new Set(doc.getPages().map((page) => page.ref.toString()));
  const seen = new Set();
  const visit = (obj) => {
    if (seen.has(obj)) return;
    seen.add(obj);
    if (obj instanceof PDFString || obj instanceof PDFHexString) assertNeutral(obj.decodeText(), 'PDF 书签／注释／元数据');
    else if (obj instanceof PDFDict) for (const [key, value] of obj.entries()) {
      if (['/Dest', '/D'].includes(key.toString()) && value instanceof PDFArray && value.get(0) instanceof PDFRef && !pageRefs.has(value.get(0).toString())) throw new Error('PDF 书签／链接指向已移除的页面');
      visit(value);
    }
    else if (obj instanceof PDFArray) for (const value of obj.asArray()) visit(value);
    else if (obj?.dict instanceof PDFDict) visit(obj.dict);
  };
  for (const [, obj] of doc.context.enumerateIndirectObjects()) visit(obj);
  return { pages: doc.getPageCount(), textCharacters: text.length };
}

export function writeNeutralPdf(out, bytes, report) {
  mkdirSync(new URL('.', out), { recursive: true });
  const temp = new URL(out.href + `.${process.pid}.tmp`);
  try {
    writeFileSync(temp, bytes);
    renameSync(temp, out);
    writeFileSync(new URL(out.href + '.audit.json'), JSON.stringify({ ...report, pdfSha256: sha256(bytes), generatedAt: new Date().toISOString() }, null, 2) + '\n');
  } finally { rmSync(temp, { force: true }); }
}
