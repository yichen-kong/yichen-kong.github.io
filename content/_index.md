---
# Leave the homepage title empty to use the site title
title: ''
date: 2024-01-01
type: landing

sections:
  # 1. 个人简介区块
  - block: about.biography
    id: about
    content:
      title: ''
      username: me

  # 2. 蓝色大按钮区块（改造为你专属的简历下载）
  - block: markdown
    id: resume-download
    content:
      title: 📄 个人简历
      text: |
        欢迎来到我的个人主页！您可以点击下方按钮下载我的最新版完整简历。
      cta:
        url: /uploads/resume.pdf
        label: 下载中文简历 (Download CV)
    design:
      columns: '1'

  # 3. 研究经历区块 (Experience)
  - block: experience
    id: experience
    content:
      title: 研究经历 | Projects & Experience
      username: me
      
  # 4. 技能区块 (Skills) - 这个开关打开了！
  - block: skills
    id: skills
    content:
      title: 技能与认证 | Skills & Certifications
      username: me
    design:
      columns: '1'

  # 5. 荣誉与奖项区块 (Awards)
  - block: accomplishments
    id: awards
    content:
      title: 荣誉与奖项 | Awards & Honors
      username: me
---
