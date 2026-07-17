/**
 * FANUC naming rules (protocol doc §2.6.5/§2.6.1):
 * - On send, fileName is ignored; the program name is the content between the
 *   first and second `\n`. `O3(ROUGH)` names the program O0003; `<SAMPLE>` names it SAMPLE.
 * - Modern-model listings return standard O-names with leading zeros stripped
 *   (program 00010 on the control lists as O10).
 */

/** Derive the program name a FANUC control will use for this content, or null if none can be derived. */
export function fanucProgramName(content: string): string | null {
  const firstNl = content.indexOf('\n');
  if (firstNl === -1) return null;
  const secondNl = content.indexOf('\n', firstNl + 1);
  const raw = (secondNl === -1 ? content.slice(firstNl + 1) : content.slice(firstNl + 1, secondNl)).trim();
  if (!raw) return null;
  const angled = raw.match(/^<(.+)>/);
  if (angled?.[1]) return angled[1].trim();
  const oNum = raw.match(/^[Oo]0*(\d+)/);
  if (oNum?.[1]) return `O${String(Number(oNum[1])).padStart(4, '0')}`;
  const token = raw.split(/[\s(]/)[0];
  return token || null;
}

/**
 * Canonical form for comparing program names across the app, listings, and controls:
 * standard O-names compare by numeric value (O0010 ≡ O10); everything else compares verbatim.
 */
export function canonicalName(name: string): string {
  const m = name.match(/^[Oo]0*(\d+)$/);
  if (m?.[1]) return `O${Number(m[1])}`;
  return name;
}

export function sameName(a: string, b: string): boolean {
  return canonicalName(a) === canonicalName(b);
}
