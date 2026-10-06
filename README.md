# Yichen Kong personal research site

杩欐槸涓€涓棤鏋勫缓宸ュ叿鐨勯潤鎬佷釜浜轰富椤碉紝浣跨敤 HTML銆丆SS銆丣avaScript 鍜?GitHub Pages 閮ㄧ讲銆傛暣浣撻噰鐢ㄥ厠鍒剁殑榛?/ 鐧?/ 钃濅笁鑹层€佸叏灞忓ぇ骞呭唴瀹广€佷簩绾ч〉闈㈠拰婊氬姩鍔ㄦ晥銆?

## 鏈湴鐩綍

```text
index.html                         涓婚〉锛氭鎷€佺爺绌堕」鐩€佽崳瑾夊叆鍙ｃ€侀潚娴枫€佽仈绯绘柟寮?
research.html                      鐮旂┒椤圭洰鎬昏
project-recoverable-sounding.html 鍙洖鏀舵帰绌虹郴缁熻鎯?
project-sounding-calculator.html  楂樼┖鎺㈢┖璁＄畻缃戦〉璇︽儏
awards.html                        鑽ｈ獕涓庤幏濂栧浘鐗囷紙鐐瑰嚮鍥剧墖鏀惧ぇ锛?
field-tests.html                   璇曢涓庡悎瑙勮鎯?
qinghai.html                       闈掓捣涓庢瘡鏃ユ棩鍑烘棩钀?
 documents.html                    涓嫳鏂囩畝鍘嗕笌鐮旂┒璧勬枡涓嬭浇
css/style.css                      鍏ㄧ珯瑙嗚鍜屽搷搴斿紡甯冨眬
js/main.js                         涓嫳鏂囧垏鎹€佸鑸€佹粴鍔ㄥ姩鐢汇€佺伅绠便€佹棩鍑烘棩钀?
assets/brand/logo-black.jpg              閫忔槑鑳屾櫙鐭㈤噺 LOGO
assets/img/hero-space.svg          涓婚〉娣辫壊绉戞妧鑳屾櫙
assets/docs/                      涓嫳鏂囩爺绌舵姤鍛娿€佽瘯椋炶鍒掑拰绠€鍘?
assets/img/                        鍘熸湁鐓х墖涓庤幏濂栫収鐗?
assets/video/                      椤圭洰婕旂ず瑙嗛
.github/workflows/                 GitHub Pages 鏋勫缓涓庨儴缃?
```

## 淇敼鏁欑▼

### 淇敼鏂囧瓧

鐩存帴鎵撳紑瀵瑰簲鐨?HTML 鏂囦欢锛屼腑鏂囨斁鍦?`.lang-zh` 涓紝鑻辨枃鏀惧湪 `.lang-en` 涓€備緥濡傦細

```html
<span class="lang-zh">涓枃鏍囬</span>
<span class="lang-en">English title</span>
```

涓嶈鍙敼涓€涓瑷€鐗堟湰锛屽惁鍒欏垏鎹㈠悗浼氬嚭鐜颁腑鑻辨枃涓嶅搴斻€?

### 淇敼鍥剧墖鍜岃棰?

鎶婃枃浠舵斁鍒?`assets/img/` 鎴?`assets/video/`锛岀劧鍚庡湪 HTML 涓慨鏀?`src` 鎴?`background-image`銆備富椤佃儗鏅洰鍓嶆槸 `assets/img/hero-space.svg`锛涢」鐩崱鐗囦娇鐢?`assets/img/featured.jpg`銆?

### 淇敼 LOGO

瀵艰埅鏍忓拰缃戠珯鍥炬爣缁熶竴浣跨敤 `assets/brand/logo-black.jpg`銆傝繖鏄€忔槑鑳屾櫙鐨勭煝閲忔枃浠讹紝鎺ㄨ崘鐢?Illustrator銆丗igma銆両nkscape 鎴?VS Code 鐩存帴淇敼 SVG銆傚師濮嬪浘鐗囦繚瀛樺湪 `assets/brand/logo-source.jpg`銆?

### 淇敼涓嬭浇璧勬枡

鎶婃柊鐨?PDF 鏀惧叆 `assets/docs/`锛屽啀鍦?`documents.html` 鎴栭」鐩鎯呴〉涓慨鏀?`href`銆傚綋鍓嶈祫鏂欏寘鎷細

- `resume-zh.pdf` / `resume-en.pdf`
- `research-report-zh.pdf` / `research-report-en.pdf`
- `flight-test-plan-en.pdf`

### 淇敼椤圭洰閾炬帴

涓婚〉椤圭洰鍗＄墖鍦?`index.html` 鐨勨€滅爺绌堕」鐩€濆尯鍩燂紱瀵艰埅浜岀骇鑿滃崟鍦ㄦ瘡涓?HTML 鏂囦欢椤堕儴鐨?`.nav-dropdown` 涓€傛柊澧為〉闈㈡椂锛岃繕瑕佸湪 `.github/workflows/build.yml` 涓‘璁?`cp -r *.html css js assets public/` 浼氬皢瀹冨鍒跺埌 Pages 鏋勫缓鐩綍銆?

## 鏈湴棰勮

鍦ㄤ粨搴撴牴鐩綍杩愯锛?

```powershell
python -m http.server 8000
```

娴忚鍣ㄦ墦寮€ `http://127.0.0.1:8000/`銆備笉瑕佺洿鎺ュ弻鍑?HTML 鏂囦欢锛屽洜涓洪儴鍒嗘祻瑙堝櫒浼氶檺鍒舵湰鍦版枃浠剁殑瑙嗛銆佸瓧浣撳拰璺ㄥ煙璇锋眰銆?

## 閮ㄧ讲

鎻愪氦骞舵帹閫佸埌 `main`锛?

```powershell
git add .
git commit -m "update personal research site"
git push origin main
```

GitHub Actions 浼氳嚜鍔ㄦ墽琛?`.github/workflows/deploy.yml`锛屽皢鎵€鏈?HTML銆丆SS銆丣avaScript銆佸浘鐗囥€佽棰戝拰 PDF 閮ㄧ讲鍒?GitHub Pages銆?

## 鏃ュ嚭鏃ヨ惤鏁版嵁

闈掓捣椤甸潰浣跨敤 Open-Meteo 鐨勫叕寮€鎺ュ彛锛屼互瑗垮畞闄勮繎鍧愭爣 `36.6171, 101.7782` 鍜?`Asia/Shanghai` 鏃跺尯璇诲彇褰撳ぉ鏃ュ嚭銆佹棩钀斤紱鎺ュ彛涓嶅彲鐢ㄦ椂椤甸潰浼氭樉绀?`--:--`锛屼笉浼氬奖鍝嶅叾浠栧姛鑳姐€?


## ?????

???? `assets/img/hero-nasa.jpg` ?? NASA Image and Video Library ??????ISS ?????????????`assets/img/hero-space.svg` ????????????????

