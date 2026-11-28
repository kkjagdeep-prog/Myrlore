        const coreGeometry = new THREE.SphereGeometry(0.34, 64, 48);
        geometries.push(coreGeometry);
        const coreMaterial = new THREE.MeshPhysicalMaterial({
          color: 0xf0f2f4,
          metalness: 1,
          roughness: 0.018,
          clearcoat: 1,
          clearcoatRoughness: 0.025,
          envMapIntensity: 3.5
        });
        materials.push(coreMaterial);
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        sculpture.add(core);

        // Three fine chrome filaments weave around the central form.
        const filamentMaterial = new THREE.MeshPhysicalMaterial({
          color: 0xbfc8d2,
          metalness: 1,
          roughness: 0.035,
          clearcoat: 1,
          envMapIntensity: 2.8
        });
        materials.push(filamentMaterial);

        for (let i = 0; i < 3; i++) {
          const points = [];
          const phase = i * (Math.PI * 2 / 3);

          for (let j = 0; j <= 120; j++) {
            const t = j / 120;
            const angle = t * Math.PI * 2.6 + phase;
            const radius = 1.55 + 0.16 * Math.sin(t * Math.PI * 4 + phase);

            points.push(new THREE.Vector3(
              Math.cos(angle) * radius,
              Math.sin(angle) * radius * 0.72,
              0.22 * Math.sin(angle * 1.7 + phase)
            ));
          }

          const curve = new THREE.CatmullRomCurve3(points);
          const geometry = new THREE.TubeGeometry(curve, 180, 0.012, 6, false);
          geometries.push(geometry);
          sculpture.add(new THREE.Mesh(geometry, filamentMaterial));
        }

        // Fine particles provide depth without overwhelming the sculpture.
        const particleCount = touchDevice ? 65 : 130;
        const particlePositions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
          particlePositions[i * 3] = (Math.random() - 0.5) * 8;
          particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 8;
          particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 5;
        }

        const particleGeometry = new THREE.BufferGeometry();
        particleGeometry.setAttribute(
          "position",
          new THREE.BufferAttribute(particlePositions, 3)
        );
        geometries.push(particleGeometry);

        const particleMaterial = new THREE.PointsMaterial({
          color: 0xcbd2dc,
          size: 0.018,
          transparent: true,
          opacity: 0.5,
          depthWrite: false
        });
        materials.push(particleMaterial);

        const particles = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles);

        function resizeScene() {
          if (!renderer || !camera || isDisposed) return;

          const width = Math.max(1, canvas.clientWidth || 500);
          const height = Math.max(1, canvas.clientHeight || 500);

          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
        }

        resizeScene();
        window.addEventListener("resize", resizeScene, { passive: true });

        if (typeof ResizeObserver !== "undefined") {
          resizeObserver = new ResizeObserver(resizeScene);
          resizeObserver.observe(canvas);
        }

        const clock = new THREE.Clock();
        const pointer = { x: 0, y: 0 };

        function handlePointer(event) {
          pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
          pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
        }

        if (!touchDevice && !reducedMotion) {
          window.addEventListener("mousemove", handlePointer, { passive: true });
        }

        let scrollProgress = 0;

        function handleScroll() {
          const maxScroll = Math.max(
            1,
            document.documentElement.scrollHeight - window.innerHeight
          );
          scrollProgress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
        }

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();

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
            sculpture.rotation.z = Math.sin(elapsed * 0.2) * 0.025;

            const scale = baseScale - scrollProgress * 0.12;
            sculpture.scale.setScalar(Math.max(0.62, scale));

            particles.rotation.y = elapsed * 0.015;
            particles.rotation.x = Math.sin(elapsed * 0.12) * 0.025;
          }

          renderer.render(scene, camera);
        }

        animate();

        function disposeHero() {
          if (isDisposed) return;
          isDisposed = true;

          cancelAnimationFrame(animationFrame);
          resizeObserver?.disconnect();

          window.removeEventListener("resize", resizeScene);
          window.removeEventListener("mousemove", handlePointer);
          window.removeEventListener("scroll", handleScroll);

          geometries.forEach(geometry => geometry.dispose());
          materials.forEach(material => material.dispose());

          if (environmentTexture) environmentTexture.dispose();
          if (roomEnvironment) roomEnvironment.dispose();
          if (pmremGenerator) pmremGenerator.dispose();

          renderer?.dispose();
        }

        window.addEventListener("pagehide", disposeHero, { once: true });

      } catch (error) {
        console.error("MYRLORE: 3D sculpture could not initialize.", error);

        try {
          renderer?.dispose();
        } catch {}

        // The rest of the site remains functional if WebGL or the CDN fails.
        canvas.dataset.visualFallback = "true";
      }
    }

    // Delay loading until the hero is close to the viewport.
    if ("IntersectionObserver" in window) {
      const heroObserver = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          heroObserver.disconnect();
          initHeroSculpture();
        }
      }, { rootMargin: "250px" });

      heroObserver.observe(canvas);
    } else {
      initHeroSculpture();
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
      overview: "SONORA is a creative concept exploring how sound-inspired visual systems and expressive digital interfaces can work together.",
      features: [
        "Sound-inspired visual identity",
        "Waveform visual studies",
        "Digital experience concept",
        "Motion and interaction direction"
      ],
      technologies: ["HTML", "CSS", "JavaScript"],
      status: "INDEPENDENT CONCEPT",
      symbol: "S",
      caption: "SOUND / EXPERIENCE",
      visual: "sonora"
    },

    atlas: {
      number: "PROJECT / 010",
      title: "ATLAS",
      category: "DATA · MAPPING",
      summary: "A geographic exploration concept built around maps and structured information.",
      overview: "ATLAS is a conceptual mapping experience exploring how geographic information can be presented through a clear visual system.",
      features: [
        "Geographic data presentation",
        "Mapping interface concept",
        "Location-based information",
        "Visual hierarchy studies"
      ],
      technologies: ["HTML", "CSS", "JavaScript", "Leaflet"],
      status: "INDEPENDENT CONCEPT",
      symbol: "A",
      caption: "GEOGRAPHIC EXPLORATION",
      visual: "atlas"
    },

    apex: {
      number: "PROJECT / 011",
      title: "APEX",
      category: "DIGITAL EXPERIENCE",
      summary: "A visual study of expressive digital presentation and confident design.",
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
      caseHeroArt.dataset.project = projectId;

      [...caseHeroArt.classList].forEach(className => {
        if (className.startsWith("case-art-")) {
          caseHeroArt.classList.remove(className);
        }
      });

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
        const item = document.createElement("span");
        item.className = "case-tech-item";
        item.textContent = technology;
        caseTech.appendChild(item);
      });
    }

    return true;
  }

  function openCaseStudy(projectId) {
    if (!caseModal || !casePanel) return;
    if (!populateCaseStudy(projectId)) return;

    lastFocusedElement = document.activeElement;

    caseModal.classList.add("is-open", "open");
    caseModal.setAttribute("aria-hidden", "false");
    caseModal.inert = false;
    body.classList.add("case-open");

    window.clearTimeout(caseFocusTimeout);
    caseFocusTimeout = window.setTimeout(() => {
      casePanel.focus();
    }, 80);
  }

  function closeCaseStudy(returnFocus = true) {
    if (!caseModal) return;

    caseModal.classList.remove("is-open", "open");
    caseModal.setAttribute("aria-hidden", "true");
    caseModal.inert = true;
    body.classList.remove("case-open");

    window.clearTimeout(caseFocusTimeout);

    if (returnFocus && lastFocusedElement?.isConnected) {
      lastFocusedElement.focus();
    }

    lastFocusedElement = null;
  }

  $$("[data-case-study]").forEach(card => {
    card.addEventListener("click", event => {
      event.preventDefault();
      openCaseStudy(card.dataset.caseStudy);
    });
  });

  $$("[data-case-close]").forEach(control => {
    control.addEventListener("click", () => closeCaseStudy());
  });

  $("#caseClose")?.addEventListener("click", () => closeCaseStudy());

  if (casePanel) {
    casePanel.addEventListener("keydown", event => {
      if (event.key !== "Tab") return;

      const focusable = $$(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        casePanel
      ).filter(element => element.getClientRects().length > 0);

      if (!focusable.length) {
        event.preventDefault();
        casePanel.focus();
        return;
      }

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
  }

  /* ==========================================
     MAGNETIC ELEMENTS
  ========================================== */

  if (!touchDevice && !reducedMotion) {
    $$(".round-link, .contact-link").forEach(element => {
      element.addEventListener("mousemove", event => {
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;

        element.style.transform =
          `translate(${x * 0.08}px, ${y * 0.08}px)`;
      });

      element.addEventListener("mouseleave", () => {
        element.style.transform = "";
      });
    });
  }

  /* ==========================================
     PAGE TRANSITIONS
  ========================================== */

  const pageTransition = $("#pageTransition");
  let transitionActive = false;

  function navigateWithTransition(url) {
    if (!pageTransition || transitionActive) {
      window.location.href = url;
      return;
    }

    transitionActive = true;
    pageTransition.classList.add("is-active");
    pageTransition.setAttribute("aria-hidden", "false");
    pageTransition.inert = false;

    window.setTimeout(() => {
      window.location.href = url;
    }, reducedMotion ? 0 : 650);
  }

  $$('a[href]').forEach(link => {
    link.addEventListener("click", event => {
      if (event.defaultPrevented) return;
      if (link.hasAttribute("download")) return;
      if (link.target && link.target !== "_self") return;

      const href = link.getAttribute("href");
      if (!href) return;

      if (
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:")
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
      if (destination.pathname === window.location.pathname &&
          destination.search === window.location.search) return;

      event.preventDefault();
      navigateWithTransition(destination.href);
    });
  });

  /* ==========================================
     SCROLL PROGRESS
  ========================================== */

  const scrollProgress = $(".scroll-progress");

  if (scrollProgress) {
    function updateScrollProgress() {
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );

      const progress = Math.min(
        1,
        Math.max(0, window.scrollY / maxScroll)
      );

      scrollProgress.style.transform = `scaleX(${progress})`;
    }

    window.addEventListener("scroll", updateScrollProgress, {
      passive: true
    });

    updateScrollProgress();
  }

  /* ==========================================
     BACK TO TOP
  ========================================== */

  const backToTop = $("#backToTop");

  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: reducedMotion ? "auto" : "smooth"
      });
    });
  }

  /* ==========================================
     IMAGE LOADING
  ========================================== */

  $$("img[data-src]").forEach(imageElement => {
    const source = imageElement.dataset.src;
    if (!source) return;

    imageElement.src = source;
    imageElement.removeAttribute("data-src");
  });

  /* ==========================================
     CAPRI CINEMATIC SECRET ARCHIVE
     Konami code:
     ↑ ↑ ↓ ↓ ← → ← → B A
  ========================================== */

  const SECRET_SEQUENCE = [
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

  const CAPRI_SPRITE_PATH = "capri-spritesheet.png";
  const SPRITE_COLUMNS = 4;
  const SPRITE_ROWS = 4;
  const SPRITE_FRAMES = 16;
  const SPRITE_WIDTH = 1536;
  const SPRITE_HEIGHT = 1024;
  const SPRITE_FRAME_WIDTH = SPRITE_WIDTH / SPRITE_COLUMNS;
  const SPRITE_FRAME_HEIGHT = SPRITE_HEIGHT / SPRITE_ROWS;
  const SPRITE_FPS = 12;

  let secretSequenceIndex = 0;
  let secretOverlay = null;
  let secretStyle = null;
  let secretCanvas = null;
  let secretContext = null;
  let secretFlight = null;
  let secretImage = null;
  let secretImageLoaded = false;
  let secretAnimationFrame = 0;
  let secretSpriteInterval = 0;
  let secretGlitchInterval = 0;
  let secretGlitchTimeout = 0;
  let secretFlightTimeout = 0;
  let secretOpenedAt = 0;
  let secretPreviousOverflow = "";
  let secretPreviousOverflowPriority = "";
  let secretPreviousFocus = null;
  let secretFrame = 0;
  let secretIsOpen = false;
  let secretIsFlying = false;
  let secretFlightProgress = 0;
  let secretResizeHandler = null;
  let secretFlightStart = 0;
  let secretFlightDuration = 5600;
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

    if (caseFocusTimeout) window.clearTimeout(caseFocusTimeout);
    caseFocusTimeout = window.setTimeout(() => {
      if (caseModal?.classList.contains("is-open")) casePanel?.focus();
      caseFocusTimeout = 0;
    }, 50);
  }

  function closeCaseStudy() {
    if (!caseModal) return;
    if (caseFocusTimeout) window.clearTimeout(caseFocusTimeout);
    caseFocusTimeout = 0;

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
     Trigger: UP UP DOWN DOWN LEFT RIGHT LEFT RIGHT B A
     Asset: capri-spritesheet.png (4 columns × 4 rows, 16 frames)
  ========================================== */

  const secretSequence = [
    "arrowup", "arrowup", "arrowdown", "arrowdown",
    "arrowleft", "arrowright", "arrowleft", "arrowright",
    "b", "a"
  ];

  let secretSequencePosition = 0;
  let secretOverlay = null;
  let secretAnimationFrame = 0;
  let secretGlitchInterval = 0;
  let secretSpriteFrame = -1;
  let secretLastFrameTime = 0;
  let secretFlightStart = 0;
  let secretIsOpen = false;
  let secretPreviousFocus = null;
  let secretPreviousOverflow = null;
  let secretResizeHandler = null;
  let secretImage = null;
  let secretFocusTimeout = 0;
  let secretCleanupTimeout = 0;
  const secretGlitchTimeouts = new Set();
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
          radial-gradient(ellipse at 50% 48%, rgba(45,48,53,.34), transparent 48%),
          radial-gradient(ellipse at 50% 50%, #101114 0%, #070809 72%);
        color: #e8e7e2;
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transition: opacity .55s ease, visibility .55s ease;
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
        background: repeating-linear-gradient(to bottom, transparent 0, transparent 3px, rgba(255,255,255,.055) 4px);
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
      #myrloreSecretOverlay.secret-glitch { animation: myrloreScreenGlitch .18s steps(2); }
      #myrloreSecretOverlay.secret-glitch::before { opacity: .52; }
      #myrloreSecretOverlay .secret-flash {
        position: absolute;
        inset: 0;
        z-index: 5;
        pointer-events: none;
        opacity: 0;
        background: linear-gradient(90deg, transparent 0 12%, rgba(255,255,255,.12) 12.3% 12.8%, transparent 13.1% 62%, rgba(255,255,255,.08) 62.2% 63%, transparent 63.3%);
      }
      #myrloreSecretOverlay.secret-glitch .secret-flash { animation: myrloreFlash .2s steps(2); }
      #myrloreSecretOverlay .secret-content {
        position: relative;
        z-index: 3;
        width: min(780px, 88vw);
        text-align: center;
        opacity: 0;
        transform: translateY(18px);
        transition: opacity .7s ease .35s, transform .7s cubic-bezier(.2,.7,.2,1) .35s;
      }
      #myrloreSecretOverlay.is-arrived .secret-content { opacity: 1; transform: translateY(0); }
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
        margin-top: 18px;
        color: rgba(232,231,226,.42);
        font-size: .35em;
        font-weight: 400;
        letter-spacing: .22em;
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
        transition: background .25s ease, color .25s ease, border-color .25s ease;
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
        filter: drop-shadow(0 12px 24px rgba(0,0,0,.42)) drop-shadow(0 0 12px rgba(255,255,255,.12));
        animation: capriIdle 2.8s ease-in-out infinite;
      }
      #capriFlight::before,
      #capriFlight::after {
        content: "";
        position: absolute;
        inset: 0;
        z-index: 2;
        pointer-events: none;
        opacity: 0;
        mix-blend-mode: screen;
      }
      #capriFlight.capri-glitch::before {
        opacity: .62;
        transform: translate(-7px, 2px);
        background: rgba(255, 35, 105, .62);
        clip-path: inset(15% 0 55% 0);
      }
      #capriFlight.capri-glitch::after {
        opacity: .58;
        transform: translate(7px, -2px);
        background: rgba(65, 235, 220, .58);
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
        #capriFlight { width: 132px; height: 88px; }
        #myrloreSecretOverlay .secret-content { width: 90vw; }
        #myrloreSecretOverlay .secret-kicker { font-size: 8px; letter-spacing: .22em; }
        #myrloreSecretOverlay .secret-corner { left: 16px; bottom: 14px; font-size: 8px; }
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
    if (secretOverlay?.isConnected) return secretOverlay;
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
        <h2 class="secret-title">Stay curious.<span>YOU FOUND SOMETHING THAT WASN'T MEANT TO BE FOUND</span></h2>
        <button class="secret-return" id="secretClose" type="button">RETURN TO THE STUDIO</button>
      </div>
      <div class="secret-corner">ARCHIVE ACCESS / 001</div>
    `;

    secretOverlay.addEventListener("click", event => {
      if (event.target === secretOverlay) closeSecretArchive();
    });

    secretOverlay.addEventListener("keydown", event => {
      if (event.key !== "Tab") return;
      const focusable = $$('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])', secretOverlay)
        .filter(element => element.offsetParent !== null);
      if (!focusable.length) {
        event.preventDefault();
        return;
      }
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

    $("#secretClose", secretOverlay)?.addEventListener("click", closeSecretArchive);
    body.appendChild(secretOverlay);
    return secretOverlay;
  }

  function drawCapriFrame(frame) {
    const canvasElement = $("#capriCanvas", secretOverlay || document);
    if (!canvasElement || !secretImage?.complete || !secretImage.naturalWidth) return;

    const columns = 4;
    const rows = 4;
    const frameWidth = secretImage.naturalWidth / columns;
    const frameHeight = secretImage.naturalHeight / rows;
    const frameIndex = ((frame % (columns * rows)) + columns * rows) % (columns * rows);
    const sourceX = (frameIndex % columns) * frameWidth;
    const sourceY = Math.floor(frameIndex / columns) * frameHeight;
    const context = canvasElement.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, canvasElement.width, canvasElement.height);
    context.drawImage(secretImage, sourceX, sourceY, frameWidth, frameHeight,
      0, 0, canvasElement.width, canvasElement.height);
  }

  function loadCapriSprite() {
    if (secretImage) {
      if (secretImage.complete && secretImage.naturalWidth) drawCapriFrame(Math.max(0, secretSpriteFrame));
      return;
    }

    secretImage = new Image();
    secretImage.decoding = "async";
    secretImage.onload = () => {
      if (secretImage.naturalWidth % 4 !== 0 || secretImage.naturalHeight % 4 !== 0) {
        console.error("MYRLORE Easter egg: capri-spritesheet.png must use an evenly divisible 4 × 4 frame grid.");
        return;
      }
      drawCapriFrame(Math.max(0, secretSpriteFrame));
    };
    secretImage.onerror = () => {
      console.error("MYRLORE Easter egg: capri-spritesheet.png could not load. Place it beside index.html and script.js.");
    };
    secretImage.src = "capri-spritesheet.png";
  }
  function catmullRomPoint(points, progress) {
    const segmentCount = points.length - 1;
    const scaled = Math.min(0.999999, Math.max(0, progress)) * segmentCount;
    const index = Math.floor(scaled);
    const t = scaled - index;
    const p0 = points[Math.max(0, index - 1)];
    const p1 = points[index];
    const p2 = points[Math.min(points.length - 1, index + 1)];
    const p3 = points[Math.min(points.length - 1, index + 2)];
    const t2 = t * t;
    const t3 = t2 * t;
    const interpolate = axis => 0.5 * (
      2 * p1[axis] + (-p0[axis] + p2[axis]) * t +
      (2 * p0[axis] - 5 * p1[axis] + 4 * p2[axis] - p3[axis]) * t2 +
      (-p0[axis] + 3 * p1[axis] - 3 * p2[axis] + p3[axis]) * t3
    );
    return { x: interpolate(0), y: interpolate(1) };
  }

  function getCapriPath(progress) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const points = width <= 650
      ? [
          [-0.22 * width, 0.72 * height],
          [0.14 * width, 0.40 * height],
          [0.70 * width, 0.16 * height],
          [0.88 * width, 0.66 * height],
          [0.31 * width, 0.50 * height]
        ]
      : [
          [-0.18 * width, 0.72 * height],
          [0.17 * width, 0.27 * height],
          [0.65 * width, 0.13 * height],
          [0.88 * width, 0.67 * height],
          [0.31 * width, 0.50 * height]
        ];
    return catmullRomPoint(points, progress);
  }

  function animateCapri(timestamp) {
    if (!secretIsOpen || !secretOverlay?.isConnected) return;

    const frameInterval = 1000 / 12;
    if (!secretLastFrameTime || timestamp - secretLastFrameTime >= frameInterval) {
      const elapsedForFrame = Math.max(0, timestamp - secretFlightStart);
      const nextFrame = Math.floor(elapsedForFrame / frameInterval) % 16;
      if (nextFrame !== secretSpriteFrame) {
        secretSpriteFrame = nextFrame;
        drawCapriFrame(secretSpriteFrame);
      }
      secretLastFrameTime = timestamp;
    }

    const flightDuration = 5600;
    const progress = reducedMotion ? 1 : Math.min(1, Math.max(0, (timestamp - secretFlightStart) / flightDuration));
    const position = getCapriPath(progress);
    const flight = $("#capriFlight", secretOverlay);

    if (flight) {
      const width = window.innerWidth <= 650 ? 132 : 180;
      const height = width * (2 / 3);
      const rotation = progress >= 1 ? 0 : Math.sin(progress * Math.PI * 5) * 11;
      const scale = progress >= 1 ? 0.82 : 0.9 + Math.sin(progress * 12) * 0.055;
      flight.style.opacity = "1";
      flight.style.transform = `translate3d(${position.x - width / 2}px, ${position.y - height / 2}px, 0) rotate(${rotation}deg) scale(${scale})`;
    }

    if (progress >= 1) secretOverlay.classList.add("is-arrived");
    secretAnimationFrame = requestAnimationFrame(animateCapri);
  }

  function triggerSecretGlitch() {
    if (!secretIsOpen || !secretOverlay) return;
    secretOverlay.classList.add("secret-glitch");
    $("#capriFlight", secretOverlay)?.classList.add("capri-glitch");

    const timeout = window.setTimeout(() => {
      secretGlitchTimeouts.delete(timeout);
      if (!secretIsOpen || !secretOverlay) return;
      secretOverlay.classList.remove("secret-glitch");
      $("#capriFlight", secretOverlay)?.classList.remove("capri-glitch");
    }, 220);
    secretGlitchTimeouts.add(timeout);
  }

  function clearSecretTimers() {
    if (secretFocusTimeout) window.clearTimeout(secretFocusTimeout);
    if (secretCleanupTimeout) window.clearTimeout(secretCleanupTimeout);
    secretFocusTimeout = 0;
    secretCleanupTimeout = 0;
    secretGlitchTimeouts.forEach(timeout => window.clearTimeout(timeout));
    secretGlitchTimeouts.clear();
    if (secretGlitchInterval) window.clearInterval(secretGlitchInterval);
    secretGlitchInterval = 0;
  }

  function openSecretArchive() {
    if (secretIsOpen) return;
    clearSecretTimers();
    if (secretCleanupTimeout) window.clearTimeout(secretCleanupTimeout);

    secretIsOpen = true;
    secretPreviousFocus = document.activeElement;
    secretPreviousOverflow = {
      value: body.style.getPropertyValue("overflow"),
      priority: body.style.getPropertyPriority("overflow")
    };

    createSecretOverlay();
    loadCapriSprite();
    body.classList.add("myrlore-secret");
    body.style.setProperty("overflow", "hidden");

    secretOverlay.classList.remove("is-arrived", "secret-glitch");
    secretOverlay.classList.add("is-visible");
    secretSpriteFrame = 0;
    secretLastFrameTime = 0;
    secretFlightStart = performance.now();
    drawCapriFrame(0);

    const flight = $("#capriFlight", secretOverlay);
    if (flight) {
      const width = window.innerWidth <= 650 ? 132 : 180;
      const height = width * (2 / 3);
      const start = getCapriPath(0);
      flight.style.opacity = "0";
      flight.style.transform = `translate3d(${start.x - width / 2}px, ${start.y - height / 2}px, 0)`;
    }

    if (reducedMotion) {
      const finalPosition = getCapriPath(1);
      if (flight) {
        const width = window.innerWidth <= 650 ? 132 : 180;
        const height = width * (2 / 3);
        flight.style.opacity = "1";
        flight.style.transform = `translate3d(${finalPosition.x - width / 2}px, ${finalPosition.y - height / 2}px, 0) scale(.82)`;
      }
      secretOverlay.classList.add("is-arrived");
    } else {
      secretAnimationFrame = requestAnimationFrame(animateCapri);
      secretGlitchInterval = window.setInterval(() => {
        if (Math.random() > 0.28) triggerSecretGlitch();
      }, 700);
    }

    secretResizeHandler = () => {
      if (!secretIsOpen) return;
      if (reducedMotion) {
        const position = getCapriPath(1);
        const flightElement = $("#capriFlight", secretOverlay);
        const width = window.innerWidth <= 650 ? 132 : 180;
        const height = width * (2 / 3);
        if (flightElement) flightElement.style.transform = `translate3d(${position.x - width / 2}px, ${position.y - height / 2}px, 0) scale(.82)`;
      }
    };
    window.addEventListener("resize", secretResizeHandler, { passive: true });

    secretFocusTimeout = window.setTimeout(() => {
      if (secretIsOpen) $("#secretClose", secretOverlay)?.focus();
    }, reducedMotion ? 30 : 600);
  }

  function closeSecretArchive() {
    if (!secretIsOpen) return;
    secretIsOpen = false;
    cancelAnimationFrame(secretAnimationFrame);
    secretAnimationFrame = 0;
    clearSecretTimers();

    if (secretResizeHandler) {
      window.removeEventListener("resize", secretResizeHandler);
      secretResizeHandler = null;
    }

    body.classList.remove("myrlore-secret");
    if (secretPreviousOverflow?.value) {
      body.style.setProperty("overflow", secretPreviousOverflow.value, secretPreviousOverflow.priority);
    } else {
      body.style.removeProperty("overflow");
    }
    secretPreviousOverflow = null;

    secretOverlay?.classList.remove("is-visible", "is-arrived", "secret-glitch");
    $("#capriFlight", secretOverlay || document)?.classList.remove("capri-glitch");

    const focusTarget = secretPreviousFocus;
    secretPreviousFocus = null;
    if (focusTarget?.isConnected) focusTarget.focus();
    secretSequencePosition = 0;

    secretCleanupTimeout = window.setTimeout(() => {
      if (secretIsOpen) return;
      secretOverlay?.remove();
      secretOverlay = null;
      $(`#${SECRET_STYLE_ID}`)?.remove();
      secretCleanupTimeout = 0;
    }, 600);
  }

  function isEditableTarget(target) {
    return target instanceof Element && Boolean(target.closest(
      "input, textarea, select, [contenteditable='true'], [role='textbox']"
    ));
  }

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      if (secretIsOpen) {
        event.preventDefault();
        closeSecretArchive();
        return;
      }
      if (menuPanel?.classList.contains("is-open")) closeMenu();
      if (caseModal?.classList.contains("is-open")) closeCaseStudy();
      return;
    }

    if (secretIsOpen || event.repeat || event.altKey || event.ctrlKey || event.metaKey || isEditableTarget(event.target)) return;

    const pressedKey = event.key.toLowerCase();
    const expectedKey = secretSequence[secretSequencePosition];
    if (pressedKey === expectedKey) {
      secretSequencePosition += 1;
      if (secretSequencePosition === secretSequence.length) {
        secretSequencePosition = 0;
        openSecretArchive();
      }
    } else {
      secretSequencePosition = pressedKey === secretSequence[0] ? 1 : 0;
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
