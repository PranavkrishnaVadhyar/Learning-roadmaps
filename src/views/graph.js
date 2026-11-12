const stageColors = ['#64748b', '#5686d1', '#467f9a', '#9a72c4', '#b88738', '#568a71', '#6e64d7', '#c47955', '#b45d8c'];

function neighbors(id) {
  return [...byId[id].pre, ...nodes.filter(node => node.pre.includes(id)).map(node => node.id),
    ...(conceptLinks ? relations.filter(edge => edge[0] === id || edge[1] === id)
      .map(edge => edge[0] === id ? edge[1] : edge[0]) : [])];
}

function graph() {
  let visible = matching();
  if (expanded) visible = visible.filter(node => expanded.has(node.id));
  if (!visible.length) return '<div class="empty">No matching topics. Clear the search or show the full map.</div>';
  const stages = [...new Set(visible.map(node => node.stage))].sort((a, b) => a - b);
  const positions = {};
  const height = Math.max(420, ...stages.map(stage => visible.filter(node => node.stage === stage).length * 116 + 120));
  const width = stages.length * 310 + 40;
  graphSize = { width, height };
  stages.forEach((stage, column) => {
    visible.filter(node => node.stage === stage).forEach((node, row) => {
      positions[node.id] = { x: 44 + column * 310, y: 100 + row * 116 };
    });
  });
  const edges = visible.flatMap(node => node.pre.map(id => [id, node.id, 'prerequisite']))
    .concat(conceptLinks ? relations : []).filter(([a, b]) => positions[a] && positions[b]);
  const near = new Set([selected, ...neighbors(selected)]);
  const paths = edges.map(([a, b, type]) => {
    const p = positions[a], q = positions[b];
    const same = p.x === q.x, forward = p.x < q.x;
    const x1 = p.x + (same || forward ? 224 : 0);
    const x2 = q.x + (same ? 224 : forward ? 0 : 224);
    const bend = same ? p.x + 266 : (x1 + x2) / 2;
    const active = a === selected || b === selected;
    return `<path d="M${x1},${p.y + 41} C${bend},${p.y + 41} ${bend},${q.y + 41} ${x2},${q.y + 41}"
      class="graph-edge ${active ? 'active' : ''} ${type === 'prerequisite' ? '' : 'conceptual'}"
      ${type === 'prerequisite' ? `marker-end="url(#${active ? 'active-arrow' : 'graph-arrow'})"` : ''}/>`;
  }).join('');
  return `<div class="canvas-meta"><span>${visible.length} topics · ${edges.length} connections</span><span>Drag to pan · Select a topic to read</span></div>
    <div class="graphbox" tabindex="0" aria-label="Knowledge graph canvas. Scroll to pan; topic buttons open lessons.">
      <div class="graph-sizer" style="width:${width * zoom}px;height:${height * zoom}px">
        <div class="graph" style="width:${width}px;height:${height}px;transform:scale(${zoom});transform-origin:top left">
          ${stages.map((stage, col) => `<div class="graph-lane" style="left:${24 + col * 310}px;width:264px;height:${height - 40}px;--stage-color:${stageColors[stage]}">
            <span class="lane-number">${String(stage + 1).padStart(2, '0')}</span><strong>${esc(groups[stage])}</strong></div>`).join('')}
          <svg width="${width}" height="${height}" aria-hidden="true"><defs>
            <marker id="graph-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#bac4d0"/></marker>
            <marker id="active-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#6e64d7"/></marker>
          </defs>${paths}</svg>
          ${visible.map(node => `<button class="gnode ${node.id === selected ? 'selected' : ''} ${near.has(node.id) ? 'near' : ''}" data-node="${node.id}"
            aria-pressed="${node.id === selected}" style="left:${positions[node.id].x}px;top:${positions[node.id].y}px;--stage-color:${stageColors[node.stage]}">
            <small>${node.pre.length ? node.pre.length + ' prerequisites' : 'Start here'}</small><strong>${esc(node.title)}</strong><span class="node-arrow" aria-hidden="true">↗</span></button>`).join('')}
        </div>
      </div>
    </div>
    <div class="graph-legend"><span><i class="solid-key"></i>Prerequisite</span><span><i class="dashed-key"></i>Conceptual connection</span><span><i class="selected-key"></i>Selected topic</span></div>`;
}

function bindCanvas() {
  const canvas = document.querySelector('.graphbox');
  if (!canvas) return;
  let drag = null;
  canvas.addEventListener('pointerdown', event => {
    if (event.target.closest('button') || event.button !== 0 || event.pointerType === 'touch') return;
    drag = { x: event.clientX, y: event.clientY, left: canvas.scrollLeft, top: canvas.scrollTop };
    canvas.setPointerCapture(event.pointerId);
    canvas.classList.add('dragging');
    event.preventDefault();
  });
  canvas.addEventListener('pointermove', event => {
    if (!drag) return;
    canvas.scrollLeft = drag.left - event.clientX + drag.x;
    canvas.scrollTop = drag.top - event.clientY + drag.y;
  });
  const release = () => { drag = null; canvas.classList.remove('dragging'); };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('lostpointercapture', release);
}

function centerSelection() {
  const canvas = document.querySelector('.graphbox');
  const node = document.querySelector('.gnode.selected');
  if (!canvas || !node) return;
  canvas.scrollLeft = parseFloat(node.style.left) * zoom - canvas.clientWidth / 2 + 112 * zoom;
  canvas.scrollTop = parseFloat(node.style.top) * zoom - canvas.clientHeight / 2 + 41 * zoom;
}
