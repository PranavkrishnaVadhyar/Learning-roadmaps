const ancestry=id=>{const result=[],seen=new Set();function visit(x){if(seen.has(x))return;seen.add(x);byId[x].pre.forEach(visit);result.push(x);}visit(id);return result;};
