import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','public');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.geojson':'application/json','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.pdf':'application/pdf','.mp4':'video/mp4','.dzi':'application/xml'};
const port=Number(process.env.PORT||8090);
http.createServer((req,res)=>{
  let rel;try{rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400);return res.end()}
  let file=path.resolve(root,'.'+rel);if(rel.endsWith('/'))file=path.join(file,'index.html');
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end('404')}
  const size=fs.statSync(file).size;
  res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');
  res.setHeader('Cache-Control','no-cache');
  res.setHeader('Accept-Ranges','bytes');
  const match=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
  let start=0,end=size-1;
  if(match){start=Number(match[1]);end=match[2]?Math.min(Number(match[2]),size-1):size-1;if(start>end){res.writeHead(416);return res.end()}res.statusCode=206;res.setHeader('Content-Range',`bytes ${start}-${end}/${size}`)}
  res.setHeader('Content-Length',end-start+1);
  if(req.method==='HEAD')return res.end();
  fs.createReadStream(file,{start,end}).pipe(res);
}).listen(port,'127.0.0.1',()=>console.log(`Preview: http://127.0.0.1:${port}/`));
