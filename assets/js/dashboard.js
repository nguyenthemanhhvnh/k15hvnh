const DASHBOARD_CONFIG={
  API_URL:"PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE",
  REFRESH_INTERVAL:30000,
  EVENT_DATE:"2026-08-09T08:00:00+07:00",
  REGISTRATION_TARGET:500,
  TOP_CLASS_LIMIT:10,
  RECENT_LIMIT:6,
  DEMO_WHEN_API_MISSING:true
};

const DEMO_DATA={
  success:true,generatedAt:new Date().toISOString(),
  summary:{totalRegistrations:312,confirmedRegistrations:268,classCount:23,sponsorTotal:86400000,topClass:"KTB",topClassCount:28},
  classRanking:[["KTB",28],["TCA",25],["TCNH",24],["KTQT",22],["QTDNA",20],["KTA",18],["TCC",17],["NHTM",16],["KTDN",15],["City U",14]].map(x=>({className:x[0],count:x[1]})),
  registrationsByDay:[7,10,8,13,18,21,16,24,28,20,31,36,42,38].map((n,i)=>({date:`${String(i+8).padStart(2,"0")}/07`,count:n})),
  recentRegistrations:[
    {name:"Nguyễn Minh Anh",className:"KTB",status:"Đã khớp",createdAt:new Date(Date.now()-4*60000).toISOString()},
    {name:"Trần Thu Hà",className:"TCA",status:"Đã khớp",createdAt:new Date(Date.now()-12*60000).toISOString()},
    {name:"Lê Đức Trung",className:"TCNH",status:"Chưa khớp",createdAt:new Date(Date.now()-24*60000).toISOString()}
  ],
  recentSponsors:[
    {name:"Công ty ABC",amount:10000000,tier:"Vàng",createdAt:new Date(Date.now()-15*60000).toISOString()},
    {name:"Tập thể lớp KTB",amount:8000000,tier:"Bạc",createdAt:new Date(Date.now()-54*60000).toISOString()}
  ]
};

const state={loading:false,lastData:null};
const nf=new Intl.NumberFormat("vi-VN");
const fmt=n=>nf.format(Number(n||0));
const money=n=>`${fmt(n)} ₫`;
const esc=v=>String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
const initials=n=>String(n||"K15").trim().split(/\s+/).slice(-2).map(x=>x[0]?.toUpperCase()||"").join("");
const clock=v=>new Intl.DateTimeFormat("vi-VN",{hour:"2-digit",minute:"2-digit",second:"2-digit"}).format(v?new Date(v):new Date());
function ago(v){if(!v)return"Vừa cập nhật";const s=Math.max(0,Math.floor((Date.now()-new Date(v))/1000));if(s<60)return"Vừa xong";if(s<3600)return`${Math.floor(s/60)} phút trước`;if(s<86400)return`${Math.floor(s/3600)} giờ trước`;return`${Math.floor(s/86400)} ngày trước`}
function status(type,text,time){const d=document.getElementById("syncStatusDot");d.className="dash-status-dot"+(type==="online"?" is-online":type==="error"?" is-error":"");document.getElementById("syncStatusText").textContent=text;document.getElementById("lastUpdated").textContent=clock(time)}
function animate(el,target,formatter=fmt){const start=Number(el.dataset.v||0),end=Number(target||0),t0=performance.now();function f(t){const p=Math.min(1,(t-t0)/650),v=Math.round(start+(end-start)*(1-Math.pow(1-p,3)));el.textContent=formatter(v);el.dataset.v=v;if(p<1)requestAnimationFrame(f)}requestAnimationFrame(f)}
function renderSummary(s={}){
  document.querySelectorAll("[data-kpi]").forEach(el=>{const k=el.dataset.kpi;if(k==="sponsorTotal")animate(el,s[k],money);else if(k==="topClass")el.textContent=s[k]||"--";else animate(el,s[k])});
  const total=+s.totalRegistrations||0,confirmed=+s.confirmedRegistrations||0,rate=total?Math.round(confirmed/total*100):0;
  document.getElementById("confirmedRate").textContent=`${rate}% tổng đăng ký`;
  document.getElementById("topClassNote").textContent=s.topClassCount?`${fmt(s.topClassCount)} người đăng ký`:"Chưa có dữ liệu";
  const p=Math.min(100,Math.round(total/DASHBOARD_CONFIG.REGISTRATION_TARGET*100));
  document.getElementById("targetLabel").textContent=`Mục tiêu ${fmt(DASHBOARD_CONFIG.REGISTRATION_TARGET)} người`;
  document.getElementById("progressPercent").textContent=`${p}%`;
  document.getElementById("progressText").textContent=`${fmt(total)} / ${fmt(DASHBOARD_CONFIG.REGISTRATION_TARGET)} người`;
  document.getElementById("progressBar").style.width=`${p}%`;
}
function renderRanking(items=[]){const c=document.getElementById("classRanking"),a=items.slice(0,DASHBOARD_CONFIG.TOP_CLASS_LIMIT);if(!a.length){c.innerHTML='<div class="dash-empty">Chưa có dữ liệu xếp hạng.</div>';return}const max=Math.max(...a.map(x=>+x.count||0),1);c.innerHTML=a.map((x,i)=>`<div class="dash-ranking-item"><div class="dash-ranking-item__position">${i+1}</div><div><div class="dash-ranking-item__name">${esc(x.className||"Chưa xác định")}</div><div class="dash-ranking-item__bar"><div class="dash-ranking-item__fill" style="width:${Math.max(4,Math.round((+x.count||0)/max*100))}%"></div></div></div><div class="dash-ranking-item__value">${fmt(x.count)}</div></div>`).join("")}
function renderChart(items=[]){const c=document.getElementById("dailyChart"),a=items.slice(-14);if(!a.length){c.innerHTML='<div class="dash-empty">Chưa có dữ liệu biểu đồ.</div>';return}const max=Math.max(...a.map(x=>+x.count||0),1);c.innerHTML=a.map((x,i)=>`<div class="dash-chart__column"><div class="dash-chart__value">${fmt(x.count)}</div><div class="dash-chart__bar" style="height:${Math.max(5,Math.round((+x.count||0)/max*205))}px;animation-delay:${i*35}ms"></div><div class="dash-chart__label">${esc(x.date)}</div></div>`).join("")}
function renderFeed(id,items=[],sponsor=false){const c=document.getElementById(id),a=items.slice(0,DASHBOARD_CONFIG.RECENT_LIMIT);if(!a.length){c.innerHTML='<div class="dash-empty">Chưa có dữ liệu.</div>';return}c.innerHTML=a.map(x=>`<div class="dash-feed-item"><div class="dash-feed-item__avatar">${sponsor?"💛":esc(initials(x.name))}</div><div><div class="dash-feed-item__title">${esc(x.name||"Thành viên K15")}</div><div class="dash-feed-item__subtitle">${esc(sponsor?(x.tier||"Đồng hành"):(x.className||"Chưa rõ lớp"))}</div></div><div class="dash-feed-item__value">${sponsor?money(x.amount):esc(x.status||"Đã đăng ký")}<span class="dash-feed-item__time">${ago(x.createdAt)}</span></div></div>`).join("")}
function daysLeft(){const d=Math.ceil(Math.max(0,new Date(DASHBOARD_CONFIG.EVENT_DATE)-Date.now())/86400000);document.getElementById("daysRemaining").textContent=`${fmt(d)} ngày`}
function render(data){state.lastData=data;renderSummary(data.summary);renderRanking(data.classRanking||[]);renderChart(data.registrationsByDay||[]);renderFeed("recentRegistrations",data.recentRegistrations||[]);renderFeed("recentSponsors",data.recentSponsors||[],true);daysLeft()}
async function load(){
  if(state.loading)return;state.loading=true;const b=document.getElementById("refreshButton");b.disabled=true;b.textContent="Đang đồng bộ...";
  const hasApi=DASHBOARD_CONFIG.API_URL&&!DASHBOARD_CONFIG.API_URL.includes("PASTE_YOUR");
  try{
    if(!hasApi){if(!DASHBOARD_CONFIG.DEMO_WHEN_API_MISSING)throw Error("Chưa cấu hình API");render(DEMO_DATA);status("error","Đang hiển thị dữ liệu mẫu",new Date());return}
    const sep=DASHBOARD_CONFIG.API_URL.includes("?")?"&":"?";
    const r=await fetch(`${DASHBOARD_CONFIG.API_URL}${sep}t=${Date.now()}`,{cache:"no-store"});
    if(!r.ok)throw Error(`HTTP ${r.status}`);const data=await r.json();if(!data?.success)throw Error(data?.message||"Dữ liệu không hợp lệ");
    render(data);status("online","Đồng bộ thành công",data.generatedAt);
  }catch(e){console.error(e);if(!state.lastData&&DASHBOARD_CONFIG.DEMO_WHEN_API_MISSING)render(DEMO_DATA);status("error","Không thể đồng bộ dữ liệu",new Date())}
  finally{state.loading=false;b.disabled=false;b.textContent="Làm mới ngay"}
}
document.getElementById("refreshButton").addEventListener("click",load);daysLeft();load();setInterval(load,DASHBOARD_CONFIG.REFRESH_INTERVAL);setInterval(daysLeft,60000);
