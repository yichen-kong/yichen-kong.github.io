#!/usr/bin/env python3
"""Reproducible, local-only media preparation; never uploads or modifies originals.

Requires Pillow, numpy, PyMuPDF; panorama tiling uses sharp/libvips via Node.
Run: python scripts/prepare-media.py [--force] [--verify-only]
Runtime overrides: --node PATH --sharp PATH --source-root PATH --brand-source PATH.

OUTPUT CONTRACT (all public paths are site-root-relative, without a leading slash)
content/gallery.json:
  schemaVersion, releaseTag, originalBaseUrl, groups[], items[], resumes[], branding[]
  groups: {id, title:{en,zh}, region:{en,zh}|null, itemIds:string[]}
  items: {id, group, title:{en,zh}, caption:{en,zh}, width, height,
          original:{url,mime,bytes,sha256,width,height},
          previews:[{src,width,height,bytes,mime}], src, thumbnail, srcset,
          deepZoom?:{dzi,tileUrlTemplate,tileSize,overlap,format,quality,width,height,
                     minLevel,maxLevel,tileCount,loadOnDemand,levels[]}}
  levels: {level,width,height,columns,rows,tileCount}
  resumes: {id,language,src,pageCount,pages:[{page,widthPt,heightPt,preview,thumbnail}]}
  branding: {id,width,height,src,preview,thumbnail,transparent?,background,
             backgroundRemoval,preservedPanelBounds?}
  preview / thumbnail objects use the same {src,width,height,bytes,mime} shape.
  Item thumbnail and src are path strings; srcset is an HTML-ready width srcset.
docs/media-manifest.json (PRIVATE: exclude from deployment and release assets):
  schemaVersion,visibility,warning,pipeline,releaseTag,originalBaseUrl,
  sources:[{id,kind,originalFilename,sourceLocal,sha256,size,width,height,...}],
  releaseUploads:[{id,kind,sourceLocal,assetName,url,sha256,size}],
  outputs:[{path,sha256,size}],verification,qaLocal
  Source width/height are original raster dimensions, null for PDFs; PDFs add
  pageCount and pages [{page,widthPt,heightPt}]. Outputs cover every generated
  asset (including every tile), but not the two manifests or the external QA JPEG.

IDs and groups are deliberately curated, never inferred from folder name/order.
No filename prose is copied into public captions. Private exact filenames are
provenance, not instructions. Release URLs are planned, not claimed uploaded.
"""

from __future__ import annotations

import argparse
import hashlib
import io
import json
import math
import os
from pathlib import Path
import re
import subprocess
import tempfile
from urllib.parse import quote
import xml.etree.ElementTree as ET

import numpy as np
from PIL import Image, ImageCms, ImageDraw, ImageFont, ImageOps
import pymupdf


ROOT = Path(__file__).resolve().parents[1]
RELEASE_TAG = "media-originals-20261007"
BASE_URL = ("https://github.com/yichen-kong/yichen-kong.github.io/releases/download/"
            + RELEASE_TAG)
WIDTHS = (640, 1280, 2400)
PIPELINE_VERSION = 1
RUNTIME = (Path.home() / ".cache/codex-runtimes/codex-primary-runtime/dependencies")
PUBLIC = ROOT / "content/gallery.json"
PRIVATE = ROOT / "docs/media-manifest.json"
Image.MAX_IMAGE_PIXELS = 500_000_000  # Trusted, inventoried local photography only.


def bi(en, zh):
    return {"en": en, "zh": zh}


GROUPS = [
    ("xining", bi("Xining", "西宁"), bi("Qinghai", "青海"), 3),
    ("eboliang", bi("Eboliang", "俄博梁"), bi("Qinghai", "青海"), 6),
    ("water-yadan", bi("Water Yadan", "水上雅丹"), bi("Qinghai", "青海"), 3),
    ("qarhan", bi("Qarhan Salt Lake", "察尔汗盐湖"), bi("Qinghai", "青海"), 2),
    ("kunlun", bi("Kunlun & Hoh Xil", "昆仑与可可西里"), bi("Qinghai", "青海"), 5),
    ("heidushan", bi("Heidushan", "黑独山"), bi("Qinghai", "青海"), 3),
    ("lenghu", bi("Lenghu", "冷湖"), bi("Qinghai", "青海"), 2),
    ("energy", bi("Energy site", "能源基地"), None, 2),
    ("hexicorridor", bi("Hexi Corridor", "河西走廊"), bi("Gansu", "甘肃"), 6),
    ("tuotuohe", bi("Tuotuo River", "沱沱河"), bi("Qinghai", "青海"), 4),
]

# Explicit prefix matches, checked for uniqueness and complete source coverage.
CATALOG = [
    ("xining-01", "xining", "青海省西宁市1", "Xining · 1", "西宁 · 1"),
    ("xining-02", "xining", "青海省西宁市2", "Xining · 2", "西宁 · 2"),
    ("xining-panorama", "xining", "青海省西宁市全景", "Xining panorama", "西宁全景"),
    *[(f"eboliang-{n:02}", "eboliang", f"俄博梁{n}", f"Eboliang · {n}", f"俄博梁 · {n}")
      for n in range(1, 7)],
    ("water-yadan-01", "water-yadan", "水上雅丹，", "Water Yadan · 1", "水上雅丹 · 1"),
    ("water-yadan-02", "water-yadan", "水上雅丹2", "Water Yadan · 2", "水上雅丹 · 2"),
    ("water-yadan-03", "water-yadan", "水上雅丹3", "Water Yadan · 3", "水上雅丹 · 3"),
    ("qarhan-01", "qarhan", "察尔汗盐湖，蒙古语", "Qarhan Salt Lake · 1", "察尔汗盐湖 · 1"),
    ("qarhan-02", "qarhan", "察尔汗盐湖，右上方", "Qarhan Salt Lake · 2", "察尔汗盐湖 · 2"),
    ("kunlun-mountains", "kunlun", "昆仑山区", "Kunlun Mountains", "昆仑山"),
    ("kunlun-pass", "kunlun", "昆仑山口", "Kunlun Pass", "昆仑山口"),
    ("kunlun-hoh-xil", "kunlun", "可可西里三江源", "Hoh Xil", "可可西里"),
    ("kunlun-jade", "kunlun", "2008北京奥运会奖牌", "Kunlun jade site", "昆仑玉开采地"),
    ("kunlun-mineral", "kunlun", "仑山矿泉水", "Kunlun mineral landscape", "昆仑矿泉地貌"),
    ("heidushan-north", "heidushan", "朝北黑独山", "Heidushan · north", "黑独山 · 向北"),
    ("heidushan-east", "heidushan", "朝东黑独山", "Heidushan · east", "黑独山 · 向东"),
    ("heidushan-south", "heidushan", "朝南，", "Heidushan · south", "黑独山 · 向南"),
    ("lenghu-01", "lenghu", "冷湖油田遗址，", "Lenghu oilfield remains · 1", "冷湖油田遗址 · 1"),
    ("lenghu-02", "lenghu", "冷湖油田遗址2", "Lenghu oilfield remains · 2", "冷湖油田遗址 · 2"),
    ("energy-01", "energy", "@energy1", "Energy site · 1", "能源基地 · 1"),
    ("energy-02", "energy", "@energy2", "Energy site · 2", "能源基地 · 2"),
    ("hexicorridor-dangjin", "hexicorridor", "翻过海拔3241", "Dangjin Pass · Gansu side", "当金山垭口 · 甘肃侧"),
    ("hexicorridor-guazhou", "hexicorridor", "河西走廊，", "Guazhou · Hexi Corridor", "瓜州 · 河西走廊"),
    ("hexicorridor-dunhuang", "hexicorridor", "敦煌影视城", "Dunhuang film set", "敦煌影视城"),
    ("hexicorridor-pingshan-01", "hexicorridor", "平山湖大峡谷，", "Pingshan Lake Canyon · 1", "平山湖大峡谷 · 1"),
    ("hexicorridor-pingshan-02", "hexicorridor", "平山湖大峡谷2", "Pingshan Lake Canyon · 2", "平山湖大峡谷 · 2"),
    ("hexicorridor-biandukou", "hexicorridor", "祁连山扁都口", "Biandukou · Minle side", "扁都口 · 民乐侧"),
    *[(f"tuotuohe-{n:02}", "tuotuohe", f"T{n}.jpg", f"Tuotuo River · {n}", f"沱沱河 · {n}")
      for n in range(1, 5)],
]

CAPTIONS = {
    "xining": bi("A view of Xining.", "西宁城市景观。"),
    "eboliang": bi("Yardang formations at Eboliang.", "俄博梁的雅丹地貌。"),
    "water-yadan": bi("Water and yardang formations.", "水面与雅丹地貌。"),
    "qarhan": bi("Salt-lake scenery at Qarhan.", "察尔汗盐湖景观。"),
    "kunlun": bi("A landscape from the Kunlun and Hoh Xil journey.", "昆仑与可可西里沿途景观。"),
    "heidushan": bi("Rocky hills and desert around Heidushan.", "黑独山周边山体与戈壁。"),
    "lenghu": bi("Remains of the Lenghu oilfield.", "冷湖油田遗址。"),
    "energy": bi("Energy infrastructure; exact location unconfirmed.", "能源设施；具体地点待确认。"),
    "hexicorridor": bi("A view from the journey through Gansu.", "甘肃沿途景观。"),
    "tuotuohe": bi("A view from the Tuotuo River visit.", "沱沱河行程影像。"),
}


def sha256(path):
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", "utf-8")
    os.replace(temporary, path)


def relative(path):
    return path.resolve().relative_to(ROOT).as_posix()


def output_path(value):
    path = (ROOT / value).resolve()
    allowed = [ROOT / "assets/gallery", ROOT / "assets/previews"]
    if not any(path.is_relative_to(p) for p in allowed):
        raise ValueError(f"Output outside owned asset directories: {value}")
    return path


def image_metadata(path):
    with Image.open(path) as image:
        return {"src": relative(path), "width": image.width, "height": image.height,
                "bytes": path.stat().st_size, "mime": Image.MIME[image.format]}


def source_record(path, identifier, kind):
    record = {"id": identifier, "kind": kind, "originalFilename": path.name,
              "sourceLocal": str(path.resolve()), "sha256": sha256(path),
              "size": path.stat().st_size, "width": None, "height": None}
    if kind != "resume":
        with Image.open(path) as image:
            record.update(width=image.width, height=image.height,
                          orientation=int(image.getexif().get(274, 1)))
    else:
        with pymupdf.open(path) as doc:
            record.update(pageCount=len(doc), pages=[
                {"page": i + 1, "widthPt": p.rect.width, "heightPt": p.rect.height}
                for i, p in enumerate(doc)])
    return record


def discover(source_root, brand_source):
    files = [p for p in (source_root / "青海").iterdir()
             if p.suffix.lower() in (".jpg", ".jpeg", ".png")]
    rivers = [p for p in (source_root / "沱沱河").iterdir()
              if p.suffix.lower() in (".jpg", ".jpeg", ".png")]
    if len(files) != 32 or len(rivers) != 4:
        raise ValueError("Expected exactly 32 main photographs and four Tuotuo photographs")
    photos, used = [], set()
    for identifier, group, prefix, en, zh in CATALOG:
        if prefix.startswith("@energy"):
            number = int(prefix[-1])
            matches = [p for p in files if p.name.startswith("全球首个风光热储氢")
                       and p.stem.endswith("2") == (number == 2)]
        else:
            matches = [p for p in (rivers if group == "tuotuohe" else files)
                       if p.name.startswith(prefix)]
        if len(matches) != 1 or matches[0] in used:
            raise ValueError(f"Ambiguous or missing source for {identifier}: {matches}")
        source = matches[0]
        used.add(source)
        record = source_record(source, identifier, "gallery")
        record.update(group=group, title=bi(en, zh))
        photos.append(record)
    if used != set(files + rivers):
        raise ValueError("Unmapped gallery sources")
    panorama = next(p for p in photos if p["id"] == "xining-panorama")
    if (panorama["width"], panorama["height"], panorama["orientation"]) != (28800, 14400, 1):
        raise ValueError("Panorama must be the unrotated, full 28800 × 14400 original")
    resumes = [source_record(ROOT / f"assets/docs/resume-{lang}.pdf",
                             f"resume-{lang}", "resume") for lang in ("en", "zh")]
    branding = [source_record(brand_source / filename, identifier, "branding")
                for filename, identifier in [
                    ("image1.jpeg", "brand-logo"),
                    ("image3.jpeg", "brand-collage-01"),
                    ("image4.jpeg", "brand-collage-02")]]
    return photos, resumes, branding


def decode_preview(source, max_width):
    # JPEG draft decoding bounds the working raster before Pillow loads it.
    # Decode at >=2x requested width for good downsampling, not the full panorama.
    with Image.open(source) as image:
        orientation = image.getexif().get(274, 1)
        target_w = max_width * 2
        target_h = math.ceil(target_w * image.height / image.width)
        if orientation in (5, 6, 7, 8):
            target_h = max_width * 2
            target_w = math.ceil(target_h * image.width / image.height)
        image.draft("RGB", (target_w, target_h))
        profile = image.info.get("icc_profile")
        working = ImageOps.exif_transpose(image).convert("RGB")
        if profile:
            working = ImageCms.profileToProfile(
                working, ImageCms.ImageCmsProfile(io.BytesIO(profile)),
                ImageCms.createProfile("sRGB"), outputMode="RGB")
        working.info.clear()  # Public derivatives never retain GPS/EXIF/source notes.
        return working


def resized(image, width):
    width = min(width, image.width)
    return image.resize((width, max(1, round(image.height * width / image.width))),
                        Image.Resampling.LANCZOS)


def save_webp(image, path, quality=86, lossless=False):
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, "WEBP", quality=quality, method=6, lossless=lossless, exact=True)
    return image_metadata(path)


def photo_previews(record):
    directory = ROOT / "assets/gallery" / record["id"]
    with decode_preview(Path(record["sourceLocal"]), max(WIDTHS)) as image:
        result = []
        for width in WIDTHS:
            with resized(image, width) as small:
                result.append(save_webp(small, directory / f"{width}.webp",
                                        quality=84 if width == 640 else 87))
    return result


TILE_JS = r"""
const [sharpPath, input, output] = process.argv.slice(1);
const sharp = require(sharpPath);
sharp.cache({memory: 64, files: 16, items: 64});
sharp.concurrency(1);
(async () => {
  const image = sharp(input, {limitInputPixels: false, sequentialRead: true});
  const meta = await image.metadata();
  if (meta.width !== 28800 || meta.height !== 14400)
    throw new Error('Refusing a reduced panorama');
  await image.jpeg({quality: 90, chromaSubsampling: '4:4:4'})
    .tile({size: 512, overlap: 1, layout: 'dz', depth: 'onepixel', container: 'fs'})
    .toFile(output);
})().catch(e => { console.error(e); process.exit(1); });
"""


def deepzoom(record, node, sharp):
    directory = ROOT / "assets/gallery/deepzoom"
    directory.mkdir(parents=True, exist_ok=True)
    # Stage inside the owned directory; publish only after successful libvips exit.
    with tempfile.TemporaryDirectory(prefix=".building-", dir=directory) as staging:
        # libvips appends ".dzi" itself; a suffix here would produce ".dzi.dzi".
        staged = Path(staging) / "xining-panorama"
        subprocess.run([str(node), "-e", TILE_JS, str(sharp),
                        record["sourceLocal"], str(staged)], check=True)
        for source in sorted(Path(staging).rglob("*")):
            # libvips diagnostic XML is not part of DZI and can include metadata.
            if source.is_file() and source.name != "vips-properties.xml":
                target = directory / source.relative_to(staging)
                target.parent.mkdir(parents=True, exist_ok=True)
                os.replace(source, target)
    width, height = record["width"], record["height"]
    maximum = math.ceil(math.log2(max(width, height)))
    levels = []
    for level in range(maximum + 1):
        divisor = 2 ** (maximum - level)
        w, h = math.ceil(width / divisor), math.ceil(height / divisor)
        cols, rows = math.ceil(w / 512), math.ceil(h / 512)
        levels.append({"level": level, "width": w, "height": h, "columns": cols,
                       "rows": rows, "tileCount": cols * rows})
    return {
        "dzi": relative(directory / "xining-panorama.dzi"),
        "tileUrlTemplate": relative(directory / "xining-panorama_files")
                           + "/{level}/{x}_{y}.jpeg",
        "tileSize": 512, "overlap": 1, "format": "jpeg", "quality": 90,
        "width": width, "height": height, "minLevel": 0, "maxLevel": maximum,
        "tileCount": sum(p["tileCount"] for p in levels), "loadOnDemand": True,
        "levels": levels,
    }


def render_resume(record):
    pages = []
    with pymupdf.open(record["sourceLocal"]) as document:
        for i, page in enumerate(document):
            pix = page.get_pixmap(matrix=pymupdf.Matrix(1600 / page.rect.width,
                                                       1600 / page.rect.width),
                                  colorspace=pymupdf.csRGB, alpha=False)
            with Image.frombytes("RGB", (pix.width, pix.height), pix.samples) as rendered:
                with resized(rendered, 1600) as image:
                    directory = ROOT / "assets/previews" / record["id"]
                    preview = save_webp(image, directory / f"page-{i + 1:02}-1600.webp", 91)
                    with resized(image, 320) as small:
                        thumb = save_webp(small, directory / f"page-{i + 1:02}-thumb.webp", 78)
            pages.append({"page": i + 1, "widthPt": page.rect.width,
                          "heightPt": page.rect.height, "preview": preview, "thumbnail": thumb})
    return {"id": record["id"], "language": record["id"].split("-")[-1],
            "src": f"assets/docs/{record['id']}.pdf", "pageCount": len(pages), "pages": pages}


# Half-open pixel rectangles, visually checked against the new DOCX extracts.
# Preserve EVERY pixel inside panels, even white pixels connected to an edge.
PANELS = {
    "brand-collage-01": [(x0, y0, x1, y1)
                         for y0, y1 in [(14, 231), (240, 467), (475, 700)]
                         for x0, x1 in [(14, 414), (423, 833), (842, 1255)]],
    "brand-collage-02": [(17, 14, 1255, 472), (14, 480, 1255, 938)],
}


def brand_pixels(record):
    source = Path(record["sourceLocal"])
    with Image.open(source) as original:
        rgb = original.convert("RGB")
    alpha = Image.new("L", rgb.size, 0)
    if record["id"] == "brand-logo":
        if rgb.size != (1024, 1024):
            raise ValueError("Logo mask must be reviewed for a changed source size")
        pixels = np.asarray(rgb)
        low, high = pixels.min(axis=2), pixels.max(axis=2)
        white = (low >= 238) & ((high.astype(int) - low.astype(int)) <= 16)
        # Flood only eligible exterior white. Enclosed white is deliberately retained.
        eligible = Image.fromarray((white.astype(np.uint8) * 255))
        padded = Image.new("L", (rgb.width + 2, rgb.height + 2), 255)
        padded.paste(eligible, (1, 1))
        ImageDraw.floodfill(padded, (0, 0), 128, thresh=0)
        outside = np.asarray(padded)[1:-1, 1:-1] == 128
        alpha = Image.fromarray(np.where(outside, 0, 255).astype(np.uint8))
    else:
        expected = (1269, 714) if record["id"].endswith("01") else (1269, 952)
        if rgb.size != expected:
            raise ValueError("Collage panel masks must be reviewed for a changed source size")
        draw = ImageDraw.Draw(alpha)
        for x0, y0, x1, y1 in PANELS[record["id"]]:
            draw.rectangle((x0, y0, x1 - 1, y1 - 1), fill=255)
    rgba = rgb.copy()
    rgba.putalpha(alpha)
    black = Image.new("RGB", rgb.size, "black")
    black.paste(rgb, mask=alpha)
    rgb.close()
    return rgba, black


def render_brand(record):
    directory = ROOT / "assets/previews/branding"
    rgba, black = brand_pixels(record)
    try:
        # Lossless at original dimensions protects small type and bright details.
        preview = save_webp(black, directory / f"{record['id']}-black.webp", lossless=True)
        with resized(black, 480) as thumb:
            thumbnail = save_webp(thumb, directory / f"{record['id']}-thumb.webp", 84)
        result = {"id": record["id"], "width": black.width, "height": black.height,
                  "src": preview["src"], "preview": preview, "thumbnail": thumbnail,
                  "background": "#000000"}
        if record["id"] == "brand-logo":
            result["transparent"] = save_webp(
                rgba, directory / "brand-logo-transparent.webp", lossless=True)
            result["backgroundRemoval"] = "exterior-connected-white-only; enclosed white retained"
        else:
            result["backgroundRemoval"] = "outer-frame-and-gutters-only; panel interiors unchanged"
            result["preservedPanelBounds"] = PANELS[record["id"]]
        return result
    finally:
        rgba.close()
        black.close()


def upload_record(source):
    extension = ".pdf" if source["kind"] == "resume" else ".jpg"
    name = source["id"] + extension
    return {key: source[key] for key in ("id", "kind", "sourceLocal", "sha256")} | {
        "assetName": name, "url": BASE_URL + "/" + quote(name, safe=""),
        "size": source["size"]}


def cached_source(record, old_private, old_public, collection, force):
    if force or old_private.get("pipeline", {}).get("version") != PIPELINE_VERSION:
        return None
    old = next((s for s in old_private.get("sources", []) if s["id"] == record["id"]), {})
    if old.get("sha256") != record["sha256"]:
        return None
    result = next((s for s in old_public.get(collection, []) if s["id"] == record["id"]), None)
    if not result:
        return None
    paths = set(public_asset_paths(result))
    if result.get("deepZoom"):
        prefix = "assets/gallery/deepzoom/"
        paths.update(p["path"] for p in old_private.get("outputs", [])
                     if p["path"].startswith(prefix))
    inventory = {p["path"]: p for p in old_private.get("outputs", [])}
    for value in paths:
        prior = inventory.get(value)
        path = output_path(value)
        if not prior or not path.is_file() or path.stat().st_size != prior["size"]:
            return None
        if sha256(path) != prior["sha256"]:
            return None
    return result


def public_asset_paths(value):
    if isinstance(value, dict):
        for key, child in value.items():
            if key in ("src", "thumbnail", "dzi") and isinstance(child, str):
                if child.startswith(("assets/gallery/", "assets/previews/")):
                    yield child
            else:
                yield from public_asset_paths(child)
    elif isinstance(value, list):
        for child in value:
            yield from public_asset_paths(child)


def output_inventory(public):
    paths = set(public_asset_paths(public))
    for item in public["items"]:
        if "deepZoom" in item:
            dzi = item["deepZoom"]
            for level in dzi["levels"]:
                for x in range(level["columns"]):
                    for y in range(level["rows"]):
                        paths.add(dzi["tileUrlTemplate"].format(level=level["level"], x=x, y=y))
    return [{"path": value, "sha256": sha256(output_path(value)),
             "size": output_path(value).stat().st_size} for value in sorted(paths)]


def validate(public, private, check_hashes=True):
    if len(public["items"]) != 36 or len(private["sources"]) != 41:
        raise ValueError("Source count mismatch")
    identifiers = [p["id"] for p in private["sources"]]
    if len(set(identifiers)) != len(identifiers) or not all(
            re.fullmatch("[a-z0-9-]+", p) for p in identifiers):
        raise ValueError("Duplicate or URL-unsafe IDs")
    serialized = json.dumps(public, ensure_ascii=False)
    if re.search(r"(?<![A-Za-z])[A-Za-z]:[\\/]|sourceLocal|originalFilename|我希望|希望你|最大|世界首|全球首",
                 serialized):
        raise ValueError("Private path, filename instruction, or superlative leaked into public data")
    for group_id, _, _, count in GROUPS:
        group = next(g for g in public["groups"] if g["id"] == group_id)
        expected = [p["id"] for p in public["items"] if p["group"] == group_id]
        if len(expected) != count or group["itemIds"] != expected:
            raise ValueError(f"Group mismatch: {group_id}")
    source_map = {s["id"]: s for s in private["sources"]}
    for item in public["items"]:
        source = source_map[item["id"]]
        expected_url = BASE_URL + "/" + item["id"] + ".jpg"
        if item["original"]["url"] != expected_url or item["original"]["sha256"] != source["sha256"]:
            raise ValueError("Release original metadata mismatch")
        if [p["width"] for p in item["previews"]] != list(WIDTHS):
            raise ValueError("Missing responsive widths")
        for preview in item["previews"]:
            actual = image_metadata(output_path(preview["src"]))
            if actual != preview:
                raise ValueError(f"Preview metadata mismatch: {preview['src']}")
            if abs(preview["height"] - preview["width"] * item["height"] / item["width"]) > 1:
                raise ValueError("Preview aspect ratio changed")
    panoramas = [p for p in public["items"] if "deepZoom" in p]
    if len(panoramas) != 1 or panoramas[0]["id"] != "xining-panorama":
        raise ValueError("Only Xining panorama may have a pyramid")
    dzi = panoramas[0]["deepZoom"]
    root = ET.parse(output_path(dzi["dzi"])).getroot()
    ns = {"dz": "http://schemas.microsoft.com/deepzoom/2008"}
    size = root.find("dz:Size", ns)
    if (int(size.attrib["Width"]), int(size.attrib["Height"])) != (28800, 14400):
        raise ValueError("Highest level was reduced")
    if root.attrib != {"Format": "jpeg", "Overlap": "1", "TileSize": "512"}:
        raise ValueError(f"Unexpected DZI settings: {root.attrib}")
    tile_count = 0
    for level in dzi["levels"]:
        for x in range(level["columns"]):
            for y in range(level["rows"]):
                path = output_path(dzi["tileUrlTemplate"].format(level=level["level"], x=x, y=y))
                x0, y0 = max(0, x * 512 - 1), max(0, y * 512 - 1)
                x1, y1 = min(level["width"], (x + 1) * 512 + 1), min(level["height"], (y + 1) * 512 + 1)
                with Image.open(path) as image:
                    if image.size != (x1 - x0, y1 - y0) or image.format != "JPEG":
                        raise ValueError(f"Invalid tile geometry: {path}")
                    image.verify()
                tile_count += 1
    if tile_count != dzi["tileCount"]:
        raise ValueError("Tile count mismatch")
    for resume in public["resumes"]:
        if resume["pageCount"] != len(resume["pages"]) or resume["pageCount"] != source_map[resume["id"]]["pageCount"]:
            raise ValueError("Resume page count mismatch")
        for page in resume["pages"]:
            if page["preview"]["width"] != 1600 or page["thumbnail"]["width"] != 320:
                raise ValueError("Resume preview width mismatch")
            for kind in ("preview", "thumbnail"):
                if image_metadata(output_path(page[kind]["src"])) != page[kind]:
                    raise ValueError("Resume image metadata mismatch")
    for brand in public["branding"]:
        source = source_map[brand["id"]]
        with Image.open(output_path(brand["src"])) as image:
            if image.size != (source["width"], source["height"]):
                raise ValueError("Brand proportions changed")
            if source["id"] in PANELS:
                with Image.open(source["sourceLocal"]) as original:
                    for box in PANELS[source["id"]]:
                        if image.crop(box).tobytes() != original.convert("RGB").crop(box).tobytes():
                            raise ValueError("Collage panel pixels were changed")
    if len(private["releaseUploads"]) != len(private["sources"]):
        raise ValueError("Every original must have an upload mapping")
    for upload in private["releaseUploads"]:
        if upload != upload_record(source_map[upload["id"]]):
            raise ValueError("Release upload mapping mismatch")
    for output in private["outputs"]:
        path = output_path(output["path"])
        if path.stat().st_size != output["size"] or (check_hashes and sha256(path) != output["sha256"]):
            raise ValueError(f"Generated output verification failed: {path}")
    # Re-read originals AFTER all processing. This also verifies the release-upload list.
    for source in private["sources"]:
        path = Path(source["sourceLocal"])
        if path.stat().st_size != source["size"] or sha256(path) != source["sha256"]:
            raise ValueError(f"Original changed: {path}")
    return {"sourceHashesVerified": len(private["sources"]),
            "outputHashesVerified": len(private["outputs"]),
            "galleryCount": 36, "groupCount": 10, "deepZoomTilesVerified": tile_count,
            "resumePagesVerified": sum(r["pageCount"] for r in public["resumes"]),
            "publicContainsLocalPaths": False, "originalsUnmodified": True}


def contact_sheet(public, destination):
    entries = [(p["id"], p["thumbnail"]) for p in public["items"]]
    entries += [(p["id"], p["src"]) for p in public["branding"]]
    entries += [(f"{r['id']} page {p['page']}", p["preview"]["src"])
                for r in public["resumes"] for p in r["pages"]]
    cols, cell_w, cell_h = 5, 360, 280
    sheet = Image.new("RGB", (cols * cell_w, math.ceil(len(entries) / cols) * cell_h),
                      "#14181d")
    draw = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 17)
    except OSError:
        font = ImageFont.load_default(size=17)
    for i, (label, src) in enumerate(entries):
        x, y = i % cols * cell_w, i // cols * cell_h
        with Image.open(output_path(src)) as image:
            preview = ImageOps.contain(image.convert("RGB"), (cell_w - 16, cell_h - 40))
            sheet.paste(preview, (x + (cell_w - preview.width) // 2,
                                 y + 8 + (cell_h - 40 - preview.height) // 2))
        draw.text((x + 9, y + cell_h - 27), label, fill="#e6edf3", font=font)
    destination.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(destination, "JPEG", quality=91, subsampling=0)
    sheet.close()


def main():
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--source-root", type=Path, default=ROOT.parent)
    parser.add_argument("--brand-source", type=Path)
    parser.add_argument("--node", type=Path, default=RUNTIME / "node/bin/node.exe")
    parser.add_argument("--sharp", type=Path, default=RUNTIME / "node/node_modules/sharp")
    parser.add_argument("--qa", type=Path, default=ROOT.parent / "qa-media.jpg")
    parser.add_argument("--force", action="store_true", help="Regenerate rather than use hash-checked cache")
    parser.add_argument("--verify-only", action="store_true", help="Read-only verification of manifests and assets")
    args = parser.parse_args()
    if args.verify_only:
        public, private = json.loads(PUBLIC.read_text("utf-8")), json.loads(PRIVATE.read_text("utf-8"))
        print(json.dumps(validate(public, private), indent=2))
        return
    brand_source = args.brand_source or args.source_root / "docx_extract_20261007/x/word/media"
    photos, resumes, branding = discover(args.source_root, brand_source)
    old_private = json.loads(PRIVATE.read_text("utf-8")) if PRIVATE.exists() else {}
    old_public = json.loads(PUBLIC.read_text("utf-8")) if PUBLIC.exists() else {}
    public = {"schemaVersion": 1, "releaseTag": RELEASE_TAG, "originalBaseUrl": BASE_URL,
              "groups": [], "items": [], "resumes": [], "branding": []}
    for i, source in enumerate(photos):
        print(f"[{i + 1}/36] {source['id']}", flush=True)
        cached = cached_source(source, old_private, old_public, "items", args.force)
        previews = cached["previews"] if cached else photo_previews(source)
        oriented = source["orientation"] in (5, 6, 7, 8)
        item = {"id": source["id"], "group": source["group"], "title": source["title"],
                "caption": CAPTIONS[source["group"]],
                "width": source["height"] if oriented else source["width"],
                "height": source["width"] if oriented else source["height"],
                "original": {"url": upload_record(source)["url"], "mime": "image/jpeg",
                             "bytes": source["size"], "sha256": source["sha256"],
                             "width": source["width"], "height": source["height"]},
                "previews": previews, "src": previews[1]["src"],
                "thumbnail": previews[0]["src"],
                "srcset": ", ".join(f"{p['src']} {p['width']}w" for p in previews)}
        if source["id"] == "xining-panorama":
            print("  Deep Zoom: native resolution, JPEG q90, lazy-requestable levels 0–15", flush=True)
            item["deepZoom"] = cached["deepZoom"] if cached else deepzoom(source, args.node, args.sharp)
        public["items"].append(item)
    public["groups"] = [{"id": identifier, "title": title, "region": region,
                         "itemIds": [p["id"] for p in public["items"] if p["group"] == identifier]}
                        for identifier, title, region, _ in GROUPS]
    for source in resumes:
        print(f"Rendering {source['id']}: {source['pageCount']} pages", flush=True)
        cached = cached_source(source, old_private, old_public, "resumes", args.force)
        public["resumes"].append(cached or render_resume(source))
    for source in branding:
        print(f"Preparing {source['id']}", flush=True)
        cached = cached_source(source, old_private, old_public, "branding", args.force)
        public["branding"].append(cached or render_brand(source))
    sources = photos + resumes + branding
    private = {
        "schemaVersion": 1, "visibility": "private-local-only",
        "warning": "Contains absolute local paths and exact original filenames. DO NOT DEPLOY or upload this manifest.",
        "pipeline": {"version": PIPELINE_VERSION, "script": "scripts/prepare-media.py",
                     "previewWidths": list(WIDTHS), "previewQuality": [84, 87, 87],
                     "deepZoom": {"engine": "sharp/libvips", "tileSize": 512, "overlap": 1,
                                  "quality": 90, "chromaSubsampling": "4:4:4",
                                  "depth": "onepixel", "resize": False},
                     "resumeWidth": 1600, "resumeThumbnailWidth": 320,
                     "sourceNotesPolicy": "Exact filenames private only; no filename prose published"},
        "releaseTag": RELEASE_TAG, "originalBaseUrl": BASE_URL, "sources": sources,
        "releaseUploads": [upload_record(s) for s in sources],
        "outputs": output_inventory(public), "qaLocal": str(args.qa.resolve()),
    }
    print("Verifying all sources, hashes, tiles, geometry, and preserved collage pixels…", flush=True)
    private["verification"] = validate(public, private)
    contact_sheet(public, args.qa)
    # Publish the public manifest only after the complete pipeline validates.
    write_json(PRIVATE, private)
    write_json(PUBLIC, public)
    print(json.dumps(private["verification"], indent=2))
    print(f"Public: {PUBLIC}\nPRIVATE: {PRIVATE}\nQA: {args.qa}")


if __name__ == "__main__":
    main()
