/* ═══════════════════════════════════════════════════════════════════════════
   YICHEN KONG — PERSONAL WEBSITE
   交互逻辑：i18n 语言系统、导航、滚动渐入、数字动画、滚动高亮
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── i18n 翻译字典 ─────────────────────────────────────────────────── */
  const I18N = {
    zh: {
      'lang.title': '选择语言',
      'lang.subtitle': '请选择您偏好的语言',
      'lang.zh': '中文',
      'lang.en': 'English',
      'nav.about': '关于',
      'nav.research': '研究',
      'nav.project': '项目',
      'nav.publications': '出版物',
      'nav.skills': '技能',
      'nav.contact': '联系',
      'hero.eyebrow': '独立研究 · 航空航天工程 · 大气科学',
      'hero.role': '17岁高中生 · 独立研究者 · 唯一发明人',
      'hero.tagline': '致力于智能自主控制可回收探空系统的跨学科研究，为全球高空探测与大气研究贡献新型解决方案。',
      'hero.cta.research': '查看研究',
      'hero.cta.cv': '下载简历',
      'scroll.hint': '向下滚动',
      'about.title': '关于',
      'about.lead': '本人长期热爱科研学习与工程应用，最新的独立研究成果建立在全球大气科学深化的背景下，传统一次性探空仪带来的海洋环境污染、数据传输受限及高昂的业务成本已成为行业瓶颈。',
      'about.p1': '作为一名17岁的高中学生，我致力于通过技术创新，将新型变体飞行器技术、远距离低功率通信技术、非线性全耦合控制算法、MBD 开发自主返航算法、新型材料与生产工艺跨学科融合，开发具备强可靠性、高精度、低成本、低生物威胁且环境友好的"智能自主控制可回收探空系统"，为全球高空探测与大气研究贡献新型解决方案。',
      'about.meta.affiliation': '所属机构',
      'about.affiliation': '西宁市第二中学',
      'about.meta.collab': '合作机构',
      'about.collab1': '沱沱河国家高空气象观测站',
      'about.collab2': '中国科学院空天信息创新研究院',
      'about.meta.interests': '研究领域',
      'about.interest1': '空天科技',
      'about.interest2': '飞行器气动与结构设计',
      'about.interest3': '自动化算法开发（MBD / 非线性控制）',
      'about.interest4': '高空气象探测',
      'about.interest5': '无线电通信（RF / SDR）',
      'stats.title': '关键数据',
      'stats.altitude': '高空测试高度',
      'stats.altitude-en': 'Flight Altitude',
      'stats.patent': '国家发明专利',
      'stats.patent-en': 'National Patent',
      'stats.flight': '沱沱河实地试飞',
      'stats.flight-en': 'Field Test Days',
      'stats.selfdev': '自主设计研发',
      'stats.selfdev-en': 'Self-Developed',
      'research.title': '研究经历',
      'research.item1.date': '2026.01 — 至今',
      'research.item1.role': '唯一发明人',
      'research.item1.org': '国家发明专利',
      'research.item1.desc': '独立研发的"智能自主控制可回收探空系统"及相关核心技术，已正式提交国家发明专利申请，目前正在实质审查阶段。',
      'research.item2.date': '2024.10 — 至今',
      'research.item2.role': '项目发起人 / 唯一发明人',
      'research.item2.org': '智能自主控制可回收探空系统（独立研究项目）',
      'research.item2.desc': '系统由通信链路、飞行器（含探空装置）、地面站及业务计算终端等多部分构成，通过标准 750g 高空气球搭载升空，飞行器在约 30000 米高空与气球分离后，以可变斜翼无动力滑翔实现远程精确回收。',
      'research.item3.date': '2026.07.19 — 07.22',
      'research.item3.role': '唯一试飞负责人',
      'research.item3.org': '沱沱河国家高空气象观测站与三江源',
      'research.item3.desc': '在沱沱河（海拔 4534.5 米，高寒、低压、强湍流环境）开展系统实测，验证装置在恶劣环境下的性能与稳定性。已联系中国科学院空天信息创新研究院、中国科学院大气物理研究所、格尔木市气象局、西宁市国家高空气象观测站、沱沱河国家高空气象观测站等单位审批空域，分别完成无人机低空搭载测试与 30000 米高空气球测试，验证了系统大部分功能。本人作为唯一试飞负责人，全程遵守国家相关法律法规与标准。',
      'project.title': '核心项目',
      'project.name': '智能自主控制可回收探空系统',
      'project.summary': '系统由通信链路、飞行器（含探空装置）、地面站及业务计算终端等多部分构成，通过标准 750g 高空气球搭载升空，飞行器在约 30000 米高空与气球分离后，以可变斜翼无动力滑翔实现远程精确回收。',
      'project.video.fallback': '您的浏览器不支持 HTML5 视频播放，请点击下载视频。',
      'project.media.note': '视频文件较大（约 43MB），加载可能需要一些时间。也可直接下载视频文件观看。',
      'project.cta.report': '下载研究报告 V4.1',
      'project.tech1.title': '气动布局',
      'project.tech1.title-en': 'Aerodynamics',
      'project.tech1.desc': '设计"变斜翼融合弹翼"气动布局，实现无操控面下的高效姿态调节。',
      'project.tech2.title': '仿真验证',
      'project.tech2.title-en': 'Simulation',
      'project.tech2.desc': 'Solidworks 参数化建模及 Xflow、Xflr5、ANSYS-Fluent/Star CCM 多尺度 CFD 仿真。',
      'project.tech3.title': '硬件设计',
      'project.tech3.title-en': 'Hardware',
      'project.tech3.desc': '自主设计车规级六层高频 PCB。',
      'project.tech4.title': '地面站',
      'project.tech4.title-en': 'Ground Station',
      'project.tech4.desc': '基于 MAVlink 协议开发地面站及内嵌 ISA 大气模型的业务计算终端。',
      'project.tech5.title': '制造工艺',
      'project.tech5.title-en': 'Manufacturing',
      'project.tech5.desc': 'CNC 加工 PMI 泡沫、FDM 打印 HT-PLA-GF、MJF 打印 PA11 等极端环境制造工艺。',
      'project.tech6.title': '飞控算法',
      'project.tech6.title-en': 'Flight Control',
      'project.tech6.desc': '基于 MBD 方法开发非线性全耦合飞控算法，应用自整定 PID 与总能量管理策略实现稳定自主返航。',
      'project.tech7.title': '通信链路',
      'project.tech7.title-en': 'Communications',
      'project.tech7.desc': '自研特高频 LoRa CSS 射频链路结合 12 单元八木天线，实现低功率超远程双向通信。',
      'publications.title': '出版物',
      'pub.title': '智能自主控制可回收探空系统及控制方法',
      'pub.authors': 'Kong, Y. (孔一宸)',
      'pub.meta': '国家发明专利 · 实质审查中 · 2026',
      'skills.title': '技能与认证',
      'skills.group1.title': '工程设计与制造',
      'skills.item1': '参数化建模与 CFD 仿真',
      'skills.item2': 'PCB 设计',
      'skills.item3': '射频通信与 SDR 无线电',
      'skills.item4': 'STM32 嵌入式架构',
      'skills.item5': 'MBD 自动化算法开发',
      'skills.item6': '前端开发',
      'skills.group2.title': '认证与执照',
      'skills.item7': '业余无线电台操作技术能力验证证书',
      'skills.item8': '跨省跨国无线电台执照',
      'contact.title': '联系',
      'contact.email': '邮箱',
      'contact.gmail': 'Gmail',
      'contact.phone': '电话',
      'contact.github': 'GitHub',
      'contact.bilibili': '哔哩哔哩',
      'contact.wechat': '微信',
      'contact.radio': '电台呼号',
      'footer.copyright': '© 2026 孔一宸 | Yichen Kong. 保留所有权利。',
      'footer.tag': '独立研究 · 航空航天工程 · 大气科学'
    },
    en: {
      'lang.title': 'Choose Your Language',
      'lang.subtitle': 'Select your preferred language',
      'lang.zh': '中文',
      'lang.en': 'English',
      'nav.about': 'About',
      'nav.research': 'Research',
      'nav.project': 'Project',
      'nav.publications': 'Publications',
      'nav.skills': 'Skills',
      'nav.contact': 'Contact',
      'hero.eyebrow': 'Independent Research · Aerospace Engineering · Atmospheric Science',
      'hero.role': '17-year-old High School Student · Independent Researcher · Sole Inventor',
      'hero.tagline': 'Dedicated to interdisciplinary research on an Intelligent Autonomous Recoverable Sounding System, contributing novel solutions to global high-altitude sounding and atmospheric research.',
      'hero.cta.research': 'View Research',
      'hero.cta.cv': 'Download CV',
      'scroll.hint': 'Scroll Down',
      'about.title': 'About',
      'about.lead': 'Driven by a sustained passion for scientific research and engineering practice, my most recent independent research addresses a pressing bottleneck in global atmospheric science: the environmental pollution caused by conventional single-use radiosondes, together with their limited data transmission range and high operational costs, has become a critical constraint on the field.',
      'about.p1': 'As a 17-year-old high school student, I have dedicated myself to technological innovation, integrating novel variant-configuration aircraft design, long-range low-power communication, nonlinear fully-coupled control algorithms, model-based development (MBD) for autonomous return-flight algorithms, and advances in materials and manufacturing processes across disciplines. Through this interdisciplinary synthesis, I have developed an "Intelligent Autonomous Recoverable Sounding System" characterized by strong reliability, high precision, low cost, minimal biological hazard, and environmental sustainability.',
      'about.meta.affiliation': 'Affiliation',
      'about.affiliation': 'Xining No. 2 Middle School',
      'about.meta.collab': 'Collaboration',
      'about.collab1': 'Tuotuo River National High-Altitude Meteorological Station',
      'about.collab2': 'Aerospace Information Research Institute, CAS',
      'about.meta.interests': 'Research Interests',
      'about.interest1': 'Aerospace Technology',
      'about.interest2': 'Aircraft Aerodynamics & Structural Design',
      'about.interest3': 'Automation Algorithm Development (MBD / Nonlinear Control)',
      'about.interest4': 'High-Altitude Atmospheric Sounding',
      'about.interest5': 'Radio Communications (RF / SDR)',
      'stats.title': 'Key Metrics',
      'stats.altitude': 'Flight Altitude',
      'stats.altitude-en': '高空测试高度',
      'stats.patent': 'National Patent',
      'stats.patent-en': '国家发明专利',
      'stats.flight': 'Field Test Days',
      'stats.flight-en': '沱沱河实地试飞',
      'stats.selfdev': 'Self-Developed',
      'stats.selfdev-en': '自主设计研发',
      'research.title': 'Research',
      'research.item1.date': '2026.01 — Present',
      'research.item1.role': 'Sole Inventor',
      'research.item1.org': 'National Invention Patent',
      'research.item1.desc': 'The independently developed "Intelligent Autonomous Recoverable Sounding System" and related core technologies have been officially submitted for a National Invention Patent and are currently under substantive examination.',
      'research.item2.date': '2024.10 — Present',
      'research.item2.role': 'Project Founder / Sole Inventor',
      'research.item2.org': 'Intelligent Autonomous Recoverable Sounding System (Independent Research Project)',
      'research.item2.desc': 'The system integrates a communications link, a flight vehicle (including the sounding payload), a ground station, and an operational computing terminal. Launched via a standard 750g high-altitude balloon, the vehicle separates from the balloon at approximately 30,000m and executes precise long-range recovery through unpowered gliding with a variable-sweep wing.',
      'research.item3.date': '2026.07.19 — 07.22',
      'research.item3.role': 'Sole Flight Test Director',
      'research.item3.org': 'Tuotuo River National High-Altitude Meteorological Station & Sanjiangyuan',
      'research.item3.desc': 'Conducted field tests of the system at the Tuotuo River station (4,534m altitude; extreme cold, low pressure, and strong turbulence) to validate performance and reliability under harsh environmental conditions. Secured airspace approvals from the Aerospace Information Research Institute (CAS), the Institute of Atmospheric Physics (CAS), the Golmud Meteorological Bureau, the Xining National High-Altitude Meteorological Station, and the Tuotuo River National High-Altitude Meteorological Station. Completed both a drone-assisted low-altitude payload test and a 30,000m high-altitude balloon test, validating the majority of system functions. Served as the sole flight test director throughout, in strict compliance with relevant national laws and standards.',
      'project.title': 'Core Project',
      'project.name': 'Intelligent Autonomous Recoverable Sounding System',
      'project.summary': 'The system integrates a communications link, a flight vehicle (including the sounding payload), a ground station, and an operational computing terminal. Launched via a standard 750g high-altitude balloon, the vehicle separates from the balloon at approximately 30,000m and executes precise long-range recovery through unpowered gliding with a variable-sweep wing.',
      'project.video.fallback': 'Your browser does not support HTML5 video playback. Please download the video instead.',
      'project.media.note': 'The video file is large (approx. 43MB) and may take time to load. You can also download the video file directly.',
      'project.cta.report': 'Download Research Report V4.1',
      'project.tech1.title': 'Aerodynamics',
      'project.tech1.title-en': '气动布局',
      'project.tech1.desc': 'Designed a "variable-sweep blended wing" aerodynamic configuration enabling efficient attitude control without control surfaces.',
      'project.tech2.title': 'Simulation',
      'project.tech2.title-en': '仿真验证',
      'project.tech2.desc': 'Solidworks parametric modeling with multi-scale CFD simulation using Xflow, Xflr5, and ANSYS-Fluent/Star CCM.',
      'project.tech3.title': 'Hardware',
      'project.tech3.title-en': '硬件设计',
      'project.tech3.desc': 'Self-designed automotive-grade six-layer high-frequency PCB.',
      'project.tech4.title': 'Ground Station',
      'project.tech4.title-en': '地面站',
      'project.tech4.desc': 'Developed a ground station based on the MAVlink protocol with an embedded ISA atmospheric model operational computing terminal.',
      'project.tech5.title': 'Manufacturing',
      'project.tech5.title-en': '制造工艺',
      'project.tech5.desc': 'Extreme-environment manufacturing processes: CNC-machined PMI foam, FDM-printed HT-PLA-GF, and MJF-printed PA11.',
      'project.tech6.title': 'Flight Control',
      'project.tech6.title-en': '飞控算法',
      'project.tech6.desc': 'Developed a nonlinear fully-coupled flight control algorithm using MBD methods, applying self-tuning PID and total energy management strategies for stable autonomous return flight.',
      'project.tech7.title': 'Communications',
      'project.tech7.title-en': '通信链路',
      'project.tech7.desc': 'Self-developed UHF LoRa CSS RF link combined with a 12-element Yagi antenna for low-power ultra-long-range bidirectional communication.',
      'publications.title': 'Publications',
      'pub.title': 'Intelligent Autonomous Recoverable Sounding System and Control Method',
      'pub.authors': 'Kong, Y. (孔一宸)',
      'pub.meta': 'National Invention Patent · Under Substantive Examination · 2026',
      'skills.title': 'Skills & Certifications',
      'skills.group1.title': 'Engineering Design & Manufacturing',
      'skills.item1': 'Parametric Modeling & CFD Simulation',
      'skills.item2': 'PCB Design',
      'skills.item3': 'RF Communications & SDR',
      'skills.item4': 'STM32 Embedded Architecture',
      'skills.item5': 'MBD Algorithm Development',
      'skills.item6': 'Front-End Development',
      'skills.group2.title': 'Certifications & Licenses',
      'skills.item7': 'Amateur Radio Operator Certificate',
      'skills.item8': 'Cross-Provincial/International Radio Station License',
      'contact.title': 'Contact',
      'contact.email': 'Email',
      'contact.gmail': 'Gmail',
      'contact.phone': 'Phone',
      'contact.github': 'GitHub',
      'contact.bilibili': 'Bilibili',
      'contact.wechat': 'WeChat',
      'contact.radio': 'Radio Call Sign',
      'footer.copyright': '© 2026 Yichen Kong. All rights reserved.',
      'footer.tag': 'Independent Research · Aerospace Engineering · Atmospheric Science'
    }
  };

  const STORAGE_KEY = 'yk-lang';
  const DEFAULT_LANG = 'zh';

  /* ── 语言系统 ─────────────────────────────────────────────────────── */
  const langOverlay = document.getElementById('langOverlay');
  const langSwitch = document.getElementById('langSwitch');
  const htmlEl = document.documentElement;

  function getStoredLang() {
    try {
      return localStorage.getItem(STORAGE_KEY) || null;
    } catch (e) {
      return null;
    }
  }

  function setStoredLang(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      /* ignore */
    }
  }

  function applyLang(lang) {
    const dict = I18N[lang] || I18N[DEFAULT_LANG];
    htmlEl.setAttribute('lang', lang === 'zh' ? 'zh-CN' : 'en');
    htmlEl.setAttribute('data-lang', lang);

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });

    // 更新页面标题
    if (lang === 'en') {
      document.title = 'Yichen Kong — Independent Researcher';
    } else {
      document.title = '孔一宸 | Yichen Kong — Independent Researcher';
    }
  }

  function switchLang(lang) {
    applyLang(lang);
    setStoredLang(lang);
    langOverlay.classList.remove('active');
    langOverlay.setAttribute('aria-hidden', 'true');
  }

  // 首次进入：显示语言选择
  const stored = getStoredLang();
  if (stored) {
    applyLang(stored);
  } else {
    langOverlay.classList.add('active');
    langOverlay.setAttribute('aria-hidden', 'false');
  }

  // Overlay 语言选择按钮
  document.querySelectorAll('.lang-option').forEach(function (btn) {
    btn.addEventListener('click', function () {
      switchLang(btn.getAttribute('data-lang'));
    });
  });

  // 导航栏语言切换
  langSwitch.addEventListener('click', function () {
    const current = htmlEl.getAttribute('data-lang') || DEFAULT_LANG;
    switchLang(current === 'zh' ? 'en' : 'zh');
  });

  /* ── 导航栏滚动状态 ─────────────────────────────────────────────────── */
  const nav = document.getElementById('siteNav');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  function onScrollNav() {
    if (window.scrollY > 10) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  /* ── 移动端菜单 ─────────────────────────────────────────────────────── */
  navToggle.addEventListener('click', function () {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // 点击链接后关闭移动端菜单
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ── 滚动渐入动画 ───────────────────────────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // 降级：直接显示
    revealEls.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* ── 数字滚动动画 ───────────────────────────────────────────────────── */
  const statNums = document.querySelectorAll('.stat-num');

  function animateNumber(el) {
    const target = parseInt(el.dataset.count, 10) || 0;
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();

    function format(n) {
      return n.toLocaleString('en-US');
    }

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const value = Math.round(target * eased);
      el.textContent = format(value) + suffix;
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  if ('IntersectionObserver' in window) {
    const statObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateNumber(entry.target);
            statObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    statNums.forEach(function (el) {
      statObserver.observe(el);
    });
  } else {
    statNums.forEach(function (el) {
      const target = parseInt(el.dataset.count, 10) || 0;
      el.textContent = target.toLocaleString('en-US') + (el.dataset.suffix || '');
    });
  }

  /* ── 滚动高亮当前区块 ───────────────────────────────────────────────── */
  const sections = document.querySelectorAll('section[id], header[id]');
  const navLinkEls = document.querySelectorAll('.nav-link');

  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinkEls.forEach(function (link) {
              link.classList.toggle('active', link.getAttribute('href') === '#' + id);
            });
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }
})();