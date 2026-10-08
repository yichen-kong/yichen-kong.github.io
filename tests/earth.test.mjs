import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { SphereGeometry, REVISION } from '../assets/vendor/earth/three.module.min.js';
import {
  QINGHAI,
  geographicToCartesian,
  geographicToUV,
  initEarth,
  initTerrain,
  solarSubpoint,
  sunriseSunset,
  terrainVertex,
  validateElevationGrid,
  wrapLongitude,
} from '../js/earth.js';

const close = (actual, expected, tolerance, message) => {
  assert.ok(Math.abs(actual - expected) <= tolerance,
    `${message}: expected ${expected} ± ${tolerance}, got ${actual}`);
};

test('geographic transform follows Three.js SphereGeometry convention', () => {
  assert.deepEqual(geographicToCartesian(0, 0), { x: 1, y: 0, z: -0 });
  close(geographicToCartesian(90, 0).y, 1, 1e-12, 'north pole y');
  close(geographicToCartesian(0, 90).z, -1, 1e-12, '90E z');
  const uv = geographicToUV(35.5, 96);
  close(uv.u, (96 + 180) / 360, 1e-12, 'longitude u');
  close(uv.v, (35.5 + 90) / 180, 1e-12, 'latitude v');
});

test('solar subpoint reaches the expected equinoctial and solstitial declinations', () => {
  // UTC instants are the 2024 astronomical events; longitude is tested too,
  // so the function cannot accidentally use local time or a fixed meridian.
  const cases = [
    ['2024-03-20T03:06:00Z', 0, 135.35],
    ['2024-06-20T20:51:00Z', 23.44, -132.3],
    ['2024-09-22T12:44:00Z', 0, -12.9],
    ['2024-12-21T09:20:00Z', -23.44, 39.6],
  ];
  for (const [instant, expectedLatitude, expectedLongitude] of cases) {
    const point = solarSubpoint(new Date(instant));
    close(point.latitude, expectedLatitude, 0.02, `${instant} latitude`);
    close(point.longitude, expectedLongitude, 0.08, `${instant} longitude`);
  }
});

test('solar subpoint changes with UTC time at roughly 15 degrees per hour', () => {
  const noon = solarSubpoint(new Date('2024-03-20T12:00:00Z'));
  const oneHourLater = solarSubpoint(new Date('2024-03-20T13:00:00Z'));
  close(oneHourLater.longitude - noon.longitude, -15, 0.05, 'longitude rate');
});

test('Xining October 7, 2026 sunrise/sunset estimates match 07:12 / 18:48 Beijing within five minutes', () => {
  const events = sunriseSunset('2026-10-07', 36.6171, 101.7782);
  assert.equal(events.civilDate, '2026-10-07');
  assert.ok(events.sunrise instanceof Date && events.sunset instanceof Date);
  close(events.sunrise.getTime(), Date.parse('2026-10-06T23:12:00Z'), 5 * 60000, 'sunrise UTC');
  close(events.sunset.getTime(), Date.parse('2026-10-07T10:48:00Z'), 5 * 60000, 'sunset UTC');
  // Fixed-horizon apparent events must agree with the geometric solar model.
  for (const event of [events.sunrise, events.sunset]) {
    const solar = solarSubpoint(event);
    const sun = geographicToCartesian(solar.latitude, solar.longitude);
    const observer = geographicToCartesian(36.6171, 101.7782);
    const altitude = Math.asin(sun.x * observer.x + sun.y * observer.y + sun.z * observer.z) * 180 / Math.PI;
    close(altitude, -0.833, 0.001, 'solar centre altitude at apparent event');
  }
});

test('daily events select the Beijing civil date, including midnight and month/year boundaries', () => {
  const expected = sunriseSunset('2026-10-07', 36.6171, 101.7782);
  for (const value of [
    new Date('2026-10-06T16:00:00Z'),
    new Date('2026-10-07T23:59:59+08:00'),
    Date.parse('2026-10-07T02:00:00Z'),
  ]) assert.deepEqual(sunriseSunset(value, 36.6171, 101.7782), expected);
  assert.equal(sunriseSunset(new Date('2026-10-07T16:00:00Z'), 36.6171, 101.7782).civilDate, '2026-10-08');
  assert.equal(sunriseSunset(new Date('2026-12-31T16:00:00Z'), 36.6171, 101.7782).civilDate, '2027-01-01');
});

test('daily estimates are invariant under the host timezone', () => {
  const moduleURL = new URL('../js/earth.js', import.meta.url).href;
  const script = `import {sunriseSunset} from ${JSON.stringify(moduleURL)};
    console.log(JSON.stringify(sunriseSunset(new Date('2026-10-06T20:00:00Z'),36.6171,101.7782)));`;
  const outputs = ['UTC', 'Asia/Shanghai', 'America/Los_Angeles'].map(TZ =>
    execFileSync(process.execPath, ['--input-type=module', '-e', script], {
      encoding: 'utf8', env: { ...process.env, TZ },
    }).trim());
  assert.equal(new Set(outputs).size, 1);
});

test('daily estimates reject invalid input and explicitly return null during polar day/night', () => {
  for (const value of ['2026-02-30', 'not-a-date', new Date(NaN), undefined]) {
    assert.throws(() => sunriseSunset(value, 36.6171, 101.7782), RangeError);
  }
  assert.throws(() => sunriseSunset('2026-10-07', 91, 0), RangeError);
  for (const date of ['2026-06-21', '2026-12-21']) {
    assert.deepEqual(sunriseSunset(date, 80, 0), { civilDate: date, sunrise: null, sunset: null });
  }
  for (const longitude of [-179, 179]) {
    const events = sunriseSunset('2026-10-07', 0, longitude);
    for (const event of [events.sunrise, events.sunset]) {
      assert.ok(event instanceof Date);
      assert.equal(new Date(event.getTime() + 8 * 3600000).toISOString().slice(0, 10), '2026-10-07');
    }
  }
});

test('equation of time is included: apparent solar noon is not always 0E at 12 UTC', () => {
  const point = solarSubpoint(new Date('2024-11-03T12:00:00Z'));
  close(point.equationOfTime, 16.49, 0.03, 'November equation of time (minutes)');
  close(point.longitude, -4.122, 0.01, 'east-positive solar longitude');
});

test('solar output is independent of timezone notation, includes seconds and handles midnight', () => {
  assert.deepEqual(solarSubpoint(new Date('2024-06-21T04:51:00+08:00')),
    solarSubpoint(new Date('2024-06-20T20:51:00Z')));
  const before = solarSubpoint(new Date('2024-12-31T23:59:59Z'));
  const after = solarSubpoint(new Date('2025-01-01T00:00:01Z'));
  close(wrapLongitude(after.longitude - before.longitude), -2 / 240, 0.00001, 'UTC midnight continuity');
  assert.throws(() => solarSubpoint(new Date(NaN)), RangeError);
});

test('geographic UVs match the actual vendored SphereGeometry (no flipped or shifted continents)', () => {
  assert.equal(REVISION, '180');
  const geometry = new SphereGeometry(1, 32, 16);
  const uv = geometry.attributes.uv, positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const latitude = uv.getY(i) * 180 - 90;
    const longitude = uv.getX(i) * 360 - 180;
    const point = geographicToCartesian(latitude, longitude);
    close(point.x, positions.getX(i), 1e-6, `vertex ${i} x`);
    close(point.y, positions.getY(i), 1e-6, `vertex ${i} y`);
    close(point.z, positions.getZ(i), 1e-6, `vertex ${i} z`);
  }
  geometry.dispose();
});

test('independent atlas pixel anchors place north at image top and east to the right', () => {
  // Source image QA: Greenwich-centred 2048x1024 NASA atlas, not a Pacific-
  // centred map. Image pixels have top-left origin; WebGL v has bottom origin.
  for (const [latitude, longitude, x, y] of [
    [0, 0, 1024, 512], [90, 0, 1024, 0], [-90, 0, 1024, 1024],
    [35.5, 96, 1570.133333, 310.044444],
    [0, -90, 512, 512], [0, 90, 1536, 512],
  ]) {
    const uv = geographicToUV(latitude, longitude);
    close(uv.u * 2048, x, 0.00001, 'atlas image x');
    close((1 - uv.v) * 1024, y, 0.00001, 'atlas image y');
  }
});

test('Qinghai marker is an interior representative, not the previous Xining point', () => {
  assert.deepEqual(QINGHAI, { latitude: 35.5, longitude: 96 });
  const point = geographicToCartesian(QINGHAI.latitude, QINGHAI.longitude);
  close(Math.hypot(point.x, point.y, point.z), 1, 1e-12, 'unit vector');
  assert.ok(point.y > 0 && point.x < 0 && point.z < 0);
});

test('coordinates validate latitude, radius and finite values; longitude wraps at the seam', () => {
  for (const args of [[91, 0], [0, NaN], [0, 0, -1], [-Infinity, 10]]) {
    assert.throws(() => geographicToCartesian(...args), RangeError);
  }
  assert.equal(wrapLongitude(180), -180);
  assert.equal(wrapLongitude(-540), -180);
  assert.deepEqual(geographicToUV(0, 180), { u: 0, v: 0.5 });
  assert.deepEqual(geographicToUV(-90, 0), { u: 0.5, v: 0 });
});

test('the terminator plane is perpendicular to the solar vector at all four seasons', () => {
  for (const month of [2, 5, 8, 11]) {
    const p = solarSubpoint(new Date(Date.UTC(2024, month, 21, 12)));
    const sun = geographicToCartesian(p.latitude, p.longitude);
    for (const lon of [p.longitude - 90, p.longitude + 90]) {
      const equatorialTerminator = geographicToCartesian(0, lon);
      close(sun.x * equatorialTerminator.x + sun.y * equatorialTerminator.y
        + sun.z * equatorialTerminator.z, 0, 1e-12, 'terminator dot product');
    }
  }
});

test('terrain samples preserve geographic direction and measured heights', () => {
  const grid = validateElevationGrid({
    schema: 1,
    units: 'metres',
    order: 'north-to-south rows, west-to-east columns',
    bounds: { west: 94, east: 96, south: 34, north: 36 },
    columns: 2,
    rows: 2,
    elevations: [4000, 5000, 2500, 3000],
  });
  const northWest = terrainVertex(grid, 0, 0, 1, 0);
  const southEast = terrainVertex(grid, 1, 1, 1, 0);
  assert.ok(northWest.z < southEast.z, 'north is negative local z');
  assert.ok(northWest.x < southEast.x, 'east is positive local x');
  close(northWest.y, 4000, 1e-9, 'height is retained');
  close(southEast.y, 3000, 1e-9, 'height is retained');
});

test('self-hosted DEM has complete real samples, explicit provenance and a stable checksum', async () => {
  const raw = await readFile(new URL('../assets/earth/qinghai-dem.json', import.meta.url));
  const grid = validateElevationGrid(JSON.parse(raw));
  assert.equal(grid.columns, 97);
  assert.equal(grid.rows, 65);
  assert.equal(grid.elevations.length, 6305);
  assert.equal(grid.source.endpoint, 'https://api.opentopodata.org/v1/srtm90m');
  assert.equal(grid.horizontalDatum, 'WGS84');
  assert.equal(grid.verticalDatum, 'EGM96 orthometric height');
  assert.equal(Math.min(...grid.elevations), 910);
  assert.equal(Math.max(...grid.elevations), 6241);
  assert.equal(createHash('sha256').update(raw).digest('hex'),
    'f7040bd0eef44d3649f4abb79608b2a80da0286b745d66949836de8eca9d3711');
  const center = terrainVertex(grid, 32, 48, 1, 0);
  close(center.x, 0, 1e-9, 'grid centre x');
  close(center.z, 0, 1e-9, 'grid centre z');
  assert.equal(center.y, grid.elevations[32 * 97 + 48]);
  for (const invalid of [
    { ...grid, elevations: grid.elevations.slice(1) },
    { ...grid, elevations: grid.elevations.map((v, i) => i ? v : null) },
    { ...grid, bounds: { ...grid.bounds, west: 105 } },
    { ...grid, order: 'south-to-north' },
    { ...grid, rows: 513 },
  ]) assert.throws(() => validateElevationGrid(invalid));
});

test('self-hosted texture and complete Three.js module graph match verified upstream assets', async () => {
  const checksums = {
    '../assets/earth/blue-marble-2048.jpg':
      'ba4aabca5e27f29cffdc8a732cac1f7e3e83867388a1002dd501cb0ad342b10a',
    '../assets/vendor/earth/three.module.min.js':
      'e2b5ee6bccd38fd6d8a2428546b83c5f2426d84b152ef82be8055556e3b40eb6',
    '../assets/vendor/earth/three.core.min.js':
      '61ba0df005b05991361d040d8ff670e1aadfd0ce7aeebd1fdb0725957a8957de',
  };
  for (const [path, hash] of Object.entries(checksums)) {
    const bytes = await readFile(new URL(path, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), hash, path);
  }
  const license = await readFile(new URL('../assets/vendor/earth/LICENSE', import.meta.url), 'utf8');
  assert.match(license, /The MIT License/);
  assert.match(license, /three\.js authors/);
});

// Minimal offscreen DOM harness: exercises cleanup without npm/jsdom, GPU or
// network. Visible rendering is separately tested in a real WebGL2 browser.
function offscreenDOM() {
  const listeners = new Map();
  class Target {
    addEventListener(type, fn) {
      const key = this;
      if (!listeners.has(key)) listeners.set(key, new Map());
      const events = listeners.get(key);
      if (!events.has(type)) events.set(type, new Set());
      events.get(type).add(fn);
    }
    removeEventListener(type, fn) { listeners.get(this)?.get(type)?.delete(fn); }
    fire(type) { for (const fn of listeners.get(this)?.get(type) || []) fn({ type, preventDefault() {} }); }
  }
  const observers = [];
  class Observer {
    constructor(callback) { this.callback = callback; this.connected = true; observers.push(this); }
    observe() {}
    disconnect() { this.connected = false; }
  }
  const doc = new Target();
  class Element extends Target {
    constructor(tag) {
      super(); this.tagName = tag.toUpperCase(); this.ownerDocument = doc;
      this.children = []; this.attributes = {}; this.style = {}; this.dataset = {};
    }
    append(...children) {
      for (const child of children) {
        if (typeof child !== 'string') child.parentElement = this;
        this.children.push(child);
      }
    }
    remove() {
      this.parentElement.children = this.parentElement.children.filter(child => child !== this);
    }
    setAttribute(key, value) { this.attributes[key] = value; }
    getAttribute(key) { return this.attributes[key] ?? null; }
    closest() { return doc.documentElement; }
    getBoundingClientRect() { return { width: 480, height: 480, top: 2000, bottom: 2480 }; }
  }
  doc.createElement = tag => new Element(tag);
  doc.documentElement = new Element('html');
  doc.documentElement.setAttribute('data-lang', 'en');
  const win = new Target();
  win.matchMedia = () => Object.assign(new Target(), { matches: false });
  win.IntersectionObserver = win.ResizeObserver = win.MutationObserver = Observer;
  win.cancelAnimationFrame = win.clearTimeout = () => {};
  win.requestAnimationFrame = () => { throw new Error('Offscreen RAF must not be scheduled'); };
  doc.defaultView = win;
  const container = new Element('div');
  container.parentElement = doc.documentElement;
  const countListeners = () => [...listeners.values()].reduce((sum, events) =>
    sum + [...events.values()].reduce((s, handlers) => s + handlers.size, 0), 0);
  return { doc, container, observers, countListeners };
}

test('initializers return synchronous idempotent cleanup; preserve unrelated content', () => {
  for (const init of [initEarth, initTerrain]) {
    const env = offscreenDOM();
    const existing = env.doc.createElement('p');
    env.container.append(existing);
    const cleanup = init(env.container);
    assert.equal(typeof cleanup, 'function');
    assert.equal(env.container.children.length, 2);
    assert.ok(env.countListeners() > 0);
    cleanup();
    cleanup();
    assert.deepEqual(env.container.children, [existing]);
    assert.equal(env.countListeners(), 0);
    assert.ok(env.observers.every(observer => !observer.connected));
  }
});

test('reinitialization cleans the previous instance, and languagechange updates labels', () => {
  const env = offscreenDOM();
  const first = initEarth(env.container);
  const oldRoot = env.container.children[0];
  const second = initEarth(env.container);
  assert.equal(env.container.children.length, 1);
  assert.notEqual(env.container.children[0], oldRoot);
  first(); // Old cleanup cannot destroy the replacement instance.
  const controls = env.container.children[0].children[2];
  assert.equal(controls.children[0].textContent, 'Return to Qinghai');
  env.doc.documentElement.setAttribute('data-lang', 'zh');
  env.doc.fire('languagechange');
  assert.equal(controls.children[0].textContent, '返回青海');
  second();
  assert.equal(env.countListeners(), 0);
});

test('daily UI is Earth-only, bilingual, and long provenance is collapsed in native details', () => {
  for (const init of [initEarth, initTerrain]) {
    const env = offscreenDOM();
    const cleanup = init(env.container);
    const root = env.container.children[0], extra = root.children[3], details = root.children[4];
    assert.equal(details.tagName, 'DETAILS');
    assert.notEqual(details.open, true);
    assert.equal(details.children[0].tagName, 'SUMMARY');
    assert.equal(details.children[0].textContent, 'Sources & limitations');
    if (init === initEarth) {
      assert.equal(extra.children[0].className, 'earth-daily');
      assert.match(extra.children[0].textContent, /Xining · estimated.*Beijing UTC\+8.*Sunrise \d\d:\d\d.*Sunset \d\d:\d\d/);
      assert.match(details.children[3].textContent, /Terrain.*excluded/);
    } else {
      assert.equal(extra.className, 'earth-legend');
      assert.equal(extra.children.length, 0);
    }
    env.doc.documentElement.setAttribute('data-lang', 'zh');
    env.doc.fire('languagechange');
    assert.equal(details.children[0].textContent, '来源与局限');
    if (init === initEarth) assert.match(extra.children[0].textContent, /西宁 · 估算.*北京时间 UTC\+8.*日出.*日落/);
    cleanup();
  }
});

test('the old 2D canvas and invalid hosts fail early with a clear integration error', () => {
  assert.throws(() => initEarth(null), TypeError);
  assert.throws(() => initTerrain({ ownerDocument: {}, tagName: 'CANVAS', append() {} }), /not a canvas/);
});

test('context failure leaves translated text and usable source links instead of a blank canvas', () => {
  for (const init of [initEarth, initTerrain]) {
    const env = offscreenDOM();
    const cleanup = init(env.container);
    const root = env.container.children[0];
    const [status, viewport, controls] = root.children;
    viewport.children[0].fire('webglcontextlost');
    assert.equal(viewport.hidden, true);
    assert.equal(controls.hidden, true);
    assert.equal(status.hidden, false);
    assert.match(status.textContent, /3D view unavailable/);
    env.doc.documentElement.setAttribute('data-lang', 'zh');
    env.doc.fire('languagechange');
    assert.match(status.textContent, /三维视图不可用/);
    const caption = root.children[4];
    assert.match(caption.children[2].href, /assets\/earth\/README\.md$/);
    cleanup();
    assert.equal(env.countListeners(), 0);
  }
});
