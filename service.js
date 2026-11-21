
document.addEventListener("DOMContentLoaded", () => {

  /* =====================================
     MYRLORE® — SERVICES 2.0
  ===================================== */

  const body = document.body;

  /* YEAR */

  const year = document.getElementById("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }


  /* =====================================
     NAVIGATION MENU
  ===================================== */

  const menuToggle = document.getElementById("menuToggle");
  const menuClose = document.getElementById("menuClose");
  const menuPanel = document.getElementById("menuPanel");
  const menuLinks = menuPanel
    ? menuPanel.querySelectorAll("a")
    : [];

  function openMenu() {
    if (!menuPanel || !menuToggle) return;

    menuPanel.classList.add("open");
    menuPanel.inert = false;

    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close menu");

    body.classList.add("menu-open");

    if (menuClose) {
      menuClose.focus();
    }
  }

  function closeMenu() {
    if (!menuPanel || !menuToggle) return;

    menuPanel.classList.remove("open");
    menuPanel.inert = true;

    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");

    body.classList.remove("menu-open");
    menuToggle.focus();
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";

      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (menuClose) {
    menuClose.addEventListener("click", closeMenu);
  }

  menuLinks.forEach(link => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && menuPanel?.classList.contains("open")) {
      closeMenu();
    }
  });


  /* =====================================
     SERVICE ACCORDION
  ===================================== */

  const serviceTriggers = document.querySelectorAll(".service-trigger");

  serviceTriggers.forEach(trigger => {

    trigger.addEventListener("click", () => {

      const panelId = trigger.getAttribute("aria-controls");
      const panel = document.getElementById(panelId);

      if (!panel) return;

      const currentlyExpanded =
        trigger.getAttribute("aria-expanded") === "true";

      // Close every other service.
      serviceTriggers.forEach(otherTrigger => {

        const otherPanelId = otherTrigger.getAttribute("aria-controls");
        const otherPanel = document.getElementById(otherPanelId);

        otherTrigger.setAttribute("aria-expanded", "false");

        if (otherPanel) {
          otherPanel.hidden = true;
        }

      });

      // Toggle the selected service.
      if (!currentlyExpanded) {
        trigger.setAttribute("aria-expanded", "true");
        panel.hidden = false;
      }

    });

  });


  /* =====================================
     SCROLL REVEAL
  ===================================== */

  const revealElements = document.querySelectorAll(".reveal");

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if ("IntersectionObserver" in window && !prefersReducedMotion) {

    const revealObserver = new IntersectionObserver((entries, observer) => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }

      });

    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -35px 0px"
    });

    revealElements.forEach(element => {
      revealObserver.observe(element);
    });

  } else {

    revealElements.forEach(element => {
      element.classList.add("visible");
    });

  }


  /* =====================================
     CURSOR LIGHT
  ===================================== */

  const cursorGlow = document.getElementById("cursorGlow");

  const supportsFinePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;

  if (cursorGlow && supportsFinePointer) {

    let pointerX = 0;
    let pointerY = 0;
    let animationFrame = null;

    document.addEventListener("mousemove", event => {

      pointerX = event.clientX;
      pointerY = event.clientY;

      if (animationFrame) return;

      animationFrame = requestAnimationFrame(() => {

        cursorGlow.style.left = `${pointerX}px`;
        cursorGlow.style.top = `${pointerY}px`;

        animationFrame = null;

      });

    });

  }


  /* =====================================
     SMOOTH INTERNAL LINKS
  ===================================== */

  document.querySelectorAll('a[href^="#"]').forEach(link => {

    link.addEventListener("click", event => {

      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start"
      });

    });

  });


  /* =====================================
     HERO INTRO
  ===================================== */

  const heroCopy = document.querySelector(".hero-copy");

  if (heroCopy) {
    heroCopy.classList.add("hero-loaded");
  }

  console.log("MYRLORE® Services 2.0 initialized.");

});

