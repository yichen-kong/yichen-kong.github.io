(() => {
  const root = document.documentElement;
  let lang = 'zh';
  try { lang = localStorage.getItem('yk-lang') === 'en' ? 'en' : 'zh'; } catch {}
  const applyLang = value => { lang=value==='en'?'en':'zh'; root.dataset.lang=lang; root.lang=lang==='zh'?'zh-CN':'en'; try{localStorage.setItem('yk-lang',lang)}catch{}; document.dispatchEvent(new CustomEvent('languagechange',{detail:lang})); };
  applyLang(lang);
  document.querySelectorAll('[data-lang-toggle]').forEach(button => button.addEventListener('click',()=>applyLang(lang==='zh'?'en':'zh')));

  const nav=document.querySelector('.site-nav'), menu=document.querySelector('.menu-button');
  const closeMenu=()=>{nav?.classList.remove('menu-open');document.body.classList.remove('menu-locked');menu?.setAttribute('aria-expanded','false');document.querySelectorAll('.nav-item.expanded').forEach(i=>i.classList.remove('expanded'));document.querySelectorAll('.nav-toggle').forEach(b=>b.setAttribute('aria-expanded','false'));};
  const openMenu=()=>{nav?.classList.add('menu-open');document.body.classList.add('menu-locked');menu?.setAttribute('aria-expanded','true');};
  menu?.addEventListener('click',()=>nav.classList.contains('menu-open')?closeMenu():openMenu());
  document.querySelectorAll('.nav-toggle').forEach(button=>button.addEventListener('click',()=>{const item=button.closest('.nav-item');const open=item.classList.toggle('expanded');button.setAttribute('aria-expanded',String(open));}));
  document.querySelectorAll('.nav-menu a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();document.querySelector('.lightbox')?.classList.remove('is-open')}});
  let lastY=scrollY, idle;
  window.addEventListener('scroll',()=>{const y=scrollY;nav?.classList.toggle('is-solid',y>24);if(y>120&&y>lastY+6&&!nav?.classList.contains('menu-open'))nav?.classList.add('is-hidden');if(y<lastY-6||y<60)nav?.classList.remove('is-hidden');lastY=y;clearTimeout(idle);idle=setTimeout(()=>nav?.classList.remove('is-hidden'),700)},{passive:true});
  nav?.addEventListener('mouseenter',()=>nav.classList.remove('is-hidden'));

  const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');io.unobserve(entry.target)}}),{threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

  const lightbox=document.querySelector('.lightbox'); const lightboxImage=lightbox?.querySelector('img');
  const openLightbox=(src,alt='')=>{if(!lightbox||!lightboxImage)return;lightboxImage.src=src;lightboxImage.alt=alt;lightbox.classList.add('is-open');document.body.classList.add('is-locked')};
  const closeLightbox=()=>{lightbox?.classList.remove('is-open');document.body.classList.remove('is-locked')};
  document.querySelectorAll('[data-lightbox]').forEach(el=>el.addEventListener('click',()=>openLightbox(el.dataset.lightbox||el.dataset.full||el.querySelector('img')?.src,el.dataset.alt||el.querySelector('img')?.alt||'')));
  lightbox?.addEventListener('click',e=>{if(e.target===lightbox||e.target.closest('[data-close-lightbox]'))closeLightbox()});

  const sunrise=document.querySelector('[data-sunrise]'), sunset=document.querySelector('[data-sunset]'), sunDate=document.querySelector('[data-sun-date]');
  async function updateSun(){if(!sunrise&&!sunset)return;try{const d=new Date().toISOString().slice(0,10);const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=36.6171&longitude=101.7782&daily=sunrise,sunset&timezone=Asia%2FShanghai&forecast_days=1`,{cache:'no-store'});const j=await r.json();sunrise&&(sunrise.textContent=j.daily.sunrise[0].slice(11,16));sunset&&(sunset.textContent=j.daily.sunset[0].slice(11,16))}catch{sunrise&&(sunrise.textContent='--:--');sunset&&(sunset.textContent='--:--')}sunDate&&(sunDate.textContent=new Intl.DateTimeFormat(lang==='zh'?'zh-CN':'en-US',{dateStyle:'long'}).format(new Date()))}
  updateSun();document.addEventListener('languagechange',updateSun);

  const atlas=document.querySelector('[data-qinghai-atlas]');
  if(atlas)fetch('assets/media/qinghai/manifest.json').then(r=>r.json()).then(items=>{const groups={};items.forEach(item=>(groups[item.group]??=[]).push(item));atlas.innerHTML=Object.entries(groups).map(([group,entries])=>`<section class="atlas-group"><h3>${group}</h3><div class="atlas-rail">${entries.map(item=>`<figure class="atlas-card" data-lightbox="${item.image}" data-alt="${item.title}"><img loading="lazy" src="${item.thumb}" alt="${item.title}"><figcaption>${item.title}</figcaption></figure>`).join('')}</div></section>`).join('');atlas.querySelectorAll('[data-lightbox]').forEach(el=>el.addEventListener('click',()=>openLightbox(el.dataset.lightbox,el.dataset.alt)))}).catch(()=>{atlas.innerHTML='<p class="panel-copy">Gallery data is temporarily unavailable.</p>'});

  const canvas=document.querySelector('[data-earth-canvas]');
  if(canvas){const ctx=canvas.getContext('2d');let land=null,rotation=0;fetch('assets/geo/earth-land.geojson').then(r=>r.json()).then(j=>{land=j;requestAnimationFrame(draw)});const resize=()=>{const dpr=devicePixelRatio||1,size=Math.min(canvas.clientWidth||520,canvas.clientHeight||520);canvas.width=size*dpr;canvas.height=size*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);canvas._size=size};window.addEventListener('resize',resize);resize();
    const rad=x=>x*Math.PI/180;const point=(lon,lat,center,r)=>{const lo=rad(lon-center),la=rad(lat);const x=Math.cos(la)*Math.sin(lo),y=Math.sin(la),z=Math.cos(la)*Math.cos(lo);return {x:canvas._size/2+x*r,y:canvas._size/2-y*r,z}};
    const solar=()=>{const now=new Date(),day=(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate())-Date.UTC(now.getUTCFullYear(),0,0))/86400000;const decl=rad(-23.44)*Math.cos(rad((360/365)*(day+10)));const lon=12-(now.getUTCHours()+now.getUTCMinutes()/60)*15;return {lon,decl}};
    function draw(){const s=canvas._size||520,r=s*.42,cx=s/2,cy=s/2;ctx.clearRect(0,0,s,s);const g=ctx.createRadialGradient(cx-r*.25,cy-r*.28,0,cx,cy,r*1.1);g.addColorStop(0,'#2b6c9a');g.addColorStop(.58,'#0b2d46');g.addColorStop(1,'#01050a');ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.clip();
      const center=101.78+rotation*18;ctx.strokeStyle='rgba(99,197,255,.18)';ctx.lineWidth=1;for(let lat=-60;lat<=60;lat+=30){ctx.beginPath();for(let lon=-180;lon<=180;lon+=4){const p=point(lon,lat,center,r);if(p.z>0){if(lon===-180)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y)}}ctx.stroke()}for(let lon=-150;lon<=180;lon+=30){ctx.beginPath();for(let lat=-90;lat<=90;lat+=3){const p=point(lon,lat,center,r);if(p.z>0){if(lat===-90)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y)}}ctx.stroke()}
      if(land){ctx.fillStyle='rgba(126,184,129,.85)';ctx.strokeStyle='rgba(181,228,190,.28)';ctx.lineWidth=.7;land.features.forEach(f=>{const polys=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;polys.forEach(poly=>poly.forEach(coords=>{ctx.beginPath();let started=false;coords.forEach(c=>{const p=point(c[0],c[1],center,r);if(p.z>.03){if(!started){ctx.moveTo(p.x,p.y);started=true}else ctx.lineTo(p.x,p.y)}else if(started){ctx.stroke();ctx.beginPath();started=false}});if(started){ctx.closePath();ctx.fill();ctx.stroke()}}))})}
      const sol=solar();ctx.strokeStyle='rgba(255,218,120,.9)';ctx.lineWidth=2;ctx.beginPath();let started=false;for(let t=0;t<=Math.PI*2+.05;t+=.03){const sun={x:Math.cos(sol.decl)*Math.cos(rad(sol.lon)),y:Math.sin(sol.decl),z:Math.cos(sol.decl)*Math.sin(rad(sol.lon))};const u={x:-Math.sin(rad(sol.lon)),y:0,z:Math.cos(rad(sol.lon))};const v={x:-Math.sin(sol.decl)*Math.cos(rad(sol.lon)),y:Math.cos(sol.decl),z:-Math.sin(sol.decl)*Math.sin(rad(sol.lon))};const q={x:u.x*Math.cos(t)+v.x*Math.sin(t),y:u.y*Math.cos(t)+v.y*Math.sin(t),z:u.z*Math.cos(t)+v.z*Math.sin(t)};const p=point(Math.atan2(q.z,q.x)/Math.PI*180,Math.asin(q.y)*180/Math.PI,center,r);if(p.z>0){if(!started){ctx.moveTo(p.x,p.y);started=true}else ctx.lineTo(p.x,p.y)}}ctx.stroke();
      const marker=point(101.78,36.62,center,r);if(marker.z>0){ctx.fillStyle='#63c5ff';ctx.beginPath();ctx.arc(marker.x,marker.y,5,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(99,197,255,.6)';ctx.beginPath();ctx.arc(marker.x,marker.y,14+Math.sin(Date.now()/500)*3,0,Math.PI*2);ctx.stroke()}
      ctx.restore();ctx.strokeStyle='rgba(99,197,255,.3)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();rotation+=.0007;requestAnimationFrame(draw)} }

  const form=document.querySelector('[data-discussion-form]');form?.addEventListener('submit',e=>{e.preventDefault();const data=new FormData(form),name=(data.get('name')||'').toString().trim()|| (lang==='zh'?'匿名访客':'Anonymous visitor'),message=(data.get('message')||'').toString().trim();if(!message)return;const body=`${name}\n\n${message}`;location.href=`mailto:13997320897@163.com?subject=${encodeURIComponent(lang==='zh'?'主页留言':'Website message')}&body=${encodeURIComponent(body)}`});
})();
