// Display only roadmaps that exist in the content registry.
function renderHome() {
  current = null;
  selected = null;
  main.innerHTML = `
    <section class="intro">
      <div class="eyebrow">Learn at your own pace</div>
      <h1>Research roadmaps</h1>
      <p class="lede">Explore a topic step by step, from its foundations to research directions. Choose a roadmap to get started.</p>
    </section>
    <section aria-label="Available roadmaps">
      <div class="sectionhead">
        <h2>Available roadmaps</h2>
        <span class="muted">${roadmaps.length} roadmap${roadmaps.length === 1 ? '' : 's'}</span>
      </div>
      <div class="cards">${roadmaps.map(roadmap => {
        const stages = new Set(roadmap.ids.map(id => byId[id].stage)).size;
        return `<a class="card" href="${href(roadmap)}">
          <span class="tag">Learning roadmap</span>
          <h2>${esc(roadmap.title)}</h2>
          <p>${esc(roadmap.description)}</p>
          <div class="meta">${stages} stages · ${roadmap.ids.length} topics</div>
          <p class="card-action">Open roadmap <span aria-hidden="true">→</span></p>
        </a>`;
      }).join('')}</div>
    </section>`;
}
