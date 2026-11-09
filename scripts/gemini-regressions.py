"""Run relevant accepted studio suites against one frozen application revision."""
import hashlib,json,os,subprocess,time,sys
from pathlib import Path
root=Path(__file__).resolve().parents[1];out=root/'.asyncly/visual-captures/gemini-motion';out.mkdir(exist_ok=True,parents=True)
files=sorted([p for folder in ['src','public'] for p in (root/folder).rglob('*') if p.is_file()]+[root/n for n in ['package.json','package-lock.json','index.html','tsconfig.json']])
def digest():
 h=hashlib.sha256()
 for p in files:h.update(str(p.relative_to(root)).encode()+b'\0'+p.read_bytes()+b'\0')
 return h.hexdigest()
source=digest();runs=[]
if len(sys.argv)>1 and (out/'regressions.json').exists():
 previous=json.loads((out/'regressions.json').read_text());assert previous['sourceDigest']==source;runs=[r for r in previous['runs'] if r['result']=='passed']
for name,script,folder,timeout in [('photo-main','verify-v3.mjs','photo',250),('photo-edges','v3-edge-checks.mjs','photo',250),('photo-render','v3-render-checks.mjs','photo',190),('photo-final','v3-final-checks.mjs','photo',190),('classic-main','verify-v2.mjs','classic',310)]:
 if any(r['name']==name and r['result']=='passed'for r in runs):continue
 target=out/'regression'/folder;target.mkdir(exist_ok=True,parents=True);env=os.environ.copy();env['STILLWILD_EVIDENCE_DIR']=str(target);started=time.time();print('START',name,flush=True)
 with (out/(name+'.log')).open('w') as log:
  try:code=subprocess.run(['node','scripts/'+script],cwd=root,env=env,stdout=log,stderr=subprocess.STDOUT,timeout=timeout).returncode
  except subprocess.TimeoutExpired:code=124
 runs.append({'name':name,'result':'passed' if code==0 else 'failed','exitCode':code,'durationSeconds':round(time.time()-started,1),'sourceDigest':source,'log':str(out/(name+'.log'))});print('END',name,runs[-1]['result'],flush=True)
 if digest()!=source:raise RuntimeError('Application source changed during verification.')
 (out/'regressions.json').write_text(json.dumps({'result':'passed' if all(r['result']=='passed'for r in runs)else'failed','sourceDigest':source,'sourceFiles':[str(p)for p in files],'runs':runs},indent=2)+'\n')
 if code:raise SystemExit(code)
