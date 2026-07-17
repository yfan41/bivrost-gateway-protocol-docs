/**
 * Control-aware content normalization used by push verification and drift scans.
 * Controls rewrite line endings and pad/strip whitespace; those differences are
 * not drift. Byte-identical comparison applies to binary content only.
 */

export function normalizeText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[\t ]+$/g, ''))
    .join('\n')
    .replace(/\n+$/g, '');
}

export function looksBinary(buf: Buffer): boolean {
  const sample = buf.subarray(0, 8192);
  let suspicious = 0;
  for (const byte of sample) {
    if (byte === 0) return true;
    if (byte < 7 || (byte > 14 && byte < 32 && byte !== 27)) suspicious++;
  }
  return sample.length > 0 && suspicious / sample.length > 0.1;
}

/** Compare two file bodies the way a control round-trip should be judged. */
export function contentsMatch(a: Buffer, b: Buffer): boolean {
  if (looksBinary(a) || looksBinary(b)) return a.equals(b);
  return normalizeText(a.toString('utf8')) === normalizeText(b.toString('utf8'));
}
