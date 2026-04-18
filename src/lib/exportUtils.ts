import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

// A4 landscape dimensions
const PAGE_W = 297;
const PAGE_H = 210;
const MARGIN = 8;
const CONTENT_W = PAGE_W - MARGIN * 2;
const CONTENT_H = PAGE_H - MARGIN * 2;
const RENDER_WIDTH = 1200;
const SCALE = 2;

/** Hide data-no-export elements, return restore function */
function hideNoExport(root: HTMLElement): () => void {
  const hidden: HTMLElement[] = [];
  root.querySelectorAll('[data-no-export]').forEach(node => {
    const h = node as HTMLElement;
    if (h.style.display !== 'none') {
      hidden.push(h);
      h.style.display = 'none';
    }
  });
  return () => hidden.forEach(h => { h.style.display = ''; });
}

/** Capture an element to canvas */
async function capture(el: HTMLElement, bgColor = '#FFFFFF'): Promise<HTMLCanvasElement> {
  return html2canvas(el, {
    scale: SCALE,
    useCORS: true,
    backgroundColor: bgColor,
    logging: false,
    windowWidth: RENDER_WIDTH,
  });
}

/** Crop a horizontal strip from a canvas */
function cropCanvas(src: HTMLCanvasElement, srcY: number, srcH: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = src.width;
  c.height = Math.max(1, Math.round(srcH));
  const ctx = c.getContext('2d');
  if (ctx) {
    ctx.drawImage(src, 0, Math.round(srcY), src.width, Math.round(srcH), 0, 0, c.width, c.height);
  }
  return c;
}

/** Export the element as a PNG file download */
export async function exportPNG(el: HTMLElement, filename = 'ARIA-财务模型') {
  const restore = hideNoExport(el);
  const canvas = await capture(el, '#0B0F1A');
  restore();
  const link = document.createElement('a');
  link.download = `${filename}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/** Export as multi-page PDF — one module per page, table header repeats on overflow */
export async function exportPDF(el: HTMLElement, filename = 'ARIA-财务模型') {
  const restore = hideNoExport(el);

  // Find all exportable modules marked with data-export-module
  const modules = Array.from(el.querySelectorAll('[data-export-module]')) as HTMLElement[];
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  let firstPage = true;

  for (const mod of modules) {
    const canvas = await capture(mod, '#FFFFFF');
    const imgH = (canvas.height * CONTENT_W) / canvas.width;

    if (imgH <= CONTENT_H) {
      // Module fits on one page
      if (!firstPage) pdf.addPage();
      firstPage = false;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', MARGIN, MARGIN, CONTENT_W, imgH);
    } else {
      // Module spans multiple pages — check for table header to repeat
      let headerImg: string | null = null;
      let headerDrawH = 0;

      const thead = mod.querySelector('table thead') as HTMLElement | null;
      if (thead) {
        const modRect = mod.getBoundingClientRect();
        const theadRect = thead.getBoundingClientRect();
        const topFrac = (theadRect.top - modRect.top) / modRect.height;
        const hFrac = theadRect.height / modRect.height;
        const headerCrop = cropCanvas(canvas, topFrac * canvas.height, hFrac * canvas.height);
        headerImg = headerCrop.toDataURL('image/png');
        headerDrawH = (headerCrop.height * CONTENT_W) / canvas.width;
      }

      let yOffset = 0; // mm already placed
      let pageNum = 0;

      while (yOffset < imgH) {
        if (!firstPage) pdf.addPage();
        firstPage = false;

        let drawY = MARGIN;
        let sliceH = CONTENT_H;

        // Continuation pages: repeat table header
        if (pageNum > 0 && headerImg && headerDrawH > 0) {
          pdf.addImage(headerImg, 'PNG', MARGIN, drawY, CONTENT_W, headerDrawH);
          drawY += headerDrawH;
          sliceH -= headerDrawH;
        }

        const srcY = (yOffset / imgH) * canvas.height;
        const srcH = Math.min((sliceH / imgH) * canvas.height, canvas.height - srcY);
        const drawH = (srcH / canvas.height) * imgH;

        pdf.addImage(
          cropCanvas(canvas, srcY, srcH).toDataURL('image/png'),
          'PNG', MARGIN, drawY, CONTENT_W, drawH,
        );

        yOffset += sliceH;
        pageNum++;
      }
    }
  }

  restore();
  pdf.save(`${filename}.pdf`);
}
