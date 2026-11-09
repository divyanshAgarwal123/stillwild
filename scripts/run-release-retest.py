"""Fresh isolated release audit; retain attempts, block unmocked external traffic.

Runs existing suites without writing historical evidence. Generated harness copies
adapt output paths only. Provider suites explicitly select the optional Google
path, preserving the release's Free Wan default. Render always precedes readers.
"""
import hashlib,json,os,re,shutil,signal,subprocess,sys,time
from pathlib import Path

root=Path(__file__).resolve().parents[1]
out=root/'.asyncly/visual-captures/release-retest'
out.mkdir(parents=True,exist_ok=True)
phases={
 'focused':[(f'controls-{group}','functional-audit.mjs',[group],300,'controls') for group in ['numbers','grades','layers','motion','weather','saved','audio']]+[
  ('files-responsive','audit-files-responsive.mjs',[],280,None),('atmosphere','audit-atmosphere.mjs',[],210,None),('zoom','audit-zoom.mjs',[],120,None),('recovery-video','audit-recovery-video.mjs',[],190,None)],
 'providers': [('source-actions','verify-release-source-actions.mjs',[],210,None),('provider-controls','verify-release-provider-controls.mjs',[],270,None),('wan-sdk','verify-wan-studio.mjs',[],520,None),('wan-pixels','verify-wan-pixels.mjs',[],300,None),('wan-framing','verify-wan-framing.mjs',[],240,None),('google-motion','verify-gemini-motion.mjs',[],400,'google'),('google-edges','verify-gemini-edges.mjs',[],280,'google'),('google-retention','verify-gemini-retention.mjs',[],190,'google'),('restore-selection','verify-video-restore.mjs',[],210,None)],
 'photo':[('photo-main','verify-v3.mjs',[],280,'photo'),('photo-edges','v3-edge-checks.mjs',[],220,'photo'),('photo-render','v3-render-checks.mjs',[],220,'photo'),('photo-final','v3-final-checks.mjs',[],190,'photo'),('photo-video-proof','v3-video-proof.mjs',[],100,'photo'),('cycles','v3-cycle-checks.mjs',[],220,None),('image-budget','v3-image-bounds.mjs',[],110,None),('alpha-hidden','v3-alpha-hidden-check.mjs',[],100,None)],
 'classic':[('classic-main','verify-v2.mjs',[],350,None),('classic-controls','audit-classic-controls.mjs',[],220,None),('classic-touch','check-touch-fullscreen.mjs',[],90,None)],
 'followups':[('export-timing','verify-release-export-timing.mjs',[],210,None),('wan-export','verify-release-wan-export.mjs',[],150,None),('google-touch','verify-release-google-touch.mjs',[],90,None)],
 'affected-media':[('cancel-finalization','verify-release-export-cancel.mjs',[],120,None),('export-recovery','audit-recovery-video.mjs',[],210,None),('photo-render','v3-render-checks.mjs',[],250,'photo'),('photo-final','v3-final-checks.mjs',[],220,'photo'),('photo-video-proof','v3-video-proof.mjs',[],100,'photo')],
 'reduced':[('reduced-export','verify-release-reduced-export.mjs',[],150,None)],
 'cleanup':[('encoder-failure','verify-release-export-cancel.mjs',['failure'],120,None),('hidden-export','v3-alpha-hidden-check.mjs',[],100,None)]
}
files=sorted([p for folder in ['src','public'] for p in (root/folder).rglob('*')if p.is_file()]+[root/n for n in ['package.json','package-lock.json','index.html','tsconfig.json','.openai/hosting.json']])
def digest():
 h=hashlib.sha256()
 for p in files:h.update(str(p.relative_to(root)).encode()+b'\0'+p.read_bytes()+b'\0')
 return h.hexdigest()
def harness(script,target):
 s=(root/'scripts'/script).read_text()
 # Only redirect output-directory declarations, never historical fixture inputs.
 s=re.sub(r"(out=resolve\()(?:process\.env\.STILLWILD_EVIDENCE_DIR\|\|)?'[^']+'",lambda m:m[1]+json.dumps(str(target)),s)
 # One older touch suite writes literal output paths.
 if script=='check-touch-fullscreen.mjs':s=s.replace('.asyncly/visual-captures/',str(target)+'/')
 if script=='check-touch-fullscreen.mjs':s=s.replace("page.goto('http://127.0.0.1:5173/'","page.goto('http://127.0.0.1:5173/?workspace=classic'")
 s=s.replace("from'../src/","from'"+str(root/'src')+'/').replace("from '../src/","from '"+str(root/'src')+'/')
 s=s.replace("from './release-recording-diagnostics.mjs'","from '"+str(root/'scripts/release-recording-diagnostics.mjs')+"'")
 if script.startswith('verify-gemini-'):
  choose="await p.getByRole('combobox',{name:'Generation provider',exact:true}).selectOption('google');"
  s=s.replace("await tab(p,'AI');","await tab(p,'AI');"+choose)
  s=s.replace("await p.getByRole('tab',{name:'AI',exact:true}).click();","await p.getByRole('tab',{name:'AI',exact:true}).click();"+choose)
  s=s.replace("await tab(q,'AI');","await tab(q,'AI');await q.getByRole('combobox',{name:'Generation provider',exact:true}).selectOption('google');")
  s=s.replace("await q.getByRole('tab',{name:'AI',exact:true}).tap();","await q.getByRole('tab',{name:'AI',exact:true}).tap();await q.getByRole('combobox',{name:'Generation provider',exact:true}).selectOption('google');")
  s=s.replace("{in:.5,out:3.5,speed:1.5,blend:.3}","{in:.5,out:3.5,speed:1.5,blend:.3,provider:'google'}")
  s=s.replace(r'/Arbitrary trim\/speed can jump/',r'/Manual timing may jump at the project boundary/')
  s=s.replace("toContainText('may still process and charge')","toContainText('Server cancellation is not guaranteed.')")
 if script=='v3-render-checks.mjs':
  s=s.replace('const Real=window.MediaRecorder,original=', 'const Encoder=window.VideoEncoder;window.VideoEncoder=undefined;const Real=window.MediaRecorder,original=')
  s=s.replace('finally{window.MediaRecorder=Real;HTMLCanvasElement.prototype.captureStream=original;}', 'finally{window.MediaRecorder=Real;window.VideoEncoder=Encoder;HTMLCanvasElement.prototype.captureStream=original;}')
 if script=='audit-recovery-video.mjs':
  s=s.replace('window.MediaRecorder=class{', 'window.__ActualEncoder=window.VideoEncoder;window.VideoEncoder=undefined;window.MediaRecorder=class{')
  encode="""window.VideoEncoder=window.__ActualEncoder;const encode=VideoEncoder.prototype.encode;window.__encoderEncode=encode;VideoEncoder.prototype.encode=function(frame,...args){if(window.__rawFrameRequests++%24===0){const canvas=document.createElement('canvas');canvas.width=frame.displayWidth;canvas.height=frame.displayHeight;const ctx=canvas.getContext('2d');ctx.drawImage(frame,0,0);const data=ctx.getImageData(0,0,canvas.width,canvas.height).data;window.__rawFrames.push(crypto.subtle.digest('SHA-256',data).then(v=>Array.from(new Uint8Array(v)).map(n=>n.toString(16).padStart(2,'0')).join('')));}return encode.call(this,frame,...args);};"""
  s=s.replace('window.MediaRecorder=window.__Recorder;', 'window.MediaRecorder=window.__Recorder;'+encode)
  s=s.replace('HTMLCanvasElement.prototype.captureStream=window.__capture;', 'HTMLCanvasElement.prototype.captureStream=window.__capture;VideoEncoder.prototype.encode=window.__encoderEncode;')
 if script in ['v3-final-checks.mjs','v3-alpha-hidden-check.mjs']:
  s=s.replace('window.__tracks=[];const real=HTMLCanvasElement.prototype.captureStream;', 'window.__tracks=[];window.__encoders=[];window.__RealEncoder=window.VideoEncoder;window.VideoEncoder=class extends window.__RealEncoder{constructor(...args){super(...args);window.__encoders.push(this);}};const real=HTMLCanvasElement.prototype.captureStream;')
  s=s.replace('window.__tracks.map(t=>t.readyState)', "[...window.__tracks.map(t=>t.readyState),...window.__encoders.map(e=>e.state==='closed'?'ended':e.state)]")
  s=s.replace('HTMLCanvasElement.prototype.captureStream=window.__capture;', 'HTMLCanvasElement.prototype.captureStream=window.__capture;window.VideoEncoder=window.__RealEncoder;')
  s=s.replace('HTMLCanvasElement.prototype.captureStream=window.__realCapture;', 'HTMLCanvasElement.prototype.captureStream=window.__realCapture;window.VideoEncoder=window.__RealEncoder;')
 if script=='v3-alpha-hidden-check.mjs':
  # Encoder capability discovery is asynchronous. Hide only after an actual
  # encoder is configured, so the cleanup assertion exercises active work.
  s=s.replace('await p.waitForTimeout(250);', "await expect.poll(()=>p.evaluate(()=>window.__encoders.some(e=>e.state==='configured')||window.__tracks.some(t=>t.readyState==='live')),{timeout:15000}).toBe(true);")
  s=s.replace("await p.getByRole('button',{name:'Export',exact:true}).click();", "const downloads=[];p.on('download',d=>downloads.push(d.suggestedFilename()));await p.getByRole('button',{name:'Export',exact:true}).click();")
  s=s.replace("assert.ok(tracks.length&&tracks.every(s=>s==='ended'));", "const encoderStates=await p.evaluate(()=>window.__encoders.map(e=>e.state));const recorderTracks=await p.evaluate(()=>window.__tracks.map(t=>t.readyState));assert.ok(encoderStates.length||recorderTracks.length);assert.ok(encoderStates.every(s=>s==='closed'));assert.ok(recorderTracks.every(s=>s==='ended'));assert.equal(downloads.length,0);await expect(p.locator('.p-toast')).toContainText('cancelled');")
  s=s.replace('hiddenExportTracks:tracks', 'hiddenExportTracks:recorderTracks,hiddenExportEncoders:encoderStates,downloads')
 return s

phase=sys.argv[1] if len(sys.argv)>1 else 'focused'
phases['remaining']=phases['providers']+phases['photo']+phases['classic']
phases['all']=phases['focused']+phases['remaining']
selected=set(sys.argv[2:]);source=digest();runs=[]
stamp=time.strftime('%Y%m%d-%H%M%S',time.gmtime())
for name,script,args,timeout,shared in phases[phase]:
 if selected and name not in selected:continue
 target=out/stamp/(shared or name);target.mkdir(parents=True,exist_ok=True)
 if shared=='google':shutil.copyfile(root/'.asyncly/visual-captures/gemini-motion/fixture.mp4',target/'fixture.mp4')
 copy=target/script;copy.write_text(harness(script,target))
 if script=='verify-wan-pixels.mjs':
  subprocess.run(['ffmpeg','-y','-v','error','-f','lavfi','-i','testsrc2=size=4096x2160:rate=16','-t','0.5','-c:v','libx264','-pix_fmt','yuv420p','-preset','ultrafast',str(target/'large-fixture.mp4')],check=True,timeout=45)
 env={**os.environ,'STILLWILD_EVIDENCE_DIR':str(target),'STILLWILD_SUITE':name}
 log=target/(name+'.log');started=time.time();print('START',name,str(target),flush=True)
 with log.open('w')as stream:
  child=subprocess.Popen(['node','--import',str(root/'scripts/release-context.mjs'),str(copy),*args],cwd=root,env=env,stdout=stream,stderr=subprocess.STDOUT,start_new_session=True)
  try:code=child.wait(timeout=timeout)
  except subprocess.TimeoutExpired:
   os.killpg(child.pid,signal.SIGTERM)
   try:child.wait(timeout=10)
   except subprocess.TimeoutExpired:os.killpg(child.pid,signal.SIGKILL);child.wait()
   code=124
 record={'name':name,'script':'scripts/'+script,'args':args,'result':'PASS'if code==0 else'FAIL','exitCode':code,'durationSeconds':round(time.time()-started,1),'log':str(log),'evidenceDirectory':str(target),'sourceDigest':source,'sourceUnchanged':digest()==source}
 runs.append(record);print('END',name,record['result'],record['durationSeconds'],flush=True)
 (out/(phase+'-'+stamp+'.json')).write_text(json.dumps({'checkedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'sourceDigest':source,'sourceFiles':[str(p)for p in files],'runs':runs},indent=2)+'\n')
 if not record['sourceUnchanged']:raise RuntimeError('Application source changed during validation.')
 # Continue independent suites after failure and preserve the original report.
sys.exit(1 if any(r['result']=='FAIL'for r in runs)else 0)
