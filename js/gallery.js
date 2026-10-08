let galleryData;
const lang=()=>document.documentElement.dataset.lang==='en'?'en':'zh';
function loadCSS(){
  if(document.querySelector('link[data-photoswipe]'))return;
  const link=document.createElement('link');link.rel='stylesheet';link.href='assets/vendor/gallery/photoswipe.css';link.dataset.photoswipe='';document.head.append(link);
}
async function data(){
  galleryData??=fetch('assets/data/gallery.json').then(r=>{if(!r.ok)throw Error('Gallery metadata');return r.json()});
  return galleryData;
}
export async function openGallery(clicked){
  loadCSS();
  const [{default:PhotoSwipe},manifest]=await Promise.all([import('../assets/vendor/gallery/photoswipe.esm.min.js'),data()]);
  const links=[...document.querySelectorAll('[data-gallery-image]')];
  const dataSource=links.map(link=>{
    const img=link.querySelector('img');
    const item=manifest.items.find(i=>i.id===link.dataset.galleryId);
    return {src:link.href,width:item?.previews.at(-1).width||img.naturalWidth||Number(link.dataset.width),height:item?.previews.at(-1).height||img.naturalHeight||Number(link.dataset.height),alt:img.alt,item,link};
  });
  const zh=lang()==='zh';
  const pswp=new PhotoSwipe({
    dataSource,index:links.indexOf(clicked),bgOpacity:.98,showHideAnimationType:'fade',
    closeTitle:zh?'关闭':'Close',zoomTitle:zh?'缩放':'Zoom',arrowPrevTitle:zh?'上一张':'Previous',arrowNextTitle:zh?'下一张':'Next',errorMsg:zh?'图片加载失败，请尝试打开原图。':'Image failed to load. Please try the original file.',
    initialZoomLevel:'fit',secondaryZoomLevel:2,maxZoomLevel:4,
  });
  let original,caption;
  function refresh(){
    const current=dataSource[pswp.currIndex];
    if(original){
      original.hidden=!current.item;
      if(current.item){original.href=current.item.original.url;original.textContent=(zh?'查看原图':'View original')+' · '+(current.item.original.bytes/1048576).toFixed(1)+' MB ↗'}
    }
    if(caption)caption.textContent=current.item?current.item.title[lang()]+(zh?' · 拍摄：孔一宸':' · Photography: Yichen Kong'):current.alt;
  }
  pswp.on('uiRegister',()=>{
    pswp.ui.registerElement({name:'original',order:8,isButton:false,tagName:'a',className:'pswp-original-link',appendTo:'bar',onInit:el=>{original=el;el.target='_blank';el.rel='noopener noreferrer';refresh()}});
    pswp.ui.registerElement({name:'caption',order:9,isButton:false,appendTo:'root',onInit:el=>{caption=el;el.className='pswp-caption';refresh()}});
  });
  pswp.on('change',refresh);
  pswp.on('destroy',()=>clicked.focus({preventScroll:true}));
  pswp.init();
}
let viewer,osdPromise;
function loadOSD(){
  if(window.OpenSeadragon)return Promise.resolve();
  osdPromise??=new Promise((resolve,reject)=>{
    const script=document.createElement('script');script.src='assets/vendor/gallery/openseadragon.min.js';script.onload=resolve;script.onerror=reject;document.head.append(script);
  });
  return osdPromise;
}
export async function openPanorama(){
  await loadOSD();
  if(viewer){viewer.viewport.goHome(true);return}
  viewer=window.OpenSeadragon({
    id:'panorama-viewer',tileSources:'assets/gallery/deepzoom/xining-panorama.dzi',
    showNavigationControl:false,showNavigator:true,navigatorPosition:'BOTTOM_RIGHT',
    navigatorSizeRatio:.15,visibilityRatio:.5,minZoomImageRatio:.9,
    maxZoomPixelRatio:2,animationTime:.4,gestureSettingsTouch:{pinchToZoom:true,flickEnabled:true},
    showFullPageControl:false,
  });
  document.querySelectorAll('[data-panorama]').forEach(button=>button.addEventListener('click',()=>{
    if(button.dataset.panorama==='home')viewer.viewport.goHome();
    else viewer.viewport.zoomBy(button.dataset.panorama==='in'?1.5:1/1.5);
    viewer.viewport.applyConstraints();
  }));
  document.addEventListener('panorama-closed',()=>{viewer?.setVisible(false)});
  document.getElementById('panorama-dialog').addEventListener('close',()=>viewer?.setVisible(false));
  viewer.setVisible(true);
}
