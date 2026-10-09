const root=document.documentElement;
const language=()=>root.dataset.lang==='en'?'en':'zh';
const say=(zh,en)=>language()==='zh'?zh:en;
const header=document.querySelector('.site-header');
const menu=document.querySelector('.site-menu');
const toggle=document.querySelector('.menu-toggle');
const mobile=matchMedia('(max-width:900px)');
const reduce=matchMedia('(prefers-reduced-motion:reduce)');
const main=document.querySelector('main');
const footer=document.querySelector('.site-footer');
let overlayReturnFocus=null;
function syncLanguage(){
  const lang=language();root.lang=lang==='en'?'en':'zh';
  document.title=document.body.dataset[lang==='en'?'titleEn':'titleZh'];
  for(const key of ['aria-label','alt','placeholder','title']){
    document.querySelectorAll(`[data-zh-${key}]`).forEach(el=>{
      el.setAttribute(key,el.getAttribute(`data-${lang}-${key}`));
    });
  }
  document.dispatchEvent(new CustomEvent('languagechange',{detail:lang}));
}
document.querySelector('[data-language-toggle]')?.addEventListener('click',()=>{
  root.dataset.lang=language()==='zh'?'en':'zh';
  try{localStorage.setItem('yk-lang',language())}catch{}
  const url=new URL(location.href);
  if(url.searchParams.has('lang')){url.searchParams.set('lang',language());history.replaceState(null,'',url)}
  syncLanguage();
});
syncLanguage();
function closeSubmenus(except=null){
  document.querySelectorAll('[data-nav-group]').forEach(group=>{
    if(group!==except){group.classList.remove('is-open');group.querySelector('button').setAttribute('aria-expanded','false');}
  });
}
function setMenu(open,restore=false){
  if(!mobile.matches)open=false;
  header?.classList.toggle('menu-open',open);
  header?.classList.remove('is-hidden');
  toggle?.setAttribute('aria-expanded',String(open));
  toggle?.setAttribute('aria-label',open?say('关闭导航菜单','Close navigation menu'):say('打开导航菜单','Open navigation menu'));
  document.body.classList.toggle('overlay-open',open||!!document.querySelector('dialog[open]'));
  if(main)main.inert=open;
  if(footer)footer.inert=open;
  if(!open)closeSubmenus();
  if(restore)toggle?.focus({preventScroll:true});
}
document.addEventListener('languagechange',()=>{
  toggle?.setAttribute('aria-label',header?.classList.contains('menu-open')?say('关闭导航菜单','Close navigation menu'):say('打开导航菜单','Open navigation menu'));
});
toggle?.addEventListener('click',()=>setMenu(!header.classList.contains('menu-open')));
mobile.addEventListener('change',()=>setMenu(false));
document.querySelectorAll('[data-nav-group]').forEach(group=>{
  const btn=group.querySelector('.nav-disclosure');
  const setOpen=open=>{closeSubmenus(open?group:null);group.classList.toggle('is-open',open);btn.setAttribute('aria-expanded',String(open));};
  btn.addEventListener('click',()=>setOpen(!group.classList.contains('is-open')));
  group.addEventListener('pointerenter',e=>{if(!mobile.matches&&e.pointerType==='mouse')setOpen(true)});
  group.addEventListener('pointerleave',e=>{if(!mobile.matches&&e.pointerType==='mouse')setOpen(false)});
  group.addEventListener('focusout',e=>{if(!group.contains(e.relatedTarget))setOpen(false)});
});
document.addEventListener('click',e=>{
  if(!e.target.closest('[data-nav-group]'))closeSubmenus();
});
menu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    if(header?.classList.contains('menu-open'))setMenu(false,true);
    else closeSubmenus();
  }
  if(e.key==='Tab'&&header?.classList.contains('menu-open')){
    const list=[...header.querySelectorAll('a,button')].filter(el=>el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden');
    if(e.shiftKey&&document.activeElement===list[0]){e.preventDefault();list.at(-1).focus()}
    if(!e.shiftKey&&document.activeElement===list.at(-1)){e.preventDefault();list[0].focus()}
  }
});
let last=scrollY,anchor=scrollY,frame=false,idle;
function onScroll(){
  const y=Math.max(0,scrollY),delta=y-last;
  header?.classList.toggle('is-solid',y>30);
  if(Math.abs(y-anchor)>8&&!header?.classList.contains('menu-open')){
    header?.classList.toggle('is-hidden',delta>0&&y>150&&!header.contains(document.activeElement));
    anchor=y;
  }
  last=y;frame=false;
}
window.addEventListener('scroll',()=>{
  if(!frame){frame=true;requestAnimationFrame(onScroll)}
  clearTimeout(idle);idle=setTimeout(()=>header?.classList.remove('is-hidden'),900);
},{passive:true});
onScroll();
header?.addEventListener('focusin',()=>header.classList.remove('is-hidden'));
header?.addEventListener('pointerenter',()=>header.classList.remove('is-hidden'));

// A fallback always leaves content readable. Re-entering a viewport replays the reveal.
if('IntersectionObserver' in window&&!reduce.matches){
  document.body.classList.add('motion-ready');
  const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting)entry.target.classList.add('is-visible');
    else entry.target.classList.remove('is-visible');
  }),{threshold:0,rootMargin:'-3% 0px -3% 0px'});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
  reduce.addEventListener('change',()=>{if(reduce.matches)document.body.classList.remove('motion-ready')});
}

document.querySelectorAll('[data-open-dialog]').forEach(button=>button.addEventListener('click',()=>{
  const dialog=document.getElementById(button.dataset.openDialog);
  if(!dialog)return;
  overlayReturnFocus=button;
  setMenu(false);
  dialog.showModal();
  document.body.classList.add('overlay-open');
}));
document.querySelectorAll('dialog').forEach(dialog=>{
  dialog.querySelectorAll('[data-close-dialog]').forEach(b=>b.addEventListener('click',()=>dialog.close()));
  dialog.addEventListener('click',e=>{
    if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}
  });
  dialog.addEventListener('close',()=>{
    document.body.classList.remove('overlay-open');
    overlayReturnFocus?.focus({preventScroll:true});
    if(dialog.id==='panorama-dialog')document.dispatchEvent(new Event('panorama-closed'));
  });
});
document.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',async()=>{
  const value=button.dataset.copy;let ok=false;
  try{await navigator.clipboard.writeText(value);ok=true}catch{
    const input=document.createElement('textarea');input.value=value;input.style.position='fixed';input.style.top='-100px';
    button.closest('dialog')?.append(input);input.select();try{ok=document.execCommand('copy')}catch{}input.remove();
  }
  const status=button.closest('dialog')?.querySelector('[role=status]');
  if(status)status.textContent=ok?say('已复制。打开微信 → 添加朋友 → 粘贴搜索。','Copied. Open WeChat → Add contacts → paste to search.'):say('请长按或选中上方号码手动复制。','Please select the number above and copy it manually.');
  button.focus();
}));

const cvTabs=[...document.querySelectorAll('[data-cv-tab]')];
function selectCV(lang,focus=false){
  cvTabs.forEach(tab=>{
    const selected=tab.dataset.cvTab===lang;
    tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;
    document.getElementById(tab.getAttribute('aria-controls')).hidden=!selected;
    if(selected&&focus)tab.focus();
  });
}
cvTabs.forEach(tab=>{
  tab.addEventListener('click',()=>selectCV(tab.dataset.cvTab));
  tab.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();selectCV(e.key==='Home'?'zh':e.key==='End'?'en':tab.dataset.cvTab==='zh'?'en':'zh',true)}});
});
if(cvTabs.length)selectCV(language());

let gallery;
document.querySelectorAll('[data-gallery-image]').forEach(link=>link.addEventListener('click',async e=>{
  e.preventDefault();
  try{
    gallery??=import('./gallery.js');
    const {openGallery}=await gallery; await openGallery(link);
  }catch{window.open(link.href,'_blank','noopener')}
}));
document.querySelectorAll('[data-open-panorama]').forEach(button=>button.addEventListener('click',async()=>{
  overlayReturnFocus=button;
  const dialog=document.getElementById('panorama-dialog');dialog.showModal();document.body.classList.add('overlay-open');
  try{const {openPanorama}=await import('./gallery.js');await openPanorama()}
  catch{const target=document.getElementById('panorama-viewer');target.textContent=say('全景加载失败，请使用下方原图链接。','Panorama failed to load. Use the original-file link below.')}
}));
function whenNear(element,callback){
  if(!('IntersectionObserver' in window)){callback();return}
  const io=new IntersectionObserver(entries=>{
    if(entries.some(e=>e.isIntersecting)){io.disconnect();callback()}
  },{rootMargin:'250px'});io.observe(element);
}
let earthModule;
document.querySelectorAll('[data-earth],[data-terrain]').forEach(container=>whenNear(container,async()=>{
  try{
    earthModule??=import('./earth.js');
    const module=await earthModule;
    container.replaceChildren();
    container.hasAttribute('data-earth')?module.initEarth(container):module.initTerrain(container);
  }catch{container.textContent=say('3D 视图暂不可用。下方地理介绍和图册仍可阅读。','The 3D view is unavailable. Geography notes and albums remain accessible.')}
}));
document.querySelectorAll('[data-discussion]').forEach(container=>whenNear(container,async()=>{
  try{const {initDiscussion}=await import('./discussion.js');initDiscussion(container)}
  catch{container.textContent=say('请点击上方链接，在 GitHub 阅读或发表留言。','Use the link above to read or post on GitHub.')}
}));
function utcClock(){
  document.querySelectorAll('[data-utc-time]').forEach(el=>el.textContent=new Date().toISOString().replace('T',' ').slice(0,19)+' UTC');
}
utcClock();if(document.querySelector('[data-utc-time]'))setInterval(utcClock,1000);
