// @ts-check
/**
 * The exported reference's filename, shared by the header download link
 * (src/components/SocialIcons.astro) and the generator (scripts/generate-pdf.mjs)
 * so the two can never disagree.
 *
 * ASCII only: a CJK filename would need percent-encoding all the way through
 * rsync, nginx and Content-Disposition. The header link's `download` attribute
 * is where a localised name would go if one is ever wanted.
 *
 * @param {'zh-CN' | 'en'} locale
 * @param {string} version
 */
export function pdfFileName(locale, version) {
  return `bivrost-gateway-protocol-${locale}-v${version}.pdf`;
}
