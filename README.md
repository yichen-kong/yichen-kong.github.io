# 孔一宸 | Yichen Kong — Personal Website

纯静态个人主页，NASA/SpaceX 风格设计语言，多层滚动叙事结构，中英双语内容。

## 技术架构

- **纯 HTML/CSS/JS**，无框架、无构建工具，零依赖
- 部署：GitHub Actions → GitHub Pages（`.github/workflows/`）

## 目录结构

```
├── index.html          # 主页面（多层滚动叙事）
├── css/style.css       # NASA 风格样式表
├── js/main.js          # 交互逻辑（滚动渐入、数字动画、导航高亮）
├── assets/
│   ├── video/          # 项目视频（压缩版 43MB）
│   ├── pdf/            # 研究报告、中英文简历
│   └── img/            # 封面帧、照片
└── .github/workflows/  # GitHub Actions 自动部署
```

## 本地预览

直接用浏览器打开 `index.html`，或运行：

```bash
python -m http.server 8000
```

然后访问 `http://localhost:8000`。

## 部署

推送到 `main` 分支后，GitHub Actions 自动构建并部署到 GitHub Pages。
