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

      const target = new URL(href, window.location.href);

      if (target.origin !== window.location.origin) return;

      event.preventDefault();
      runPageTransition(target.href);
    });
  });

  /* ==========================================
     THREE.JS CHROME SCULPTURE
  ========================================== */

  const canvas = $("#chromeCanvas");

  let renderer = null;
  let scene = null;
  let camera = null;
  let sculpture = null;
  let animationFrame = null;
  let threeReady = false;
  let pageVisible = !document.hidden;

  let pointerX = 0;
  let pointerY = 0;
  let scrollRotation = 0;

  let resizeObserver = null;

  const clock = {
    startTime: 0,
    getElapsedTime() {
      return (performance.now() - this.startTime) / 1000;
    },
    start() {
      this.startTime = performance.now();
    }
  };

  function animateThreeAgain() {
    if (!renderer || !scene || !camera || !pageVisible) return;

    cancelAnimationFrame(animationFrame);

    animationFrame = requestAnimationFrame(animateThreeAgain);

    const elapsed = clock.getElapsedTime();

    if (sculpture) {
      sculpture.rotation.x =
        Math.sin(elapsed * 0.18) * 0.12 + pointerY;

      sculpture.rotation.y =
        elapsed * 0.12 + pointerX + scrollRotation;

      sculpture.rotation.z =
        Math.sin(elapsed * 0.12) * 0.04;
    }

    renderer.render(scene, camera);
  }

  function initialiseThree() {
    if (!canvas || threeReady) return;

    import("three")
      .then(THREE => {
        if (!canvas) return;

        const width = canvas.clientWidth || window.innerWidth;
        const height = canvas.clientHeight || window.innerHeight;

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(
          35,
          width / height,
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
          Math.min(window.devicePixelRatio || 1, 2)
        );

        renderer.setSize(width, height, false);
        renderer.outputColorSpace = THREE.SRGBColorSpace;

        const ambient = new THREE.AmbientLight(
          0xffffff,
          1.8
        );

        scene.add(ambient);

        const keyLight = new THREE.DirectionalLight(
          0xffffff,
          3.2
        );

        keyLight.position.set(3, 4, 5);
        scene.add(keyLight);

        const rimLight = new THREE.PointLight(
          0xc6b69a,
          45,
          20
        );

        rimLight.position.set(-4, 1, 3);
        scene.add(rimLight);

        const coolLight = new THREE.PointLight(
          0x9dbbd0,
          28,
          18
        );

        coolLight.position.set(4, -2, 2);
        scene.add(coolLight);

        const geometry = new THREE.BufferGeometry();

        const vertices = new Float32Array([
          -1.05, -2.1, 0,
           0.0,  2.2, 0.18,
           1.05, -2.1, 0,

          -1.05, -2.1, 0,
           0.0,  2.2, 0.18,
          -0.12, -1.9, 0.32,

           1.05, -2.1, 0,
           0.0,  2.2, 0.18,
           0.12, -1.9, -0.32
        ]);

        geometry.setAttribute(
          "position",
          new THREE.BufferAttribute(vertices, 3)
        );

        geometry.computeVertexNormals();

        const material = new THREE.MeshPhysicalMaterial({
          color: 0xbfc1c3,
          metalness: 1,
          roughness: 0.16,
          clearcoat: 1,
          clearcoatRoughness: 0.08,
          reflectivity: 1,
          side: THREE.DoubleSide
        });

        sculpture = new THREE.Mesh(geometry, material);
        sculpture.scale.set(1.1, 1.1, 1.1);
        scene.add(sculpture);

        const particleCount = 220;
        const particlePositions = new Float32Array(
          particleCount * 3
        );

        for (let i = 0; i < particleCount; i++) {
          particlePositions[i * 3] =
            (Math.random() - 0.5) * 12;

          particlePositions[i * 3 + 1] =
            (Math.random() - 0.5) * 9;

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
          opacity: 0.58,
          sizeAttenuation: true
        });

        const particles = new THREE.Points(
          particleGeometry,
          particleMaterial
        );

        scene.add(particles);

        const resizeRenderer = () => {
          if (!renderer || !camera) return;

          const nextWidth = canvas.clientWidth || window.innerWidth;
          const nextHeight = canvas.clientHeight || window.innerHeight;

          camera.aspect = nextWidth / nextHeight;
          camera.updateProjectionMatrix();

          renderer.setSize(nextWidth, nextHeight, false);
        };

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

      })
      .catch(error => {
        console.error("MYRLORE sculpture initialisation failed:", error);

        if (canvas) canvas.style.opacity = "0";
      });
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

     4×4 SPRITE SHEET.
     16 FRAMES.
     ONE CANVAS.
     CURVED SCREEN MOVEMENT.
     NO SLIDESHOW.
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
  const secretInner = $(".secret-inner", secretOverlay);
  const secretCloseButton = $("#secretClose", secretOverlay);

  capriCanvas = $("#capriCanvas", secretOverlay);

  capriContext = capriCanvas?.getContext("2d", {
    alpha: true
  });

  /* ==========================================
     CAPRI SPRITE SHEET + COLOUR EXTRACTION

     4 columns × 4 rows = 16 animation frames.
     Each frame is drawn from the same image onto
     one canvas. This is frame animation, not a
     slideshow and not 16 separate image elements.
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
      const context = sample.getContext("2d", { willReadFrequently: true });
      context.drawImage(image, 0, 0, 140, 140);
      const pixels = context.getImageData(0, 0, 140, 140).data;
      const colours = new Map();

      for (let i = 0; i < pixels.length; i += 16) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];
        if (a < 140) continue;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const saturation = max === 0 ? 0 : (max - min) / max;
        if (saturation < .22 || max < 35) continue;

        const key = [
          Math.min(255, Math.round(r / 16) * 16),
          Math.min(255, Math.round(g / 16) * 16),
          Math.min(255, Math.round(b / 16) * 16)
        ].join(",");
        colours.set(key, (colours.get(key) || 0) + 1);
      }

      const sorted = [...colours.entries()].sort((a, b) => b[1] - a[1]);
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
        capriPalette.green = rgbToHex(...(selected[1] || selected[0]));
        capriPalette.violet = rgbToHex(...(selected[2] || selected[0]));
      }

      secretOverlay.style.setProperty("--capri-magenta", capriPalette.magenta);
      secretOverlay.style.setProperty("--capri-green", capriPalette.green);
      secretOverlay.style.setProperty("--capri-violet", capriPalette.violet);
    } catch (error) {
      console.warn("Capri palette extraction failed:", error);
    }
  }

  function getCapriFrameRect(frameIndex) {
    const frameWidth = capriImage.naturalWidth / CAPRI_COLUMNS;
    const frameHeight = capriImage.naturalHeight / CAPRI_ROWS;
    const safeIndex = ((frameIndex % CAPRI_FRAME_COUNT) + CAPRI_FRAME_COUNT) % CAPRI_FRAME_COUNT;
    const column = safeIndex % CAPRI_COLUMNS;
    const row = Math.floor(safeIndex / CAPRI_COLUMNS);
    return {
      sx: column * frameWidth,
      sy: row * frameHeight,
      sw: frameWidth,
      sh: frameHeight
    };
  }

  function drawCapriFrame(frameIndex = capriFrameIndex, offsetX = 0, alpha = 1) {
    if (!capriContext || !capriImage?.complete || !capriCanvas.width) return;
    const frame = getCapriFrameRect(frameIndex);
    capriContext.globalAlpha = alpha;
    capriContext.drawImage(
      capriImage,
      frame.sx, frame.sy, frame.sw, frame.sh,
      offsetX, 0, capriCanvas.width, capriCanvas.height
    );
    capriContext.globalAlpha = 1;
  }

  function loadCapri() {
    if (capriImage) return;
    capriImage = new Image();
    capriImage.decoding = "async";

    capriImage.onload = () => {
      if (!capriCanvas || !capriContext) return;
      const frameWidth = Math.floor(capriImage.naturalWidth / CAPRI_COLUMNS);
      const frameHeight = Math.floor(capriImage.naturalHeight / CAPRI_ROWS);
      if (!frameWidth || !frameHeight) {
        console.error("Capri sprite sheet has invalid dimensions.");
        return;
      }
      capriCanvas.width = frameWidth;
      capriCanvas.height = frameHeight;
      capriFrameIndex = 0;
      extractCapriPalette(capriImage);
      drawCapriClean();
    };

    capriImage.onerror = () => {
      console.error("Capri sprite sheet could not load. Make sure capri-spritesheet.png is in the website root folder.");
    };

    capriImage.src = "capri-spritesheet.png";
  }

  function drawCapriClean() {
    if (!capriContext || !capriImage?.complete || !capriCanvas.width) return;
    capriContext.clearRect(0, 0, capriCanvas.width, capriCanvas.height);
    capriContext.globalAlpha = 1;
    capriContext.globalCompositeOperation = "source-over";
    drawCapriFrame(capriFrameIndex);
  }

  function updateCapriFrame(timestamp) {
    if (!capriImage?.complete) return;
    if (!capriLastFrameTime) capriLastFrameTime = timestamp;
    if (timestamp - capriLastFrameTime >= CAPRI_FRAME_INTERVAL) {
      const steps = Math.floor((timestamp - capriLastFrameTime) / CAPRI_FRAME_INTERVAL);
      capriFrameIndex = (capriFrameIndex + steps) % CAPRI_FRAME_COUNT;
      capriLastFrameTime = timestamp;
    }
  }

  loadCapri();

  /* ==========================================
     CAPRI GLITCH ENGINE
  ========================================== */

  function drawCapriGlitch(intensity) {
    if (!capriContext || !capriImage?.complete || !capriCanvas.width) return;
    const ctx = capriContext;
    const width = capriCanvas.width;
    const height = capriCanvas.height;
    const burst = Math.max(0, Math.min(1, intensity));

    ctx.clearRect(0, 0, width, height);
    if (burst < .025) {
      drawCapriFrame(capriFrameIndex);
      return;
    }

    const frame = getCapriFrameRect(capriFrameIndex);
    ctx.globalCompositeOperation = "screen";
    drawCapriFrame(capriFrameIndex, -5 * burst, .12 * burst);
    drawCapriFrame(capriFrameIndex, 5 * burst, .1 * burst);
    ctx.globalCompositeOperation = "source-over";
    drawCapriFrame(capriFrameIndex);

    const sliceCount = Math.floor(5 + burst * 12);
    const sliceHeight = height / sliceCount;
    for (let i = 0; i < sliceCount; i++) {
      if (Math.random() > .35 + burst * .4) continue;
      const sy = i * sliceHeight;
      const sh = Math.min(sliceHeight + 1, height - sy);
      const shift = (Math.random() - .5) * 28 * burst;
      ctx.drawImage(
        capriImage,
        frame.sx, frame.sy + (sy / height) * frame.sh,
        frame.sw, (sh / height) * frame.sh,
        shift, sy, width, sh
      );
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  /* ==========================================
     CAPRI MOVEMENT SYSTEM

     Smooth curved path:
     1. Enters from bottom-left.
     2. Sweeps across the upper screen.
     3. Curves around the right edge.
     4. Crosses the lower screen.
     5. Moves towards the text.
     6. Settles beside the archive.
  ========================================== */

  function smoothProgress(value) {
    return value * value * (3 - 2 * value);
  }

  function easeOutCubic(value) {
    return 1 - Math.pow(1 - value, 3);
  }

  function easeInOutCubic(value) {
    return value < .5
      ? 4 * value * value * value
      : 1 - Math.pow(-2 * value + 2, 3) / 2;
  }

  function cubicBezier(p0, p1, p2, p3, t) {
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

    const finalX = mobile
      ? width * .5
      : width * .245;

    const finalY = mobile
      ? height * .285
      : height * .5;

    const points = [
      {
        x: -width * .45,
        y: height * 1.05,
        scale: .55,
        rotation: -18
      },
      {
        x: width * .18,
        y: height * .08,
        scale: .68,
        rotation: 10
      },
      {
        x: width * .82,
        y: height * .12,
        scale: .78,
        rotation: 20
      },
      {
        x: width * 1.12,
        y: height * .62,
        scale: .82,
        rotation: 35
      },
      {
        x: width * .72,
        y: height * .94,
        scale: .78,
        rotation: -16
      },
      {
        x: width * .18,
        y: height * .75,
        scale: .84,
        rotation: -22
      },
      {
        x: finalX,
        y: finalY,
        scale: mobile ? .64 : .88,
        rotation: 0
      }
    ];

    const segmentCount = points.length - 1;
    const scaled = progress * segmentCount;

    const index = Math.min(
      segmentCount - 1,
      Math.floor(scaled)
    );

    const local = progress >= 1
      ? 1
      : scaled - index;

    const current = points[index];
    const next = points[index + 1];

    const previous = points[Math.max(0, index - 1)];
    const after = points[Math.min(points.length - 1, index + 2)];

    const tension = .16;

    const control1 = {
      x: current.x + (next.x - previous.x) * tension,
      y: current.y + (next.y - previous.y) * tension
    };

    const control2 = {
      x: next.x - (after.x - current.x) * tension,
      y: next.y - (after.y - current.y) * tension
    };

    return {
      x: cubicBezier(
        current.x,
        control1.x,
        control2.x,
        next.x,
        local
      ),
      y: cubicBezier(
        current.y,
        control1.y,
        control2.y,
        next.y,
        local
      ),
      scale: current.scale + (next.scale - current.scale) * local,
      rotation: current.rotation + (next.rotation - current.rotation) * local
    };
  }

  /* ==========================================
     CAPRI GLITCH TIMING
  ========================================== */

  function getCapriGlitchIntensity(progress) {
    const bursts = [
      { at: .12, strength: .25, width: .035 },
      { at: .31, strength: .45, width: .045 },
      { at: .52, strength: .3, width: .04 },
      { at: .73, strength: .62, width: .055 },
      { at: .89, strength: .9, width: .07 }
    ];

    let intensity = 0;

    bursts.forEach(burst => {
      const distance = Math.abs(progress - burst.at);

      if (distance < burst.width) {
        const local = 1 - distance / burst.width;

        intensity = Math.max(
          intensity,
          Math.sin(local * Math.PI) * burst.strength
        );
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
    updateCapriFrame(timestamp);
    const duration = 5600;

    const progress = Math.min(1, elapsed / duration);

    const pathProgress = easeInOutCubic(progress);
    const position = getCapriPosition(pathProgress);

    const mobile = window.innerWidth <= 650;

    let x = position.x;
    let y = position.y;
    let scale = position.scale;
    let rotation = position.rotation;

    const intensity = reducedMotion
      ? 0
      : getCapriGlitchIntensity(progress);

    /* Gentle movement while travelling */

    if (progress < .88) {
      x += Math.sin(elapsed * .004) * 5;
      y += Math.cos(elapsed * .005) * 5;
      rotation += Math.sin(elapsed * .003) * 2;
    }

    /* Initial fade */

    const opacity = progress < .045
      ? progress / .045
      : 1;

    /* Final approach to the text */

    if (progress >= .88) {
      const settle = smoothProgress(
        (progress - .88) / .12
      );

      const targetX = mobile
        ? window.innerWidth * .5
        : window.innerWidth * .245;

      const targetY = mobile
        ? window.innerHeight * .285
        : window.innerHeight * .5;

      x += (targetX - x) * settle;
      y += (targetY - y) * settle;

      scale = position.scale + ((mobile ? .64 : .88) - position.scale) * settle;
      rotation *= 1 - settle;

      if (progress >= .91) {
        secretInner.classList.add("capri-text-visible");
      }

      if (progress >= .88 && !secretOverlay.classList.contains("capri-impact")) {
        secretOverlay.classList.add("capri-impact");
      }
    }

    capriFlight.style.transform = `
      translate3d(${x}px, ${y}px, 0)
      translate(-50%, -50%)
      scale(${scale})
      rotate(${rotation}deg)
    `;

    capriFlight.style.opacity = String(opacity);

    if (intensity > .02) {
      capriFlight.style.filter = `
        drop-shadow(0 0 ${20 + intensity * 28}px ${capriPalette.magenta})
        drop-shadow(0 0 ${12 + intensity * 18}px ${capriPalette.green})
      `;
    } else {
      capriFlight.style.filter = `
        drop-shadow(0 0 20px ${capriPalette.magenta})
        drop-shadow(0 0 11px ${capriPalette.green})
      `;
    }

    drawCapriGlitch(intensity);

    if (progress < 1) {
      capriAnimationFrame = requestAnimationFrame(animateCapri);
    } else {
      capriFlight.style.transform = `
        translate3d(
          ${mobile ? window.innerWidth * .5 : window.innerWidth * .245}px,
          ${mobile ? window.innerHeight * .285 : window.innerHeight * .5}px,
          0
        )
        translate(-50%, -50%)
        scale(${mobile ? .64 : .88})
      `;

      capriFlight.style.opacity = "1";

      capriFlight.style.filter = `
        drop-shadow(0 0 20px ${capriPalette.magenta})
        drop-shadow(0 0 11px ${capriPalette.green})
      `;

      secretInner.classList.add("capri-text-visible");
      secretOverlay.classList.remove("capri-impact");

      drawCapriClean();
    }
  }

  function startCapriAnimation() {
    cancelAnimationFrame(capriAnimationFrame);

    capriAnimationFrame = null;
    capriAnimationStart = 0;
    capriLastFrameTime = 0;
    capriFrameIndex = 0;

    secretInner.classList.remove("capri-text-visible");
    secretOverlay.classList.remove("capri-impact");

    capriFlight.style.opacity = "0";
    capriFlight.style.filter = "none";

    capriFlight.style.transform = `
      translate3d(
        ${-window.innerWidth * .45}px,
        ${window.innerHeight * 1.05}px,
        0
      )
      translate(-50%, -50%)
      scale(.55)
    `;

    drawCapriClean();

    if (reducedMotion) {
      capriFlight.style.opacity = "1";

      capriFlight.style.transform = `
        translate3d(
          ${window.innerWidth <= 650
            ? window.innerWidth * .5
            : window.innerWidth * .245}px,
          ${window.innerWidth <= 650
            ? window.innerHeight * .285
            : window.innerHeight * .5}px,
          0
        )
        translate(-50%, -50%)
        scale(.85)
      `;

      secretInner.classList.add("capri-text-visible");
      return;
    }

    capriAnimationFrame = requestAnimationFrame(animateCapri);
  }

  /* ==========================================
     OPEN / CLOSE SECRET ARCHIVE
  ========================================== */

  function closeSecret() {
    if (!secretActive) return;

    secretActive = false;

    cancelAnimationFrame(capriAnimationFrame);
    capriAnimationFrame = null;

    secretOverlay.classList.remove(
      "active",
      "capri-impact"
    );

    secretOverlay.setAttribute("aria-hidden", "true");

    secretInner.classList.remove("capri-text-visible");

    body.classList.remove("myrlore-secret");
    body.style.overflow = "";

    if (secretPreviousFocus?.focus) {
      secretPreviousFocus.focus();
    }
  }

  function activateSecret() {
    if (secretActive) return;

    secretActive = true;
    secretPreviousFocus = document.activeElement;

    body.classList.add("myrlore-secret");
    body.style.overflow = "hidden";

    secretOverlay.classList.remove("active");

    void secretOverlay.offsetWidth;

    secretOverlay.classList.add("active");
    secretOverlay.setAttribute("aria-hidden", "false");

    startCapriAnimation();

    secretCloseButton?.focus();

    console.log(
      "%c MYRLORE® — CAPRI ARCHIVE UNLOCKED ",
      "background:#444;color:#ffffff;padding:10px;font-weight:bold;"
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
