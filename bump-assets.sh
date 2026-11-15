#!/bin/sh
# Re-stamp asset URLs with a hash of their content (cache busting for GitHub Pages).
# Run after editing anything in assets/, then commit.
cd "$(dirname "$0")" && python3 - <<'PY'
import hashlib, glob, re
ver = {a.split('/')[-1]: hashlib.sha256(open(a, 'rb').read()).hexdigest()[:8]
       for a in glob.glob('assets/*.css') + glob.glob('assets/*.js')}
pat = re.compile(r'((?:\.\./)?assets/)([\w.-]+\.(?:css|js))(?:\?v=[0-9a-f]+)?"')
for p in glob.glob('*.html') + glob.glob('*/*.html'):
    h = open(p).read()
    open(p, 'w').write(pat.sub(lambda m: f'{m.group(1)}{m.group(2)}?v={ver.get(m.group(2), "0")}"', h))
print('stamped', ver)
PY
