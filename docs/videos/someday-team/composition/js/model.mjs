// The coffee machine the team finally builds: a real three.js model whose state is a
// pure function of the params passed to update() (clay → proportions → brand → teardown).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { clamp, easeOut, lerp } from '../../../promo-kit/util.mjs';

const CLAY = new THREE.Color('#b9b1a6');
const BRAND = { shell: new THREE.Color('#c46a4d'), trim: new THREE.Color('#f3e3da'), base: new THREE.Color('#3d3934') };

function mat(color, extra = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.05, ...extra });
}

export function createModel(canvas, width, height) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(width, height, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(25, width / height, 0.1, 100);
  camera.position.set(3.6, 2.5, 4.8);
  camera.lookAt(0, 0.8, 0);
  scene.add(new THREE.HemisphereLight(0xfffaf2, 0xcbb9a6, 1.5));
  const key = new THREE.DirectionalLight(0xffffff, 1.9);
  key.position.set(3, 5, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffe7d6, 0.7);
  rim.position.set(-4, 2, -3);
  scene.add(rim);

  // soft contact shadow
  const sh = document.createElement('canvas');
  sh.width = sh.height = 128;
  const g2 = sh.getContext('2d');
  const grad = g2.createRadialGradient(64, 64, 4, 64, 64, 64);
  grad.addColorStop(0, 'rgba(60,40,30,0.38)');
  grad.addColorStop(1, 'rgba(60,40,30,0)');
  g2.fillStyle = grad;
  g2.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.2), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sh), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.001;
  scene.add(shadow);

  const root = new THREE.Group();
  scene.add(root);
  // a lump of clay: an icosphere with seeded bumps
  const lumpGeo = new THREE.IcosahedronGeometry(0.62, 4);
  const pos = lumpGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const v = new THREE.Vector3().fromBufferAttribute(pos, i);
    const n = 1 + 0.09 * Math.sin(v.x * 9.1 + 1.3) * Math.cos(v.y * 7.3) + 0.05 * Math.sin(v.z * 13.7);
    v.multiplyScalar(n);
    pos.setXYZ(i, v.x, v.y * 0.82, v.z);
  }
  lumpGeo.computeVertexNormals();
  const lump = new THREE.Mesh(lumpGeo, mat(CLAY, { roughness: 0.95 }));
  lump.position.y = 0.5;
  scene.add(lump);
  // warm halo for the highlighted filter
  const hc = document.createElement('canvas');
  hc.width = hc.height = 128;
  const h2 = hc.getContext('2d');
  const hg = h2.createRadialGradient(64, 64, 2, 64, 64, 64);
  hg.addColorStop(0, 'rgba(255,214,140,0.95)');
  hg.addColorStop(0.35, 'rgba(255,170,90,0.45)');
  hg.addColorStop(1, 'rgba(255,150,80,0)');
  h2.fillStyle = hg;
  h2.fillRect(0, 0, 128, 128);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(hc), transparent: true, depthWrite: false, depthTest: false }));
  halo.scale.set(0.9, 1.3, 1);

  const P = {};
  const add = (name, geo, color, pos, extra) => {
    const m = new THREE.Mesh(geo, mat(color, extra));
    m.position.set(...pos);
    m.userData.home = new THREE.Vector3(...pos);
    m.userData.base = new THREE.Color(color);
    root.add(m);
    P[name] = m;
    return m;
  };
  add('base', new RoundedBoxGeometry(1.2, 0.18, 1.08, 3, 0.03), '#4a4540', [0, 0.09, 0.02]);
  add('body', new RoundedBoxGeometry(1.12, 1.24, 1.0, 3, 0.03), '#c8c2b9', [0, 0.8, -0.04]);
  add('bodyRound', new RoundedBoxGeometry(1.12, 1.24, 1.0, 6, 0.16), '#c8c2b9', [0, 0.8, -0.04]);
  add('top', new RoundedBoxGeometry(1.04, 0.05, 0.9, 2, 0.02), '#d9d4cc', [0, 1.45, -0.04], { metalness: 0.5, roughness: 0.3 });
  add('head', new RoundedBoxGeometry(0.52, 0.2, 0.28, 3, 0.05), '#d9d4cc', [0, 1.12, 0.56]);
  add('group', new THREE.CylinderGeometry(0.17, 0.17, 0.1, 32), '#9a948c', [0, 0.98, 0.6], { metalness: 0.6, roughness: 0.35 });
  add('porta', new THREE.CylinderGeometry(0.16, 0.13, 0.12, 32), '#7d7770', [0, 0.86, 0.6], { metalness: 0.6, roughness: 0.35 });
  add('handle', new RoundedBoxGeometry(0.08, 0.06, 0.46, 2, 0.02), '#2e2b28', [0, 0.86, 0.95]);
  add('tray', new RoundedBoxGeometry(0.84, 0.08, 0.44, 2, 0.02), '#8c867e', [0, 0.22, 0.5], { metalness: 0.4 });
  add('tank', new RoundedBoxGeometry(0.72, 0.92, 0.26, 3, 0.05), '#bfe0f0', [0, 0.98, -0.68], { transparent: true, opacity: 0.45, roughness: 0.1 });
  add('filter', new THREE.CylinderGeometry(0.11, 0.11, 0.6, 24), '#f4f7f8', [0, 0.92, -0.68]);
  add('boiler', new THREE.CylinderGeometry(0.22, 0.22, 0.5, 32), '#b87a4b', [0.12, 0.86, -0.02], { metalness: 0.7, roughness: 0.3 });
  add('pump', new RoundedBoxGeometry(0.22, 0.18, 0.32, 2, 0.03), '#2e2b28', [-0.26, 0.42, 0.0]);
  P.handle.rotation.x = 0.12;
  const parts = Object.keys(P);
  const OUT = {
    top: [0, 0.3, 0],
    tank: [0, 0.12, -0.5],
    filter: [0, 0.6, -0.5],
    tray: [0, -0.04, 0.62],
    porta: [0, -0.2, 0.62],
    handle: [0, -0.2, 0.62],
    boiler: [0.62, 0.1, 0],
    pump: [-0.62, 0.0, 0.1],
  };
  const STAGGER = { base: 0, body: 0.1, bodyRound: 0.1, top: 0.35, head: 0.25, group: 0.3, porta: 0.4, handle: 0.45, tray: 0.2, tank: 0.5, filter: 0.6, boiler: 0.2, pump: 0.2 };

  /**
   * p: { grow 0..1, prop [sx,sy,sz], skew 0..1, brand 0..1, round 0|1, explode 0..1,
   *      glow 0..1, hideCore 0..1, rotY, pulse }
   */
  function update(p) {
    const grow = p.grow ?? 1;
    const lumpK = easeOut(clamp((grow - 0.3) / 0.5));
    lump.visible = lumpK < 1;
    lump.scale.setScalar(Math.max(0.001, 1 - lumpK));
    lump.rotation.y = p.rotY ?? 0;
    const [sx, sy, sz] = p.prop || [1, 1, 1];
    root.scale.set(sx, sy, sz);
    root.rotation.y = p.rotY ?? 0;
    const ex = p.explode ?? 0;
    const skew = p.skew ?? 0;
    const brand = p.brand ?? 0;
    const clay = p.clay ?? 0;
    for (const name of parts) {
      const m = P[name];
      const g = easeOut(clamp((grow - 0.25 - STAGGER[name] * 0.5) / 0.35));
      m.scale.setScalar(Math.max(0.001, g * (1 + (p.pulse ?? 0) * 0.04)));
      const o = OUT[name] || [0, 0, 0];
      m.position.set(m.userData.home.x + o[0] * ex, m.userData.home.y + o[1] * ex, m.userData.home.z + o[2] * ex);
      const c = m.userData.base.clone();
      if (name === 'body' || name === 'bodyRound') c.lerp(BRAND.shell, brand);
      if (name === 'head' || name === 'top') c.lerp(BRAND.trim, brand);
      if (name === 'base') c.lerp(BRAND.base, brand);
      m.material.color.copy(c.lerp(CLAY, clay));
    }
    // crooked spout: the funny first try
    for (const name of ['head', 'group', 'porta', 'handle']) {
      P[name].position.x += 0.34 * skew;
      P[name].position.y -= 0.06 * skew;
      P[name].rotation.z = -0.62 * skew;
    }
    P.top.rotation.z = 0.12 * skew;
    // rounded vs sharp shell; the shell ghosts in the teardown so the inside shows
    P.body.visible = !(p.round ?? 0);
    P.bodyRound.visible = !!(p.round ?? 0);
    for (const b of [P.body, P.bodyRound]) {
      b.material.transparent = ex > 0.01;
      b.material.opacity = lerp(1, 0.5, ex);
      b.material.depthWrite = ex < 0.5;
    }
    const hide = p.hideCore ?? 0;
    for (const c of [P.boiler, P.pump]) {
      c.material.transparent = true;
      c.material.opacity = lerp(1, 0.1, hide) * clamp(ex * 3);
      c.visible = ex > 0.01;
    }
    const glow = p.glow ?? 0;
    P.filter.material.emissive.setRGB(1.0 * glow, 0.62 * glow, 0.2 * glow);
    if (!halo.parent) P.filter.add(halo);
    halo.material.opacity = glow;
    halo.visible = glow > 0.01;
    P.tank.material.opacity = lerp(0.45, 0.3, ex);
    renderer.render(scene, camera);
  }

  /** Canvas-pixel position of a part (plus an optional offset in model units). */
  function project(name, off = [0, 0, 0]) {
    const v = new THREE.Vector3(...off);
    P[name].localToWorld(v);
    v.project(camera);
    return { x: ((v.x + 1) / 2) * width, y: ((1 - v.y) / 2) * height };
  }
  return { update, project, canvas };
}
