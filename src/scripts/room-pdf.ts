import type { PDFDocumentLoadingTask, PDFDocumentProxy } from 'pdfjs-dist';

const VIEWER_MAX_WIDTH = 880;

type PdfJs = typeof import('pdfjs-dist');

let pdfjs: Promise<PdfJs> | undefined;

// Loaded on demand so the page's text paints before the PDF engine arrives.
function loadPdfJs(): Promise<PdfJs> {
  pdfjs ??= Promise.all([import('pdfjs-dist'), import('pdfjs-dist/build/pdf.worker.min.mjs?url')]).then(
    ([lib, worker]) => {
      lib.GlobalWorkerOptions.workerSrc = worker.default;
      return lib;
    },
  );
  return pdfjs;
}

async function drawPage(doc: PDFDocumentProxy, number: number, canvas: HTMLCanvasElement, cssWidth: number): Promise<void> {
  const page = await doc.getPage(number);
  const base = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: (cssWidth * window.devicePixelRatio) / base.width });
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  await page.render({ canvas, viewport }).promise;
}

async function drawThumbnails(): Promise<void> {
  const canvases = [...document.querySelectorAll<HTMLCanvasElement>('canvas[data-room-thumb]')];
  if (canvases.length === 0) {
    return;
  }
  const lib = await loadPdfJs();
  await Promise.all(
    canvases.map(async (canvas) => {
      const doc = await lib.getDocument({ url: canvas.dataset.roomThumb ?? '' }).promise;
      await drawPage(doc, 1, canvas, canvas.clientWidth);
      canvas.closest('.room-sheet__page')?.classList.add('is-drawn');
    }),
  );
}

function mountViewer(viewer: HTMLDialogElement): void {
  const title = viewer.querySelector<HTMLElement>('.room-viewer__title');
  const download = viewer.querySelector<HTMLAnchorElement>('.room-viewer__download');
  const pages = viewer.querySelector<HTMLElement>('.room-viewer__pages');
  let current: PDFDocumentLoadingTask | undefined;
  let opened = 0;

  document.addEventListener('click', async (event) => {
    const trigger = (event.target as Element | null)?.closest<HTMLAnchorElement>('[data-room-view]');
    if (!trigger || !title || !download || !pages) {
      return;
    }
    event.preventDefault();
    const run = ++opened;
    title.textContent = trigger.dataset.roomTitle ?? '';
    download.href = trigger.dataset.roomView ?? '';
    download.download = trigger.dataset.roomFile ?? '';
    pages.replaceChildren();
    viewer.showModal();
    viewer.scrollTop = 0;

    const lib = await loadPdfJs();
    const task = lib.getDocument({ url: trigger.dataset.roomView ?? '' });
    const doc = await task.promise;
    if (run !== opened) {
      void task.destroy();
      return;
    }
    current = task;
    const width = Math.min(VIEWER_MAX_WIDTH, pages.clientWidth);
    for (let number = 1; number <= doc.numPages && run === opened; number++) {
      const canvas = document.createElement('canvas');
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', `Page ${number}`);
      pages.append(canvas);
      await drawPage(doc, number, canvas, width);
    }
  });

  viewer.querySelector('.room-viewer__close')?.addEventListener('click', () => viewer.close());
  viewer.addEventListener('close', () => {
    opened++;
    void current?.destroy();
    current = undefined;
  });
}

export function mountRoomPdf(): void {
  const viewer = document.querySelector<HTMLDialogElement>('.room-viewer');
  if (viewer) {
    mountViewer(viewer);
  }
  void drawThumbnails();
}
