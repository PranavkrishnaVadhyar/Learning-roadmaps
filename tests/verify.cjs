const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(match => match[1]);
assert.ok(scripts.length > 0, 'Entry page must load application scripts');
function boot(saved = {}) {
  const elements = new Map();
  const element = id => { if (!elements.has(id)) elements.set(id, { innerHTML: '', textContent: '', value: '', clientWidth: 1000, addEventListener() {} }); return elements.get(id); };
  const storage = { ...saved };
  const context = vm.createContext({ document: { getElementById: element, querySelector: () => null }, localStorage: { getItem: k => storage[k] || null, setItem: (k,v) => storage[k] = v }, location: { hash: '' }, window: { addEventListener() {} }, console });
  for (const file of scripts) {
    vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
  }
  return { context, elements, storage, run: s => vm.runInContext(s, context) };
}
const app = boot();
app.run(`
if(new Set(nodes.map(n=>n.id)).size!==nodes.length)throw Error('Duplicate IDs');
for(const n of nodes){
 for(const field of ['title','definition','math','derivation','intuition','applications','practice'])if(!n[field])throw Error(n.id+' missing '+field);
 for(const p of n.pre)if(!byId[p])throw Error('Missing prerequisite '+p);
 const active=new Set(),done=new Set();function visit(id){if(active.has(id))throw Error('Cycle at '+id);if(done.has(id))return;active.add(id);byId[id].pre.forEach(visit);active.delete(id);done.add(id);}visit(n.id);
 const ordered=ancestry(n.id);for(const id of ordered)for(const p of byId[id].pre)if(ordered.indexOf(p)>ordered.indexOf(id))throw Error('Order failure');
}
for(const [a,b]of relations)if(!byId[a]||!byId[b])throw Error('Invalid connection');
for(const r of roadmaps)for(const id of r.ids)if(!byId[id])throw Error('Invalid roadmap concept');
for(const r of roadmaps){location.hash=href(r);route();for(const id of r.ids){selected=id;lesson();}view='graph';renderRoadmap();view='list';}
`);
assert.match(app.elements.get('main').innerHTML,/Kernel methods/);
assert.equal(app.run('roadmaps.length'), 1);
assert.equal(app.run('nodes.length'), 44);
assert.equal(app.run('groups.length'), 9);
assert.equal(app.run('byId.ntk.pre.includes("networks")'), false);
app.run("location.hash='';route();");
assert.equal(app.run('current'), null);
assert.match(app.elements.get('main').innerHTML, /Available roadmaps/);
assert.equal((app.elements.get('main').innerHTML.match(/class="card"/g) || []).length, 1);
assert.match(app.elements.get('main').innerHTML, /#\/roadmaps\/kernel-methods/);
app.run("location.hash='#/roadmaps/kernel-methods';route();");
assert.equal(app.run('selected'), 'numbers');
assert.match(app.elements.get('main').innerHTML, /Show prerequisites/);
app.run("location.hash='#/roadmaps/kernel-methods/krr';route();");
assert.doesNotMatch(app.elements.get('main').innerHTML, /study-status|completed|Export progress/);
app.run("view='graph';expanded=new Set([selected,...neighbors(selected)]);renderRoadmap();");
assert.match(app.elements.get('main').innerHTML, /graph-lane/);
assert.match(app.elements.get('main').innerHTML, /graph-edge/);
for (const file of scripts) assert.doesNotMatch(fs.readFileSync(path.join(root,file),'utf8'), /localStorage|sessionStorage/);
app.run("query='no-such-concept';");assert.match(app.run('outline()'),/No matching/);
app.run("location.hash='#/roadmaps/missing';route();");assert.match(app.elements.get('main').innerHTML,/Page not found/);
console.log(`PASS: ${app.run('nodes.length')} concepts; dependency integrity and order, all lessons and roadmap renders, static content and graph rendering, empty and missing-page states.`);
console.log('These are logic/render smoke checks with a minimal DOM stub, not browser layout tests.');
