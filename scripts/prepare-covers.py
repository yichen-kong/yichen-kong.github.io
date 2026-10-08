"""Reproducible lightweight derivatives. Sources are never overwritten."""
from pathlib import Path
from PIL import Image, ImageOps, ImageEnhance
import numpy as np
import cv2, subprocess, imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "covers"
OUT.mkdir(parents=True, exist_ok=True)
def webps(image, name, widths=(900,1600,2400)):
    for w in widths:
        im = image.copy()
        im.thumbnail((w,round(w*image.height/image.width)),Image.Resampling.LANCZOS)
        im.save(OUT/f"{name}-{w}.webp",quality=85,method=6)

earth = Image.open(ROOT/"assets/img/hero-nasa.jpg").convert("RGB")
webps(earth, "earth-sunset")
# A color-graded derivative of the same NASA photograph, not a second observation.
blue = np.array(earth).astype(float)
blue[:,:,0]*=.60; blue[:,:,1]*=.90; blue[:,:,2]*=1.18
webps(Image.fromarray(np.clip(blue,0,255).astype('uint8')), "earth-blue")
honors = Image.open(ROOT/"assets/media/honors/IMG_20260729_122042.jpg")
webps(honors,"honors")
calc = Image.open(ROOT/"assets/media/projects/sounding-calculator.png").convert('RGB')
webps(calc,"calculator",(900,1600))
webps(Image.open(ROOT/"assets/img/photo.jpg").convert("RGB"),"portrait",(640,1280))

# Source diagrams are low resolution. Remove only pure/near-white regions
# connected to the outer background. Do not regenerate or hallucinate CAD detail.
for name in ("airframe","balloon","profile","wing"):
    source = ROOT/f"assets/media/projects/recoverable-{name}.png"
    image = Image.open(source).convert("RGB")
    rgb = np.array(image); near_white = (rgb.min(axis=2)>246).astype('uint8')
    n, labels = cv2.connectedComponents(near_white)
    border_labels = set(np.concatenate([labels[0,:],labels[-1,:],labels[:,0],labels[:,-1]]))
    mask = np.isin(labels,list(border_labels-{0}))
    # Lossless topology: replace connected white backdrop with black; keep material.
    rgb[mask] = 0
    result = Image.fromarray(rgb)
    result.save(OUT/f"aircraft-{name}.webp",lossless=True,method=6)

# Navbar/cover mark: keep the exact supplied shape; fix white JPEG fringing.
src_path = ROOT/"assets/brand/logo-white-source.jpg"
if not src_path.exists():
    src_path = ROOT/"assets/brand/logo-source.jpg"
src = Image.open(src_path).convert("RGB")
arr = np.array(src).astype(float)/255
minimum,maximum=arr.min(2),arr.max(2)
mask=((maximum-minimum)>.11)&(minimum<.9)
y,x=np.where(mask)
alpha=np.clip((.99-minimum)/.08,0,1)
alpha[(maximum-minimum)<.035]=0
fg=np.clip((arr-(1-alpha[:,:,None]))/np.maximum(alpha[:,:,None],.01),0,1)
rgba=np.dstack([fg,alpha])*255
logo=Image.fromarray(rgba.astype('uint8')).crop((int(x.min())-8,int(y.min())-8,int(x.max())+9,int(y.max())+9))
logo.save(OUT/"logo.webp",lossless=True,method=6)
favicon=Image.new('RGB',(128,128),(0,0,0)); li=logo.copy();li.thumbnail((112,112))
favicon.paste(li,((128-li.width)//2,(128-li.height)//2),li);favicon.save(OUT/"favicon.png")

# Preview only; retain the unchanged 43 MB source and provide an explicit link.
ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
target=OUT/"project-preview.mp4"
if not target.exists():
    subprocess.run([ffmpeg,'-hide_banner','-loglevel','error','-y',
      '-i',str(ROOT/"assets/video/project-video.mp4"),
      '-vf',"scale='min(960,iw)':-2",'-c:v','libx264','-preset','medium',
      '-crf','27','-c:a','aac','-b:a','96k','-movflags','+faststart',str(target)],check=True)
print("Cover, logo, diagram and video previews prepared; originals unchanged.")
