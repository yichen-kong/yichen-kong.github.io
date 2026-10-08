/**
 * Self-contained, lazy Three.js viewers. Both initializers return synchronous,
 * idempotent cleanup functions, including during loading or after GPU failure.
 * Pass a dedicated DIV (not the old 2D canvas). No globals, stylesheet or CDN.
 *
 * Integration: const { initEarth } = await import('./earth.js');
 *              const cleanup = initEarth(container);
 * See ../assets/earth/README.md for provenance, conventions and limitations.
 */
const RAD = Math.PI / 180;
const DAY = 86400000;
const BEIJING_OFFSET = 8 * 60 * 60 * 1000;
const XINING = Object.freeze({ latitude: 36.6171, longitude: 101.7782 });
const instances = new WeakMap();
const THREE_URL = new URL('../assets/vendor/earth/three.module.min.js', import.meta.url);
const TEXTURE_URL = new URL('../assets/earth/blue-marble-2048.jpg', import.meta.url);
const DEM_URL = new URL('../assets/earth/qinghai-dem.json', import.meta.url);

// Deliberately a representative interior point, NOT Xining or an official centroid.
export const QINGHAI = Object.freeze({ latitude: 35.5, longitude: 96 });

export function wrapLongitude(degrees) {
  return ((degrees + 180) % 360 + 360) % 360 - 180;
}

/** Three SphereGeometry / Greenwich-centred equirectangular convention.
 * +X = 0°E equator, +Y = north pole, -Z = 90°E equator; east longitude positive.
 */
export function geographicToCartesian(latitude, longitude, radius = 1) {
  if (![latitude, longitude, radius].every(Number.isFinite)
      || Math.abs(latitude) > 90 || radius <= 0) throw new RangeError('Invalid coordinates');
  const lat = latitude * RAD, lon = longitude * RAD, r = radius * Math.cos(lat);
  return { x: r * Math.cos(lon), y: radius * Math.sin(lat), z: -r * Math.sin(lon) };
}

export function geographicToUV(latitude, longitude) {
  geographicToCartesian(latitude, longitude); // Shared validation.
  return { u: (wrapLongitude(longitude) + 180) / 360, v: (latitude + 90) / 180 };
}

/**
 * NOAA/Meeus apparent solar declination and equation of time.
 * UTC instant -> east-positive subsolar longitude. No timezone, frame-count,
 * seasonal cosine approximation or camera rotation enters this calculation.
 * Geometric terminator: normal · sun = 0 (no local atmospheric refraction).
 */
export function solarSubpoint(date = new Date()) {
  const ms = date instanceof Date ? date.getTime() : Number(date);
  if (!Number.isFinite(ms)) throw new RangeError('Invalid UTC instant');
  const t = (ms / DAY + 2440587.5 - 2451545) / 36525;
  const l = ((280.46646 + t * (36000.76983 + t * 0.0003032)) % 360) * RAD;
  const m = (357.52911 + t * (35999.05029 - 0.0001537 * t)) * RAD;
  const e = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
  const c = (Math.sin(m) * (1.914602 - t * (0.004817 + 0.000014 * t))
    + Math.sin(2 * m) * (0.019993 - 0.000101 * t) + Math.sin(3 * m) * 0.000289) * RAD;
  const omega = (125.04 - 1934.136 * t) * RAD;
  const lambda = l + c - (0.00569 + 0.00478 * Math.sin(omega)) * RAD;
  const eps = (23 + (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60) / 60
    + 0.00256 * Math.cos(omega)) * RAD;
  const latitude = Math.asin(Math.sin(eps) * Math.sin(lambda)) / RAD;
  const y = Math.tan(eps / 2) ** 2;
  const equationOfTime = 4 / RAD * (y * Math.sin(2 * l) - 2 * e * Math.sin(m)
    + 4 * e * y * Math.sin(m) * Math.cos(2 * l) - 0.5 * y * y * Math.sin(4 * l)
    - 1.25 * e * e * Math.sin(2 * m));
  const minutes = ((ms % DAY) + DAY) % DAY / 60000;
  const longitude = wrapLongitude(180 - minutes / 4 - equationOfTime / 4);
  return { latitude, longitude, equationOfTime };
}

function beijingCivilDate(date) {
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const parsed = new Date(`${date}T00:00:00Z`);
    if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
      throw new RangeError('Invalid Beijing civil date');
    }
    return date;
  }
  const ms = date instanceof Date ? date.getTime() : typeof date === 'number' ? date : NaN;
  const shifted = new Date(ms + BEIJING_OFFSET);
  if (!Number.isFinite(shifted.getTime())) throw new RangeError('Pass a Date, epoch milliseconds or YYYY-MM-DD');
  return shifted.toISOString().slice(0, 10);
}

/**
 * Local NOAA/Meeus estimate, standard apparent sunrise/sunset zenith 90.833°.
 * https://gml.noaa.gov/grad/solcalc/calcdetails.html
 * https://gml.noaa.gov/grad/solcalc/main.js (calcSunriseSetUTC)
 *
 * date: an instant (Date / epoch ms) selecting its Beijing UTC+8 civil date,
 * or an explicit YYYY-MM-DD civil date. Never uses the host's local timezone.
 * Returns { civilDate, sunrise: Date|null, sunset: Date|null }; Date values
 * represent UTC instants (sunrise in western China is often the previous UTC
 * date). null means that event does not occur on this Beijing civil day.
 * Assumes a level horizon and standard refraction; NO terrain/elevation/weather
 * correction. Polar/tangent events may be undefined; this is not survey data.
 */
export function sunriseSunset(date, latitude, longitude) {
  geographicToCartesian(latitude, longitude); // Finite coordinates, valid latitude.
  const civilDate = beijingCivilDate(date);
  const midnight = Date.parse(`${civilDate}T00:00:00Z`);
  const start = midnight - BEIJING_OFFSET, end = start + DAY;
  const lon = wrapLongitude(longitude), lat = latitude * RAD;
  const result = { civilDate, sunrise: null, sunset: null };
  // Neighbouring UTC anchors matter near the dateline and for Beijing's offset.
  for (const day of [-1, 0, 1]) {
    const anchor = midnight + day * DAY;
    for (const [key, direction] of [['sunrise', -1], ['sunset', 1]]) {
      let estimate = anchor + (720 - 4 * lon) * 60000;
      for (let iteration = 0; iteration < 6; iteration++) {
        const solar = solarSubpoint(estimate), declination = solar.latitude * RAD;
        const denominator = Math.cos(lat) * Math.cos(declination);
        const cosHourAngle = (Math.cos(90.833 * RAD) - Math.sin(lat) * Math.sin(declination)) / denominator;
        if (Math.abs(denominator) < 1e-12 || Math.abs(cosHourAngle) > 1) {
          estimate = NaN; // No fabricated polar event.
          break;
        }
        const hourAngle = Math.acos(cosHourAngle) / RAD;
        estimate = anchor + (720 - 4 * lon - solar.equationOfTime + direction * 4 * hourAngle) * 60000;
      }
      if (estimate >= start && estimate < end) result[key] = new Date(Math.round(estimate));
    }
  }
  return result;
}

/** Strictly validate the self-hosted measured grid; never substitute noise. */
export function validateElevationGrid(grid) {
  if (!grid || grid.schema !== 1 || grid.units !== 'metres'
      || grid.order !== 'north-to-south rows, west-to-east columns'
      || !Number.isInteger(grid.columns) || !Number.isInteger(grid.rows)
      || grid.columns < 2 || grid.rows < 2 || grid.columns > 512 || grid.rows > 512
      || !Array.isArray(grid.elevations) || grid.elevations.length !== grid.columns * grid.rows
      || !grid.elevations.every(v => Number.isFinite(v) && v > -500 && v < 9000)) {
    throw new Error('Invalid or missing measured elevation grid');
  }
  const b = grid.bounds;
  if (!b || ![b.west, b.east, b.south, b.north].every(Number.isFinite)
      || b.west >= b.east || b.south >= b.north
      || b.west < -180 || b.east > 180 || b.south < -90 || b.north > 90) {
    throw new Error('Invalid elevation bounds');
  }
  return grid;
}

/** Local equirectangular metres, north = -Z, east = +X; heights remain measured.
 * Only display exaggeration and a uniform reference-height translation apply.
 */
export function terrainVertex(grid, row, column, exaggeration = 12, baseMetres = 2500) {
  const { west, east, south, north } = grid.bounds;
  const latitude = north - row / (grid.rows - 1) * (north - south);
  const longitude = west + column / (grid.columns - 1) * (east - west);
  const metresPerDegree = 6371008.8 * RAD;
  return {
    x: (longitude - (east + west) / 2) * metresPerDegree * Math.cos((north + south) / 2 * RAD),
    y: (grid.elevations[row * grid.columns + column] - baseMetres) * exaggeration,
    z: ((north + south) / 2 - latitude) * metresPerDegree,
  };
}

const words = {
  en: {
    earth: 'Earth: drag or use arrow keys to rotate; Home returns to Qinghai.',
    terrain: 'Central Qinghai terrain: drag or use arrow keys to orbit; Home resets the view.',
    loading: 'Loading locally hosted geographic data…',
    failed: '3D view unavailable (graphics context or local asset failure).',
    earthFallback: 'Qinghai, China: representative interior point 35.5°N, 96°E, not Xining or an official centroid. The last calculated UTC subsolar point and its timestamp are listed below. Reload to retry 3D.',
    terrainFallback: 'Central Qinghai: 94–100°E, 34–38°N. The downloadable SRTM grid contains measured elevations, not a synthetic landscape.',
    controls: 'View controls', home: 'Return to Qinghai', reset: 'Reset terrain view',
    pause: 'Pause rotation', play: 'Resume rotation', reduced: 'Rotation paused: reduced motion',
    left: 'Rotate left', right: 'Rotate right', up: 'Rotate up', down: 'Rotate down',
    earthCaption: 'NASA Blue Marble / NASA GSFC (2004 release; historical composite, not live imagery). Marker: Qinghai interior, 35.5°N 96°E, not a provincial boundary. Gold line: geometric terminator, NOAA/Meeus UTC calculation, refreshed every 10 s. Auto-rotation changes only the view, not the time.',
    terrainCaption: 'NASA/USGS SRTM v3 via Open Topo Data; February 2000 elevations. Central Qinghai subset: 94–100°E, 34–38°N, not the whole province or a boundary map. 97 × 65 samples at 0.0625° (about 5.6 × 6.9 km); WGS84 / EGM96 metres. Vertical exaggeration 12×; elevation colours, not satellite imagery. Not survey-grade.',
    legend: 'Elevation colours: green 2,500 m · ochre 4,000 m · white 6,000 m. Initial view faces north.',
    sources: 'Sources & limitations', download: 'Download measured elevation grid',
    sourceFile: 'Full provenance', daily: 'Xining · estimated', sunrise: 'Sunrise', sunset: 'Sunset',
    beijing: 'Beijing UTC+8', noEvent: 'No event',
    dailyNote: 'Daily estimates: Xining (36.6171°N, 101.7782°E), not the Qinghai marker. NOAA/Meeus, 90.833° zenith; level horizon and standard refraction. Terrain, observer elevation and actual weather are excluded.',
    qinghai: 'Qinghai',
    solar: 'Subsolar point', notice: 'Manual rotation pauses the automatic view.',
  },
  zh: {
    earth: '地球：拖动或使用方向键旋转；Home 键返回青海。',
    terrain: '青海中部地形：拖动或使用方向键环视；Home 键重置视角。',
    loading: '正在加载本地地理数据…',
    failed: '三维视图不可用（图形上下文或本地资源加载失败）。',
    earthFallback: '中国青海：省内示意点为北纬 35.5°、东经 96°，不是西宁，也不是官方地理中心。下方显示最后计算的太阳直射点及其 UTC 时间。刷新页面可重试三维视图。',
    terrainFallback: '青海中部：东经 94–100°、北纬 34–38°。可下载的 SRTM 网格包含真实高程，并非生成的山地。',
    controls: '视图控制', home: '返回青海', reset: '重置地形视角',
    pause: '暂停旋转', play: '继续旋转', reduced: '已暂停旋转：减少动态效果',
    left: '向左旋转', right: '向右旋转', up: '向上旋转', down: '向下旋转',
    earthCaption: 'NASA Blue Marble / NASA GSFC（2004 年发布，历史合成影像，非实时卫星图）。标记：青海省内北纬 35.5°、东经 96°，并非省界。金线：几何晨昏线，基于 NOAA/Meeus 算法按 UTC 每 10 秒更新。自动旋转只改变视角，不加速时间。',
    terrainCaption: 'NASA/USGS SRTM v3 高程，经 Open Topo Data 获取，采集于 2000 年 2 月。青海中部局部：东经 94–100°、北纬 34–38°，不代表全省或行政边界。97 × 65 个采样点，间距 0.0625°（约 5.6 × 6.9 千米），WGS84 / EGM96，单位米。垂直夸张 12 倍；按高程着色，并非卫星影像。不可用于测绘。',
    legend: '高程色标：绿色 2500 米 · 黄褐色 4000 米 · 白色 6000 米。初始视角面向北方。',
    sources: '来源与局限', download: '下载真实高程网格',
    sourceFile: '完整来源', daily: '西宁 · 估算', sunrise: '日出', sunset: '日落',
    beijing: '北京时间 UTC+8', noEvent: '当日无此事件',
    dailyNote: '每日估算位置：西宁（北纬 36.6171°、东经 101.7782°），并非青海示意标记。采用 NOAA/Meeus 算法、90.833° 天顶角、平坦地平线与标准折射；不含地形遮挡、观测海拔或实际天气修正。',
    qinghai: '青海',
    solar: '太阳直射点', notice: '手动旋转后自动旋转暂停。',
  },
};

/** @returns {() => void} Call on unmount; safe even before import/fetch completes. */
export function initEarth(container) { return mount(container, 'earth'); }
/** @returns {() => void} Independent viewer; no globe instance is required. */
export function initTerrain(container) { return mount(container, 'terrain'); }

function mount(container, kind) {
  if (!container?.ownerDocument || container.tagName === 'CANVAS'
      || typeof container.append !== 'function') throw new TypeError('Pass a dedicated DOM container, not a canvas');
  instances.get(container)?.();
  const doc = container.ownerDocument, win = doc.defaultView;
  const abort = new AbortController(), listeners = [], disposables = new Set();
  const media = win.matchMedia?.('(prefers-reduced-motion: reduce)');
  let disposed = false, failed = false, started = false, ready = false;
  let visible = !win.IntersectionObserver, sized = false, automatic = kind === 'earth';
  let frame = 0, timer = 0, loadTimer = 0, previous = 0, lastSolar = 0, pointer = null;
  let renderer, scene, camera, model, observer, resizeObserver, languageObserver;
  let lang = 'zh', latest = solarSubpoint(), latestDate = new Date(), daily;
  const root = doc.createElement('section');
  root.className = `earth-view earth-view--${kind}`;
  const viewport = doc.createElement('div');
  viewport.className = 'earth-viewport';
  viewport.style.width = '100%';
  viewport.style.aspectRatio = kind === 'earth' ? '1' : '4 / 3';
  const canvas = doc.createElement('canvas');
  canvas.className = 'earth-renderer';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.tabIndex = 0;
  canvas.setAttribute('role', 'img');
  canvas.hidden = true;
  const status = doc.createElement('p');
  status.className = 'earth-status';
  status.setAttribute('role', 'status');
  const controls = doc.createElement('div');
  controls.className = 'earth-controls';
  controls.setAttribute('role', 'group');
  const caption = doc.createElement('details');
  caption.className = 'earth-caption';
  const summary = doc.createElement('summary');
  const captionText = doc.createElement('p');
  const dailyNote = doc.createElement('p');
  const sourceLink = doc.createElement('a');
  sourceLink.href = new URL('../assets/earth/README.md', import.meta.url).href;
  caption.append(summary, captionText, sourceLink);
  if (kind === 'earth') caption.append(dailyNote);
  const extra = doc.createElement(kind === 'earth' ? 'div' : 'p');
  extra.className = kind === 'earth' ? 'earth-extra' : 'earth-legend';
  const utc = doc.createElement('p');
  utc.className = 'earth-utc';
  const dailyText = doc.createElement('p');
  dailyText.className = 'earth-daily';
  if (kind === 'earth') extra.append(dailyText, utc);
  const download = doc.createElement('a');
  if (kind === 'terrain') {
    download.href = DEM_URL.href;
    download.download = 'qinghai-dem.json';
    caption.append(' · ', download);
  }
  const buttons = {};
  const listen = (target, event, handler, options) => {
    target.addEventListener(event, handler, options);
    listeners.push(() => target.removeEventListener(event, handler, options));
  };
  function button(key, action) {
    const el = doc.createElement('button');
    el.type = 'button';
    el.dataset.earthAction = key;
    buttons[key] = el;
    listen(el, 'click', action);
    controls.append(el);
  }
  function manual(dx, dy) {
    if (!ready || failed) return;
    automatic = false;
    model.move(dx, dy);
    translate();
    requestDraw();
  }
  button(kind === 'earth' ? 'home' : 'reset', () => {
    if (!ready || failed) return;
    automatic = false; // Returning home stays there until the user resumes.
    model.home();
    translate();
    requestDraw();
  });
  if (kind === 'earth') button('pause', () => {
    automatic = !automatic;
    previous = 0;
    translate();
    requestDraw();
  });
  button('left', () => manual(-0.15, 0));
  button('right', () => manual(0.15, 0));
  button('up', () => manual(0, 0.12));
  button('down', () => manual(0, -0.12));
  viewport.append(canvas);
  root.append(status, viewport, controls, extra, caption);
  container.append(root);

  function solarText() {
    const t = words[lang];
    if (kind === 'terrain') { extra.textContent = t.legend; return; }
    utc.textContent = `${latestDate.toISOString().replace('T', ' ').slice(0, 19)} UTC · ${t.solar}: `
      + `${latest.latitude.toFixed(2)}°, ${latest.longitude.toFixed(2)}° (N+, E+)`;
    const civilDate = beijingCivilDate(latestDate);
    if (daily?.civilDate !== civilDate) daily = sunriseSunset(latestDate, XINING.latitude, XINING.longitude);
    // Round to the nearest minute and format explicitly in UTC+8, never host time.
    const clock = instant => instant
      ? new Date(Math.round(instant.getTime() / 60000) * 60000 + BEIJING_OFFSET).toISOString().slice(11, 16)
      : t.noEvent;
    dailyText.textContent = `${t.daily} · ${daily.civilDate} · ${t.beijing} · `
      + `${t.sunrise} ${clock(daily.sunrise)} · ${t.sunset} ${clock(daily.sunset)}`;
  }
  function translate() {
    const value = container.closest('[data-lang]')?.getAttribute('data-lang') || doc.documentElement.lang;
    lang = value?.toLowerCase().startsWith('en') ? 'en' : 'zh';
    const t = words[lang];
    root.lang = lang === 'zh' ? 'zh-CN' : 'en';
    canvas.setAttribute('aria-label', t[kind]);
    canvas.title = `${t[kind]} ${t.notice}`;
    controls.setAttribute('aria-label', t.controls);
    status.textContent = failed ? `${t.failed} ${t[`${kind}Fallback`]}` : ready ? '' : t.loading;
    status.hidden = ready && !failed;
    captionText.textContent = t[`${kind}Caption`];
    summary.textContent = t.sources;
    sourceLink.textContent = t.sourceFile;
    dailyNote.textContent = t.dailyNote;
    model?.language?.(t.qinghai);
    if (ready) requestDraw();
    download.textContent = t.download;
    for (const [key, el] of Object.entries(buttons)) {
      const text = key === 'pause' ? media?.matches ? t.reduced : automatic ? t.pause : t.play : t[key];
      el.textContent = text;
      el.setAttribute('aria-label', text);
      el.disabled = !ready || failed || (key === 'pause' && !!media?.matches);
    }
    solarText();
  }
  function active() { return visible && !doc.hidden && sized && !disposed && !failed; }
  function stop() {
    win.cancelAnimationFrame(frame);
    win.clearTimeout(timer);
    frame = timer = previous = 0;
  }
  function release() {
    for (const resource of disposables) resource.dispose();
    disposables.clear();
    if (renderer) {
      renderer.dispose();
      // Free the context as well as GPU buffers on unmount / terminal failure.
      renderer.forceContextLoss();
      renderer = null;
    }
  }
  function fail() {
    if (disposed || failed) return;
    failed = true;
    ready = false;
    stop();
    win.clearTimeout(loadTimer);
    abort.abort();
    canvas.hidden = true;
    viewport.hidden = true;
    controls.hidden = true;
    release();
    translate(); // Visible, translated text survives context / device loss.
  }
  function refreshSun() {
    latestDate = new Date();
    latest = solarSubpoint(latestDate);
    lastSolar = latestDate.getTime();
    model?.sun?.(latest);
    solarText();
  }
  function armClock() {
    win.clearTimeout(timer);
    if (kind === 'earth' && ready && active()) {
      timer = win.setTimeout(() => { timer = 0; refreshSun(); requestDraw(); armClock(); }, 10000);
    }
  }
  function render(now) {
    frame = 0;
    if (!ready || !active()) { previous = 0; return; }
    try {
      if (kind === 'earth' && Math.abs(Date.now() - lastSolar) >= 10000) refreshSun();
      const rotating = automatic && !media?.matches && !pointer;
      if (rotating && previous) model.move(-Math.min((now - previous) / 1000, 0.1) * 0.035, 0);
      previous = now;
      renderer.render(scene, camera);
      if (rotating) requestDraw();
    } catch { fail(); }
  }
  function requestDraw() {
    if (ready && active() && !frame) frame = win.requestAnimationFrame(render);
  }
  function resize() {
    const width = viewport.getBoundingClientRect().width;
    sized = width > 0;
    if (renderer && sized) {
      const height = width * (kind === 'earth' ? 1 : 0.75);
      renderer.setPixelRatio(Math.min(win.devicePixelRatio || 1, 2));
      renderer.setSize(Math.max(1, Math.round(width)), Math.max(1, Math.round(height)), false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    synchronize();
  }
  function synchronize() {
    stop();
    if (disposed || failed || !visible || doc.hidden || !sized) return;
    if (!started) { started = true; void boot(); }
    if (ready) { refreshSun(); requestDraw(); armClock(); }
  }
  async function localFile(url, type) {
    const response = await fetch(url, { signal: abort.signal });
    if (!response.ok) throw new Error(`Local asset HTTP ${response.status}`);
    return response[type]();
  }
  async function boot() {
    // Even an import or network request that never settles must not leave a spinner forever.
    loadTimer = win.setTimeout(fail, 30000);
    try {
      const T = await import(THREE_URL.href);
      if (disposed || failed) return;
      let data, image;
      if (kind === 'terrain') data = validateElevationGrid(await localFile(DEM_URL, 'json'));
      else {
        const blob = await localFile(TEXTURE_URL, 'blob');
        if (disposed || failed) return;
        // ImageBitmap orientation differs from HTMLImageElement's Texture.flipY.
        // Use HTMLImageElement deliberately; default flipY=true matches v=lat/180+.5.
        const url = URL.createObjectURL(blob);
        try {
          image = new win.Image();
          image.src = url;
          await image.decode();
        } finally { URL.revokeObjectURL(url); }
      }
      if (disposed || failed) return;
      renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
      renderer.outputColorSpace = T.SRGBColorSpace;
      renderer.setClearColor(0x050b13, 1);
      renderer.debug.onShaderError = () => { throw new Error('Earth shader compilation failed'); };
      scene = new T.Scene();
      camera = new T.PerspectiveCamera(38, 1, 0.01, 30);
      const keep = resource => { disposables.add(resource); return resource; };
      model = kind === 'earth'
        ? makeEarth(T, scene, camera, image, keep)
        : makeTerrain(T, scene, camera, data, keep);
      ready = true;
      canvas.hidden = false;
      translate();
      resize();
    } catch { if (!disposed) fail(); }
    finally { win.clearTimeout(loadTimer); }
  }

  listen(canvas, 'webglcontextlost', event => { event.preventDefault(); fail(); });
  listen(canvas, 'webglcontextcreationerror', fail);
  listen(canvas, 'pointerdown', event => {
    if (!ready || failed || event.button !== 0 || pointer) return;
    automatic = false;
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
    canvas.setPointerCapture?.(event.pointerId);
    canvas.focus({ preventScroll: true });
    translate();
  });
  listen(canvas, 'pointermove', event => {
    if (!pointer || pointer.id !== event.pointerId) return;
    const width = Math.max(1, canvas.getBoundingClientRect().width);
    manual(-(event.clientX - pointer.x) / width * Math.PI, (event.clientY - pointer.y) / width * Math.PI);
    pointer.x = event.clientX; pointer.y = event.clientY;
  });
  const endDrag = event => {
    if (!pointer || event.pointerId !== pointer.id) return;
    pointer = null;
    if (canvas.hasPointerCapture?.(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    requestDraw();
  };
  for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) listen(canvas, event, endDrag);
  // Suppress only single-finger gestures on the viewer; no global scroll or CSS changes.
  for (const event of ['touchstart', 'touchmove']) {
    listen(canvas, event, e => { if (e.touches.length === 1) e.preventDefault(); }, { passive: false });
  }
  listen(canvas, 'keydown', event => {
    const delta = { ArrowLeft: [-0.15, 0], ArrowRight: [0.15, 0], ArrowUp: [0, 0.12], ArrowDown: [0, -0.12] }[event.key];
    if (delta) { event.preventDefault(); manual(...delta); }
    if (event.key === 'Home') { event.preventDefault(); buttons[kind === 'earth' ? 'home' : 'reset'].click(); }
  });
  listen(doc, 'languagechange', translate);
  listen(win, 'languagechange', translate);
  listen(doc, 'visibilitychange', synchronize);
  listen(win, 'resize', resize);
  if (media) listen(media, 'change', () => { translate(); synchronize(); });
  if (win.MutationObserver) {
    languageObserver = new win.MutationObserver(translate);
    // Ancestor-only observation avoids reacting to our own translated DOM.
    for (let node = container; node; node = node.parentElement) {
      languageObserver.observe(node, { attributes: true, attributeFilter: ['data-lang', 'lang'] });
    }
  }
  if (win.IntersectionObserver) {
    observer = new win.IntersectionObserver(entries => {
      visible = entries.at(-1).isIntersecting;
      synchronize();
    }, { threshold: 0 });
    observer.observe(viewport);
  } else {
    const check = () => {
      const box = viewport.getBoundingClientRect();
      visible = box.bottom > 0 && box.top < win.innerHeight && box.right > 0 && box.left < win.innerWidth;
      synchronize();
    };
    listen(win, 'scroll', check, { passive: true, capture: true });
    listen(win, 'resize', check);
    check();
  }
  if (win.ResizeObserver) {
    resizeObserver = new win.ResizeObserver(resize);
    resizeObserver.observe(viewport);
  }
  translate();
  resize();
  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    abort.abort();
    stop();
    win.clearTimeout(loadTimer);
    observer?.disconnect();
    resizeObserver?.disconnect();
    languageObserver?.disconnect();
    for (const remove of listeners) remove();
    if (pointer && canvas.hasPointerCapture?.(pointer.id)) canvas.releasePointerCapture(pointer.id);
    pointer = null;
    release();
    root.remove(); // Never remove unrelated container contents.
    if (instances.get(container) === cleanup) instances.delete(container);
  };
  instances.set(container, cleanup);
  return cleanup;
}

function makeEarth(T, scene, camera, image, keep) {
  const texture = keep(new T.Texture(image));
  texture.colorSpace = T.SRGBColorSpace;
  texture.wrapS = T.RepeatWrapping;
  texture.needsUpdate = true;
  const sun = new T.Vector3();
  const surface = keep(new T.ShaderMaterial({
    uniforms: { earthMap: { value: texture }, sunDirection: { value: sun } },
    vertexShader: `
      varying vec2 earthUV;
      varying vec3 earthNormal;
      void main() {
        earthUV = uv;
        earthNormal = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      uniform sampler2D earthMap;
      uniform vec3 sunDirection;
      varying vec2 earthUV;
      varying vec3 earthNormal;
      void main() {
        float incidence = dot(normalize(earthNormal), sunDirection);
        float day = smoothstep(-0.00465, 0.00465, incidence);
        vec3 albedo = texture2D(earthMap, earthUV).rgb;
        // Tiny illustrative night fill preserves context; not night-time imagery.
        float light = 0.028 + day * (0.12 + 0.85 * sqrt(max(incidence, 0.0)));
        gl_FragColor = vec4(albedo * light, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  }));
  scene.add(new T.Mesh(keep(new T.SphereGeometry(1, 128, 64)), surface));
  const marker = new T.Mesh(keep(new T.SphereGeometry(0.013, 16, 12)),
    keep(new T.MeshBasicMaterial({ color: 0x71e3ff })));
  const point = geographicToCartesian(QINGHAI.latitude, QINGHAI.longitude, 1.008);
  marker.position.set(point.x, point.y, point.z);
  scene.add(marker);
  const halo = new T.Mesh(keep(new T.RingGeometry(0.023, 0.027, 40)),
    keep(new T.MeshBasicMaterial({ color: 0x71e3ff, side: T.DoubleSide })));
  halo.position.copy(marker.position).multiplyScalar(1.002);
  halo.quaternion.setFromUnitVectors(new T.Vector3(0, 0, 1), marker.position.clone().normalize());
  scene.add(halo);
  // Billboard label is a GPU sprite, so it needs no positioning CSS and follows
  // the actual marker. Hide it behind the globe rather than showing through it.
  const labelCanvas = image.ownerDocument.createElement('canvas');
  labelCanvas.width = 256;
  labelCanvas.height = 80;
  const labelContext = labelCanvas.getContext('2d');
  const labelTexture = keep(new T.CanvasTexture(labelCanvas));
  labelTexture.colorSpace = T.SRGBColorSpace;
  const label = new T.Sprite(keep(new T.SpriteMaterial({
    map: labelTexture, depthTest: false, depthWrite: false, transparent: true,
  })));
  label.position.copy(marker.position);
  label.center.set(-0.15, 0.5);
  label.scale.set(0.32, 0.1, 1);
  label.renderOrder = 2;
  scene.add(label);
  let labelText;
  const ringPositions = new Float32Array(256 * 3);
  const ringGeometry = keep(new T.BufferGeometry());
  ringGeometry.setAttribute('position', new T.BufferAttribute(ringPositions, 3));
  const terminator = new T.LineLoop(ringGeometry, keep(new T.LineBasicMaterial({
    color: 0xf0c676, transparent: true, opacity: 0.72,
  })));
  terminator.frustumCulled = false;
  scene.add(terminator);
  let latitude, longitude;
  function updateCamera() {
    const p = geographicToCartesian(latitude / RAD, longitude / RAD, 3.35);
    camera.position.set(p.x, p.y, p.z);
    camera.lookAt(0, 0, 0);
    label.visible = marker.position.clone().normalize().dot(camera.position) > 1.01;
  }
  const model = {
    move(dx, dy) {
      longitude += dx;
      latitude = Math.max(-80 * RAD, Math.min(80 * RAD, latitude + dy));
      updateCamera();
    },
    home() { latitude = QINGHAI.latitude * RAD; longitude = QINGHAI.longitude * RAD; updateCamera(); },
    language(text) {
      if (text === labelText) return;
      labelText = text;
      labelContext.clearRect(0, 0, 256, 80);
      labelContext.fillStyle = 'rgba(5,11,19,0.85)';
      labelContext.fillRect(0, 0, 256, 80);
      labelContext.font = '44px system-ui, sans-serif';
      labelContext.textAlign = 'center';
      labelContext.textBaseline = 'middle';
      labelContext.fillStyle = '#a8efff';
      labelContext.fillText(text, 128, 42);
      labelTexture.needsUpdate = true;
    },
    sun(subpoint) {
      const p = geographicToCartesian(subpoint.latitude, subpoint.longitude);
      sun.set(p.x, p.y, p.z);
      const u = new T.Vector3(0, 1, 0).cross(sun).normalize();
      const v = sun.clone().cross(u).normalize();
      for (let i = 0; i < 256; i++) {
        const a = i / 256 * Math.PI * 2, c = Math.cos(a) * 1.002, s = Math.sin(a) * 1.002;
        ringPositions.set([u.x * c + v.x * s, u.y * c + v.y * s, u.z * c + v.z * s], i * 3);
      }
      ringGeometry.attributes.position.needsUpdate = true;
    },
  };
  model.home();
  return model;
}

function makeTerrain(T, scene, camera, grid, keep) {
  const count = grid.rows * grid.columns, positions = new Float32Array(count * 3);
  const colours = new Float32Array(count * 3), indices = [];
  const widthMetres = terrainVertex(grid, 0, grid.columns - 1).x * 2;
  const scale = 2.6 / widthMetres;
  const low = new T.Color(0x557c59), mid = new T.Color(0xb0a071), high = new T.Color(0xf1f1ec);
  for (let row = 0; row < grid.rows; row++) {
    for (let col = 0; col < grid.columns; col++) {
      const i = row * grid.columns + col, p = terrainVertex(grid, row, col);
      positions.set([p.x * scale, p.y * scale, p.z * scale], i * 3);
      const height = grid.elevations[i];
      const color = height < 4000
        ? low.clone().lerp(mid, Math.max(0, Math.min(1, (height - 2500) / 1500)))
        : mid.clone().lerp(high, Math.max(0, Math.min(1, (height - 4000) / 2000)));
      colours.set([color.r, color.g, color.b], i * 3);
      if (row < grid.rows - 1 && col < grid.columns - 1) {
        // North-to-south rows: winding must face +Y, not below the terrain.
        indices.push(i, i + grid.columns, i + 1, i + 1, i + grid.columns, i + grid.columns + 1);
      }
    }
  }
  const geometry = keep(new T.BufferGeometry());
  geometry.setAttribute('position', new T.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new T.BufferAttribute(colours, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const material = keep(new T.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0 }));
  scene.add(new T.Mesh(geometry, material));
  scene.add(new T.HemisphereLight(0xcbe7ff, 0x40452d, 2));
  const light = new T.DirectionalLight(0xfff0dc, 2.6);
  light.position.set(-2, 4, -3);
  scene.add(light); // Cartographic hillshade, deliberately NOT live solar illumination.
  let azimuth = 0, elevation = 0.85;
  function updateCamera() {
    const distance = 5.4;
    camera.position.set(distance * Math.cos(elevation) * Math.sin(azimuth),
      distance * Math.sin(elevation), distance * Math.cos(elevation) * Math.cos(azimuth));
    camera.lookAt(0, 0.08, 0);
  }
  updateCamera();
  return {
    move(dx, dy) { azimuth += dx; elevation = Math.max(0.2, Math.min(1.48, elevation + dy)); updateCamera(); },
    home() { azimuth = 0; elevation = 0.85; updateCamera(); },
  };
}
