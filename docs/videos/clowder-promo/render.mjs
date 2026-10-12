#!/usr/bin/env node
// Renders《一根线 / One Thread》: serves the repo, steps composition time frame
// by frame in headless Chromium, pipes frames to ffmpeg, then muxes the score.
//
//   node render.mjs                      full film → output/clowder-one-thread.mp4
//   node render.mjs --stills 3,21,33.5   PNG stills → output/stills/
//   node render.mjs --from 17 --to 30    partial preview (silent)
import { execFileSync, execSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DURATION, FPS } from './composition/js/timeline.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const OUT = path.join(HERE, 'output');
const PAGE = '/docs/videos/clowder-promo/composition/index.html';
const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.mjs': 'text/javascript', '.js': 'text/javascript',
  '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.json': 'application/json',
};

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : fallback;
}

function loadPlaywright() {
  const require = createRequire(import.meta.url);
  try {
    return require('playwright');
  } catch {
    return require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));
  }
}

function serve() {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok(server)));
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const server = await serve();
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('[page]', e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}${PAGE}`);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });

  const stills = arg('stills');
  if (stills) {
    fs.mkdirSync(path.join(OUT, 'stills'), { recursive: true });
    for (const t of stills.split(',').map(Number)) {
      await page.evaluate((x) => window.seek(x), t);
      await page.screenshot({ path: path.join(OUT, 'stills', `t${t.toFixed(2)}.png`) });
    }
  } else {
    const from = Number(arg('from', 0));
    const to = Number(arg('to', DURATION));
    const partial = from > 0 || to < DURATION;
    const silent = path.join(OUT, partial ? 'preview.mp4' : 'video-silent.mp4');
    const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', silent],
      { stdio: ['pipe', 'inherit', 'inherit'] });
    const frames = Math.round((to - from) * FPS);
    const started = Date.now();
    for (let f = 0; f < frames; f++) {
      await page.evaluate((x) => window.seek(x), from + f / FPS);
      const buf = await page.screenshot({ type: 'jpeg', quality: 94 });
      if (!ff.stdin.write(buf)) await new Promise((ok) => ff.stdin.once('drain', ok));
      if (f % 150 === 0) console.log(`frame ${f}/${frames} · ${((Date.now() - started) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end();
    await new Promise((ok) => ff.on('close', ok));
    if (!partial && !process.argv.includes('--no-audio')) {
      const wav = path.join(OUT, 'score.wav');
      execFileSync('node', [path.join(HERE, 'audio/synth.mjs'), wav], { stdio: 'inherit' });
      const final = path.join(OUT, 'clowder-one-thread.mp4');
      execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', silent, '-i', wav, '-c:v', 'copy',
        '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', final],
        { stdio: 'inherit' });
      console.log(`done → ${final}`);
    } else {
      console.log(`done → ${silent}`);
    }
  }
  await browser.close();
  server.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
