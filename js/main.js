/* ═══════════════════════════════════════════════════════════════════════════
   YICHEN KONG — ACADEMIC CV
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
      'nav.profile': '概览',
      'nav.awards': '获奖',
      'nav.project': '项目',
      'nav.flight': '试验',
      'nav.skills': '技能',
      'nav.contact': '联系',
      'hero.eyebrow': '高中生 · 唯一发明人',
      'hero.role': '空天科技 · 飞行器设计 · 自动化算法开发 · 气象探测 · 无线电通信',
      'hero.tagline': '智能自主控制可回收探空系统',
      'hero.cta.project': '查看项目',
      'hero.cta.cv': '简历 (PDF)',
      'profile.title': '个人概览',
      'profile.p1': '本人长期热爱科研学习与工程应用，积极参与各类科创社团活动，多次参加科创竞赛并取得优异成绩，本人最新的独立研究成果建立在全球大气科学深化的背景下，传统一次性探空仪带来的海洋环境污染、数据传输受限及高昂的业务成本已成为行业瓶颈。',
      'profile.p2': '作为一名高中学生，我致力于通过技术创新，将新型变体飞行器技术、远距离低功率通信技术、非线性全耦合控制算法、MBD 开发自主返航算法、新型材料与生产工艺跨学科融合，开发具备强可靠性、高精度、低成本、低生物威胁且环境友好的"智能自主控制可回收探空系统"，为全球高空探测与大气研究贡献新型解决方案。',
      'profile.meta.identity': '身份',
      'profile.identity': '高中生',
      'profile.meta.direction': '方向',
      'profile.dir1': '空天科技',
      'profile.dir2': '飞行器设计',
      'profile.dir3': '自动化算法开发',
      'profile.dir4': '气象探测',
      'profile.dir5': '无线电通信',
      'profile.meta.languages': '语言',
      'profile.lang1': '中文（母语）',
      'profile.lang2': '英语（学术读写）',
      'awards.title': '成果与荣誉',
      'awards.castic.title': '第40届全国青少年科技创新大赛（2025）',
      'awards.castic.award1': '中国科协主席奖',
      'awards.castic.award1.detail': '大赛最高奖项',
      'awards.castic.award2': '格科专项奖',
      'awards.castic.award2.detail': '工程技术领域突出创新价值',
      'awards.castic.award3': '周培源科技创新奖',
      'awards.castic.award3.detail': '鼓励青少年投身科学研究',
      'awards.castic.award4': '茅以升科学技术奖',
      'awards.castic.award4.detail': '全国青少年科技创新奖',
      'awards.castic.award5': '突尼斯未来科学技术协会卓越奖',
      'awards.castic.award5.detail': '国际专项奖',
      'awards.castic.award6': '"未来星"青少年汽车工程启迪奖',
      'awards.castic.award6.detail': '面向未来工程人才',
      'awards.castic.award7': '"空天少年"航空科创探新筑梦奖',
      'awards.castic.award7.detail': '航空航天领域创新探索',
      'awards.castic.award8': '建大知行奖',
      'awards.castic.award8.detail': '理论与实践相结合',
      'awards.other.title': '其他成果',
      'awards.other.item1.title': '国家发明专利（唯一发明人）',
      'awards.other.item1.desc': '专利申请号：202610625965.2。目前已正式通过国家知识产权局初步审查，进入实质审查阶段。',
      'awards.other.item2.title': '连续两年入围全国青少年科技创新大赛',
      'awards.other.item3.title': '连续两年获得青海省青少年科技创新大赛一等奖',
      'awards.other.item3.note': '独立性声明：本研究项目的一切研究设计均由本人独立完成。',
      'awards.other.item4.title': '自主设计的无线电收发设备通过 CMA 检测',
      'awards.other.item4.desc': '测试单位：青海省无线电检测站',
      'awards.other.item5.title': '自主设计的探空业务计算终端通过实际验证测试',
      'project.title': '项目经历',
      'project.name': '智能自主控制可回收探空系统',
      'project.date': '2024.10 – 至今',
      'project.summary': '本系统由通信、飞行器（包含探空装置）、地面站、业务计算终端等多部分构成，通过标准 750g 高空气球搭载升空，飞行器达到 30000m 左右高空后与气球分离，并以可变斜翼无动力滑翔实现远程精确回收，在世界范围内具有较强创新性；该系统有助于改善环境污染与生物威胁，提升探测安全性，解决落点不可控、资金消耗大、有效载荷搭载受限和数据传输能力受限的问题。',
      'project.video.fallback': '浏览器不支持视频播放，请下载观看。',
      'project.media.note': '视频约 43MB，加载可能需要一点时间。',
      'project.cta.report': '下载研究报告 (V4.1)',
      'project.tech1.title': '创新气动布局',
      'project.tech1.title-en': 'Aerodynamics',
      'project.tech1.desc': '设计全新的"变斜翼融合弹翼"气动布局。通过实时动态调整机翼斜角，显著增强了系统在高空复杂气流中的抗风性能与远距离飞行效率，依托"带有边条的全动弹翼控制"实现了无操控面下的高效率姿态调节，同时还具有冯·卡门鼻锥、融合式翼梢帆片（霍纳式+斜削式+翼梢帆片）等先进气动组件。',
      'project.tech2.title': '参数化建模与 CFD 仿真',
      'project.tech2.title-en': 'Simulation',
      'project.tech2.desc': 'Solidworks 建模并先后通过 Xflow、Xflr5、ANSYS-Fluent/Star CCM 进行从翼型到全机流体力学仿真并迭代设计，确保跨雷诺数严谨性与非对称分析准确性。',
      'project.tech3.title': '电路设计',
      'project.tech3.title-en': 'Hardware',
      'project.tech3.desc': '嘉立创 EDA 设计车规级高多层电路板，包括高转换效率同步升降压电源，X7R 电容与薄膜电阻。',
      'project.tech4.title': '地面站与业务终端',
      'project.tech4.title-en': 'Ground Station',
      'project.tech4.desc': '针对通信链路专门开发的 MAVlink 协议探空地面站；内嵌 ISA 对流层与平流层微积分模型，通过达因公式（采用 WMO 推荐的业务标定，二分法求解）、理想气体方程等模拟高空探空业务实际情况的网页计算终端。',
      'project.tech5.title': '极端环境工程实现',
      'project.tech5.title-en': 'Manufacturing',
      'project.tech5.desc': '先后使用 CNC 加工 75kg/m³ PMI 泡沫、FDM 打印 HT-PLA-GF 复合材料、MJF 打印 PA11 工程尼龙，实现了轻量化与结构强度的权衡。符合国标/德标的密封设计与内外双构造设计，多种定制润滑油、粘接剂，确保平流层极端环境下的可靠运行与强扩展能力。',
      'project.tech6.title': '非线性全耦合飞控内外环算法开发',
      'project.tech6.title-en': 'Flight Control',
      'project.tech6.desc': 'MBD 方法进行飞控算法搭建。应用自整定 PID 算法与总能量管理策略，有效解决了飞行器在气球分离瞬间的非线性扰动与远距离自主返航，实现了稳定的自主滑翔返航。',
      'project.tech7.title': '远程低功率双向通信链路',
      'project.tech7.title-en': 'Communications',
      'project.tech7.desc': '自研特高频射频链路，结合 LoRa CSS 调制技术与 12 单元高增益八木天线，实现了低功率条件下的超远程双向传输，解决传统探测中的"丢球"问题，通信功率低于行业标杆气象探测设备——芬兰 Vaisala 探空仪。',
      'flight.title': '合规低空、高空试验',
      'flight.location': '沱沱河国家高空气象观测站与三江源',
      'flight.date': '2026.07.19 – 22',
      'flight.desc': '选择在沱沱河（4534.5m 高海拔、寒冷、低压、强湍流环境）进行实验，对于验证装置在恶劣环境下的性能表现及稳定性具有较高科研价值，分别进行无人机带载低空测试和 30000m 高空测试，已提前联系中国科学院空天信息创新研究院、中国科学院大气物理研究所、格尔木市气象局、西宁市国家高空气象观测站、沱沱河国家高空气象观测站等单位审批空域，验证了系统大部分功能，为进一步研究提供关键数据支撑，本人作为唯一试飞负责人，始终坚持科研诚信，试验过程符合国家相关法律法规与标准。',
      'skills.title': '技术技能',
      'skills.group1.title': '证书与执照',
      'skills.item1': '考取业余无线电台操作技术能力验证证书，编号 A6300000049，核发机构：青海省。',
      'skills.item2': '合规申请审批中华人民共和国跨省跨国无线电台执照。',
      'skills.group2.title': '工程设计与制造',
      'skills.item3': '掌握参数化建模、各类 CFD 仿真、六层 PCB 设计、射频通信、SDR 无线电、前端开发、掌握 STM32 架构、MBD 算法开发、能够针对不同场景选取应用不同自动化算法。',
      'endorsements.title': '专家评价',
      'endorsements.text': '中国科学院空天信息创新研究院高级工程师一级黄宛宁老师、中国科学院大学岗位教授卞建春老师、中国科学院大气物理研究所高级工程师白志宣老师、华南理工大学未来技术学院教授张东老师、青海 NOI 特派员与青海大学计算机科学与技术学院副教授杜正君老师、西宁市国家高空气象观测站站长郭航老师对本项目给予了认可和支持。',
      'contact.title': '联系',
      'contact.email': '邮箱',
      'contact.gmail': 'Gmail',
      'contact.phone': '电话',
      'contact.github': 'GitHub',
      'contact.bilibili': 'B站',
      'contact.wechat': '微信',
      'contact.radio': '电台呼号',
      'footer.copyright': '© 2026 孔一宸 | Yichen Kong',
      'footer.tag': '空天科技 · 飞行器设计 · 自动化算法开发 · 气象探测 · 无线电通信'
    },
    en: {
      'lang.title': 'Choose Your Language',
      'lang.subtitle': 'Select your preferred language',
      'lang.zh': '中文',
      'lang.en': 'English',
      'nav.profile': 'Profile',
      'nav.awards': 'Awards',
      'nav.project': 'Project',
      'nav.flight': 'Flight Test',
      'nav.skills': 'Skills',
      'nav.contact': 'Contact',
      'hero.eyebrow': 'High School Student · Sole Inventor',
      'hero.role': 'Aerospace · Aircraft Design · Automation Algorithms · Atmospheric Sounding · RF Communications',
      'hero.tagline': 'Intelligent Autonomous Recoverable Sounding System',
      'hero.cta.project': 'View Project',
      'hero.cta.cv': 'CV (PDF)',
      'profile.title': 'Profile Summary',
      'profile.p1': 'Motivated by the high operational costs and marine ecological pollution of traditional disposable radiosondes, I engineered an autonomous, recoverable sounding system. By integrating morphing aircraft structures, low-power RF communications, nonlinear fully-coupled control, and Model-Based Design (MBD), this system offers a high-precision, eco-friendly, and cost-effective alternative for global high-altitude atmospheric data collection.',
      'profile.p2': 'As a high school student, I am committed to technological innovation, integrating novel variant-configuration aircraft technology, long-range low-power communication, nonlinear fully-coupled control algorithms, MBD-developed autonomous return-flight algorithms, and advances in materials and manufacturing processes across disciplines. Through this interdisciplinary synthesis, I have developed an "Intelligent Autonomous Recoverable Sounding System" characterized by strong reliability, high precision, low cost, minimal biological hazard, and environmental sustainability.',
      'profile.meta.identity': 'Identity',
      'profile.identity': 'High School Student',
      'profile.meta.direction': 'Focus Areas',
      'profile.dir1': 'Aerospace Technology',
      'profile.dir2': 'Aircraft Design',
      'profile.dir3': 'Automation Algorithm Development',
      'profile.dir4': 'Atmospheric Sounding',
      'profile.dir5': 'RF Communications',
      'profile.meta.languages': 'Languages',
      'profile.lang1': 'Chinese (Native)',
      'profile.lang2': 'English (Academic)',
      'awards.title': 'Achievements & Honors',
      'awards.castic.title': '40th China Adolescents Science & Technology Innovation Contest (2025)',
      'awards.castic.award1': 'CAST President\'s Award',
      'awards.castic.award1.detail': 'Top honor of the contest',
      'awards.castic.award2': 'Geke Special Award',
      'awards.castic.award2.detail': 'Outstanding innovation in engineering',
      'awards.castic.award3': 'Zhou Peiyuan Science & Technology Innovation Award',
      'awards.castic.award3.detail': 'Encouraging youth in scientific research',
      'awards.castic.award4': 'Mao Yisheng Science & Technology Award',
      'awards.castic.award4.detail': 'National youth innovation award',
      'awards.castic.award5': 'Tunisian Association for Future Science & Technology Excellence Award',
      'awards.castic.award5.detail': 'International special award',
      'awards.castic.award6': '"Future Star" Youth Automotive Engineering Inspiration Award',
      'awards.castic.award6.detail': 'For future engineering talent',
      'awards.castic.award7': '"Aerospace Youth" Aviation Innovation Award',
      'awards.castic.award7.detail': 'Aerospace innovation exploration',
      'awards.castic.award8': 'Jianda Knowledge & Practice Award',
      'awards.castic.award8.detail': 'Bridging theory and practice',
      'awards.other.title': 'Other Achievements',
      'awards.other.item1.title': 'National Invention Patent (Sole Inventor)',
      'awards.other.item1.desc': 'App No.: 202610625965.2. Passed preliminary examination by CNIPA; currently under substantive examination.',
      'awards.other.item2.title': 'National Youth Science and Technology Innovation Competition — Two-time Finalist',
      'awards.other.item3.title': 'Qinghai Youth Science and Technology Innovation Competition — Two-time First Prize',
      'awards.other.item3.note': 'Declaration: All research and design in this project were completed independently.',
      'awards.other.item4.title': 'Self-designed radio transceivers passed CMA certification',
      'awards.other.item4.desc': 'Testing unit: Qinghai Radio Testing Station',
      'awards.other.item5.title': 'Self-designed sounding calculation terminal passed operational field testing',
      'project.title': 'Core Research Project',
      'project.name': 'Intelligent Autonomous Recoverable Sounding System',
      'project.date': 'Oct 2024 – Present',
      'project.summary': 'Architecture: Integrates a morphing flight payload, MAVLink ground station, and web-based terminal. Lifted by a 750g balloon to 30,000m, the payload separates and executes an unpowered glide recovery, resolving uncontrollable descents, funding drains, and data limitations. The system demonstrates strong innovation on a global scale, helping to mitigate environmental pollution and biological threats, enhance sounding safety, and address issues of uncontrolled landing points, high operational costs, limited payload capacity, and constrained data transmission.',
      'project.video.fallback': 'Your browser does not support video playback. Please download to watch.',
      'project.media.note': 'Video is about 43MB, may take a moment to load.',
      'project.cta.report': 'Download Research Report (V4.1)',
      'project.tech1.title': 'Innovative Aerodynamic Configuration',
      'project.tech1.title-en': '气动布局',
      'project.tech1.desc': 'Designed a "Morphing Swept Wing + Missile Fin" hybrid configuration. Dynamic wing-sweep adjustments improve wind resistance; all-moving straked fins enable precise attitude control without conventional surfaces. Integrated a von Kármán nose cone and hybrid wingtips (Hoerner + raked + wingtip sails).',
      'project.tech2.title': 'Parametric Modeling & CFD Simulation',
      'project.tech2.title-en': '仿真',
      'project.tech2.desc': 'Built 3D models (SolidWorks) and executed multi-scale CFD simulations (XFlow, XFLR5, ANSYS-Fluent, STAR-CCM+) to validate cross-Reynolds-number performance and asymmetric flow characteristics.',
      'project.tech3.title': 'Circuit Design',
      'project.tech3.title-en': '硬件',
      'project.tech3.desc': 'Engineered an automotive-grade multi-layer high-frequency PCB (JLCPCB EDA), incorporating a high-efficiency synchronous buck-boost converter, X7R capacitors, and thin-film resistors.',
      'project.tech4.title': 'Ground Station & Operational Terminal',
      'project.tech4.title-en': '地面站',
      'project.tech4.desc': 'Developed a custom MAVLink ground station. Built a web terminal embedding ISA tropospheric and stratospheric models and the WMO-recommended Dines formula (solved via bisection) along with the ideal gas law to simulate real-world sounding parameters.',
      'project.tech5.title': 'Extreme-Environment Engineering',
      'project.tech5.title-en': '制造',
      'project.tech5.desc': 'Achieved a high strength-to-weight ratio using CNC-machined PMI foam (75kg/m³), FDM-printed HT-PLA-GF composites, and MJF-printed PA11 nylon. Applied DIN/GB-compliant double-layer sealing and specialized lubricants and adhesives for stratospheric reliability and strong expandability.',
      'project.tech6.title': 'Nonlinear Fully-Coupled Flight Control Algorithm',
      'project.tech6.title-en': '飞控',
      'project.tech6.desc': 'Implemented flight control via MBD. Applied auto-tuning PID and Total Energy Control Systems (TECS) to reject nonlinear perturbations during balloon separation and stabilize long-distance autonomous return glides.',
      'project.tech7.title': 'Long-Range Low-Power Bidirectional Communication Link',
      'project.tech7.title-en': '通信',
      'project.tech7.desc': 'Designed a custom UHF RF link with LoRa CSS modulation and a 12-element high-gain Yagi antenna. Achieved robust bidirectional transmission at power levels significantly lower than industry standards (e.g., Vaisala radiosondes), eliminating signal dropout.',
      'flight.title': 'Flight Testing & Compliance',
      'flight.location': 'Tuotuo River National High-Altitude Meteorological Station & Sanjiangyuan',
      'flight.date': 'Jul 19 – 22, 2026',
      'flight.desc': 'Directed extreme-environment tests at 4,534m altitude (severe cold, low pressure, turbulence). Secured rigorous airspace approvals from CAS institutes and regional meteorological bureaus. As the sole flight test director, I successfully oversaw drone-assisted low-altitude drops and 30,000m stratospheric balloon launches in strict adherence to national regulations, validating core thermal and dynamic resilience. The tests provided critical data for further research.',
      'skills.title': 'Technical Skills',
      'skills.group1.title': 'Certifications & Licenses',
      'skills.item1': 'Amateur Radio Operator Certificate (No. A6300000049), issued by Qinghai Province.',
      'skills.item2': 'Holds a PRC Cross-Province/International Radio Station License.',
      'skills.group2.title': 'Engineering Design & Manufacturing',
      'skills.item3': 'Parametric modeling, multiphysics CFD, 6-layer high-frequency PCB design, RF communications, SDR, front-end development, STM32 embedded architecture, MBD algorithm development, and the ability to select and apply different automation algorithms for various scenarios.',
      'endorsements.title': 'Expert Endorsements',
      'endorsements.text': 'Received technical validation and support from leading experts: Senior Eng. W. Huang (Aerospace Information Research Institute, CAS), Prof. J. Bian (UCAS), Senior Eng. Z. Bai (Institute of Atmospheric Physics, CAS), Prof. D. Zhang (SCUT), Assoc. Prof. Z. Du (Qinghai Univ.), and Director H. Guo (Xining National High-Altitude Met. Station).',
      'contact.title': 'Contact',
      'contact.email': 'Email',
      'contact.gmail': 'Gmail',
      'contact.phone': 'Phone',
      'contact.github': 'GitHub',
      'contact.bilibili': 'Bilibili',
      'contact.wechat': 'WeChat',
      'contact.radio': 'Call Sign',
      'footer.copyright': '© 2026 Yichen Kong',
      'footer.tag': 'Aerospace · Aircraft Design · Automation Algorithms · Atmospheric Sounding · RF Communications'
    }
  };

  const STORAGE_KEY = 'yk-lang';
  const DEFAULT_LANG = 'zh';

  /* ── 语言系统 ─────────────────────────────────────────────────────── */
  const langOverlay = document.getElementById('langOverlay');
  const langSwitch = document.getElementById('langSwitch');
  const htmlEl = document.documentElement;

  function getStoredLang() {
    try { return localStorage.getItem(STORAGE_KEY) || null; }
    catch (e) { return null; }
  }

  function setStoredLang(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); }
    catch (e) { /* ignore */ }
  }

  function applyLang(lang) {
    const dict = I18N[lang] || I18N[DEFAULT_LANG];
    htmlEl.setAttribute('lang', lang === 'zh' ? 'zh-CN' : 'en');
    htmlEl.setAttribute('data-lang', lang);

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) { el.textContent = dict[key]; }
    });

    document.title = lang === 'en' ? 'Yichen Kong' : '孔一宸 | Yichen Kong';
  }

  function switchLang(lang) {
    applyLang(lang);
    setStoredLang(lang);
    langOverlay.classList.remove('active');
    langOverlay.setAttribute('aria-hidden', 'true');
  }

  const stored = getStoredLang();
  if (stored) { applyLang(stored); }
  else {
    langOverlay.classList.add('active');
    langOverlay.setAttribute('aria-hidden', 'false');
  }

  document.querySelectorAll('.lang-option').forEach(function (btn) {
    btn.addEventListener('click', function () {
      switchLang(btn.getAttribute('data-lang'));
    });
  });

  langSwitch.addEventListener('click', function () {
    const current = htmlEl.getAttribute('data-lang') || DEFAULT_LANG;
    switchLang(current === 'zh' ? 'en' : 'zh');
  });

  /* ── 导航栏滚动状态 ─────────────────────────────────────────────────── */
  const nav = document.getElementById('siteNav');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  function onScrollNav() {
    if (window.scrollY > 10) { nav.classList.add('scrolled'); }
    else { nav.classList.remove('scrolled'); }
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
      { threshold: 0.06, rootMargin: '0px 0px -24px 0px' }
    );

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
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

    sections.forEach(function (section) { sectionObserver.observe(section); });
  }

  /* ── 返回顶部按钮 ───────────────────────────────────────────────────── */
  const backToTop = document.getElementById('backToTop');

  function onScrollBackToTop() {
    if (window.scrollY > 600) { backToTop.classList.add('visible'); }
    else { backToTop.classList.remove('visible'); }
  }

  window.addEventListener('scroll', onScrollBackToTop, { passive: true });
  onScrollBackToTop();

  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ── 获奖照片 hover 微动效 ──────────────────────────────────────────── */
  const awardPhotos = document.querySelectorAll('.award-photo-item img');
  awardPhotos.forEach(function (img) {
    img.addEventListener('mouseenter', function () { img.style.transform = 'scale(1.03)'; });
    img.addEventListener('mouseleave', function () { img.style.transform = 'scale(1)'; });
  });

})();