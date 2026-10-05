# Yichen Kong personal research site

这是一个无构建工具的静态个人主页，使用 HTML、CSS、JavaScript 和 GitHub Pages 部署。整体采用克制的黑 / 白 / 蓝三色、全屏大幅内容、二级页面和滚动动效。

## 本地目录

```text
index.html                         主页：概括、研究项目、荣誉入口、青海、联系方式
research.html                      研究项目总览
project-recoverable-sounding.html 可回收探空系统详情
project-sounding-calculator.html  高空探空计算网页详情
awards.html                        荣誉与获奖图片（点击图片放大）
field-tests.html                   试飞与合规详情
qinghai.html                       青海与每日日出日落
 documents.html                    中英文简历与研究资料下载
css/style.css                      全站视觉和响应式布局
js/main.js                         中英文切换、导航、滚动动画、灯箱、日出日落
assets/brand/logo.svg              透明背景矢量 LOGO
assets/img/hero-space.svg          主页深色科技背景
assets/docs/                      中英文研究报告、试飞计划和简历
assets/img/                        原有照片与获奖照片
assets/video/                      项目演示视频
.github/workflows/                 GitHub Pages 构建与部署
```

## 修改教程

### 修改文字

直接打开对应的 HTML 文件，中文放在 `.lang-zh` 中，英文放在 `.lang-en` 中。例如：

```html
<span class="lang-zh">中文标题</span>
<span class="lang-en">English title</span>
```

不要只改一个语言版本，否则切换后会出现中英文不对应。

### 修改图片和视频

把文件放到 `assets/img/` 或 `assets/video/`，然后在 HTML 中修改 `src` 或 `background-image`。主页背景目前是 `assets/img/hero-space.svg`；项目卡片使用 `assets/img/featured.jpg`。

### 修改 LOGO

导航栏和网站图标统一使用 `assets/brand/logo.svg`。这是透明背景的矢量文件，推荐用 Illustrator、Figma、Inkscape 或 VS Code 直接修改 SVG。原始图片保存在 `assets/brand/logo-source.jpg`。

### 修改下载资料

把新的 PDF 放入 `assets/docs/`，再在 `documents.html` 或项目详情页中修改 `href`。当前资料包括：

- `resume-zh.pdf` / `resume-en.pdf`
- `research-report-zh.pdf` / `research-report-en.pdf`
- `flight-test-plan-en.pdf`

### 修改项目链接

主页项目卡片在 `index.html` 的“研究项目”区域；导航二级菜单在每个 HTML 文件顶部的 `.nav-dropdown` 中。新增页面时，还要在 `.github/workflows/build.yml` 中确认 `cp -r *.html css js assets public/` 会将它复制到 Pages 构建目录。

## 本地预览

在仓库根目录运行：

```powershell
python -m http.server 8000
```

浏览器打开 `http://127.0.0.1:8000/`。不要直接双击 HTML 文件，因为部分浏览器会限制本地文件的视频、字体和跨域请求。

## 部署

提交并推送到 `main`：

```powershell
git add .
git commit -m "update personal research site"
git push origin main
```

GitHub Actions 会自动执行 `.github/workflows/deploy.yml`，将所有 HTML、CSS、JavaScript、图片、视频和 PDF 部署到 GitHub Pages。

## 日出日落数据

青海页面使用 Open-Meteo 的公开接口，以西宁附近坐标 `36.6171, 101.7782` 和 `Asia/Shanghai` 时区读取当天日出、日落；接口不可用时页面会显示 `--:--`，不会影响其他功能。


## ?????

???? `assets/img/hero-nasa.jpg` ?? NASA Image and Video Library ??????ISS ?????????????`assets/img/hero-space.svg` ????????????????
