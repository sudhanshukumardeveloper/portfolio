/**
 * Hero node-graph visual.
 *
 * Renders a small, quiet network of connected points behind the hero copy.
 * Follows the WebGPU-first / WebGL-fallback pattern: we try WebGPURenderer
 * first (per Three.js r171+ guidance) and transparently fall back to the
 * classic WebGLRenderer if WebGPU isn't available or fails to initialise.
 *
 * Performance notes (kept intentionally light for a portfolio hero):
 * - One InstancedMesh for all nodes  -> 1 draw call.
 * - One LineSegments buffer for all edges -> 1 draw call.
 * - Animation pauses when the tab is hidden or the user prefers reduced motion.
 * - Geometries/materials are disposed on teardown (there's no teardown here
 *   since it's a single-page site, but the dispose calls are left in place
 *   as the correct pattern if this canvas is ever reused elsewhere).
 */

const canvas = document.getElementById('node-canvas');
if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  initHero(canvas).catch((err) => {
    // Fail silently and quietly hide the canvas — the hero copy stands on
    // its own without the graphic, so a render failure should never block
    // or visually break the page.
    console.warn('Hero visual could not initialise:', err);
    canvas.style.display = 'none';
  });
} else if (canvas) {
  canvas.style.display = 'none';
}

async function initHero(canvas) {
  const THREE = await import('three');

  const ink = new THREE.Color(0x22201b);
  const ochre = new THREE.Color(0xa97a26);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  // --- Renderer: try WebGPU first, fall back to WebGL -------------------
  let renderer;
  let usingWebGPU = false;
  try {
    const { WebGPURenderer } = await import('three/webgpu');
    if (navigator.gpu) {
      renderer = new WebGPURenderer({ canvas, antialias: true, alpha: true });
      await renderer.init(); // Mandatory — rendering fails silently without this.
      usingWebGPU = true;
    } else {
      throw new Error('WebGPU not supported in this browser');
    }
  } catch (e) {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  }
  renderer.setClearColor(0x000000, 0);

  // --- Build a small random node network ---------------------------------
  const NODE_COUNT = 26;
  const positions = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    positions.push(
      new THREE.Vector3(
        (Math.random() - 0.5) * 6.5,
        (Math.random() - 0.5) * 6.5,
        (Math.random() - 0.5) * 3.5
      )
    );
  }

  // Nodes as a single InstancedMesh (1 draw call).
  const nodeGeometry = new THREE.SphereGeometry(0.045, 10, 10);
  const nodeMaterial = new THREE.MeshBasicMaterial({ color: ink, transparent: true, opacity: 0.85 });
  const nodes = new THREE.InstancedMesh(nodeGeometry, nodeMaterial, NODE_COUNT);
  const dummy = new THREE.Object3D();
  positions.forEach((p, i) => {
    dummy.position.copy(p);
    dummy.updateMatrix();
    nodes.setMatrixAt(i, dummy.matrix);
  });
  scene.add(nodes);

  // Edges: connect each node to its nearest few neighbours, single LineSegments (1 draw call).
  const edgeVerts = [];
  const maxDist = 2.4;
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      if (positions[i].distanceTo(positions[j]) < maxDist) {
        edgeVerts.push(positions[i].x, positions[i].y, positions[i].z);
        edgeVerts.push(positions[j].x, positions[j].y, positions[j].z);
      }
    }
  }
  const edgeGeometry = new THREE.BufferGeometry();
  edgeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(edgeVerts, 3));
  const edgeMaterial = new THREE.LineBasicMaterial({ color: ochre, transparent: true, opacity: 0.28 });
  const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
  scene.add(edges);

  const group = new THREE.Group();
  group.add(nodes, edges);
  scene.add(group);

  // --- Resize handling ----------------------------------------------------
  function resize() {
    const { clientWidth, clientHeight } = canvas;
    const w = Math.max(1, clientWidth);
    const h = Math.max(1, clientHeight);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  // --- Gentle pointer parallax (no scroll-triggered effects) -------------
  let targetRotX = 0;
  let targetRotY = 0;
  window.addEventListener('pointermove', (e) => {
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    targetRotY = nx * 0.5;
    targetRotX = ny * 0.3;
  });

  // --- Render loop, paused when tab is hidden -----------------------------
  let running = true;
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) renderer.setAnimationLoop(tick);
    else renderer.setAnimationLoop(null);
  });

  function tick(t) {
    const time = t * 0.00006;
    group.rotation.y += (targetRotY + time - group.rotation.y) * 0.02;
    group.rotation.x += (targetRotX - group.rotation.x) * 0.04;
    renderer.render(scene, camera);
  }
  renderer.setAnimationLoop(tick);

  // Kept for reference / future reuse of this canvas elsewhere:
  window.__disposeHero = () => {
    renderer.setAnimationLoop(null);
    nodeGeometry.dispose();
    nodeMaterial.dispose();
    edgeGeometry.dispose();
    edgeMaterial.dispose();
    renderer.dispose();
  };

  if (usingWebGPU) {
    canvas.dataset.renderer = 'webgpu';
  } else {
    canvas.dataset.renderer = 'webgl';
  }
}
