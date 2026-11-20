
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";
import { RoomEnvironment } from "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/environments/RoomEnvironment.js";

/* =========================================
   MYRLORE — CREATIVE STUDIO
   Main JavaScript
========================================= */

const CONFIG = {
  particleCount: window.innerWidth < 768 ? 350 : 900,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
  reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

/* =========================================
   1. DOM ELEMENTS
========================================= */

const pageLoader = $("#pageLoader");
const menuToggle = $("#menuToggle");
const menuPanel = $("#menuPanel");
const menuClose = $("#menuClose");
const menuLinks = $$(".menu-links a");
const yearElement = $("#year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

/* =========================================
   2. PAGE LOADER
========================================= */

function hideLoader() {
  if (!pageLoader) return;

  if (window.gsap && !CONFIG.reducedMotion) {
    gsap.to(pageLoader, {
      opacity: 0,
      duration: 0.8,
      delay: 0.2,
      ease: "power2.inOut",
      onComplete: () => {
        pageLoader.style.display = "none";
      }
    });
  } else {
    pageLoader.style.display = "none";
  }
}

window.addEventListener("load", () => {
  setTimeout(hideLoader, 500);
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
    const isOpen = menuPanel?.classList.contains("is-open");

    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });
}

if (menuClose) {
  menuClose.addEventListener("click", closeMenu);
}

menuLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
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
   5. THREE.JS VARIABLES
========================================= */

let scene;
let camera;
let renderer;
let mainGroup;
let sculpture;
let particleSystem;
let animationFrame;

let pointerX = 0;
let pointerY = 0;
let scrollProgress = 0;

const canvas = $("#webgl");
const fallback = $("#webglFallback");

/* =========================================
   6. THREE.JS INITIALISATION
========================================= */

function initThree() {
  if (!canvas) {
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

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, CONFIG.pixelRatio)
    );

    renderer.outputColorSpace = THREE.SRGBColorSpace;

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    /* Environment reflections */

    const pmremGenerator = new THREE.PMREMGenerator(renderer);

    const environment = new RoomEnvironment();

    const environmentTexture =
      pmremGenerator.fromScene(environment).texture;

    scene.environment = environmentTexture;

    pmremGenerator.dispose();

    /* Lighting */

    const ambientLight = new THREE.AmbientLight(
      0xffffff,
      0.8
    );

    scene.add(ambientLight);

    const keyLight = new THREE.PointLight(
      0xffffff,
      90,
      30
    );

    keyLight.position.set(4, 5, 6);
    scene.add(keyLight);

    const sideLight = new THREE.PointLight(
      0xc5a77d,
      65,
      25
    );

    sideLight.position.set(-5, -2, 4);
    scene.add(sideLight);

    const rimLight = new THREE.PointLight(
      0x9ca9c2,
      50,
      25
    );

    rimLight.position.set(1, 4, -5);
    scene.add(rimLight);

    /* Main object group */

    mainGroup = new THREE.Group();
    scene.add(mainGroup);

    createSculpture();
    createParticles();

    window.addEventListener("resize", resizeThree);

    window.addEventListener("mousemove", (event) => {
      pointerX =
        (event.clientX / window.innerWidth - 0.5) * 2;

      pointerY =
        (event.clientY / window.innerHeight - 0.5) * 2;
    });

    animateThree();

  } catch (error) {
    console.error("MYRLORE 3D scene failed:", error);
    showFallback();
  }
}

/* =========================================
   7. CREATE MAIN 3D SCULPTURE
========================================= */

function createSculpture() {
  sculpture = new THREE.Group();
  mainGroup.add(sculpture);

  /* Main chrome torus knot */

  const knotGeometry = new THREE.TorusKnotGeometry(
    1.05,
    0.27,
    220,
    32,
    2,
    5
  );

  const chromeMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xc5c5c5,
    metalness: 1,
    roughness: 0.13,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.8
  });

  const knot = new THREE.Mesh(
    knotGeometry,
    chromeMaterial
  );

  sculpture.add(knot);

  /* Outer ring */

  const ringGeometry = new THREE.TorusGeometry(
    1.85,
    0.025,
    16,
    180
  );

  const ringMaterial = new THREE.MeshStandardMaterial({
    color: 0xc4aa83,
    metalness: 1,
    roughness: 0.25
  });

  const ring = new THREE.Mesh(
    ringGeometry,
    ringMaterial
  );

  ring.rotation.x = Math.PI / 2.5;
  ring.rotation.y = Math.PI / 5;

  sculpture.add(ring);

  /* Second orbit ring */

  const secondRing = new THREE.Mesh(
    new THREE.TorusGeometry(2.1, 0.012, 12, 160),
    new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 1,
      roughness: 0.35
    })
  );

  secondRing.rotation.x = Math.PI / 3;
  secondRing.rotation.y = -Math.PI / 4;

  sculpture.add(secondRing);

  /* Floating metallic spheres */

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

  /* Glass-like central sphere */

  const glassGeometry = new THREE.SphereGeometry(
    0.52,
    64,
    64
  );

  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xeeeeee,
    metalness: 0.05,
    roughness: 0.05,
    transmission: 0.92,
    thickness: 1.2,
    ior: 1.45,
    transparent: true,
    opacity: 1,
    envMapIntensity: 1.5
  });

  const glassSphere = new THREE.Mesh(
    glassGeometry,
    glassMaterial
  );

  glassSphere.position.set(0, 0, 0.15);
  sculpture.add(glassSphere);

  /* Small floating torus */

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
   8. PARTICLE FIELD
========================================= */

function createParticles() {
  const particleCount = CONFIG.particleCount;

  const positions = new Float32Array(
    particleCount * 3
  );

  for (let i = 0; i < particleCount; i++) {
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
   9. RESIZE HANDLING
========================================= */

function resizeThree() {
  if (!camera || !renderer) return;

  camera.aspect =
    window.innerWidth / window.innerHeight;

  camera.position.z =
    window.innerWidth < 768 ? 10 : 9;

  camera.updateProjectionMatrix();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, CONFIG.pixelRatio)
  );
}

/* =========================================
   10. SCROLL PROGRESS
========================================= */

function updateScrollProgress() {
  const scrollableHeight =
    document.documentElement.scrollHeight -
    window.innerHeight;

  if (scrollableHeight <= 0) {
    scrollProgress = 0;
    return;
  }

  scrollProgress =
    window.scrollY / scrollableHeight;
}

window.addEventListener(
  "scroll",
  updateScrollProgress,
  { passive: true }
);

/* =========================================
   11. THREE.JS ANIMATION LOOP
========================================= */

const clock = new THREE.Clock();

function animateThree() {
  animationFrame = requestAnimationFrame(animateThree);

  if (!renderer || !scene || !camera) return;

  const elapsed = clock.getElapsedTime();

  if (mainGroup && sculpture) {
    /* Gentle continuous movement */

    mainGroup.rotation.y =
      Math.sin(elapsed * 0.18) * 0.12;

    mainGroup.rotation.z =
      Math.sin(elapsed * 0.13) * 0.04;

    /* Cursor movement affects inner sculpture */

    const cursorTiltX = pointerY * 0.12;
    const cursorTiltY = pointerX * 0.17;

    sculpture.rotation.x +=
      (cursorTiltX - sculpture.rotation.x) * 0.025;

    sculpture.rotation.y +=
      (cursorTiltY - sculpture.rotation.y) * 0.025;

    /* Scroll movement */

    const targetY = scrollProgress * 0.8;

    mainGroup.position.y +=
      (targetY - mainGroup.position.y) * 0.025;

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
   12. FALLBACK IF WEBGL FAILS
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
   13. GSAP ANIMATIONS
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

  /* Hero entrance */

  const heroTimeline = gsap.timeline({
    defaults: {
      ease: "power4.out"
    }
  });

  heroTimeline
    .from(".hero-top", {
      y: 25,
      opacity: 0,
      duration: 1
    })
    .from(
      ".hero-title .hero-line",
      {
        yPercent: 110,
        opacity: 0,
        duration: 1.2,
        stagger: 0.12
      },
      "-=0.55"
    )
    .from(
      ".hero-copy .eyebrow",
      {
        y: 20,
        opacity: 0,
        duration: 0.8
      },
      "-=0.65"
    )
    .from(
      ".hero-bottom",
      {
        y: 25,
        opacity: 0,
        duration: 0.8
      },
      "-=0.5"
    );

  /* General reveal animations */

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

  /* Studio section */

  if ($("#studio")) {
    gsap.from(".studio .studio-heading", {
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

  /* Expertise list */

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

  /* Work cards */

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

  /* Manifesto text */

  if ($(".manifesto")) {
    gsap.from(".manifesto .manifesto-text", {
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

  /* Process steps */

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

  /* Contact section */

  if ($("#contact")) {
    gsap.from("#contact .contact-heading", {
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

  /* Horizontal intro strip */

  if ($(".intro-strip-track")) {
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

  /* 3D sculpture scroll animation */

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

  /* Refresh calculations after images load */

  window.addEventListener("load", () => {
    ScrollTrigger.refresh();
  });
}

/* =========================================
   14. HOVER INTERACTIONS
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
   15. NAVBAR SCROLL STATE
========================================= */

function initNavbar() {
  const header = $(".site-header");

  if (!header) return;

  function updateHeader() {
    if (window.scrollY > 60) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }

  window.addEventListener(
    "scroll",
    updateHeader,
    { passive: true }
  );

  updateHeader();
}

/* =========================================
   16. INITIALISE EVERYTHING
========================================= */

function init() {
  initThree();
  initGSAP();
  initHoverEffects();
  initNavbar();
  updateScrollProgress();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

/* =========================================
   17. CLEANUP
========================================= */

window.addEventListener("beforeunload", () => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
  }

  if (renderer) {
    renderer.dispose();
  }
});
