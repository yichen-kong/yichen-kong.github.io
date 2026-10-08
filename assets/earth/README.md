# Earth and Qinghai terrain assets

## Earth texture

`blue-marble-2048.jpg` is a local JPEG conversion of NASA Goddard Space Flight
Center Scientific Visualization Studio's **Blue Marble - A Seamless Image
Mosaic of the Earth**, released February 16, 2004:

- source record: <https://svs.gsfc.nasa.gov/2915/>
- source file: <https://svs.gsfc.nasa.gov/vis/a000000/a002900/a002915/bluemarble-2048.png>
- required credit: NASA/Goddard Space Flight Center Scientific Visualization Studio
- Blue Marble data credit: Reto Stockli (NASA/GSFC), NASA's Earth Observatory
- animator credited by NASA SVS: Eric Sokolowsky
- downloaded 2026-10-07; original 2048 × 1024 pixels, unchanged framing/orientation
- conversion: Pillow RGB JPEG, quality 92, optimize=True; no invented geography
- NASA media guidance: <https://www.nasa.gov/nasa-brand-center/images-and-media/>

NASA's media guidance says that NASA factual material may generally be used for
educational/informational purposes, including web pages and computer graphical
simulations, with NASA acknowledged as the source. This is a historical
composite, not current satellite imagery.

The original PNG SHA-256 is
`ae6214b078ed0864c96f74bcb10ae3021f6eb116f8059797efe0fa9ea8b89d35`.
The shipped JPEG SHA-256 is
`ba4aabca5e27f29cffdc8a732cac1f7e3e83867388a1002dd501cb0ad342b10a`.
The redundant source PNG is not shipped.

## Terrain

`qinghai-dem.json` is a self-hosted, point-sampled subset of NASA/USGS SRTMGL3
Version 3 (SRTM 90 m) queried through the public Open Topo Data API:

- dataset documentation: <https://www.opentopodata.org/datasets/srtm/>
- product DOI: <https://doi.org/10.5067/MEaSUREs/SRTM/SRTMGL3.003>
- query endpoint: `https://api.opentopodata.org/v1/srtm90m`

It covers 94–100°E, 34–38°N with 97 × 65 samples at 0.0625° spacing. The
website renders the grid as a separate local-coordinate 3D surface and applies
12× vertical display exaggeration. Elevations remain metres above the stated
EGM96 datum; this is not survey-grade and is not a province boundary dataset.
`sample-dem.py` documents a reproducible, rate-limited regeneration process.
Acquired February 11–22, 2000; sampled October 7, 2026 using bilinear queries.
The 6,305 returned samples range from 910 to 6,241 m. The spacing is about
5.6 km east-west at 36°N and 6.9 km north-south, **not 90 m display detail**.
They are point samples, not area averages; interpolation misses narrow peaks.
The rectangle is a central regional subset, not clipped to the Qinghai border;
do not interpret its edges as administrative boundaries. Hillshade uses fixed
cartographic lighting, not the globe's live Sun. Green/ochre/white are elevation
colours, not land-cover classifications. Equirectangular local metric projection
uses cos(36°) for east-west scale. Vertical datum EGM96, horizontal datum WGS84.

SRTM is NASA/USGS public elevation data; provider documentation identifies the
public API dataset as Version 3. No fabricated fallback or runtime elevation
service is used. Regeneration takes 64 API requests (100 points maximum, at
least 1.1 seconds between calls); it aborts on missing/non-finite elevations.
The JSON includes its query method, extent, sampling order, date and source.
SHA-256:
`f7040bd0eef44d3649f4abb79608b2a80da0286b745d66949836de8eca9d3711`.

## Three.js

`../vendor/earth/three.module.min.js` **and its required relative dependency**
`../vendor/earth/three.core.min.js` are the browser ES module builds of
Three.js v0.180.0, installed from the official npm package. The accompanying
`../vendor/earth/LICENSE` is the upstream MIT license.

- package: <https://registry.npmjs.org/three/-/three-0.180.0.tgz>
- npm integrity: `sha512-o+qycAMZrh+TsE01GqWUxUIKR1AL0S8pq7zDkYOQw8GqfX8b8VoCKYUoHbhiX5j+7hr8XsuHDVU6+gkQJQKg9w==`
- module SHA-256: `e2b5ee6bccd38fd6d8a2428546b83c5f2426d84b152ef82be8055556e3b40eb6`
- core SHA-256: `61ba0df005b05991361d040d8ff670e1aadfd0ce7aeebd1fdb0725957a8957de`
- renderer documentation: <https://threejs.org/docs/pages/WebGLRenderer.html>
- mapping reference: `src/geometries/SphereGeometry.js` in that exact npm archive.

No package-root installation, CDN, import map or build step is needed.

## Solar calculation and mapping

Primary references:

- <https://gml.noaa.gov/grad/solcalc/calcdetails.html>
- <https://gml.noaa.gov/grad/solcalc/main.js>

The implementation follows NOAA's Meeus-based apparent declination and equation
of time (NOAA now marks its web calculator unmaintained). It uses Julian
centuries from the actual UTC instant, including seconds, then computes
east-positive longitude as `180 - UTC_minutes/4 - equation_of_time_minutes/4`.
Longitude is wrapped to [-180, 180). The geometric terminator is the great
circle perpendicular to this vector; its line and shading share the same vector.
This is an educational spherical visualization, not an ephemeris/navigation
service: it omits UT1 corrections, terrain horizon and atmospheric refraction.
The narrow shading transition approximates the solar disk; the night side has
a small illustrative fill and is not night satellite imagery.

The Greenwich-centred equirectangular texture runs west to east from -180° to
180° and north to south from 90° to -90°. Three SphereGeometry has +Y north,
+X at Greenwich, and -Z at 90°E. HTMLImageElement textures retain default
`flipY=true`; texture `u=(lon+180)/360`, `v=(lat+90)/180`, with sRGB decoding.
Tests compare geographic vectors with the actual vendored sphere vertices.
The globe stays in Earth-fixed coordinates; automatic rotation moves the camera
only. Consequently dragging cannot move the terminator relative to geography.

Qinghai is marked by a deliberately chosen **representative interior point**
(35.5°N, 96°E), not Xining, not an official centroid, and not a province polygon.

## Integration contract

```js
const { initEarth, initTerrain } = await import('./js/earth.js');
const disposeEarth = initEarth(earthContainer);
const disposeTerrain = initTerrain(terrainContainer);
// On route/section teardown:
disposeEarth();
disposeTerrain();
```

Use separate dedicated block containers, not the old 2D canvas. Both return
cleanup synchronously, even while loading. Reinitializing the same container
cleans the prior viewer. Existing unrelated children are retained.

The module injects semantic DOM with `earth-view`, `earth-viewport`,
`earth-renderer`, `earth-controls`, `earth-caption`, `earth-status`,
`earth-utc` and `earth-legend` classes. It adds only inline width, height and
aspect-ratio sizing, **no stylesheet**. Host CSS may style these classes.
The module follows the nearest ancestor `[data-lang]` (then document language)
and `languagechange` on document/window; changes to ancestor language attributes
are observed too. Buttons and keyboard instructions are translated zh/en.

The library and each viewer's assets load only when intersecting and the
document is visible. Frames stop offscreen/hidden, and auto-rotation stops under
reduced motion. While paused/reduced-motion and visible, one redraw every 10 s
keeps UTC lighting current. Terrain never auto-animates. Manual drag/arrow
controls pause globe auto-rotation; Return to Qinghai stays home until resumed.
Home and arrow keys work on the focused canvas; equivalent buttons support
keyboard and touch access. Single-finger drag belongs to the canvas; scrolling
the surrounding page is unchanged.

WebGL2/context loss, shader failure, missing/invalid assets or a 30 s loading
timeout replace the canvas with translated explanatory text. Reload to retry.
Cleanup cancels animation/timers/fetch, removes listeners/observers and owned
DOM, disposes GPU geometry/materials/textures and releases the context.

Run dependency-free tests with Node 22.7+ (ES module syntax detection):

```sh
node --test tests/earth.test.mjs
```

