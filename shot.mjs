import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const pwPath = '/home/hatch/workspace/makefun/node_modules/playwright/index.mjs';
const { chromium } = await import(pwPath);

async function main() {
  mkdirSync('screenshots', { recursive: true });

  // Start server on port 8124
  const server = spawn('node', ['serve.ts', '--port', '8124'], { stdio: 'inherit' });
  await new Promise(resolve => setTimeout(resolve, 1500));

  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox']
  });

  const shots = JSON.parse(readFileSync('shots.json', 'utf8'));
  const summary = { shots: [], errors: [] };

  for (const s of shots) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    page.on('console', msg => {
      if (msg.type() === 'error') summary.errors.push(`[console.error] ${msg.text()}`);
    });
    page.on('pageerror', err => {
      summary.errors.push(`[pageerror] ${err.message}`);
    });

    const url = `http://localhost:8124/index.html?shot=${s.shot}&seed=${s.seed}`;
    console.log(`Opening ${url}...`);
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 10000 });
      await page.waitForFunction(() => window.__shotReady === true, { timeout: 10000 });
      await new Promise(r => setTimeout(r, 500)); // extra render settling

      let quality = 80;
      let path = join('screenshots', `${s.name}.jpg`);
      await page.screenshot({ path, quality, type: 'jpeg' });

      // Check size limit (262,144 bytes)
      let stats = readFileSync(path);
      if (stats.length > 262144) {
        console.log(`Shot ${s.name} size ${stats.length} > 262144, retrying with quality 60...`);
        quality = 60;
        await page.screenshot({ path, quality, type: 'jpeg' });
        stats = readFileSync(path);
      }

      summary.shots.push({ name: s.name, bytes: stats.length, success: true });
    } catch (e) {
      console.error(`Error capturing ${s.name}:`, e);
      summary.errors.push(`[shot ${s.name}] ${e.message}`);
      summary.shots.push({ name: s.name, success: false });
    }
    await page.close();
  }

  // Test plain game boot & new game start
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    page.on('console', msg => {
      if (msg.type() === 'error') summary.errors.push(`[plain console.error] ${msg.text()}`);
    });
    page.on('pageerror', err => {
      summary.errors.push(`[plain pageerror] ${err.message}`);
    });
    const url = `http://localhost:8124/index.html`;
    console.log(`Opening plain game ${url}...`);
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 10000 });
      await new Promise(r => setTimeout(r, 1000));
      await page.click('#start-btn');
      await new Promise(r => setTimeout(r, 1000));
      console.log('Plain game booted and started successfully.');
    } catch (e) {
      summary.errors.push(`[plain game] ${e.message}`);
    }
    await page.close();
  }

  await browser.close();
  server.kill();

  console.log('--- SHOT VERIFICATION SUMMARY ---');
  console.log(JSON.stringify(summary, null, 2));
}

main().catch(err => {
  console.error('Fatal error in shot.mjs:', err);
  process.exit(1);
});
