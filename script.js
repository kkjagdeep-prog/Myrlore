
import * as THREE from "three";

// ==========================================
// MYRLORE — INTERACTIVE 3D EXPERIENCE
// ==========================================

const canvas = document.querySelector("#webgl");
const cursorGlow = document.querySelector("#cursorGlow");

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

let scene, camera, renderer;
let sculpture, core, rings = [], particles;
let animationFrame;
let scrollProgress = 0;
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

const clock = new THREE.Clock();

// ==========================================
// THREE.JS SCENE
// ==========================================

function initThree() {
  if (!canvas) return;

  try {
    scene = new THREE.Scene();
    scene.background = new THREE.Color("#10100f");

    camera = new THREE.PerspectiveCamera(
      38,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 8);

    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });

    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3);
    keyLight.position.set(4, 5, 6);
    scene.add(keyLight);

    const limeLight = new THREE.PointLight(0xc5f36b, 35, 12);
    limeLight.position.set(-3, -2, 3);
    scene.add(limeLight);

    const rimLight = new THREE.PointLight(0xffffff, 20, 15);
    rimLight.position.set(2, 3, -4);
    scene.add(rimLight);

    // Main sculpture group
    sculpture = new THREE.Group();
    scene.add(sculpture);

    // Materials
    const chrome = new THREE.MeshPhysicalMaterial({
      color: 0xd9d9d1,
      metalness: 0.88,
      roughness: 0.19,
      clearcoat: 1,
      clearcoatRoughness: 0.12
    });

    const darkMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x262821,
      metalness: 0.55,
      roughness: 0.24,
      clearcoat: 1
    });

    const limeMaterial = new THREE.MeshStandardMaterial({
      color: 0xc5f36b,
      metalness: 0.45,
      roughness: 0.2,
      emissive: 0x354b0d,
      emissiveIntensity: 0.3
    });

    // Central sculptural form
    core = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.95, 0.27, 180, 24, 2, 5),
      chrome
    );
    sculpture.add(core);

    // Secondary forms
    const ringSettings = [
      { radius: 1.45, tube: 0.045, color: 0xc5f36b },
      { radius: 1.8, tube: 0.025, color: 0xe6e3d7 },
      { radius: 1.15, tube: 0.035, color: 0xffffff }
    ];

    ringSettings.forEach((setting, index) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(setting.radius, setting.tube, 12, 180),
        index === 0 ? limeMaterial : chrome
      );

      ring.rotation.x = index * 0.9 + 0.45;
      ring.rotation.y = index * 0.75;
      ring.rotation.z = index * 0.6;
      sculpture.add(ring);
      rings.push(ring);
    });

    // Floating metallic spheres
    const sphereMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xe8e8dd,
      metalness: 0.75,
      roughness: 0.12,
      clearcoat: 1
    });

    for (let i = 0; i < 5; i++) {
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(i === 0 ? 0.13 : 0.075, 32, 32),
        i === 0 ? limeMaterial : sphereMaterial
      );

      const angle = (i / 5) * Math.PI * 2;
      sphere.position.set(
        Math.cos(angle) * 2.1,
        Math.sin(angle * 1.5) * 1.65,
        Math.sin(angle) * 0.8
      );

      sculpture.add(sphere);
    }

    // Small central dark sphere
    const centerSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.34, 48, 48),
      darkMaterial
    );
    centerSphere.position.set(0, 0, 0.95);
    sculpture.add(centerSphere);

    // Background particle field
    createParticles();

    // Initial placement
    sculpture.position.set(0.2, 0, 0);
    sculpture.scale.setScalar(window.innerWidth < 600 ? 0.75 : 1);

    animate();
  } catch (error) {
    console.error("MYRLORE 3D could not initialize:", error);
    canvas.style.display = "none";
  }
}

// ==========================================
// PARTICLES
// ==========================================

function createParticles() {
  const count = window.innerWidth < 600 ? 180 : 450;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 9;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 7 - 2;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  const material = new THREE.PointsMaterial({
    color: 0xc5c5b8,
    size: 0.012,
    transparent: true,
    opacity: 0.55,
    sizeAttenuation: true
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);
}

// ==========================================
// ANIMATION LOOP
// ==========================================

function animate() {
  animationFrame = requestAnimationFrame(animate);

  if (!renderer || !scene || !camera) return;

  const elapsed = clock.getElapsedTime();

  if (!reducedMotion && sculpture) {
    // Idle sculpture movement
    sculpture.rotation.y += (targetX * 0.25 - sculpture.rotation.y) * 0.025;
    sculpture.rotation.x += (targetY * 0.2 - sculpture.rotation.x) * 0.025;

    sculpture.rotation.z = Math.sin(elapsed * 0.22) * 0.06;

    // Individual ring movement
    rings.forEach((ring, index) => {
      ring.rotation.x += 0.0015 * (index + 1);
      ring.rotation.y += 0.001 * (index + 1);
    });

    if (core) {
      core.rotation.x = Math.sin(elapsed * 0.35) * 0.08;
    }

    if (particles) {
      particles.rotation.y = elapsed * 0.008;
    }
  }

  // Scroll subtly shifts the 3D sculpture
  if (sculpture) {
    sculpture.position.y = -scrollProgress * 1.2;
    sculpture.rotation.z += 0;
  }

  renderer.render(scene, camera);
}

// ==========================================
// MOUSE INTERACTION
// ==========================================

window.addEventListener("pointermove", (event) => {
  const x = event.clientX;
  const y = event.clientY;

  mouseX = (x / window.innerWidth) * 2 - 1;
  mouseY = -(y / window.innerHeight) * 2 + 1;

  targetX = mouseX * 0.3;
  targetY = mouseY * 0.25;

  if (cursorGlow) {
    cursorGlow.style.left = `${x}px`;
    cursorGlow.style.top = `${y}px`;
  }
});

// ==========================================
// SCROLL INTERACTION
// ==========================================

window.addEventListener("scroll", () => {
  const maxScroll =
    document.documentElement.scrollHeight - window.innerHeight;

  scrollProgress = maxScroll > 0
    ? window.scrollY / maxScroll
    : 0;
}, { passive: true });

// ==========================================
// RESIZE
// ==========================================

window.addEventListener("resize", () => {
  if (!camera || !renderer || !canvas) return;

  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  if (!width || !height) return;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));

  if (sculpture) {
    sculpture.scale.setScalar(window.innerWidth < 600 ? 0.75 : 1);
  }
});

// ==========================================
// NAVIGATION
// ==========================================

const menuToggle = document.querySelector("#menuToggle");
const menuClose = document.querySelector("#menuClose");
const menuPanel = document.querySelector("#menuPanel");

function closeMenu() {
  if (menuPanel) menuPanel.classList.remove("open");
}

if (menuToggle && menuPanel) {
  menuToggle.addEventListener("click", () => {
    menuPanel.classList.add("open");
  });
}

if (menuClose) {
  menuClose.addEventListener("click", closeMenu);
}

document.querySelectorAll(".menu-panel a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

// ==========================================
// GSAP ANIMATIONS
// ==========================================

function initAnimations() {
  if (!window.gsap || !window.ScrollTrigger || reducedMotion) {
    document.querySelectorAll(".reveal").forEach((element) => {
      element.style.opacity = "1";
      element.style.transform = "none";
    });
    return;
  }

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  gsap.registerPlugin(ScrollTrigger);

  // Hero entrance
  const heroTimeline = gsap.timeline({ delay: 0.25 });

  heroTimeline
    .from(".hero-meta", {
      opacity: 0,
      y: 15,
      duration: 0.8
    })
    .from(".eyebrow", {
      opacity: 0,
      y: 15,
      duration: 0.6
    }, "-=0.35")
    .from(".hero h1", {
      opacity: 0,
      y: 65,
      duration: 1.1,
      ease: "power4.out"
    }, "-=0.25")
    .from(".hero-bottom", {
      opacity: 0,
      y: 20,
      duration: 0.8
    }, "-=0.55");

  // Reveal sections on scroll
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

  // Service rows
  gsap.utils.toArray(".service-item").forEach((item, index) => {
    gsap.from(item, {
      opacity: 0,
      x: -30,
      duration: 0.7,
      delay: index * 0.08,
      scrollTrigger: {
        trigger: item,
        start: "top 90%",
        once: true
      }
    });
  });

  // Work cards
  gsap.utils.toArray(".work-card").forEach((card) => {
    gsap.from(card, {
      opacity: 0,
      y: 45,
      duration: 0.9,
      scrollTrigger: {
        trigger: card,
        start: "top 88%",
        once: true
      }
    });
  });

  // 3D sculpture changes scale and position during scroll
  if (sculpture) {
    gsap.to(sculpture.scale, {
      x: 0.65,
      y: 0.65,
      z: 0.65,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 1
      }
    });
  }

  // Subtle background parallax
  gsap.to(".hero-visual", {
    yPercent: 12,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true
    }
  });
}

// ==========================================
// YEAR
// ==========================================

const yearElement = document.querySelector("#year");
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

// ==========================================
// START
// ==========================================

initThree();
initAnimations();

// Backup loader removal
window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});

setTimeout(() => {
  document.body.classList.add("loaded");
}, 4500);
