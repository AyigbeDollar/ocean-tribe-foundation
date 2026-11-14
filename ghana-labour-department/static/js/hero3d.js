// WebGL hero: a slowly turning globe of "labour market" nodes linked by arcs,
// with gold pulses travelling between them (job seekers meeting opportunities).
// Self-hosted Three.js r160. Collapses to a static frame under reduced motion.
import * as THREE from "/js/vendor/three.module.min.js";

const host = document.querySelector("[data-hero-3d]");
if (host) init(host);

function init(host) {
  // Low-powered phones, data saver and reduced motion get one still frame instead of animation.
  const conn = navigator.connection || {};
  const lowEnd = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 2 || conn.saveData === true || /2g/.test(conn.effectiveType || "");
  const reduce = lowEnd || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  } catch (e) {
    return; // No WebGL: the CSS gradient hero remains.
  }
  // Software rendering (no graphics chip: test bots, some old phones) gets one still frame, not animation.
  let softwareGL = false;
  try {
    const gl = renderer.getContext();
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    const name = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : "";
    softwareGL = /swiftshader|llvmpipe|software|basic render/i.test(name);
  } catch (e) {}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 900 ? 1.25 : 1.5));
  host.appendChild(renderer.domElement);
  renderer.domElement.setAttribute("aria-hidden", "true");

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  const group = new THREE.Group();
  scene.add(group);

  const WHITE = new THREE.Color("#ffffff"); // Brand Guide v2.0 palette on brand blue
  const GREEN = new THREE.Color("#00a35a");
  const GOLD = new THREE.Color("#F9ED32");
  const RED = new THREE.Color("#DD2A1B");
  const R = 2.6;

  // Fibonacci-sphere nodes
  const N = 420;
  const pts = [];
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = Math.PI * (3 - Math.sqrt(5)) * i;
    const v = new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r).multiplyScalar(R);
    pts.push(v);
    pos.set([v.x, v.y, v.z], i * 3);
    const c = i % 13 === 0 ? GOLD : i % 29 === 0 ? RED : i % 37 === 0 ? GREEN : WHITE;
    col.set([c.r, c.g, c.b], i * 3);
  }
  const dotGeo = new THREE.BufferGeometry();
  dotGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  dotGeo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const dotMat = new THREE.PointsMaterial({ size: 0.055, vertexColors: true, transparent: true, opacity: 0.95, sizeAttenuation: true });
  group.add(new THREE.Points(dotGeo, dotMat));

  // Faint wire shell for depth
  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(R * 0.985, 3),
    new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.06 })
  );
  group.add(shell);

  // Arcs between random node pairs
  const arcs = [];
  const arcMat = new THREE.LineBasicMaterial({ color: 0xc9cff5, transparent: true, opacity: 0.32 });
  const pulseGeo = new THREE.SphereGeometry(0.045, 10, 10);
  const pulseMat = new THREE.MeshBasicMaterial({ color: GOLD });
  for (let i = 0; i < 26; i++) {
    const a = pts[(i * 37) % N];
    const b = pts[(i * 113 + 61) % N];
    if (a.distanceTo(b) < 1.2) continue;
    const mid = a.clone().add(b).multiplyScalar(0.5);
    mid.setLength(R + a.distanceTo(b) * 0.45);
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(48)), arcMat);
    group.add(line);
    const pulse = new THREE.Mesh(pulseGeo, pulseMat);
    group.add(pulse);
    arcs.push({ curve, pulse, t: Math.random(), speed: 0.12 + Math.random() * 0.18 });
  }

  // Orbit ring
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(R * 1.32, 0.008, 8, 160),
    new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.55 })
  );
  ring.rotation.x = Math.PI / 2.35;
  ring.rotation.y = 0.25;
  group.add(ring);

  // Ambient star dust
  const dustN = 600;
  const dust = new Float32Array(dustN * 3);
  for (let i = 0; i < dustN; i++) dust.set([(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 18, -4 - Math.random() * 10], i * 3);
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dust, 3));
  scene.add(new THREE.Points(dustGeo, new THREE.PointsMaterial({ size: 0.03, color: 0xd6daf0, transparent: true, opacity: 0.45 })));

  group.rotation.z = 0.32; // Earth-like tilt

  function layout() {
    const w = host.clientWidth, h = host.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    // Desktop: globe sits right of the copy. Mobile: centred, pushed back behind text.
    if (w > 900) { group.position.set(2.9, 0, 0); group.scale.setScalar(1); }
    else { group.position.set(0, 0.6, -2.5); group.scale.setScalar(0.95); }
  }
  layout();
  new ResizeObserver(layout).observe(host);

  // Pointer parallax (motion values kept outside any framework state).
  let tx = 0, ty = 0, cx = 0, cy = 0;
  if (!reduce) {
    window.addEventListener("pointermove", (e) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 0.5;
      ty = (e.clientY / window.innerHeight - 0.5) * 0.35;
    }, { passive: true });
  }

  let visible = true;
  new IntersectionObserver((en) => { visible = en[0].isIntersecting; if (visible && !reduce && !softwareGL) loop(); }).observe(host);
  document.addEventListener("visibilitychange", () => { if (!document.hidden && visible && !reduce && !softwareGL) loop(); });

  const clock = new THREE.Clock();
  let running = false;
  function frame(dt) {
    group.rotation.y += dt * 0.08;
    cx += (tx - cx) * 0.04; cy += (ty - cy) * 0.04;
    camera.position.x = cx * 2; camera.position.y = -cy * 2;
    camera.lookAt(0, 0, 0);
    for (const a of arcs) {
      a.t = (a.t + dt * a.speed) % 1;
      a.pulse.position.copy(a.curve.getPoint(a.t));
    }
    renderer.render(scene, camera);
  }
  function loop() {
    if (running) return;
    running = true;
    clock.getDelta();
    // About 30 frames a second: smooth for a slow globe, half the work of 60.
    let acc = 0;
    const tick = () => {
      if (!visible || document.hidden) { running = false; return; }
      const dt = Math.min(clock.getDelta(), 0.1);
      acc += dt;
      if (acc >= 1 / 30) { frame(Math.min(acc, 0.1)); acc = 0; }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  if (reduce || softwareGL) frame(0); else loop();
  host.classList.add("is-ready");
}
