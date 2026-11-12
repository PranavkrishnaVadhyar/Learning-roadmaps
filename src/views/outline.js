function matching() {
  return current.ids.map(id => byId[id]).filter(node =>
    (node.title + ' ' + node.definition).toLowerCase().includes(query.toLowerCase())
  );
}

function outline() {
  const found = matching();
  if (!found.length) return '<p class="empty">No matching topics. Try another search.</p>';
  return groups.map((group, stage) => {
    const topics = found.filter(node => node.stage === stage);
    if (!topics.length) return '';
    const isOpen = query || stage === byId[selected].stage;
    return `<details class="stage" ${isOpen ? 'open' : ''}>
      <summary><span class="stage-number">${stage + 1}</span><span>${esc(group)}<small>${topics.length} topics</small></span></summary>
      <div class="stage-topics">${topics.map(node => `<button class="topic ${selected === node.id ? 'selected' : ''}" data-node="${node.id}" ${selected === node.id ? 'aria-current="true"' : ''}>
        <span class="dot" aria-hidden="true"></span>${esc(node.title)}</button>`).join('')}</div>
    </details>`;
  }).join('');
}
