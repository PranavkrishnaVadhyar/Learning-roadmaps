const main = document.getElementById('main');
let current = null, selected = null, view = 'graph', query = '', showRoute = false;
let conceptLinks = true, zoom = 0.85, expanded = null, graphSize = { width: 1, height: 1 };
