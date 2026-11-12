const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function href(r,id){return `#/roadmaps/${r.id}${id?'/'+id:''}`;}
function link(id){return `<a href="${href(current,id)}">${esc(byId[id].title)}</a>`;}
