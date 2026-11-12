// All interactions affect the current view only. No browser storage is used.
main.addEventListener('click', event => {
  const node = event.target.closest('[data-node]');
  const viewButton = event.target.closest('[data-view]');
  if (node) location.hash = href(current, node.dataset.node);
  if (viewButton) {
    view = viewButton.dataset.view;
    renderRoadmap();
  }
});
window.addEventListener('hashchange', () => {
  route();
  if (location.hash.startsWith('#/roadmaps/kernel-methods/') && window.matchMedia('(max-width: 900px)').matches) {
    document.getElementById('selected-lesson')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});
route();
