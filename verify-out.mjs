import { statSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

function getStats(dir) {
  let count = 0;
  let bytes = 0;
  function walk(d) {
    for (const f of readdirSync(d)) {
      const fp = join(d, f);
      const st = statSync(fp);
      if (st.isDirectory()) {
        walk(fp);
      } else {
        count++;
        bytes += st.size;
      }
    }
  }
  walk(dir);
  return { count, bytes };
}

const dossierSize = statSync('/tmp/gta6-out/dossier.json').size;
const gameStats = getStats('/tmp/gta6-out/game');
console.log('Dossier size:', dossierSize, 'bytes');
console.log('Game file count:', gameStats.count);
console.log('Game total bytes:', gameStats.bytes);

const ssDir = '/tmp/gta6-out/screenshots';
for (const f of readdirSync(ssDir)) {
  console.log(`Screenshot ${f}: ${statSync(join(ssDir, f)).size} bytes`);
}
