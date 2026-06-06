gsap.registerPlugin(ScrollTrigger);

/* ── LOADER ── */
(function(){
  const ll = document.querySelector('.ll img');
  const lb = document.getElementById('lb');
  const lp = document.getElementById('lpct');
  const loader = document.getElementById('loader');
  gsap.to(ll, {opacity:1, duration:.8, ease:'power2.out', delay:.1});
  let pct = 0;
  const ivl = setInterval(() => {
    pct = Math.min(pct + Math.random() * 18, 90);
    lb.style.left = (pct - 100) + '%';
    lp.textContent = Math.round(pct) + '%';
  }, 120);
  function finish() {
    clearInterval(ivl);
    lb.style.left = '0%'; lp.textContent = '100%';
    setTimeout(() => {
      gsap.to(loader, {opacity:0, duration:.8, ease:'power2.inOut', onComplete:() => {
        loader.style.display = 'none';
        initReveal();
        initParallax();
      }});
    }, 300);
  }
  window.addEventListener('load', finish);
  setTimeout(finish, 3000);
})();

/* ── CURSOR ── */
if (window.matchMedia('(pointer:fine)').matches) {
  const C = document.getElementById('cur'), R = document.getElementById('cur-r');
  document.addEventListener('mousemove', e => {
    C.style.left = e.clientX + 'px'; C.style.top = e.clientY + 'px';
    gsap.to(R, {left: e.clientX, top: e.clientY, duration:.1, ease:'none'});
  }, {passive:true});
  document.addEventListener('mousedown', () => { C.style.width='16px'; C.style.height='16px'; });
  document.addEventListener('mouseup',   () => { C.style.width='10px'; C.style.height='10px'; });
}

/* ── PROGRESS ── */
window.addEventListener('scroll', () => {
  document.getElementById('prog').style.width =
    (scrollY / (document.body.scrollHeight - innerHeight) * 100) + '%';
}, {passive:true});

/* ── NAV ── */
window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('on', scrollY > 50);
}, {passive:true});

/* ══════════════════════════════════════════
   VIDEO
   Desktop : scroll-scrubbed via GSAP scrub
   Mobile  : autoplay muted loop
══════════════════════════════════════════ */
const vid    = document.getElementById('hv');
const tapBtn = document.getElementById('tap-play');
const isMob  = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || innerWidth <= 768;

vid.muted = true;
vid.setAttribute('playsinline', '');
vid.setAttribute('webkit-playsinline', '');

function animText(d) {
  gsap.timeline({delay: d})
    .to('#vtag',   {opacity:1, y:0, duration:.9,  ease:'power3.out'})
    .to('#vtitle', {opacity:1, y:0, duration:1.1, ease:'power3.out'}, '-=0.4')
    .to('.v-role', {opacity:1, stagger:.13, duration:.8, ease:'power3.out'}, '-=0.5');
}

if (isMob) {
  vid.loop    = true;
  vid.preload = 'auto';
  const p = vid.play();
  if (p) {
    p.then(() => { tapBtn.style.display = 'none'; })
     .catch(() => { tapBtn.style.display = 'flex'; });
  }
  function doPlay() { tapBtn.style.display = 'none'; vid.play().catch(()=>{}); }
  document.addEventListener('touchstart', doPlay, {once:true, passive:true});
  tapBtn.addEventListener('click', doPlay, {once:true});
  animText(.35);

} else {
  // Desktop: autoplay muted loop (same as mobile)
  vid.loop    = true;
  vid.preload = 'auto';
  const dp = vid.play();
  if (dp) {
    dp.then(() => { tapBtn.style.display = 'none'; })
      .catch(() => { tapBtn.style.display = 'flex'; });
  }
  function doPlayDesktop() { tapBtn.style.display='none'; vid.play().catch(()=>{}); }
  tapBtn.addEventListener('click', doPlayDesktop, {once:true});
  animText(.4);
}

/* ── REVEAL ── */
function initReveal() {
  document.querySelectorAll('.rv').forEach(el => {
    gsap.fromTo(el, {opacity:0, y:36}, {
      opacity:1, y:0, duration:.95, ease:'power3.out',
      scrollTrigger: {trigger:el, start:'top 88%', toggleActions:'play none none none'}
    });
  });
  document.querySelectorAll('.rvl').forEach(el => {
    gsap.fromTo(el, {opacity:0, x:-40}, {
      opacity:1, x:0, duration:1.1, ease:'power3.out',
      scrollTrigger: {trigger:el, start:'top 88%', toggleActions:'play none none none'}
    });
  });
}

/* ── PARALLAX ── */
function initParallax() {
  const abImg = document.getElementById('ab-img-wrap');
  if (abImg) {
    gsap.to(abImg, {yPercent:-6, ease:'none',
      scrollTrigger: {trigger:'#about', start:'top bottom', end:'bottom top', scrub:1.2}});
  }
  document.addEventListener('mousemove', e => {
    const g = document.querySelector('.h-glow');
    if (g) g.style.transform = `translateY(-50%) translate(${(e.clientX/innerWidth-.5)*34}px,${(e.clientY/innerHeight-.5)*34}px)`;
  }, {passive:true});
}

/* ── DRAG PORTFOLIO ── */
const pfw = document.getElementById('pfw');
let dn=false, sx, sl;
pfw.addEventListener('mousedown',  e => { dn=true; sx=e.pageX-pfw.offsetLeft; sl=pfw.scrollLeft; pfw.style.cursor='grabbing'; });
pfw.addEventListener('mouseleave', () => { dn=false; pfw.style.cursor='grab'; });
pfw.addEventListener('mouseup',    () => { dn=false; pfw.style.cursor='grab'; });
pfw.addEventListener('mousemove',  e => { if(!dn)return; e.preventDefault(); pfw.scrollLeft=sl-(e.pageX-pfw.offsetLeft-sx)*1.5; updateDots(); });
pfw.addEventListener('scroll', updateDots, {passive:true});

function updateDots() {
  const cards = document.querySelectorAll('.pc');
  if (!cards.length) return;
  const cw = cards[0].offsetWidth + 28;
  const idx = Math.round(pfw.scrollLeft / cw);
  document.querySelectorAll('.pf-dot').forEach((d,i) => d.classList.toggle('active', i===idx));
}

/* ══ PROJECTS — loaded from Decap CMS ══ */
let CMS_PROJECTS = [];

// Parse frontmatter from markdown string
function parseFrontmatter(md) {
  const match = md.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm = {};
  match[1].split('\n').forEach(line => {
    const idx = line.indexOf(':');
    if (idx < 0) return;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    fm[key] = val;
  });
  return fm;
}

async function loadProjectsFromCMS() {
  try {
    // Fetch the projects index JSON generated at build
    const res = await fetch('/projects.json');
    if (res.ok) {
      CMS_PROJECTS = await res.json();
      renderP();
      return;
    }
  } catch(e) {}

  // Fallback: load default projects
  CMS_PROJECTS = [
    {en:'Sadrazadeh',fa:'صدرازاده',catEn:'Commercial',catFa:'تبلیغاتی',descEn:'A premium brand campaign.',descFa:'یک کمپین برند پریمیوم.',lnk:'https://instagram.com',img:'portrait.jpg',order:1},
    {en:'Amol Cable', fa:'کابل آمل', catEn:'Brand Film',catFa:'فیلم برند',descEn:'Industrial storytelling.',descFa:'داستان‌پردازی صنعتی.',lnk:'https://instagram.com',img:'portrait.jpg',order:2},
    {en:'Mey Music',  fa:'می موزیک', catEn:'Music Video',catFa:'موزیک ویدیو',descEn:'Cinematic music visuals.',descFa:'ویژوال موزیک سینماتیک.',lnk:'https://instagram.com',img:'portrait.jpg',order:3},
    {en:'Cafe Malt',  fa:'کافه مالت',catEn:'Social Content',catFa:'محتوای شبکه اجتماعی',descEn:'Lifestyle & brand identity.',descFa:'لایف‌استایل و هویت برند.',lnk:'https://instagram.com',img:'portrait.jpg',order:4},
    {en:'Lamari',     fa:'لاماری',  catEn:'Fashion Film',catFa:'فیلم فشن',descEn:'Elegant fashion visuals.',descFa:'ویژوال‌های زیبای فشن.',lnk:'https://instagram.com',img:'portrait.jpg',order:5},
    {en:'Yekta Home', fa:'یکتا هوم',catEn:'Real Estate',catFa:'مسکن',descEn:'Premium property showcase.',descFa:'نمایش ملک پریمیوم.',lnk:'https://instagram.com',img:'portrait.jpg',order:6},
  ];
  renderP();
}

function getP() { return CMS_PROJECTS; }

/* ══ CLIENTS ══ */
const CLIENTS = [
  {en:'Sadrazadeh', fa:'صدرازاده', logo:''},
  {en:'Amol Cable',  fa:'کابل آمل',  logo:''},
  {en:'Mey Music',   fa:'می موزیک',  logo:''},
  {en:'Cafe Malt',   fa:'کافه مالت', logo:''},
  {en:'Lamari',      fa:'لاماری',    logo:''},
  {en:'Yekta Home',  fa:'یکتا هوم',  logo:''},
  {en:'Irancoton',   fa:'ایران کتون', logo:''},
];

let lang = localStorage.getItem('mt_lang') || 'en';

/* ── RENDER PORTFOLIO ── */
function renderP() {
  const t    = document.getElementById('pft');
  const dots = document.getElementById('pfdots');
  const arr  = CMS_PROJECTS.slice().sort((a,b)=>(a.order||0)-(b.order||0));
  t.innerHTML = ''; dots.innerHTML = '';
  arr.forEach((p, i) => {
    const ttl  = lang==='fa' ? p.fa    : p.en;
    const cat  = lang==='fa' ? (p.catFa||'')  : (p.catEn||'');
    const desc = lang==='fa' ? (p.descFa||'') : (p.descEn||'');
    const n    = String(i+1).padStart(2,'0');
    const d    = document.createElement('div');
    d.className = 'pc';
    d.innerHTML = `
      <img src="${p.img}" alt="${ttl}" loading="lazy">
      <div class="po">
        <span class="p-num">${n}</span>
        ${cat  ? `<span class="p-cat">${cat}</span>`  : ''}
        <h3 class="p-title">${ttl}</h3>
        ${desc ? `<p class="p-desc">${desc}</p>` : ''}
        <a href="${p.lnk}" target="_blank" class="p-link" onclick="event.stopPropagation()">
          ${lang==='fa' ? 'مشاهده در اینستاگرام' : 'View on Instagram'}
        </a>
      </div>`;
    d.addEventListener('click', () => window.open(p.lnk, '_blank'));
    t.appendChild(d);
    const dot = document.createElement('div');
    dot.className = 'pf-dot' + (i===0 ? ' active' : '');
    dot.onclick = () => pfw.scrollTo({left: i*(d.offsetWidth+28), behavior:'smooth'});
    dots.appendChild(dot);
  });
}

/* ── RENDER CLIENTS ── */
function renderClients() {
  ['cl-row-1','cl-row-2'].forEach(id => {
    const el = document.getElementById(id);
    el.innerHTML = '';
    const items = [...CLIENTS, ...CLIENTS, ...CLIENTS];
    items.forEach(c => {
      const div = document.createElement('div');
      div.className = 'cl-logo';
      if (c.logo) {
        div.innerHTML = `<img src="${c.logo}" alt="${c.en}">`;
      } else {
        div.innerHTML = `<span>${lang==='fa' ? c.fa : c.en}</span>`;
      }
      el.appendChild(div);
    });
  });
}

/* ── LANG ── */
document.querySelectorAll('[data-lang]').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('[data-lang]').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    setLang(b.dataset.lang);
  });
});
function setLang(l) {
  lang = l;
  localStorage.setItem('mt_lang', l);
  const fa = l === 'fa';
  document.documentElement.lang = l;
  document.documentElement.dir  = fa ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-en][data-fa]').forEach(el => {
    const v = el.dataset[l] || el.dataset.en;
    if (el.tagName==='INPUT'||el.tagName==='TEXTAREA') return;
    if (el.tagName==='BUTTON'||el.tagName==='A') el.textContent = v;
    else el.innerHTML = v;
  });
  document.querySelectorAll('[data-en-ph]').forEach(el => {
    el.placeholder = fa ? el.dataset.faPh : el.dataset.enPh;
  });
  renderP(); renderClients();
}
if (lang === 'fa') {
  document.querySelectorAll('[data-lang]').forEach(b => b.classList.toggle('active', b.dataset.lang==='fa'));
  setLang('fa');
}

/* ── CONTACT FORM ── */
function sendForm(e) {
  e.preventDefault();
  const leads = JSON.parse(localStorage.getItem('mt_leads') || '[]');
  leads.unshift({
    nm:  document.getElementById('f-name').value,
    em:  document.getElementById('f-email').value,
    msg: document.getElementById('f-msg').value,
    dt:  new Date().toLocaleString()
  });
  localStorage.setItem('mt_leads', JSON.stringify(leads));
  const b = e.target.querySelector('.btn-s'), o = b.textContent;
  b.textContent = '✓ Sent!'; b.style.background = '#10b981';
  setTimeout(() => { b.textContent=o; b.style.background='var(--primary)'; e.target.reset(); }, 3200);
}

/* ══ ADMIN ══ */
const PASS = 'mt2025';
let logged = false;

function openAdm()  { document.getElementById('adm').classList.add('open');    document.body.style.overflow='hidden'; if(logged) showDash(); }
function closeAdm() { document.getElementById('adm').classList.remove('open'); document.body.style.overflow=''; }
document.getElementById('adm').addEventListener('click', e => { if(e.target===document.getElementById('adm')) closeAdm(); });

function doLogin() {
  if (document.getElementById('apass').value === PASS) {
    logged = true; document.getElementById('apass').value='';
    document.getElementById('loginMsg').textContent=''; showDash();
  } else { document.getElementById('loginMsg').textContent='Wrong password.'; }
}
function doLogout() {
  logged = false;
  document.getElementById('adm-login').style.display = 'block';
  document.getElementById('adm-dash').style.display  = 'none';
}
function showDash() {
  document.getElementById('adm-login').style.display = 'none';
  document.getElementById('adm-dash').style.display  = 'block';
  renderAdmList(); renderLeads();
}
function showTab(name, btn) {
  document.querySelectorAll('.adm-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.adm-tab-pane').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('tab-'+name).classList.add('active');
  if (name==='leads') renderLeads();
}
function prevImg(inp) {
  const r = new FileReader();
  r.onload = e => { const i=document.getElementById('ap-prev'); i.src=e.target.result; i.style.display='block'; };
  if (inp.files[0]) r.readAsDataURL(inp.files[0]);
}
function saveProj() {
  // Projects are now managed via Decap CMS at /admin
  window.open('/admin/', '_blank');
}
function resetForm() {
  ['ap-en','ap-fa','ap-cat-en','ap-cat-fa','ap-desc-en','ap-desc-fa','ap-lnk'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('ap-img').value='';
  document.getElementById('ap-prev').style.display='none';
  document.getElementById('edit-id').value='';
  document.getElementById('form-mode-title').textContent='➕ Add Project';
  document.getElementById('cancel-edit-btn').style.display='none';
}
function cancelEdit() { resetForm(); }
function editProj(id) {
  const p = getP().find(x=>x.id===id); if(!p)return;
  document.getElementById('ap-en').value=p.en;
  document.getElementById('ap-fa').value=p.fa;
  document.getElementById('ap-cat-en').value=p.catEn||'';
  document.getElementById('ap-cat-fa').value=p.catFa||'';
  document.getElementById('ap-desc-en').value=p.descEn||'';
  document.getElementById('ap-desc-fa').value=p.descFa||'';
  document.getElementById('ap-lnk').value=p.lnk;
  const prev=document.getElementById('ap-prev'); prev.src=p.img; prev.style.display='block';
  document.getElementById('edit-id').value=String(id);
  document.getElementById('form-mode-title').textContent='✏️ Edit Project';
  document.getElementById('cancel-edit-btn').style.display='inline-flex';
  document.getElementById('tab-projects').scrollIntoView({behavior:'smooth'});
}
function delProj(id) {
  if(!confirm('Delete?'))return;
  setP(getP().filter(p=>p.id!==id)); renderP(); renderAdmList();
}
function renderAdmList() {
  const l=document.getElementById('admList'), arr=getP();
  l.innerHTML = arr.length?'':'<p class="no-data">No projects yet.</p>';
  arr.forEach((p,i)=>{
    const r=document.createElement('div'); r.className='adm-row';
    r.draggable=true; r.dataset.idx=i;
    r.innerHTML=`
      <span class="drag-handle" title="Drag to reorder">⠿</span>
      <img src="${p.img}" alt="${p.en}">
      <div class="adm-info"><div class="adm-nm">${p.en} / ${p.fa}</div><div class="adm-sub">${p.lnk}</div></div>
      <div class="adm-actions">
        <button class="a-edit" onclick="editProj(${p.id})">Edit</button>
        <button class="a-del"  onclick="delProj(${p.id})">Delete</button>
      </div>`;
    r.addEventListener('dragstart',e=>{r.style.opacity='.4';});
    r.addEventListener('dragend',  ()=>{r.style.opacity='1';});
    r.addEventListener('dragover', e=>{e.preventDefault();r.style.background='rgba(26,127,255,.06)';});
    r.addEventListener('dragleave',()=>{r.style.background='';});
    r.addEventListener('drop',e=>{
      e.preventDefault(); r.style.background='';
      const from=parseInt(document.querySelector('.adm-row[style*="0.4"]')?.dataset.idx??-1);
      const to=parseInt(r.dataset.idx);
      if(from<0||from===to)return;
      const arr2=getP(); const [item]=arr2.splice(from,1); arr2.splice(to,0,item);
      setP(arr2); renderP(); renderAdmList();
    });
    l.appendChild(r);
  });
}
function renderLeads() {
  const l=document.getElementById('leads-list');
  const leads=JSON.parse(localStorage.getItem('mt_leads')||'[]');
  l.innerHTML=leads.length?'':'<p class="no-data">No submissions yet.</p>';
  leads.forEach(ld=>{
    const d=document.createElement('div'); d.className='lead-item';
    d.innerHTML=`<div class="lead-nm">${ld.nm}</div><div class="lead-em">${ld.em}</div><div class="lead-msg">${ld.msg}</div><div class="lead-dt">${ld.dt}</div>`;
    l.appendChild(d);
  });
}
function clearLeads() {
  if(!confirm('Clear all leads?'))return;
  localStorage.removeItem('mt_leads'); renderLeads();
}

/* ── INIT ── */
loadProjectsFromCMS();
renderClients();
