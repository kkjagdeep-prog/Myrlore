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
  const touchDevice = window.matchMedia("(pointer: coarse)").matches;

  const gsapInstance = window.gsap || null;
  const ScrollTrigger = window.ScrollTrigger || null;

  if (gsapInstance && ScrollTrigger) {
    gsapInstance.registerPlugin(ScrollTrigger);
  }

  /* ==========================================
     PAGE LOADER
  ========================================== */

  const pageLoader = $("#pageLoader");
  let loaderHidden = false;

  function hideLoader() {
    if (loaderHidden) return;
    loaderHidden = true;

    body.classList.add("loaded");

    if (!pageLoader) return;

    pageLoader.classList.add("is-hidden");

    window.setTimeout(() => {
      pageLoader.style.display = "none";
    }, 800);
  }

  window.addEventListener("load", () => {
    window.setTimeout(hideLoader, 400);
  }, { once: true });

  window.setTimeout(hideLoader, 5000);

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

    menuPanel.classList.add("is-open", "open");
    body.classList.add("menu-open");

    menuToggle?.setAttribute("aria-expanded", "true");
    menuToggle?.setAttribute("aria-label", "Close menu");
    menuPanel.setAttribute("aria-hidden", "false");

    $("a", menuPanel)?.focus();
  }

  function closeMenu(returnFocus = true) {
    if (!menuPanel) return;

    menuPanel.classList.remove("is-open", "open");
    body.classList.remove("menu-open");

    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Open menu");
    menuPanel.setAttribute("aria-hidden", "true");

    if (returnFocus) menuToggle?.focus();
  }

  menuToggle?.addEventListener("click", () => {
    menuPanel?.classList.contains("is-open")
      ? closeMenu()
      : openMenu();
  });

  menuClose?.addEventListener("click", () => closeMenu());

  $$("#menuPanel a").forEach(link => {
    link.addEventListener("click", () => {
      if (link.getAttribute("href")?.startsWith("#")) {
        closeMenu(false);
      }
    });
  });

  /* ==========================================
     SMOOTH ANCHOR SCROLLING
  ========================================== */

  $$('a[href^="#"]').forEach(link => {
    link.addEventListener("click", event => {
      const href = link.getAttribute("href");

      if (!href || href === "#") return;

      let target;

      try {
        target = $(href);
      } catch {
        return;
      }

      if (!target) return;

      // Let the case-study system handle project cards.
      if (link.matches("[data-case-study]")) return;

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
        cursorGlow.classList.add("is-active", "cursor-hover");

        if (element.matches(".work-card")) {
          cursorGlow.classList.add("cursor-project");
          cursorGlow.dataset.label = "VIEW PROJECT";
        }
      });

      element.addEventListener("mouseleave", () => {
        cursorGlow.classList.remove(
          "is-active",
          "cursor-hover",
          "cursor-project"
        );
        cursorGlow.removeAttribute("data-label");
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
        { y: 45, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          clearProps: "transform",
          scrollTrigger: ScrollTrigger
            ? {
                trigger: element,
                start: "top 88%",
                once: true
              }
            : undefined,
          onComplete: () => element.classList.add("is-visible")
        }
      );
    });

    if ($(".hero-copy")) {
      gsapInstance.fromTo(
        ".hero-copy",
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          delay: 0.3,
          ease: "power3.out",
          clearProps: "transform"
        }
      );
    }
  } else {
    revealElements.forEach(element => {
      element.classList.add("is-visible");
      element.style.opacity = "1";
      element.style.transform = "none";
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

    // Ensure the initial state is predictable.
    const initiallyOpen =
      trigger.getAttribute("aria-expanded") === "true";

    panel.hidden = !initiallyOpen;
    item.classList.toggle("is-open", initiallyOpen);
    item.classList.toggle("is-active", initiallyOpen);

    trigger.addEventListener("click", () => {
      const isOpen =
        trigger.getAttribute("aria-expanded") === "true";

      serviceItems.forEach(otherItem => {
        const otherTrigger = $(".service-trigger", otherItem);
        const otherPanel = $(".service-details", otherItem);

        if (!otherTrigger || !otherPanel) return;

        otherTrigger.setAttribute("aria-expanded", "false");
        otherPanel.hidden = true;
        otherItem.classList.remove("is-open", "is-active");
      });

      if (!isOpen) {
        trigger.setAttribute("aria-expanded", "true");
        panel.hidden = false;
        item.classList.add("is-open", "is-active");
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
    let resizeObserver;

    const pointer = { x: 0, y: 0 };
    const disposableGeometries = [];
    const disposableMaterials = [];

    try {
      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
      camera.position.z = 7;

      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance"
      });

      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, 1.8)
      );
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      scene.add(new THREE.AmbientLight(0xffffff, 1.2));

      const keyLight = new THREE.DirectionalLight(0xffffff, 3);
      keyLight.position.set(4, 5, 6);
      scene.add(keyLight);

      const blueLight = new THREE.PointLight(0x9bb9ff, 35, 20);
      blueLight.position.set(-4, 1, 3);
      scene.add(blueLight);

      const rimLight = new THREE.PointLight(0xffffff, 25, 20);
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
      disposableMaterials.push(chromeMaterial);

      const mainGeometry = new THREE.IcosahedronGeometry(1.45, 2);
      disposableGeometries.push(mainGeometry);

      sculpture.add(
        new THREE.Mesh(mainGeometry, chromeMaterial)
      );

      const knotGeometry = new THREE.TorusKnotGeometry(
        0.9, 0.2, 180, 24, 2, 3
      );
      disposableGeometries.push(knotGeometry);

      const knotMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xe4e7eb,
        metalness: 1,
        roughness: 0.12,
        clearcoat: 1
      });
      disposableMaterials.push(knotMaterial);

      const knot = new THREE.Mesh(knotGeometry, knotMaterial);
      knot.scale.setScalar(0.62);
      knot.rotation.set(0.6, 0.3, 0.2);
      sculpture.add(knot);

      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xadb9c9,
        wireframe: true,
        transparent: true,
        opacity: 0.28
      });
      disposableMaterials.push(ringMaterial);

      const ringOneGeometry = new THREE.TorusGeometry(
        2.05, 0.008, 8, 140
      );
      disposableGeometries.push(ringOneGeometry);

      const ringOne = new THREE.Mesh(
        ringOneGeometry,
        ringMaterial
      );
      ringOne.rotation.x = 1.1;
      ringOne.rotation.y = 0.35;
      sculpture.add(ringOne);

      const ringTwoGeometry = new THREE.TorusGeometry(
        2.3, 0.006, 8, 140
      );
      disposableGeometries.push(ringTwoGeometry);

      const ringTwoMaterial = ringMaterial.clone();
      disposableMaterials.push(ringTwoMaterial);

      const ringTwo = new THREE.Mesh(
        ringTwoGeometry,
        ringTwoMaterial
      );
      ringTwo.rotation.x = 0.3;
      ringTwo.rotation.y = 1.2;
      sculpture.add(ringTwo);

      const particleGeometry = new THREE.BufferGeometry();
      disposableGeometries.push(particleGeometry);

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

      const particleMaterial = new THREE.PointsMaterial({
        color: 0xc8d0dc,
        size: 0.018,
        transparent: true,
        opacity: 0.55
      });
      disposableMaterials.push(particleMaterial);

      const particles = new THREE.Points(
        particleGeometry,
        particleMaterial
      );
      scene.add(particles);

      function resizeScene() {
        if (!renderer || !camera || isDisposed) return;

        const width = canvas.clientWidth || 500;
        const height = canvas.clientHeight || 500;

        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }

      resizeScene();

      window.addEventListener("resize", resizeScene);

      if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(resizeScene);
        resizeObserver.observe(canvas);
      }

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
        resizeObserver?.disconnect();
        window.removeEventListener("resize", resizeScene);

        disposableGeometries.forEach(geometry => geometry.dispose());
        disposableMaterials.forEach(material => material.dispose());

        renderer?.dispose();
      }, { once: true });

    } catch (error) {
      console.error(
        "MYRLORE 3D visual could not initialize:",
        error
      );
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
      const visible = filter === "all" || category === filter;

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
    if (caseArtCaption) caseArtCaption.textContent = project.caption;
    if (caseCategory) caseCategory.textContent = project.category;
    if (caseTitle) caseTitle.textContent = project.title;
    if (caseSummary) caseSummary.textContent = project.summary;
    if (caseOverview) caseOverview.textContent = project.overview;

    if (caseStatusText) {
      caseStatusText.textContent = project.status;
    }

    if (caseHeroArt) {
      Object.values(projects).forEach(entry => {
        caseHeroArt.classList.remove(`case-art-${entry.visual}`);
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

    // Let the CSS panel transition control its horizontal slide.
    // Avoid GSAP's y transform overriding translateX from the stylesheet.
    if (gsapInstance && !reducedMotion && casePanel) {
      gsapInstance.fromTo(
        casePanel,
        { opacity: 0.65 },
        {
          opacity: 1,
          duration: 0.45,
          ease: "power2.out",
          clearProps: "opacity"
        }
      );
    }

    window.setTimeout(() => casePanel?.focus(), 50);
  }

  function closeCaseStudy() {
    if (!caseModal) return;

    caseModal.classList.remove("is-open");
    caseModal.setAttribute("aria-hidden", "true");
    caseModal.setAttribute("inert", "");

    body.classList.remove("case-open");

    if (lastFocusedElement?.isConnected) {
      lastFocusedElement.focus();
    }
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

  // Clicking the modal backdrop closes the case study.
  caseModal?.addEventListener("click", event => {
    if (event.target === caseModal) {
      closeCaseStudy();
    }
  });

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
          pageTransition?.classList.remove("is-active", "active");
        }
      });
    } else {
      transitionCurtain.style.transform = "scaleY(0)";
      pageTransition?.classList.remove("is-active", "active");
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

      pageTransition?.classList.add("is-active", "active");

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
        transitionCurtain.style.transform = "scaleY(1)";
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
      document.documentElement.scrollHeight - window.innerHeight;

    const progress = totalHeight > 0
      ? window.scrollY / totalHeight
      : 0;

    scrollProgress.style.transform =
      `scaleX(${Math.min(1, Math.max(0, progress))})`;
  }

  window.addEventListener("scroll", updateScrollProgress, {
    passive: true
  });

  window.addEventListener("resize", updateScrollProgress);
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
    if (image.complete && image.naturalWidth > 0) {
      image.classList.add("is-loaded");
    }

    image.addEventListener("load", () => {
      image.classList.add("is-loaded");
    });

    image.addEventListener("error", () => {
      image.classList.add("image-error");
    });
  });

  /* ==========================================
     MYRLORE SECRET ARCHIVE — CAPRI
     Trigger:
     UP UP DOWN DOWN LEFT RIGHT LEFT RIGHT B A

     Asset:
     capri-spritesheet.png
     1536 × 1024
     4 columns × 4 rows
     16 frames
  ========================================== */

  const secretSequence = [
    "arrowup",
    "arrowup",
    "arrowdown",
    "arrowdown",
    "arrowleft",
    "arrowright",
    "arrowleft",
    "arrowright",
    "b",
    "a"
  ];

  let secretSequencePosition = 0;
  let secretOverlay = null;
  let secretAnimationFrame = 0;
  let secretGlitchInterval = 0;
  let secretSpriteFrame = 0;
  let secretLastFrameTime = 0;
  let secretFlightStart = 0;
  let secretIsOpen = false;
  let secretPreviousFocus = null;
  let secretResizeHandler = null;
  let secretImage = null;

  const SECRET_STYLE_ID = "myrlore-secret-styles";

  function addSecretStyles() {
    if ($(`#${SECRET_STYLE_ID}`)) return;

    const style = document.createElement("style");
    style.id = SECRET_STYLE_ID;

    style.textContent = `
      #myrloreSecretOverlay {
        position: fixed;
        inset: 0;
        z-index: 999999;
        display: grid;
        place-items: center;
        overflow: hidden;
        isolation: isolate;
        background:
          radial-gradient(ellipse at 50% 48%,
            rgba(45, 48, 53, .34),
            transparent 48%),
          radial-gradient(ellipse at 50% 50%,
            #101114 0%,
            #070809 72%);
        color: #e8e7e2;
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transition:
          opacity .55s ease,
          visibility .55s ease;
      }

      #myrloreSecretOverlay.is-visible {
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
        opacity: .22;
        background: repeating-linear-gradient(
          to bottom,
          transparent 0,
          transparent 3px,
          rgba(255,255,255,.055) 4px
        );
        mix-blend-mode: screen;
      }

      #myrloreSecretOverlay::after {
        content: "";
        position: absolute;
        inset: -50%;
        z-index: 1;
        pointer-events: none;
        opacity: .12;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.92' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E");
        animation: myrloreNoise .22s steps(2) infinite;
      }

      #myrloreSecretOverlay.secret-glitch {
        animation: myrloreScreenGlitch .18s steps(2);
      }

      #myrloreSecretOverlay.secret-glitch::before {
        opacity: .52;
      }

      #myrloreSecretOverlay .secret-flash {
        position: absolute;
        inset: 0;
        z-index: 5;
        pointer-events: none;
        opacity: 0;
        background: linear-gradient(
          90deg,
          transparent 0 12%,
          rgba(255,255,255,.12) 12.3% 12.8%,
          transparent 13.1% 62%,
          rgba(255,255,255,.08) 62.2% 63%,
          transparent 63.3%
        );
      }

      #myrloreSecretOverlay.secret-glitch .secret-flash {
        animation: myrloreFlash .2s steps(2);
      }

      #myrloreSecretOverlay .secret-content {
        position: relative;
        z-index: 3;
        width: min(780px, 88vw);
        text-align: center;
        opacity: 0;
        transform: translateY(18px);
        transition:
          opacity .7s ease .35s,
          transform .7s cubic-bezier(.2,.7,.2,1) .35s;
      }

      #myrloreSecretOverlay.is-arrived .secret-content {
        opacity: 1;
        transform: translateY(0);
      }

      #myrloreSecretOverlay .secret-kicker {
        margin: 0 0 22px;
        color: rgba(232,231,226,.5);
        font: 10px/1.5 "DM Mono", monospace;
        letter-spacing: .32em;
        text-transform: uppercase;
      }

      #myrloreSecretOverlay .secret-title {
        margin: 0;
        color: #e8e7e2;
        font: 500 clamp(36px, 7vw, 82px)/.98 "Manrope", sans-serif;
        letter-spacing: -.075em;
      }

      #myrloreSecretOverlay .secret-title span {
        display: block;
        color: rgba(232,231,226,.42);
        font-size: .35em;
        font-weight: 400;
        letter-spacing: .22em;
        margin-top: 18px;
      }

      #myrloreSecretOverlay .secret-message {
        margin: 28px 0 0;
        color: rgba(232,231,226,.48);
        font: 10px/1.8 "DM Mono", monospace;
        letter-spacing: .2em;
        text-transform: uppercase;
      }

      #myrloreSecretOverlay .secret-return {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 48px;
        margin-top: 42px;
        padding: 0 25px;
        border: 1px solid rgba(232,231,226,.28);
        background: transparent;
        color: #e8e7e2;
        cursor: pointer;
        font: 10px/1 "DM Mono", monospace;
        letter-spacing: .18em;
        transition:
          background .25s ease,
          color .25s ease,
          border-color .25s ease;
      }

      #myrloreSecretOverlay .secret-return:hover,
      #myrloreSecretOverlay .secret-return:focus-visible {
        border-color: #e8e7e2;
        background: #e8e7e2;
        color: #08090b;
        outline: none;
      }

      #capriFlight {
        position: absolute;
        z-index: 4;
        top: 0;
        left: 0;
        width: 180px;
        height: 120px;
        pointer-events: none;
        opacity: 0;
        transform: translate3d(-30vw, 70vh, 0);
        will-change: transform, opacity;
      }

      #capriCanvas {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: contain;
        image-rendering: auto;
        filter:
          drop-shadow(0 12px 24px rgba(0,0,0,.42))
          drop-shadow(0 0 12px rgba(255,255,255,.12));
        animation: capriIdle 2.8s ease-in-out infinite;
      }

      #capriFlight::before,
      #capriFlight::after {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        opacity: 0;
        background: inherit;
      }

      #capriFlight.capri-glitch::before {
        opacity: .32;
        transform: translate(-7px, 2px);
        filter: hue-rotate(120deg);
        clip-path: inset(15% 0 55% 0);
      }

      #capriFlight.capri-glitch::after {
        opacity: .3;
        transform: translate(7px, -2px);
        filter: hue-rotate(260deg);
        clip-path: inset(62% 0 12% 0);
      }

      #myrloreSecretOverlay .secret-corner {
        position: absolute;
        z-index: 3;
        left: 28px;
        bottom: 25px;
        color: rgba(232,231,226,.28);
        font: 9px/1.6 "DM Mono", monospace;
        letter-spacing: .14em;
      }

      @keyframes myrloreNoise {
        0% { transform: translate(0,0); }
        25% { transform: translate(2%,-1%); }
        50% { transform: translate(-1%,2%); }
        75% { transform: translate(1%,1%); }
        100% { transform: translate(-2%,-1%); }
      }

      @keyframes myrloreScreenGlitch {
        0% { transform: translateX(0); filter: none; }
        25% { transform: translateX(-3px); filter: contrast(1.5); }
        50% { transform: translateX(3px); filter: brightness(1.4); }
        75% { transform: translateX(-1px); }
        100% { transform: translateX(0); filter: none; }
      }

      @keyframes myrloreFlash {
        0% { opacity: 0; transform: translateX(-4%); }
        25% { opacity: .7; }
        100% { opacity: 0; transform: translateX(4%); }
      }

      @keyframes capriIdle {
        0%, 100% { translate: 0 0; }
        50% { translate: 0 -7px; }
      }

      @media (max-width: 650px) {
        #capriFlight {
          width: 132px;
          height: 88px;
        }

        #myrloreSecretOverlay .secret-content {
          width: 90vw;
        }

        #myrloreSecretOverlay .secret-kicker {
          font-size: 8px;
          letter-spacing: .22em;
        }

        #myrloreSecretOverlay .secret-message {
          font-size: 8px;
          letter-spacing: .12em;
        }

        #myrloreSecretOverlay .secret-corner {
          left: 16px;
          bottom: 14px;
          font-size: 8px;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        #myrloreSecretOverlay,
        #myrloreSecretOverlay *,
        #myrloreSecretOverlay::before,
        #myrloreSecretOverlay::after {
          animation: none !important;
          transition-duration: .01ms !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function createSecretOverlay() {
    if (secretOverlay) return secretOverlay;

    addSecretStyles();

    secretOverlay = document.createElement("section");
    secretOverlay.id = "myrloreSecretOverlay";
    secretOverlay.setAttribute("role", "dialog");
    secretOverlay.setAttribute("aria-modal", "true");
    secretOverlay.setAttribute("aria-label", "MYRLORE restricted archive");

    secretOverlay.innerHTML = `
      <div class="secret-flash" aria-hidden="true"></div>

      <div id="capriFlight" aria-hidden="true">
        <canvas id="capriCanvas" width="384" height="256"></canvas>
      </div>

      <div class="secret-content">
        <p class="secret-kicker">MYRLORE® / RESTRICTED ARCHIVE</p>
        <h2 class="secret-title">
          Stay curious.
          <span>YOU FOUND SOMETHING THAT WASN'T MEANT TO BE FOUND</span>
        </h2>
        <button class="secret-return" id="secretClose" type="button">
          RETURN TO THE STUDIO
        </button>
      </div>

      <div class="secret-corner">ARCHIVE ACCESS / 001</div>
    `;

    body.appendChild(secretOverlay);

    secretOverlay.addEventListener("click", event => {
      if (event.target === secretOverlay) {
        closeSecretArchive();
      }
    });

    $("#secretClose", secretOverlay)?.addEventListener(
      "click",
      closeSecretArchive
    );

    return secretOverlay;
  }

  function drawCapriFrame(frame) {
    const canvasElement = $("#capriCanvas", secretOverlay);
    if (!canvasElement || !secretImage?.complete ||
        !secretImage.naturalWidth) return;

    const context = canvasElement.getContext("2d");
    if (!context) return;

    const columns = 4;
    const rows = 4;
    const frameWidth = secretImage.naturalWidth / columns;
    const frameHeight = secretImage.naturalHeight / rows;

    const frameIndex = ((frame % 16) + 16) % 16;
    const sourceX = (frameIndex % columns) * frameWidth;
    const sourceY = Math.floor(frameIndex / columns) * frameHeight;

    context.clearRect(0, 0, canvasElement.width, canvasElement.height);

    context.drawImage(
      secretImage,
      sourceX,
      sourceY,
      frameWidth,
      frameHeight,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );
  }

  function loadCapriSprite() {
    if (secretImage) return;

    secretImage = new Image();
    secretImage.decoding = "async";

    secretImage.onload = () => {
      drawCapriFrame(0);
    };

    secretImage.onerror = () => {
      console.error(
        "MYRLORE Easter egg: could not load capri-spritesheet.png. " +
        "Place it beside index.html and script.js."
      );
    };

    secretImage.src = "capri-spritesheet.png";
  }

  function easeInOutCubic(value) {
    return value < 0.5
      ? 4 * value * value * value
      : 1 - Math.pow(-2 * value + 2, 3) / 2;
  }

  function getCapriPath(progress) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const mobile = width <= 650;

    const points = mobile
      ? [
          [-0.28 * width, 0.68 * height],
          [0.16 * width, 0.45 * height],
          [0.72 * width, 0.22 * height],
          [0.82 * width, 0.63 * height],
          [0.48 * width, 0.51 * height]
        ]
      : [
          [-0.2 * width, 0.68 * height],
          [0.18 * width, 0.28 * height],
          [0.66 * width, 0.17 * height],
          [0.82 * width, 0.65 * height],
          [0.43 * width, 0.49 * height]
        ];

    const segments = points.length - 1;
    const scaled = Math.min(0.99999, Math.max(0, progress)) * segments;
    const index = Math.floor(scaled);
    const local = easeInOutCubic(scaled - index);

    const start = points[index];
    const end = points[index + 1];

    return {
      x: start[0] + (end[0] - start[0]) * local,
      y: start[1] + (end[1] - start[1]) * local
    };
  }

  function animateCapri(timestamp) {
    if (!secretIsOpen) return;

    if (!secretLastFrameTime) {
      secretLastFrameTime = timestamp;
    }

    const frameInterval = 1000 / 12;

    if (timestamp - secretLastFrameTime >= frameInterval) {
      secretSpriteFrame = (secretSpriteFrame + 1) % 16;
      drawCapriFrame(secretSpriteFrame);
      secretLastFrameTime = timestamp;
    }

    const elapsed = timestamp - secretFlightStart;
    const flightDuration = reducedMotion ? 0 : 5600;
    const progress = flightDuration
      ? Math.min(1, elapsed / flightDuration)
      : 1;

    const position = getCapriPath(progress);
    const flight = $("#capriFlight", secretOverlay);

    if (flight) {
      const width = window.innerWidth <= 650 ? 132 : 180;
      const height = width * (2 / 3);
      const rotation = progress >= 1
        ? 0
        : Math.sin(progress * Math.PI * 5) * 13;

      const scale = progress >= 1 ? 0.82 : 0.9 + Math.sin(progress * 12) * 0.06;

      flight.style.opacity = "1";
      flight.style.transform =
        `translate3d(${position.x - width / 2}px, ${position.y - height / 2}px, 0) ` +
        `rotate(${rotation}deg) scale(${scale})`;
    }

    if (progress >= 1) {
      secretOverlay.classList.add("is-arrived");
    }

    secretAnimationFrame = requestAnimationFrame(animateCapri);
  }

  function triggerSecretGlitch() {
    if (!secretIsOpen || !secretOverlay) return;

    secretOverlay.classList.add("secret-glitch");
    $("#capriFlight", secretOverlay)?.classList.add("capri-glitch");

    window.setTimeout(() => {
      secretOverlay?.classList.remove("secret-glitch");
      $("#capriFlight", secretOverlay)?.classList.remove("capri-glitch");
    }, 220);
  }

  function openSecretArchive() {
    if (secretIsOpen) return;

    secretIsOpen = true;
    secretPreviousFocus = document.activeElement;

    createSecretOverlay();
    loadCapriSprite();

    body.classList.add("myrlore-secret");
    body.style.overflow = "hidden";

    secretOverlay.classList.remove("is-arrived");
    secretOverlay.classList.add("is-visible");

    secretSpriteFrame = 0;
    secretLastFrameTime = 0;
    secretFlightStart = performance.now();

    drawCapriFrame(0);

    const flight = $("#capriFlight", secretOverlay);

    if (flight) {
      flight.style.opacity = "0";
      flight.style.transform =
        `translate3d(-25vw, ${window.innerHeight * 0.68}px, 0)`;
    }

    if (reducedMotion) {
      secretOverlay.classList.add("is-arrived");

      if (flight) {
        flight.style.opacity = "1";
        flight.style.transform =
          `translate3d(${window.innerWidth * 0.32}px, ${window.innerHeight * 0.43}px, 0)`;
      }
    } else {
      secretAnimationFrame = requestAnimationFrame(animateCapri);

      secretGlitchInterval = window.setInterval(() => {
        if (Math.random() > 0.28) triggerSecretGlitch();
      }, 700);
    }

    secretResizeHandler = () => {
      if (!secretIsOpen || reducedMotion) return;
      // The flight path reads the current viewport dimensions each frame.
    };

    window.addEventListener("resize", secretResizeHandler);

    window.setTimeout(() => {
      if (secretIsOpen) {
        $("#secretClose", secretOverlay)?.focus();
      }
    }, reducedMotion ? 30 : 600);
  }

  function closeSecretArchive() {
    if (!secretIsOpen) return;

    secretIsOpen = false;

    cancelAnimationFrame(secretAnimationFrame);
    window.clearInterval(secretGlitchInterval);

    if (secretResizeHandler) {
      window.removeEventListener("resize", secretResizeHandler);
      secretResizeHandler = null;
    }

    if (secretOverlay) {
      secretOverlay.classList.remove(
        "is-visible",
        "is-arrived",
        "secret-glitch"
      );

      $("#capriFlight", secretOverlay)?.classList.remove("capri-glitch");
    }

    body.classList.remove("myrlore-secret");
    body.style.removeProperty("overflow");

    if (secretPreviousFocus?.isConnected) {
      secretPreviousFocus.focus();
    }

    secretPreviousFocus = null;
    secretSequencePosition = 0;
  }

  function isEditableTarget(target) {
    return target instanceof Element &&
      Boolean(target.closest(
        "input, textarea, select, [contenteditable='true'], [role='textbox']"
      ));
  }

  document.addEventListener("keydown", event => {
    // Escape closes the archive first, then other overlays.
    if (event.key === "Escape") {
      if (secretIsOpen) {
        event.preventDefault();
        closeSecretArchive();
        return;
      }

      if (menuPanel?.classList.contains("is-open")) {
        closeMenu();
      }

      if (caseModal?.classList.contains("is-open")) {
        closeCaseStudy();
      }

      return;
    }

    if (secretIsOpen || event.repeat || isEditableTarget(event.target)) {
      return;
    }

    const pressedKey = event.key.toLowerCase();
    const expectedKey = secretSequence[secretSequencePosition];

    if (pressedKey === expectedKey) {
      secretSequencePosition += 1;

      if (secretSequencePosition === secretSequence.length) {
        secretSequencePosition = 0;
        openSecretArchive();
      }
    } else {
      // A fresh first key can immediately restart the sequence.
      secretSequencePosition =
        pressedKey === secretSequence[0] ? 1 : 0;
    }
  });

  /* ==========================================
     ACCESSIBILITY / FINAL STATE
  ========================================== */

  if (menuPanel) {
    menuPanel.setAttribute("aria-hidden", "true");
  }

  if (menuToggle) {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
  }

  if (caseModal) {
    caseModal.setAttribute("aria-hidden", "true");
    caseModal.setAttribute("inert", "");
  }

  document.documentElement.classList.add("js-ready");
  body.classList.add("js-ready");

  console.info("MYRLORE — interaction system initialized.");

})();
