# Yichen Kong Personal Research Site

这是一个静态 GitHub Pages 个人主页，使用黑 / 白 / 蓝三色和全屏叙事区块。主页按照“个人身份 → 项目 → 成果 → 地理与试验 → 联系 → 讨论”的顺序组织；详情页再展开技术、图片和文件。

## 本地开发

需要 Node.js 22 或更高版本：

```powershell
npm run build
npm run dev
```

打开 `http://127.0.0.1:8090/`。

测试：

```powershell
npm test
```

当前地球、晨昏线、地形、照片元数据和讨论镜像测试全部通过。

## 目录

```text
content/site.mjs                 可维护的中英文站点内容与项目数据
content/gallery.json              摄影图册公共元数据
content/discussions.json          GitHub Discussions 静态镜像
scripts/build.mjs                 生成 23 个静态页面和 public/
scripts/prepare-media.py          原图不变，生成缩略图、WebP 和全景 DZI
scripts/prepare-covers.py         生成首屏、LOGO、项目和视频预览
scripts/sync-discussions.mjs      用 GITHUB_TOKEN 同步公开讨论
js/site.js                        导航、语言、动效、弹窗、地球和懒加载
js/earth.js                       Three.js 地球、晨昏线、真实高程地形
js/gallery.js                     照片放大和 Xining Deep Zoom 全景
css/site.css                      新版视觉系统和响应式布局
assets/covers/                    首屏和轻量预览
assets/gallery/                   图册 WebP 预览和全景分块
assets/earth/                     NASA Blue Marble、SRTM 高程和来源说明
assets/vendor/                    自托管 Three.js、PhotoSwipe、OpenSeadragon
```

## 页面

- `index.html`：个人主页、个人简介、两个项目、荣誉、青海、联系、留言
- `identity.html`：LOGO 与名称说明，来自 `我的LOGO.docx`
- `resume.html`：中英文简历页内预览和原始 PDF 下载
- `project-recoverable-sounding.html`：自主控制可回收探空系统，包含试验记录
- `project-sounding-calculator.html`：高空探空业务模拟计算网页
- `awards.html`：成果、荣誉和证书照片
- `qinghai.html`：地球定位、每日晨昏线、真实高程地形、青海画册
- `tuotuohe.html`：沱沱河试验地点和现场照片
- `discussion.html`：公开 GitHub Discussions 镜像

## 原图与发布策略

原始照片保留在本机源文件夹：

```text
D:\githubio\青海
D:\githubio\沱沱河
```

原始照片和原始视频没有被覆盖。由于 GitHub 单文件限制和移动端加载问题，网页默认使用轻量预览；未经重编码的原图和原视频已经放在 GitHub Release：

```text
media-originals-20261007
```

原图链接只在“查看原图”时打开，不会在首页自动下载。原始文件清单和 SHA-256 在本机私有文件中保存，不部署：

```text
D:\githubio\yichen-kong.github.io\docs\media-manifest.json
```

## 讨论功能

GitHub Discussions 已启用，主页讨论页展示同步快照并链接到真实讨论：

- 阅读：无需 GitHub 登录
- 发帖和回复：需要 GitHub 账号
- 不支持匿名公开发帖
- 同步任务每 6 小时运行一次，更新 `content/discussions.json`

这是 GitHub Pages 上不暴露数据库密钥的免费方案。若以后需要真正匿名发帖，需要另行配置 Supabase、Cloudflare Worker 等后端，并增加验证码、限流和审核。

## 部署

推送 `main` 后，GitHub Actions 会先运行：

```powershell
node scripts/build.mjs
```

再将 `public/` 部署到 GitHub Pages。讨论同步工作流会单独更新公开讨论镜像。

## 来源说明

- 地球：NASA Blue Marble，具体来源和许可说明见 `assets/earth/README.md`
- 地形：NASA/USGS SRTM v3，经 Open Topo Data 采样，来源和限制见 `assets/earth/README.md`
- 青海湖外部影像：NASA Earth Observatory / Allison Nussbaum / USGS Landsat，见 `sources.html`
- 沱沱河站排名使用青海省气象局公开材料，页面使用“全国第二高的探空站”，不写未经证实的“世界第二高”
