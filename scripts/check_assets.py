"""Check literal asset references and subdirectory compatibility."""
from pathlib import Path
import re
root = Path(__file__).resolve().parents[1]
dist = root / 'dist'
errors, checked = [], set()
for path in dist.rglob('*'):
    if path.suffix not in {'.html', '.css', '.js', '.svg'}:
        continue
    source = path.read_text()
    if re.search(r'''["'(]/assets/''', source):
        errors.append(f'{path.relative_to(root)}: root-absolute asset path')
    for asset in re.findall(r'''\./assets/([^\s'"`\)<>]+)''', source):
        if any(c in asset for c in '${}'):
            continue
        target = dist / 'assets' / asset.split('?')[0].split('#')[0]
        checked.add(target)
        if not target.is_file():
            errors.append(f'{path.relative_to(root)}: missing {asset}')
for path in [dist / 'index.html', dist / '.nojekyll']:
    if not path.is_file():
        errors.append(f'Missing {path.relative_to(root)}')
if errors:
    raise SystemExit('\n'.join(errors))
print(f'PASS: {len(checked)} literal assets exist; no root-absolute asset paths.')
