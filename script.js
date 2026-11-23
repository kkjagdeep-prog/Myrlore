
/* ==========================================
   MYRLORE® — MAIN INTERACTION SYSTEM
   A2 CHROME SCULPTURE · GSAP · UI
   CAPRI CINEMATIC SECRET ARCHIVE
========================================== */

(() => {
  "use strict";

  const $ = (selector, parent = document) =>
    parent.querySelector(selector);

  const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];

  const body = document.body;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const touchDevice = window.matchMedia(
    "(hover: none), (pointer: coarse)"
  ).matches;

  const gsapInstance = window.gsap || null;
  const ScrollTriggerPlugin = window.ScrollTrigger || null;

  if (gsapInstance && ScrollTriggerPlugin) {
    gsapInstance.registerPlugin(ScrollTriggerPlugin);
  }

  /* ==========================================
     PAGE LOADER
  ========================================== */

  const loader = $("#pageLoader");

  function hideLoader() {
    body.classList.add("loaded");

    if (loader) {
      loader.classList.add("loaded");
      loader.style.pointerEvents = "none";
    }
  }

  window.addEventListener("load", hideLoader, { once: true });
  setTimeout(hideLoader, 5000);

  /* ==========================================
     FOOTER YEAR
  ========================================== */

  const year = $("#year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  /* ==========================================
     NAVIGATION
  ========================================== */

  const menuToggle = $("#menuToggle");
  const menuClose = $("#menuClose");
  const menuPanel = $("#menuPanel");

  function openMenu() {
    if (!menuPanel) return;

    menuPanel.classList.add("open");
    menuPanel.setAttribute("aria-hidden", "false");
    menuPanel.removeAttribute("inert");

    menuToggle?.setAttribute("aria-expanded", "true");
    menuToggle?.setAttribute("aria-label", "Close menu");

    body.style.overflow = "hidden";
  }

  function closeMenu() {
    if (!menuPanel) return;

    menuPanel.classList.remove("open");
    menuPanel.setAttribute("aria-hidden", "true");
    menuPanel.setAttribute("inert", "");

    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Open menu");

    body.style.overflow = "";
  }

  menuToggle?.addEventListener("click", () => {
    menuPanel?.classList.contains("open")
      ? closeMenu()
      : openMenu();
  });

  menuClose?.addEventListener("click", closeMenu);

  $$("#menuPanel a").forEach(link => {
    link.addEventListener("click", closeMenu);
  });

  /* ==========================================
     CURSOR GLOW
  ========================================== */

  const cursorGlow = $("#cursorGlow");

  if (cursorGlow && !touchDevice && !reducedMotion) {
    let mouseX = innerWidth / 2;
    let mouseY = innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;

    window.addEventListener("mousemove", event => {
      mouseX = event.clientX;
      mouseY = event.clientY;
    });

    function animateCursor() {
      currentX += (mouseX - currentX) * 0.12;
      currentY += (mouseY - currentY) * 0.12;

      cursorGlow.style.left = `${currentX}px`;
      cursorGlow.style.top = `${currentY}px`;

      requestAnimationFrame(animateCursor);
    }

    animateCursor();

    $$("a, button, [data-magnetic]").forEach(element => {
      element.addEventListener("mouseenter", () => {
        cursorGlow.classList.add("cursor-hover");
      });

      element.addEventListener("mouseleave", () => {
        cursorGlow.classList.remove(
          "cursor-hover",
          "cursor-project"
        );

        cursorGlow.removeAttribute("data-label");
      });
    });

    $$("[data-case-study]").forEach(card => {
      card.addEventListener("mouseenter", () => {
        cursorGlow.classList.add("cursor-project");
        cursorGlow.setAttribute("data-label", "VIEW PROJECT");
      });
    });
  }

  /* ==========================================
     GSAP REVEAL ANIMATIONS
  ========================================== */

  const revealElements = $$(".reveal");

  if (gsapInstance && !reducedMotion) {
    revealElements.forEach(element => {
      gsapInstance.fromTo(
        element,
        { opacity: 0, y: 45 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: ScrollTriggerPlugin
            ? {
                trigger: element,
                start: "top 88%",
                once: true
              }
            : undefined
        }
      );
    });
  } else {
    revealElements.forEach(element => {
      element.style.opacity = "1";
      element.style.transform = "none";
    });
  }

  /* ==========================================
     HERO ENTRANCE
  ========================================== */

  const heroElements = [
    $(".hero-meta"),
    $(".eyebrow"),
    $(".hero h1"),
    $(".hero-bottom"),
    $(".hero-footer")
  ].filter(Boolean);

  if (gsapInstance && !reducedMotion && heroElements.length) {
    gsapInstance.from(heroElements, {
      opacity: 0,
      y: 30,
      duration: 1.1,
      stagger: 0.12,
      delay: 0.25,
      ease: "power3.out"
    });
  }

  /* ==========================================
     SERVICES ACCORDION
  ========================================== */

  const serviceItems = $$(".service-item");

  function getServicePanel(item, index) {
    return (
      $(".service-details", item) ||
      $(".service-panel", item) ||
      $(`#servicePanel${String(index + 1).padStart(2, "0")}`)
    );
  }

  function closeService(item, index) {
    const trigger =
      $(".service-trigger", item) ||
      $(`#serviceTrigger${String(index + 1).padStart(2, "0")}`);

    const panel = getServicePanel(item, index);

    if (!trigger || !panel) return;

    trigger.setAttribute("aria-expanded", "false");
    item.classList.remove("is-active");

    if (gsapInstance && !reducedMotion && !panel.hidden) {
      gsapInstance.to(panel, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: "power2.inOut",
        onComplete: () => {
          panel.hidden = true;
          panel.style.height = "";
          panel.style.opacity = "";
        }
      });
    } else {
      panel.hidden = true;
      panel.style.height = "";
      panel.style.opacity = "";
    }
  }

  function openService(item, index) {
    const trigger =
      $(".service-trigger", item) ||
      $(`#serviceTrigger${String(index + 1).padStart(2, "0")}`);

    const panel = getServicePanel(item, index);

    if (!trigger || !panel) return;

    trigger.setAttribute("aria-expanded", "true");
    item.classList.add("is-active");
    panel.hidden = false;

    if (gsapInstance && !reducedMotion) {
      gsapInstance.fromTo(
        panel,
        { height: 0, opacity: 0 },
        {
          height: "auto",
          opacity: 1,
          duration: 0.5,
          ease: "power3.out"
        }
      );
    }
  }

  serviceItems.forEach((item, index) => {
    const trigger =
      $(".service-trigger", item) ||
      $(`#serviceTrigger${String(index + 1).padStart(2, "0")}`);

    if (!trigger) return;

    trigger.addEventListener("click", () => {
      const active = item.classList.contains("is-active");

      serviceItems.forEach((other, otherIndex) => {
        if (other !== item) closeService(other, otherIndex);
      });

      active
        ? closeService(item, index)
        : openService(item, index);
    });
  });

  /* ==========================================
     CASE STUDY CONTENT
  ========================================== */

  const caseStudies = {
    corroguard: {
      index: "PROJECT / 001",
      symbol: "CG",
      caption: "MATERIAL INTELLIGENCE",
      category: "ENGINEERING · DIGITAL PLATFORM",
      title: "CorroGuard",
      summary:
        "An interactive engineering chemistry platform exploring corrosion analysis, material behaviour and prevention strategies.",
      overview:
        "CorroGuard is an educational digital platform designed to make corrosion science more accessible through interactive tools, material information and practical engineering concepts.",
      features: [
        "Interactive corrosion risk calculator",
        "Metal material information and comparisons",
        "Metal compatibility checker",
        "Corrosion types and case studies",
        "Corrosion prevention information"
      ],
      technology: ["HTML", "CSS", "JavaScript", "Chart.js"]
    },

    floodwatch: {
      index: "PROJECT / 002",
      symbol: "FW",
      caption: "RAINFALL · MAPPING · INSIGHT",
      category: "DATA · MAPPING · WEB PLATFORM",
      title: "FloodWatch Chennai",
      summary:
        "A web-based flood awareness and risk analysis platform focused on rainfall information and urban drainage infrastructure.",
      overview:
        "FloodWatch Chennai explores how rainfall information, drainage infrastructure data and interactive mapping can be brought together to support better understanding of urban flood-related conditions.",
      features: [
        "Rainfall data visualisation",
        "Historical annual rainfall comparisons",
        "Interactive drainage infrastructure map",
        "Zone and ward-based search",
        "Drainage condition information",
        "Flood awareness insights"
      ],
      technology: [
        "HTML", "CSS", "JavaScript",
        "Leaflet", "Chart.js", "GeoJSON"
      ]
    }
  };

  /* ==========================================
     CASE STUDY MODAL
  ========================================== */

  const caseModal = $("#caseStudyModal");
  const casePanel = $(".case-panel", caseModal || document);
  const caseClose = $("#caseClose");

  let previousFocus = null;

  function populateCaseStudy(project) {
    const data = caseStudies[project];

    if (!data) return false;

    const setText = (selector, value) => {
      const element = $(selector);
      if (element) element.textContent = value;
    };

    setText("#caseIndex", data.index);
    setText("#caseSymbol", data.symbol);
    setText("#caseArtCaption", data.caption);
    setText("#caseCategory", data.category);
    setText("#caseTitle", data.title);
    setText("#caseSummary", data.summary);
    setText("#caseOverview", data.overview);

    const features = $("#caseFeatures");
    const technology = $("#caseTech");

    if (features) {
      features.replaceChildren();

      data.features.forEach(feature => {
        const li = document.createElement("li");
        li.textContent = feature;
        features.appendChild(li);
      });
    }

    if (technology) {
      technology.replaceChildren();

      data.technology.forEach(item => {
        const span = document.createElement("span");
        span.textContent = item;
        technology.appendChild(span);
      });
    }

    $("#caseHeroArt")?.classList.toggle(
      "case-flood",
      project === "floodwatch"
    );

    return true;
  }

  function openCaseStudy(project, trigger) {
    if (!caseModal || !casePanel) return;
    if (!populateCaseStudy(project)) return;

    previousFocus = trigger || document.activeElement;

    caseModal.classList.add("is-open");
    caseModal.setAttribute("aria-hidden", "false");
    caseModal.removeAttribute("inert");

    body.classList.add("case-open");

    requestAnimationFrame(() => caseClose?.focus());
  }

  function closeCaseStudy() {
    if (!caseModal) return;

    caseModal.classList.remove("is-open");
    caseModal.setAttribute("aria-hidden", "true");
    caseModal.setAttribute("inert", "");

    body.classList.remove("case-open");

    previousFocus?.focus?.();
  }

  $$("[data-case-study]").forEach(card => {
    card.addEventListener("click", event => {
      event.preventDefault();
      openCaseStudy(card.dataset.caseStudy, card);
    });
  });

  $$("[data-case-close]").forEach(element => {
    element.addEventListener("click", closeCaseStudy);
  });

  caseClose?.addEventListener("click", closeCaseStudy);

  casePanel?.addEventListener("keydown", event => {
    if (event.key !== "Tab") return;

    const focusable = $$(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      casePanel
    ).filter(element => element.offsetParent !== null);

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  /* ==========================================
     MAGNETIC INTERACTIONS
  ========================================== */

  const magneticElements = $$(
    ".round-link, .contact-link, .text-link, .menu-toggle, .case-close, .case-bottom-close"
  );

  if (!touchDevice && !reducedMotion) {
    magneticElements.forEach(element => {
      element.addEventListener("mousemove", event => {
        const rect = element.getBoundingClientRect();

        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;

        element.style.translate =
          `${x * 0.12}px ${y * 0.12}px`;
      });

      element.addEventListener("mouseleave", () => {
        element.style.translate = "0 0";
      });
    });
  }

  /* ==========================================
     PAGE TRANSITIONS
  ========================================== */

  const pageTransition = $("#pageTransition");
  const transitionCurtain = $(".transition-curtain");
  const transitionContent = $(".transition-content");
  const transitionProgress = $(".transition-progress span");

  let transitionRunning = false;

  function setTransitionState(active) {
    if (!pageTransition) return;

    pageTransition.classList.toggle("active", active);
    pageTransition.classList.toggle("is-active", active);

    pageTransition.setAttribute(
      "aria-hidden",
      active ? "false" : "true"
    );

    if (active) {
      pageTransition.removeAttribute("inert");
    } else {
      pageTransition.setAttribute("inert", "");
    }
  }

  function runPageTransition(url) {
    if (transitionRunning || !pageTransition) {
      window.location.href = url;
      return;
    }

    transitionRunning = true;
    setTransitionState(true);

    if (gsapInstance && !reducedMotion) {
      const timeline = gsapInstance.timeline({
        onComplete: () => {
          window.location.href = url;
        }
      });

      let hasAnimation = false;

      if (transitionCurtain) {
        timeline.to(transitionCurtain, {
          scaleY: 1,
          duration: 0.65,
          ease: "power4.inOut",
          transformOrigin: "bottom center"
        });

        hasAnimation = true;
      }

      if (transitionContent) {
        timeline.to(transitionContent, {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: "power2.out"
        }, "-=0.1");

        hasAnimation = true;
      }

      if (transitionProgress) {
        timeline.to(transitionProgress, {
          scaleX: 1,
          duration: 0.7,
          ease: "power2.inOut"
        }, "-=0.1");

        hasAnimation = true;
      }

      if (!hasAnimation) {
        window.location.href = url;
      }
    } else {
      pageTransition.style.visibility = "visible";
      pageTransition.style.opacity = "1";

      if (transitionCurtain) {
        transitionCurtain.style.transform = "scaleY(1)";
      }

      setTimeout(() => {
        window.location.href = url;
      }, 150);
    }
  }

  $$("a[href]").forEach(link => {
    link.addEventListener("click", event => {
      const href = link.getAttribute("href");

      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        link.target === "_blank" ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      ) return;

      let destination;

      try {
        destination = new URL(href, window.location.href);
      } catch {
        return;
      }

      if (destination.origin !== location.origin) return;
      if (destination.pathname === location.pathname) return;

      event.preventDefault();
      runPageTransition(destination.href);
    });
  });

  /* ==========================================
     THREE.JS — A2 CHROME SCULPTURE

     Loads Three.js directly from jsDelivr.
     No bare module imports or addon required.
  ========================================== */

  const canvas = $("#webgl");

  let THREE = null;
  let renderer = null;
  let scene = null;
  let camera = null;
  let sculpture = null;
  let particleSystem = null;
  let clock = null;
  let animationFrame = null;
  let resizeObserver = null;

  let threeReady = false;
  let pageVisible = !document.hidden;

  let pointerX = 0;
  let pointerY = 0;
  let scrollRotation = 0;

  const BLADE_SEGMENTS = 84;
  const RADIAL_SEGMENTS = 24;

  function createBladeGeometry(options = {}) {
    const {
      length = 2.8,
      width = 0.42,
      thickness = 0.11,
      twist = 1.2,
      bend = 0.35,
      taper = 0.72,
      ridge = 0.12
    } = options;

    const positions = [];
    const uvs = [];
    const indices = [];
    const curvePoints = [];

    for (let i = 0; i <= BLADE_SEGMENTS; i++) {
      const t = i / BLADE_SEGMENTS;

      curvePoints.push(
        new THREE.Vector3(
          Math.sin(t * Math.PI) * bend,
          (t - 0.5) * length,
          Math.sin(t * Math.PI * 2) * bend * 0.25
        )
      );
    }

    const centerCurve = new THREE.CatmullRomCurve3(curvePoints);

    const frames = centerCurve.computeFrenetFrames(
      BLADE_SEGMENTS,
      false
    );

    for (let i = 0; i <= BLADE_SEGMENTS; i++) {
      const t = i / BLADE_SEGMENTS;
      const center = centerCurve.getPointAt(t);

      const envelope = Math.pow(
        Math.sin(Math.PI * t),
        taper
      );

      const asymmetry =
        1 + Math.sin(t * Math.PI * 2.5) * 0.16;

      const bladeWidth = Math.max(
        0.003,
        width * envelope * asymmetry
      );

      const bladeThickness = Math.max(
        0.002,
        thickness * envelope
      );

      const twistAngle = twist * t;
      const normal = frames.normals[i];
      const binormal = frames.binormals[i];

      const twistedNormal = normal.clone()
        .multiplyScalar(Math.cos(twistAngle))
        .add(
          binormal.clone().multiplyScalar(Math.sin(twistAngle))
        );

      const twistedBinormal = binormal.clone()
        .multiplyScalar(Math.cos(twistAngle))
        .sub(
          normal.clone().multiplyScalar(Math.sin(twistAngle))
        );

      for (let j = 0; j <= RADIAL_SEGMENTS; j++) {
        const u = j / RADIAL_SEGMENTS;
        const angle = u * Math.PI * 2;

        const side = Math.cos(angle) * bladeWidth;
        const depth = Math.sin(angle) * bladeThickness;

        const ridgeFactor =
          Math.pow(Math.abs(Math.cos(angle)), 8) *
          ridge * envelope;

        const point = center.clone()
          .addScaledVector(twistedNormal, side)
          .addScaledVector(
            twistedBinormal,
            depth + ridgeFactor
          );

        positions.push(point.x, point.y, point.z);
        uvs.push(u, t);
      }
    }

    for (let i = 0; i < BLADE_SEGMENTS; i++) {
      for (let j = 0; j < RADIAL_SEGMENTS; j++) {
        const a = i * (RADIAL_SEGMENTS + 1) + j;
        const b = a + RADIAL_SEGMENTS + 1;

        indices.push(
          a, b, a + 1,
          b, b + 1, a + 1
        );
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

    return geometry;
  }

  function createChromeCurve(points, material, radius = 0.018) {
    const curve = new THREE.CatmullRomCurve3(points);

    const geometry = new THREE.TubeGeometry(
      curve,
      180,
      radius,
      12,
      false
    );

    return new THREE.Mesh(geometry, material);
  }

  function createEnvironment(rendererInstance) {
    const pmrem = new THREE.PMREMGenerator(rendererInstance);

    const environmentScene = new THREE.Scene();
    environmentScene.background = new THREE.Color(0x17191e);

    const panels = [
      { position: [0, 5, 2], size: [5, 0.15, 2], color: 0xffffff },
      { position: [-5, 1, 1], size: [0.15, 5, 2], color: 0xdce5f0 },
      { position: [5, 0, -1], size: [0.15, 4, 2], color: 0xc6b69a },
      { position: [0, -4, -2], size: [4, 0.15, 2], color: 0x8995a4 },
      { position: [0, 0, -5], size: [4, 4, 0.15], color: 0xffffff }
    ];

    panels.forEach(data => {
      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(...data.size),
        new THREE.MeshBasicMaterial({ color: data.color })
      );

      panel.position.set(...data.position);
      environmentScene.add(panel);
    });

    const texture = pmrem.fromScene(
      environmentScene,
      0.04
    ).texture;

    pmrem.dispose();

    return texture;
  }

  function animateThreeAgain() {
    if (!pageVisible || !threeReady) return;

    animationFrame = requestAnimationFrame(animateThreeAgain);

    const elapsed = clock.getElapsedTime();

    sculpture.rotation.y = elapsed * 0.13 + scrollRotation;

    sculpture.rotation.x =
      Math.sin(elapsed * 0.25) * 0.13 + pointerY * 0.3;

    sculpture.rotation.z =
      Math.cos(elapsed * 0.2) * 0.08 + pointerX * 0.2;

    sculpture.position.y = Math.sin(elapsed * 0.5) * 0.08;

    particleSystem.rotation.y = elapsed * 0.025;
    particleSystem.rotation.x = elapsed * 0.012;

    renderer.render(scene, camera);
  }

  async function initialiseThree() {
    if (!canvas || threeReady || reducedMotion) return;

    try {
      THREE = await import(
        "https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js"
      );

      clock = new THREE.Clock();
      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
      camera.position.set(0, 0, 8);

      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance"
      });

      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, 1.75)
      );

      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;

      const chromeMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xc8c9c7,
        metalness: 1,
        roughness: 0.16,
        envMapIntensity: 1.8,
        clearcoat: 1,
        clearcoatRoughness: 0.08
      });

      const darkMetal = new THREE.MeshPhysicalMaterial({
        color: 0x777b80,
        metalness: 0.95,
        roughness: 0.25,
        envMapIntensity: 1.7,
        clearcoat: 1
      });

      const champagneMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xc6b69a,
        metalness: 1,
        roughness: 0.2,
        envMapIntensity: 1.6,
        clearcoat: 1
      });

      scene.environment = createEnvironment(renderer);

      scene.add(new THREE.AmbientLight(0xffffff, 0.5));

      const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
      keyLight.position.set(4, 5, 6);
      scene.add(keyLight);

      const rimLight = new THREE.DirectionalLight(0xc6b69a, 2.8);
      rimLight.position.set(-5, 1, -4);
      scene.add(rimLight);

      const lowerLight = new THREE.PointLight(0x89939d, 22, 14);
      lowerLight.position.set(0, -3, 3);
      scene.add(lowerLight);

      const topLight = new THREE.DirectionalLight(0xffffff, 1.5);
      topLight.position.set(0, 4, 4);
      scene.add(topLight);

      sculpture = new THREE.Group();
      scene.add(sculpture);

      const bladeConfigurations = [
        { length: 2.9, width: 0.43, twist: 1.25, bend: 0.34 },
        { length: 2.65, width: 0.39, twist: -1.05, bend: 0.42 },
        { length: 2.8, width: 0.44, twist: 1.4, bend: 0.3 },
        { length: 2.7, width: 0.38, twist: -1.2, bend: 0.4 },
        { length: 2.95, width: 0.42, twist: 1.1, bend: 0.36 },
        { length: 2.65, width: 0.4, twist: -1.35, bend: 0.38 },
        { length: 2.85, width: 0.43, twist: 1.25, bend: 0.32 },
        { length: 2.7, width: 0.39, twist: -1.15, bend: 0.4 },
        { length: 2.9, width: 0.42, twist: 1.3, bend: 0.35 }
      ];

      bladeConfigurations.forEach((config, index) => {
        const geometry = createBladeGeometry(config);

        const blade = new THREE.Mesh(
          geometry,
          index % 3 === 0 ? champagneMaterial : chromeMaterial
        );

        const angle =
          (index / bladeConfigurations.length) * Math.PI * 2;

        blade.rotation.set(
          Math.sin(angle) * 0.5,
          angle,
          Math.cos(angle) * 0.45
        );

        blade.position.set(
          Math.cos(angle) * 0.22,
          Math.sin(angle) * 0.22,
          Math.sin(angle * 2) * 0.18
        );

        blade.scale.setScalar(
          0.88 + Math.sin(index * 1.7) * 0.08
        );

        sculpture.add(blade);
      });

      const core = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.48, 3),
        darkMetal
      );

      core.scale.set(1, 1.12, 0.88);
      sculpture.add(core);

      const innerCore = new THREE.Mesh(
        new THREE.SphereGeometry(0.19, 48, 48),
        chromeMaterial
      );

      sculpture.add(innerCore);

      for (let i = 0; i < 3; i++) {
        const points = [];
        const offset = i * (Math.PI * 2 / 3);

        for (let j = 0; j <= 100; j++) {
          const t = j / 100;
          const angle = t * Math.PI * 2 + offset;

          const radius =
            1.35 + Math.sin(angle * 2.5 + i) * 0.24;

          points.push(
            new THREE.Vector3(
              Math.cos(angle) * radius,
              Math.sin(angle * 1.5 + i) * 0.55,
              Math.sin(angle) * radius
            )
          );
        }

        sculpture.add(
          createChromeCurve(
            points,
            i === 1 ? champagneMaterial : chromeMaterial,
            0.014
          )
        );
      }

      const particleCount = 180;
      const particlePositions = new Float32Array(
        particleCount * 3
      );

      for (let i = 0; i < particleCount; i++) {
        particlePositions[i * 3] = (Math.random() - 0.5) * 7;
        particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 7;
        particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 5;
      }

      const particleGeometry = new THREE.BufferGeometry();

      particleGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(particlePositions, 3)
      );

      particleSystem = new THREE.Points(
        particleGeometry,
        new THREE.PointsMaterial({
          color: 0xc6b69a,
          size: 0.018,
          transparent: true,
          opacity: 0.55,
          sizeAttenuation: true
        })
      );

      scene.add(particleSystem);

      function resizeRenderer() {
        if (!renderer || !camera || !canvas) return;

        const rect = canvas.getBoundingClientRect();
        const width = Math.max(1, rect.width);
        const height = Math.max(1, rect.height);

        renderer.setSize(width, height, false);

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }

      resizeRenderer();

      if ("ResizeObserver" in window) {
        resizeObserver = new ResizeObserver(resizeRenderer);
        resizeObserver.observe(canvas);
      } else {
        window.addEventListener("resize", resizeRenderer);
      }

      if (!touchDevice) {
        window.addEventListener("mousemove", event => {
          pointerX =
            (event.clientX / window.innerWidth - 0.5) * 0.4;

          pointerY =
            (event.clientY / window.innerHeight - 0.5) * 0.3;
        });
      }

      window.addEventListener("scroll", () => {
        scrollRotation = window.scrollY * 0.00015;
      }, { passive: true });

      threeReady = true;

      if (pageVisible) {
        clock.start();
        animateThreeAgain();
      }

    } catch (error) {
      console.error(
        "MYRLORE sculpture initialisation failed:",
        error
      );

      if (canvas) canvas.style.opacity = "0";
    }
  }

  if (canvas) {
    const hero = $(".hero");

    if ("IntersectionObserver" in window && hero) {
      const observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          observer.disconnect();
          initialiseThree();
        }
      }, { rootMargin: "200px" });

      observer.observe(hero);
    } else {
      initialiseThree();
    }
  }

  document.addEventListener("visibilitychange", () => {
    pageVisible = !document.hidden;

    if (!renderer || !threeReady) return;

    if (!pageVisible) {
      cancelAnimationFrame(animationFrame);
      return;
    }

    clock.start();
    animateThreeAgain();
  });

  /* ==========================================
     MYRLORE® — CAPRI SECRET ARCHIVE
  ========================================== */

  const konamiSequence = [
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

  let konamiPosition = 0;
  let secretActive = false;
  let secretPreviousFocus = null;

  let capriAnimationFrame = null;
  let capriAnimationStart = 0;
  let capriImage = null;
  let capriFrameIndex = 0;
  let capriLastFrameTime = 0;

  const CAPRI_COLUMNS = 4;
  const CAPRI_ROWS = 4;
  const CAPRI_FRAME_COUNT = CAPRI_COLUMNS * CAPRI_ROWS;
  const CAPRI_FRAME_RATE = 12;
  const CAPRI_FRAME_INTERVAL = 1000 / CAPRI_FRAME_RATE;

  let capriCanvas = null;
  let capriContext = null;

  let capriPalette = {
    magenta: "#c5c5c5",
    green: "#858585",
    violet: "#eeeeee"
  };

  const secretStyle = document.createElement("style");

  secretStyle.textContent = `
    #myrloreSecretOverlay {
      --capri-magenta: #c5c5c5;
      --capri-green: #858585;
      --capri-violet: #eeeeee;

      position: fixed;
      inset: 0;
      z-index: 999999;
      display: grid;
      place-items: center;
      overflow: hidden;
      padding: 24px;
      isolation: isolate;
      background:
        radial-gradient(
          ellipse at 25% 48%,
          color-mix(in srgb, var(--capri-magenta) 13%, transparent),
          transparent 38%
        ),
        radial-gradient(
          ellipse at 75% 55%,
          color-mix(in srgb, var(--capri-green) 8%, transparent),
          transparent 42%
        ),
        #08090b;
      color: #eeeDE8;
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition:
        opacity .65s ease,
        visibility .65s ease;
    }

    #myrloreSecretOverlay.active {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }

    #myrloreSecretOverlay .secret-noise {
      position: absolute;
      inset: -50%;
      z-index: 1;
      pointer-events: none;
      opacity: .08;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.92' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E");
      animation: capriNoise .2s steps(2) infinite;
    }

    #capriFlight {
      position: fixed;
      z-index: 5;
      left: 0;
      top: 0;
      width: clamp(210px, 30vw, 390px);
      height: min(78vh, 560px);
      opacity: 0;
      pointer-events: none;
      transform: translate3d(-50%, -50%, 0);
      transform-origin: center center;
      will-change: transform, opacity, filter;
      filter:
        drop-shadow(0 0 18px var(--capri-magenta))
        drop-shadow(0 0 10px var(--capri-green));
    }

    #capriCanvas {
      display: block;
      width: 100%;
      height: 100%;
      overflow: visible;
    }

    .capri-glitch-flash {
      position: absolute;
      z-index: 7;
      inset: 0;
      pointer-events: none;
      opacity: 0;
      background: linear-gradient(
        90deg,
        transparent 10%,
        color-mix(in srgb, var(--capri-magenta) 25%, transparent) 12%,
        transparent 16%,
        transparent 70%,
        color-mix(in srgb, var(--capri-green) 20%, transparent) 73%,
        transparent 78%
      );
      mix-blend-mode: screen;
    }

    #myrloreSecretOverlay.capri-impact .capri-glitch-flash {
      animation: capriImpact .38s steps(1) both;
    }

    @keyframes capriNoise {
      0% { transform: translate(0, 0); }
      50% { transform: translate(-2%, 1%); }
      100% { transform: translate(1%, -1%); }
    }

    @keyframes capriImpact {
      0% { opacity: 0; }
      15% { opacity: .8; }
      35% { opacity: .08; }
      55% { opacity: .55; }
      100% { opacity: 0; }
    }

    @media (min-width: 651px) {
      #myrloreSecretOverlay .secret-inner {
        width: min(560px, 48vw);
        margin-left: 35vw;
      }
    }

    @media (max-width: 650px) {
      #capriFlight {
        width: min(58vw, 245px);
        height: min(46vh, 320px);
      }

      #myrloreSecretOverlay .secret-inner {
        width: 94vw;
        padding-top: 170px;
      }

      #myrloreSecretOverlay h2 {
        font-size: clamp(38px, 12vw, 62px);
      }

      #myrloreSecretOverlay p {
        font-size: 9px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      #myrloreSecretOverlay,
      #myrloreSecretOverlay .secret-inner {
        transition: none;
      }

      #myrloreSecretOverlay .secret-noise {
        animation: none;
      }
    }
  `;

  document.head.appendChild(secretStyle);

  const secretOverlay = document.createElement("div");

  secretOverlay.id = "myrloreSecretOverlay";
  secretOverlay.setAttribute("aria-hidden", "true");

  secretOverlay.innerHTML = `
    <div class="secret-noise"></div>
    <div class="capri-glitch-flash"></div>

    <div id="capriFlight" aria-hidden="true">
      <canvas id="capriCanvas"></canvas>
    </div>

    <div class="secret-inner">
      <div class="secret-index">
        MYRLORE® / RESTRICTED ARCHIVE
      </div>

      <span class="secret-symbol">✳</span>

      <h2>Stay curious.</h2>

      <p>
        YOU FOUND SOMETHING THAT WASN'T MEANT TO BE FOUND.<br>
        INDEPENDENT BY NATURE. CREATIVE BY DESIGN.
      </p>

      <button type="button" id="secretClose">
        RETURN TO THE STUDIO
      </button>
    </div>
  `;

  document.body.appendChild(secretOverlay);

  const capriFlight = $("#capriFlight", secretOverlay);
  const secretCloseButton = $("#secretClose", secretOverlay);

  capriCanvas = $("#capriCanvas", secretOverlay);

  capriContext = capriCanvas?.getContext("2d", {
    alpha: true
  });

  /* ==========================================
     CAPRI SPRITE SHEET + COLOUR EXTRACTION

     4 columns × 4 rows = 16 animation frames.
  ========================================== */

  function rgbToHex(r, g, b) {
    return "#" + [r, g, b]
      .map(value =>
        Math.max(0, Math.min(255, value))
          .toString(16)
          .padStart(2, "0")
      )
      .join("");
  }

  function extractCapriPalette(image) {
    try {
      const sample = document.createElement("canvas");
      sample.width = 140;
      sample.height = 140;

      const context = sample.getContext("2d", {
        willReadFrequently: true
      });

      context.drawImage(image, 0, 0, 140, 140);

      const pixels = context.getImageData(
        0, 0, 140, 140
      ).data;

      const colours = new Map();

      for (let i = 0; i < pixels.length; i += 16) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];

        if (a < 140) continue;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);

        const saturation = max === 0
          ? 0
          : (max - min) / max;

        if (saturation < 0.22 || max < 35) continue;

        const key = [
          Math.min(255, Math.round(r / 16) * 16),
          Math.min(255, Math.round(g / 16) * 16),
          Math.min(255, Math.round(b / 16) * 16)
        ].join(",");

        colours.set(
          key,
          (colours.get(key) || 0) + 1
        );
      }

      const sorted = [...colours.entries()]
        .sort((a, b) => b[1] - a[1]);

      const selected = [];

      for (const [colour] of sorted) {
        const rgb = colour.split(",").map(Number);

        const tooSimilar = selected.some(existing =>
          Math.sqrt(
            (rgb[0] - existing[0]) ** 2 +
            (rgb[1] - existing[1]) ** 2 +
            (rgb[2] - existing[2]) ** 2
          ) < 65
        );

        if (!tooSimilar) selected.push(rgb);
        if (selected.length === 3) break;
      }

      if (selected.length) {
        capriPalette.magenta = rgbToHex(...selected[0]);
        capriPalette.green = rgbToHex(
          ...(selected[1] || selected[0])
        );
        capriPalette.violet = rgbToHex(
          ...(selected[2] || selected[0])
        );
      }

      secretOverlay.style.setProperty(
        "--capri-magenta",
        capriPalette.magenta
      );

      secretOverlay.style.setProperty(
        "--capri-green",
        capriPalette.green
      );

      secretOverlay.style.setProperty(
        "--capri-violet",
        capriPalette.violet
      );

    } catch (error) {
      console.warn(
        "Capri palette extraction failed:",
        error
      );
    }
  }

  function getCapriFrameRect(frameIndex) {
    const frameWidth =
      capriImage.naturalWidth / CAPRI_COLUMNS;

    const frameHeight =
      capriImage.naturalHeight / CAPRI_ROWS;

    const safeIndex =
      ((frameIndex % CAPRI_FRAME_COUNT) + CAPRI_FRAME_COUNT) %
      CAPRI_FRAME_COUNT;

    const column = safeIndex % CAPRI_COLUMNS;
    const row = Math.floor(safeIndex / CAPRI_COLUMNS);

    return {
      sx: column * frameWidth,
      sy: row * frameHeight,
      sw: frameWidth,
      sh: frameHeight
    };
  }

  function drawCapriFrame(
    frameIndex = capriFrameIndex,
    offsetX = 0,
    alpha = 1
  ) {
    if (
      !capriContext ||
      !capriImage?.complete ||
      !capriCanvas.width
    ) return;

    const frame = getCapriFrameRect(frameIndex);

    capriContext.globalAlpha = alpha;

    capriContext.drawImage(
      capriImage,
      frame.sx,
      frame.sy,
      frame.sw,
      frame.sh,
      offsetX,
      0,
      capriCanvas.width,
      capriCanvas.height
    );

    capriContext.globalAlpha = 1;
  }

  function loadCapri() {
    if (capriImage) return;

    capriImage = new Image();
    capriImage.decoding = "async";

    capriImage.onload = () => {
      if (!capriCanvas || !capriContext) return;

      const frameWidth = Math.floor(
        capriImage.naturalWidth / CAPRI_COLUMNS
      );

      const frameHeight = Math.floor(
        capriImage.naturalHeight / CAPRI_ROWS
      );

      if (!frameWidth || !frameHeight) {
        console.error(
          "Capri sprite sheet has invalid dimensions."
        );
        return;
      }

      capriCanvas.width = frameWidth;
      capriCanvas.height = frameHeight;

      capriFrameIndex = 0;

      extractCapriPalette(capriImage);
      drawCapriClean();
    };

    capriImage.onerror = () => {
      console.error(
        "Capri sprite sheet could not load. Make sure capri-spritesheet.png is in the website root folder."
      );
    };

    capriImage.src = "capri-spritesheet.png";
  }

  function drawCapriClean() {
    if (
      !capriContext ||
      !capriImage?.complete ||
      !capriCanvas.width
    ) return;

    capriContext.clearRect(
      0,
      0,
      capriCanvas.width,
      capriCanvas.height
    );

    capriContext.globalAlpha = 1;
    capriContext.globalCompositeOperation = "source-over";

    drawCapriFrame(capriFrameIndex);
  }

  function updateCapriFrame(timestamp) {
    if (!capriImage?.complete) return;

    if (!capriLastFrameTime) {
      capriLastFrameTime = timestamp;
    }

    if (
      timestamp - capriLastFrameTime >=
      CAPRI_FRAME_INTERVAL
    ) {
      const steps = Math.floor(
        (timestamp - capriLastFrameTime) /
        CAPRI_FRAME_INTERVAL
      );

      capriFrameIndex =
        (capriFrameIndex + steps) % CAPRI_FRAME_COUNT;

      capriLastFrameTime = timestamp;
    }
  }

  loadCapri();

  /* ==========================================
     CAPRI GLITCH ENGINE
  ========================================== */

  function drawCapriGlitch(intensity) {
    if (
      !capriContext ||
      !capriImage?.complete ||
      !capriCanvas.width
    ) return;

    const ctx = capriContext;
    const width = capriCanvas.width;
    const height = capriCanvas.height;

    const burst = Math.max(
      0,
      Math.min(1, intensity)
    );

    ctx.clearRect(0, 0, width, height);

    if (burst < 0.025) {
      drawCapriFrame(capriFrameIndex);
      return;
    }

    const frame = getCapriFrameRect(capriFrameIndex);

    ctx.globalCompositeOperation = "screen";

    drawCapriFrame(
      capriFrameIndex,
      -5 * burst,
      0.12 * burst
    );

    drawCapriFrame(
      capriFrameIndex,
      5 * burst,
      0.1 * burst
    );

    ctx.globalCompositeOperation = "source-over";

    drawCapriFrame(capriFrameIndex);

    const sliceCount = Math.floor(
      5 + burst * 12
    );

    const sliceHeight = height / sliceCount;

    for (let i = 0; i < sliceCount; i++) {
      if (Math.random() > 0.35 + burst * 0.4) continue;

      const sy = i * sliceHeight;
      const sh = Math.min(
        sliceHeight + 1,
        height - sy
      );

      const shift =
        (Math.random() - 0.5) * 28 * burst;

      ctx.drawImage(
        capriImage,
        frame.sx,
        frame.sy + (sy / height) * frame.sh,
        frame.sw,
        (sh / height) * frame.sh,
        shift,
        sy,
        width,
        sh
      );
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  /* ==========================================
     CAPRI — CINEMATIC FLIGHT PATH
  ========================================== */

  function cubicBezierPoint(p0, p1, p2, p3, t) {
    const inverse = 1 - t;

    return (
      inverse ** 3 * p0 +
      3 * inverse ** 2 * t * p1 +
      3 * inverse * t ** 2 * p2 +
      t ** 3 * p3
    );
  }

  function getCapriPosition(progress) {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const mobile = width <= 650;

    const startX = width * -0.18;
    const startY = height * 0.82;

    const endX = mobile
      ? width * 0.5
      : width * 0.36;

    const endY = mobile
      ? height * 0.27
      : height * 0.52;

    const paths = [
      {
        from: [startX, startY],
        control1: [width * 0.08, height * 0.05],
        control2: [width * 0.35, height * 0.12],
        to: [width * 0.54, height * 0.24]
      },
      {
        from: [width * 0.54, height * 0.24],
        control1: [width * 0.85, height * 0.02],
        control2: [width * 1.02, height * 0.62],
        to: [width * 0.76, height * 0.76]
      },
      {
        from: [width * 0.76, height * 0.76],
        control1: [width * 0.53, height * 1.02],
        control2: [width * 0.16, height * 0.86],
        to: [endX, endY]
      }
    ];

    const pathProgress = Math.min(
      0.9999,
      Math.max(0, progress) * 3
    );

    const segment = Math.min(
      2,
      Math.floor(pathProgress)
    );

    const localProgress = pathProgress - segment;
    const path = paths[segment];

    const x = cubicBezierPoint(
      path.from[0],
      path.control1[0],
      path.control2[0],
      path.to[0],
      localProgress
    );

    const y = cubicBezierPoint(
      path.from[1],
      path.control1[1],
      path.control2[1],
      path.to[1],
      localProgress
    );

    const settle = Math.max(
      0,
      Math.min(1, (progress - 0.76) / 0.24)
    );

    const easeSettle =
      settle * settle * (3 - 2 * settle);

    const scale = 0.72 +
      ((mobile ? 0.64 : 0.88) - 0.72) *
      easeSettle;

    const rotation =
      Math.sin(progress * Math.PI * 5) * 12 *
      (1 - easeSettle);

    const opacity = Math.min(
      1,
      progress * 7,
      (1 - progress) * 9 + 0.35
    );

    const glitch = Math.max(
      0,
      Math.sin(progress * Math.PI * 12) *
      (1 - easeSettle) * 0.65
    );

    return {
      x,
      y,
      scale,
      rotation,
      opacity,
      glitch,
      settle: easeSettle
    };
  }

  /* ==========================================
     CAPRI — ANIMATION LOOP
  ========================================== */

  const CAPRI_FLIGHT_DURATION = 5600;

  function animateCapri(timestamp) {
    if (!secretActive) return;

    if (!capriAnimationStart) {
      capriAnimationStart = timestamp;
    }

    const elapsed = timestamp - capriAnimationStart;

    const progress = Math.min(
      1,
      elapsed / CAPRI_FLIGHT_DURATION
    );

    const position = getCapriPosition(progress);

    updateCapriFrame(timestamp);

    if (capriFlight) {
      capriFlight.style.opacity = position.opacity;

      capriFlight.style.transform = `
        translate3d(
          ${position.x}px,
          ${position.y}px,
          0
        )
        translate(-50%, -50%)
        rotate(${position.rotation}deg)
        scale(${position.scale})
      `;

      capriFlight.style.filter = `
        drop-shadow(
          0 0 ${18 + position.glitch * 20}px
          var(--capri-magenta)
        )
        drop-shadow(
          0 0 ${10 + position.glitch * 12}px
          var(--capri-green)
        )
      `;
    }

    drawCapriGlitch(position.glitch);

    if (progress < 1) {
      capriAnimationFrame =
        requestAnimationFrame(animateCapri);
    } else {
      capriFlight.style.opacity = "1";

      capriFlight.style.transform = `
        translate3d(
          ${position.x}px,
          ${position.y}px,
          0
        )
        translate(-50%, -50%)
        rotate(0deg)
        scale(${position.scale})
      `;

      drawCapriClean();
      capriAnimationFrame = null;
    }
  }

  /* ==========================================
     CAPRI — OPEN SECRET ARCHIVE
  ========================================== */

  function activateSecretArchive() {
    if (secretActive) return;

    secretActive = true;
    secretPreviousFocus = document.activeElement;

    secretOverlay.classList.add("active");
    secretOverlay.setAttribute("aria-hidden", "false");
    secretOverlay.removeAttribute("inert");

    body.style.overflow = "hidden";

    capriAnimationStart = 0;
    capriLastFrameTime = 0;
    capriFrameIndex = 0;

    if (capriFlight) {
      capriFlight.style.opacity = "0";
      capriFlight.style.transform =
        "translate3d(-50%, -50%, 0) scale(.6)";
    }

    drawCapriClean();

    secretOverlay.classList.remove("capri-impact");

    requestAnimationFrame(() => {
      secretOverlay.classList.add("capri-impact");
    });

    setTimeout(() => {
      if (!secretActive) return;

      secretCloseButton?.focus();

      if (reducedMotion) {
        const position = getCapriPosition(1);

        capriFlight.style.opacity = "1";

        capriFlight.style.transform = `
          translate3d(
            ${position.x}px,
            ${position.y}px,
            0
          )
          translate(-50%, -50%)
          scale(${position.scale})
        `;

        drawCapriClean();
        return;
      }

      cancelAnimationFrame(capriAnimationFrame);

      capriAnimationFrame =
        requestAnimationFrame(animateCapri);

    }, 250);

    console.log("MYRLORE® — SECRET ARCHIVE UNLOCKED");
  }

  /* ==========================================
     CAPRI — CLOSE SECRET ARCHIVE
  ========================================== */

  function closeSecretArchive() {
    if (!secretActive) return;

    secretActive = false;

    cancelAnimationFrame(capriAnimationFrame);

    capriAnimationFrame = null;
    capriAnimationStart = 0;
    capriLastFrameTime = 0;

    secretOverlay.classList.remove("active");
    secretOverlay.classList.remove("capri-impact");

    secretOverlay.setAttribute("aria-hidden", "true");
    secretOverlay.setAttribute("inert", "");

    body.style.overflow = "";

    if (capriFlight) {
      capriFlight.style.opacity = "0";
    }

    if (secretPreviousFocus?.focus) {
      secretPreviousFocus.focus();
    }
  }

  secretCloseButton?.addEventListener(
    "click",
    closeSecretArchive
  );

  /* ==========================================
     KONAMI CODE DETECTION
  ========================================== */

  document.addEventListener("keydown", event => {
    if (secretActive) return;

    const key = event.key.length === 1
      ? event.key.toLowerCase()
      : event.key;

    if (key === konamiSequence[konamiPosition]) {
      konamiPosition++;

      if (konamiPosition === konamiSequence.length) {
        konamiPosition = 0;
        activateSecretArchive();
      }
    } else {
      konamiPosition =
        key === konamiSequence[0] ? 1 : 0;
    }
  });

  /* ==========================================
     GLOBAL ESCAPE HANDLING
  ========================================== */

  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;

    if (secretActive) {
      closeSecretArchive();
      return;
    }

    if (caseModal?.classList.contains("is-open")) {
      closeCaseStudy();
      return;
    }

    if (menuPanel?.classList.contains("open")) {
      closeMenu();
    }
  });

  /* ==========================================
     INITIAL ACCESSIBILITY STATES
  ========================================== */

  if (menuPanel) {
    menuPanel.setAttribute("aria-hidden", "true");
    menuPanel.setAttribute("inert", "");
  }

  if (caseModal) {
    caseModal.setAttribute("aria-hidden", "true");
    caseModal.setAttribute("inert", "");
  }

  secretOverlay.setAttribute("aria-hidden", "true");
  secretOverlay.setAttribute("inert", "");

  menuToggle?.setAttribute("aria-expanded", "false");

  /* ==========================================
     MYRLORE® — SYSTEM READY
  ========================================== */

  console.log(
    "%cMYRLORE®",
    "font-size:22px;font-weight:800;letter-spacing:5px;color:#c6b69a;"
  );

  console.log(
    "%cIndependent by nature. Creative by design.",
    "font-size:11px;color:#85868a;letter-spacing:2px;"
  );

  console.log(
    "%cSecret archive: ↑ ↑ ↓ ↓ ← → ← → B A",
    "font-size:10px;color:#c6b69a;"
  );

})();
