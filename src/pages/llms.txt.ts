import type { APIRoute } from 'astro';
import { absUrl, getDocs, textResponse, version } from '../lib/llms';

// llmstxt.org-style index of the whole docs site, prerendered into dist/llms.txt.
export const GET: APIRoute = async () => {
  const zh = await getDocs('zh');
  const en = await getDocs('en');

  const lines = [
    '# 彼络物联网关 通讯协议 / Bivrost Gateway Communication Protocol',
    '',
    `> HTTP / MODBUS / MQTT / database protocol reference for the Bivrost IIoT gateway, v${version}.`,
    '> Simplified Chinese is the canonical documentation; English under /en/ is a 1:1 translation.',
    '',
    '## Docs (简体中文)',
    '',
    ...zh.map((doc) => `- [${doc.title}](${absUrl(doc.path)})`),
    '',
    '## Docs (English)',
    '',
    ...en.map((doc) => `- [${doc.title}](${absUrl(doc.path)})`),
    '',
    '## Full content',
    '',
    `- [完整文档（简体中文）](${absUrl('/llms-full.txt')})`,
    `- [Full documentation (English)](${absUrl('/en/llms-full.txt')})`,
  ];

  return textResponse(lines.join('\n') + '\n');
};
