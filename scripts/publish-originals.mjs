// One-time local operation: upload unmodified originals to a separate GitHub Release.
// Git credentials remain in memory; no token is written to disk or browser code.
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const root=new URL('../',import.meta.url);
const manifest=JSON.parse(fs.readFileSync(new URL('docs/media-manifest.json',root),'utf8'));
const result=spawnSync('git',['credential','fill'],{input:'protocol=https\nhost=github.com\n\n',encoding:'utf8',env:{...process.env,GIT_TERMINAL_PROMPT:'0'},timeout:15000});
const credentials=Object.fromEntries(result.stdout.split(/\r?\n/).filter(l=>l.includes('=')).map(l=>[l.slice(0,l.indexOf('=')),l.slice(l.indexOf('=')+1)]));
if(!credentials.password)throw Error('GitHub credentials unavailable');
const headers={Authorization:`Bearer ${credentials.password}`,'User-Agent':'yichen-site-media','Accept':'application/vnd.github+json'};
const api='https://api.github.com/repos/yichen-kong/yichen-kong.github.io';
async function request(url,options={}){
  const r=await fetch(url,{...options,headers:{...headers,...options.headers},signal:AbortSignal.timeout(240000)});
  const text=await r.text(); let j;
  try{j=JSON.parse(text)}catch{throw Error(`${r.status} empty/non-JSON response from ${new URL(url).hostname}`)}
  if(!r.ok)throw Error(`${r.status} ${j.message||r.statusText}`);
  return j;
}
let release;
try{release=await request(`${api}/releases/tags/${manifest.releaseTag}`)}
catch(e){if(!String(e).includes('404'))throw e;
 release=await request(`${api}/releases`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
 tag_name:manifest.releaseTag,target_commitish:'main',name:'原始影像 / Original photographs',
 body:'本站照片原文件，未经压缩或重编码。网页使用轻量预览；“查看原图”链接在此下载原始字节。\n\nUnmodified original photographs. The website loads optimized previews; original-file links point to these assets. Photography by Yichen Kong.',
 draft:false,prerelease:false,make_latest:'false'
 })});
}
const existing=new Map((await request(`${api}/releases/${release.id}/assets?per_page=100`)).map(a=>[a.name,a]));
const uploads=manifest.releaseUploads.filter(u=>u.kind==='gallery');
// Include original project video separately, not the preview derivative.
const videoPath=new URL('video.mp4',root);
if(fs.existsSync(videoPath)){
 const p=fs.realpathSync(videoPath);
 uploads.push({id:'project-video-original',assetName:'project-video-original.mp4',sourceLocal:p,size:fs.statSync(p).size,kind:'video'});
}
const receipts=[];
let cursor=0;
async function worker(){
 while(cursor<uploads.length){
  const u=uploads[cursor++];
  const stat=fs.statSync(u.sourceLocal);
  if(stat.size!==u.size)throw Error(`Source changed: ${u.id}`);
  const hash=createHash('sha256');for await(const b of fs.createReadStream(u.sourceLocal))hash.update(b);
  const sha=hash.digest('hex');
  if(u.sha256&&sha!==u.sha256)throw Error(`Hash mismatch: ${u.id}`);
  let a=existing.get(u.assetName);
  if(a&&a.size!==u.size)throw Error(`Existing remote asset differs: ${u.assetName}`);
  if(!a){
   let last;
   for(let attempt=0;attempt<3;attempt++){
    try{
      a=await request(`${release.upload_url.split('{')[0]}?name=${encodeURIComponent(u.assetName)}`,{
        method:'POST',headers:{'Content-Type':u.kind==='video'?'video/mp4':'image/jpeg','Content-Length':String(u.size)},
        body:fs.createReadStream(u.sourceLocal),duplex:'half'
      });last=null;break;
    }catch(e){last=e;await new Promise(r=>setTimeout(r,2000*(attempt+1)));}
   }
   if(last)throw last;
  }
  receipts.push({id:u.id,name:u.assetName,url:a.browser_download_url,size:a.size,sha256:sha});
  fs.mkdirSync(new URL('content/',root),{recursive:true});
  fs.writeFileSync(new URL('content/originals-receipts.json',root),JSON.stringify({release:release.html_url,files:receipts},null,2)+'\n');
  console.log(`VERIFIED ${u.assetName} ${a.size} bytes`);
 }
}
await Promise.all([worker(),worker()]);
console.log(`Originals available: ${receipts.length}; total bytes ${receipts.reduce((n,r)=>n+r.size,0)}`);
