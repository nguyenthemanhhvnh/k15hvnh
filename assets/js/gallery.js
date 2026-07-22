const GALLERY_CONFIG={
  API_URL:"https://script.google.com/macros/s/AKfycbyzY00yA5NTGSzu8rweq04GAXi5-kIhx_7zqReQxugrGlP5QviisFZ8ZyZZHZJpDRkq/exec",
  CACHE_BUSTER_VERSION:"20260721-1",
  AUTO_REFRESH_MS:5*60*1000
};

const state={
  albums:[],
  filteredAlbums:[],
  activeAlbum:null,
  activePhotoIndex:0,
  loading:false
};

const els={
  grid:document.getElementById("albumGrid"),
  empty:document.getElementById("emptyState"),
  search:document.getElementById("gallerySearch"),
  refresh:document.getElementById("refreshGallery"),
  status:document.getElementById("galleryStatus"),
  updated:document.getElementById("galleryUpdated"),
  totalAlbums:document.getElementById("totalAlbums"),
  totalPhotos:document.getElementById("totalPhotos"),
  modal:document.getElementById("albumModal"),
  modalTitle:document.getElementById("albumModalTitle"),
  modalMeta:document.getElementById("albumModalMeta"),
  photoGrid:document.getElementById("photoGrid"),
  lightbox:document.getElementById("lightbox"),
  lightboxImage:document.getElementById("lightboxImage"),
  lightboxCaption:document.getElementById("lightboxCaption"),
  lightboxCounter:document.getElementById("lightboxCounter")
};

const esc=value=>String(value??"")
  .replaceAll("&","&amp;")
  .replaceAll("<","&lt;")
  .replaceAll(">","&gt;")
  .replaceAll('"',"&quot;")
  .replaceAll("'","&#039;");

const fmt=n=>new Intl.NumberFormat("vi-VN").format(Number(n||0));

function formatTime(value){
  if(!value)return"";
  return new Intl.DateTimeFormat("vi-VN",{
    hour:"2-digit",minute:"2-digit",day:"2-digit",month:"2-digit",year:"numeric"
  }).format(new Date(value));
}

function setStatus(message,isError=false){
  els.status.textContent=message;
  els.status.style.color=isError?"#c94f5c":"";
}

function renderStats(data){
  els.totalAlbums.textContent=fmt(data.summary?.totalAlbums||state.albums.length);
  els.totalPhotos.textContent=fmt(data.summary?.totalPhotos||state.albums.reduce((s,a)=>s+(a.photoCount||0),0));
  els.updated.textContent=data.generatedAt?`Cập nhật ${formatTime(data.generatedAt)}`:"";
}

function renderAlbums(){
  const albums=state.filteredAlbums;
  els.empty.hidden=albums.length>0;
  els.grid.hidden=albums.length===0;

  if(!albums.length)return;

  els.grid.innerHTML=albums.map((album,index)=>{
    const cover=album.cover?.thumbnailUrl||album.cover?.imageUrl||"";
    return `
      <article class="album-card" data-album-id="${esc(album.id)}" tabindex="0" role="button" aria-label="Mở album ${esc(album.name)}">
        <div class="album-card__cover">
          ${cover?`<img src="${esc(cover)}" alt="Ảnh đại diện album ${esc(album.name)}" loading="${index<6?"eager":"lazy"}">`:""}
          <span class="album-card__badge">♥ ${fmt(album.photoCount)} ảnh</span>
          <strong class="album-card__class">${esc(album.name)}</strong>
        </div>
        <div class="album-card__body">
          <div>
            <strong>${esc(album.displayName||album.name)}</strong>
            <p>Chạm để xem toàn bộ khoảnh khắc</p>
          </div>
          <button class="album-card__open" type="button" aria-label="Mở album">→</button>
        </div>
      </article>`;
  }).join("");
}

function filterAlbums(){
  const q=els.search.value.trim().toLowerCase();
  state.filteredAlbums=!q
    ?state.albums.slice()
    :state.albums.filter(album=>`${album.name} ${album.displayName||""}`.toLowerCase().includes(q));
  renderAlbums();
}

async function loadAlbums(force=false){
  if(state.loading)return;
  state.loading=true;
  els.refresh.disabled=true;
  els.refresh.textContent="Đang tải...";
  setStatus("Đang đồng bộ ảnh từ Google Drive...");

  try{
    if(!GALLERY_CONFIG.API_URL||GALLERY_CONFIG.API_URL.includes("PASTE_YOUR")){
      throw new Error("Chưa cấu hình API_URL trong gallery.js");
    }

    const url=new URL(GALLERY_CONFIG.API_URL);
    url.searchParams.set("action","albums");
    url.searchParams.set("v",GALLERY_CONFIG.CACHE_BUSTER_VERSION);
    if(force)url.searchParams.set("refresh","1");
    url.searchParams.set("_",Date.now());

    const response=await fetch(url.toString(),{cache:"no-store"});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const data=await response.json();
    if(!data.success)throw new Error(data.message||"Không thể đọc dữ liệu album");

    state.albums=Array.isArray(data.albums)?data.albums:[];
    state.filteredAlbums=state.albums.slice();
    renderStats(data);
    renderAlbums();
    setStatus(`Đã đồng bộ ${fmt(state.albums.length)} album`);
  }catch(error){
    console.error(error);
    setStatus(`Không thể tải gallery: ${error.message}`,true);
    els.grid.innerHTML=`
      <div class="gallery-loading-card">
        <p><strong>Chưa tải được dữ liệu.</strong></p>
        <p>Kiểm tra API Apps Script và quyền chia sẻ thư mục Google Drive.</p>
      </div>`;
  }finally{
    state.loading=false;
    els.refresh.disabled=false;
    els.refresh.textContent="Làm mới";
  }
}

async function openAlbum(albumId){
  const basic=state.albums.find(a=>String(a.id)===String(albumId));
  if(!basic)return;

  state.activeAlbum={...basic,photos:basic.photos||[]};
  els.modal.classList.add("is-open");
  els.modal.setAttribute("aria-hidden","false");
  document.body.style.overflow="hidden";
  els.modalTitle.textContent=basic.displayName||basic.name;
  els.modalMeta.textContent=`${fmt(basic.photoCount)} ảnh · K15 FM – Thanh xuân phát lại`;
  els.photoGrid.innerHTML=`<div class="gallery-loading-card"><div class="gallery-spinner"></div><p>Đang mở album...</p></div>`;

  try{
    const url=new URL(GALLERY_CONFIG.API_URL);
    url.searchParams.set("action","album");
    url.searchParams.set("folderId",basic.id);
    url.searchParams.set("_",Date.now());

    const response=await fetch(url.toString(),{cache:"no-store"});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const data=await response.json();
    if(!data.success)throw new Error(data.message||"Không thể mở album");

    state.activeAlbum={...basic,photos:data.photos||[]};
    renderPhotos();
  }catch(error){
    console.error(error);
    els.photoGrid.innerHTML=`<div class="gallery-loading-card"><p>Không thể mở album này.</p></div>`;
  }
}

function renderPhotos(){
  const photos=state.activeAlbum?.photos||[];
  if(!photos.length){
    els.photoGrid.innerHTML=`<div class="gallery-loading-card"><p>Album chưa có ảnh.</p></div>`;
    return;
  }

  els.photoGrid.innerHTML=photos.map((photo,index)=>`
    <button class="photo-card" type="button" data-photo-index="${index}" aria-label="Xem ảnh ${index+1}">
      <img src="${esc(photo.thumbnailUrl||photo.imageUrl)}" alt="${esc(photo.name||`Ảnh ${index+1}`)}" loading="lazy">
    </button>
  `).join("");
}

function closeAlbum(){
  els.modal.classList.remove("is-open");
  els.modal.setAttribute("aria-hidden","true");
  if(!els.lightbox.classList.contains("is-open"))document.body.style.overflow="";
}

function openLightbox(index){
  const photos=state.activeAlbum?.photos||[];
  if(!photos.length)return;
  state.activePhotoIndex=(index+photos.length)%photos.length;
  const photo=photos[state.activePhotoIndex];

  els.lightboxImage.src=photo.imageUrl||photo.thumbnailUrl;
  els.lightboxImage.alt=photo.name||"Ảnh K15";
  els.lightboxCaption.textContent=photo.name||state.activeAlbum.name;
  els.lightboxCounter.textContent=`${state.activePhotoIndex+1} / ${photos.length}`;
  els.lightbox.classList.add("is-open");
  els.lightbox.setAttribute("aria-hidden","false");
  document.body.style.overflow="hidden";
}

function closeLightbox(){
  els.lightbox.classList.remove("is-open");
  els.lightbox.setAttribute("aria-hidden","true");
  els.lightboxImage.removeAttribute("src");
  if(!els.modal.classList.contains("is-open"))document.body.style.overflow="";
}

function moveLightbox(delta){
  openLightbox(state.activePhotoIndex+delta);
}

els.search.addEventListener("input",filterAlbums);
els.refresh.addEventListener("click",()=>loadAlbums(true));

els.grid.addEventListener("click",event=>{
  const card=event.target.closest("[data-album-id]");
  if(card)openAlbum(card.dataset.albumId);
});
els.grid.addEventListener("keydown",event=>{
  if((event.key==="Enter"||event.key===" ")&&event.target.matches("[data-album-id]")){
    event.preventDefault();
    openAlbum(event.target.dataset.albumId);
  }
});

els.photoGrid.addEventListener("click",event=>{
  const card=event.target.closest("[data-photo-index]");
  if(card)openLightbox(Number(card.dataset.photoIndex));
});

document.querySelectorAll("[data-close-modal]").forEach(el=>el.addEventListener("click",closeAlbum));
document.querySelectorAll("[data-close-lightbox]").forEach(el=>el.addEventListener("click",closeLightbox));
document.querySelector("[data-lightbox-prev]").addEventListener("click",()=>moveLightbox(-1));
document.querySelector("[data-lightbox-next]").addEventListener("click",()=>moveLightbox(1));

document.addEventListener("keydown",event=>{
  if(event.key==="Escape"){
    if(els.lightbox.classList.contains("is-open"))closeLightbox();
    else if(els.modal.classList.contains("is-open"))closeAlbum();
  }
  if(els.lightbox.classList.contains("is-open")){
    if(event.key==="ArrowLeft")moveLightbox(-1);
    if(event.key==="ArrowRight")moveLightbox(1);
  }
});

let touchStartX=0;
els.lightbox.addEventListener("touchstart",e=>touchStartX=e.changedTouches[0].clientX,{passive:true});
els.lightbox.addEventListener("touchend",e=>{
  const dx=e.changedTouches[0].clientX-touchStartX;
  if(Math.abs(dx)>55)moveLightbox(dx>0?-1:1);
},{passive:true});

loadAlbums();
setInterval(()=>loadAlbums(false),GALLERY_CONFIG.AUTO_REFRESH_MS);
