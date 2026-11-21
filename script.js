
let THREE;
let RectAreaLightUniformsLib;
let clock;

let threeLoadPromise = null;
let threeInitialized = false;

// ============================================
// MYRLORE®
// A2 — SHARP CHROME
// LIQUID METAL STUDIO SCULPTURE
// PERFORMANCE OPTIMISED
// ============================================

const canvas = document.querySelector("#webgl");
const cursorGlow = document.querySelector("#cursorGlow");

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const finePointer = window.matchMedia(
  "(hover: hover) and (pointer: fine)"
).matches;

const clamp = (v, min, max) =>
  Math.max(min, Math.min(max, v));

const lerp = (a, b, t) =>
  a + (b - a) * t;

let scene;
let camera;
let renderer;
let sculpture;
let particles;

let animationFrame = null;
let scrollProgress = 0;
let pointerX = 0;
let pointerY = 0;
let targetX = 0;
let targetY = 0;

let isPageVisible = !document.hidden;


// ============================================
// RENDERING PERFORMANCE
// ============================================

function getRenderPixelRatio() {
  const isMobile = window.innerWidth < 600;

  return Math.min(
    window.devicePixelRatio || 1,
    isMobile ? 1.25 : 1.5
  );
}


// ============================================
// CHROME MATERIALS
// ============================================

function createMetalMaterial(
  color = 0xffffff,
  roughness = 0.025
) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: 1,
    roughness,
    envMapIntensity: 3.5,
    side: THREE.DoubleSide
  });
}


// ============================================
// STUDIO REFLECTION ENVIRONMENT
// ============================================

function createEnvironment() {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();

  envScene.background = new THREE.Color(0x08090b);

  envScene.add(
    new THREE.HemisphereLight(
      0xffffff,
      0x10131a,
      0.8
    )
  );

  const panels = [
    {
      position: [-3.5, 0.5, 2],
      size: [0.8, 5, 0.12],
      color: 0xffffff
    },
    {
      position: [3.4, 0.2, 1.8],
      size: [0.55, 4.5, 0.12],
      color: 0xe5edff
    },
    {
      position: [0, 3.4, 0],
      size: [4.5, 0.55, 0.12],
      color: 0xffffff
    },
    {
      position: [-2.4, -2.5, 0.5],
      size: [0.65, 3, 0.12],
      color: 0xa8b8d2
    },
    {
      position: [2.5, -2, -1],
      size: [0.55, 2.5, 0.12],
      color: 0xffffff
    },
    {
      position: [0, 0, -4],
      size: [3.5, 3.5, 0.12],
      color: 0x333b4a
    }
  ];

  panels.forEach((panel) => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({
        color: panel.color
      })
    );

    mesh.position.set(...panel.position);
    mesh.scale.set(...panel.size);

    envScene.add(mesh);
  });

  scene.environment = pmrem.fromScene(
    envScene,
    0.04
  ).texture;

  scene.environmentIntensity = 1.4;

  envScene.traverse((object) => {
    if (object.geometry) object.geometry.dispose();
    if (object.material) object.material.dispose();
  });

  pmrem.dispose();
}


// ============================================
// SCULPTURAL BLADE GEOMETRY
// ============================================

function createBladeGeometry({
  length = 1.8,
  radius = 0.16,
  direction = new THREE.Vector3(0, 1, 0),
  bend = new THREE.Vector3(0, 0, 0),
  twist = 0
}) {
  const segments = 84;
  const radialSegments = 24;

  const positions = [];
  const uvs = [];
  const indices = [];

  const dir = direction.clone().normalize();

  const reference = Math.abs(dir.y) > 0.92
    ? new THREE.Vector3(1, 0, 0)
    : new THREE.Vector3(0, 1, 0);

  const pointAt = (t) => {
    const primary = dir.clone().multiplyScalar(
      length * t
    );

    const curved = bend.clone().multiplyScalar(
      Math.sin(Math.PI * t)
    );

    const secondary = new THREE.Vector3(
      Math.sin(t * Math.PI * 1.4) * 0.035,
      Math.sin(t * Math.PI * 2) * 0.025,
      Math.cos(t * Math.PI * 1.2) * 0.035
    );

    return primary.add(curved).add(secondary);
  };

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;

    const current = pointAt(t);
    const next = pointAt(Math.min(1, t + 0.002));
    const previous = pointAt(Math.max(0, t - 0.002));

    const tangent = next.sub(previous).normalize();

    let side = new THREE.Vector3()
      .crossVectors(tangent, reference)
      .normalize();

    if (side.lengthSq() < 0.001) {
      side.set(1, 0, 0);
    }

    const normal = new THREE.Vector3()
      .crossVectors(tangent, side)
      .normalize();

    const twistAngle =
      twist * t +
      Math.sin(t * Math.PI) * 0.25;

    side.applyAxisAngle(tangent, twistAngle);
    normal.applyAxisAngle(tangent, twistAngle);

    const swell = Math.pow(
      Math.sin(Math.PI * t),
      0.62
    );

    const taper = Math.pow(1 - t, 0.82);

    const currentRadius =
      radius * (0.36 + swell * 0.85) * taper;

    for (let j = 0; j <= radialSegments; j++) {
      const angle =
        (j / radialSegments) * Math.PI * 2;

      const ridge =
        1 + Math.cos(angle * 2) * 0.12;

      const horizontal =
        Math.cos(angle) * currentRadius * ridge;

      const vertical =
        Math.sin(angle) * currentRadius * 0.34;

      const vertex = current.clone()
        .addScaledVector(side, horizontal)
        .addScaledVector(normal, vertical);

      positions.push(vertex.x, vertex.y, vertex.z);
      uvs.push(j / radialSegments, t);

      if (i < segments && j < radialSegments) {
        const a = i * (radialSegments + 1) + j;
        const b = a + radialSegments + 1;

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
// CREATE BLADE
// ============================================

function createBlade(config, material) {
  const geometry = createBladeGeometry(config);

  const blade = new THREE.Mesh(geometry, material);

  blade.position.set(...config.origin);
  blade.castShadow = true;
  blade.receiveShadow = true;

  sculpture.add(blade);

  return blade;
}


// ============================================
// CENTRAL CORE
// ============================================

function createCore() {
  const coreGroup = new THREE.Group();

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.31, 64, 48),
    createMetalMaterial(0xffffff, 0.018)
  );

  core.scale.set(0.85, 1.15, 0.72);
  coreGroup.add(core);

  const innerForm = new THREE.Mesh(
    new THREE.SphereGeometry(0.19, 48, 32),
    createMetalMaterial(0x9faab8, 0.035)
  );

  innerForm.scale.set(0.8, 1.45, 0.7);
  innerForm.position.set(0.06, 0.12, 0.12);

  coreGroup.add(innerForm);
  sculpture.add(coreGroup);
}


// ============================================
// CHROME FILAMENTS
// ============================================

function createChromeCurve(points, radius, material) {
  const curve = new THREE.CatmullRomCurve3(
    points.map((point) => new THREE.Vector3(...point))
  );

  const geometry = new THREE.TubeGeometry(
    curve,
    100,
    radius,
    12,
    false
  );

  const mesh = new THREE.Mesh(geometry, material);
  sculpture.add(mesh);

  return mesh;
}


// ============================================
// BUILD SCULPTURE
// ============================================

function createSculpture() {
  sculpture = new THREE.Group();
  scene.add(sculpture);

  const silver = createMetalMaterial(0xffffff, 0.022);
  const platinum = createMetalMaterial(0xcbd4df, 0.035);
  const darkChrome = createMetalMaterial(0x788596, 0.045);
  const brightChrome = createMetalMaterial(0xffffff, 0.012);

  createCore();

  const blades = [
    {
      length: 2.15,
      radius: 0.17,
      origin: [0.02, 0.04, 0.03],
      direction: new THREE.Vector3(0.28, 0.92, 0.18),
      bend: new THREE.Vector3(0.40, 0.05, 0.16),
      twist: 1.25,
      material: silver
    },
    {
      length: 2.05,
      radius: 0.155,
      origin: [-0.05, 0.03, -0.08],
      direction: new THREE.Vector3(-0.72, 0.48, 0.16),
      bend: new THREE.Vector3(-0.25, 0.35, 0.10),
      twist: -1.1,
      material: brightChrome
    },
    {
      length: 2.25,
      radius: 0.16,
      origin: [0.04, 0.02, -0.12],
      direction: new THREE.Vector3(0.91, 0.23, -0.12),
      bend: new THREE.Vector3(0.10, 0.43, 0.28),
      twist: 1.6,
      material: platinum
    },
    {
      length: 1.85,
      radius: 0.14,
      origin: [-0.04, 0.02, 0.12],
      direction: new THREE.Vector3(-0.92, -0.24, 0.10),
      bend: new THREE.Vector3(-0.12, -0.25, 0.28),
      twist: -1.4,
      material: silver
    },
    {
      length: 1.92,
      radius: 0.15,
      origin: [0.03, -0.02, -0.04],
      direction: new THREE.Vector3(0.60, -0.70, 0.12),
      bend: new THREE.Vector3(0.35, -0.08, 0.20),
      twist: 1.3,
      material: brightChrome
    },
    {
      length: 1.72,
      radius: 0.13,
      origin: [-0.02, 0.01, 0.08],
      direction: new THREE.Vector3(-0.35, 0.30, 0.92),
      bend: new THREE.Vector3(-0.30, 0.28, 0.05),
      twist: -1.8,
      material: platinum
    },
    {
      length: 1.75,
      radius: 0.135,
      origin: [0.02, 0.01, -0.10],
      direction: new THREE.Vector3(0.18, -0.88, -0.42),
      bend: new THREE.Vector3(-0.25, -0.15, -0.12),
      twist: 1.4,
      material: darkChrome
    },
    {
      length: 1.48,
      radius: 0.12,
      origin: [-0.02, 0.04, 0.06],
      direction: new THREE.Vector3(-0.12, 0.12, -0.98),
      bend: new THREE.Vector3(0.28, 0.22, -0.12),
      twist: -1.5,
      material: silver
    },
    {
      length: 1.38,
      radius: 0.105,
      origin: [0.03, -0.02, 0.04],
      direction: new THREE.Vector3(0.85, -0.28, 0.45),
      bend: new THREE.Vector3(0.18, -0.32, 0.10),
      twist: 1.8,
      material: brightChrome
    }
  ];

  blades.forEach((config) => {
    const { material, ...bladeConfig } = config;
    createBlade(bladeConfig, material);
  });

  createChromeCurve(
    [
      [-0.08, -0.12, 0.05],
      [-0.25, -0.65, 0.14],
      [-0.48, -1.15, 0.22],
      [-0.42, -1.62, 0.28]
    ],
    0.018,
    platinum
  );

  createChromeCurve(
    [
      [0.08, 0.08, -0.08],
      [0.48, 0.42, -0.12],
      [0.95, 0.65, -0.18],
      [1.34, 0.52, -0.20]
    ],
    0.014,
    brightChrome
  );

  createChromeCurve(
    [
      [-0.10, 0.05, 0.08],
      [-0.42, 0.38, 0.28],
      [-0.82, 0.48, 0.35],
      [-1.12, 0.30, 0.38]
    ],
    0.012,
    darkChrome
  );

  sculpture.position.set(0.28, 0.05, 0);
  sculpture.rotation.set(0.08, -0.12, -0.08);

  sculpture.scale.setScalar(
    window.innerWidth < 600 ? 0.76 : 0.88
  );
}


// ============================================
// LIGHTING
// ============================================

function createLighting() {
  RectAreaLightUniformsLib.init();

  const lightConfigs = [
    {
      color: 0xffffff,
      intensity: 20,
      width: 0.55,
      height: 5,
      position: [-3.2, 1.5, 3.5]
    },
    {
      color: 0xe7efff,
      intensity: 24,
      width: 0.42,
      height: 4.5,
      position: [3.2, 0.5, 2.8]
    },
    {
      color: 0xffffff,
      intensity: 16,
      width: 4.5,
      height: 0.45,
      position: [0, 3.5, 1.5]
    },
    {
      color: 0xa9bad2,
      intensity: 18,
      width: 0.55,
      height: 4,
      position: [-3, 0.2, -3]
    },
    {
      color: 0xc9b99f,
      intensity: 6,
      width: 0.4,
      height: 2.8,
      position: [2, -2, -2]
    }
  ];

  lightConfigs.forEach((config) => {
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

  const key = new THREE.DirectionalLight(0xffffff, 1.8);
  key.position.set(3, 5, 5);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0xb8c8df, 2.2);
  rim.position.set(-4, 1, -3);
  scene.add(rim);
}


// ============================================
// PARTICLES
// ============================================

function createParticles() {
  const count = window.innerWidth < 600 ? 65 : 130;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
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
    opacity: 0.25,
    sizeAttenuation: true,
    depthWrite: false
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);
}


// ============================================
// THREE.JS INITIALIZATION
// LAZY-LOADED
// ============================================

async function initThree() {
  if (!canvas || threeInitialized) return;

  if (threeLoadPromise) {
    return threeLoadPromise;
  }

  threeLoadPromise = (async () => {
    try {
      const [threeModule, areaLightModule] = await Promise.all([
        import("three"),
        import("three/addons/lights/RectAreaLightUniformsLib.js")
      ]);

      THREE = threeModule;

      RectAreaLightUniformsLib =
        areaLightModule.RectAreaLightUniformsLib;

      clock = new THREE.Clock();

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

      renderer.setPixelRatio(getRenderPixelRatio());
      renderer.setSize(width, height);

      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;

      createEnvironment();
      createLighting();
      createSculpture();
      createParticles();

      threeInitialized = true;

      if (reducedMotion || !isPageVisible) {
        renderer.render(scene, camera);
      } else {
        clock.start();
        animate();
      }

    } catch (error) {
      console.error(
        "MYRLORE 3D initialization failed:",
        error
      );

      canvas.style.display = "none";
    }
  })();

  return threeLoadPromise;
}


// ============================================
// LAZY-LOAD SCHEDULER
// ============================================

function scheduleThreeLoad() {
  if (!canvas) return;

  if (!("IntersectionObserver" in window)) {
    initThree();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const shouldLoad = entries.some(
        (entry) => entry.isIntersecting
      );

      if (shouldLoad) {
        observer.disconnect();
        initThree();
      }
    },
    {
      rootMargin: "250px 0px"
    }
  );

  observer.observe(canvas);
}


// ============================================
// THREE.JS ANIMATION
// ============================================

function animate() {
  if (reducedMotion || !isPageVisible) return;

  animationFrame = requestAnimationFrame(animate);

  if (!renderer || !scene || !camera) return;

  const time = clock.getElapsedTime();

  targetX = lerp(targetX, pointerX, 0.035);
  targetY = lerp(targetY, pointerY, 0.035);

  if (sculpture) {
    sculpture.rotation.y =
      -0.12 +
      targetX * 0.22 +
      Math.sin(time * 0.16) * 0.025;

    sculpture.rotation.x =
      0.08 +
      targetY * 0.15 +
      Math.cos(time * 0.13) * 0.018;

    sculpture.rotation.z =
      -0.08 +
      Math.sin(time * 0.12) * 0.012;

    const baseScale =
      window.innerWidth < 600 ? 0.76 : 0.88;

    const finalScale =
      window.innerWidth < 600 ? 0.65 : 0.76;

    sculpture.scale.setScalar(
      lerp(baseScale, finalScale, scrollProgress)
    );

    sculpture.position.y =
      0.05 -
      scrollProgress * 0.22 +
      Math.sin(time * 0.3) * 0.018;
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
// CURSOR
// ============================================

let cursorTargetX = window.innerWidth / 2;
let cursorTargetY = window.innerHeight / 2;
let cursorCurrentX = cursorTargetX;
let cursorCurrentY = cursorTargetY;

let cursorAnimationFrame = null;

function animateCursor() {
  if (
    !cursorGlow ||
    !finePointer ||
    reducedMotion ||
    !isPageVisible
  ) {
    cursorAnimationFrame = null;
    return;
  }

  cursorCurrentX = lerp(cursorCurrentX, cursorTargetX, 0.16);
  cursorCurrentY = lerp(cursorCurrentY, cursorTargetY, 0.16);

  cursorGlow.style.left = `${cursorCurrentX}px`;
  cursorGlow.style.top = `${cursorCurrentY}px`;

  cursorAnimationFrame = requestAnimationFrame(animateCursor);
}

if (cursorGlow && finePointer && !reducedMotion) {
  animateCursor();
}

window.addEventListener(
  "pointermove",
  (event) => {
    pointerX = (event.clientX / window.innerWidth) * 2 - 1;
    pointerY = -(event.clientY / window.innerHeight) * 2 + 1;

    if (finePointer) {
      cursorTargetX = event.clientX;
      cursorTargetY = event.clientY;
    }
  },
  { passive: true }
);


// ============================================
// SCROLL PROGRESS
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

window.addEventListener("scroll", updateScrollProgress, {
  passive: true
});


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

  renderer.setPixelRatio(getRenderPixelRatio());
  renderer.setSize(width, height);

  if (reducedMotion || !isPageVisible) {
    renderer.render(scene, camera);
  }
}

window.addEventListener("resize", resizeScene);


// ============================================
// NAVIGATION MENU
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

  const heroTimeline = gsap.timeline({ delay: 0.25 });

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
// INTERACTIVE SERVICES ACCORDION
// ============================================

const serviceItems = document.querySelectorAll(".service-item");
const serviceTriggers = document.querySelectorAll(".service-trigger");

let activeServicePanel = null;

function animateServiceOpen(panel) {
  panel.hidden = false;

  panel.style.height = "0px";

  const fullHeight = panel.scrollHeight;

  if (reducedMotion) {
    panel.style.height = "auto";
    return;
  }

  if (window.gsap) {
    window.gsap.killTweensOf(panel);

    window.gsap.fromTo(
      panel,
      { height: 0 },
      {
        height: fullHeight,
        duration: 0.55,
        ease: "power3.inOut",
        onComplete: () => {
          panel.style.height = "auto";
        }
      }
    );

    return;
  }

  if (panel.animate) {
    const animation = panel.animate(
      [
        { height: "0px" },
        { height: `${fullHeight}px` }
      ],
      {
        duration: 500,
        easing: "cubic-bezier(.22,1,.36,1)"
      }
    );

    animation.onfinish = () => {
      panel.style.height = "auto";
    };

    return;
  }

  panel.style.height = "auto";
}

function animateServiceClose(panel, onComplete) {
  const currentHeight = panel.scrollHeight;

  if (reducedMotion) {
    panel.hidden = true;
    panel.style.height = "";
    onComplete?.();
    return;
  }

  if (window.gsap) {
    window.gsap.killTweensOf(panel);

    window.gsap.fromTo(
      panel,
      { height: currentHeight },
      {
        height: 0,
        duration: 0.4,
        ease: "power3.inOut",
        onComplete: () => {
          panel.hidden = true;
          panel.style.height = "";
          onComplete?.();
        }
      }
    );

    return;
  }

  if (panel.animate) {
    const animation = panel.animate(
      [
        { height: `${currentHeight}px` },
        { height: "0px" }
      ],
      {
        duration: 400,
        easing: "cubic-bezier(.22,1,.36,1)"
      }
    );

    animation.onfinish = () => {
      panel.hidden = true;
      panel.style.height = "";
      onComplete?.();
    };

    return;
  }

  panel.hidden = true;
  panel.style.height = "";
  onComplete?.();
}

function closeService(item) {
  const trigger = item.querySelector(".service-trigger");
  const panelId = trigger?.getAttribute("aria-controls");
  const panel = panelId
    ? document.getElementById(panelId)
    : null;

  item.classList.remove("is-active");

  trigger?.setAttribute("aria-expanded", "false");

  if (!panel || panel.hidden) return;

  animateServiceClose(panel);
}

function openService(item) {
  const trigger = item.querySelector(".service-trigger");
  const panelId = trigger?.getAttribute("aria-controls");
  const panel = panelId
    ? document.getElementById(panelId)
    : null;

  if (!trigger || !panel) {
    console.warn("MYRLORE service panel is missing:", item);
    return;
  }

  serviceItems.forEach((otherItem) => {
    if (otherItem !== item) {
      closeService(otherItem);
    }
  });

  item.classList.add("is-active");
  trigger.setAttribute("aria-expanded", "true");

  activeServicePanel = panel;

  animateServiceOpen(panel);
}

function toggleService(item) {
  const trigger = item.querySelector(".service-trigger");

  if (!trigger) return;

  const isOpen =
    trigger.getAttribute("aria-expanded") === "true";

  if (isOpen) {
    closeService(item);
    activeServicePanel = null;
  } else {
    openService(item);
  }
}

serviceTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const item = trigger.closest(".service-item");

    if (!item) return;

    toggleService(item);
  });
});

window.addEventListener("resize", () => {
  if (!activeServicePanel || activeServicePanel.hidden) return;

  if (activeServicePanel.style.height === "auto") return;

  if (window.gsap) {
    window.gsap.set(activeServicePanel, {
      height: activeServicePanel.scrollHeight
    });
  }
});


// ============================================
// FOOTER YEAR
// ============================================

const yearElement = document.querySelector("#year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}


// ============================================
// INTERACTIVE CASE STUDIES
// ============================================

const caseModal = document.querySelector("#caseStudyModal");
const casePanel = document.querySelector(".case-panel");
const caseClose = document.querySelector("#caseClose");

const caseTitle = document.querySelector("#caseTitle");
const caseCategory = document.querySelector("#caseCategory");
const caseSummary = document.querySelector("#caseSummary");
const caseOverview = document.querySelector("#caseOverview");
const caseFeatures = document.querySelector("#caseFeatures");
const caseTech = document.querySelector("#caseTech");

const caseHeroArt = document.querySelector("#caseHeroArt");
const caseSymbol = document.querySelector("#caseSymbol");
const caseIndex = document.querySelector("#caseIndex");
const caseArtCaption = document.querySelector("#caseArtCaption");

let lastCaseTrigger = null;

const caseStudies = {
  corroguard: {
    index: "PROJECT / 001",
    title: "CorroGuard",
    category: "ENGINEERING · DIGITAL PLATFORM",
    symbol: "CG",
    caption: "MATERIAL INTELLIGENCE",
    theme: "corro",

    summary:
      "An interactive engineering chemistry platform exploring corrosion analysis, material behaviour and prevention strategies.",

    overview:
      "CorroGuard is an educational digital platform designed to make corrosion concepts easier to explore. It brings together an illustrative risk calculator, material information and interactive engineering tools in one experience.",

    features: [
      "Interactive corrosion risk calculator",
      "Metal material information and comparisons",
      "Metal compatibility checker",
      "Corrosion types and engineering explanations",
      "Prevention methods and case studies"
    ],

    technology: [
      "HTML",
      "CSS",
      "JavaScript",
      "Chart.js",
      "Engineering Chemistry"
    ]
  },

  floodwatch: {
    index: "PROJECT / 002",
    title: "FloodWatch Chennai",
    category: "DATA · MAPPING · WEB PLATFORM",
    symbol: "FW",
    caption: "RAINFALL / DRAINAGE / INSIGHTS",
    theme: "flood",

    summary:
      "A web-based flood awareness and analysis platform focused on rainfall patterns, drainage infrastructure and flood-risk information in Chennai.",

    overview:
      "FloodWatch Chennai brings environmental and infrastructure information into a single interactive platform. It combines rainfall analysis with drainage mapping and location-based exploration to make flood-related information easier to understand.",

    features: [
      "Rainfall statistics and interactive graphs",
      "Annual rainfall comparisons",
      "Interactive drainage infrastructure map",
      "Zone and ward search with map highlighting",
      "Drainage condition details and flood-risk insights"
    ],

    technology: [
      "HTML",
      "CSS",
      "JavaScript",
      "Chart.js",
      "Leaflet",
      "GeoJSON"
    ]
  }
};

function populateCaseStudy(project) {
  if (!project) return;

  if (
    !caseIndex ||
    !caseTitle ||
    !caseCategory ||
    !caseSummary ||
    !caseOverview ||
    !caseFeatures ||
    !caseTech ||
    !caseHeroArt ||
    !caseSymbol ||
    !caseArtCaption
  ) {
    console.warn("MYRLORE case study elements are incomplete.");
    return;
  }

  caseIndex.textContent = project.index;
  caseTitle.textContent = project.title;
  caseCategory.textContent = project.category;
  caseSummary.textContent = project.summary;
  caseOverview.textContent = project.overview;
  caseSymbol.textContent = project.symbol;
  caseArtCaption.textContent = project.caption;

  caseFeatures.replaceChildren();

  project.features.forEach((feature) => {
    const item = document.createElement("li");
    item.textContent = feature;
    caseFeatures.appendChild(item);
  });

  caseTech.replaceChildren();

  project.technology.forEach((technology) => {
    const tag = document.createElement("span");
    tag.textContent = technology;
    caseTech.appendChild(tag);
  });

  const backgrounds = {
    corro:
      "radial-gradient(circle at 50% 45%, #555a5d, #24282c 48%, #121417 100%)",

    flood:
      "radial-gradient(ellipse at 50% 50%, #46565a, #1c272c 75%)"
  };

  caseHeroArt.style.background =
    backgrounds[project.theme] || backgrounds.corro;

  caseSymbol.style.color = "#e8e5dc";

  caseSymbol.style.textShadow =
    "0 12px 45px rgba(0,0,0,.45)";
}

function openCaseStudy(projectId, trigger) {
  const project = caseStudies[projectId];

  if (!project || !caseModal || !casePanel) return;

  lastCaseTrigger = trigger;

  populateCaseStudy(project);

  caseModal.classList.add("is-open");
  caseModal.setAttribute("aria-hidden", "false");

  caseModal.removeAttribute("inert");

  document.body.classList.add("case-open");

  casePanel.scrollTop = 0;

  requestAnimationFrame(() => {
    casePanel.focus({ preventScroll: true });
  });
}

function closeCaseStudy() {
  if (!caseModal || !caseModal.classList.contains("is-open")) {
    return;
  }

  caseModal.classList.remove("is-open");
  caseModal.setAttribute("aria-hidden", "true");

  document.body.classList.remove("case-open");

  lastCaseTrigger?.focus({ preventScroll: true });
}

document.querySelectorAll("[data-case-study]").forEach((card) => {
  card.addEventListener("click", (event) => {
    event.preventDefault();

    openCaseStudy(card.dataset.caseStudy, card);
  });
});

caseClose?.addEventListener("click", closeCaseStudy);

caseModal?.querySelectorAll("[data-case-close]").forEach((element) => {
  element.addEventListener("click", closeCaseStudy);
});

document.addEventListener("keydown", (event) => {
  if (!caseModal?.classList.contains("is-open")) return;

  if (event.key === "Escape") {
    closeCaseStudy();
  }

  if (event.key === "Tab" && casePanel) {
    const focusable = casePanel.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (
      !event.shiftKey &&
      document.activeElement === last
    ) {
      event.preventDefault();
      first.focus();
    }
  }
});


// ============================================
// MAGNETIC INTERACTIONS
// ============================================

const magneticElements = document.querySelectorAll(
  ".round-link, .contact-link, .text-link, .menu-toggle, .case-close, .case-bottom-close"
);

if (finePointer && !reducedMotion) {
  magneticElements.forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distanceX = event.clientX - centerX;
      const distanceY = event.clientY - centerY;

      const strength = element.classList.contains("contact-link")
        ? 0.10
        : 0.22;

      const maxDistance = element.classList.contains("contact-link")
        ? 7
        : 10;

      const moveX = clamp(
        distanceX * strength,
        -maxDistance,
        maxDistance
      );

      const moveY = clamp(
        distanceY * strength,
        -maxDistance,
        maxDistance
      );

      element.style.translate = `${moveX}px ${moveY}px`;
    });

    element.addEventListener("pointerleave", () => {
      element.style.translate = "0px 0px";
    });
  });
}


// ============================================
// PROJECT CARD CURSOR LABEL
// ============================================

document.querySelectorAll(".work-card").forEach((card) => {
  card.addEventListener("pointerenter", () => {
    if (!cursorGlow || !finePointer || reducedMotion) return;

    cursorGlow.classList.add("cursor-project");
    cursorGlow.dataset.label = "VIEW PROJECT";
  });

  card.addEventListener("pointerleave", () => {
    if (!cursorGlow) return;

    cursorGlow.classList.remove("cursor-project");
    cursorGlow.dataset.label = "";
  });
});


// ============================================
// INTERACTIVE CURSOR STATES
// ============================================

document.querySelectorAll(
  "a, button, .work-card, .service-item"
).forEach((element) => {
  element.addEventListener("pointerenter", () => {
    if (!cursorGlow || !finePointer || reducedMotion) return;

    cursorGlow.classList.add("cursor-hover");
  });

  element.addEventListener("pointerleave", () => {
    if (!cursorGlow) return;

    cursorGlow.classList.remove("cursor-hover");
  });
});


// ============================================
// CINEMATIC PAGE TRANSITIONS
// ============================================

const transitionLayer = document.querySelector("#pageTransition");
const transitionCurtain = document.querySelector(".transition-curtain");
const transitionContent = document.querySelector(".transition-content");
const transitionWordmark = document.querySelector(".transition-wordmark");
const transitionCaption = document.querySelector(".transition-caption");
const transitionProgress = document.querySelector(".transition-progress span");

let isTransitioning = false;

function setTransitionState(active) {
  if (!transitionLayer) return;

  transitionLayer.classList.toggle("is-active", active);
  transitionLayer.setAttribute(
    "aria-hidden",
    active ? "false" : "true"
  );
}

function animateTransitionIn() {
  if (!transitionLayer || !transitionCurtain) {
    return Promise.resolve();
  }

  setTransitionState(true);

  if (
    reducedMotion ||
    !window.gsap ||
    !transitionContent ||
    !transitionProgress
  ) {
    transitionCurtain.style.transform = "scaleY(1)";

    if (transitionContent) {
      transitionContent.style.opacity = "1";
    }

    return new Promise((resolve) => {
      setTimeout(resolve, 150);
    });
  }

  const gsap = window.gsap;

  gsap.killTweensOf([
    transitionCurtain,
    transitionContent,
    transitionWordmark,
    transitionCaption,
    transitionProgress
  ]);

  gsap.set(transitionCurtain, {
    transformOrigin: "bottom center",
    scaleY: 0
  });

  gsap.set(transitionContent, {
    opacity: 0,
    y: 18
  });

  gsap.set(transitionProgress, {
    scaleX: 0,
    transformOrigin: "left center"
  });

  return new Promise((resolve) => {
    gsap.timeline({
      onComplete: resolve
    })
      .to(transitionCurtain, {
        scaleY: 1,
        duration: 0.7,
        ease: "power4.inOut"
      })
      .to(transitionContent, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power3.out"
      }, "-=0.15")
      .to(transitionProgress, {
        scaleX: 1,
        duration: 0.5,
        ease: "power2.inOut"
      }, "-=0.2");
  });
}

function animateTransitionOut() {
  if (!transitionLayer || !transitionCurtain) {
    return Promise.resolve();
  }

  if (
    reducedMotion ||
    !window.gsap ||
    !transitionContent
  ) {
    transitionCurtain.style.transform = "scaleY(0)";

    if (transitionContent) {
      transitionContent.style.opacity = "0";
    }

    setTransitionState(false);

    return Promise.resolve();
  }

  const gsap = window.gsap;

  return new Promise((resolve) => {
    gsap.timeline({
      onComplete: () => {
        setTransitionState(false);
        resolve();
      }
    })
      .to(transitionContent, {
        opacity: 0,
        y: -14,
        duration: 0.3,
        ease: "power2.in"
      })
      .to(transitionCurtain, {
        scaleY: 0,
        transformOrigin: "top center",
        duration: 0.75,
        ease: "power4.inOut"
      }, "-=0.05");
  });
}

function getTargetFromLink(link) {
  const href = link.getAttribute("href");

  if (!href || !href.startsWith("#")) return null;

  const targetId = href.slice(1);

  if (!targetId) return null;

  return document.getElementById(targetId);
}

async function navigateWithTransition(target, link) {
  if (!target || isTransitioning) return;

  isTransitioning = true;

  const targetId = target.id;

  closeMenu();

  try {
    await animateTransitionIn();

    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY,
      behavior: "auto"
    });

    if (targetId) {
      window.history.replaceState(
        null,
        "",
        `#${targetId}`
      );
    }

    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });

    await animateTransitionOut();

    link?.blur();
  } catch (error) {
    console.error("MYRLORE transition failed:", error);
    setTransitionState(false);
  } finally {
    isTransitioning = false;
  }
}


// ============================================
// INTERNAL LINK INTERCEPTION
// ============================================

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = getTargetFromLink(link);

    if (!target) return;

    if (link.hasAttribute("data-case-study")) return;

    if (link.closest(".case-panel")) return;

    if (
      link.matches("[data-case-close]") ||
      link.classList.contains("case-close") ||
      link.classList.contains("case-bottom-close")
    ) {
      return;
    }

    event.preventDefault();

    navigateWithTransition(target, link);
  });
});


// ============================================
// INITIAL PAGE TRANSITION STATE
// ============================================

if (transitionLayer) {
  setTransitionState(false);
}


// ============================================
// PAGE INITIALIZATION
// ============================================

scheduleThreeLoad();
initAnimations();
updateScrollProgress();

window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});

setTimeout(() => {
  document.body.classList.add("loaded");
}, 4500);


// ============================================
// CURSOR VISIBILITY HANDLING
// ============================================

document.addEventListener("visibilitychange", () => {
  if (!cursorGlow || !finePointer || reducedMotion) return;

  if (document.hidden) {
    if (cursorAnimationFrame !== null) {
      cancelAnimationFrame(cursorAnimationFrame);
      cursorAnimationFrame = null;
    }
  } else if (cursorAnimationFrame === null) {
    animateCursor();
  }
});


// ============================================
// MYRLORE® — SECRET KEYBOARD EASTER EGG
// KONAMI CODE + CHROME RESONANCE
// ============================================

(() => {
  const sequence = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a"
  ];

  let sequencePosition = 0;
  let eggOpen = false;
  let previousFocus = null;

  // Audio state
  let audioContext = null;
  let soundEnabled = true;

  // ========================================
  // CHROME RESONANCE SOUND
  // GENERATED WITH WEB AUDIO API
  // ========================================

  function playChromeResonance() {
    if (!soundEnabled) return;

    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    try {
      if (!audioContext) {
        audioContext = new AudioContextClass();
      }

      if (audioContext.state === "suspended") {
        audioContext.resume();
      }

      const now = audioContext.currentTime;

      const master = audioContext.createGain();
      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(
        0.16,
        now + 0.035
      );
      master.gain.exponentialRampToValueAtTime(
        0.0001,
        now + 1.45
      );
      master.connect(audioContext.destination);

      // Main metallic tone
      const tones = [
        {
          frequency: 880,
          volume: 0.65,
          duration: 1.25,
          detune: -3
        },
        {
          frequency: 1320,
          volume: 0.28,
          duration: 0.95,
          detune: 4
        },
        {
          frequency: 1760,
          volume: 0.12,
          duration: 0.72,
          detune: -5
        },
        {
          frequency: 440,
          volume: 0.16,
          duration: 1.35,
          detune: 2
        }
      ];

      tones.forEach((tone, index) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.type = index === 3 ? "sine" : "triangle";

        oscillator.frequency.setValueAtTime(
          tone.frequency,
          now
        );

        oscillator.detune.setValueAtTime(
          tone.detune,
          now
        );

        const startTime = now + index * 0.012;

        gain.gain.setValueAtTime(0.0001, startTime);

        gain.gain.exponentialRampToValueAtTime(
          tone.volume,
          startTime + 0.018
        );

        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          startTime + tone.duration
        );

        oscillator.connect(gain);
        gain.connect(master);

        oscillator.start(startTime);
        oscillator.stop(startTime + tone.duration + 0.04);
      });

    } catch (error) {
      console.warn("MYRLORE audio could not be played:", error);
    }
  }


  // ========================================
  // SECRET SCREEN STYLES
  // ========================================

  const style = document.createElement("style");

  style.textContent = `
    .myrlore-secret {
      position: fixed;
      inset: 0;
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: rgba(5, 6, 8, 0.97);
      backdrop-filter: blur(22px);
      -webkit-backdrop-filter: blur(22px);
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition:
        opacity .6s ease,
        visibility .6s ease;
    }

    .myrlore-secret.is-visible {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }

    .myrlore-secret-inner {
      width: min(680px, 100%);
      text-align: center;
      position: relative;
    }

    .myrlore-secret-label {
      color: #85868a;
      font: 10px "DM Mono", monospace;
      letter-spacing: .28em;
      margin-bottom: 42px;
    }

    .myrlore-secret-symbol {
      font: 300 clamp(100px, 22vw, 190px) "Manrope", sans-serif;
      line-height: 1;
      letter-spacing: -.12em;
      padding-right: .12em;
      background: linear-gradient(
        135deg,
        #ffffff 5%,
        #777d86 28%,
        #f4f4f1 48%,
        #737982 70%,
        #ffffff 95%
      );
      background-size: 200% 200%;
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
      animation: myrloreChrome 5s ease infinite;
      filter: drop-shadow(0 15px 45px rgba(200,210,225,.12));
    }

    .myrlore-secret-title {
      margin: 35px 0 12px;
      color: #eeede8;
      font: 400 clamp(20px, 4vw, 30px) "Manrope", sans-serif;
      letter-spacing: -.045em;
    }

    .myrlore-secret-description {
      color: #85868a;
      font: 11px "DM Mono", monospace;
      letter-spacing: .12em;
      line-height: 1.8;
    }

    .myrlore-secret-controls {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
      margin-top: 38px;
      flex-wrap: wrap;
    }

    .myrlore-secret-close,
    .myrlore-secret-sound {
      border: 1px solid rgba(235,232,222,.22);
      background: transparent;
      color: #eeede8;
      padding: 14px 24px;
      font: 10px "DM Mono", monospace;
      letter-spacing: .18em;
      cursor: pointer;
      transition:
        background .3s ease,
        color .3s ease,
        border-color .3s ease;
    }

    .myrlore-secret-close:hover,
    .myrlore-secret-sound:hover {
      background: #eeede8;
      color: #08090b;
      border-color: #eeede8;
    }

    .myrlore-secret-close:focus-visible,
    .myrlore-secret-sound:focus-visible {
      outline: 2px solid #c6b69a;
      outline-offset: 5px;
    }

    .myrlore-secret-sound {
      color: #a9abb0;
      border-color: rgba(235,232,222,.12);
    }

    .myrlore-secret-corner {
      position: absolute;
      top: 25px;
      right: 25px;
      color: #85868a;
      font: 10px "DM Mono", monospace;
      letter-spacing: .12em;
    }

    @keyframes myrloreChrome {
      0%, 100% {
        background-position: 0% 50%;
      }

      50% {
        background-position: 100% 50%;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .myrlore-secret,
      .myrlore-secret-symbol {
        animation: none;
        transition: none;
      }
    }

    @media (max-width: 480px) {
      .myrlore-secret-label {
        margin-bottom: 30px;
      }

      .myrlore-secret-title {
        margin-top: 25px;
      }

      .myrlore-secret-controls {
        margin-top: 30px;
      }

      .myrlore-secret-close,
      .myrlore-secret-sound {
        padding: 13px 17px;
      }

      .myrlore-secret-corner {
        top: 16px;
        right: 16px;
      }
    }
  `;

  document.head.appendChild(style);


  // ========================================
  // SECRET SCREEN HTML
  // ========================================

  const overlay = document.createElement("div");

  overlay.className = "myrlore-secret";
  overlay.setAttribute("aria-hidden", "true");
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute(
    "aria-label",
    "MYRLORE secret experience"
  );

  overlay.innerHTML = `
    <span class="myrlore-secret-corner">
      ACCESS / 001
    </span>

    <div class="myrlore-secret-inner">
      <div class="myrlore-secret-label">
        MYRLORE® — UNLISTED EXPERIENCE
      </div>

      <div class="myrlore-secret-symbol" aria-hidden="true">
        M
      </div>

      <h2 class="myrlore-secret-title">
        You found what was never advertised.
      </h2>

      <p class="myrlore-secret-description">
        SOME THINGS ARE BETTER DISCOVERED.<br>
        WELCOME TO THE OTHER SIDE.
      </p>

      <div class="myrlore-secret-controls">
        <button
          class="myrlore-secret-close"
          type="button"
        >
          RETURN TO THE STUDIO
        </button>

        <button
          class="myrlore-secret-sound"
          type="button"
          aria-pressed="true"
        >
          SOUND ON
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const closeButton = overlay.querySelector(
    ".myrlore-secret-close"
  );

  const soundButton = overlay.querySelector(
    ".myrlore-secret-sound"
  );


  // ========================================
  // SOUND TOGGLE
  // ========================================

  function updateSoundButton() {
    soundButton.textContent = soundEnabled
      ? "SOUND ON"
      : "SOUND OFF";

    soundButton.setAttribute(
      "aria-pressed",
      String(soundEnabled)
    );
  }

  soundButton.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    updateSoundButton();

    // No sound is played when switching sound back on.
    // It plays on the next Easter egg activation.
  });


  // ========================================
  // OPEN / CLOSE SECRET EXPERIENCE
  // ========================================

  function closeEgg() {
    if (!eggOpen) return;

    eggOpen = false;

    overlay.classList.remove("is-visible");
    overlay.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";

    if (previousFocus && previousFocus.isConnected) {
      previousFocus.focus({ preventScroll: true });
    }
  }

  function openEgg() {
    if (eggOpen) return;

    eggOpen = true;
    previousFocus = document.activeElement;

    overlay.classList.add("is-visible");
    overlay.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";

    closeButton.focus({ preventScroll: true });

    // Play the sound only when the secret is discovered.
    playChromeResonance();
  }

  closeButton.addEventListener("click", closeEgg);

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeEgg();
    }
  });


  // ========================================
  // KONAMI CODE DETECTION
  // ========================================

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && eggOpen) {
      closeEgg();
      return;
    }

    if (eggOpen) return;

    if (
      event.target instanceof HTMLElement &&
      (
        event.target.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(
          event.target.tagName
        )
      )
    ) {
      sequencePosition = 0;
      return;
    }

    if (
      event.ctrlKey ||
      event.altKey ||
      event.metaKey ||
      event.repeat
    ) {
      sequencePosition = 0;
      return;
    }

    const key = event.key.length === 1
      ? event.key.toLowerCase()
      : event.key;

    if (key === sequence[sequencePosition]) {
      sequencePosition++;

      if (sequencePosition === sequence.length) {
        sequencePosition = 0;
        openEgg();
      }
    } else {
      sequencePosition =
        key === sequence[0] ? 1 : 0;
    }
  });
})();
