
/* =========================================
   MYRLORE® — INTERACTION ENGINE
========================================= */

// LOADING SCREEN

window.addEventListener("load", () => {
  const loader = document.getElementById("loader");

  setTimeout(() => {
    loader.classList.add("hide");
  }, 900);
});

// FALLBACK IF PAGE LOADS SLOWLY

setTimeout(() => {
  document.getElementById("loader")?.classList.add("hide");
}, 5000);


// FULLSCREEN NAVIGATION

const menuButton = document.getElementById("menuButton");
const menuOverlay = document.getElementById("menuOverlay");
const closeMenuButton = document.getElementById("closeMenu");

function openMenu() {
  menuOverlay.classList.add("open");
  document.body.classList.add("menu-active");
  menuButton.setAttribute("aria-expanded", "true");
}

function closeMenu() {
  menuOverlay.classList.remove("open");
  document.body.classList.remove("menu-active");
  menuButton.setAttribute("aria-expanded", "false");
}

menuButton.addEventListener("click", () => {
  if (menuOverlay.classList.contains("open")) {
    closeMenu();
  } else {
    openMenu();
  }
});

closeMenuButton.addEventListener("click", closeMenu);


// CLOSE MENU WHEN NAVIGATION LINK IS SELECTED

menuOverlay.querySelectorAll("nav a").forEach(link => {
  link.addEventListener("click", closeMenu);
});


// CLOSE MENU WITH ESCAPE KEY

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeMenu();
  }
});


// SCROLL REVEAL ANIMATIONS

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {

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


// CURSOR LIGHT EFFECT

const cursorGlow = document.getElementById("cursorGlow");

if (window.matchMedia("(pointer: fine)").matches) {

  document.addEventListener("mousemove", event => {

    cursorGlow.style.left = event.clientX + "px";
    cursorGlow.style.top = event.clientY + "px";

  });

}


// MARQUEE PAUSE ON HOVER

const marquee = document.querySelector(".marquee-track");

if (marquee) {

  marquee.addEventListener("mouseenter", () => {
    marquee.style.animationPlayState = "paused";
  });

  marquee.addEventListener("mouseleave", () => {
    marquee.style.animationPlayState = "running";
  });

}


// FOOTER COPYRIGHT YEAR

document.getElementById("year").textContent =
  new Date().getFullYear();


// CLOSE MENU WHEN WINDOW RESIZES

window.addEventListener("resize", () => {

  if (window.innerWidth > 650) {
    closeMenu();
  }

});


// PREVENT EMPTY HASH LINKS

document.querySelectorAll('a[href="#"]').forEach(link => {

  link.addEventListener("click", event => {
    event.preventDefault();
  });

});


// PAGE VISIBILITY

document.addEventListener("visibilitychange", () => {

  if (document.hidden) {
    closeMenu();
  }

});


// INITIALIZE PAGE

document.documentElement.classList.add("js-ready");
