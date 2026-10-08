// Edit content here; scripts/build.mjs regenerates the static pages.
export const site = {
  name: { zh: '孔一宸', en: 'Yichen Kong' },
  location: { zh: '中国 · 青海省 · 西宁市', en: 'Xining · Qinghai · China' },
  wechat: '13997320897',
  callsign: 'BG9SOE',
  discussion: 'https://github.com/yichen-kong/yichen-kong.github.io/discussions/1',
};
export const projects = [
  {
    id: 'recoverable',
    href: 'project-recoverable-sounding.html',
    title: {zh:'自主控制可回收探空系统',en:'Autonomous recoverable sounding system'},
    eyebrow: {zh:'项目 01 · 飞行器与探空',en:'Project 01 · Aircraft & sounding'},
    summary: {zh:'气球升空、飞行器分离、无动力滑翔回收。飞行器、飞控、无线通信与地面站由我独立设计。',
      en:'Balloon ascent, vehicle separation and unpowered glide recovery. I designed the aircraft, flight control, radio link and ground station.'},
    date: {zh:'2024 年 10 月至今',en:'October 2024–present'},
  },
  {
    id: 'calculator',
    href: 'project-sounding-calculator.html',
    title: {zh:'高空探空业务模拟计算网页',en:'High-altitude sounding calculator'},
    eyebrow: {zh:'项目 02 · 计算工具',en:'Project 02 · Computational tool'},
    summary: {zh:'在浏览器中估算气球充气体积、净举力、升速和爆炸高度。支持实时参数调整与中英文界面。',
      en:'Estimate balloon fill volume, net lift, ascent rate and burst altitude in the browser, with live inputs and Chinese and English interfaces.'},
    external:'https://chenlaplab.dpdns.org/'
  }
];
export const engineering = [
  [{zh:'气动布局',en:'Aerodynamics'},{zh:'变斜翼融合弹翼布局；实时调整机翼斜角，结合带边条的全动弹翼控制姿态。设计包含冯·卡门鼻锥和融合式翼梢装置。',en:'A morphing oblique wing combined with all-moving straked fins for attitude control, a von Kármán nose and hybrid wingtip devices.'}],
  [{zh:'建模与仿真',en:'Modeling & simulation'},{zh:'使用 SolidWorks 建模，依次通过 XFlow、XFLR5、ANSYS Fluent / STAR-CCM+ 分析翼型和全机流场，迭代气动设计。',en:'SolidWorks models and successive airfoil and full-aircraft flow analyses in XFlow, XFLR5 and ANSYS Fluent / STAR-CCM+ inform the aerodynamic iterations.'}],
  [{zh:'电路设计',en:'Circuit design'},{zh:'使用嘉立创 EDA 设计多层 PCB，包括同步升降压电源、X7R 电容与薄膜电阻。',en:'Multilayer PCBs designed in JLCPCB EDA include a synchronous buck–boost supply, X7R capacitors and thin-film resistors.'}],
  [{zh:'飞行控制',en:'Flight control'},{zh:'通过 MBD 开发飞控算法，采用自整定 PID 与总能量管理策略，处理气球分离扰动和自主滑翔返航。',en:'Model-based development, self-tuning PID and total-energy management address balloon-separation disturbances and autonomous return glides.'}],
  [{zh:'通信与地面站',en:'Radio & ground station'},{zh:'自研 UHF 双向链路，使用 LoRa CSS 调制和 12 单元八木天线；地面站采用 MAVLink 协议。',en:'A custom bidirectional UHF link uses LoRa CSS modulation and a 12-element Yagi antenna. The ground station uses MAVLink.'}],
  [{zh:'材料与制造',en:'Materials & manufacture'},{zh:'CNC 加工 PMI 泡沫、FDM 打印 HT-PLA-GF、MJF 打印 PA11。分段内外结构和密封设计兼顾低温、重量与维护。',en:'CNC-machined PMI foam, FDM-printed HT-PLA-GF and MJF-printed PA11 parts. Segmented inner/outer structures and seals address low temperatures, mass and maintenance.'}],
  [{zh:'业务计算终端',en:'Operational calculator'},{zh:'将 ISA 大气模型、达因公式和理想气体方程整合为独立网页工具，辅助探空方案估算。',en:'An independent web tool combines ISA atmospheric models, the Dines formula and the ideal gas law for sounding-plan estimates.'}]
];
export const awards = [
  {zh:'中国科协主席奖',en:"CAST President’s Award"},
  {zh:'格科专项奖',en:'Geke Special Award'},
  {zh:'周培源科技创新奖',en:'Zhou Peiyuan Science and Technology Innovation Award'},
  {zh:'茅以升科学技术奖全国青少年科技创新奖',en:'Mao Yisheng Science and Technology Award for National Youth Innovation'},
  {zh:'突尼斯未来科学技术协会卓越奖',en:'Tunisian Association for Future Science and Technology Excellence Award'},
  {zh:'“未来星”青少年汽车工程启迪奖',en:'“Future Star” Youth Automotive Engineering Inspiration Award'},
  {zh:'“空天少年”航空科创探新筑梦奖',en:'“Aerospace Youth” Aviation Innovation Award'},
  {zh:'建大知行奖',en:'Jianda Knowledge and Practice Award'}
];
export const otherResults = [
  [{zh:'国家发明专利申请',en:'National invention patent application'},{zh:'唯一发明人。申请号 202610625965.2；根据本人提供的简历，已通过初步审查并进入实质审查阶段。',en:'Sole inventor. Application 202610625965.2; the supplied CV records completion of preliminary examination and entry into substantive examination.'}],
  [{zh:'全国与省级竞赛',en:'National & provincial competitions'},{zh:'连续两年入围全国青少年科技创新大赛，连续两年获青海省青少年科技创新大赛一等奖。',en:'A national finalist and Qinghai first-prize recipient in the youth science and technology innovation competition for two consecutive years.'}],
  [{zh:'无线电设备检测',en:'Radio equipment testing'},{zh:'自主设计的无线电收发设备通过青海省无线电检测站 CMA 检测。',en:'The self-designed radio transceivers passed CMA testing by the Qinghai Radio Testing Station.'}],
  [{zh:'计算终端验证',en:'Calculator validation'},{zh:'自主设计的探空业务计算终端通过实际验证测试。',en:'The self-designed sounding calculator underwent operational validation tests.'}]
];
export const documents = [
  {id:'resume-zh',type:'cv',title:{zh:'个人简历 · 中文',en:'Curriculum vitae · Chinese'},lang:'中文',path:'assets/docs/resume-zh.pdf'},
  {id:'resume-en',type:'cv',title:{zh:'个人简历 · 英文',en:'Curriculum vitae · English'},lang:'English',path:'assets/docs/resume-en.pdf'},
  {id:'research-report-zh',type:'report',title:{zh:'项目研究报告 · 中文',en:'Project report · Chinese'},lang:'中文',path:'assets/docs/research-report-zh.pdf'},
  {id:'research-report-en',type:'report',title:{zh:'项目研究报告 · 英文',en:'Project report · English'},lang:'English',path:'assets/docs/research-report-en.pdf'},
  {id:'flight-test-plan-en',type:'report',title:{zh:'试飞计划及可行性研究报告 · 英文',en:'Flight-test plan and feasibility study · English'},lang:'English',path:'assets/docs/flight-test-plan-en.pdf'}
];
export const sources = [
  {id:'earth-photo',title:{zh:'NASA / 国际空间站大气辉光影像',en:'NASA / ISS atmospheric glow'},url:'https://images.nasa.gov/details/iss072e724819'},
  {id:'station',title:{zh:'中国气象局 · 沱沱河气象站报道',en:'China Meteorological Administration · Tuotuohe station'},url:'https://www.cma.gov.cn/'},
  {id:'natural-earth',title:{zh:'Natural Earth 地理数据',en:'Natural Earth geographic data'},url:'https://www.naturalearthdata.com/'}
];
