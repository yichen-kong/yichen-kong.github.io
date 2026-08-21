---
# Leave the homepage title empty to use the site title
title: ''
summary: ''
date: 2022-10-24
type: landing

sections:
  - block: resume-biography-3
    content:
      username: me
      # NASA/SpaceX 风格：深色背景、白字、无 emoji、无彩色按钮
      text: |
        <div class="hero-stats">
          <div class="stat-item"><span class="stat-value">30,000m</span><span class="stat-label">高空测试高度 | Flight Altitude</span></div>
          <div class="stat-item"><span class="stat-value">1</span><span class="stat-label">国家发明专利 | National Patent</span></div>
          <div class="stat-item"><span class="stat-value">4</span><span class="stat-label">天沱沱河实地试飞 | Field Test Days</span></div>
          <div class="stat-item"><span class="stat-value">100%</span><span class="stat-label">自主设计研发 | Self-Developed</span></div>
        </div>

        本人长期热爱科研学习与工程应用，最新的独立研究成果建立在全球大气科学深化的背景下，传统一次性探空仪带来的海洋环境污染、数据传输受限及高昂的业务成本已成为行业瓶颈。作为一名17岁的高中学生，我致力于通过技术创新，将新型变体飞行器技术、远距离低功率通信技术、非线性全耦合控制算法、MBD 开发自主返航算法、新型材料与生产工艺跨学科融合，开发具备强可靠性、高精度、低成本、低生物威胁且环境友好的"智能自主控制可回收探空系统"，为全球高空探测与大气研究贡献新型解决方案。

        Driven by a sustained passion for scientific research and engineering practice, my most recent independent research addresses a pressing bottleneck in global atmospheric science: as atmospheric research deepens worldwide, the environmental pollution caused by conventional single-use radiosondes, together with their limited data transmission range and high operational costs, has become a critical constraint on the field. As a 17-year-old high school student, I have dedicated myself to technological innovation, integrating novel variant-configuration aircraft design, long-range low-power communication, nonlinear fully-coupled control algorithms, model-based development (MBD) for autonomous return-flight algorithms, and advances in materials and manufacturing processes across disciplines. Through this interdisciplinary synthesis, I have developed an "Intelligent Autonomous Recoverable Sounding System" characterized by strong reliability, high precision, low cost, minimal biological hazard, and environmental sustainability.

        <div class="btn-group">
          <a href="uploads/resume.pdf" target="_blank" class="btn-outline">下载中文简历 | Download CV (中文)</a>
          <a href="uploads/resume_en.pdf" target="_blank" class="btn-outline">Download English CV</a>
        </div>

        ![个人照片](uploads/photo.jpg)

        <br><br>

        <h2 class="section-title">项目视频 | Project Video</h2>

        <video controls preload="metadata" class="project-video">
          <source src="/uploads/project-video.mp4" type="video/mp4">
          您的浏览器不支持 HTML5 视频播放，请 <a href="/uploads/project-video.mp4" target="_blank">点击下载视频</a>。
        </video>

        <div class="btn-group">
          <a href="/uploads/research-report.pdf" target="_blank" class="btn-outline">下载研究报告 V4.1 | Research Report</a>
          <a href="/projects/sounding-system/" class="btn-outline">查看项目详情 | Project Details</a>
        </div>

        <br><br>

        about: ''
        education: ''
        interests: ''
    design:
      background:
        gradient_mesh:
          enable: false
      name:
        size: md
      avatar:
        size: medium
        shape: circle

  - block: experience
    content:
      title: '研究经历 | Research Experience'
      username: me

  - block: collection
    content:
      title: '精选项目 | Selected Projects'
      text: '我的核心研究项目：智能自主控制可回收探空系统。'
      filters:
        folders:
          - projects
    design:
      view: article-grid
      fill_image: false
      columns: 3
      show_date: false
      show_read_time: false
      show_read_more: false

  - block: skills
    content:
      title: '技能与认证 | Skills & Certifications'
      username: me
---
