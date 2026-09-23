// The row's subtitle bottom, in row pixels: a branch seated under the title rides just below it.
function lanes(): void {
  document.querySelectorAll<HTMLElement>('.inner-register--under .inner-row').forEach((row) => {
    const ref = row.querySelector<HTMLElement>('.inner-row__graft') ?? row.querySelector<HTMLElement>('.inner-row__title');
    if (ref) row.style.setProperty('--lane', `${(ref.offsetTop + ref.offsetHeight).toFixed(1)}px`);
  });
}

// No hover on a touch screen: there a branch grows when its row comes into view, and stays.
function watch(): void {
  if (!window.matchMedia('(hover: none)').matches || !window.IntersectionObserver) return;
  const viewer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('is-grown'); });
  }, { threshold: 0.6 });
  document.querySelectorAll('.inner-register:not(.inner-register--still) .inner-row').forEach((row) => viewer.observe(row));
}

export function mountInnerRows(): void {
  lanes();
  watch();
  window.addEventListener('resize', lanes);
  if (document.fonts) document.fonts.ready.then(lanes);
}
