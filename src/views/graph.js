const stageColors = ['#64748b','#5686d1','#467f9a','#9a72c4','#b88738','#568a71','#6e64d7','#c47955','#b45d8c'];
function neighbors(id) { return [...byId[id].pre,...nodes.filter(n=>n.pre.includes(id)).map(n=>n.id)]; }
function graph() {
 const visible=matching().filter(n=>!expanded||expanded.has(n.id));
 if(!visible.length)return '<p class="empty">No matching topics.</p>';
 const depths={};
 function depth(id){return depths[id]??(depths[id]=byId[id].pre.length?1+Math.max(...byId[id].pre.map(depth)):0);}
 const levels=[...new Set(visible.map(n=>depth(n.id)))].sort((a,b)=>a-b),positions={};
 const columns=Math.max(...levels.map(d=>visible.filter(n=>depth(n.id)===d).length));
 const width=columns*280+220,height=levels.length*190+70;
 graphSize={width,height};
 levels.forEach((d,row)=>{const layer=visible.filter(n=>depth(n.id)===d);layer.forEach((n,col)=>positions[n.id]={x:50+(columns-layer.length)*140+col*280,y:65+row*190});});
 const edges=visible.flatMap(n=>n.pre.map(p=>[p,n.id,'prerequisite'])).concat(conceptLinks?relations:[]).filter(([a,b])=>positions[a]&&positions[b]);
 const paths=edges.map(([a,b,type],i)=>{const p=positions[a],q=positions[b],x=p.x+112,z=q.x+112,y=p.y+82,t=q.y,rail=width-70+(i%10)*5;
 // Neighboring levels branch smoothly; longer links bend around intervening cards.
 const d=t-y===108
   ? `M${x},${y} C${x},${y+54} ${z},${t-54} ${z},${t}`
   : roundedConnector([[x,y],[x,y+30],[rail,y+30],[rail,t-30],[z,t-30],[z,t]],16);
 return `<path d="${d}" class="graph-edge ${a===selected||b===selected?'active':''} ${type==='prerequisite'?'':'conceptual'}" ${type==='prerequisite'?'marker-end="url(#arrow)"':''}><title>${esc(byId[a].title)} to ${esc(byId[b].title)}: ${esc(type)}</title></path>`;}).join('');
 return `<div class="canvas-meta">${visible.length} topics · ${levels.length} dependency levels · Top to bottom</div><div class="graphbox" tabindex="0" aria-label="Flow graph"><div style="width:${width*zoom}px;height:${height*zoom}px"><div class="graph" style="width:${width}px;height:${height}px;transform:scale(${zoom});transform-origin:top left">${levels.map((d,r)=>`<div class="graph-lane" style="left:15px;top:${r*190+15}px;width:${width-100}px;height:150px;--stage-color:#6e64d7"><small>${d===0?'Foundations':'Depth '+d}</small></div>`).join('')}<svg width="${width}" height="${height}" aria-hidden="true"><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#6e64d7"/></marker></defs>${paths}</svg>${visible.map(n=>`<button class="gnode ${n.id===selected?'selected':''}" data-node="${n.id}" style="left:${positions[n.id].x}px;top:${positions[n.id].y}px;--stage-color:${stageColors[n.stage]}"><small>${esc(groups[n.stage])}</small><strong>${esc(n.title)}</strong></button>`).join('')}</div></div></div><div class="graph-legend">Solid arrows: prerequisites → topic. Dashed lines: conceptual relationships.</div>`;
}
function bindCanvas(){const c=document.querySelector('.graphbox');if(!c)return;let drag=null;c.onpointerdown=e=>{if(e.target.closest('button')||e.button!==0||e.pointerType==='touch')return;drag={x:e.clientX,y:e.clientY,left:c.scrollLeft,top:c.scrollTop};c.setPointerCapture(e.pointerId);e.preventDefault();};c.onpointermove=e=>{if(drag){c.scrollLeft=drag.left+drag.x-e.clientX;c.scrollTop=drag.top+drag.y-e.clientY;}};c.onpointerup=c.onpointercancel=c.onlostpointercapture=()=>drag=null;}
function centerSelection(){const c=document.querySelector('.graphbox'),n=document.querySelector('.gnode.selected');if(c&&n){c.scrollLeft=parseFloat(n.style.left)*zoom-c.clientWidth/2+112*zoom;c.scrollTop=parseFloat(n.style.top)*zoom-c.clientHeight/2+41*zoom;}}

// Round an orthogonal route without moving its endpoints or entering node bounds.
function roundedConnector(points, radius) {
 let path = `M${points[0][0]},${points[0][1]}`;
 for (let i = 1; i < points.length - 1; i++) {
   const previous = points[i-1], corner = points[i], next = points[i+1];
   const incoming = Math.hypot(corner[0]-previous[0],corner[1]-previous[1]);
   const outgoing = Math.hypot(next[0]-corner[0],next[1]-corner[1]);
   if (!incoming || !outgoing) continue;
   const r = Math.min(radius,incoming/2,outgoing/2);
   const before = corner.map((v,j)=>v+(previous[j]-v)*r/incoming);
   const after = corner.map((v,j)=>v+(next[j]-v)*r/outgoing);
   path += ` L${before[0]},${before[1]} Q${corner[0]},${corner[1]} ${after[0]},${after[1]}`;
 }
 const end = points[points.length-1];
 return path + ` L${end[0]},${end[1]}`;
}
