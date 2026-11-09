"""Run isolated browser suites against frozen source; save logs without replacing prior QA evidence."""
import hashlib,json,os,subprocess,sys,time
from pathlib import Path
root=Path(__file__).resolve().parents[1];out=root/'.asyncly/visual-captures/functional-audit';out.mkdir(exist_ok=True,parents=True)
mode=sys.argv[1];runs=[]
suites={
 'focused': [('control-matrix',['node','scripts/functional-audit.mjs','all'],None,1000),('files-responsive',['node','scripts/audit-files-responsive.mjs'],None,250),('atmosphere',['node','scripts/audit-atmosphere.mjs'],None,190),('zoom',['node','scripts/audit-zoom.mjs'],None,100)],
 'photo': [('photo-main',['node','scripts/verify-v3.mjs'],'regression/v3',250),('photo-edges',['node','scripts/v3-edge-checks.mjs'],'regression/v3',250),('photo-render',['node','scripts/v3-render-checks.mjs'],'regression/v3',190),('photo-final',['node','scripts/v3-final-checks.mjs'],'regression/v3',160),('photo-video-proof',['node','scripts/v3-video-proof.mjs'],'regression/v3',100),('cycles',['node','scripts/v3-cycle-checks.mjs'],'regression/cycles',190),('image-budget',['node','scripts/v3-image-bounds.mjs'],'regression/v3',100),('alpha-hidden',['node','scripts/v3-alpha-hidden-check.mjs'],'regression/v3',70)],
 'classic': [('classic-main',['node','scripts/verify-v2.mjs'],'regression/classic',310),('classic-controls',['node','scripts/audit-classic-controls.mjs'],None,190)]}
files=sorted([p for folder in ['src','public'] for p in (root/folder).rglob('*') if p.is_file()]+[root/n for n in ['package.json','package-lock.json','index.html','tsconfig.json']])
def digest():
 h=hashlib.sha256()
 for p in files:h.update(str(p.relative_to(root)).encode()+b'\0'+p.read_bytes()+b'\0')
 return h.hexdigest()
source=digest()
for name,args,evidence,timeout in suites[mode]:
 env=os.environ.copy()
 if evidence:(out/evidence).mkdir(parents=True,exist_ok=True);env['STILLWILD_EVIDENCE_DIR']=str(out/evidence)
 started=time.time();print('START',name,flush=True)
 try:
  with (out/(name+'.log')).open('w') as log:result=subprocess.run(args,cwd=root,env=env,stdout=log,stderr=subprocess.STDOUT,timeout=timeout)
  code=result.returncode
 except subprocess.TimeoutExpired:code=124
 record={'name':name,'result':'passed' if code==0 else 'failed','exitCode':code,'durationSeconds':round(time.time()-started,1),'log':str(out/(name+'.log')),'sourceDigest':source};runs.append(record)
 print('END',name,record['result'],record['durationSeconds'],flush=True)
 if digest()!=source:raise RuntimeError('Application source changed during regression; acceptance invalidated.')
 (out/(mode+'-regressions.json')).write_text(json.dumps({'result':'passed' if all(r['result']=='passed' for r in runs) else 'failed','sourceDigest':source,'sourceFiles':[str(p)for p in files],'runs':runs},indent=2)+'\n')
 if code:sys.exit(code)
