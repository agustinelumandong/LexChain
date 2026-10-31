export async function createWatermarkedSignedPdf(sourceUrl: string) {
  const response = await fetch(sourceUrl, { cache: 'no-store' });
  if (!response.ok) throw new Error('Could not download the signed PDF.');

  const { degrees, PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
  const pdf = await PDFDocument.load(await response.arrayBuffer());
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  const label = 'LEXCHAIN COPY';

  for (const page of pdf.getPages()) {
    const { width, height } = page.getSize();
    const size = Math.min(width, height) * 0.07;
    const radians = -35 * Math.PI / 180;
    const textWidth = font.widthOfTextAtSize(label, size);
    const centerX = textWidth / 2 * Math.cos(radians) - size / 2 * Math.sin(radians);
    const centerY = textWidth / 2 * Math.sin(radians) + size / 2 * Math.cos(radians);

    page.drawText(label, {
      x: width / 2 - centerX,
      y: height / 2 - centerY,
      size,
      font,
      color: rgb(0.05, 0.27, 0.48),
      opacity: 0.2,
      rotate: degrees(-35),
    });
  }

  const bytes = await pdf.save();
  const output = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(output).set(bytes);
  return output;
}
