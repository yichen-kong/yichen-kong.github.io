# Yichen Kong personal research site

静态 GitHub Pages 个人主页，采用黑 / 白 / 蓝三色和全屏叙事区块，页面结构参考 SpaceX 的“全屏视觉 + 极少文字 + 继续下滚”的信息节奏，但不复制其品牌、文案或素材。

## 页面结构

```text
index.html                         主页：个人简介、两个项目、荣誉、青海、联系、留言
project-recoverable-sounding.html 自主控制可回收探空系统详情
project-sounding-calculator.html  高空探空业务模拟计算网页详情
awards.html                        成果与荣誉
qinghai.html                       青海地图、地球晨昏线、青海画册
tuotuohe.html                      沱沱河试验地点与现场照片
documents.html                     中英文简历、研究报告、试飞计划
research.html                      项目总览
assets/media/                      用户提供的项目、荣誉、沱沱河照片和青海画册资源
assets/geo/earth-land.geojson      Natural Earth 陆地边界数据，用于旋转地球
```

## 图片策略

`D:\githubio\青海` 和 `D:\githubio\沱沱河` 中的原始照片保持不动。由于 GitHub 单文件和 Pages 加载限制，网页使用 `assets/media/qinghai/` 中的高质量网页版本和缩略图：

- 缩略图用于画册首屏和懒加载
- `view/` 用于点击后的大图
- 西宁全景单独生成 `assets/media/qinghai/panorama.jpg`
- 原始照片仍保留在本机源文件夹中，没有被覆盖或删除

## 留言与讨论说明

GitHub Pages 只能托管静态文件，无法安全保存公开的匿名留言，也不能把数据库密钥放进前端。当前“留言与讨论”表单支持匿名或署名填写，并生成发给站长的邮件；如果要做真正的公开讨论区，需要下一步配置 Giscus（GitHub Discussions）或 Supabase 等第三方后端。

## 本地预览

```powershell
cd D:\githubio\yichen-kong.github.io
node -e "const http=require('http'),fs=require('fs'),path=require('path');const root=process.cwd();http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';let f=path.join(root,u);if(!f.startsWith(root)||!fs.existsSync(f)){r.statusCode=404;return r.end('404')}r.setHeader('Content-Type','text/html;charset=utf-8');fs.createReadStream(f).pipe(r)}).listen(8000)"
```

打开 `http://127.0.0.1:8000/`。

## 部署

```powershell
git add .
git commit -m "update personal site"
git push origin main
```

`.github/workflows/deploy.yml` 会自动部署 HTML、CSS、JavaScript、图片、视频和 PDF。

## 数据和素材说明

- `assets/geo/earth-land.geojson` 使用 Natural Earth 的公开陆地边界数据，页面仅用于绘制地球背景和青海位置标记。
- 青海和沱沱河照片来自 `D:\githubio\青海`、`D:\githubio\沱沱河`，网页保留拍摄备注并生成了缩略图与高质量查看版本。
- 由于 GitHub 单文件大小限制和移动端性能，未把超过 100 MB 的原始全景文件直接提交到仓库；原始文件仍保留在本机源文件夹中。
- “留言与讨论”目前通过邮件草稿实现。要做公开、可持久化、支持匿名访问的讨论区，需要启用 GitHub Discussions 后接入 Giscus，或配置 Supabase 等后端服务。
