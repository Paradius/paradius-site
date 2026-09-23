// No hover on a touch screen: there a branch grows when its row comes into view, and stays.
export function mountInnerRows(): void {
  if (!window.matchMedia('(hover: none)').matches || !window.IntersectionObserver) return;
  const viewer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('is-grown'); });
  }, { threshold: 0.6 });
  document.querySelectorAll('.inner-row').forEach((row) => viewer.observe(row));
}
