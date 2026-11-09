"""Decode actual Stillwild UI downloads; no provider calls or source rewriting."""
import subprocess,json,array,math,hashlib
from pathlib import Path
root=Path('.asyncly/visual-captures/motion-plus/media')
def run(*args):return subprocess.check_output(args,timeout=60)
def probe(path):return json.loads(run('ffprobe','-v','error','-count_frames','-show_entries','stream=codec_name,codec_type,width,height,nb_read_frames:format=duration','-of','json',str(path)))
checks=[]
for name,sound in [('dune-silent-4s.webm',False),('dune-final-sound-4s.webm',True)]:
 p=root/name;j=probe(p);video=next(s for s in j['streams'] if s['codec_type']=='video');assert (video['width'],video['height'],int(video['nb_read_frames']))==(1920,1080,96);assert float(j['format']['duration'])==4
 audio=[s for s in j['streams'] if s['codec_type']=='audio'];assert bool(audio)==sound
 run('ffmpeg','-v','error','-i',str(p),'-f','null','-')
 item={'file':name,'result':'passed','video':video,'containerSeconds':4,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
 if sound:
  pcm=array.array('f',run('ffmpeg','-v','error','-i',str(p),'-map','0:a:0','-ar','48000','-ac','2','-f','f32le','pipe:1'));assert len(pcm)==192000*2
  rms=math.sqrt(sum(v*v for v in pcm)/len(pcm));peak=max(abs(v) for v in pcm);assert rms>.001 and peak<.93;item['audio']={'codec':audio[0]['codec_name'],'sampleRate':48000,'channels':2,'samplesPerChannel':192000,'decodedSeconds':4,'RMS':rms,'peak':peak}
  for t in [0,2]:run('ffmpeg','-y','-v','error','-ss',str(t),'-i',str(p),'-frames:v','1','-vf','scale=1280:720',str(root/f'dune-look-{t}s.jpg'))
  packets=json.loads(run('ffprobe','-v','error','-select_streams','v','-show_entries','packet=pts_time,duration_time','-of','json',str(p)))['packets'];assert len(packets)==96;assert float(packets[0]['pts_time'])==0;assert abs(float(packets[-1]['pts_time'])+float(packets[-1]['duration_time'])-4)<.00001
 checks.append(item)
png=probe(root/'dune-4k.png');assert (png['streams'][0]['width'],png['streams'][0]['height'])==(3840,2160);checks.append({'file':'dune-4k.png','result':'passed','width':3840,'height':2160})
(root/'decode-report.json').write_text(json.dumps({'result':'passed','checks':checks,'limit':'Decoding/timing tests do not establish professional scene-motion quality. Real Kling website media supplied by supervisor; watermark retained.'},indent=2))
print(json.dumps(checks,indent=2))
