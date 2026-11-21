/* ==========================================
   MYRLORE® — MAIN INTERACTION SYSTEM
   Three.js · GSAP · UI · Case Studies
========================================== */

let THREE;
let RectAreaLightUniformsLib;
let clock;

(() => {
  "use strict";

  const $ = (selector, parent = document) =>
    parent.querySelector(selector);

  const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];

  const prefersReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const isTouchDevice =
    window.matchMedia("(hover: none), (pointer: coarse)").matches;

  /* ==========================================
     PAGE INITIALISATION
  ========================================== */

  const body = document.body;
  const loader = $("#pageLoader");

  function hideLoader() {
    body.classList.add("loaded");

    if (loader) {
      loader.style.display = "none";
    }
  }

  window.addEventListener("load", hideLoader, { once: true });

  setTimeout(hideLoader, 5000);

  const year = $("#year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  /* ==========================================
     NAVIGATION MENU
  ========================================== */

  const menuToggle = $("#menuToggle");
  const menuClose = $("#menuClose");
  const menuPanel = $("#menuPanel");

  function openMenu() {
    if (!menuPanel || !menuToggle) return;

    menuPanel.classList.add("open");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close menu");

    menuPanel.removeAttribute("inert");
    menuPanel.setAttribute("aria-hidden", "false");

    body.style.overflow = "hidden";
  }

  function closeMenu() {
    if (!menuPanel || !menuToggle) return;

    menuPanel.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");

    menuPanel.setAttribute("inert", "");
    menuPanel.setAttribute("aria-hidden", "true");

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
     ESCAPE KEY
  ========================================== */

  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;

    closeMenu();

    if ($("#caseStudyModal")?.classList.contains("is-open")) {
      closeCaseStudy();
    }
  });

  /* ==========================================
     CURSOR GLOW
  ========================================== */

  const cursorGlow = $("#cursorGlow");

  if (cursorGlow && !isTouchDevice && !prefersReducedMotion) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;

    document.addEventListener("mousemove", event => {
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
        cursorGlow.classList.remove("cursor-hover");
        cursorGlow.classList.remove("cursor-project");
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
     GSAP INITIALISATION
  ========================================== */

  let gsapReady = false;

  if (window.gsap) {
    gsapReady = true;

    if (window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }
  }

  /* ==========================================
     REVEAL ANIMATIONS
  ========================================== */

  const revealElements = $$(".reveal");

  if (gsapReady && !prefersReducedMotion) {
    revealElements.forEach(element => {
      gsap.fromTo(
        element,
        {
          opacity: 0,
          y: 45
        },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: element,
            start: "top 88%",
            once: true
          }
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

  if (gsapReady && !prefersReducedMotion) {
    gsap.from(heroElements, {
      opacity: 0,
      y: 30,
      duration: 1.1,
      stagger: 0.12,
      delay: 0.25,
      ease: "power3.out"
    });
  }

  /* ==========================================
     INTERACTIVE SERVICES
  ========================================== */

  const serviceItems = $$(".service-item");

  function closeService(item) {
    const trigger = $(".service-trigger", item);
    const panel = $(".service-details", item);

    if (!trigger || !panel) return;

    trigger.setAttribute("aria-expanded", "false");
    item.classList.remove("is-active");

    if (gsapReady && !prefersReducedMotion && !panel.hidden) {
      gsap.to(panel, {
        height: 0,
        opacity: 0,
        duration: 0.35,
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

  function openService(item) {
    const trigger = $(".service-trigger", item);
    const panel = $(".service-details", item);

    if (!trigger || !panel) return;

    trigger.setAttribute("aria-expanded", "true");
    item.classList.add("is-active");

    panel.hidden = false;

    if (gsapReady && !prefersReducedMotion) {
      gsap.fromTo(
        panel,
        {
          height: 0,
          opacity: 0
        },
        {
          height: "auto",
          opacity: 1,
          duration: 0.5,
          ease: "power3.out"
        }
      );
    }
  }

  serviceItems.forEach(item => {
    const trigger = $(".service-trigger", item);

    if (!trigger) return;

    trigger.addEventListener("click", () => {
      const isActive = item.classList.contains("is-active");

      serviceItems.forEach(other => {
        if (other !== item) {
          closeService(other);
        }
      });

      if (isActive) {
        closeService(item);
      } else {
        openService(item);
      }
    });
  });

  /* ==========================================
     CASE STUDY DATA
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
      technology: [
        "HTML",
        "CSS",
        "JavaScript",
        "Chart.js"
      ]
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
        "HTML",
        "CSS",
        "JavaScript",
        "Leaflet",
        "Chart.js",
        "GeoJSON"
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
    if (!caseStudies[project]) return false;

    const data = caseStudies[project];

    const setText = (selector, value) => {
      const element = $(selector);

      if (element) {
        element.textContent = value;
      }
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

    const art = $("#caseHeroArt");

    if (art) {
      art.classList.toggle(
        "case-flood",
        project === "floodwatch"
      );
    }

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

    requestAnimationFrame(() => {
      caseClose?.focus();
    });
  }

  function closeCaseStudy() {
    if (!caseModal) return;

    caseModal.classList.remove("is-open");
    caseModal.setAttribute("aria-hidden", "true");

    // Restore inert state after closing.
    caseModal.setAttribute("inert", "");

    body.classList.remove("case-open");

    if (previousFocus && typeof previousFocus.focus === "function") {
      previousFocus.focus();
    }
  }

  $$("[data-case-study]").forEach(card => {
    card.addEventListener("click", event => {
      event.preventDefault();

      const project = card.dataset.caseStudy;

      openCaseStudy(project, card);
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

  if (!isTouchDevice && !prefersReducedMotion) {
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
     CINEMATIC PAGE TRANSITIONS
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

    // Make the overlay inaccessible when inactive.
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

    if (gsapReady && !prefersReducedMotion) {
      const timeline = gsap.timeline({
        onComplete: () => {
          window.location.href = url;
        }
      });

      timeline
        .to(transitionCurtain, {
          scaleY: 1,
          duration: 0.65,
          ease: "power4.inOut",
          transformOrigin: "bottom center"
        })
        .to(transitionContent, {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: "power2.out"
        }, "-=0.1")
        .to(transitionProgress, {
          scaleX: 1,
          duration: 0.7,
          ease: "power2.inOut"
        }, "-=0.1");
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

  $$('a[href]').forEach(link => {
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
      ) {
        return;
      }

      let destination;

      try {
        destination = new URL(href, window.location.href);
      } catch {
        return;
      }

      if (destination.origin !== window.location.origin) return;

      const currentPath = window.location.pathname;
      const destinationPath = destination.pathname;

      if (currentPath === destinationPath) return;

      event.preventDefault();

      runPageTransition(destination.href);
    });
  });

  /* ==========================================
     THREE.JS SCULPTURE
  ========================================== */

  const canvas = $("#webgl");

  let renderer;
  let scene;
  let camera;
  let sculpture;
  let animationFrame;

  let threeReady = false;
  let pageVisible = !document.hidden;

  async function initialiseThree() {
    if (!canvas || prefersReducedMotion) return;

    try {
      THREE = await import("three");

      const { RectAreaLightUniformsLib: RectAreaModule } =
        await import("three/addons/lights/RectAreaLightUniformsLib.js");

      RectAreaLightUniformsLib = RectAreaModule;

      RectAreaLightUniformsLib.init();

      clock = new THREE.Clock();

      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(
        35,
        1,
        0.1,
        100
      );

      camera.position.set(0, 0, 8);

      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance"
      });

      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 1.75)
      );

      renderer.outputColorSpace = THREE.SRGBColorSpace;

      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;

      sculpture = new THREE.Group();

      scene.add(sculpture);

      /* MATERIALS */

      const chromeMaterial = new THREE.MeshStandardMaterial({
        color: 0xc8c9c7,
        metalness: 1,
        roughness: 0.19
      });

      const darkMetal = new THREE.MeshStandardMaterial({
        color: 0x777b80,
        metalness: 0.95,
        roughness: 0.27
      });

      const champagneMaterial = new THREE.MeshStandardMaterial({
        color: 0xc6b69a,
        metalness: 0.9,
        roughness: 0.25
      });

      /* ENVIRONMENT */

      const environment = new THREE.PMREMGenerator(renderer);

      const environmentScene = new THREE.Scene();

      environmentScene.background = new THREE.Color(0x33343a);

      const environmentLights = [
        {
          position: [4, 4, 4],
          color: 0xffffff,
          intensity: 3
        },
        {
          position: [-4, 2, -3],
          color: 0xc6b69a,
          intensity: 2
        },
        {
          position: [0, -4, 3],
          color: 0x8e9aa8,
          intensity: 2
        }
      ];

      environmentLights.forEach(lightData => {
        const light = new THREE.PointLight(
          lightData.color,
          lightData.intensity
        );

        light.position.set(...lightData.position);

        environmentScene.add(light);
      });

      const environmentTexture =
        environment.fromScene(environmentScene, 0.04).texture;

      scene.environment = environmentTexture;

      environment.dispose();

      /* LIGHTING */

      const ambient = new THREE.AmbientLight(
        0xffffff,
        0.55
      );

      scene.add(ambient);

      const keyLight = new THREE.DirectionalLight(
        0xffffff,
        3
      );

      keyLight.position.set(4, 5, 6);
      scene.add(keyLight);

      const rimLight = new THREE.DirectionalLight(
        0xc6b69a,
        2.5
      );

      rimLight.position.set(-5, 1, -4);
      scene.add(rimLight);

      const lowerLight = new THREE.PointLight(
        0x89939d,
        25,
        12
      );

      lowerLight.position.set(0, -3, 3);
      scene.add(lowerLight);

      const areaLight = new THREE.RectAreaLight(
        0xffffff,
        5,
        5,
        2
      );

      areaLight.position.set(0, 4, 4);
      areaLight.lookAt(0, 0, 0);

      scene.add(areaLight);

      /* SCULPTURAL BLADES */

      const bladeCount = 9;

      for (let i = 0; i < bladeCount; i++) {
        const angle = (i / bladeCount) * Math.PI * 2;

        const blade = new THREE.Mesh(
          new THREE.TorusGeometry(1.25, 0.105, 24, 120, Math.PI * 1.35),
          i % 3 === 0 ? champagneMaterial : chromeMaterial
        );

        blade.rotation.x = Math.PI / 2.4;
        blade.rotation.y = angle;
        blade.rotation.z = angle * 0.55;

        blade.scale.set(
          1 + Math.sin(angle) * 0.08,
          1.15,
          0.8
        );

        sculpture.add(blade);
      }

      /* CENTRAL CORE */

      const core = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.58, 2),
        darkMetal
      );

      core.scale.set(1, 1.15, 0.8);

      sculpture.add(core);

      /* CHROME CURVES */

      for (let i = 0; i < 4; i++) {
        const points = [];

        for (let j = 0; j <= 100; j++) {
          const t = j / 100;

          const angle = t * Math.PI * 2;

          const radius = 1.65 + Math.sin(angle * 3 + i) * 0.15;

          points.push(
            new THREE.Vector3(
              Math.cos(angle + i) * radius,
              Math.sin(angle * 2 + i) * 0.45,
              Math.sin(angle + i) * radius
            )
          );
        }

        const curve = new THREE.CatmullRomCurve3(points);

        const geometry = new THREE.TubeGeometry(
          curve,
          160,
          0.012,
          8,
          false
        );

        const line = new THREE.Mesh(
          geometry,
          i % 2 === 0 ? chromeMaterial : champagneMaterial
        );

        sculpture.add(line);
      }

      /* PARTICLES */

      const particleCount = 180;

      const particlePositions = new Float32Array(
        particleCount * 3
      );

      for (let i = 0; i < particleCount; i++) {
        particlePositions[i * 3] =
          (Math.random() - 0.5) * 7;

        particlePositions[i * 3 + 1] =
          (Math.random() - 0.5) * 7;

        particlePositions[i * 3 + 2] =
          (Math.random() - 0.5) * 5;
      }

      const particleGeometry = new THREE.BufferGeometry();

      particleGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(particlePositions, 3)
      );

      const particleMaterial = new THREE.PointsMaterial({
        color: 0xc6b69a,
        size: 0.018,
        transparent: true,
        opacity: 0.55,
        sizeAttenuation: true
      });

      const particles = new THREE.Points(
        particleGeometry,
        particleMaterial
      );

      scene.add(particles);

      /* RESIZE */

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

      const resizeObserver = new ResizeObserver(resizeRenderer);

      resizeObserver.observe(canvas);

      window.addEventListener("resize", resizeRenderer);

      /* SCROLL INTERACTION */

      let scrollRotation = 0;

      window.addEventListener("scroll", () => {
        scrollRotation = window.scrollY * 0.00015;
      }, { passive: true });

      /* ANIMATION */

      let pointerX = 0;
      let pointerY = 0;

      if (!isTouchDevice) {
        window.addEventListener("mousemove", event => {
          pointerX =
            (event.clientX / window.innerWidth - 0.5) * 0.4;

          pointerY =
            (event.clientY / window.innerHeight - 0.5) * 0.3;
        });
      }

      function animate() {
        if (!pageVisible) return;

        animationFrame = requestAnimationFrame(animate);

        const elapsed = clock.getElapsedTime();

        sculpture.rotation.y += 0.0025;
        sculpture.rotation.y +=
          (scrollRotation - sculpture.rotation.y) * 0.0005;

        sculpture.rotation.x =
          Math.sin(elapsed * 0.25) * 0.13 + pointerY * 0.3;

        sculpture.rotation.z =
          Math.cos(elapsed * 0.2) * 0.08 + pointerX * 0.2;

        sculpture.position.y =
          Math.sin(elapsed * 0.5) * 0.08;

        particles.rotation.y = elapsed * 0.025;
        particles.rotation.x = elapsed * 0.012;

        renderer.render(scene, camera);
      }

      threeReady = true;

      animate();

    } catch (error) {
      console.error("MYRLORE Three.js initialisation failed:", error);

      canvas.style.opacity = "0";
    }
  }

  /* ==========================================
     LAZY LOAD THREE.JS
  ========================================== */

  if (canvas) {
    const hero = $(".hero");

    if ("IntersectionObserver" in window && hero) {
      const observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          observer.disconnect();
          initialiseThree();
        }
      }, {
        rootMargin: "200px"
      });

      observer.observe(hero);
    } else {
      initialiseThree();
    }
  }

  /* ==========================================
     TAB VISIBILITY PERFORMANCE
  ========================================== */

  document.addEventListener("visibilitychange", () => {
    pageVisible = !document.hidden;

    if (!renderer || !threeReady) return;

    if (pageVisible) {
      cancelAnimationFrame(animationFrame);
      clock?.start();
      animationFrame = requestAnimationFrame(() => {
        renderer.render(scene, camera);
      });
    } else {
      cancelAnimationFrame(animationFrame);
    }
  });

  /* ==========================================
     KONAMI CODE EASTER EGG
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

  document.addEventListener("keydown", event => {
    const expected = konamiSequence[konamiPosition];

    if (event.key.toLowerCase() === expected.toLowerCase()) {
      konamiPosition++;

      if (konamiPosition === konamiSequence.length) {
        konamiPosition = 0;

        body.classList.toggle("myrlore-secret");

        console.log(
          "%c MYRLORE® — STAY CURIOUS.",
          "color:#c6b69a;font-size:18px;font-weight:bold;"
        );
      }
    } else {
      konamiPosition = 0;
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
      audioContext ??= new (
        window.AudioContext ||
        window.webkitAudioContext
      )();

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
      console.warn("Audio unavailable:", error);
    }
  }

  // Sound remains off unless the visitor explicitly enables it.
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
      audioEnabled ? "Disable interface sounds" : "Enable interface sounds"
    );

    if (audioEnabled) {
      playResonance();
    }
  });

  if (isTouchDevice) {
    soundToggle.style.display = "none";
  }

  $$(".work-card, .round-link, .service-trigger").forEach(element => {
    element.addEventListener("mouseenter", playResonance);
  });

  /* ==========================================
     FINAL INITIALISATION
  ========================================== */

  // Keep hidden overlays inaccessible on initial load.
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
