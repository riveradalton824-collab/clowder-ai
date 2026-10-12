#!/usr/bin/env node
// Shared renderer for the promo films in docs/videos/<project>/.
// A project provides composition/index.html whose main module sets
// window.seek(t), window.FILM = { name, duration, fps } and window.__ready,
// plus an optional audio/synth.mjs <out.wav>.
//
//   node docs/videos/promo-kit/render.mjs docs/videos/<project>              full film (+ score)
//   node docs/videos/promo-kit/render.mjs docs/videos/<project> --stills 3,21 PNG stills
//   node docs/videos/promo-kit/render.mjs docs/videos/<project> --from 17 --to 30   silent preview
import { execFileSync, execSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
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
    const file = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok(server)));
}

async function encode(page, film, from, to, out) {
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(film.fps), '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out],
    { stdio: ['pipe', 'inherit', 'inherit'] });
  const frames = Math.round((to - from) * film.fps);
  const started = Date.now();
  for (let f = 0; f < frames; f++) {
    await page.evaluate((x) => window.seek(x), from + f / film.fps);
    const buf = await page.screenshot({ type: 'jpeg', quality: 94 });
    if (!ff.stdin.write(buf)) await new Promise((ok) => ff.stdin.once('drain', ok));
    if (f % 150 === 0) console.log(`frame ${f}/${frames} · ${((Date.now() - started) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end();
  await new Promise((ok) => ff.on('close', ok));
}

async function main() {
  const project = path.resolve(process.argv[2] || '.');
  if (!project.startsWith(ROOT) || !fs.existsSync(path.join(project, 'composition/index.html'))) {
    throw new Error(`not a promo project: ${project}`);
  }
  const out = path.join(project, 'output');
  fs.mkdirSync(out, { recursive: true });
  const server = await serve();
  const browser = await loadPlaywright().chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('[page]', e.message));
  const url = `/${path.relative(ROOT, project).split(path.sep).join('/')}/composition/index.html`;
  await page.goto(`http://127.0.0.1:${server.address().port}${url}`);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
  const film = await page.evaluate(() => window.FILM);

  const stills = arg('stills');
  if (stills) {
    fs.mkdirSync(path.join(out, 'stills'), { recursive: true });
    for (const t of stills.split(',').map(Number)) {
      await page.evaluate((x) => window.seek(x), t);
      await page.screenshot({ path: path.join(out, 'stills', `t${t.toFixed(2)}.png`) });
    }
  } else {
    const from = Number(arg('from', 0));
    const to = Number(arg('to', film.duration));
    const partial = from > 0 || to < film.duration;
    const silent = path.join(out, partial ? 'preview.mp4' : 'video-silent.mp4');
    await encode(page, film, from, to, silent);
    const synth = path.join(project, 'audio/synth.mjs');
    if (!partial && fs.existsSync(synth) && !process.argv.includes('--no-audio')) {
      const wav = path.join(out, 'score.wav');
      execFileSync('node', [synth, wav], { stdio: 'inherit' });
      const final = path.join(out, `${film.name}.mp4`);
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
