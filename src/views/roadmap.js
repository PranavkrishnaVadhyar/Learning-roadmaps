function renderRoadmap() {
  main.innerHTML = `<a class="breadcrumb" href="#/">← All roadmaps</a>
    <div class="roadhead"><div><div class="eyebrow">Interactive knowledge atlas</div>
      <h1>${esc(current.title)}</h1><p class="muted">${esc(current.description)}</p></div>
      <div class="map-stats"><strong>${current.ids.length}</strong> topics <span> / </span><strong>${groups.length}</strong> stages</div>
    </div>
    <div class="explorer-toolbar">
      <div class="view-switch"><button data-view="graph" aria-pressed="${view === 'graph'}">◈ Flow graph</button><button data-view="list" aria-pressed="${view === 'list'}">☷ Topic list</button></div>
      <input id="topic-search" type="search" aria-label="Search topics" placeholder="Search topics, e.g. RKHS…" value="${esc(query)}">
    </div>
    <div class="workspace ${view === 'graph' ? 'graphlayout' : ''}">
      <section class="explorer ${graphFullscreen ? 'graph-fullscreen' : ''}" aria-label="Topic explorer">
        ${view === 'graph' ? `<div class="canvas-toolbar">
          <div><button id="focus-node">Focus topic</button><button id="expand">Expand</button><button id="all">Full map</button></div>
          <div><button id="zoom-out" aria-label="Zoom out">−</button><span id="zoom-label">${Math.round(zoom * 100)}%</span><button id="zoom-in" aria-label="Zoom in">+</button><button id="fit">Fit</button><button id="center">Locate topic</button><button id="fullscreen">${graphFullscreen ? 'Exit fullscreen' : 'Fullscreen'}</button></div>
          <label><input id="concept-links" type="checkbox" ${conceptLinks ? 'checked' : ''}> Concept links</label>
        </div>` : ''}
        <section id="map" class="${view === 'list' ? 'outline' : ''}" aria-label="Roadmap topics">${view === 'graph' ? graph() : outline()}</section>
        <div class="explorer-tip">${view === 'graph' ? 'Follow solid arrows from background concepts to more advanced ideas. Use Focus topic for a closer look.' : 'Expand a stage, then choose a topic to open its notes.'}</div>
      </section>
      <aside class="reading-panel" aria-label="Selected topic notes">
        <div class="panel-label">TOPIC NOTES <button id="route-toggle" aria-pressed="${showRoute}">Show prerequisites</button></div>
        ${showRoute ? `<section class="route"><strong>Path to ${esc(byId[selected].title)}</strong><ol>${ancestry(selected).map(id => `<li>${link(id)}</li>`).join('')}</ol></section>` : ''}
        ${lesson()}${lessonNavigation()}
      </aside>
    </div>`;
  bindRoadmap();
  if (view === 'graph' && !expanded) centerSelection();
}

function bindRoadmap() {
  document.getElementById('topic-search').oninput = event => { query = event.target.value; updateMap(); };
  document.getElementById('route-toggle').onclick = () => { showRoute = !showRoute; renderRoadmap(); };
  if (view !== 'graph') return;
  document.getElementById('concept-links').onchange = event => { conceptLinks = event.target.checked; updateMap(); };
  const resize = value => { zoom = Math.max(0.2, Math.min(1.6, value)); updateMap(); centerSelection(); };
  document.getElementById('zoom-in').onclick = () => resize(zoom + 0.15);
  document.getElementById('zoom-out').onclick = () => resize(zoom - 0.15);
  document.getElementById('fit').onclick = () => {
    const canvas = document.querySelector('.graphbox');
    if (canvas) resize(Math.min((canvas.clientWidth - 20) / graphSize.width, (canvas.clientHeight - 20) / graphSize.height));
  };
  document.getElementById('center').onclick = centerSelection;
  document.getElementById('focus-node').onclick = () => { query = ''; document.getElementById('topic-search').value = ''; expanded = new Set(ancestry(selected)); zoom = 0.85; updateMap(); };
  document.getElementById('expand').onclick = () => { if (!expanded) expanded = new Set([selected]); [...expanded].forEach(id => neighbors(id).forEach(other => expanded.add(other))); updateMap(); centerSelection(); };
  document.getElementById('all').onclick = () => { expanded = null; query = ''; document.getElementById('topic-search').value = ''; updateMap(); centerSelection(); };
  document.getElementById('fullscreen').onclick = () => { graphFullscreen = !graphFullscreen; renderRoadmap(); };
  bindCanvas();
}

function updateMap() {
  document.getElementById('map').innerHTML = view === 'list' ? outline() : graph();
  if (view === 'graph') {
    document.getElementById('zoom-label').textContent = Math.round(zoom * 100) + '%';
    bindCanvas();
  }
}

function lessonNavigation() {
  const index = current.ids.indexOf(selected);
  const previous = current.ids[index - 1], next = current.ids[index + 1];
  return `<nav class="lesson-navigation" aria-label="Lesson navigation">
    ${previous ? `<a href="${href(current, previous)}">← Previous</a>` : '<span></span>'}
    ${next ? `<a href="${href(current, next)}">Next topic →</a>` : '<span>End of roadmap</span>'}
  </nav>`;
}
