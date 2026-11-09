"""Decode every exported frame, verify timestamps, and compare actual encoded pixels."""
from pathlib import Path
import subprocess,json,base64
import numpy as np
from PIL import Image
root=Path('.asyncly/visual-captures/scene-studio/exports')
report={'result':'passed','videos':[],'pixels':[]}
for name in ['water-4s.webm','water-before-4s.webm','cloud-4s.webm','bloom-4s.webm']:
 p=root/name
 data=json.loads(subprocess.check_output(['ffprobe','-v','error','-count_frames','-show_entries','stream=width,height,nb_read_frames,codec_name:format=duration','-of','json',str(p)],timeout=60))
 s=data['streams'][0]
 assert (s['width'],s['height'],int(s['nb_read_frames']))==(1920,1080,96),data
 assert abs(float(data['format']['duration'])-4)<.002,data
 packets=json.loads(subprocess.check_output(['ffprobe','-v','error','-select_streams','v','-show_packets','-show_entries','packet=pts_time,duration_time','-of','json',str(p)],timeout=60))['packets']
 times=[float(x['pts_time']) for x in packets]
 assert len(times)==96 and abs(times[0])<.001 and all(abs(t-i/24)<.0015 for i,t in enumerate(times)),times[:4]
 subprocess.run(['ffmpeg','-v','error','-i',str(p),'-f','null','-'],check=True,timeout=90)
 for frame in [0,24,48,72,95]:
  subprocess.run(['ffmpeg','-v','error','-y','-i',str(p),'-vf',f'select=eq(n\\,{frame})','-frames:v','1',str(root/(name[:-5]+f'-frame-{frame}.png'))],check=True,timeout=60)
 report['videos'].append({'file':name,'codec':s['codec_name'],'size':[1920,1080],'decodedFrames':96,'duration':4,'everyTimestampVerified':True,'fullDecode':'passed'})
img=Image.open(root/'water-4k.png');assert img.size==(3840,2160),img.size
report['still']={'file':'water-4k.png','size':list(img.size)}
meta=json.loads((root/'export-creation.json').read_text())['checks'][0]['scene']['regions'][0]
mask=np.array(Image.fromarray(np.frombuffer(base64.b64decode(meta['mask']),dtype=np.uint8).reshape(54,96)).resize((1920,1080),Image.Resampling.BILINEAR))
# Stay clear of matte feather/codec block boundaries for the unaffected foreground gate.
clean=np.array(Image.fromarray((mask>0).astype(np.uint8)*255).filter(__import__('PIL.ImageFilter',fromlist=['MaxFilter']).MaxFilter(65)))==0
selected=mask>160
assert clean.sum()>10000 and selected.sum()>1000
for frame in [0,24,48,72,95]:
 a=np.array(Image.open(root/f'water-before-4s-frame-{frame}.png').convert('RGB')).astype(float)
 b=np.array(Image.open(root/f'water-4s-frame-{frame}.png').convert('RGB')).astype(float)
 d=np.abs(a-b);outside=d[clean];inside=d[selected]
 assert outside.mean()<2 and np.percentile(outside,99)<10,(frame,outside.mean(),np.percentile(outside,99))
 assert inside.mean()>.1,(frame,inside.mean())
 report['pixels'].append({'frame':frame,'selectedPixels':int(selected.sum()),'outsidePixels':int(clean.sum()),'selectedMeanChange':float(inside.mean()),'unselectedMeanChange':float(outside.mean()),'unselectedP99':float(np.percentile(outside,99)),'unselectedMax':float(outside.max())})
(root/'decoded-report.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'result':'passed','videos':len(report['videos']),'framesEach':96,'duration':4,'still':report['still'],'pixelFrames':len(report['pixels'])}))
