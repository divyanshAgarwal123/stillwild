"""Run the photo/media regressions on frozen application files, producer first."""
import hashlib,json,os,subprocess,time
from pathlib import Path
root=Path(__file__).resolve().parents[1];out=root/'.asyncly/visual-captures/free-wan-studio';out.mkdir(exist_ok=True,parents=True)
files=sorted([p for folder in ['src','public'] for p in (root/folder).rglob('*')if p.is_file()]+[root/n for n in ['package.json','package-lock.json','index.html','tsconfig.json']])
def digest():
 h=hashlib.sha256()
 for p in files:h.update(str(p.relative_to(root)).encode()+b'\0'+p.read_bytes()+b'\0')
 return h.hexdigest()
source=digest();runs=[]
for name,script,timeout in [('photo-main','verify-v3.mjs',250),('photo-edges','v3-edge-checks.mjs',250),('photo-render','v3-render-checks.mjs',200),('photo-final','v3-final-checks.mjs',200)]:
 target=out/'regression';target.mkdir(exist_ok=True,parents=True);env={**os.environ,'STILLWILD_EVIDENCE_DIR':str(target)};started=time.time();print('START',name,flush=True)
 with(out/(name+'.log')).open('w')as log:
  try:code=subprocess.run(['node','scripts/'+script],cwd=root,env=env,stdout=log,stderr=subprocess.STDOUT,timeout=timeout).returncode
  except subprocess.TimeoutExpired:code=124
 runs.append({'name':name,'result':'passed'if code==0 else'failed','exitCode':code,'durationSeconds':round(time.time()-started,1),'log':str(out/(name+'.log'))});print('END',name,runs[-1]['result'],flush=True)
 if digest()!=source:raise RuntimeError('Frozen application source changed during verification.')
 (out/'regressions.json').write_text(json.dumps({'result':'passed'if all(r['result']=='passed'for r in runs)else'failed','sourceDigest':source,'sourceFiles':[str(p)for p in files],'runs':runs},indent=2)+'\n')
 if code:raise SystemExit(code)
