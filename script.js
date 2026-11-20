
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";
import { RoomEnvironment } from "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/environments/RoomEnvironment.js";

/* =========================================
   MYRLORE — CREATIVE STUDIO
   COMPLETE MAIN JAVASCRIPT
========================================= */

const CONFIG = {
  particleCount: window.innerWidth < 768 ? 350 : 900,
  pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
  reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

let scene = null;
let camera = null;
let renderer = null;
let mainGroup = null;
let sculpture = null;
let particleSystem = null;
let animationFrame = null;

let pointerX = 0;
let pointerY = 0;
let scrollProgress = 0;

const canvas = $("#webgl");
const fallback = $("#webglFallback");
const pageLoader = $("#pageLoader");

const menuToggle = $("#menuToggle");
const menuPanel = $("#menuPanel");
const menuClose = $("#menuClose");

const yearElement = $("#year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

/* =========================================
   1. FAILSAFE LOADER
========================================= */

let loaderHidden = false;

function hideLoader() {
  if (loaderHidden) return;

  loaderHidden = true;

  const loader = $("#pageLoader");

  if (!loader) return;

  loader.style.transition = "opacity 0.7s ease, visibility 0.7s ease";
  loader.style.opacity = "0";
  loader.style.visibility = "hidden";
  loader.style.pointerEvents = "none";

  setTimeout(() => {
    loader.style.display = "none";
  }, 750);
}

// Normal loader removal
window.addEventListener("load", () => {
  setTimeout(hideLoader, 500);
});

// Emergency removal if a module or resource fails
setTimeout(hideLoader, 5000);

// Remove loader if the document is already loaded
if (document.readyState === "complete") {
  setTimeout(hideLoader, 500);
}

/* =========================================
   2. GLOBAL ERROR HANDLING
========================================= */

window.addEventListener("error", (event) => {
  console.error("MYRLORE error:", event.message);

  // Keep the page usable if a visual script fails
  if (pageLoader) hideLoader();
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("MYRLORE promise error:", event.reason);
});

/* =========================================
   3. MOBILE NAVIGATION
========================================= */

function openMenu() {
  if (!menuPanel) return;

  menuPanel.classList.add("is-open");
  menuPanel.setAttribute("aria-hidden", "false");

  if (menuToggle) {
    menuToggle.setAttribute("aria-expanded", "true");
  }

  document.body.classList.add("menu-open");

  if (window.gsap && !CONFIG.reducedMotion) {
    gsap.fromTo(
      ".menu-links a",
      { y: 35, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.09,
        ease: "power3.out",
        delay: 0.2
      }
    );
  }
}

function closeMenu() {
  if (!menuPanel) return;

  menuPanel.classList.remove("is-open");
  menuPanel.setAttribute("aria-hidden", "true");

  if (menuToggle) {
    menuToggle.setAttribute("aria-expanded", "false");
  }

  document.body.classList.remove("menu-open");
}

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    if (menuPanel?.classList.contains("is-open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });
}

if (menuClose) {
  menuClose.addEventListener("click", closeMenu);
}

$$(".menu-links a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

/* =========================================
   4. SMOOTH ANCHOR SCROLLING
========================================= */

$$('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");

    if (!targetId || targetId === "#") return;

    const target = document.querySelector(targetId);

    if (!target) return;

    event.preventDefault();

    target.scrollIntoView({
      behavior: CONFIG.reducedMotion ? "auto" : "smooth",
      block: "start"
    });
  });
});

/* =========================================
   5. THREE.JS INITIALISATION
========================================= */

function initThree() {
  if (!canvas) {
    console.warn("MYRLORE: #webgl canvas not found.");
    showFallback();
    return;
  }

  try {
    scene = new THREE.Scene();
    scene.background = new THREE.Color("#101010");

    camera = new THREE.PerspectiveCamera(
      35,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );

    camera.position.set(0, 0, 9);

    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: window.innerWidth > 768,
      alpha: true,
      powerPreference: "high-performance"
    });

    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.setPixelRatio(CONFIG.pixelRatio);

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    // Environment reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const environment = new RoomEnvironment();

    const environmentTexture =
      pmremGenerator.fromScene(environment).texture;

    scene.environment = environmentTexture;

    environment.dispose?.();
    pmremGenerator.dispose();

    // Ambient lighting
    scene.add(
      new THREE.AmbientLight(0xffffff, 0.8)
    );

    // Main light
    const keyLight = new THREE.PointLight(
      0xffffff,
      90,
      30
    );

    keyLight.position.set(4, 5, 6);
    scene.add(keyLight);

    // Warm side lighting
    const sideLight = new THREE.PointLight(
      0xc5a77d,
      65,
      25
    );

    sideLight.position.set(-5, -2, 4);
    scene.add(sideLight);

    // Rear lighting
    const rimLight = new THREE.PointLight(
      0x9ca9c2,
      50,
      25
    );

    rimLight.position.set(1, 4, -5);
    scene.add(rimLight);

    // Main 3D group
    mainGroup = new THREE.Group();
    scene.add(mainGroup);

    createSculpture();
    createParticles();

    window.addEventListener("resize", resizeThree);

    window.addEventListener("mousemove", (event) => {
      pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
      pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
    });

    animateThree();

    console.log("MYRLORE: Three.js scene initialised.");

  } catch (error) {
    console.error("MYRLORE Three.js initialisation failed:", error);
    showFallback();
  }
}

/* =========================================
   6. MAIN 3D SCULPTURE
========================================= */

function createSculpture() {
  sculpture = new THREE.Group();
  mainGroup.add(sculpture);

  // Chrome torus knot
  const knot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(
      1.05,
      0.27,
      220,
      32,
      2,
      5
    ),
    new THREE.MeshPhysicalMaterial({
      color: 0xc5c5c5,
      metalness: 1,
      roughness: 0.13,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      envMapIntensity: 1.8
    })
  );

  sculpture.add(knot);

  // Outer gold ring
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(
      1.85,
      0.025,
      16,
      180
    ),
    new THREE.MeshStandardMaterial({
      color: 0xc4aa83,
      metalness: 1,
      roughness: 0.25
    })
  );

  ring.rotation.x = Math.PI / 2.5;
  ring.rotation.y = Math.PI / 5;

  sculpture.add(ring);

  // Secondary orbit
  const secondRing = new THREE.Mesh(
    new THREE.TorusGeometry(
      2.1,
      0.012,
      12,
      160
    ),
    new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 1,
      roughness: 0.35
    })
  );

  secondRing.rotation.x = Math.PI / 3;
  secondRing.rotation.y = -Math.PI / 4;

  sculpture.add(secondRing);

  // Floating metallic spheres
  const sphereGeometry = new THREE.SphereGeometry(
    0.16,
    32,
    32
  );

  const sphereMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xd7c6a8,
    metalness: 0.9,
    roughness: 0.15,
    clearcoat: 1
  });

  const spherePositions = [
    [2.2, 0.8, 0.1],
    [-2.1, -0.7, 0.3],
    [0.2, 2.1, -0.2],
    [-0.4, -2.0, 0.5]
  ];

  spherePositions.forEach((position) => {
    const sphere = new THREE.Mesh(
      sphereGeometry,
      sphereMaterial
    );

    sphere.position.set(...position);
    sculpture.add(sphere);
  });

  // Glass central sphere
  const glassSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.52, 64, 64),
    new THREE.MeshPhysicalMaterial({
      color: 0xeeeeee,
      metalness: 0.05,
      roughness: 0.05,
      transmission: 0.92,
      thickness: 1.2,
      ior: 1.45,
      transparent: true,
      opacity: 1,
      envMapIntensity: 1.5
    })
  );

  glassSphere.position.set(0, 0, 0.15);
  sculpture.add(glassSphere);

  // Small orbiting ring
  const smallTorus = new THREE.Mesh(
    new THREE.TorusGeometry(0.4, 0.055, 20, 80),
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 1,
      roughness: 0.12
    })
  );

  smallTorus.position.set(1.4, -1.35, 0.2);
  smallTorus.rotation.x = Math.PI / 2;

  sculpture.add(smallTorus);
}

/* =========================================
   7. PARTICLE FIELD
========================================= */

function createParticles() {
  const positions = new Float32Array(
    CONFIG.particleCount * 3
  );

  for (let i = 0; i < CONFIG.particleCount; i++) {
    const i3 = i * 3;

    positions[i3] = (Math.random() - 0.5) * 12;
    positions[i3 + 1] = (Math.random() - 0.5) * 10;
    positions[i3 + 2] = (Math.random() - 0.5) * 8;
  }

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  const material = new THREE.PointsMaterial({
    color: 0xc5b69e,
    size: 0.012,
    transparent: true,
    opacity: 0.65,
    sizeAttenuation: true
  });

  particleSystem = new THREE.Points(
    geometry,
    material
  );

  scene.add(particleSystem);
}

/* =========================================
   8. RESIZE
========================================= */

function resizeThree() {
  if (!camera || !renderer) return;

  camera.aspect = window.innerWidth / window.innerHeight;

  camera.position.z =
    window.innerWidth < 768 ? 10 : 9;

  camera.updateProjectionMatrix();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, 2)
  );
}

/* =========================================
   9. SCROLL PROGRESS
========================================= */

function updateScrollProgress() {
  const maxScroll =
    document.documentElement.scrollHeight - window.innerHeight;

  scrollProgress = maxScroll > 0
    ? window.scrollY / maxScroll
    : 0;
}

window.addEventListener(
  "scroll",
  updateScrollProgress,
  { passive: true }
);

/* =========================================
   10. ANIMATION LOOP
========================================= */

const clock = new THREE.Clock();

function animateThree() {
  animationFrame = requestAnimationFrame(animateThree);

  if (!renderer || !scene || !camera) return;

  const elapsed = clock.getElapsedTime();

  if (mainGroup && sculpture) {
    // Subtle idle rotation
    mainGroup.rotation.y =
      Math.sin(elapsed * 0.18) * 0.12;

    mainGroup.rotation.z =
      Math.sin(elapsed * 0.13) * 0.04;

    // Cursor movement
    const targetX = pointerY * 0.12;
    const targetY = pointerX * 0.17;

    sculpture.rotation.x +=
      (targetX - sculpture.rotation.x) * 0.025;

    sculpture.rotation.y +=
      (targetY - sculpture.rotation.y) * 0.025;

    // Scroll movement
    const targetPositionY = scrollProgress * 0.8;

    mainGroup.position.y +=
      (targetPositionY - mainGroup.position.y) * 0.025;

    // Responsive scale
    const targetScale =
      window.innerWidth < 768 ? 0.72 : 1;

    mainGroup.scale.setScalar(targetScale);
  }

  if (particleSystem) {
    particleSystem.rotation.y = elapsed * 0.008;

    particleSystem.rotation.x =
      Math.sin(elapsed * 0.1) * 0.025;
  }

  renderer.render(scene, camera);
}

/* =========================================
   11. WEBGL FALLBACK
========================================= */

function showFallback() {
  if (canvas) {
    canvas.style.display = "none";
  }

  if (fallback) {
    fallback.style.display = "block";
  }
}

/* =========================================
   12. GSAP ANIMATIONS
========================================= */

function initGSAP() {
  if (!window.gsap || CONFIG.reducedMotion) {
    $$(".reveal").forEach((element) => {
      element.style.opacity = "1";
      element.style.transform = "none";
    });

    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Hero entrance
  const heroTimeline = gsap.timeline({
    defaults: {
      ease: "power4.out"
    }
  });

  if ($(".hero-top")) {
    heroTimeline.from(".hero-top", {
      y: 25,
      opacity: 0,
      duration: 1
    });
  }

  if ($(".hero-title .hero-line").length) {
    heroTimeline.from(
      ".hero-title .hero-line",
      {
        yPercent: 110,
        opacity: 0,
        duration: 1.2,
        stagger: 0.12
      },
      "-=0.55"
    );
  }

  if ($(".hero-copy .eyebrow")) {
    heroTimeline.from(
      ".hero-copy .eyebrow",
      {
        y: 20,
        opacity: 0,
        duration: 0.8
      },
      "-=0.65"
    );
  }

  if ($(".hero-bottom")) {
    heroTimeline.from(
      ".hero-bottom",
      {
        y: 25,
        opacity: 0,
        duration: 0.8
      },
      "-=0.5"
    );
  }

  // General reveal animations
  $$(".reveal").forEach((element) => {
    gsap.fromTo(
      element,
      {
        y: 45,
        opacity: 0
      },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: element,
          start: "top 88%",
          toggleActions: "play none none reverse"
        }
      }
    );
  });

  // Studio heading
  if ($(".studio-heading")) {
    gsap.from(".studio-heading", {
      y: 70,
      opacity: 0,
      duration: 1.2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: "#studio",
        start: "top 75%"
      }
    });
  }

  // Expertise list
  $$(".expertise-item").forEach((item, index) => {
    gsap.from(item, {
      x: 55,
      opacity: 0,
      duration: 0.8,
      delay: index * 0.08,
      ease: "power3.out",
      scrollTrigger: {
        trigger: item,
        start: "top 90%"
      }
    });
  });

  // Work cards
  $$(".work-card").forEach((card, index) => {
    gsap.from(card, {
      y: 65,
      opacity: 0,
      duration: 1,
      delay: index * 0.12,
      ease: "power3.out",
      scrollTrigger: {
        trigger: card,
        start: "top 88%"
      }
    });
  });

  // Manifesto
  if ($(".manifesto-text")) {
    gsap.from(".manifesto-text", {
      y: 80,
      opacity: 0,
      duration: 1.2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".manifesto",
        start: "top 75%"
      }
    });
  }

  // Process steps
  $$(".process-step").forEach((step, index) => {
    gsap.from(step, {
      y: 45,
      opacity: 0,
      duration: 0.9,
      delay: index * 0.1,
      scrollTrigger: {
        trigger: step,
        start: "top 88%"
      }
    });
  });

  // Contact
  if ($(".contact-heading")) {
    gsap.from(".contact-heading", {
      y: 70,
      opacity: 0,
      duration: 1.1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: "#contact",
        start: "top 75%"
      }
    });
  }

  // Intro strip
  if ($(".intro-strip-track") && $(".intro-strip")) {
    gsap.to(".intro-strip-track", {
      xPercent: -20,
      ease: "none",
      scrollTrigger: {
        trigger: ".intro-strip",
        start: "top bottom",
        end: "bottom top",
        scrub: 1
      }
    });
  }

  // 3D sculpture scroll movement
  if (mainGroup) {
    gsap.to(mainGroup.rotation, {
      x: Math.PI * 0.16,
      y: Math.PI * 0.55,
      scrollTrigger: {
        trigger: "main",
        start: "top top",
        end: "bottom bottom",
        scrub: 2
      }
    });
  }

  ScrollTrigger.refresh();
}

/* =========================================
   13. HOVER INTERACTIONS
========================================= */

function initHoverEffects() {
  if (window.matchMedia("(hover: none)").matches) {
    return;
  }

  $$(".work-card").forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.classList.add("is-hovered");
    });

    card.addEventListener("mouseleave", () => {
      card.classList.remove("is-hovered");
    });
  });

  $$(".expertise-item").forEach((item) => {
    item.addEventListener("mouseenter", () => {
      item.classList.add("is-hovered");
    });

    item.addEventListener("mouseleave", () => {
      item.classList.remove("is-hovered");
    });
  });
}

/* =========================================
   14. NAVBAR SCROLL STATE
========================================= */

function initNavbar() {
  const header = $(".site-header");

  if (!header) return;

  function updateHeader() {
    header.classList.toggle(
      "is-scrolled",
      window.scrollY > 60
    );
  }

  window.addEventListener(
    "scroll",
    updateHeader,
    { passive: true }
  );

  updateHeader();
}

/* =========================================
   15. INITIALISE
========================================= */

function init() {
  try {
    initThree();
  } catch (error) {
    console.error("3D initialisation error:", error);
    showFallback();
  }

  try {
    initGSAP();
  } catch (error) {
    console.error("GSAP initialisation error:", error);
  }

  initHoverEffects();
  initNavbar();
  updateScrollProgress();

  // Never let a visual script hold the page hostage
  hideLoader();

  console.log("MYRLORE website initialised.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

/* =========================================
   16. CLEANUP
========================================= */

window.addEventListener("beforeunload", () => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
  }

  if (renderer) {
    renderer.dispose();
  }
});
