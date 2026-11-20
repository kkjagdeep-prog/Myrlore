
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";

// ============================================
// MYRLORE®
// CHROME BLOOM — ASYMMETRIC LIQUID ORCHID
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
let animationFrame = null;
let scrollProgress = 0;

let pointerX = 0;
let pointerY = 0;
let targetX = 0;
let targetY = 0;

let isPageVisible = !document.hidden;

const clock = new THREE.Clock();

const clamp = (v, min, max) =>
  Math.max(min, Math.min(max, v));

const lerp = (a, b, t) =>
  a + (b - a) * t;

const smoothstep = (t) =>
  t * t * (3 - 2 * t);


// ============================================
// CHROME MATERIALS
// ============================================

function createMetalMaterial(
  color = 0xf0f3f6,
  roughness = 0.055
) {
  return new THREE.MeshPhysicalMaterial({
    color,
    metalness: 1,
    roughness,
    clearcoat: 1,
    clearcoatRoughness: 0.035,
    envMapIntensity: 3.2,
    side: THREE.DoubleSide
  });
}


// ============================================
// SLENDER SCULPTURAL PETAL GEOMETRY
// ============================================

function createPetalGeometry(
  length = 1.7,
  width = 0.2,
  detail = 48
) {
  const rows = detail;
  const columns = 24;

  const positions = [];
  const uvs = [];
  const indices = [];

  for (let i = 0; i <= rows; i++) {
    const t = i / rows;

    // Narrow base, elegant shoulders, pointed tip
    const base = Math.pow(
      Math.sin(Math.PI * Math.pow(t, 0.88)),
      0.72
    );

    const shoulder =
      0.72 + 0.28 * Math.sin(Math.PI * t);

    const currentWidth = width * base * shoulder;

    for (let j = 0; j <= columns; j++) {
      const across = (j / columns) * 2 - 1;

      const x = across * currentWidth;
      const y = t * length;

      // Long flowing curvature
      const arch =
        Math.sin(Math.PI * t) * 0.16 +
        t * t * 0.11;

      // Concave surface
      const cup =
        -across * across *
        Math.sin(Math.PI * t) * 0.12;

      // Raised central ridge
      const ridge =
        Math.exp(-across * across * 9) *
        Math.sin(Math.PI * t) * 0.045;

      // Slightly irregular organic bend
      const twist =
        Math.sin(t * Math.PI * 1.35) *
        across * 0.025;

      const z = arch + cup + ridge + twist;

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
// INDIVIDUAL PETAL
// ============================================

function createPetal({
  length,
  width,
  x,
  y,
  z,
  closedAngle,
  openAngle,
  tilt,
  material,
  index
}) {
  const group = new THREE.Group();

  const geometry = createPetalGeometry(
    length,
    width,
    48
  );

  const mesh = new THREE.Mesh(
    geometry,
    material
  );

  group.add(mesh);

  group.position.set(x, y, z);

  group.rotation.z = closedAngle;
  group.rotation.x = tilt;

  group.scale.set(1, 0.55, 1);

  group.userData = {
    closedAngle,
    openAngle,
    initialTilt: tilt,
    phase: index * 0.8,
    baseScale: 1,
    length
  };

  sculpture.add(group);
  flowerPetals.push(group);
}


// ============================================
// CURVED METALLIC STEM
// ============================================

function createStem() {
  const points = [
    new THREE.Vector3(0.05, -1.9, -0.12),
    new THREE.Vector3(-0.02, -1.35, -0.06),
    new THREE.Vector3(0.08, -0.8, 0.02),
    new THREE.Vector3(0.02, -0.3, 0.03),
    new THREE.Vector3(0, 0.05, 0.02)
  ];

  const curve = new THREE.CatmullRomCurve3(points);

  const geometry = new THREE.TubeGeometry(
    curve,
    80,
    0.027,
    12,
    false
  );

  const stem = new THREE.Mesh(
    geometry,
    createMetalMaterial(0xb8c2ce, 0.065)
  );

  sculpture.add(stem);

  // A small sculptural transition at the base of the bloom
  const collar = new THREE.Mesh(
    new THREE.SphereGeometry(0.075, 32, 24),
    createMetalMaterial(0xe4e7eb, 0.045)
  );

  collar.position.set(0, 0.015, 0.02);
  collar.scale.set(0.8, 1.25, 0.8);

  sculpture.add(collar);
}


// ============================================
// FLOWER CENTRE
// ============================================

function createFlowerCore() {
  flowerCore = new THREE.Group();

  // An elongated chrome centre, not a round daisy centre
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.105, 40, 32),
    createMetalMaterial(0xf2f3f4, 0.045)
  );

  core.scale.set(0.72, 1.8, 0.68);
  core.position.set(0, 0.13, 0.12);

  flowerCore.add(core);

  // Fine metallic filaments
  const filamentMaterial = createMetalMaterial(
    0xc7b99f,
    0.075
  );

  for (let i = 0; i < 3; i++) {
    const filament = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.008,
        0.014,
        0.22,
        12
      ),
      filamentMaterial
    );

    filament.position.set(
      0.045 + i * 0.035,
      0.27 + i * 0.025,
      0.15
    );

    filament.rotation.z = -0.25 - i * 0.12;

    flowerCore.add(filament);

    const tip = new THREE.Mesh(
      new THREE.SphereGeometry(0.025, 20, 16),
      createMetalMaterial(0xf4f1e9, 0.04)
    );

    tip.position.set(
      filament.position.x - 0.025,
      filament.position.y + 0.11,
      0.15
    );

    flowerCore.add(tip);
  }

  sculpture.add(flowerCore);
}


// ============================================
// ASYMMETRIC CHROME BLOOM
// ============================================

function createSculpture() {
  sculpture = new THREE.Group();
  scene.add(sculpture);

  flowerPetals = [];

  const silver = createMetalMaterial(
    0xf2f4f6,
    0.045
  );

  const platinum = createMetalMaterial(
    0xb9c4d0,
    0.065
  );

  const paleSilver = createMetalMaterial(
    0xdfe3e8,
    0.055
  );

  const champagne = createMetalMaterial(
    0xc9b99d,
    0.085
  );

  // Petal arrangement:
  // Each petal has its own length and opening direction.
  // Negative angles lean towards the right side.

  const petals = [
    {
      length: 1.72,
      width: 0.19,
      x: -0.015,
      y: 0.02,
      z: -0.10,
      closedAngle: -0.12,
      openAngle: -0.68,
      tilt: 0.48,
      material: silver
    },
    {
      length: 1.88,
      width: 0.205,
      x: 0.015,
      y: 0.015,
      z: -0.035,
      closedAngle: 0.08,
      openAngle: -0.42,
      tilt: 0.38,
      material: paleSilver
    },
    {
      length: 1.58,
      width: 0.18,
      x: 0.035,
      y: 0.02,
      z: 0.015,
      closedAngle: 0.20,
      openAngle: -0.18,
      tilt: 0.58,
      material: platinum
    },
    {
      length: 1.45,
      width: 0.17,
      x: -0.025,
      y: 0.025,
      z: -0.13,
      closedAngle: -0.30,
      openAngle: -0.92,
      tilt: 0.34,
      material: silver
    },
    {
      length: 1.65,
      width: 0.18,
      x: 0.045,
      y: 0.015,
      z: 0.08,
      closedAngle: 0.34,
      openAngle: 0.42,
      tilt: 0.72,
      material: paleSilver
    },
    {
      length: 1.30,
      width: 0.16,
      x: 0.015,
      y: 0.02,
      z: -0.18,
      closedAngle: -0.18,
      openAngle: -1.12,
      tilt: 0.42,
      material: platinum
    },
    {
      length: 1.12,
      width: 0.145,
      x: 0.025,
      y: 0.035,
      z: 0.12,
      closedAngle: 0.12,
      openAngle: 0.58,
      tilt: 0.78,
      material: champagne
    }
  ];

  petals.forEach((petal, index) => {
    createPetal({
      ...petal,
      index
    });
  });

  createFlowerCore();
  createStem();

  sculpture.position.set(0.28, 0.05, 0);

  sculpture.scale.setScalar(
    window.innerWidth < 600 ? 0.88 : 1
  );

  // Slight permanent sideways lean
  sculpture.rotation.z = -0.055;
}


// ============================================
// CHROME REFLECTION ENVIRONMENT
// ============================================

function createEnvironment() {
  const pmrem = new THREE.PMREMGenerator(renderer);

  const environmentScene = new RoomEnvironment();

  const environment = pmrem.fromScene(
    environmentScene,
    0.04
  ).texture;

  scene.environment = environment;
  scene.environmentIntensity = 1.3;

  environmentScene.dispose();
  pmrem.dispose();
}


// ============================================
// CINEMATIC LIGHTING
// ============================================

function createLighting() {
  RectAreaLightUniformsLib.init();

  const lights = [
    {
      color: 0xffffff,
      intensity: 16,
      width: 0.65,
      height: 5,
      position: [-3.2, 1.4, 3.5]
    },
    {
      color: 0xf3f6ff,
      intensity: 19,
      width: 0.42,
      height: 4.5,
      position: [3.1, 0.6, 2.8]
    },
    {
      color: 0xdce5f2,
      intensity: 13,
      width: 4.5,
      height: 0.55,
      position: [0, 3.5, 1.5]
    },
    {
      color: 0x9eacc4,
      intensity: 17,
      width: 0.6,
      height: 4,
      position: [-3, 0.2, -3]
    },
    {
      color: 0xc9b99f,
      intensity: 5,
      width: 0.4,
      height: 2.8,
      position: [2, -2, -2]
    }
  ];

  lights.forEach((config) => {
    const light = new THREE.RectAreaLight(
      config.color,
      config.intensity,
      config.width,
      config.height
    );

    light.position.set(...config.position);
    light.lookAt(0, 0, 0);

    scene.add(light);
  });

  const key = new THREE.DirectionalLight(
    0xffffff,
    2.1
  );

  key.position.set(3, 5, 5);
  scene.add(key);

  const rim = new THREE.DirectionalLight(
    0xb8c8df,
    2.5
  );

  rim.position.set(-4, 1, -3);
  scene.add(rim);
}


// ============================================
// PARTICLES
// ============================================

function createParticles() {
  const count = window.innerWidth < 600 ? 75 : 150;

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
    color: 0xc9cbd0,
    size: 0.014,
    transparent: true,
    opacity: 0.28,
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
// ORGANIC OPENING ANIMATION
// ============================================

function updateFlower(time) {
  if (!sculpture) return;

  // Slower, more deliberate unfurling
  const opening = smoothstep(
    clamp(time / 4.2, 0, 1)
  );

  flowerPetals.forEach((petal) => {
    const data = petal.userData;

    const movement =
      Math.sin(time * 0.38 + data.phase) * 0.012;

    petal.rotation.z = lerp(
      data.closedAngle,
      data.openAngle,
      opening
    ) + movement;

    // Petals lift at different rates
    const lift = lerp(
      0.55,
      1,
      opening
    );

    petal.scale.y =
      data.baseScale * lift;

    petal.rotation.x =
      data.initialTilt +
      Math.sin(time * 0.32 + data.phase) * 0.012;
  });

  if (flowerCore) {
    flowerCore.rotation.z =
      Math.sin(time * 0.2) * 0.035;
  }
}


// ============================================
// THREE.JS INITIALIZATION
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
    renderer.toneMappingExposure = 1.3;

    createEnvironment();
    createLighting();
    createSculpture();
    createParticles();

    if (reducedMotion) {
      updateFlower(5);
      renderer.render(scene, camera);
    } else {
      clock.start();
      animate();
    }

    if ("ResizeObserver" in window) {
      const observer = new ResizeObserver(resizeScene);
      observer.observe(canvas);
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
// ANIMATION LOOP
// ============================================

function animate() {
  if (reducedMotion || !isPageVisible) return;

  animationFrame = requestAnimationFrame(animate);

  if (!renderer || !scene || !camera) return;

  const time = clock.getElapsedTime();

  targetX = lerp(targetX, pointerX, 0.035);
  targetY = lerp(targetY, pointerY, 0.035);

  updateFlower(time);

  if (sculpture) {
    sculpture.rotation.y =
      targetX * 0.24 +
      Math.sin(time * 0.15) * 0.025;

    sculpture.rotation.x =
      targetY * 0.16 +
      Math.cos(time * 0.13) * 0.018;

    sculpture.rotation.z =
      -0.055 +
      Math.sin(time * 0.12) * 0.012;

    const baseScale =
      window.innerWidth < 600 ? 0.88 : 1;

    const finalScale =
      window.innerWidth < 600 ? 0.73 : 0.84;

    sculpture.scale.setScalar(
      lerp(baseScale, finalScale, scrollProgress)
    );

    sculpture.position.y =
      0.05 -
      scrollProgress * 0.25 +
      Math.sin(time * 0.3) * 0.025;
  }

  if (particles) {
    particles.rotation.y = time * 0.007;
    particles.rotation.x = Math.sin(time * 0.07) * 0.02;
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
  if (event.key === "Escape") closeMenu();
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
