#!/usr/bin/env node
// Guards the literal version strings that cannot be derived at build time.
//
// The doc version's single source of truth is VERSION at the repo root. Almost
// everything reads it (sidebar changelog badge, footer, PDF cover and filename,
// deploy path, llms.txt), but a few places are prose in Markdown/MDX and have to
// spell the number out. Those are listed below and checked here, because this is
// exactly where the version has drifted before: the footer, both index pages and
// the README once said v1.19.7.18 while VERSION said 1.19.7.
//
// Note the gateway FIRMWARE versions (v1.19.7.16 … v1.19.7.22) are a separate
// numbering line and legitimately appear in the changelog, so changelog.md is
// deliberately not covered here.
import { readFileSync } from 'node:fs';

const version = readFileSync(new URL('../VERSION', import.meta.url), 'utf8').trim();

// Each target: the file, and a regex whose first capture group is the version
// string as written in that file.
const targets = [
  { file: 'README.md', re: /内容对应通讯协议 \*\*v([\d.]+)\*\*/ },
  { file: 'src/content/docs/index.mdx', re: /通讯协议参考，版本 v([\d.]+)，/ },
  { file: 'src/content/docs/en/index.mdx', re: /protocol reference for the Bivrost gateway, version v([\d.]+),/ },
];

let failed = false;

for (const { file, re } of targets) {
  const url = new URL(`../${file}`, import.meta.url);
  const lines = readFileSync(url, 'utf8').split('\n');
  const idx = lines.findIndex((l) => re.test(l));

  if (idx === -1) {
    console.error(`✗ ${file}: 找不到版本号（正则 ${re} 无匹配）——文案改动后请同步更新 scripts/check-version.mjs`);
    failed = true;
    continue;
  }

  const found = lines[idx].match(re)[1];
  if (found !== version) {
    console.error(`✗ ${file}:${idx + 1}: 写着 v${found}，VERSION 是 ${version}`);
    failed = true;
  }
}

if (failed) {
  console.error(`\n文档版本真值是根目录 VERSION（现为 ${version}）。请改上述文件，或先确认 VERSION 是否该升版。`);
  console.error('注意：v1.19.7.16～.22 一类是网关固件版本，只应出现在 changelog 里，不要写进首页或 README。');
  process.exit(1);
}

console.log(`✓ 版本号一致：v${version}（${targets.length} 处字面量）`);
