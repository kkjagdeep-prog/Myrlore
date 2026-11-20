
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// ============================================
// MYRLORE®
// LIQUID METAL — SCULPTURAL INSTALLATION
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
let strands = [];
let particles;
let fragmentGroup;
let resizeObserver;
let environmentTexture;

let scrollProgress = 0;

let pointerX = 0;
let pointerY = 0;
let targetX = 0;
let targetY = 0;

let animationFrame = null;
let isPageVisible = !document.hidden;

const clock = new THREE.Clock();

const clamp = (value, min, max) =>
  Math.max(min, Math.min(max, value));

const lerp = (a, b, amount) =>
  a + (b - a) * amount;


// ============================================
// SCULPTURE PATHS
// Three independent flowing forms
// ============================================

const sculpturePaths = [
  {
    radius: 0.105,
    color: 0xe5e5e0,
    roughness: 0.105,
    points: [
      [-1.75, -0.75, 0.15],
      [-1.65, 0.05, 0.55],
      [-1.05, 0.95, 0.35],
      [-0.25, 1.12, -0.35],
      [0.55, 0.48, -0.75],
      [1.45, 0.85, -0.2],
      [1.65, 0.05, 0.5],
      [1.05, -0.85, 0.45],
      [0.15, -1.12, -0.25],
      [-0.7, -0.5, -0.55],
      [-1.35, -0.15, 0.2]
    ]
  },
  {
    radius: 0.082,
    color: 0xaeb3ba,
    roughness: 0.145,
    points: [
      [-1.65, 0.8, -0.45],
      [-1.1, 1.15, 0.15],
      [-0.35, 0.55, 0.75],
      [0.4, -0.1, 0.55],
      [1.2, -0.55, -0.2],
      [1.55, -1.0, -0.5],
      [0.75, -1.2, 0.1],
      [-0.05, -0.65, 0.7],
      [-0.75, 0.15, 0.45],
      [-1.25, 0.6, -0.25]
    ]
  },
  {
    radius: 0.065,
    color: 0xc6b69a,
    roughness: 0.17,
    points: [
      [-1.25, -1.05, -0.65],
      [-0.75, -0.25, -0.75],
      [-0.15, 0.45, -0.35],
      [0.45, 1.15, 0.15],
      [1.15, 0.9, 0.65],
      [1.55, 0.15, 0.45],
      [0.95, -0.35, -0.35],
      [0.2, -0.85, -0.65],
      [-0.65, -0.95, -0.15],
      [-1.35, -0.35, 0.45]
    ]
  }
];


// ============================================
// METALLIC MATERIALS
// ============================================

function createMetalMaterial(color, roughness) {
  return new THREE.MeshPhysicalMaterial({
    color,
    metalness: 1,
    roughness,
    clearcoat: 1,
    clearcoatRoughness: 0.065,
    envMapIntensity: 2.1,
    side: THREE.DoubleSide
  });
}


// ============================================
// CREATE FLOWING METAL STRANDS
// ============================================

function createSculpture() {
  sculpture = new THREE.Group();
  scene.add(sculpture);

  sculpturePaths.forEach((config, index) => {
    const strandGroup = new THREE.Group();

    const points = config.points.map(
      ([x, y, z]) => new THREE.Vector3(x, y, z)
    );

    const curve = new THREE.CatmullRomCurve3(
      points,
      false,
      "centripetal",
      0.5
    );

    const geometry = new THREE.TubeGeometry(
      curve,
      260,
      config.radius,
      20,
      false
    );

    const material = createMetalMaterial(
      config.color,
      config.roughness
    );

    const tube = new THREE.Mesh(geometry, material);

    tube.castShadow = false;
    tube.receiveShadow = false;

    strandGroup.add(tube);

    // Smooth polished endpoints
    const capGeometry = new THREE.SphereGeometry(
      config.radius,
      20,
      14
    );

    const startCap = new THREE.Mesh(
      capGeometry,
      material
    );

    const endCap = new THREE.Mesh(
      capGeometry,
      material
    );

    startCap.position.copy(points[0]);
    endCap.position.copy(points[points.length - 1]);

    strandGroup.add(startCap, endCap);

    strandGroup.userData.phase = index * 2.1;
    strandGroup.userData.speed = 0.12 + index * 0.035;

    sculpture.add(strandGroup);
    strands.push(strandGroup);
  });

  // Small sculptural accents
  createFragments();

  sculpture.position.set(0.35, 0, 0);

  sculpture.scale.setScalar(
    window.innerWidth < 600 ? 0.78 : 1
  );
}


// ============================================
// METALLIC FRAGMENTS
// ============================================

function createFragments() {
  fragmentGroup = new THREE.Group();
  sculpture.add(fragmentGroup);

  const materials = [
    createMetalMaterial(0xd8d9d6, 0.13),
    createMetalMaterial(0x737780, 0.19),
    createMetalMaterial(0xc6b69a, 0.2)
  ];

  for (let i = 0; i < 12; i++) {
    const size = 0.025 + Math.random() * 0.045;

    const geometry = new THREE.IcosahedronGeometry(
      size,
      1
    );

    const fragment = new THREE.Mesh(
      geometry,
      materials[i % materials.length]
    );

    const angle = (i / 12) * Math.PI * 2;

    fragment.position.set(
      Math.cos(angle) * (1.65 + Math.random() * 0.3),
      Math.sin(angle * 1.7) * 1.25,
      Math.sin(angle * 1.2) * 0.8
    );

    fragment.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    fragment.userData.basePosition =
      fragment.position.clone();

    fragment.userData.phase =
      Math.random() * Math.PI * 2;

    fragmentGroup.add(fragment);
  }
}


// ============================================
// PARTICLE FIELD
// ============================================

function createParticles() {
  const count = window.innerWidth < 600 ? 100 : 220;

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
    opacity: 0.34,
    sizeAttenuation: true,
    depthWrite: false
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);
}


// ============================================
// CINEMATIC LIGHTING
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

  const champagne = new THREE.PointLight(
    0xc6b69a,
    18,
    10
  );

  champagne.position.set(-3, 2, 3);
  scene.add(champagne);

  const cool = new THREE.PointLight(
    0x9da9c0,
    14,
    10
  );

  cool.position.set(3, -3, 2);
  scene.add(cool);
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

    renderer.setSize(width, height);

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 1.5)
    );

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // Environment reflections
    const pmrem = new THREE.PMREMGenerator(renderer);

    const environmentScene = new RoomEnvironment();

    environmentTexture = pmrem.fromScene(
      environmentScene,
      0.04
    ).texture;

    scene.environment = environmentTexture;

    environmentScene.dispose();
    pmrem.dispose();

    createLighting();
    createSculpture();
    createParticles();

    if (reducedMotion) {
      renderer.render(scene, camera);
    } else {
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
// ANIMATION
// ============================================

function animate() {
  if (reducedMotion || !isPageVisible) return;

  animationFrame = requestAnimationFrame(animate);

  if (!renderer || !scene || !camera) return;

  const time = clock.getElapsedTime();

  targetX = lerp(targetX, pointerX, 0.035);
  targetY = lerp(targetY, pointerY, 0.035);

  if (sculpture) {
    // Overall movement
    sculpture.rotation.y =
      targetX * 0.35 +
      Math.sin(time * 0.17) * 0.045;

    sculpture.rotation.x =
      targetY * 0.22 +
      Math.cos(time * 0.14) * 0.035;

    sculpture.rotation.z =
      Math.sin(time * 0.11) * 0.025;

    // Scroll transformation
    const baseScale =
      window.innerWidth < 600 ? 0.78 : 1;

    const finalScale =
      window.innerWidth < 600 ? 0.62 : 0.76;

    const scale = lerp(
      baseScale,
      finalScale,
      scrollProgress
    );

    sculpture.scale.setScalar(scale);

    sculpture.position.y =
      -scrollProgress * 0.35 +
      Math.sin(time * 0.3) * 0.045;
  }

  // Independent strand movement
  strands.forEach((strand) => {
    const phase = strand.userData.phase;
    const speed = strand.userData.speed;

    strand.rotation.y =
      Math.sin(time * speed + phase) * 0.075;

    strand.rotation.x =
      Math.cos(time * speed * 0.8 + phase) * 0.045;

    strand.rotation.z =
      Math.sin(time * speed * 0.6 + phase) * 0.025;
  });

  // Floating fragments
  if (fragmentGroup) {
    fragmentGroup.children.forEach((fragment) => {
      const phase = fragment.userData.phase;
      const base = fragment.userData.basePosition;

      fragment.position.y =
        base.y + Math.sin(time * 0.55 + phase) * 0.045;

      fragment.position.x =
        base.x + Math.cos(time * 0.35 + phase) * 0.025;

      fragment.rotation.y += 0.0015;
      fragment.rotation.x += 0.001;
    });
  }

  if (particles) {
    particles.rotation.y = time * 0.008;
    particles.rotation.x =
      Math.sin(time * 0.07) * 0.025;
  }

  renderer.render(scene, camera);
}


// ============================================
// PAGE VISIBILITY
// ============================================

document.addEventListener("visibilitychange", () => {
  isPageVisible = !document.hidden;

  if (!renderer) return;

  if (isPageVisible && !reducedMotion) {
    clock.start();
    animate();
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

  renderer.setSize(width, height);

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, 1.5)
  );

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
