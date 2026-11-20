
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// ============================================
// MYRLORE — DARK FUTURISTIC LUXURY
// Custom animated liquid-metal sculpture
// ============================================

const canvas = document.querySelector("#webgl");
const cursorGlow = document.querySelector("#cursorGlow");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let scene, camera, renderer, sculpture, ribbon, ribbonGeometry;
let particles, particleGeometry, pmrem;
let animationFrame;
let scrollProgress = 0;
let pointerX = 0;
let pointerY = 0;
let targetX = 0;
let targetY = 0;
let ribbonPositions = [];
let ribbonSegments = 220;
let ribbonSides = 28;

const clock = new THREE.Clock();

function makeRibbonGeometry() {
  const positions = [];
  const uvs = [];
  const indices = [];

  for (let i = 0; i <= ribbonSegments; i++) {
    const u = i / ribbonSegments;

    for (let j = 0; j <= ribbonSides; j++) {
      const v = j / ribbonSides;
      positions.push(0, 0, 0);
      uvs.push(u, v);

      if (i < ribbonSegments && j < ribbonSides) {
        const a = i * (ribbonSides + 1) + j;
        const b = a + ribbonSides + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  ribbonPositions = positions;
  updateRibbon(0);
  return geometry;
}

function updateRibbon(time) {
  if (!ribbonGeometry) return;

  const position = ribbonGeometry.attributes.position;
  const temp = new THREE.Vector3();

  for (let i = 0; i <= ribbonSegments; i++) {
    const u = i / ribbonSegments;
    const angle = u * Math.PI * 2.0;

    const center = new THREE.Vector3(
      Math.sin(angle * 1.15 + time * 0.16) * 0.72,
      Math.cos(angle * 0.72 + time * 0.12) * 0.82,
      Math.sin(angle * 1.7 + time * 0.2) * 0.62
    );

    const tangent = new THREE.Vector3(
      0.72 * 1.15 * Math.cos(angle * 1.15 + time * 0.16),
      -0.82 * 0.72 * Math.sin(angle * 0.72 + time * 0.12),
      0.62 * 1.7 * Math.cos(angle * 1.7 + time * 0.2)
    ).normalize();

    const side = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();
    if (side.length() < 0.1) side.set(1, 0, 0);

    const normal = new THREE.Vector3().crossVectors(tangent, side).normalize();
    const width = 0.16 + Math.sin(angle * 2.0 + time * 0.3) * 0.055;

    for (let j = 0; j <= ribbonSides; j++) {
      const v = j / ribbonSides;
      const across = (v - 0.5) * 2;
      const wave = Math.sin(angle * 3.0 + v * 5.0 + time * 0.6) * 0.065;

      temp.copy(center)
        .addScaledVector(side, across * width)
        .addScaledVector(normal, wave + Math.sin(angle * 2.0 + time * 0.3) * 0.08);

      const index = (i * (ribbonSides + 1) + j) * 3;
      position.array[index] = temp.x;
      position.array[index + 1] = temp.y;
      position.array[index + 2] = temp.z;
    }
  }

  position.needsUpdate = true;
  ribbonGeometry.computeVertexNormals();
  ribbonGeometry.computeBoundingSphere();
}

function createParticles() {
  const count = window.innerWidth < 600 ? 220 : 520;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 9;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
  }

  particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xc6bba9,
    size: 0.012,
    transparent: true,
    opacity: 0.48,
    sizeAttenuation: true
  });

  particles = new THREE.Points(particleGeometry, material);
  scene.add(particles);
}

function initThree() {
  if (!canvas) return;

  try {
    scene = new THREE.Scene();
    scene.background = new THREE.Color("#08090b");

    camera = new THREE.PerspectiveCamera(
      36,
      Math.max(canvas.clientWidth, 1) / Math.max(canvas.clientHeight, 1),
      0.1,
      100
    );
    camera.position.set(0, 0, 6.8);

    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });

    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    // Studio reflections for the metallic material
    pmrem = new THREE.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = environment;

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));

    const key = new THREE.DirectionalLight(0xffffff, 4.2);
    key.position.set(3, 5, 5);
    scene.add(key);

    const rim = new THREE.DirectionalLight(0xc6b69a, 5);
    rim.position.set(-4, 1, -3);
    scene.add(rim);

    const lower = new THREE.PointLight(0x9b9da5, 24, 10);
    lower.position.set(1, -3, 3);
    scene.add(lower);

    const warm = new THREE.PointLight(0xc6b69a, 18, 9);
    warm.position.set(-3, 2, 2);
    scene.add(warm);

    sculpture = new THREE.Group();
    scene.add(sculpture);

    const metal = new THREE.MeshPhysicalMaterial({
      color: 0xd9d9d5,
      metalness: 1,
      roughness: 0.13,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      envMapIntensity: 1.8,
      side: THREE.DoubleSide
    });

    const darkMetal = new THREE.MeshPhysicalMaterial({
      color: 0x33363b,
      metalness: 0.95,
      roughness: 0.2,
      clearcoat: 1,
      envMapIntensity: 1.5
    });

    // Main flowing ribbon
    ribbonGeometry = makeRibbonGeometry();
    ribbon = new THREE.Mesh(ribbonGeometry, metal);
    sculpture.add(ribbon);

    // Secondary floating metallic fragments
    const fragmentGroup = new THREE.Group();
    sculpture.add(fragmentGroup);

    for (let i = 0; i < 7; i++) {
      const geometry = new THREE.IcosahedronGeometry(
        0.045 + Math.random() * 0.075,
        1
      );
      const fragment = new THREE.Mesh(
        geometry,
        i % 3 === 0 ? metal : darkMetal
      );

      const angle = (i / 7) * Math.PI * 2;
      fragment.position.set(
        Math.cos(angle) * (1.5 + Math.random() * 0.35),
        Math.sin(angle * 1.4) * 1.3,
        Math.sin(angle) * 0.7
      );
      fragment.rotation.set(Math.random() * 3, Math.random() * 3, 0);
      fragmentGroup.add(fragment);
    }

    createParticles();

    sculpture.position.set(0.5, 0, 0);
    sculpture.scale.setScalar(window.innerWidth < 600 ? 0.78 : 1);

    animate();
  } catch (error) {
    console.error("MYRLORE 3D initialization failed:", error);
    canvas.style.display = "none";
  }
}

function animate() {
  animationFrame = requestAnimationFrame(animate);

  if (!renderer || !scene || !camera) return;

  const time = clock.getElapsedTime();

  if (!reducedMotion) {
    updateRibbon(time);

    targetX += (pointerX - targetX) * 0.035;
    targetY += (pointerY - targetY) * 0.035;

    if (sculpture) {
      sculpture.rotation.y = targetX * 0.45 + Math.sin(time * 0.18) * 0.08;
      sculpture.rotation.x = targetY * 0.3 + Math.cos(time * 0.15) * 0.045;
      sculpture.rotation.z = Math.sin(time * 0.12) * 0.035;
      sculpture.position.y = -scrollProgress * 0.7 + Math.sin(time * 0.35) * 0.08;
    }

    if (particles) particles.rotation.y = time * 0.012;
  }

  renderer.render(scene, camera);
}

// Pointer interaction
window.addEventListener("pointermove", (event) => {
  pointerX = (event.clientX / window.innerWidth) * 2 - 1;
  pointerY = -(event.clientY / window.innerHeight) * 2 + 1;

  if (cursorGlow) {
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
  }
}, { passive: true });

// Scroll progress
window.addEventListener("scroll", () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
}, { passive: true });

// Resize
window.addEventListener("resize", () => {
  if (!camera || !renderer || !canvas) return;

  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (!width || !height) return;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

  if (sculpture) {
    sculpture.scale.setScalar(window.innerWidth < 600 ? 0.78 : 1);
  }
});

// Navigation
const menuToggle = document.querySelector("#menuToggle");
const menuClose = document.querySelector("#menuClose");
const menuPanel = document.querySelector("#menuPanel");

function closeMenu() {
  menuPanel?.classList.remove("open");
}

menuToggle?.addEventListener("click", () => menuPanel?.classList.add("open"));
menuClose?.addEventListener("click", closeMenu);

document.querySelectorAll(".menu-panel a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

// GSAP motion
function initAnimations() {
  const revealElements = document.querySelectorAll(".reveal");

  if (!window.gsap || !window.ScrollTrigger || reducedMotion) {
    revealElements.forEach((element) => {
      element.style.opacity = "1";
      element.style.transform = "none";
    });
    return;
  }

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

  gsap.timeline({ delay: 0.2 })
    .from(".hero-meta", { opacity: 0, y: 15, duration: 0.8 })
    .from(".eyebrow", { opacity: 0, y: 15, duration: 0.65 }, "-=0.4")
    .from(".hero h1", { opacity: 0, y: 55, duration: 1.1, ease: "power4.out" }, "-=0.3")
    .from(".hero-bottom", { opacity: 0, y: 20, duration: 0.8 }, "-=0.6");

  gsap.utils.toArray(".reveal").forEach((element) => {
    gsap.to(element, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start: "top 86%",
        once: true
      }
    });
  });

  gsap.utils.toArray(".service-item").forEach((item, index) => {
    gsap.from(item, {
      opacity: 0,
      x: -25,
      duration: 0.75,
      delay: index * 0.06,
      scrollTrigger: { trigger: item, start: "top 90%", once: true }
    });
  });

  gsap.utils.toArray(".work-card").forEach((card) => {
    gsap.from(card, {
      opacity: 0,
      y: 35,
      duration: 0.9,
      scrollTrigger: { trigger: card, start: "top 88%", once: true }
    });
  });

  // Scale the sculpture as the visitor leaves the hero.
  if (sculpture) {
    gsap.to(sculpture.scale, {
      x: 0.72,
      y: 0.72,
      z: 0.72,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 1
      }
    });
  }
}

// Year
const yearElement = document.querySelector("#year");
if (yearElement) yearElement.textContent = new Date().getFullYear();

// Start independently: a 3D failure should not break the page.
initThree();
initAnimations();

window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});

setTimeout(() => {
  document.body.classList.add("loaded");
}, 4500);
