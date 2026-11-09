"""Start an owned Vite preview with detached streams; print its exact local URL."""
from pathlib import Path
import os, subprocess, urllib.request, time
root = Path(__file__).resolve().parent.parent
port = int(os.environ.get('ASYNCLY_VISUAL_PREVIEW_PORT', '5173'))
url = f'http://127.0.0.1:{port}/'
try:
    with urllib.request.urlopen(url, timeout=2) as response:
        if b'<title>Stillwild' in response.read():
            print('Stillwild already responds at', url)
            raise SystemExit(0)
    raise SystemExit('Port is occupied by a different application.')
except OSError:
    pass
folder = root / '.asyncly' / 'visual-captures'
folder.mkdir(parents=True, exist_ok=True)
with (folder / 'dev-server.log').open('a') as log:
    process = subprocess.Popen(['node', 'scripts/preview.mjs'], cwd=root, env={**os.environ, 'ASYNCLY_VISUAL_PREVIEW_PORT': str(port)}, stdin=subprocess.DEVNULL, stdout=log, stderr=log, start_new_session=True)
(folder / 'dev-server.pid').write_text(str(process.pid))
for _ in range(30):
    try:
        with urllib.request.urlopen(url, timeout=1) as response:
            if response.status == 200 and b'<title>Stillwild' in response.read():
                print(f'Stillwild responds at {url} (detached PID {process.pid})')
                break
    except OSError:
        time.sleep(.2)
else:
    raise SystemExit('Preview did not respond. See .asyncly/visual-captures/dev-server.log')
