
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// ============================================
// MYRLORE®
// DARK FUTURISTIC LUXURY
// IMMERSIVE 3D EXPERIENCE
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
let ribbonGeometry;
let particles;
let particleGeometry;
let fragmentGroup;
let resizeObserver;

let scrollProgress = 0;

let pointerX = 0;
let pointerY = 0;
let targetX = 0;
let targetY = 0;

let ribbonSegments = window.innerWidth < 600 ? 120 : 170;
let ribbonSides = window.innerWidth < 600 ? 16 : 22;

const clock = new THREE.Clock();

const clamp = (value, min, max) =>
  Math.max(min, Math.min(max, value));

const lerp = (a, b, amount) =>
  a + (b - a) * amount;


// ============================================
// ORGANIC RIBBON GEOMETRY
// ============================================

function createRibbonGeometry() {
  const positions = new Float32Array(
    (ribbonSegments + 1) * (ribbonSides + 1) * 3
  );

  const uvs = new Float32Array(
    (ribbonSegments + 1) * (ribbonSides + 1) * 2
  );

  const indices = [];

  for (let i = 0; i <= ribbonSegments; i++) {
    const u = i / ribbonSegments;

    for (let j = 0; j <= ribbonSides; j++) {
      const v = j / ribbonSides;

      const vertex = i * (ribbonSides + 1) + j;

      uvs[vertex * 2] = u;
      uvs[vertex * 2 + 1] = v;

      if (i < ribbonSegments && j < ribbonSides) {
        const a = vertex;
        const b = vertex + ribbonSides + 1;

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
    new THREE.BufferAttribute(positions, 3)
  );

  geometry.setAttribute(
    "uv",
    new THREE.BufferAttribute(uvs, 2)
  );

  geometry.setIndex(indices);

  return geometry;
}


// ============================================
// ANIMATED SCULPTURE SURFACE
// ============================================

function updateRibbon(time) {
  if (!ribbonGeometry) return;

  const position = ribbonGeometry.attributes.position;
  const array = position.array;

  for (let i = 0; i <= ribbonSegments; i++) {
    const u = (i / ribbonSegments) * Math.PI * 2;

    // Organic centerline
    const phase = u + time * 0.11;

    const cx =
      Math.sin(phase) * 1.05 +
      Math.sin(phase * 2) * 0.25;

    const cy =
      Math.cos(phase * 1.0) * 0.95 +
      Math.sin(phase * 3) * 0.16;

    const cz =
      Math.sin(phase * 2 + 0.5) * 0.53 +
      Math.cos(phase * 3) * 0.13;

    // Approximate tangent
    let tx =
      Math.cos(phase) * 1.05 +
      Math.cos(phase * 2) * 0.5;

    let ty =
      -Math.sin(phase) * 0.95 +
      Math.cos(phase * 3) * 0.48;

    let tz =
      Math.cos(phase * 2 + 0.5) * 1.06 -
      Math.sin(phase * 3) * 0.39;

    const tangentLength = Math.sqrt(
      tx * tx + ty * ty + tz * tz
    ) || 1;

    tx /= tangentLength;
    ty /= tangentLength;
    tz /= tangentLength;

    // Stable perpendicular direction
    let sx = ty;
    let sy = -tx;
    let sz = 0;

    let sideLength = Math.sqrt(
      sx * sx + sy * sy + sz * sz
    );

    if (sideLength < 0.001) {
      sx = 1;
      sy = 0;
      sz = 0;
      sideLength = 1;
    }

    sx /= sideLength;
    sy /= sideLength;

    // Surface normal
    const nx = ty * sz - tz * sy;
    const ny = tz * sx - tx * sz;
    const nz = tx * sy - ty * sx;

    const width =
      0.19 +
      Math.sin(u * 2 + time * 0.25) * 0.055 +
      Math.cos(u * 3) * 0.018;

    for (let j = 0; j <= ribbonSides; j++) {
      const v = j / ribbonSides;
      const across = (v - 0.5) * 2;

      const wave =
        Math.sin(u * 3 + v * 5 + time * 0.4) * 0.045 +
        Math.sin(u * 2 - time * 0.3) * 0.065;

      const edgeCurve =
        Math.sin(v * Math.PI) * 0.025;

      const offset = wave + edgeCurve;

      const x =
        cx +
        sx * across * width +
        nx * offset;

      const y =
        cy +
        sy * across * width +
        ny * offset;

      const z =
        cz +
        sz * across * width +
        nz * offset;

      const index =
        (i * (ribbonSides + 1) + j) * 3;

      array[index] = x;
      array[index + 1] = y;
      array[index + 2] = z;
    }
  }

  position.needsUpdate = true;
  ribbonGeometry.computeVertexNormals();
  ribbonGeometry.computeBoundingSphere();
}


// ============================================
// PARTICLES
// ============================================

function createParticles() {
  const count = window.innerWidth < 600 ? 110 : 260;

  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] =
      (Math.random() - 0.5) * 10;

    positions[i * 3 + 1] =
      (Math.random() - 0.5) * 8;

    positions[i * 3 + 2] =
      (Math.random() - 0.5) * 6;
  }

  particleGeometry = new THREE.BufferGeometry();

  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  const material = new THREE.PointsMaterial({
    color: 0xc9c4ba,
    size: 0.014,
    transparent: true,
    opacity: 0.38,
    sizeAttenuation: true,
    depthWrite: false
  });

  particles = new THREE.Points(
    particleGeometry,
    material
  );

  scene.add(particles);
}


// ============================================
// LIGHTING
// ============================================

function createLighting() {
  const ambient = new THREE.AmbientLight(
    0xffffff,
    0.65
  );

  scene.add(ambient);

  const key = new THREE.DirectionalLight(
    0xffffff,
    4.5
  );

  key.position.set(3, 4, 5);
  scene.add(key);

  const rim = new THREE.DirectionalLight(
    0xc6b69a,
    4.2
  );

  rim.position.set(-4, 1, -3);
  scene.add(rim);

  const top = new THREE.DirectionalLight(
    0xffffff,
    2.4
  );

  top.position.set(0, 5, -2);
  scene.add(top);

  const warm = new THREE.PointLight(
    0xc6b69a,
    22,
    9
  );

  warm.position.set(-3, 2, 2);
  scene.add(warm);

  const cool = new THREE.PointLight(
    0x9da9c0,
    16,
    10
  );

  cool.position.set(2, -3, 3);
  scene.add(cool);
}


// ============================================
// METALLIC FRAGMENTS
// ============================================

function createFragments() {
  fragmentGroup = new THREE.Group();
  sculpture.add(fragmentGroup);

  const silver = new THREE.MeshPhysicalMaterial({
    color: 0xe0e0dc,
    metalness: 1,
    roughness: 0.17,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.7
  });

  const graphite = new THREE.MeshPhysicalMaterial({
    color: 0x55565b,
    metalness: 1,
    roughness: 0.22,
    clearcoat: 1,
    envMapIntensity: 1.5
  });

  for (let i = 0; i < 8; i++) {
    const size = 0.035 + Math.random() * 0.065;

    const geometry = new THREE.IcosahedronGeometry(
      size,
      1
    );

    const fragment = new THREE.Mesh(
      geometry,
      i % 3 === 0 ? graphite : silver
    );

    const angle = (i / 8) * Math.PI * 2;

    fragment.position.set(
      Math.cos(angle) * (1.35 + Math.random() * 0.4),
      Math.sin(angle * 1.4) * 1.15,
      Math.sin(angle) * 0.65
    );

    fragment.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    fragment.userData.baseY = fragment.position.y;
    fragment.userData.phase = Math.random() * Math.PI * 2;

    fragmentGroup.add(fragment);
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

    renderer.setSize(width, height);

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 1.5)
    );

    renderer.outputColorSpace = THREE.SRGBColorSpace;

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;

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

    // Lighting
    createLighting();

    // Main sculpture
    sculpture = new THREE.Group();
    scene.add(sculpture);

    const metal = new THREE.MeshPhysicalMaterial({
      color: 0xd9d9d5,
      metalness: 1,
      roughness: 0.115,
      clearcoat: 1,
      clearcoatRoughness: 0.07,
      envMapIntensity: 2.0,
      side: THREE.DoubleSide
    });

    // Ribbon
    ribbonGeometry = createRibbonGeometry();

    updateRibbon(0);

    const ribbon = new THREE.Mesh(
      ribbonGeometry,
      metal
    );

    sculpture.add(ribbon);

    // Additional fragments
    createFragments();

    // Ambient particles
    createParticles();

    sculpture.position.set(0.35, 0, 0);

    sculpture.scale.setScalar(
      window.innerWidth < 600 ? 0.78 : 1
    );

    // Static first frame for reduced-motion users
    if (reducedMotion) {
      renderer.render(scene, camera);
    } else {
      animate();
    }

    // Observe canvas dimensions
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
// ANIMATION LOOP
// ============================================

function animate() {
  requestAnimationFrame(animate);

  if (!renderer || !scene || !camera) return;

  const time = clock.getElapsedTime();

  if (!reducedMotion) {
    updateRibbon(time);

    // Smooth pointer interpolation
    targetX = lerp(targetX, pointerX, 0.035);
    targetY = lerp(targetY, pointerY, 0.035);

    if (sculpture) {
      sculpture.rotation.y =
        targetX * 0.42 +
        Math.sin(time * 0.18) * 0.065;

      sculpture.rotation.x =
        targetY * 0.28 +
        Math.cos(time * 0.15) * 0.04;

      sculpture.rotation.z =
        Math.sin(time * 0.12) * 0.025;

      // Scroll-reactive position and scale
      const scale = lerp(
        window.innerWidth < 600 ? 0.78 : 1,
        window.innerWidth < 600 ? 0.62 : 0.76,
        scrollProgress
      );

      sculpture.scale.setScalar(scale);

      sculpture.position.y =
        -scrollProgress * 0.35 +
        Math.sin(time * 0.35) * 0.065;
    }

    // Floating metallic details
    if (fragmentGroup) {
      fragmentGroup.children.forEach((fragment) => {
        fragment.position.y =
          fragment.userData.baseY +
          Math.sin(
            time * 0.6 + fragment.userData.phase
          ) * 0.035;

        fragment.rotation.y += 0.002;
        fragment.rotation.x += 0.001;
      });
    }

    if (particles) {
      particles.rotation.y = time * 0.009;
      particles.rotation.x = Math.sin(time * 0.08) * 0.025;
    }
  }

  renderer.render(scene, camera);
}


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

  if (sculpture) {
    const scale = window.innerWidth < 600 ? 0.78 : 1;
    sculpture.scale.setScalar(scale);
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

  // Hero entrance
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

  // Section reveals
  gsap.utils.toArray(".reveal").forEach((element) => {
    gsap.fromTo(
      element,
      {
        opacity: 0,
        y: 35
      },
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

  // Services
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

  // Project cards
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

  // Marquee entrance
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
// INITIALIZE
// ============================================

initThree();
initAnimations();
updateScrollProgress();

// Ensure the page loader never blocks the website
window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});

setTimeout(() => {
  document.body.classList.add("loaded");
}, 4500);
