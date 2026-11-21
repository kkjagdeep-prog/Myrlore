
/* ==========================================
   MYRLORE® — MAIN INTERACTION SYSTEM
   A2 CHROME SCULPTURE · GSAP · UI
   CAPRI SECRET ARCHIVE
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

      if (transitionCurtain) {
        timeline.to(transitionCurtain, {
          scaleY: 1,
          duration: 0.65,
          ease: "power4.inOut",
          transformOrigin: "bottom center"
        });
      }

      if (transitionContent) {
        timeline.to(transitionContent, {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: "power2.out"
        }, "-=0.1");
      }

      if (transitionProgress) {
        timeline.to(transitionProgress, {
          scaleX: 1,
          duration: 0.7,
          ease: "power2.inOut"
        }, "-=0.1");
      }

      if (!transitionCurtain && !transitionContent && !transitionProgress) {
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

    const texture = pmrem.fromScene(environmentScene, 0.04).texture;

    pmrem.dispose();

    return texture;
  }

  /* ONE SHARED THREE.JS ANIMATION LOOP */

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
      THREE = await import("three");

      const { RectAreaLightUniformsLib } =
        await import("three/addons/lights/RectAreaLightUniformsLib.js");

      RectAreaLightUniformsLib.init();

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

      const areaLight = new THREE.RectAreaLight(0xffffff, 6, 5, 2);
      areaLight.position.set(0, 4, 4);
      areaLight.lookAt(0, 0, 0);
      scene.add(areaLight);

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
      const particlePositions = new Float32Array(particleCount * 3);

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
      console.error("MYRLORE sculpture initialisation failed:", error);

      if (canvas) canvas.style.opacity = "0";
    }
  }

  /* LAZY LOAD SCULPTURE */

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

  /* TAB VISIBILITY */

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
     LIVE CANVAS · REAL FRAGMENT DISPLACEMENT
     IMAGE-SAMPLED COLOURS · SCREEN BREAKTHROUGH
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
  let capriCanvas = null;
  let capriContext = null;

  let capriPalette = [
    "rgb(144,0,48)",
    "rgb(0,144,48)",
    "rgb(96,0,72)"
  ];

  let capriTintCanvases = [];

  const secretStyle = document.createElement("style");

  secretStyle.textContent = `
    #myrloreSecretOverlay {
      position: fixed;
      inset: 0;
      z-index: 999999;
      display: grid;
      place-items: center;
      overflow: hidden;
      padding: 24px;
      isolation: isolate;
      perspective: 1200px;
      background:
        radial-gradient(
          ellipse at 50% 48%,
          rgba(144,0,48,.10),
          transparent 48%
        ),
        #050608;
      color: #eeeDE8;
      opacity: 0;
      visibility: hidden;
      transition:
        opacity .4s ease,
        visibility .4s ease;
      font-family: "Manrope", sans-serif;
    }

    #myrloreSecretOverlay.active {
      opacity: 1;
      visibility: visible;
    }

    #myrloreSecretOverlay::before {
      content: "";
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      opacity: .13;
      background-image:
        linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px);
      background-size: 4px 4px;
    }

    #myrloreSecretOverlay::after {
      content: "";
      position: absolute;
      inset: 0;
      z-index: 8;
      pointer-events: none;
      opacity: 0;
      background:
        repeating-linear-gradient(
          0deg,
          transparent 0px,
          transparent 3px,
          rgba(144,0,48,.08) 4px
        );
    }

    #myrloreSecretOverlay.active::after {
      animation: capriScanlines 4.2s steps(1) both;
    }

    #myrloreSecretOverlay .secret-noise {
      position: absolute;
      inset: -50%;
      z-index: 1;
      pointer-events: none;
      opacity: .075;
      background: repeating-linear-gradient(
        transparent 0px,
        transparent 3px,
        rgba(255,255,255,.18) 4px
      );
      animation: capriNoise .16s steps(2) infinite;
    }

    #myrloreSecretOverlay .secret-inner {
      position: relative;
      z-index: 3;
      width: min(650px, 90vw);
      text-align: center;
      opacity: 0;
      transform: translateY(18px);
      transition:
        opacity .8s ease .5s,
        transform .8s ease .5s;
    }

    #myrloreSecretOverlay.active .secret-inner {
      opacity: 1;
      transform: translateY(0);
    }

    #myrloreSecretOverlay .secret-index {
      color: #c6b69a;
      font: 10px "DM Mono", monospace;
      letter-spacing: .3em;
      margin-bottom: 26px;
    }

    #myrloreSecretOverlay h2 {
      margin: 0;
      color: #eeeDE8;
      font-size: clamp(42px, 8vw, 84px);
      font-weight: 500;
      letter-spacing: -.075em;
      line-height: .95;
    }

    #myrloreSecretOverlay p {
      color: #85868a;
      font: 10px "DM Mono", monospace;
      letter-spacing: .12em;
      line-height: 2;
      margin: 26px 0;
    }

    #myrloreSecretOverlay button {
      position: relative;
      z-index: 10;
      margin-top: 14px;
      padding: 13px 24px;
      border: 1px solid rgba(198,182,154,.45);
      background: transparent;
      color: #c6b69a;
      font: 10px "DM Mono", monospace;
      letter-spacing: .16em;
      cursor: pointer;
      transition:
        background .3s ease,
        color .3s ease,
        border-color .3s ease;
    }

    #myrloreSecretOverlay button:hover {
      background: #c6b69a;
      color: #08090b;
      border-color: #c6b69a;
    }

    #myrloreSecretOverlay .secret-symbol {
      display: block;
      color: #c6b69a;
      font-size: 28px;
      margin-bottom: 20px;
    }

    /* THE CHARACTER CANVAS */

    #capriFlight {
      position: fixed;
      z-index: 5;
      left: 115%;
      top: 20%;
      width: clamp(190px, 29vw, 360px);
      height: min(76vh, 490px);
      opacity: 0;
      pointer-events: none;
      transform:
        translate(-50%, -50%)
        scale(.5);
      transform-origin: center;
      will-change: left, top, transform, opacity, filter;
      filter: drop-shadow(0 0 20px rgba(144,0,48,.22));
    }

    #capriCanvas {
      display: block;
      width: 100%;
      height: 100%;
      overflow: visible;
    }

    #capriFlight.capri-visible {
      opacity: 1;
    }

    #capriFlight.capri-settled {
      filter:
        drop-shadow(0 0 18px rgba(144,0,48,.22))
        drop-shadow(0 0 12px rgba(0,144,48,.12));
    }

    .capri-glitch-flash {
      position: absolute;
      z-index: 7;
      inset: 0;
      pointer-events: none;
      opacity: 0;
      background:
        linear-gradient(
          90deg,
          transparent 0 13%,
          rgba(144,0,48,.2) 13% 16%,
          transparent 16% 48%,
          rgba(0,144,48,.16) 48% 51%,
          transparent 51% 82%,
          rgba(96,0,72,.18) 82% 85%,
          transparent 85%
        );
      mix-blend-mode: screen;
    }

    #myrloreSecretOverlay.active .capri-glitch-flash {
      animation: capriFlash 4.2s steps(1) both;
    }

    @keyframes capriNoise {
      0% { transform: translate(0, 0); }
      50% { transform: translate(-2%, 1%); }
      100% { transform: translate(1%, -1%); }
    }

    @keyframes capriFlash {
      0%, 100% { opacity: 0; }
      8%, 19%, 31%, 45%, 58%, 70%, 82% {
        opacity: .8;
      }
      9%, 20%, 32%, 46%, 59%, 71%, 83% {
        opacity: 0;
      }
      88% { opacity: 1; }
      91% { opacity: 0; }
    }

    @keyframes capriScanlines {
      0%, 100% { opacity: 0; }
      8%, 19%, 31%, 45%, 58%, 70%, 82% {
        opacity: .4;
      }
      9%, 20%, 32%, 46%, 59%, 71%, 83% {
        opacity: 0;
      }
    }

    @media (max-width: 650px) {
      #capriFlight {
        width: min(55vw, 230px);
        height: min(43vh, 310px);
      }

      #myrloreSecretOverlay .secret-inner {
        width: 94vw;
        padding-top: 155px;
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

      #myrloreSecretOverlay .secret-noise,
      #myrloreSecretOverlay.active::after,
      #myrloreSecretOverlay.active .capri-glitch-flash {
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
     LOAD CAPRI IMAGE
  ========================================== */

  function extractCapriPalette(image) {
    try {
      const sample = document.createElement("canvas");

      sample.width = 100;
      sample.height = 100;

      const context = sample.getContext("2d", {
        willReadFrequently: true
      });

      context.drawImage(image, 0, 0, 100, 100);

      const pixels = context.getImageData(
        0, 0, 100, 100
      ).data;

      const colours = new Map();

      for (let i = 0; i < pixels.length; i += 16) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];

        if (a < 150) continue;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);

        const saturation = max === 0
          ? 0
          : (max - min) / max;

        if (saturation < .4 || max < 55) continue;

        const qr = Math.round(r / 24) * 24;
        const qg = Math.round(g / 24) * 24;
        const qb = Math.round(b / 24) * 24;

        const key = [
          Math.min(255, qr),
          Math.min(255, qg),
          Math.min(255, qb)
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

        const tooSimilar = selected.some(existing => {
          const distance = Math.sqrt(
            (rgb[0] - existing[0]) ** 2 +
            (rgb[1] - existing[1]) ** 2 +
            (rgb[2] - existing[2]) ** 2
          );

          return distance < 85;
        });

        if (!tooSimilar) selected.push(rgb);
        if (selected.length === 3) break;
      }

      if (selected.length) {
        capriPalette = selected.map(rgb =>
          `rgb(${rgb.join(",")})`
        );
      }

    } catch (error) {
      console.warn(
        "Capri palette extraction unavailable:",
        error
      );
    }
  }

  function createTintLayers() {
    capriTintCanvases = [];

    if (!capriImage || !capriCanvas) return;

    capriPalette.forEach(colour => {
      const layer = document.createElement("canvas");

      layer.width = capriImage.naturalWidth;
      layer.height = capriImage.naturalHeight;

      const context = layer.getContext("2d");

      context.drawImage(
        capriImage,
        0,
        0,
        layer.width,
        layer.height
      );

      context.globalCompositeOperation = "source-atop";
      context.fillStyle = colour;
      context.fillRect(0, 0, layer.width, layer.height);

      context.globalCompositeOperation = "source-over";

      capriTintCanvases.push(layer);
    });
  }

  function loadCapri() {
    if (capriImage) return;

    capriImage = new Image();
    capriImage.decoding = "async";

    capriImage.onload = () => {
      if (!capriCanvas || !capriContext) return;

      capriCanvas.width = capriImage.naturalWidth;
      capriCanvas.height = capriImage.naturalHeight;

      extractCapriPalette(capriImage);
      createTintLayers();

      drawCapriClean();
    };

    capriImage.onerror = () => {
      console.error(
        "Capri could not load. Check that capri.png is in the website root folder."
      );
    };

    capriImage.src = "capri.png";
  }

  function drawCapriClean() {
    if (!capriContext || !capriImage?.complete) return;

    capriContext.clearRect(
      0,
      0,
      capriCanvas.width,
      capriCanvas.height
    );

    capriContext.drawImage(
      capriImage,
      0,
      0,
      capriCanvas.width,
      capriCanvas.height
    );
  }

  loadCapri();

  /* ==========================================
     LIVE GLITCH RENDERER

     Each frame is redrawn from the original.
     Individual horizontal fragments move
     independently instead of moving copies
     of the complete PNG.
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

    ctx.clearRect(0, 0, width, height);

    if (intensity <= .015) {
      drawCapriClean();
      return;
    }

    const burst = intensity;
    const sliceCount = 34;
    const sliceHeight = height / sliceCount;

    /* Palette-based colour separation */

    if (capriTintCanvases.length) {
      const ghostOffset = 5 + burst * 19;

      ctx.globalAlpha = .16 + burst * .22;
      ctx.globalCompositeOperation = "screen";

      ctx.drawImage(
        capriTintCanvases[0],
        -ghostOffset,
        0,
        width,
        height
      );

      if (capriTintCanvases[1]) {
        ctx.globalAlpha = .12 + burst * .2;

        ctx.drawImage(
          capriTintCanvases[1],
          ghostOffset * 1.3,
          0,
          width,
          height
        );
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }

    /* Independently displaced image fragments */

    for (let i = 0; i < sliceCount; i++) {
      const sy = i * sliceHeight;
      const sh = Math.min(sliceHeight + 1, height - sy);

      const activeSlice = Math.random() < .72;

      const displacement = activeSlice
        ? (Math.random() - .5) * 2 * 48 * burst
        : 0;

      const verticalShift =
        activeSlice && Math.random() < .12
          ? (Math.random() - .5) * 12 * burst
          : 0;

      ctx.drawImage(
        capriImage,
        0, sy, width, sh,
        displacement,
        sy + verticalShift,
        width,
        sh
      );
    }

    /* Sharp coloured digital tears */

    const tearCount = Math.floor(2 + burst * 12);

    for (let i = 0; i < tearCount; i++) {
      const y = Math.random() * height;
      const tearHeight = 1 + Math.random() * 9 * burst;
      const tearWidth = width * (.12 + Math.random() * .7);
      const x = Math.random() * (width - tearWidth);

      ctx.globalAlpha = .25 + Math.random() * .45;

      ctx.fillStyle = capriPalette[
        Math.floor(Math.random() * capriPalette.length)
      ];

      ctx.fillRect(x, y, tearWidth, tearHeight);
    }

    /* Sudden horizontal displacement */

    if (Math.random() < .35 * burst) {
      const y = Math.random() * height;
      const h = 3 + Math.random() * 22 * burst;
      const shift = (Math.random() - .5) * 90 * burst;

      ctx.globalAlpha = .9;

      ctx.drawImage(
        capriImage,
        0, y, width, h,
        shift, y, width, h
      );
    }

    /* Brief digital interruptions */

    if (Math.random() < .16 * burst) {
      ctx.globalAlpha = .55;
      ctx.fillStyle = "#050608";

      ctx.fillRect(
        Math.random() * width,
        Math.random() * height,
        width * (.1 + Math.random() * .5),
        2 + Math.random() * 8
      );
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  /* ==========================================
     CAPRI MOVEMENT PATH
  ========================================== */

  const capriWaypoints = [
    { x: 115, y: 18, scale: .45, rotation: 18 },
    { x: 88, y: 22, scale: .82, rotation: -13 },
    { x: 18, y: 15, scale: .95, rotation: 12 },
    { x: 9, y: 72, scale: .82, rotation: -17 },
    { x: 68, y: 87, scale: 1.02, rotation: 15 },
    { x: 93, y: 45, scale: .88, rotation: -12 },
    { x: 54, y: 13, scale: 1.02, rotation: 10 },
    { x: 40, y: 52, scale: 1.08, rotation: -8 },
    { x: 50, y: 50, scale: 2.55, rotation: 0 },
    { x: 30, y: 50, scale: 1.02, rotation: -3 },
    { x: 30, y: 50, scale: 1, rotation: 0 }
  ];

  function smoothProgress(value) {
    return value * value * (3 - 2 * value);
  }

  function getCapriPosition(progress) {
    const segmentCount = capriWaypoints.length - 1;

    const scaled = progress * segmentCount;

    const index = Math.min(
      segmentCount - 1,
      Math.floor(scaled)
    );

    const local = smoothProgress(scaled - index);

    const a = capriWaypoints[index];
    const b = capriWaypoints[index + 1];

    return {
      x: a.x + (b.x - a.x) * local,
      y: a.y + (b.y - a.y) * local,
      scale: a.scale + (b.scale - a.scale) * local,
      rotation: a.rotation + (b.rotation - a.rotation) * local
    };
  }

  function getGlitchIntensity(progress) {
    const bursts = [
      [0.02, 0.15],
      [0.19, 0.25],
      [0.31, 0.37],
      [0.44, 0.51],
      [0.57, 0.64],
      [0.70, 0.76],
      [0.81, 0.94]
    ];

    let intensity = 0;

    bursts.forEach(([start, end]) => {
      if (progress >= start && progress <= end) {
        const local = (progress - start) / (end - start);
        const strength = Math.sin(local * Math.PI);

        intensity = Math.max(intensity, strength);
      }
    });

    return intensity;
  }

  /* ==========================================
     CAPRI ANIMATION LOOP
  ========================================== */

  function animateCapri(timestamp) {
    if (!secretActive || !capriFlight) return;

    if (!capriAnimationStart) {
      capriAnimationStart = timestamp;
    }

    const elapsed = timestamp - capriAnimationStart;
    const duration = 4200;

    const progress = reducedMotion
      ? 1
      : Math.min(1, elapsed / duration);

    const position = getCapriPosition(progress);

    const mobile = window.matchMedia(
      "(max-width: 650px)"
    ).matches;

    const finalX = mobile ? 50 : 30;
    const finalY = mobile ? 27 : 50;

    const adjustedX = progress >= .94
      ? finalX
      : position.x;

    const adjustedY = progress >= .94
      ? finalY
      : position.y;

    let scale = position.scale;

    if (progress >= 1) {
      scale = mobile ? .82 : .96;
    }

    capriFlight.style.left = `${adjustedX}%`;
    capriFlight.style.top = `${adjustedY}%`;

    capriFlight.style.transform = `
      translate(-50%, -50%)
      scale(${scale})
      rotate(${position.rotation}deg)
    `;

    capriFlight.style.opacity =
      progress < .015
        ? String(progress / .015)
        : "1";

    const intensity = reducedMotion
      ? 0
      : getGlitchIntensity(progress);

    drawCapriGlitch(intensity);

    /* Screen breakthrough */

    if (progress > .84 && progress < .92) {
      const pop = (progress - .84) / .08;

      capriFlight.style.filter = `
        blur(${pop * 1.5}px)
        drop-shadow(0 0 ${20 + pop * 45}px ${capriPalette[0]})
      `;
    } else if (progress >= .92) {
      capriFlight.style.filter = `
        drop-shadow(0 0 18px ${capriPalette[0]})
        drop-shadow(0 0 12px ${capriPalette[1] || "#009030"})
      `;
    } else {
      capriFlight.style.filter = `
        drop-shadow(0 0 18px ${capriPalette[0]})
      `;
    }

    if (progress < 1) {
      capriAnimationFrame = requestAnimationFrame(
        animateCapri
      );
    } else {
      capriFlight.classList.add("capri-settled");

      drawCapriClean();

      capriFlight.style.left = `${finalX}%`;
      capriFlight.style.top = `${finalY}%`;
      capriFlight.style.opacity = "1";

      capriFlight.style.transform = `
        translate(-50%, -50%)
        scale(${mobile ? .82 : .96})
      `;
    }
  }

  function startCapriAnimation() {
    cancelAnimationFrame(capriAnimationFrame);

    capriAnimationStart = 0;

    capriFlight.classList.remove("capri-settled");
    capriFlight.classList.add("capri-visible");

    capriFlight.style.left = "115%";
    capriFlight.style.top = "18%";
    capriFlight.style.opacity = "0";
    capriFlight.style.filter = "none";

    capriFlight.style.transform =
      "translate(-50%, -50%) scale(.45)";

    drawCapriClean();

    if (reducedMotion) {
      const mobile = window.matchMedia(
        "(max-width: 650px)"
      ).matches;

      capriFlight.style.left = mobile ? "50%" : "30%";
      capriFlight.style.top = mobile ? "27%" : "50%";
      capriFlight.style.opacity = "1";

      capriFlight.style.transform =
        `translate(-50%, -50%) scale(${mobile ? .82 : .96})`;

      return;
    }

    capriAnimationFrame = requestAnimationFrame(
      animateCapri
    );
  }

  /* ==========================================
     OPEN / CLOSE SECRET ARCHIVE
  ========================================== */

  function closeSecret() {
    if (!secretActive) return;

    secretActive = false;

    cancelAnimationFrame(capriAnimationFrame);
    capriAnimationFrame = null;

    secretOverlay.classList.remove("active");
    secretOverlay.setAttribute("aria-hidden", "true");

    capriFlight.classList.remove(
      "capri-visible",
      "capri-settled"
    );

    body.classList.remove("myrlore-secret");

    if (secretPreviousFocus?.focus) {
      secretPreviousFocus.focus();
    }
  }

  function activateSecret() {
    if (secretActive) return;

    secretActive = true;
    secretPreviousFocus = document.activeElement;

    body.classList.add("myrlore-secret");

    secretOverlay.classList.remove("active");

    void secretOverlay.offsetWidth;

    secretOverlay.classList.add("active");
    secretOverlay.setAttribute("aria-hidden", "false");

    startCapriAnimation();

    secretCloseButton?.focus();

    console.log(
      "%c MYRLORE® — CAPRI ARCHIVE UNLOCKED ",
      "background:#900030;color:#ffffff;padding:10px;font-weight:bold;"
    );
  }

  secretCloseButton?.addEventListener(
    "click",
    closeSecret
  );

  secretOverlay.addEventListener("click", event => {
    if (event.target === secretOverlay) {
      closeSecret();
    }
  });

  document.addEventListener("keydown", event => {
    if (secretActive) {
      if (event.key === "Escape") closeSecret();
      return;
    }

    if (
      event.target instanceof HTMLElement &&
      (
        event.target.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(
          event.target.tagName
        )
      )
    ) return;

    const expected = konamiSequence[konamiPosition];

    const pressed = event.key.length === 1
      ? event.key.toLowerCase()
      : event.key;

    if (pressed === expected) {
      konamiPosition++;

      if (konamiPosition === konamiSequence.length) {
        konamiPosition = 0;
        activateSecret();
      }
    } else {
      konamiPosition =
        pressed === konamiSequence[0] ? 1 : 0;
    }
  });

  /* ==========================================
     OPTIONAL CHROME RESONANCE
  ========================================== */

  let audioContext = null;
  let audioEnabled = false;

  function playResonance() {
    if (!audioEnabled) return;

    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) return;

      audioContext ??= new AudioContextClass();

      if (audioContext.state === "suspended") {
        audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.type = "sine";

      oscillator.frequency.setValueAtTime(
        440,
        audioContext.currentTime
      );

      oscillator.frequency.exponentialRampToValueAtTime(
        660,
        audioContext.currentTime + 0.35
      );

      gain.gain.setValueAtTime(
        0.0001,
        audioContext.currentTime
      );

      gain.gain.exponentialRampToValueAtTime(
        0.045,
        audioContext.currentTime + 0.04
      );

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        audioContext.currentTime + 0.7
      );

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.72);

    } catch (error) {
      console.warn("MYRLORE audio unavailable:", error);
    }
  }

  if (!touchDevice) {
    const soundToggle = document.createElement("button");

    soundToggle.type = "button";
    soundToggle.className = "sound-toggle";
    soundToggle.textContent = "SOUND OFF";
    soundToggle.setAttribute("aria-pressed", "false");
    soundToggle.setAttribute("aria-label", "Enable interface sounds");

    soundToggle.style.cssText = `
      position: fixed;
      left: 28px;
      bottom: 25px;
      z-index: 90;
      padding: 10px 12px;
      border: 1px solid rgba(198,182,154,.25);
      background: rgba(8,9,11,.75);
      color: #c6b69a;
      font: 8px "DM Mono", monospace;
      letter-spacing: .12em;
      cursor: pointer;
      backdrop-filter: blur(10px);
    `;

    document.body.appendChild(soundToggle);

    soundToggle.addEventListener("click", () => {
      audioEnabled = !audioEnabled;

      soundToggle.textContent =
        audioEnabled ? "SOUND ON" : "SOUND OFF";

      soundToggle.setAttribute(
        "aria-pressed",
        String(audioEnabled)
      );

      soundToggle.setAttribute(
        "aria-label",
        audioEnabled
          ? "Disable interface sounds"
          : "Enable interface sounds"
      );

      if (audioEnabled) playResonance();
    });

    $$(".work-card, .round-link, .service-trigger").forEach(element => {
      element.addEventListener("mouseenter", playResonance);
    });
  }

  /* ==========================================
     GLOBAL ESCAPE HANDLING
  ========================================== */

  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;

    closeMenu();

    if (caseModal?.classList.contains("is-open")) {
      closeCaseStudy();
    }
  });

  /* ==========================================
     INITIAL ACCESSIBILITY STATES
  ========================================== */

  if (caseModal && !caseModal.classList.contains("is-open")) {
    caseModal.setAttribute("aria-hidden", "true");
    caseModal.setAttribute("inert", "");
  }

  if (pageTransition && !pageTransition.classList.contains("active")) {
    pageTransition.setAttribute("aria-hidden", "true");
    pageTransition.setAttribute("inert", "");
  }

  if (menuPanel && !menuPanel.classList.contains("open")) {
    menuPanel.setAttribute("aria-hidden", "true");
    menuPanel.setAttribute("inert", "");
  }

  console.log(
    "%c MYRLORE® ",
    "background:#c6b69a;color:#08090b;padding:8px 12px;font-weight:bold;"
  );

  console.log(
    "%c Independent by nature. Creative by design.",
    "color:#85868a;font-size:10px;"
  );

})();
