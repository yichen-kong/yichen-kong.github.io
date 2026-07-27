---
# Leave the homepage title empty to use the site title
title: ''
summary: ''
date: 2022-10-24
type: landing

sections:
  - block: resume-biography-3
    content:
      # Choose a user profile to display (a folder name within `content/authors/`)
      username: me
      # 在按钮上方利用文本区域巧妙加入英文简历下载链接，绝不报错
      text: '### [👉 Click here to download English Resume (PDF)](uploads/resume_en.pdf)'
      # Show a call-to-action button under your biography? (optional)
      button:
        text: 📄 下载中文简历 (Download CV)
        url: uploads/resume.pdf
      headings:
        about: ''
        education: ''
        interests: ''
    design:
      # Use the new Gradient Mesh which automatically adapts to the selected theme colors
      background:
        gradient_mesh:
          enable: true

      # Name heading sizing to accommodate long or short names
      name:
        size: md # Options: xs, sm, md, lg (default), xl

      # Avatar customization
      avatar:
        size: medium # Options: small (150px), medium (200px, default), large (320px), xl (400px), xxl (500px)
        shape: circle # Options: circle (default), square, rounded

  - block: experience
    content:
      title: '研究经历 | Projects & Experience'
      username: me
      
  - block: skills
    content:
      title: '技能与认证 | Skills & Certifications'
      username: me
---
