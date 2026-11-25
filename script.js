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
     THREE.JS — HERO CHROME SCULPTURE
  ========================================== */

  const webglCanvas = $("#webgl");

  if (webglCanvas && window.THREE) {
    const THREE = window.THREE;

    let renderer;
    let scene;
    let camera;
    let sculpture;
    let animationFrame;

    let targetRotationX = 0;
    let targetRotationY = 0;

    let currentRotationX = 0;
    let currentRotationY = 0;

    let pointerX = 0;
    let pointerY = 0;

    const heroVisual = $(".hero-visual");

    try {
      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(
        38,
        1,
        0.1,
        100
      );

      camera.position.set(0, 0, 7.5);

      renderer = new THREE.WebGLRenderer({
        canvas: webglCanvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance"
      });

      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, 1.75)
      );

      renderer.outputColorSpace = THREE.SRGBColorSpace;

      if ("toneMapping" in renderer) {
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;
      }

      const sculptureGroup = new THREE.Group();
      scene.add(sculptureGroup);
      sculpture = sculptureGroup;

      /* Main chrome geometry */

      const coreGeometry = new THREE.IcosahedronGeometry(
        1.48,
        5
      );

      const coreMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xd9d7d1,
        metalness: 1,
        roughness: 0.19,
        clearcoat: 1,
        clearcoatRoughness: 0.12,
        reflectivity: 1
      });

      const core = new THREE.Mesh(
        coreGeometry,
        coreMaterial
      );

      sculptureGroup.add(core);

      /* Inner dark metallic form */

      const innerGeometry = new THREE.TorusKnotGeometry(
        0.82,
        0.19,
        180,
        24,
        2,
        5
      );

      const innerMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xaaa9a5,
        metalness: 1,
        roughness: 0.24,
        clearcoat: 1
      });

      const innerForm = new THREE.Mesh(
        innerGeometry,
        innerMaterial
      );

      innerForm.scale.set(0.72, 0.72, 0.72);
      sculptureGroup.add(innerForm);

      /* Orbit rings */

      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xc6b69a,
        transparent: true,
        opacity: 0.42,
        side: THREE.DoubleSide
      });

      const ringOne = new THREE.Mesh(
        new THREE.TorusGeometry(2.05, 0.006, 8, 180),
        ringMaterial
      );

      ringOne.rotation.set(
        THREE.MathUtils.degToRad(65),
        0,
        THREE.MathUtils.degToRad(-28)
      );

      sculptureGroup.add(ringOne);

      const ringTwo = new THREE.Mesh(
        new THREE.TorusGeometry(2.3, 0.004, 8, 180),
        ringMaterial.clone()
      );

      ringTwo.material.opacity = 0.2;

      ringTwo.rotation.set(
        THREE.MathUtils.degToRad(35),
        THREE.MathUtils.degToRad(55),
        THREE.MathUtils.degToRad(18)
      );

      sculptureGroup.add(ringTwo);

      /* Lighting */

      scene.add(
        new THREE.AmbientLight(0xffffff, 0.65)
      );

      const keyLight = new THREE.DirectionalLight(
        0xffffff,
        3.2
      );

      keyLight.position.set(4, 5, 6);
      scene.add(keyLight);

      const warmLight = new THREE.PointLight(
        0xc6b69a,
        75,
        12
      );

      warmLight.position.set(-4, 1, 2);
      scene.add(warmLight);

      const coolLight = new THREE.PointLight(
        0x9eabbc,
        55,
        12
      );

      coolLight.position.set(3, -3, -3);
      scene.add(coolLight);

      /* Small floating particles */

      const particleCount = 220;
      const particlePositions = new Float32Array(
        particleCount * 3
      );

      for (let i = 0; i < particleCount; i++) {
        particlePositions[i * 3] =
          (Math.random() - 0.5) * 8;

        particlePositions[i * 3 + 1] =
          (Math.random() - 0.5) * 8;

        particlePositions[i * 3 + 2] =
          (Math.random() - 0.5) * 6;
      }

      const particleGeometry = new THREE.BufferGeometry();

      particleGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(particlePositions, 3)
      );

      const particleMaterial = new THREE.PointsMaterial({
        color: 0xc6b69a,
        size: 0.012,
        transparent: true,
        opacity: 0.55,
        sizeAttenuation: true
      });

      const particles = new THREE.Points(
        particleGeometry,
        particleMaterial
      );

      scene.add(particles);

      /* Responsive canvas sizing */

      function resizeHero() {
        if (!renderer || !camera) return;

        const width =
          webglCanvas.clientWidth ||
          heroVisual?.clientWidth ||
          window.innerWidth;

        const height =
          webglCanvas.clientHeight ||
          heroVisual?.clientHeight ||
          window.innerHeight;

        if (!width || !height) return;

        renderer.setSize(width, height, false);

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        const mobile = window.innerWidth <= 600;

        camera.position.z = mobile ? 8.5 : 7.5;

        sculptureGroup.scale.setScalar(
          mobile ? 0.82 : 1
        );
      }

      resizeHero();

      window.addEventListener(
        "resize",
        resizeHero,
        { passive: true }
      );

      /* Mouse interaction */

      if (!touchDevice && !reducedMotion) {
        heroVisual?.addEventListener("pointermove", event => {
          const rect = heroVisual.getBoundingClientRect();

          pointerX =
            ((event.clientX - rect.left) / rect.width - 0.5) * 2;

          pointerY =
            ((event.clientY - rect.top) / rect.height - 0.5) * 2;

          targetRotationY = pointerX * 0.24;
          targetRotationX = pointerY * 0.18;
        });

        heroVisual?.addEventListener("pointerleave", () => {
          targetRotationX = 0;
          targetRotationY = 0;
        });
      }

      /* Animation loop */

      const clock = new THREE.Clock();

      function renderHero() {
        animationFrame = requestAnimationFrame(renderHero);

        const elapsed = clock.getElapsedTime();

        if (!document.hidden) {
          currentRotationX +=
            (targetRotationX - currentRotationX) * 0.035;

          currentRotationY +=
            (targetRotationY - currentRotationY) * 0.035;

          if (!reducedMotion) {
            sculpture.rotation.x =
              currentRotationX + Math.sin(elapsed * 0.22) * 0.08;

            sculpture.rotation.y =
              currentRotationY + elapsed * 0.11;

            innerForm.rotation.x = elapsed * 0.12;
            innerForm.rotation.y = -elapsed * 0.16;

            ringOne.rotation.z = elapsed * 0.035;
            ringTwo.rotation.y = elapsed * 0.045;

            particles.rotation.y = elapsed * 0.012;
          }

          renderer.render(scene, camera);
        }
      }

      renderHero();

      /* Pause rendering when the tab is hidden */

      document.addEventListener("visibilitychange", () => {
        if (!document.hidden && renderer) {
          renderer.render(scene, camera);
        }
      });

      /* Cleanup support */

      window.addEventListener("pagehide", () => {
        cancelAnimationFrame(animationFrame);

        coreGeometry.dispose();
        coreMaterial.dispose();

        innerGeometry.dispose();
        innerMaterial.dispose();

        ringMaterial.dispose();
        particleGeometry.dispose();
        particleMaterial.dispose();

        renderer?.dispose();
      }, { once: true });

    } catch (error) {
      console.warn(
        "MYRLORE: Three.js hero could not initialize.",
        error
      );

      webglCanvas.style.display = "none";

      if (heroVisual) {
        heroVisual.style.background =
          "radial-gradient(ellipse at center, rgba(198,182,154,.12), transparent 65%)";
      }
    }
  }
     /* ==========================================
     PROJECT VAULT — DATA
  ========================================== */

  const projects = {
    corroguard: {
      number: "01",
      name: "CorroGuard",
      category: "ENGINEERING / WEB PLATFORM",
      type: "Engineering Chemistry",
      year: "2026",
      symbol: "CG",
      description:
        "An interactive corrosion analysis platform exploring material behaviour, environmental risk and protective strategies.",
      challenge:
        "Understanding corrosion requires connecting material properties with environmental conditions and prevention methods.",
      solution:
        "CorroGuard brings educational corrosion analysis into one interface through interactive tools and structured technical information.",
      features: [
        "Interactive corrosion risk calculator",
        "Metal compatibility checker",
        "Material information library",
        "Corrosion types and case studies",
        "Prevention and coating information"
      ],
      technologies: ["HTML", "CSS", "JavaScript", "Chart.js"],
      status: "ACADEMIC PROJECT",
      visual: "corroguard"
    },

    floodwatch: {
      number: "02",
      name: "FloodWatch Chennai",
      category: "CLIMATE / WEB PLATFORM",
      type: "Urban Flood Awareness",
      year: "2026",
      symbol: "FW",
      description:
        "A web-based flood awareness and analysis platform focused on rainfall patterns, drainage infrastructure and urban flood risk in Chennai.",
      challenge:
        "Rainfall and drainage information can be difficult to understand when it is distributed across separate datasets and maps.",
      solution:
        "FloodWatch combines rainfall visualizations, annual comparisons, drainage mapping and flood-risk information in one platform.",
      features: [
        "Rainfall statistics and visualizations",
        "Annual rainfall comparison",
        "Interactive drainage network map",
        "Zone and ward search",
        "Drainage condition visualization",
        "Elevation and flood-risk information"
      ],
      technologies: [
        "HTML",
        "CSS",
        "JavaScript",
        "Python",
        "Leaflet",
        "Chart.js"
      ],
      status: "ACADEMIC PROJECT",
      visual: "floodwatch"
    },

    aether: {
      number: "03",
      name: "Aether",
      category: "BRAND / DIGITAL EXPERIENCE",
      type: "Brand Concept",
      year: "CONCEPT",
      symbol: "A",
      description:
        "A conceptual identity exploration focused on clarity, atmosphere and contemporary digital presentation.",
      challenge:
        "Explore how a minimal visual language can create a recognizable digital identity.",
      solution:
        "A restrained visual direction combining typography, spacing and a consistent interface language.",
      features: [
        "Visual identity exploration",
        "Typography direction",
        "Digital interface concept"
      ],
      technologies: ["Brand Strategy", "UI Design", "Web Design"],
      status: "CONCEPT EXPLORATION",
      visual: "aether"
    },

    nexus: {
      number: "04",
      name: "Nexus",
      category: "DIGITAL / WEB EXPERIENCE",
      type: "Digital Concept",
      year: "CONCEPT",
      symbol: "N",
      description:
        "A conceptual digital experience exploring structured information and connected interfaces.",
      challenge:
        "Create a coherent interface direction for a complex digital environment.",
      solution:
        "A modular design approach focused on hierarchy, navigation and consistency.",
      features: [
        "Modular interface concept",
        "Navigation exploration",
        "Visual system development"
      ],
      technologies: ["UI Design", "UX Research", "Web Design"],
      status: "CONCEPT EXPLORATION",
      visual: "nexus"
    },

    monolith: {
      number: "05",
      name: "Monolith",
      category: "IDENTITY / ART DIRECTION",
      type: "Visual Concept",
      year: "CONCEPT",
      symbol: "M",
      description:
        "A visual study of form, structure and contrast through a restrained digital identity.",
      challenge:
        "Explore a strong visual presence without relying on unnecessary decoration.",
      solution:
        "A monochromatic art direction built around proportion, contrast and typography.",
      features: [
        "Art direction",
        "Visual composition",
        "Identity exploration"
      ],
      technologies: ["Art Direction", "Typography", "Visual Design"],
      status: "CONCEPT EXPLORATION",
      visual: "monolith"
    },

    sentinel: {
      number: "06",
      name: "Sentinel",
      category: "TECHNOLOGY / INTERFACE",
      type: "Interface Concept",
      year: "CONCEPT",
      symbol: "S",
      description:
        "A conceptual interface exploring information hierarchy and monitoring-oriented visual systems.",
      challenge:
        "Present complex information in a clear and structured interface.",
      solution:
        "A dashboard concept using modular layouts and restrained visual emphasis.",
      features: [
        "Dashboard concept",
        "Information hierarchy",
        "Monitoring interface exploration"
      ],
      technologies: ["UI Design", "Dashboard Design", "UX"],
      status: "CONCEPT EXPLORATION",
      visual: "sentinel"
    },

    form01: {
      number: "07",
      name: "Form 01",
      category: "EXPERIMENTAL / DESIGN",
      type: "Design Experiment",
      year: "CONCEPT",
      symbol: "F",
      description:
        "An experimental design study focused on geometry, typography and spatial composition.",
      challenge:
        "Explore how basic forms can create a distinctive visual language.",
      solution:
        "A series of visual experiments combining geometry and controlled contrast.",
      features: [
        "Geometric exploration",
        "Experimental typography",
        "Composition studies"
      ],
      technologies: ["Graphic Design", "Typography", "Art Direction"],
      status: "DESIGN EXPERIMENT",
      visual: "form01"
    },

    orbital: {
      number: "08",
      name: "Orbital",
      category: "DIGITAL / VISUAL SYSTEM",
      type: "Visual Concept",
      year: "CONCEPT",
      symbol: "O",
      description:
        "A conceptual visual system inspired by movement, orbital structures and spatial relationships.",
      challenge:
        "Translate motion and spatial relationships into a consistent visual direction.",
      solution:
        "A visual exploration built around circular geometry, rhythm and layered composition.",
      features: [
        "Spatial composition",
        "Motion-inspired graphics",
        "Visual system exploration"
      ],
      technologies: ["Visual Design", "Motion Concepts", "UI Design"],
      status: "CONCEPT EXPLORATION",
      visual: "orbital"
    },

    sonora: {
      number: "09",
      name: "Sonora",
      category: "BRAND / EXPERIENCE",
      type: "Brand Concept",
      year: "CONCEPT",
      symbol: "SO",
      description:
        "A conceptual brand direction exploring atmosphere, identity and sensory storytelling.",
      challenge:
        "Build a coherent visual identity around an atmospheric concept.",
      solution:
        "A restrained identity exploration using typography, tone and visual consistency.",
      features: [
        "Brand direction",
        "Visual storytelling",
        "Identity exploration"
      ],
      technologies: ["Branding", "Art Direction", "Visual Design"],
      status: "CONCEPT EXPLORATION",
      visual: "sonora"
    },

    atlas: {
      number: "10",
      name: "Atlas",
      category: "DATA / DIGITAL EXPERIENCE",
      type: "Digital Concept",
      year: "CONCEPT",
      symbol: "AT",
      description:
        "A conceptual data-oriented experience exploring structure, navigation and information presentation.",
      challenge:
        "Make structured information easier to navigate and interpret.",
      solution:
        "A modular concept built around clear content grouping and visual hierarchy.",
      features: [
        "Information architecture",
        "Data presentation concept",
        "Navigation exploration"
      ],
      technologies: ["UX", "UI Design", "Data Visualization"],
      status: "CONCEPT EXPLORATION",
      visual: "atlas"
    },

    apex: {
      number: "11",
      name: "Apex",
      category: "IDENTITY / DIGITAL",
      type: "Brand Concept",
      year: "CONCEPT",
      symbol: "AP",
      description:
        "A conceptual identity exploring precision, performance and a strong digital presence.",
      challenge:
        "Explore a visual language that communicates precision and clarity.",
      solution:
        "A structured identity direction using strong typography and deliberate spacing.",
      features: [
        "Identity exploration",
        "Digital art direction",
        "Typography system"
      ],
      technologies: ["Branding", "Typography", "UI Design"],
      status: "CONCEPT EXPLORATION",
      visual: "apex"
    },

    echo: {
      number: "12",
      name: "Echo",
      category: "EXPERIMENTAL / DIGITAL",
      type: "Creative Experiment",
      year: "CONCEPT",
      symbol: "E",
      description:
        "A conceptual creative experiment exploring repetition, rhythm and visual response.",
      challenge:
        "Explore how repetition and contrast can produce a recognizable digital experience.",
      solution:
        "A visual study built around repeated elements and controlled variation.",
      features: [
        "Visual experimentation",
        "Rhythm and repetition",
        "Digital composition"
      ],
      technologies: ["Creative Coding", "Visual Design", "Motion"],
      status: "DESIGN EXPERIMENT",
      visual: "echo"
    }
  };

  /* ==========================================
     PROJECT FILTERS
  ========================================== */

  const projectCards = $$("[data-project]");
  const projectFilters = $$("[data-filter]");

  let activeProjectFilter = "all";

  function normalizeCategory(value) {
    return String(value || "")
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, "-");
  }

  function getProjectCategory(project) {
    return normalizeCategory(project.category);
  }

  function matchesProjectFilter(project, filter) {
    if (filter === "all") return true;

    const category = getProjectCategory(project);
    const searchable = [
      project.category,
      project.type,
      project.name,
      project.status
    ].map(normalizeCategory);

    return (
      category.includes(filter) ||
      searchable.some(value => value.includes(filter))
    );
  }

  function applyProjectFilter(filter) {
    activeProjectFilter = normalizeCategory(filter) || "all";

    projectCards.forEach(card => {
      const projectId =
        card.dataset.project ||
        card.dataset.caseStudy;

      const project = projects[projectId];

      if (!project) {
        card.hidden = true;
        return;
      }

      const visible = matchesProjectFilter(
        project,
        activeProjectFilter
      );

      card.hidden = !visible;
      card.setAttribute(
        "aria-hidden",
        String(!visible)
      );
    });

    projectFilters.forEach(button => {
      const active =
        normalizeCategory(button.dataset.filter) ===
        activeProjectFilter;

      button.classList.toggle("is-active", active);

      button.setAttribute(
        "aria-pressed",
        String(active)
      );
    });
  }

  projectFilters.forEach(button => {
    button.addEventListener("click", () => {
      applyProjectFilter(button.dataset.filter);
    });
  });

  /* ==========================================
     CASE STUDY MODAL — ELEMENTS
  ========================================== */

  const caseModal = $("#caseModal");
  const caseBackdrop = $(".case-backdrop", caseModal || document);
  const casePanel = $(".case-panel", caseModal || document);

  const caseClose = $("#caseClose");
  const caseBottomClose = $("#caseBottomClose");

  const caseHeroArt = $("#caseHeroArt");
  const caseArtIndex = $("#caseArtIndex");
  const caseArtCaption = $("#caseArtCaption");
  const caseArtSymbol = $("#caseArtSymbol");

  const caseEyebrow = $("#caseEyebrow");
  const caseTitle = $("#caseTitle");
  const caseDescription = $("#caseDescription");

  const caseDetails = $("#caseDetails");
  const caseStatus = $("#caseStatus");
  const caseProjectNumber = $("#caseProjectNumber");

  let activeProjectId = null;
  let previousFocus = null;

  /* ==========================================
     CASE STUDY MODAL — CONTENT
  ========================================== */

  function createDetailBlock(label, content) {
    const block = document.createElement("div");
    block.className = "case-detail-block";

    const heading = document.createElement("span");
    heading.className = "case-label";
    heading.textContent = label;

    block.appendChild(heading);

    if (Array.isArray(content)) {
      const list = document.createElement("ul");

      content.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        list.appendChild(li);
      });

      block.appendChild(list);
    } else {
      const paragraph = document.createElement("p");
      paragraph.textContent = content;
      block.appendChild(paragraph);
    }

    return block;
  }

  function renderCaseStudy(projectId) {
    const project = projects[projectId];

    if (!project || !caseModal) return false;

    activeProjectId = projectId;

    if (caseEyebrow) {
      caseEyebrow.textContent = project.category;
    }

    if (caseTitle) {
      caseTitle.textContent = project.name;
    }

    if (caseDescription) {
      caseDescription.textContent = project.description;
    }

    if (caseArtIndex) {
      caseArtIndex.textContent =
        `PROJECT ${project.number} / MYRLORE`;
    }

    if (caseArtCaption) {
      caseArtCaption.textContent =
        `${project.type} — ${project.year}`;
    }

    if (caseArtSymbol) {
      caseArtSymbol.textContent = project.symbol;
    }

    if (caseStatus) {
      caseStatus.textContent = project.status;
    }

    if (caseProjectNumber) {
      caseProjectNumber.textContent = project.number;
    }

    if (caseHeroArt) {
      caseHeroArt.dataset.project = projectId;
      caseHeroArt.className =
        `case-hero-art case-art-${project.visual || projectId}`;
    }

    if (caseDetails) {
      caseDetails.replaceChildren(
        createDetailBlock("THE CHALLENGE", project.challenge),
        createDetailBlock("THE APPROACH", project.solution),
        createDetailBlock("PROJECT FEATURES", project.features),
        createDetailBlock("TECHNOLOGIES", project.technologies)
      );
    }

    return true;
  }

  /* ==========================================
     CASE STUDY MODAL — OPEN / CLOSE
  ========================================== */

  function openCaseStudy(projectId, triggerElement) {
    if (!caseModal) return;

    if (!renderCaseStudy(projectId)) return;

    previousFocus = triggerElement || document.activeElement;

    caseModal.classList.add("is-open");
    caseModal.setAttribute("aria-hidden", "false");
    caseModal.removeAttribute("inert");

    body.classList.add("case-open");

    if (casePanel) {
      casePanel.scrollTop = 0;
    }

    caseClose?.focus({ preventScroll: true });

    if (gsapInstance && !reducedMotion) {
      gsapInstance.fromTo(
        ".case-content > *",
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.06,
          delay: 0.2,
          ease: "power2.out"
        }
      );
    }
  }

  function closeCaseStudy() {
    if (!caseModal || !caseModal.classList.contains("is-open")) {
      return;
    }

    caseModal.classList.remove("is-open");
    caseModal.setAttribute("aria-hidden", "true");
    caseModal.setAttribute("inert", "");

    body.classList.remove("case-open");

    if (gsapInstance) {
      gsapInstance.killTweensOf(".case-content > *");
    }

    if (previousFocus && typeof previousFocus.focus === "function") {
      previousFocus.focus({ preventScroll: true });
    }

    activeProjectId = null;
  }

  /* ==========================================
     PROJECT CARD EVENTS
  ========================================== */

  projectCards.forEach(card => {
    const projectId =
      card.dataset.project ||
      card.dataset.caseStudy;

    if (!projects[projectId]) return;

    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute(
      "aria-label",
      `View ${projects[projectId].name} case study`
    );

    card.addEventListener("click", () => {
      openCaseStudy(projectId, card);
    });

    card.addEventListener("keydown", event => {
      if (
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();
        openCaseStudy(projectId, card);
      }
    });
  });

  caseClose?.addEventListener("click", closeCaseStudy);
  caseBottomClose?.addEventListener("click", closeCaseStudy);
  caseBackdrop?.addEventListener("click", closeCaseStudy);

  /* ==========================================
     MODAL KEYBOARD ACCESSIBILITY
  ========================================== */

  document.addEventListener("keydown", event => {
    if (
      event.key === "Escape" &&
      caseModal?.classList.contains("is-open")
    ) {
      closeCaseStudy();
      return;
    }

    if (
      event.key !== "Tab" ||
      !caseModal?.classList.contains("is-open")
    ) {
      return;
    }

    const focusable = $$(
      'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      caseModal
    ).filter(element => {
      return element.offsetParent !== null;
    });

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

  /* Initial filter state */

  if (projectFilters.length) {
    applyProjectFilter("all");
  }
     /* ==========================================
     MAGNETIC INTERACTIONS
  ========================================== */

  const magneticElements = $$(
    "[data-magnetic], .magnetic, .nav-cta, .hero-cta"
  );

  magneticElements.forEach(element => {
    if (touchDevice || reducedMotion) return;

    let bounds = null;

    element.addEventListener("mouseenter", () => {
      bounds = element.getBoundingClientRect();
    });

    element.addEventListener("mousemove", event => {
      bounds = element.getBoundingClientRect();

      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;

      const moveX = (event.clientX - centerX) * 0.16;
      const moveY = (event.clientY - centerY) * 0.16;

      if (gsapInstance) {
        gsapInstance.to(element, {
          x: moveX,
          y: moveY,
          duration: 0.35,
          ease: "power2.out"
        });
      } else {
        element.style.transform =
          `translate(${moveX}px, ${moveY}px)`;
      }
    });

    element.addEventListener("mouseleave", () => {
      if (gsapInstance) {
        gsapInstance.to(element, {
          x: 0,
          y: 0,
          duration: 0.55,
          ease: "elastic.out(1, 0.4)"
        });
      } else {
        element.style.transform = "";
      }
    });
  });

  /* ==========================================
     PROJECT HOVER INTERACTIONS
  ========================================== */

  const projectHoverTargets = $$(
    "[data-project], [data-case-study], .project-card"
  );

  projectHoverTargets.forEach(card => {
    card.addEventListener("mouseenter", () => {
      body.classList.add("project-hovering");

      const label = card.dataset.cursorLabel || "EXPLORE";

      if (cursorText) {
        cursorText.textContent = label;
      }
    });

    card.addEventListener("mouseleave", () => {
      body.classList.remove("project-hovering");

      if (cursorText) {
        cursorText.textContent = "";
      }
    });
  });

  /* ==========================================
     IMAGE / VISUAL HOVER EFFECTS
  ========================================== */

  const visualCards = $$(
    ".project-card, .work-card, .visual-card"
  );

  visualCards.forEach(card => {
    const visual = $(
      "img, .project-image, .project-visual",
      card
    );

    if (!visual || touchDevice || reducedMotion) return;

    card.addEventListener("mousemove", event => {
      const rect = card.getBoundingClientRect();

      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      const rotateY = (x - 0.5) * 3;
      const rotateX = (0.5 - y) * 3;

      if (gsapInstance) {
        gsapInstance.to(visual, {
          rotateX,
          rotateY,
          duration: 0.35,
          ease: "power2.out",
          transformPerspective: 900
        });
      }
    });

    card.addEventListener("mouseleave", () => {
      if (gsapInstance) {
        gsapInstance.to(visual, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.5,
          ease: "power2.out"
        });
      }
    });
  });

  /* ==========================================
     PAGE TRANSITIONS
  ========================================== */

  const transitionOverlay = $(
    ".page-transition, .transition-curtain"
  );

  const transitionLinks = $$(
    'a[href]:not([target="_blank"]):not([href^="#"]):not([href^="mailto:"]):not([href^="tel:"]):not([download])'
  );

  function isInternalPageLink(link) {
    const href = link.getAttribute("href");

    if (!href) return false;

    if (
      href.startsWith("javascript:") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:")
    ) {
      return false;
    }

    try {
      const destination = new URL(href, window.location.href);

      return (
        destination.origin === window.location.origin &&
        destination.pathname !== window.location.pathname
      );
    } catch {
      return false;
    }
  }

  function runPageTransition(destination) {
    if (!transitionOverlay) {
      window.location.href = destination;
      return;
    }

    transitionOverlay.classList.add("is-active");
    transitionOverlay.setAttribute("aria-hidden", "false");

    if (gsapInstance && !reducedMotion) {
      gsapInstance.to(transitionOverlay, {
        scaleY: 1,
        transformOrigin: "bottom",
        duration: 0.65,
        ease: "power3.inOut",
        onComplete: () => {
          window.location.href = destination;
        }
      });
    } else {
      window.location.href = destination;
    }
  }

  transitionLinks.forEach(link => {
    if (!isInternalPageLink(link)) return;

    link.addEventListener("click", event => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const destination = link.href;

      if (!destination) return;

      event.preventDefault();
      runPageTransition(destination);
    });
  });

  /* ==========================================
     PAGE TRANSITION — ENTRANCE
  ========================================== */

  if (transitionOverlay) {
    if (gsapInstance && !reducedMotion) {
      gsapInstance.set(transitionOverlay, {
        scaleY: 1,
        transformOrigin: "top"
      });

      gsapInstance.to(transitionOverlay, {
        scaleY: 0,
        transformOrigin: "top",
        duration: 0.85,
        delay: 0.12,
        ease: "power3.inOut",
        onComplete: () => {
          transitionOverlay.classList.remove("is-active");
          transitionOverlay.setAttribute("aria-hidden", "true");
        }
      });
    } else {
      transitionOverlay.classList.remove("is-active");
      transitionOverlay.setAttribute("aria-hidden", "true");
    }
  }

  /* ==========================================
     INFINITE MARQUEE
  ========================================== */

  const marquees = $$(".marquee-track");

  marquees.forEach(track => {
    if (reducedMotion) return;

    const parent = track.parentElement;

    if (!parent) return;

    parent.addEventListener("mouseenter", () => {
      if (gsapInstance) {
        gsapInstance.to(track, {
          timeScale: 0.35,
          duration: 0.5,
          ease: "power2.out"
        });
      }
    });

    parent.addEventListener("mouseleave", () => {
      if (gsapInstance) {
        gsapInstance.to(track, {
          timeScale: 1,
          duration: 0.5,
          ease: "power2.out"
        });
      }
    });
  });

  /* ==========================================
     SCROLL PROGRESS
  ========================================== */

  const scrollProgress = $(
    ".scroll-progress, #scrollProgress"
  );

  function updateScrollProgress() {
    if (!scrollProgress) return;

    const scrollableHeight =
      document.documentElement.scrollHeight -
      window.innerHeight;

    const progress =
      scrollableHeight > 0
        ? window.scrollY / scrollableHeight
        : 0;

    scrollProgress.style.transform =
      `scaleX(${Math.min(1, Math.max(0, progress))})`;
  }

  window.addEventListener(
    "scroll",
    updateScrollProgress,
    { passive: true }
  );

  updateScrollProgress();

  /* ==========================================
     BACK TO TOP
  ========================================== */

  const backToTop = $(
    "#backToTop, .back-to-top"
  );

  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: reducedMotion ? "auto" : "smooth"
      });
    });

    window.addEventListener(
      "scroll",
      () => {
        backToTop.classList.toggle(
          "is-visible",
          window.scrollY > 500
        );
      },
      { passive: true }
    );
  }

  /* ==========================================
     EXTERNAL LINK SAFETY
  ========================================== */

  $$('a[target="_blank"]').forEach(link => {
    const rel = new Set(
      (link.getAttribute("rel") || "").split(/\s+/).filter(Boolean)
    );

    rel.add("noopener");
    rel.add("noreferrer");

    link.setAttribute("rel", [...rel].join(" "));
  });
     /* ==========================================
     SECRET ARCHIVE
  ========================================== */

  const archiveTrigger = $(
    "[data-secret-trigger], #secretTrigger, .secret-trigger"
  );

  const secretArchive = $(
    "[data-secret-archive], #secretArchive, .secret-archive"
  );

  const archiveClose = $(
    "[data-archive-close], #archiveClose, .archive-close"
  );

  function openSecretArchive() {
    if (!secretArchive) return;

    secretArchive.classList.add("is-open");
    secretArchive.setAttribute("aria-hidden", "false");

    if (archiveTrigger) {
      archiveTrigger.setAttribute("aria-expanded", "true");
    }

    body.classList.add("archive-open");

    const firstFocusable = $(
      'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])',
      secretArchive
    );

    firstFocusable?.focus();
  }

  function closeSecretArchive() {
    if (!secretArchive) return;

    secretArchive.classList.remove("is-open");
    secretArchive.setAttribute("aria-hidden", "true");

    if (archiveTrigger) {
      archiveTrigger.setAttribute("aria-expanded", "false");
      archiveTrigger.focus();
    }

    body.classList.remove("archive-open");
  }

  archiveTrigger?.addEventListener(
    "click",
    openSecretArchive
  );

  archiveClose?.addEventListener(
    "click",
    closeSecretArchive
  );

  secretArchive?.addEventListener("click", event => {
    if (event.target === secretArchive) {
      closeSecretArchive();
    }
  });

  /* ==========================================
     KEYBOARD ACCESSIBILITY
  ========================================== */

  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;

    if (secretArchive?.classList.contains("is-open")) {
      closeSecretArchive();
    }
  });

  /* ==========================================
     CONTACT FORM VALIDATION
  ========================================== */

  const contactForm = $(
    "#contactForm, [data-contact-form]"
  );

  if (contactForm) {
    const emailInput = $(
      'input[type="email"]',
      contactForm
    );

    const submitButton = $(
      'button[type="submit"], input[type="submit"]',
      contactForm
    );

    const formStatus = $(
      "[data-form-status], .form-status",
      contactForm
    );

    contactForm.addEventListener("submit", event => {
      if (!contactForm.checkValidity()) {
        event.preventDefault();
        contactForm.reportValidity();

        return;
      }

      if (emailInput && emailInput.value.trim()) {
        const emailPattern =
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(emailInput.value.trim())) {
          event.preventDefault();

          emailInput.setCustomValidity(
            "Please enter a valid email address."
          );

          emailInput.reportValidity();
          emailInput.setCustomValidity("");

          return;
        }
      }

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.setAttribute(
          "aria-busy",
          "true"
        );
      }

      if (formStatus) {
        formStatus.textContent = "Sending...";
        formStatus.setAttribute("aria-live", "polite");
      }
    });

    contactForm.addEventListener("input", () => {
      if (submitButton && !contactForm.checkValidity()) {
        submitButton.disabled = false;
        submitButton.removeAttribute("aria-busy");
      }
    });
  }

  /* ==========================================
     IMAGE LOADING
  ========================================== */

  const lazyImages = $$("img[loading='lazy']");

  lazyImages.forEach(img => {
    img.addEventListener("load", () => {
      img.classList.add("is-loaded");
    });

    img.addEventListener("error", () => {
      img.classList.add("image-error");
    });
  });

  /* ==========================================
     VIDEO PLAYBACK CONTROL
  ========================================== */

  const videos = $$("video");

  videos.forEach(video => {
    video.addEventListener("error", () => {
      video.classList.add("video-error");
    });

    if (reducedMotion) {
      video.pause();
      video.removeAttribute("autoplay");
    }
  });

  /* ==========================================
     FINAL INITIALIZATION
  ========================================== */

  document.documentElement.classList.add("js-ready");
  body.classList.add("js-ready");

  window.addEventListener("pageshow", () => {
    body.classList.remove("is-transitioning");
  });

  console.info("MYRLORE interaction system initialized.");

})();
