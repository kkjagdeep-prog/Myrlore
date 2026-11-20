
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// ============================================
// MYRLORE®
// CHROME BLOOM — CUSTOM 3D SCULPTURE
// ============================================

const canvas = document.querySelector("#webgl");
const cursorGlow = document.querySelector("#cursorGlow");

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

let scene;
let camera;
let renderer;
let sculpture;
let flowerCore;
let flowerPetals = [];
let particles;
let resizeObserver;
let animationFrame = null;

let scrollProgress = 0;

let pointerX = 0;
let pointerY = 0;
let targetX = 0;
let targetY = 0;

let isPageVisible = !document.hidden;

const clock = new THREE.Clock();

const clamp = (value, min, max) =>
  Math.max(min, Math.min(max, value));

const lerp = (a, b, amount) =>
  a + (b - a) * amount;

const smoothstep = (value) =>
  value * value * (3 - 2 * value);


// ============================================
// METALLIC MATERIALS
// ============================================

function createMetalMaterial(
  color,
  roughness = 0.14,
  metalness = 1
) {
  return new THREE.MeshPhysicalMaterial({
    color,
    metalness,
    roughness,
    clearcoat: 1,
    clearcoatRoughness: 0.055,
    envMapIntensity: 2.2,
    side: THREE.DoubleSide
  });
}


// ============================================
// CUSTOM CURVED PETAL GEOMETRY
// ============================================

function createPetalGeometry(
  length = 1.5,
  width = 0.43,
  detail = 36
) {
  const rows = detail;
  const columns = 20;

  const positions = [];
  const uvs = [];
  const indices = [];

  for (let i = 0; i <= rows; i++) {
    const t = i / rows;

    // Taper at the base and tip
    const shape =
      Math.pow(Math.sin(Math.PI * t), 0.78) *
      (0.82 + 0.18 * t);

    const currentWidth = width * shape;

    for (let j = 0; j <= columns; j++) {
      const across = (j / columns) * 2 - 1;

      const x = across * currentWidth;

      const y = t * length;

      // Curved, slightly cupped metallic surface
      const arch =
        Math.sin(Math.PI * t) * 0.17 +
        t * t * 0.08;

      const cup =
        -across * across *
        Math.sin(Math.PI * t) * 0.13;

      const z = arch + cup;

      positions.push(x, y, z);
      uvs.push(j / columns, t);

      if (i < rows && j < columns) {
        const a = i * (columns + 1) + j;
        const b = a + columns + 1;

        indices.push(
          a, b, a + 1,
          b, b + 1, a + 1
        );
      }
    }
  }

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );

  geometry.setAttribute(
    "uv",
    new THREE.Float32BufferAttribute(uvs, 2)
  );

  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();

  return geometry;
}


// ============================================
// PETAL LAYERS
// ============================================

function createPetalLayer({
  count,
  length,
  width,
  radius,
  z,
  scale,
  material,
  layer,
  tilt
}) {
  const geometry = createPetalGeometry(
    length,
    width,
    40
  );

  for (let i = 0; i < count; i++) {
    const angle =
      (i / count) * Math.PI * 2 +
      (layer === 1 ? Math.PI / count : 0);

    const group = new THREE.Group();

    const petal = new THREE.Mesh(
      geometry,
      material
    );

    petal.castShadow = false;
    petal.receiveShadow = false;

    group.add(petal);

    // Position the petal around the flower centre
    group.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      z
    );

    // Point the petal outwards
    group.rotation.z = angle - Math.PI / 2;

    // Initial opening angle
    group.rotation.x = tilt;

    group.scale.set(
      scale,
      scale * 0.42,
      scale
    );

    group.userData = {
      angle,
      layer,
      initialTilt: tilt,
      baseScale: scale,
      phase: angle,
      length
    };

    sculpture.add(group);
    flowerPetals.push(group);
  }

  // Shared geometry is intentionally reused within each layer.
}


// ============================================
// FLOWER CENTRE
// ============================================

function createFlowerCore() {
  const coreGroup = new THREE.Group();

  const coreMaterial = createMetalMaterial(
    0xd6c6a9,
    0.12
  );

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 48, 32),
    coreMaterial
  );

  core.scale.set(1, 1, 0.68);
  core.position.z = 0.18;

  coreGroup.add(core);

  // Small polished details around the core
  const beadMaterial = createMetalMaterial(
    0xf0eee8,
    0.095
  );

  const beadGeometry = new THREE.SphereGeometry(
    0.035,
    20,
    16
  );

  for (let i = 0; i < 11; i++) {
    const angle = (i / 11) * Math.PI * 2;

    const bead = new THREE.Mesh(
      beadGeometry,
      beadMaterial
    );

    bead.position.set(
      Math.cos(angle) * 0.19,
      Math.sin(angle) * 0.19,
      0.32
    );

    coreGroup.add(bead);
  }

  // Centre jewel
  const jewel = new THREE.Mesh(
    new THREE.SphereGeometry(0.095, 32, 24),
    createMetalMaterial(0xe8e4dc, 0.075)
  );

  jewel.position.z = 0.37;
  jewel.scale.set(1, 1, 0.7);

  coreGroup.add(jewel);

  sculpture.add(coreGroup);
  flowerCore = coreGroup;
}


// ============================================
// BUILD THE CHROME FLOWER
// ============================================

function createSculpture() {
  sculpture = new THREE.Group();
  scene.add(sculpture);

  flowerPetals = [];

  const silver = createMetalMaterial(
    0xdfe2e5,
    0.105
  );

  const platinum = createMetalMaterial(
    0xaeb7c2,
    0.135
  );

  const champagne = createMetalMaterial(
    0xc6b69a,
    0.16
  );

  const pearl = createMetalMaterial(
    0xf0efea,
    0.11
  );

  // Outer layer: eight broad petals
  createPetalLayer({
    count: 8,
    length: 1.55,
    width: 0.43,
    radius: 0.04,
    z: -0.12,
    scale: 1,
    material: silver,
    layer: 0,
    tilt: 0.7
  });

  // Middle layer: seven overlapping petals
  createPetalLayer({
    count: 7,
    length: 1.12,
    width: 0.37,
    radius: 0.035,
    z: 0.015,
    scale: 0.84,
    material: platinum,
    layer: 1,
    tilt: 0.85
  });

  // Inner layer: five compact petals
  createPetalLayer({
    count: 5,
    length: 0.73,
    width: 0.29,
    radius: 0.025,
    z: 0.12,
    scale: 0.7,
    material: i => i,
    layer: 2,
    tilt: 1.05
  });

  // The inner layer gets its own pearl material
  // Reassign the inner petal materials
  const innerLayer = flowerPetals.filter(
    petal => petal.userData.layer === 2
  );

  innerLayer.forEach(group => {
    group.children[0].material = pearl;
  });

  createFlowerCore();

  sculpture.position.set(0.35, 0, 0);

  sculpture.scale.setScalar(
    window.innerWidth < 600 ? 0.76 : 0.92
  );
}


// ============================================
// LIGHTING
// ============================================

function createLighting() {
  scene.add(
    new THREE.AmbientLight(0xffffff, 0.42)
  );

  const key = new THREE.DirectionalLight(
    0xffffff,
    4.2
  );

  key.position.set(3, 4, 5);
  scene.add(key);

  const silverRim = new THREE.DirectionalLight(
    0xb8c3d4,
    4.5
  );

  silverRim.position.set(-4, 1, -3);
  scene.add(silverRim);

  const top = new THREE.DirectionalLight(
    0xffffff,
    2.6
  );

  top.position.set(0, 5, -2);
  scene.add(top);

  const champagneLight = new THREE.PointLight(
    0xc6b69a,
    18,
    10
  );

  champagneLight.position.set(-3, 2, 3);
  scene.add(champagneLight);

  const coolLight = new THREE.PointLight(
    0x9da9c0,
    14,
    10
  );

  coolLight.position.set(3, -3, 2);
  scene.add(coolLight);
}


// ============================================
// PARTICLE FIELD
// ============================================

function createParticles() {
  const count = window.innerWidth < 600 ? 90 : 190;

  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] =
      (Math.random() - 0.5) * 10;

    positions[i * 3 + 1] =
      (Math.random() - 0.5) * 8;

    positions[i * 3 + 2] =
      (Math.random() - 0.5) * 6;
  }

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  const material = new THREE.PointsMaterial({
    color: 0xc9c4ba,
    size: 0.014,
    transparent: true,
    opacity: 0.3,
    sizeAttenuation: true,
    depthWrite: false
  });

  particles = new THREE.Points(
    geometry,
    material
  );

  scene.add(particles);
}


// ============================================
// FLOWER ANIMATION
// ============================================

function updateFlower(time) {
  if (!sculpture) return;

  // Gradually unfold the flower
  const opening = smoothstep(
    clamp(time / 2.8, 0, 1)
  );

  const breathing =
    1 + Math.sin(time * 0.55) * 0.009;

  flowerPetals.forEach((petal) => {
    const layer = petal.userData.layer;
    const phase = petal.userData.phase;

    const closedTilt =
      layer === 0 ? 0.7 :
      layer === 1 ? 0.85 : 1.05;

    const openTilt =
      layer === 0 ? 0.1 :
      layer === 1 ? 0.2 : 0.3;

    const tilt = lerp(
      closedTilt,
      openTilt,
      opening
    );

    petal.rotation.x =
      tilt +
      Math.sin(time * 0.35 + phase) * 0.018;

    const baseScale = petal.userData.baseScale;

    const openScale = lerp(
      0.42,
      1,
      opening
    );

    petal.scale.y =
      baseScale * openScale * breathing;
  });

  if (flowerCore) {
    flowerCore.rotation.z = time * 0.045;

    flowerCore.scale.setScalar(
      1 + Math.sin(time * 0.8) * 0.008
    );
  }
}


// ============================================
// INITIALIZE THREE.JS
// ============================================

function initThree() {
  if (!canvas) return;

  try {
    const width = Math.max(canvas.clientWidth, 1);
    const height = Math.max(canvas.clientHeight, 1);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
      34,
      width / height,
      0.1,
      100
    );

    camera.position.set(0, 0, 6.4);

    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 1.5)
    );

    renderer.setSize(width, height);

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // Environment reflections
    const pmrem = new THREE.PMREMGenerator(renderer);

    const environmentScene = new RoomEnvironment();

    const environment = pmrem.fromScene(
      environmentScene,
      0.04
    ).texture;

    scene.environment = environment;

    environmentScene.dispose();
    pmrem.dispose();

    createLighting();
    createSculpture();
    createParticles();

    if (reducedMotion) {
      updateFlower(3.5);
      renderer.render(scene, camera);
    } else {
      clock.start();
      animate();
    }

    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(resizeScene);
      resizeObserver.observe(canvas);
    }

  } catch (error) {
    console.error(
      "MYRLORE 3D initialization failed:",
      error
    );

    canvas.style.display = "none";
  }
}


// ============================================
// MAIN ANIMATION LOOP
// ============================================

function animate() {
  if (reducedMotion || !isPageVisible) return;

  animationFrame = requestAnimationFrame(animate);

  if (!renderer || !scene || !camera) return;

  const time = clock.getElapsedTime();

  // Smooth pointer following
  targetX = lerp(targetX, pointerX, 0.035);
  targetY = lerp(targetY, pointerY, 0.035);

  updateFlower(time);

  if (sculpture) {
    sculpture.rotation.y =
      targetX * 0.28 +
      Math.sin(time * 0.16) * 0.035;

    sculpture.rotation.x =
      targetY * 0.2 +
      Math.cos(time * 0.13) * 0.025;

    sculpture.rotation.z =
      Math.sin(time * 0.1) * 0.018;

    const baseScale =
      window.innerWidth < 600 ? 0.76 : 0.92;

    const finalScale =
      window.innerWidth < 600 ? 0.63 : 0.76;

    sculpture.scale.setScalar(
      lerp(baseScale, finalScale, scrollProgress)
    );

    sculpture.position.y =
      -scrollProgress * 0.3 +
      Math.sin(time * 0.32) * 0.035;
  }

  if (particles) {
    particles.rotation.y = time * 0.007;

    particles.rotation.x =
      Math.sin(time * 0.07) * 0.02;
  }

  renderer.render(scene, camera);
}


// ============================================
// PAGE VISIBILITY
// ============================================

document.addEventListener("visibilitychange", () => {
  isPageVisible = !document.hidden;

  if (!renderer || reducedMotion) return;

  if (isPageVisible) {
    clock.start();

    if (animationFrame === null) {
      animate();
    }
  } else if (animationFrame !== null) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
});


// ============================================
// POINTER INTERACTION
// ============================================

window.addEventListener(
  "pointermove",
  (event) => {
    pointerX =
      (event.clientX / window.innerWidth) * 2 - 1;

    pointerY =
      -(event.clientY / window.innerHeight) * 2 + 1;

    if (cursorGlow) {
      cursorGlow.style.left = `${event.clientX}px`;
      cursorGlow.style.top = `${event.clientY}px`;
    }
  },
  { passive: true }
);


// ============================================
// SCROLL INTERACTION
// ============================================

function updateScrollProgress() {
  const hero = document.querySelector(".hero");

  if (!hero) return;

  const rect = hero.getBoundingClientRect();

  scrollProgress = clamp(
    -rect.top / Math.max(hero.offsetHeight, 1),
    0,
    1
  );
}

window.addEventListener(
  "scroll",
  updateScrollProgress,
  { passive: true }
);


// ============================================
// RESIZE
// ============================================

function resizeScene() {
  if (!camera || !renderer || !canvas) return;

  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  if (!width || !height) return;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, 1.5)
  );

  renderer.setSize(width, height);

  if (reducedMotion) {
    renderer.render(scene, camera);
  }
}

window.addEventListener("resize", resizeScene);


// ============================================
// NAVIGATION
// ============================================

const menuToggle = document.querySelector("#menuToggle");
const menuClose = document.querySelector("#menuClose");
const menuPanel = document.querySelector("#menuPanel");

function openMenu() {
  if (!menuPanel) return;

  menuPanel.classList.add("open");
  menuToggle?.setAttribute("aria-expanded", "true");

  document.body.classList.add("menu-open");
}

function closeMenu() {
  if (!menuPanel) return;

  menuPanel.classList.remove("open");
  menuToggle?.setAttribute("aria-expanded", "false");

  document.body.classList.remove("menu-open");
}

menuToggle?.addEventListener("click", openMenu);
menuClose?.addEventListener("click", closeMenu);

document.querySelectorAll(".menu-panel a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});


// ============================================
// GSAP ANIMATIONS
// ============================================

function initAnimations() {
  const revealElements = document.querySelectorAll(".reveal");

  if (
    !window.gsap ||
    !window.ScrollTrigger ||
    reducedMotion
  ) {
    revealElements.forEach((element) => {
      element.style.opacity = "1";
      element.style.transform = "none";
    });

    return;
  }

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  gsap.registerPlugin(ScrollTrigger);

  const heroTimeline = gsap.timeline({
    delay: 0.25
  });

  heroTimeline
    .from(".hero-meta", {
      opacity: 0,
      y: 18,
      duration: 0.8
    })
    .from(".eyebrow", {
      opacity: 0,
      y: 15,
      duration: 0.7
    }, "-=0.45")
    .from(".hero h1", {
      opacity: 0,
      y: 55,
      duration: 1.15,
      ease: "power4.out"
    }, "-=0.35")
    .from(".hero-bottom", {
      opacity: 0,
      y: 20,
      duration: 0.8
    }, "-=0.6");

  gsap.utils.toArray(".reveal").forEach((element) => {
    gsap.fromTo(
      element,
      { opacity: 0, y: 35 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: element,
          start: "top 86%",
          once: true
        }
      }
    );
  });

  gsap.utils.toArray(".service-item").forEach((item, index) => {
    gsap.from(item, {
      opacity: 0,
      x: -25,
      duration: 0.8,
      delay: index * 0.06,
      ease: "power3.out",
      scrollTrigger: {
        trigger: item,
        start: "top 90%",
        once: true
      }
    });
  });

  gsap.utils.toArray(".work-card").forEach((card) => {
    gsap.from(card, {
      opacity: 0,
      y: 35,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: {
        trigger: card,
        start: "top 88%",
        once: true
      }
    });
  });

  gsap.from(".intro-track", {
    opacity: 0.4,
    scrollTrigger: {
      trigger: ".intro-band",
      start: "top 95%",
      end: "bottom 70%",
      scrub: 1
    }
  });
}


// ============================================
// FOOTER YEAR
// ============================================

const yearElement = document.querySelector("#year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}


// ============================================
// PAGE INITIALIZATION
// ============================================

initThree();
initAnimations();
updateScrollProgress();

window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});

setTimeout(() => {
  document.body.classList.add("loaded");
}, 4500);
