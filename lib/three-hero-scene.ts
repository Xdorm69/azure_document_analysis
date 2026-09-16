"use client";

import * as THREE from "three";

export interface HeroSceneHandle {
  /** Call once on unmount. Frees the GL context, geometries, and listeners. */
  dispose: () => void;
}

/**
 * A small, self-contained Three.js scene: a faceted icosahedron with a
 * wireframe shell that drifts to follow the cursor. Kept deliberately
 * simple (one mesh, two lights) so it stays light on the GPU and easy to
 * reskin — swap the geometry/material below for a different look.
 */
export function createHeroScene(canvas: HTMLCanvasElement): HeroSceneHandle {
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 6.2);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Core faceted shape.
  const geometry = new THREE.IcosahedronGeometry(1.6, 1);
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#6f8dfb"),
    metalness: 0.2,
    roughness: 0.35,
    flatShading: true,
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // Slightly larger wireframe shell for depth.
  const wireGeometry = new THREE.IcosahedronGeometry(1.72, 1);
  const wireMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color("#b7c6ff"),
    wireframe: true,
    transparent: true,
    opacity: 0.18,
  });
  const wireMesh = new THREE.Mesh(wireGeometry, wireMaterial);
  scene.add(wireMesh);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
  keyLight.position.set(4, 4, 6);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x88aaff, 0.5);
  fillLight.position.set(-4, -2, -4);
  scene.add(fillLight);

  const ambient = new THREE.AmbientLight(0x9db4ff, 0.55);
  scene.add(ambient);

  // --- sizing -------------------------------------------------------
  function resize() {
    const parent = canvas.parentElement;
    if (!parent) return;
    const { clientWidth: width, clientHeight: height } = parent;
    if (width === 0 || height === 0) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  resize();

  const resizeObserver = new ResizeObserver(resize);
  if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);

  // --- cursor tracking (lerped, so motion stays smooth) --------------
  const target = { x: 0, y: 0 };
  const current = { x: 0, y: 0 };

  function onPointerMove(event: PointerEvent) {
    target.x = (event.clientX / window.innerWidth) * 2 - 1;
    target.y = (event.clientY / window.innerHeight) * 2 - 1;
  }
  window.addEventListener("pointermove", onPointerMove);

  // --- render loop ----------------------------------------------------
  const clock = new THREE.Clock();
  let frameId = 0;
  let running = false;

  function tick() {
    frameId = requestAnimationFrame(tick);
    const delta = clock.getDelta();

    current.x += (target.x - current.x) * 0.05;
    current.y += (target.y - current.y) * 0.05;

    mesh.rotation.y += delta * 0.15 + current.x * 0.01;
    mesh.rotation.x += delta * 0.08 + current.y * 0.01;
    wireMesh.rotation.copy(mesh.rotation);

    camera.position.x = current.x * 0.6;
    camera.position.y = current.y * -0.4;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  function start() {
    if (running) return;
    running = true;
    tick();
  }
  function stop() {
    running = false;
    cancelAnimationFrame(frameId);
  }

  if (prefersReducedMotion) {
    // Still render one static frame so the shape is visible, just not
    // spinning or reacting to the cursor.
    renderer.render(scene, camera);
  } else {
    start();
  }

  function onVisibilityChange() {
    if (prefersReducedMotion) return;
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  }
  document.addEventListener("visibilitychange", onVisibilityChange);

  function dispose() {
    stop();
    window.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    resizeObserver.disconnect();
    geometry.dispose();
    material.dispose();
    wireGeometry.dispose();
    wireMaterial.dispose();
    renderer.dispose();
  }

  return { dispose };
}
