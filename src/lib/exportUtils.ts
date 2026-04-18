import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

/** Capture a DOM element to a canvas, hiding elements with data-no-export */
async function captureElement(el: HTMLElement): Promise<HTMLCanvasElement> {
  // Temporarily hide elements that shouldn't be exported
  const hidden: HTMLElement[] = [];
  el.querySelectorAll('[data-no-export]').forEach(node => {
    const h = node as HTMLElement;
    if (h.style.display !== 'none') {
      hidden.push(h);
      h.style.display = 'none';
    }
  });

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#0B0F1A',
    logging: false,
    windowWidth: 1200,
  });

  // Restore hidden elements
  hidden.forEach(h => { h.style.display = ''; });

  return canvas;
}

/** Export the element as a PNG file download */
export async function exportPNG(el: HTMLElement, filename = 'ARIA-财务模型') {
  const canvas = await captureElement(el);
  const link = document.createElement('a');
  link.download = `${filename}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/** Export the element as a multi-page PDF (A4 landscape) */
export async function exportPDF(el: HTMLElement, filename = 'ARIA-财务模型') {
  const canvas = await captureElement(el);
  const imgData = canvas.toDataURL('image/png');

  // A4 landscape: 297mm x 210mm
  const pageW = 297;
  const pageH = 210;
  const margin = 8;
  const contentW = pageW - margin * 2;
  const contentH = pageH - margin * 2;

  const imgW = contentW;
  const imgH = (canvas.height * imgW) / canvas.width;

  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  let yOffset = 0;
  let page = 0;

  while (yOffset < imgH) {
    if (page > 0) pdf.addPage();

    // Calculate source crop for this page
    const srcY = (yOffset / imgH) * canvas.height;
    const srcH = Math.min((contentH / imgH) * canvas.height, canvas.height - srcY);
    const drawH = (srcH / canvas.height) * imgH;

    // Create a cropped canvas for this page segment
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvas.width;
    pageCanvas.height = srcH;
    const ctx = pageCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);
    }

    const pageImg = pageCanvas.toDataURL('image/png');
    pdf.addImage(pageImg, 'PNG', margin, margin, contentW, drawH);

    yOffset += contentH;
    page++;
  }

  pdf.save(`${filename}.pdf`);
}
