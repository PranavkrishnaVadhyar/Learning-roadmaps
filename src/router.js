function route() {
  const parts = location.hash.slice(1).split('/').filter(Boolean);
  if (parts.length === 0) {
    renderHome();
    return;
  }
  if (parts[0] === 'guide') {
    main.innerHTML = `<article class="prose"><a href="#/">← All roadmaps</a>
      <h1>How to use this roadmap</h1>
      <h2>Pick a topic</h2><p>Start with elementary mathematics or jump to a topic you want to study. Open a stage, then select a topic to read its lesson.</p>
      <h2>Fill in the gaps</h2><p>Use “Show prerequisites” to find the background for your selected topic. The optional connection graph shows prerequisite arrows and conceptual relationships.</p>
      <h2>Work through the ideas</h2><p>Read the definition and intuition, reconstruct the mathematics, and try the practice question. These are derivation sketches; consult the readings for full proofs and assumptions.</p>
      <h2>Explore the graph</h2><p>Drag the canvas to pan and use the zoom buttons to adjust its scale. Select a topic to open its notes. Focus isolates its immediate connections; expand reveals more. Solid arrows indicate prerequisites, while dashed lines show conceptual relationships. Use the topic list for an accessible alternative. Research notes offer starting questions, not a survey of the latest literature.</p></article>`;
    return;
  }
  const roadmap = roadmaps.find(item => item.id === parts[1]);
  if (parts[0] !== 'roadmaps' || !roadmap || (parts[2] && !roadmap.ids.includes(parts[2]))) {
    main.innerHTML = '<h1>Page not found</h1><p><a href="#/">Back to all roadmaps</a></p>';
    return;
  }
  current = roadmap;
  selected = parts[2] || current.start;
  if (parts[2]) { expanded = new Set(ancestry(selected)); query = ''; }
  renderRoadmap();
}
