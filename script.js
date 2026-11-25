
import * as THREE from "three";

(() => {
  "use strict";

  /* ==========================================
     CORE
  ========================================== */

  const $ = (selector, parent = document) =>
    parent.querySelector(selector);

  const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];

  const body = document.body;
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const touchDevice =
    window.matchMedia("(pointer: coarse)").matches;

  const gsapInstance = window.gsap || null;
  const ScrollTrigger = window.ScrollTrigger || null;

  if (gsapInstance && ScrollTrigger) {
    gsapInstance.registerPlugin(ScrollTrigger);
  }

  /* ==========================================
     PAGE LOADER
  ========================================== */

  const pageLoader = $("#pageLoader");

  function hideLoader() {
    if (!pageLoader) return;

    pageLoader.classList.add("is-hidden");
    body.classList.add("loaded");

    setTimeout(() => {
      pageLoader.style.display = "none";
    }, 800);
  }

  window.addEventListener("load", () => {
    setTimeout(hideLoader, 400);
  }, { once: true });

  setTimeout(hideLoader, 5000);

  /* ==========================================
     FOOTER YEAR
  ========================================== */

  const yearElement = $("#year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  /* ==========================================
     NAVIGATION
  ========================================== */

  const menuToggle = $("#menuToggle");
  const menuClose = $("#menuClose");
  const menuPanel = $("#menuPanel");

  function openMenu() {
    if (!menuPanel) return;

    menuPanel.classList.add("is-open");
    body.classList.add("menu-open");

    menuToggle?.setAttribute("aria-expanded", "true");
    menuToggle?.setAttribute("aria-label", "Close menu");

    menuPanel.setAttribute("aria-hidden", "false");

    const firstLink = $("a", menuPanel);
    firstLink?.focus();
  }

  function closeMenu() {
    if (!menuPanel) return;

    menuPanel.classList.remove("is-open");
    body.classList.remove("menu-open");

    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Open menu");

    menuPanel.setAttribute("aria-hidden", "true");
    menuToggle?.focus();
  }

  menuToggle?.addEventListener("click", () => {
    menuPanel?.classList.contains("is-open")
      ? closeMenu()
      : openMenu();
  });

  menuClose?.addEventListener("click", closeMenu);

  $$("#menuPanel a").forEach(link => {
    link.addEventListener("click", () => {
      if (link.getAttribute("href")?.startsWith("#")) {
        closeMenu();
      }
    });
  });

  /* ==========================================
     KEYBOARD CONTROLS
  ========================================== */

  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;

    if (menuPanel?.classList.contains("is-open")) {
      closeMenu();
    }

    if ($("#caseStudyModal")?.classList.contains("is-open")) {
      closeCaseStudy();
    }
  });

  /* ==========================================
     SMOOTH ANCHOR SCROLLING
  ========================================== */

  $$('a[href^="#"]').forEach(link => {
    link.addEventListener("click", event => {
      const href = link.getAttribute("href");

      if (!href || href === "#") return;

      const target = $(href);

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start"
      });
    });
  });

  /* ==========================================
     CURSOR GLOW
  ========================================== */

  const cursorGlow = $("#cursorGlow");

  if (cursorGlow && !touchDevice && !reducedMotion) {
    window.addEventListener("mousemove", event => {
      cursorGlow.style.left = `${event.clientX}px`;
      cursorGlow.style.top = `${event.clientY}px`;
    }, { passive: true });

    $$("a, button, .work-card").forEach(element => {
      element.addEventListener("mouseenter", () => {
        cursorGlow.classList.add("is-active");
      });

      element.addEventListener("mouseleave", () => {
        cursorGlow.classList.remove("is-active");
      });
    });
  }

  /* ==========================================
     GSAP REVEALS
  ========================================== */

  const revealElements = $$(".reveal");

  if (gsapInstance && !reducedMotion) {
    revealElements.forEach(element => {
      gsapInstance.fromTo(
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
          scrollTrigger: ScrollTrigger
            ? {
                trigger: element,
                start: "top 88%",
                once: true
              }
            : undefined
        }
      );
    });

    gsapInstance.fromTo(
      ".hero-copy",
      {
        y: 35,
        opacity: 0
      },
      {
        y: 0,
        opacity: 1,
        duration: 1.2,
        delay: 0.3,
        ease: "power3.out"
      }
    );
  } else {
    revealElements.forEach(element => {
      element.classList.add("is-visible");
    });
  }

  /* ==========================================
     SERVICES ACCORDION
  ========================================== */

  const serviceItems = $$(".service-item");

  serviceItems.forEach(item => {
    const trigger = $(".service-trigger", item);
    const panel = $(".service-details", item);

    if (!trigger || !panel) return;

    trigger.addEventListener("click", () => {
      const isOpen = trigger.getAttribute("aria-expanded") === "true";

      serviceItems.forEach(otherItem => {
        const otherTrigger = $(".service-trigger", otherItem);
        const otherPanel = $(".service-details", otherItem);

        if (!otherTrigger || !otherPanel) return;

        otherTrigger.setAttribute("aria-expanded", "false");
        otherPanel.hidden = true;
        otherItem.classList.remove("is-open");
      });

      if (!isOpen) {
        trigger.setAttribute("aria-expanded", "true");
        panel.hidden = false;
        item.classList.add("is-open");
      }
    });
  });

  /* ==========================================
     THREE.JS HERO SCULPTURE
  ========================================== */

  const canvas = $("#webgl");

  if (canvas) {
    let renderer;
    let scene;
    let camera;
    let sculpture;
    let animationFrame;
    let isDisposed = false;

    const pointer = {
      x: 0,
      y: 0
    };

    try {
      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(
        38,
        1,
        0.1,
        100
      );

      camera.position.z = 7;

      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance"
      });

      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 1.8)
      );

      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const ambientLight = new THREE.AmbientLight(
        0xffffff,
        1.2
      );

      scene.add(ambientLight);

      const keyLight = new THREE.DirectionalLight(
        0xffffff,
        3
      );

      keyLight.position.set(4, 5, 6);
      scene.add(keyLight);

      const blueLight = new THREE.PointLight(
        0x9bb9ff,
        35,
        20
      );

      blueLight.position.set(-4, 1, 3);
      scene.add(blueLight);

      const rimLight = new THREE.PointLight(
        0xffffff,
        25,
        20
      );

      rimLight.position.set(3, -4, -2);
      scene.add(rimLight);

      sculpture = new THREE.Group();
      scene.add(sculpture);

      const chromeMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xc9cdd2,
        metalness: 1,
        roughness: 0.17,
        clearcoat: 1,
        clearcoatRoughness: 0.08
      });

      const mainGeometry = new THREE.IcosahedronGeometry(
        1.45,
        2
      );

      const mainObject = new THREE.Mesh(
        mainGeometry,
        chromeMaterial
      );

      sculpture.add(mainObject);

      const knotGeometry = new THREE.TorusKnotGeometry(
        0.9,
        0.2,
        180,
        24,
        2,
        3
      );

      const knotMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xe4e7eb,
        metalness: 1,
        roughness: 0.12,
        clearcoat: 1
      });

      const knot = new THREE.Mesh(
        knotGeometry,
        knotMaterial
      );

      knot.scale.setScalar(0.62);
      knot.rotation.set(0.6, 0.3, 0.2);
      sculpture.add(knot);

      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xadb9c9,
        wireframe: true,
        transparent: true,
        opacity: 0.28
      });

      const ringOne = new THREE.Mesh(
        new THREE.TorusGeometry(2.05, 0.008, 8, 140),
        ringMaterial
      );

      ringOne.rotation.x = 1.1;
      ringOne.rotation.y = 0.35;
      sculpture.add(ringOne);

      const ringTwo = new THREE.Mesh(
        new THREE.TorusGeometry(2.3, 0.006, 8, 140),
        ringMaterial.clone()
      );

      ringTwo.rotation.x = 0.3;
      ringTwo.rotation.y = 1.2;
      sculpture.add(ringTwo);

      const particleGeometry = new THREE.BufferGeometry();
      const particleCount = 180;
      const particlePositions = new Float32Array(
        particleCount * 3
      );

      for (let i = 0; i < particleCount; i++) {
        particlePositions[i * 3] =
          (Math.random() - 0.5) * 8;

        particlePositions[i * 3 + 1] =
          (Math.random() - 0.5) * 8;

        particlePositions[i * 3 + 2] =
          (Math.random() - 0.5) * 5;
      }

      particleGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(particlePositions, 3)
      );

      const particles = new THREE.Points(
        particleGeometry,
        new THREE.PointsMaterial({
          color: 0xc8d0dc,
          size: 0.018,
          transparent: true,
          opacity: 0.55
        })
      );

      scene.add(particles);

      function resizeScene() {
        if (!renderer || !camera) return;

        const width = canvas.clientWidth || 500;
        const height = canvas.clientHeight || 500;

        renderer.setSize(width, height, false);

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }

      resizeScene();

      window.addEventListener("resize", resizeScene);

      if (!touchDevice) {
        window.addEventListener("mousemove", event => {
          pointer.x =
            (event.clientX / window.innerWidth - 0.5) * 2;

          pointer.y =
            (event.clientY / window.innerHeight - 0.5) * 2;
        }, { passive: true });
      }

      const clock = new THREE.Clock();

      function animate() {
        if (isDisposed) return;

        animationFrame = requestAnimationFrame(animate);

        if (document.hidden) return;

        const elapsed = clock.getElapsedTime();

        if (!reducedMotion) {
          sculpture.rotation.y +=
            (pointer.x * 0.18 - sculpture.rotation.y) * 0.025;

          sculpture.rotation.x +=
            (-pointer.y * 0.12 - sculpture.rotation.x) * 0.025;

          sculpture.rotation.y += 0.0015;

          ringOne.rotation.z += 0.001;
          ringTwo.rotation.x += 0.0008;

          knot.rotation.y += 0.002;
          knot.rotation.x += 0.001;

          particles.rotation.y = elapsed * 0.015;
        }

        renderer.render(scene, camera);
      }

      animate();

      window.addEventListener("pagehide", () => {
        isDisposed = true;

        cancelAnimationFrame(animationFrame);

        window.removeEventListener("resize", resizeScene);

        renderer?.dispose();
        mainGeometry.dispose();
        knotGeometry.dispose();
        chromeMaterial.dispose();
        knotMaterial.dispose();
        particleGeometry.dispose();
      }, { once: true });

    } catch (error) {
      console.error("MYRLORE 3D visual could not initialize:", error);
      canvas.style.display = "none";
    }
  }

  /* ==========================================
     PROJECT DATA
  ========================================== */

  const projects = {
    corroguard: {
      number: "PROJECT / 001",
      title: "CorroGuard",
      category: "ENGINEERING · DIGITAL PLATFORM",
      summary: "An interactive engineering chemistry platform exploring corrosion analysis and prevention.",
      overview: "CorroGuard is an educational engineering chemistry project designed to explain corrosion risk through interactive analysis, material information and prevention concepts.",
      features: [
        "Interactive corrosion risk calculator",
        "Metal material information",
        "Metal compatibility checker",
        "Corrosion type explanations",
        "Case studies and prevention information"
      ],
      technologies: ["HTML", "CSS", "JavaScript", "Chart.js"],
      status: "ACADEMIC CAPSTONE PROJECT",
      symbol: "CG",
      caption: "MATERIAL INTELLIGENCE",
      visual: "corro"
    },

    floodwatch: {
      number: "PROJECT / 002",
      title: "FloodWatch Chennai",
      category: "DATA · MAPPING · WEB PLATFORM",
      summary: "A web-based flood awareness and risk analysis platform focused on Chennai.",
      overview: "FloodWatch Chennai brings rainfall information, drainage infrastructure and geographic data together in an interactive platform for exploring urban flood-related information.",
      features: [
        "Rainfall statistics and visualisations",
        "Annual rainfall comparisons",
        "Interactive drainage infrastructure map",
        "Zone and ward search",
        "Drainage condition information",
        "Flood risk and awareness sections"
      ],
      technologies: ["HTML", "CSS", "JavaScript", "Leaflet", "Chart.js", "Python"],
      status: "ACADEMIC CAPSTONE PROJECT",
      symbol: "FW",
      caption: "CHENNAI / INDIA",
      visual: "flood"
    },

    aether: {
      number: "PROJECT / 003",
      title: "AETHER",
      category: "DIGITAL EXPERIENCE",
      summary: "An exploration of immersive digital environments and expressive 3D design.",
      overview: "AETHER is a creative concept exploring how three-dimensional visuals and interactive interfaces can create distinctive digital experiences.",
      features: [
        "Immersive visual direction",
        "3D interface concepts",
        "Interactive experience planning",
        "Experimental digital layouts"
      ],
      technologies: ["Three.js", "JavaScript", "WebGL", "CSS"],
      status: "INDEPENDENT CONCEPT",
      symbol: "A",
      caption: "IMMERSIVE DIGITAL WORLDS",
      visual: "aether"
    },

    nexus: {
      number: "PROJECT / 004",
      title: "NEXUS AI",
      category: "DIGITAL PRODUCT",
      summary: "A concept for an intelligent interface and unified command dashboard.",
      overview: "NEXUS AI is a conceptual product direction exploring how complex information and AI-assisted workflows might be presented through a clear digital interface.",
      features: [
        "Dashboard interface concept",
        "Information hierarchy",
        "AI interaction concepts",
        "Visual system exploration"
      ],
      technologies: ["HTML", "CSS", "JavaScript"],
      status: "INDEPENDENT CONCEPT",
      symbol: "N",
      caption: "INTELLIGENCE INTERFACE",
      visual: "nexus"
    },

    monolith: {
      number: "PROJECT / 005",
      title: "MONOLITH",
      category: "DIGITAL EXPERIENCE",
      summary: "A study in minimal digital architecture and bold visual composition.",
      overview: "MONOLITH is a conceptual exploration of structured layouts, restrained visual language and digital presentation.",
      features: [
        "Minimal interface direction",
        "Editorial layout exploration",
        "Typography studies",
        "Visual composition"
      ],
      technologies: ["HTML", "CSS", "JavaScript"],
      status: "INDEPENDENT CONCEPT",
      symbol: "M",
      caption: "STRUCTURE / FORM",
      visual: "monolith"
    },

    sentinel: {
      number: "PROJECT / 006",
      title: "SENTINEL",
      category: "DATA · DIGITAL PRODUCT",
      summary: "A conceptual monitoring dashboard focused on clarity and information.",
      overview: "SENTINEL explores a dashboard concept for presenting system information and monitoring data through a structured interface.",
      features: [
        "Monitoring dashboard concept",
        "Information visualisation",
        "Interface hierarchy",
        "Data presentation"
      ],
      technologies: ["HTML", "CSS", "JavaScript"],
      status: "INDEPENDENT CONCEPT",
      symbol: "S",
      caption: "SYSTEM MONITORING",
      visual: "sentinel"
    },

    form01: {
      number: "PROJECT / 007",
      title: "FORM 01",
      category: "CREATIVE EXPERIMENT",
      summary: "An experimental study of geometry, typography and digital form.",
      overview: "FORM 01 explores the relationship between simple geometry, visual rhythm and expressive digital composition.",
      features: [
        "Geometric compositions",
        "Typography experiments",
        "Motion studies",
        "Visual exploration"
      ],
      technologies: ["HTML", "CSS", "JavaScript"],
      status: "CREATIVE EXPERIMENT",
      symbol: "F",
      caption: "FORM / STUDY 001",
      visual: "form"
    },

    orbital: {
      number: "PROJECT / 008",
      title: "ORBITAL",
      category: "CREATIVE EXPERIMENT",
      summary: "A motion and interaction study inspired by orbital movement.",
      overview: "ORBITAL is an experimental visual concept using circular movement and spatial composition to explore motion in digital interfaces.",
      features: [
        "Orbital motion studies",
        "Animated visual elements",
        "Spatial composition",
        "Interaction exploration"
      ],
      technologies: ["JavaScript", "CSS", "Three.js"],
      status: "CREATIVE EXPERIMENT",
      symbol: "O",
      caption: "MOTION / ORBIT",
      visual: "orbital"
    },

    sonora: {
      number: "PROJECT / 009",
      title: "SONORA",
      category: "DIGITAL EXPERIENCE",
      summary: "A conceptual digital experience exploring sound and visual identity.",
      overview: "SONORA is a creative concept exploring the visual language of sound through digital composition and interface design.",
      features: [
        "Sound-inspired visual direction",
        "Interface concept",
        "Typography exploration",
        "Digital identity studies"
      ],
      technologies: ["HTML", "CSS", "JavaScript"],
      status: "INDEPENDENT CONCEPT",
      symbol: "SO",
      caption: "SOUND / EXPERIENCE",
      visual: "sonora"
    },

    atlas: {
      number: "PROJECT / 010",
      title: "ATLAS",
      category: "DATA · MAPPING",
      summary: "A conceptual exploration of geographic information and digital mapping.",
      overview: "ATLAS explores how geographic information can be organised and presented through accessible digital interfaces.",
      features: [
        "Mapping interface concept",
        "Geographic data presentation",
        "Location-based information",
        "Visual hierarchy"
      ],
      technologies: ["JavaScript", "Leaflet", "HTML", "CSS"],
      status: "INDEPENDENT CONCEPT",
      symbol: "AT",
      caption: "GEOGRAPHIC EXPLORATION",
      visual: "atlas"
    },

    apex: {
      number: "PROJECT / 011",
      title: "APEX",
      category: "DIGITAL EXPERIENCE",
      summary: "A concept exploring high-impact digital presentation and interaction.",
      overview: "APEX is a conceptual study of digital presentation, expressive typography and a confident visual system.",
      features: [
        "Visual identity direction",
        "Digital layout concept",
        "Typography studies",
        "Interaction planning"
      ],
      technologies: ["HTML", "CSS", "JavaScript"],
      status: "INDEPENDENT CONCEPT",
      symbol: "A",
      caption: "BEYOND THE EXPECTED",
      visual: "apex"
    },

    echo: {
      number: "PROJECT / 012",
      title: "ECHO",
      category: "CREATIVE EXPERIMENT",
      summary: "A digital identity study exploring personal data and visual expression.",
      overview: "ECHO is a creative experiment exploring how digital identity and personal information might be represented through a distinctive visual system.",
      features: [
        "Digital identity exploration",
        "Personal data concept",
        "Visual system studies",
        "Experimental interface direction"
      ],
      technologies: ["HTML", "CSS", "JavaScript"],
      status: "CREATIVE EXPERIMENT",
      symbol: "E",
      caption: "DIGITAL IDENTITY STUDY",
      visual: "echo"
    }
  };

  /* ==========================================
     PROJECT FILTERS
  ========================================== */

  const projectCards = $$("[data-case-study]");
  const filterButtons = $$("[data-filter]");

  function applyProjectFilter(filter) {
    projectCards.forEach(card => {
      const category = card.dataset.projectCategory || "";
      const visible =
        filter === "all" || category === filter;

      card.hidden = !visible;
      card.classList.toggle("is-filtered-out", !visible);
    });

    filterButtons.forEach(button => {
      const active = button.dataset.filter === filter;

      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      applyProjectFilter(button.dataset.filter || "all");
    });
  });

  /* ==========================================
     CASE STUDY MODAL
  ========================================== */

  const caseModal = $("#caseStudyModal");
  const casePanel = $(".case-panel", caseModal || document);
  const caseHeroArt = $("#caseHeroArt");
  const caseIndex = $("#caseIndex");
  const caseSymbol = $("#caseSymbol");
  const caseArtCaption = $("#caseArtCaption");
  const caseCategory = $("#caseCategory");
  const caseTitle = $("#caseTitle");
  const caseSummary = $("#caseSummary");
  const caseOverview = $("#caseOverview");
  const caseFeatures = $("#caseFeatures");
  const caseTech = $("#caseTech");
  const caseStatusText = $("#caseStatusText");

  let lastFocusedElement = null;

  function populateCaseStudy(projectId) {
    const project = projects[projectId];

    if (!project) return false;

    if (caseIndex) caseIndex.textContent = project.number;
    if (caseSymbol) caseSymbol.textContent = project.symbol;
    if (caseArtCaption) {
      caseArtCaption.textContent = project.caption;
    }

    if (caseCategory) {
      caseCategory.textContent = project.category;
    }

    if (caseTitle) caseTitle.textContent = project.title;
    if (caseSummary) caseSummary.textContent = project.summary;
    if (caseOverview) caseOverview.textContent = project.overview;

    if (caseStatusText) {
      caseStatusText.textContent = project.status;
    }

    if (caseHeroArt) {
      [
        "case-art-corroguard",
        "case-art-floodwatch",
        "case-art-aether",
        "case-art-nexus",
        "case-art-monolith",
        "case-art-sentinel",
        "case-art-form",
        "case-art-orbital",
        "case-art-sonora",
        "case-art-atlas",
        "case-art-apex",
        "case-art-echo"
      ].forEach(className => {
        caseHeroArt.classList.remove(className);
      });

      caseHeroArt.dataset.project = projectId;
      caseHeroArt.classList.add(`case-art-${project.visual}`);
    }

    if (caseFeatures) {
      caseFeatures.replaceChildren();

      project.features.forEach(feature => {
        const item = document.createElement("li");
        item.textContent = feature;
        caseFeatures.appendChild(item);
      });
    }

    if (caseTech) {
      caseTech.replaceChildren();

      project.technologies.forEach(technology => {
        const tag = document.createElement("span");
        tag.className = "case-tech-tag";
        tag.textContent = technology;
        caseTech.appendChild(tag);
      });
    }

    return true;
  }

  function openCaseStudy(projectId, trigger) {
    if (!caseModal || !populateCaseStudy(projectId)) return;

    lastFocusedElement = trigger || document.activeElement;

    caseModal.classList.add("is-open");
    caseModal.setAttribute("aria-hidden", "false");
    caseModal.removeAttribute("inert");

    body.classList.add("case-open");

    if (gsapInstance && !reducedMotion) {
      gsapInstance.fromTo(
        casePanel,
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.65,
          ease: "power3.out"
        }
      );
    }

    casePanel?.focus();
  }

  function closeCaseStudy() {
    if (!caseModal) return;

    caseModal.classList.remove("is-open");
    caseModal.setAttribute("aria-hidden", "true");
    caseModal.setAttribute("inert", "");

    body.classList.remove("case-open");

    lastFocusedElement?.focus();
  }

  projectCards.forEach(card => {
    card.addEventListener("click", event => {
      const projectId = card.dataset.caseStudy;

      if (!projects[projectId]) return;

      event.preventDefault();

      openCaseStudy(projectId, card);
    });
  });

  $$("[data-case-close]").forEach(button => {
    button.addEventListener("click", closeCaseStudy);
  });

  $("#caseClose")?.addEventListener("click", closeCaseStudy);

  casePanel?.addEventListener("keydown", event => {
    if (event.key !== "Tab") return;

    const focusable = $$(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      casePanel
    ).filter(element => element.offsetParent !== null);

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
  });

  /* ==========================================
     MAGNETIC ELEMENTS
  ========================================== */

  if (!touchDevice && !reducedMotion && gsapInstance) {
    $$("[data-magnetic], .magnetic, .nav-cta").forEach(element => {
      element.addEventListener("mousemove", event => {
        const rect = element.getBoundingClientRect();

        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;

        gsapInstance.to(element, {
          x: x * 0.15,
          y: y * 0.15,
          duration: 0.3,
          ease: "power2.out"
        });
      });

      element.addEventListener("mouseleave", () => {
        gsapInstance.to(element, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: "elastic.out(1, 0.4)"
        });
      });
    });
  }

  /* ==========================================
     PAGE TRANSITIONS
  ========================================== */

  const pageTransition = $("#pageTransition");
  const transitionCurtain = $(".transition-curtain");

  if (transitionCurtain) {
    if (gsapInstance && !reducedMotion) {
      gsapInstance.set(transitionCurtain, {
        scaleY: 1,
        transformOrigin: "top"
      });

      gsapInstance.to(transitionCurtain, {
        scaleY: 0,
        duration: 0.8,
        delay: 0.15,
        ease: "power3.inOut",
        onComplete: () => {
          pageTransition?.classList.remove("is-active");
        }
      });
    } else {
      transitionCurtain.style.transform = "scaleY(0)";
    }
  }

  $$('a[href]:not([target="_blank"]):not([download])').forEach(link => {
    link.addEventListener("click", event => {
      const href = link.getAttribute("href");

      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
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

      if (
        destination.origin !== window.location.origin ||
        destination.pathname === window.location.pathname
      ) {
        return;
      }

      event.preventDefault();

      if (!transitionCurtain) {
        window.location.href = destination.href;
        return;
      }

      pageTransition?.classList.add("is-active");

      if (gsapInstance && !reducedMotion) {
        gsapInstance.to(transitionCurtain, {
          scaleY: 1,
          transformOrigin: "bottom",
          duration: 0.65,
          ease: "power3.inOut",
          onComplete: () => {
            window.location.href = destination.href;
          }
        });
      } else {
        window.location.href = destination.href;
      }
    });
  });

  /* ==========================================
     SCROLL PROGRESS
  ========================================== */

  const scrollProgress = $("#scrollProgress");

  function updateScrollProgress() {
    if (!scrollProgress) return;

    const totalHeight =
      document.documentElement.scrollHeight -
      window.innerHeight;

    const progress = totalHeight > 0
      ? window.scrollY / totalHeight
      : 0;

    scrollProgress.style.transform =
      `scaleX(${Math.min(1, Math.max(0, progress))})`;
  }

  window.addEventListener("scroll", updateScrollProgress, {
    passive: true
  });

  updateScrollProgress();

  /* ==========================================
     BACK TO TOP
  ========================================== */

  const backToTop = $("#backToTop");

  backToTop?.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: reducedMotion ? "auto" : "smooth"
    });
  });

  /* ==========================================
     IMAGE LOADING
  ========================================== */

  $$("img[loading='lazy']").forEach(image => {
    image.addEventListener("load", () => {
      image.classList.add("is-loaded");
    });

    image.addEventListener("error", () => {
      image.classList.add("image-error");
    });
  });

  /* ==========================================
     ACCESSIBILITY / FINAL STATE
  ========================================== */

  if (menuPanel) {
    menuPanel.setAttribute("aria-hidden", "true");
  }

  if (caseModal) {
    caseModal.setAttribute("aria-hidden", "true");
    caseModal.setAttribute("inert", "");
  }

  document.documentElement.classList.add("js-ready");
  body.classList.add("js-ready");

  console.info("MYRLORE — interaction system initialized.");

})();
