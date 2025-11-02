
// Minimal client-side 'hosting' using localStorage.
// Data model: localStorage key "mini_catbox_files" -> JSON object { id: {title, name, dataURL, mime, likes, views, created} }
function uid(n=8){ const s = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; let o=''; for(let i=0;i<n;i++) o+=s[Math.floor(Math.random()*s.length)]; return o; }
const LS_KEY = 'mini_catbox_files';

function readFiles(){ try{ return JSON.parse(localStorage.getItem(LS_KEY) || '{}') }catch(e){ return {} } }
function writeFiles(obj){ localStorage.setItem(LS_KEY, JSON.stringify(obj)) }

function renderGrid(){
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  const files = readFiles();
  const tpl = document.getElementById('cardT');
  const ids = Object.keys(files).sort((a,b)=> files[b].created - files[a].created);
  if(ids.length===0){ grid.innerHTML = '<p class="muted">No uploads yet.</p>'; return; }
  ids.forEach(id=>{
    const f = files[id];
    const el = tpl.content.cloneNode(true);
    const card = el.querySelector('.card');
    const thumb = el.querySelector('.thumb');
    const title = el.querySelector('.title');
    const likes = el.querySelector('.likes');
    const views = el.querySelector('.views');
    const copyBtn = el.querySelector('.copy');
    const openA = el.querySelector('.open');

    title.textContent = f.title || f.name;
    likes.textContent = f.likes || 0;
    views.textContent = f.views || 0;

    // render thumbnail
    if(f.mime && f.mime.startsWith('image')){
      const img = document.createElement('img'); img.src = f.dataURL; thumb.appendChild(img);
    } else if(f.mime && f.mime.startsWith('video')){
      const v = document.createElement('video'); v.src = f.dataURL; v.controls = false; v.muted=true; v.playsInline=true; v.style.maxHeight='120px'; thumb.appendChild(v);
    } else {
      thumb.textContent = f.name;
    }

    const link = location.origin + location.pathname + '#/f/' + id;
    copyBtn.onclick = ()=>{ navigator.clipboard?.writeText(link); alert('Link copied:\\n' + link) };
    openA.href = link;
    openA.textContent = 'Open';
    grid.appendChild(el);
  });
}

document.getElementById('uploadForm').addEventListener('submit', async (ev)=>{
  ev.preventDefault();
  const fi = document.getElementById('fileInput');
  if(!fi.files || fi.files.length===0) return alert('Choose file');
  const file = fi.files[0];
  const title = document.getElementById('title').value.trim();
  const reader = new FileReader();
  reader.onload = function(e){
    const dataURL = e.target.result;
    const id = uid(10);
    const files = readFiles();
    files[id] = { title: title, name: file.name, dataURL: dataURL, mime: file.type, likes: 0, views: 0, created: Date.now() };
    writeFiles(files);
    renderGrid();
    // show link
    const link = location.origin + location.pathname + '#/f/' + id;
    prompt('Shareable link (copy):', link);
    // reset form
    document.getElementById('uploadForm').reset();
  };
  reader.readAsDataURL(file);
});

// Router: handle #/f/:id
function router(){
  const hash = location.hash || '';
  if(hash.startsWith('#/f/')){
    const id = hash.slice(4);
    const files = readFiles();
    const f = files[id];
    if(!f){ document.body.innerHTML = '<p style="padding:20px">File not found.</p>'; return; }
    // increment views
    f.views = (f.views||0) + 1;
    files[id] = f;
    writeFiles(files);

    // render viewer
    const html = `
      <div style="padding:20px;max-width:980px;margin:0 auto">
        <a href="${location.pathname}" style="display:inline-block;margin-bottom:12px">⬅️ Back</a>
        <h2>${f.title || f.name}</h2>
        <div style="margin:12px 0">
          ${ f.mime && f.mime.startsWith('image') ? `<img src="${f.dataURL}" style="max-width:100%"/>` :
             f.mime && f.mime.startsWith('video') ? `<video src="${f.dataURL}" controls style="max-width:100%"></video>` :
             `<a href="${f.dataURL}" download>Download ${f.name}</a>` }
        </div>
        <div style="font-size:16px">❤ <span id="likes">${f.likes}</span> · 👁 <span id="views">${f.views}</span></div>
        <div style="margin-top:12px">
          <button id="likeBtn">Like</button>
          <button id="dlBtn">Download</button>
        </div>
      </div>
    `;
    document.body.innerHTML = html;
    document.getElementById('likeBtn').onclick = ()=>{
      f.likes = (f.likes||0) + 1;
      files[id] = f; writeFiles(files);
      document.getElementById('likes').innerText = f.likes;
    };
    document.getElementById('dlBtn').onclick = ()=>{
      const a = document.createElement('a'); a.href = f.dataURL; a.download = f.name; document.body.appendChild(a); a.click(); a.remove();
    };
    return;
  }
  // default: show app shell
  document.body.innerHTML = null;
  // recreate original DOM from index.html by reloading the page fragment
  // simplest: fetch index.html content and replace body (but we have it preloaded). Instead, just reload window to original file if possible
  // To keep it simple: reload the page without hash
  if(location.hash === '' || !location.hash.startsWith('#/f/')) {
    // re-render static content by injecting original HTML (fetch not available cross-file).
    // So simply reload the page (this will load index.html from server)
    // But avoid infinite loop: replaceState then render grid quickly
    history.replaceState(null,'',location.pathname);
    // safer: reload to re-render original UI
    location.reload();
  }
}

// initial render
if(!location.hash || location.hash === '') {
  // renderGrid will run when page loads normally
  window.addEventListener('load', ()=>{ renderGrid(); });
} else {
  // handle viewer route
  window.addEventListener('load', ()=>{ router(); });
}

// handle hashchange
window.addEventListener('hashchange', router);
