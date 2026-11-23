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

  function getServiceTrigger(item, index) {
    return (
      $(".service-trigger", item) ||
      $(`#serviceTrigger${String(index + 1).padStart(2, "0")}`)
    );
  }

  function closeService(item, index) {
    const trigger = getServiceTrigger(item, index);
    const panel = getServicePanel(item, index);

    if (!trigger || !panel) return;

    gsapInstance?.killTweensOf(panel);

    trigger.setAttribute("aria-expanded", "false");
    item.classList.remove("is-active");

    if (panel.hidden) return;

    if (gsapInstance && !reducedMotion) {
      gsapInstance.set(panel, {
        height: panel.getBoundingClientRect().height,
        opacity: 1,
        overflow: "hidden"
      });

      gsapInstance.to(panel, {
        height: 0,
        opacity: 0,
        duration: 0.85,
        ease: "power2.inOut",
        onComplete: () => {
          panel.hidden = true;

          gsapInstance.set(panel, {
            clearProps: "height,opacity,overflow"
          });
        }
      });
    } else {
      panel.hidden = true;
      panel.style.height = "";
      panel.style.opacity = "";
      panel.style.overflow = "";
    }
  }

  function openService(item, index) {
    const trigger = getServiceTrigger(item, index);
    const panel = getServicePanel(item, index);

    if (!trigger || !panel) return;

    gsapInstance?.killTweensOf(panel);

    trigger.setAttribute("aria-expanded", "true");
    item.classList.add("is-active");

    panel.hidden = false;

    if (gsapInstance && !reducedMotion) {
      gsapInstance.set(panel, {
        height: 0,
        opacity: 0,
        overflow: "hidden"
      });

      gsapInstance.to(panel, {
        height: panel.scrollHeight,
        opacity: 1,
        duration: 1.05,
        ease: "power3.inOut",
        onComplete: () => {
          gsapInstance.set(panel, {
            height: "auto",
            opacity: 1,
            overflow: "visible"
          });
        }
      });
    } else {
      panel.style.height = "auto";
      panel.style.opacity = "1";
      panel.style.overflow = "visible";
    }
  }

  serviceItems.forEach((item, index) => {
    const trigger = getServiceTrigger(item, index);

    if (!trigger) return;

    trigger.addEventListener("click", () => {
      const isActive = item.classList.contains("is-active");

      serviceItems.forEach((other, otherIndex) => {
        if (other !== item) {
          closeService(other, otherIndex);
        }
      });

      if (isActive) {
        closeService(item, index);
      } else {
        openService(item, index);
      }
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

  let capriImage = null;
  let capriAnimationFrame = null;
  let capriGlitchInterval = null;
  let capriFlashInterval = null;

  const secretStyle = document.createElement("style");

  secretStyle.textContent = `
    #myrloreSecretOverlay {
      --capri-pink: #ff43b7;
      --capri-green: #8cff55;
      --capri-purple: #9c62ff;

      position: fixed;
      inset: 0;
      z-index: 999999;
      display: grid;
      place-items: center;
      overflow: hidden;
      padding: 24px;
      isolation: isolate;
      background: #08090b;
      color: #eeeDE8;
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition: opacity .3s ease, visibility .3s ease;
    }

    #myrloreSecretOverlay.active {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }

    #myrloreSecretOverlay::before {
      content: "";
      position: absolute;
      inset: 0;
      z-index: 1;
      pointer-events: none;
      opacity: 0;
      background:
        repeating-linear-gradient(
          0deg,
          transparent 0px,
          transparent 2px,
          rgba(255,255,255,.13) 3px,
          transparent 4px
        ),
        repeating-linear-gradient(
          90deg,
          rgba(255,67,183,.08),
          transparent 3px,
          rgba(140,255,85,.06) 6px
        );
      mix-blend-mode: screen;
    }

    #myrloreSecretOverlay.glitching::before {
      opacity: .85;
      animation: capriScanlines .12s steps(2) infinite;
    }

    #myrloreSecretOverlay .secret-noise {
      position: absolute;
      inset: -50%;
      z-index: 2;
      pointer-events: none;
      opacity: .12;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.92' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E");
    }

    #myrloreSecretOverlay.glitching .secret-noise {
      animation: capriNoise .09s steps(2) infinite;
      opacity: .28;
    }

    #myrloreSecretOverlay .secret-glitch-bars {
      position: absolute;
      inset: 0;
      z-index: 4;
      pointer-events: none;
      opacity: 0;
      background:
        linear-gradient(
          90deg,
          transparent 0 8%,
          rgba(255,67,183,.8) 8% 9%,
          transparent 9% 48%,
          rgba(140,255,85,.7) 48% 49%,
          transparent 49% 100%
        );
      mix-blend-mode: screen;
    }

    #myrloreSecretOverlay.glitching .secret-glitch-bars {
      animation: capriBars .16s steps(2) infinite;
    }

    #capriFlight {
      position: fixed;
      z-index: 8;
      left: 0;
      top: 0;
      width: clamp(210px, 30vw, 390px);
      height: min(78vh, 560px);
      opacity: 0;
      pointer-events: none;
      transform: translate(-50%, -50%);
      will-change: transform, opacity, filter;
      filter:
        drop-shadow(0 0 18px var(--capri-pink))
        drop-shadow(0 0 15px var(--capri-green))
        drop-shadow(0 0 25px var(--capri-purple));
    }

    #capriImage {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: contain;
      animation: capriImageGlitch .16s steps(2) infinite;
    }

    #capriFlight::before,
    #capriFlight::after {
      content: "";
      position: absolute;
      inset: 0;
      pointer-events: none;
      background-image: inherit;
      opacity: .35;
      mix-blend-mode: screen;
    }

    #capriFlight::before {
      filter: drop-shadow(-5px 0 var(--capri-pink));
      animation: capriRGB1 .2s steps(2) infinite;
    }

    #capriFlight::after {
      filter: drop-shadow(5px 0 var(--capri-green));
      animation: capriRGB2 .17s steps(2) infinite;
    }

    #myrloreSecretOverlay .secret-inner {
      position: relative;
      z-index: 6;
      opacity: 0;
      transform: translateY(18px);
      transition: opacity .7s ease, transform .7s ease;
    }

    #myrloreSecretOverlay.active .secret-inner {
      opacity: 1;
      transform: translateY(0);
    }

    #myrloreSecretOverlay .secret-symbol {
      color: var(--capri-pink);
      text-shadow:
        0 0 15px var(--capri-pink),
        0 0 30px var(--capri-purple);
    }

    #myrloreSecretOverlay h2 {
      text-shadow:
        2px 0 var(--capri-pink),
        -2px 0 var(--capri-green);
    }

    #myrloreSecretOverlay button {
      position: relative;
      z-index: 10;
    }

    @keyframes capriNoise {
      0% { transform: translate(0, 0); }
      25% { transform: translate(-3%, 2%); }
      50% { transform: translate(2%, -2%); }
      75% { transform: translate(-1%, -3%); }
      100% { transform: translate(3%, 1%); }
    }

    @keyframes capriScanlines {
      0% { transform: translateY(-8px); }
      100% { transform: translateY(8px); }
    }

    @keyframes capriBars {
      0% { opacity: .15; transform: translateX(-12px); }
      50% { opacity: .8; transform: translateX(14px); }
      100% { opacity: .2; transform: translateX(-5px); }
    }

    @keyframes capriImageGlitch {
      0% { transform: translate(0,0) skewX(0); }
      25% { transform: translate(2px,-1px) skewX(1deg); }
      50% { transform: translate(-2px,1px) skewX(-1deg); }
      75% { transform: translate(1px,0) skewX(.5deg); }
      100% { transform: translate(0,0) skewX(0); }
    }

    @keyframes capriRGB1 {
      0% { transform: translateX(-3px); clip-path: inset(10% 0 70% 0); }
      50% { transform: translateX(4px); clip-path: inset(50% 0 25% 0); }
      100% { transform: translateX(-2px); clip-path: inset(75% 0 5% 0); }
    }

    @keyframes capriRGB2 {
      0% { transform: translateX(4px); clip-path: inset(60% 0 10% 0); }
      50% { transform: translateX(-3px); clip-path: inset(15% 0 65% 0); }
      100% { transform: translateX(3px); clip-path: inset(35% 0 40% 0); }
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

      #myrloreSecretOverlay.glitching::before,
      #myrloreSecretOverlay.glitching .secret-noise,
      #myrloreSecretOverlay.glitching .secret-glitch-bars,
      #capriImage,
      #capriFlight::before,
      #capriFlight::after {
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
    <div class="secret-glitch-bars"></div>

    <div id="capriFlight" aria-hidden="true">
      <img id="capriImage" alt="">
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
  const capriImageElement = $("#capriImage", secretOverlay);
  const secretCloseButton = $("#secretClose", secretOverlay);

  /* ==========================================
     CAPRI IMAGE
     USES FIRST SPRITE FRAME ONLY
  ========================================== */

  function loadCapri() {
    if (!capriImageElement) return;

    capriImage = new Image();

    capriImage.onload = () => {
      const columns = 4;
      const rows = 4;

      const frameWidth = capriImage.naturalWidth / columns;
      const frameHeight = capriImage.naturalHeight / rows;

      const stillCanvas = document.createElement("canvas");
      stillCanvas.width = frameWidth;
      stillCanvas.height = frameHeight;

      const ctx = stillCanvas.getContext("2d");

      ctx.drawImage(
        capriImage,
        0,
        0,
        frameWidth,
        frameHeight,
        0,
        0,
        frameWidth,
        frameHeight
      );

      capriImageElement.src = stillCanvas.toDataURL("image/png");
    };

    capriImage.onerror = () => {
      console.error(
        "Capri image failed to load. Check capri-spritesheet.png in your website root."
      );
    };

    capriImage.src = "capri-spritesheet.png";
  }

  loadCapri();

  /* ==========================================
     FULL-SCREEN GLITCH EFFECT
  ========================================== */

  function startScreenGlitch() {
    secretOverlay.classList.add("glitching");

    if (capriGlitchInterval) {
      clearInterval(capriGlitchInterval);
    }

    capriGlitchInterval = setInterval(() => {
      if (!secretActive) return;

      const offsetX = (Math.random() - 0.5) * 18;
      const offsetY = (Math.random() - 0.5) * 8;

      secretOverlay.style.transform =
        `translate(${offsetX}px, ${offsetY}px)`;

      if (Math.random() > 0.5) {
        secretOverlay.style.filter =
          `hue-rotate(${Math.random() * 45 - 20}deg)`;
      } else {
        secretOverlay.style.filter = "none";
      }
    }, 65);

    capriFlashInterval = setTimeout(() => {
      secretOverlay.classList.remove("glitching");
      secretOverlay.style.transform = "";
      secretOverlay.style.filter = "";

      if (capriGlitchInterval) {
        clearInterval(capriGlitchInterval);
        capriGlitchInterval = null;
      }
    }, 1100);
  }

  /* ==========================================
     CAPRI ENTRANCE
     SIMPLE. FAST. NO DANCING.
  ========================================== */

  function animateCapriEntrance() {
    if (!capriFlight) return;

    const mobile = window.innerWidth <= 650;

    const endX = mobile
      ? window.innerWidth * 0.5
      : window.innerWidth * 0.155;

    const endY = mobile
      ? window.innerHeight * 0.23
      : window.innerHeight * 0.52;

    const startX = window.innerWidth * 1.2;
    const startY = window.innerHeight * 0.45;

    if (reducedMotion) {
      capriFlight.style.opacity = "1";
      capriFlight.style.transform =
        `translate(${endX}px, ${endY}px) translate(-50%, -50%)`;
      return;
    }

    if (gsapInstance) {
      gsapInstance.fromTo(
        capriFlight,
        {
          opacity: 0,
          x: startX,
          y: startY,
          scale: 0.5,
          rotation: 12
        },
        {
          opacity: 1,
          x: endX,
          y: endY,
          scale: mobile ? 0.75 : 0.95,
          rotation: 0,
          duration: 1.15,
          ease: "power4.out",
          delay: 0.35
        }
      );
    } else {
      capriFlight.style.transition =
        "transform 1.15s cubic-bezier(.16,1,.3,1), opacity .3s";

      capriFlight.style.opacity = "1";

      requestAnimationFrame(() => {
        capriFlight.style.transform =
          `translate(${endX}px, ${endY}px) translate(-50%, -50%) scale(${mobile ? 0.75 : 0.95})`;
      });
    }
  }

  /* ==========================================
     OPEN SECRET ARCHIVE
  ========================================== */

  function activateSecretArchive() {
    if (secretActive) return;

    secretActive = true;
    secretPreviousFocus = document.activeElement;

    secretOverlay.classList.add("active");
    secretOverlay.setAttribute("aria-hidden", "false");
    secretOverlay.removeAttribute("inert");

    body.style.overflow = "hidden";

    capriFlight.style.opacity = "0";
    capriFlight.style.transform =
      "translate(120vw, 45vh) translate(-50%, -50%) scale(.5)";

    startScreenGlitch();

    setTimeout(() => {
      if (!secretActive) return;

      animateCapriEntrance();
      secretCloseButton?.focus();
    }, reducedMotion ? 0 : 250);

    console.log("MYRLORE® — SECRET ARCHIVE UNLOCKED");
  }

  /* ==========================================
     CLOSE SECRET ARCHIVE
  ========================================== */

  function closeSecretArchive() {
    if (!secretActive) return;

    secretActive = false;

    clearInterval(capriGlitchInterval);
    clearTimeout(capriFlashInterval);

    capriGlitchInterval = null;
    capriFlashInterval = null;

    if (gsapInstance) {
      gsapInstance.killTweensOf(capriFlight);
    }

    secretOverlay.classList.remove("active", "glitching");

    secretOverlay.style.transform = "";
    secretOverlay.style.filter = "";

    secretOverlay.setAttribute("aria-hidden", "true");
    secretOverlay.setAttribute("inert", "");

    body.style.overflow = "";

    capriFlight.style.opacity = "0";

    secretPreviousFocus?.focus?.();
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
    "%cSecret archive: ↑ ↑ ↓ ↓ ← → B A",
    "font-size:10px;color:#c6b69a;"
  );

})();
