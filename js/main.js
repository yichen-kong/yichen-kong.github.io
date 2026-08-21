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
      'lang.subtitle': '请选择你偏好的语言',
      'lang.zh': '中文',
      'lang.en': 'English',
      'nav.about': '关于',
      'nav.awards': '获奖',
      'nav.research': '研究',
      'nav.project': '项目',
      'nav.publications': '专利',
      'nav.contact': '联系',
      'hero.eyebrow': '西宁市第二中学 · 第40届全国青创赛',
      'hero.role': '高中生 · 智能自主控制可回收探空系统发明人',
      'hero.tagline': '从青海西宁到沱沱河，从一张草图到三万米高空。做点有意思的东西，顺便解决一些问题。',
      'hero.cta.research': '了解我的研究',
      'hero.cta.cv': '下载简历',
      'scroll.hint': '向下',
      'about.title': '关于我',
      'about.lead': '我叫孔一宸，目前在西宁市第二中学读书。从小喜欢拆东西、装东西，后来慢慢开始自己做东西。对飞行器、无线电和自动控制这几个方向比较着迷，课余时间基本都花在这些上面了。',
      'about.p1': '2024年底开始，我独立设计了一套探空系统——用高空气球把飞行器带到三万米左右的高度，释放后靠无动力滑翔飞回来。整个过程涉及气动外形、飞控算法、通信链路和地面站，都是自己一点点啃出来的。2026年7月在沱沱河做了实地测试，系统跑通了大部分功能。目前这个方案已经申请了国家发明专利。',
      'about.meta.school': '就读学校',
      'about.school': '西宁市第二中学',
      'about.meta.collab': '合作单位',
      'about.collab1': '沱沱河国家高空气象观测站',
      'about.collab2': '中国科学院空天信息创新研究院',
      'about.photo.caption': '西宁二中 · 2026',
      'about.meta.interests': '折腾的方向',
      'about.interest1': '飞行器气动与结构',
      'about.interest2': '非线性飞控算法',
      'about.interest3': '射频通信与 SDR',
      'about.interest4': '高空气象探测',
      'about.interest5': '嵌入式系统',
      'about.meta.languages': '语言',
      'about.lang1': '中文（母语）',
      'about.lang2': '英语（学术读写）',
      'awards.title': '获奖',
      'awards.intro': '第40届全国青少年科技创新大赛（2025）',
      'awards.award1': '中国科协主席奖',
      'awards.award1.detail': '大赛最高奖项，由中国科学院院长、中国科协主席亲自颁发',
      'awards.award2': '格科专项奖',
      'awards.award2.detail': '表彰在工程技术领域具有突出创新价值的项目',
      'awards.award3': '周培源科技创新奖',
      'awards.award3.detail': '以著名物理学家周培源先生命名，鼓励青少年投身科学研究',
      'awards.award4': '茅以升科学技术奖',
      'awards.award4.detail': '全国青少年科技创新奖，纪念桥梁工程先驱茅以升先生',
      'awards.award5': '突尼斯未来科学技术协会卓越奖',
      'awards.award5.detail': '国际专项奖，由突尼斯未来科学技术协会颁发',
      'awards.award6': '"未来星"青少年汽车工程启迪奖',
      'awards.award6.detail': '面向未来工程人才的专项激励',
      'awards.award7': '"空天少年"航空科创探新筑梦奖',
      'awards.award7.detail': '鼓励青少年在航空航天领域的创新探索',
      'awards.award8': '建大知行奖',
      'awards.award8.detail': '表彰理论与实践相结合的优秀项目',
      'stats.title': '一些数字',
      'stats.altitude': '设计飞行高度',
      'stats.altitude-en': 'Design Altitude',
      'stats.patent': '国家发明专利',
      'stats.patent-en': 'Patent Pending',
      'stats.flight': '沱沱河试飞天数',
      'stats.flight-en': 'Field Test Days',
      'stats.awards': '全国青创赛获奖',
      'stats.awards-en': 'CASTIC Awards',
      'research.title': '研究经历',
      'research.item1.date': '2026.07.19 — 07.22',
      'research.item1.role': '试飞负责人',
      'research.item1.org': '沱沱河国家高空气象观测站 · 三江源',
      'research.item1.desc': '在海拔4534米的沱沱河完成系统实地测试。高寒、低压、强湍流——条件不算友好，但系统扛住了。先后做了无人机低空搭载测试和30000米高空气球测试，验证了大部分设计功能。全程一个人负责，按规定申请了空域审批。',
      'research.item2.date': '2026.01 — 至今',
      'research.item2.role': '发明人',
      'research.item2.org': '国家发明专利申请',
      'research.item2.desc': '提交了"智能自主控制可回收探空系统及控制方法"的发明专利申请，目前正在实质审查中。',
      'research.item3.date': '2024.10 — 至今',
      'research.item3.role': '项目发起人',
      'research.item3.org': '智能自主控制可回收探空系统',
      'research.item3.desc': '从零开始搭建整套系统：通信链路、飞行器（含探空装置）、地面站、业务计算终端。用标准750g气球带到高空，分离后靠可变斜翼无动力滑翔飞回来。气动、飞控、通信、结构——每个部分都是自己设计、自己测试、自己迭代。',
      'project.title': '项目',
      'project.name': '智能自主控制可回收探空系统',
      'project.summary': '一套完整的探空解决方案：气球搭载升空 → 高空分离 → 变斜翼无动力滑翔 → 精确回收。目标是替代传统一次性探空仪，减少海洋污染，降低业务成本。',
      'project.video.fallback': '浏览器不支持视频播放，请下载观看。',
      'project.media.note': '视频约43MB，加载可能需要一点时间。',
      'project.cta.report': '下载研究报告 (V4.1)',
      'project.tech1.title': '气动布局',
      'project.tech1.title-en': 'Aerodynamics',
      'project.tech1.desc': '变斜翼融合弹翼构型，无传统舵面，靠翼面变形调节姿态。',
      'project.tech2.title': '仿真',
      'project.tech2.title-en': 'Simulation',
      'project.tech2.desc': 'Solidworks 参数化建模，Xflow / Xflr5 / ANSYS Fluent / Star CCM 多尺度 CFD。',
      'project.tech3.title': '硬件',
      'project.tech3.title-en': 'Hardware',
      'project.tech3.desc': '自己画的车规级六层高频 PCB，STM32 做主控。',
      'project.tech4.title': '地面站',
      'project.tech4.title-en': 'Ground Station',
      'project.tech4.desc': '基于 MAVlink 协议，内嵌 ISA 大气模型，跑在普通笔记本上。',
      'project.tech5.title': '制造',
      'project.tech5.title-en': 'Manufacturing',
      'project.tech5.desc': 'CNC 加工 PMI 泡沫、FDM 打印 HT-PLA-GF、MJF 打印 PA11。',
      'project.tech6.title': '飞控',
      'project.tech6.title-en': 'Flight Control',
      'project.tech6.desc': 'MBD 开发非线性全耦合飞控，自整定 PID + 总能量管理，自主返航。',
      'project.tech7.title': '通信',
      'project.tech7.title-en': 'Communications',
      'project.tech7.desc': '特高频 LoRa CSS 链路 + 12 单元八木天线，低功率远距离双向通信。',
      'publications.title': '专利',
      'pub.title': '智能自主控制可回收探空系统及控制方法',
      'pub.authors': 'Kong, Y. (孔一宸)',
      'pub.meta': '国家发明专利 · 实质审查中 · 2026',
      'skills.title': '技能',
      'skills.group1.title': '工程与制造',
      'skills.item1': '参数化建模与 CFD 仿真',
      'skills.item2': 'PCB 设计与打样',
      'skills.item3': '射频通信与 SDR',
      'skills.item4': 'STM32 嵌入式开发',
      'skills.item5': 'MBD 算法开发',
      'skills.item6': '前端开发',
      'skills.group2.title': '执照',
      'skills.item7': '业余无线电台操作证书',
      'skills.item8': '跨省跨国无线电台执照',
      'contact.title': '联系',
      'contact.email': '邮箱',
      'contact.gmail': 'Gmail',
      'contact.phone': '电话',
      'contact.github': 'GitHub',
      'contact.bilibili': 'B站',
      'contact.wechat': '微信',
      'contact.radio': '电台呼号',
      'footer.copyright': '© 2026 孔一宸 | Yichen Kong',
      'footer.tag': '西宁 · 青海 · 中国'
    },
    en: {
      'lang.title': 'Choose Your Language',
      'lang.subtitle': 'Select your preferred language',
      'lang.zh': '中文',
      'lang.en': 'English',
      'nav.about': 'About',
      'nav.awards': 'Awards',
      'nav.research': 'Research',
      'nav.project': 'Project',
      'nav.publications': 'Patent',
      'nav.contact': 'Contact',
      'hero.eyebrow': 'Xining No. 2 Middle School · 40th CASTIC',
      'hero.role': 'High School Student · Inventor of the Recoverable Sounding System',
      'hero.tagline': 'From Xining, Qinghai to the Tuotuo River, from a rough sketch to 30,000 meters. I build things that interest me, and try to solve some problems along the way.',
      'hero.cta.research': 'My Research',
      'hero.cta.cv': 'Download CV',
      'scroll.hint': 'Scroll',
      'about.title': 'About',
      'about.lead': 'I\'m Yichen Kong, a student at Xining No. 2 Middle School. I\'ve been taking things apart and putting them back together since I was a kid, and eventually started building my own. Aircraft, radio, and control systems are what I spend most of my free time on.',
      'about.p1': 'In late 2024, I began designing a sounding system from scratch — a flight vehicle carried to roughly 30km by a weather balloon, released to glide back unpowered. Aerodynamics, flight control, comms, ground station — every piece was figured out through trial and error. In July 2026, I ran field tests at the Tuotuo River station and got most of the system working. A national invention patent is now pending.',
      'about.meta.school': 'School',
      'about.school': 'Xining No. 2 Middle School',
      'about.meta.collab': 'Collaborators',
      'about.collab1': 'Tuotuo River National High-Altitude Meteorological Station',
      'about.collab2': 'Aerospace Information Research Institute, CAS',
      'about.photo.caption': 'Xining No. 2 Middle School · 2026',
      'about.meta.interests': 'What I Tinker With',
      'about.interest1': 'Aircraft Aero & Structures',
      'about.interest2': 'Nonlinear Flight Control',
      'about.interest3': 'RF Communications & SDR',
      'about.interest4': 'High-Altitude Sounding',
      'about.interest5': 'Embedded Systems',
      'about.meta.languages': 'Languages',
      'about.lang1': 'Chinese (Native)',
      'about.lang2': 'English (Academic)',
      'awards.title': 'Awards',
      'awards.intro': '40th China Adolescents Science & Technology Innovation Contest (2025)',
      'awards.award1': 'CAST President\'s Award',
      'awards.award1.detail': 'Top honor of the contest, presented by the President of CAS and CAST',
      'awards.award2': 'Geke Special Award',
      'awards.award2.detail': 'Recognizing outstanding innovation in engineering and technology',
      'awards.award3': 'Zhou Peiyuan Science & Technology Innovation Award',
      'awards.award3.detail': 'Named after renowned physicist Zhou Peiyuan, encouraging youth in scientific research',
      'awards.award4': 'Mao Yisheng Science & Technology Award',
      'awards.award4.detail': 'National youth innovation award honoring bridge engineering pioneer Mao Yisheng',
      'awards.award5': 'Tunisian Association for Future Science & Technology Excellence Award',
      'awards.award5.detail': 'International award presented by the Tunisian Association for Future Science & Technology',
      'awards.award6': '"Future Star" Youth Automotive Engineering Inspiration Award',
      'awards.award6.detail': 'Special recognition for future engineering talent',
      'awards.award7': '"Aerospace Youth" Aviation Innovation Award',
      'awards.award7.detail': 'Encouraging youth exploration in aerospace innovation',
      'awards.award8': 'Jianda Knowledge & Practice Award',
      'awards.award8.detail': 'Recognizing projects that bridge theory and practice',
      'stats.title': 'Numbers',
      'stats.altitude': 'Design Altitude',
      'stats.altitude-en': '设计飞行高度',
      'stats.patent': 'Patent Pending',
      'stats.patent-en': '国家发明专利',
      'stats.flight': 'Field Test Days',
      'stats.flight-en': '沱沱河试飞天数',
      'stats.awards': 'CASTIC Awards',
      'stats.awards-en': '全国青创赛获奖',
      'research.title': 'Research',
      'research.item1.date': '2026.07.19 — 07.22',
      'research.item1.role': 'Flight Test Lead',
      'research.item1.org': 'Tuotuo River National High-Altitude Meteorological Station · Sanjiangyuan',
      'research.item1.desc': 'Completed field tests at 4,534m altitude in Tuotuo River. Extreme cold, low pressure, strong turbulence — not exactly friendly conditions, but the system held up. Ran both a drone-assisted low-altitude test and a 30,000m balloon test, validating most design functions. Handled everything solo, with proper airspace approvals.',
      'research.item2.date': '2026.01 — Present',
      'research.item2.role': 'Inventor',
      'research.item2.org': 'National Invention Patent Application',
      'research.item2.desc': 'Filed a patent application for the "Intelligent Autonomous Recoverable Sounding System and Control Method," currently under substantive examination.',
      'research.item3.date': '2024.10 — Present',
      'research.item3.role': 'Project Founder',
      'research.item3.org': 'Intelligent Autonomous Recoverable Sounding System',
      'research.item3.desc': 'Built the entire system from scratch: comms link, flight vehicle (with sounding payload), ground station, operational computing terminal. Launched via a standard 750g balloon, the vehicle separates at altitude and glides back using a variable-sweep wing. Aero, flight control, comms, structures — every part designed, tested, and iterated on my own.',
      'project.title': 'Project',
      'project.name': 'Intelligent Autonomous Recoverable Sounding System',
      'project.summary': 'A complete sounding solution: balloon ascent → high-altitude separation → variable-sweep unpowered glide → precision recovery. The goal is to replace disposable radiosondes, reduce ocean pollution, and lower operational costs.',
      'project.video.fallback': 'Your browser does not support video playback. Please download to watch.',
      'project.media.note': 'Video is about 43MB, may take a moment to load.',
      'project.cta.report': 'Download Research Report (V4.1)',
      'project.tech1.title': 'Aerodynamics',
      'project.tech1.title-en': '气动布局',
      'project.tech1.desc': 'Variable-sweep blended wing configuration — no traditional control surfaces, attitude adjusted through wing deformation.',
      'project.tech2.title': 'Simulation',
      'project.tech2.title-en': '仿真',
      'project.tech2.desc': 'Solidworks parametric modeling, multi-scale CFD with Xflow / Xflr5 / ANSYS Fluent / Star CCM.',
      'project.tech3.title': 'Hardware',
      'project.tech3.title-en': '硬件',
      'project.tech3.desc': 'Self-designed automotive-grade 6-layer high-frequency PCB, STM32-based.',
      'project.tech4.title': 'Ground Station',
      'project.tech4.title-en': '地面站',
      'project.tech4.desc': 'MAVlink-based, with embedded ISA atmospheric model, runs on a regular laptop.',
      'project.tech5.title': 'Manufacturing',
      'project.tech5.title-en': '制造',
      'project.tech5.desc': 'CNC-machined PMI foam, FDM-printed HT-PLA-GF, MJF-printed PA11.',
      'project.tech6.title': 'Flight Control',
      'project.tech6.title-en': '飞控',
      'project.tech6.desc': 'MBD-developed nonlinear fully-coupled flight control, self-tuning PID + total energy management for autonomous return.',
      'project.tech7.title': 'Communications',
      'project.tech7.title-en': '通信',
      'project.tech7.desc': 'UHF LoRa CSS link + 12-element Yagi antenna for low-power long-range bidirectional comms.',
      'publications.title': 'Patent',
      'pub.title': 'Intelligent Autonomous Recoverable Sounding System and Control Method',
      'pub.authors': 'Kong, Y. (孔一宸)',
      'pub.meta': 'National Invention Patent · Under Examination · 2026',
      'skills.title': 'Skills',
      'skills.group1.title': 'Engineering & Fabrication',
      'skills.item1': 'Parametric Modeling & CFD',
      'skills.item2': 'PCB Design & Prototyping',
      'skills.item3': 'RF Communications & SDR',
      'skills.item4': 'STM32 Embedded Development',
      'skills.item5': 'MBD Algorithm Development',
      'skills.item6': 'Front-End Development',
      'skills.group2.title': 'Licenses',
      'skills.item7': 'Amateur Radio Operator Certificate',
      'skills.item8': 'Cross-Province/International Radio Station License',
      'contact.title': 'Contact',
      'contact.email': 'Email',
      'contact.gmail': 'Gmail',
      'contact.phone': 'Phone',
      'contact.github': 'GitHub',
      'contact.bilibili': 'Bilibili',
      'contact.wechat': 'WeChat',
      'contact.radio': 'Call Sign',
      'footer.copyright': '© 2026 Yichen Kong',
      'footer.tag': 'Xining · Qinghai · China'
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

    if (lang === 'en') {
      document.title = 'Yichen Kong';
    } else {
      document.title = '孔一宸 | Yichen Kong';
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
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* ── 数字滚动动画 ───────────────────────────────────────────────────── */
  const statNums = document.querySelectorAll('.stat-num');

  function animateNumber(el) {
    const target = parseInt(el.dataset.count, 10) || 0;
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();

    function format(n) {
      return n.toLocaleString('en-US');
    }

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
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

  /* ── 返回顶部按钮 ───────────────────────────────────────────────────── */
  const backToTop = document.getElementById('backToTop');

  function onScrollBackToTop() {
    if (window.scrollY > 600) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', onScrollBackToTop, { passive: true });
  onScrollBackToTop();

  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ── 获奖照片 hover 微动效 ──────────────────────────────────────────── */
  const awardPhotos = document.querySelectorAll('.award-photo-item img');
  awardPhotos.forEach(function (img) {
    img.addEventListener('mouseenter', function () {
      img.style.transform = 'scale(1.04)';
    });
    img.addEventListener('mouseleave', function () {
      img.style.transform = 'scale(1)';
    });
  });

})();