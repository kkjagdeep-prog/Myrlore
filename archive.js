/* ==========================================
   MYRLORE® — STUDIO ARCHIVE
   THREE.JS OBJECT COLLECTION
========================================== */

import * as THREE from "three";


/* ==========================================
   ARCHIVE ENTRIES
========================================== */

const archiveEntries = [

  {
    number: "001",
    title: "Liquid Form",
    category: "objects",
    categoryLabel: "OBJECT STUDY",
    date: "2026",
    description:
      "An exploration of reflective surfaces, fluid geometry and the relationship between light and metallic form. A study in the visual language of polished chrome.",
    artwork: "chrome",
    summary: "An exploration of reflective form and liquid geometry."
  },

  {
    number: "002",
    title: "Surface / 01",
    category: "materials",
    categoryLabel: "MATERIAL STUDY",
    date: "2026",
    description:
      "A material exploration focused on contrast, reflection and surface treatment. Examining the visual character of metallic finishes through light and shadow.",
    artwork: "material",
    summary: "A study of reflective surfaces and material contrast."
  },

  {
    number: "003",
    title: "Typographic Silence",
    category: "typography",
    categoryLabel: "TYPE EXPERIMENT",
    date: "2026",
    description:
      "An investigation into typography as an object. Exploring weight, proportion, negative space and the visual impact of restrained composition.",
    artwork: "type",
    summary: "An experiment in type, scale and negative space."
  },

  {
    number: "004",
    title: "Orbital Geometry",
    category: "objects",
    categoryLabel: "FORM STUDY",
    date: "2026",
    description:
      "A geometric study built around symmetry, repetition and spatial relationships. Exploring how simple structures can create complex visual compositions.",
    artwork: "geometry",
    summary: "A geometric study of repetition and proportion."
  },

  {
    number: "005",
    title: "Light / Reflection",
    category: "materials",
    categoryLabel: "LIGHT STUDY",
    date: "2026",
    description:
      "An exploration of controlled illumination, reflective contrast and the role of light in shaping how materials are perceived.",
    artwork: "light",
    summary: "An investigation into light and reflective contrast."
  },

  {
    number: "006",
    title: "Contour",
    category: "objects",
    categoryLabel: "OBJECT STUDY",
    date: "2026",
    description:
      "A minimal form experiment investigating contour, balance and proportion through a reduced visual language.",
    artwork: "form",
    summary: "An exploration of contour, balance and proportion."
  }

];


/* ==========================================
   ELEMENTS
========================================== */

const archiveGrid = document.querySelector("#archiveGrid");
const collectionCount = document.querySelector("#collectionCount");
const filterList = document.querySelector("#filterList");

const entryModal = document.querySelector("#entryModal");
const modalClose = document.querySelector("#modalClose");

const modalNumber = document.querySelector("#modalNumber");
const modalArtwork = document.querySelector("#modalArtwork");
const modalCategory = document.querySelector("#modalCategory");
const modalTitle = document.querySelector("#modalTitle");
const modalDescription = document.querySelector("#modalDescription");
const modalDate = document.querySelector("#modalDate");

const archiveYear = document.querySelector("#archiveYear");

let previousFocusedElement = null;
let currentModalState = null;

const sceneStates = new Map();

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;


/* ==========================================
   SHARED ENVIRONMENT DESIGN
========================================== */

function createEnvironmentTexture() {

  const canvas = document.createElement("canvas");

  canvas.width = 1024;
  canvas.height = 512;

  const context = canvas.getContext("2d");

  const gradient = context.createLinearGradient(
    0,
    0,
    0,
    canvas.height
  );

  gradient.addColorStop(0, "#d9dce0");
  gradient.addColorStop(0.22, "#737a83");
  gradient.addColorStop(0.48, "#171b21");
  gradient.addColorStop(0.7, "#555b64");
  gradient.addColorStop(1, "#d1d3d4");

  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Studio reflection panels

  context.fillStyle = "#ffffff";
  context.fillRect(120, 75, 100, 250);

  context.fillStyle = "#c9cdd2";
  context.fillRect(390, 35, 55, 190);

  context.fillStyle = "#f0f0ed";
  context.fillRect(730, 90, 120, 230);

  context.fillStyle = "#9299a2";
  context.fillRect(900, 150, 35, 180);

  context.fillStyle = "rgba(255,255,255,0.3)";
  context.fillRect(0, 400, 1024, 20);

  const texture = new THREE.CanvasTexture(canvas);

  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;

  return texture;
}


/* ==========================================
   MATERIALS
========================================== */

function createChromeMaterial(environment) {

  return new THREE.MeshPhysicalMaterial({

    color: 0xdfe2e5,

    metalness: 1,
    roughness: 0.17,

    envMap: environment,
    envMapIntensity: 1.65,

    clearcoat: 1,
    clearcoatRoughness: 0.12

  });

}


function createDarkMetalMaterial(environment) {

  return new THREE.MeshPhysicalMaterial({

    color: 0x343941,

    metalness: 0.95,
    roughness: 0.24,

    envMap: environment,
    envMapIntensity: 1.35,

    clearcoat: 1,
    clearcoatRoughness: 0.18

  });

}


function createChampagneMaterial(environment) {

  return new THREE.MeshPhysicalMaterial({

    color: 0xc6b69a,

    metalness: 0.92,
    roughness: 0.2,

    envMap: environment,
    envMapIntensity: 1.4

  });

}


/* ==========================================
   LIGHTING
========================================== */

function createLighting(scene) {

  const ambient = new THREE.AmbientLight(
    0xffffff,
    1.05
  );

  scene.add(ambient);


  const keyLight = new THREE.DirectionalLight(
    0xffffff,
    3.1
  );

  keyLight.position.set(4, 5, 6);
  scene.add(keyLight);


  const sideLight = new THREE.DirectionalLight(
    0xb7c4d4,
    2.2
  );

  sideLight.position.set(-5, 1, 3);
  scene.add(sideLight);


  const rimLight = new THREE.PointLight(
    0xc6b69a,
    28,
    12
  );

  rimLight.position.set(0, -3, -2);
  scene.add(rimLight);


  const topLight = new THREE.PointLight(
    0xffffff,
    22,
    10
  );

  topLight.position.set(0, 4, -1);
  scene.add(topLight);

}


/* ==========================================
   OBJECT 001 — LIQUID FORM
   CHROME SCULPTURE
========================================== */

function createLiquidForm(group, environment) {

  const chrome = createChromeMaterial(environment);

  const object = new THREE.Mesh(

    new THREE.TorusKnotGeometry(
      0.88,
      0.27,
      220,
      36,
      2,
      3
    ),

    chrome

  );

  object.scale.set(1.05, 0.9, 0.8);

  group.add(object);


  const core = new THREE.Mesh(

    new THREE.SphereGeometry(0.38, 48, 48),

    createDarkMetalMaterial(environment)

  );

  group.add(core);

}


/* ==========================================
   OBJECT 002 — SURFACE / 01
   LAYERED METALLIC STRUCTURE
========================================== */

function createMaterialStudy(group, environment) {

  const chrome = createChromeMaterial(environment);
  const darkMetal = createDarkMetalMaterial(environment);

  const layers = [

    {
      y: 0.38,
      rotation: -0.22,
      scale: [1.55, 0.13, 0.9],
      material: chrome
    },

    {
      y: 0.12,
      rotation: 0.12,
      scale: [1.35, 0.12, 0.82],
      material: darkMetal
    },

    {
      y: -0.14,
      rotation: -0.12,
      scale: [1.55, 0.13, 0.9],
      material: chrome
    },

    {
      y: -0.4,
      rotation: 0.18,
      scale: [1.2, 0.11, 0.75],
      material: darkMetal
    }

  ];

  layers.forEach(layer => {

    const mesh = new THREE.Mesh(

      new THREE.BoxGeometry(1, 1, 1, 8, 2, 8),

      layer.material

    );

    mesh.position.y = layer.y;
    mesh.rotation.z = layer.rotation;
    mesh.scale.set(...layer.scale);

    group.add(mesh);

  });

}


/* ==========================================
   OBJECT 003 — TYPOGRAPHIC SILENCE
   EXTRUDED M
========================================== */

function createTypography(group, environment) {

  const shape = new THREE.Shape();

  shape.moveTo(-0.95, -0.8);
  shape.lineTo(-0.95, 0.8);
  shape.lineTo(-0.62, 0.8);
  shape.lineTo(0, -0.05);
  shape.lineTo(0.62, 0.8);
  shape.lineTo(0.95, 0.8);
  shape.lineTo(0.95, -0.8);
  shape.lineTo(0.58, -0.8);
  shape.lineTo(0.58, 0.12);
  shape.lineTo(0, -0.65);
  shape.lineTo(-0.58, 0.12);
  shape.lineTo(-0.58, -0.8);
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(

    shape,

    {
      depth: 0.22,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.055,
      bevelThickness: 0.055
    }

  );

  geometry.center();

  const letter = new THREE.Mesh(

    geometry,

    createChromeMaterial(environment)

  );

  letter.scale.set(1.2, 1.2, 1.2);

  group.add(letter);


  const dot = new THREE.Mesh(

    new THREE.SphereGeometry(0.12, 32, 32),

    createChampagneMaterial(environment)

  );

  dot.position.set(1.25, -0.68, 0.12);

  group.add(dot);

}


/* ==========================================
   OBJECT 004 — ORBITAL GEOMETRY
   INTERLOCKING CHROME RINGS
========================================== */

function createOrbitalGeometry(group, environment) {

  const chrome = createChromeMaterial(environment);

  const rings = [

    {
      radius: 1.05,
      tube: 0.035,
      rotation: [0, 0, 0]
    },

    {
      radius: 0.88,
      tube: 0.045,
      rotation: [1.1, 0.5, 0.2]
    },

    {
      radius: 0.72,
      tube: 0.035,
      rotation: [0.5, 1.2, 0.8]
    }

  ];

  rings.forEach(item => {

    const ring = new THREE.Mesh(

      new THREE.TorusGeometry(
        item.radius,
        item.tube,
        20,
        120
      ),

      chrome

    );

    ring.rotation.set(...item.rotation);

    group.add(ring);

  });


  const center = new THREE.Mesh(

    new THREE.IcosahedronGeometry(0.2, 2),

    createChampagneMaterial(environment)

  );

  group.add(center);

}


/* ==========================================
   OBJECT 005 — LIGHT / REFLECTION
   ILLUMINATED METALLIC FORM
========================================== */

function createLightStudy(group, environment) {

  const chrome = createChromeMaterial(environment);

  const rod = new THREE.Mesh(

    new THREE.CylinderGeometry(
      0.055,
      0.055,
      2.5,
      32
    ),

    chrome

  );

  rod.rotation.z = Math.PI / 5;

  group.add(rod);


  const innerLight = new THREE.Mesh(

    new THREE.CylinderGeometry(
      0.018,
      0.018,
      2.2,
      16
    ),

    new THREE.MeshBasicMaterial({
      color: 0xf2eee3
    })

  );

  innerLight.rotation.z = Math.PI / 5;

  group.add(innerLight);


  const ring = new THREE.Mesh(

    new THREE.TorusGeometry(
      0.82,
      0.025,
      16,
      100
    ),

    chrome

  );

  ring.rotation.set(0.8, 0.5, 0.2);

  group.add(ring);


  const glow = new THREE.PointLight(
    0xffffff,
    20,
    5
  );

  glow.position.set(0.4, 0.2, 1);

  group.add(glow);

}


/* ==========================================
   OBJECT 006 — CONTOUR
   SCULPTURAL LATHE FORM
========================================== */

function createContour(group, environment) {

  const points = [

    new THREE.Vector2(0.05, -1.1),
    new THREE.Vector2(0.42, -0.95),
    new THREE.Vector2(0.7, -0.58),
    new THREE.Vector2(0.76, -0.1),
    new THREE.Vector2(0.65, 0.38),
    new THREE.Vector2(0.38, 0.82),
    new THREE.Vector2(0.05, 1.05)

  ];

  const geometry = new THREE.LatheGeometry(
    points,
    96
  );

  geometry.computeVertexNormals();

  const object = new THREE.Mesh(

    geometry,

    createChromeMaterial(environment)

  );

  object.scale.set(0.9, 1, 0.9);

  group.add(object);


  const base = new THREE.Mesh(

    new THREE.TorusGeometry(
      0.48,
      0.025,
      16,
      100
    ),

    createDarkMetalMaterial(environment)

  );

  base.rotation.x = Math.PI / 2;
  base.position.y = -0.9;

  group.add(base);

}


/* ==========================================
   OBJECT FACTORY
========================================== */

function buildObject(type, group, environment) {

  switch (type) {

    case "chrome":
      createLiquidForm(group, environment);
      break;

    case "material":
      createMaterialStudy(group, environment);
      break;

    case "type":
      createTypography(group, environment);
      break;

    case "geometry":
      createOrbitalGeometry(group, environment);
      break;

    case "light":
      createLightStudy(group, environment);
      break;

    case "form":
      createContour(group, environment);
      break;

    default:
      createLiquidForm(group, environment);

  }

}


/* ==========================================
   INITIALISE THREE.JS SCENE
========================================== */

function initialiseScene(container, type, number) {

  const host = container.querySelector(".three-host");

  if (!host) return null;

  try {

    const width = Math.max(host.clientWidth, 1);
    const height = Math.max(host.clientHeight, 1);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      38,
      width / height,
      0.1,
      100
    );

    camera.position.set(0, 0, 5.2);


    const renderer = new THREE.WebGLRenderer({

      alpha: true,
      antialias: true,
      powerPreference: "low-power"

    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 1.5)
    );

    renderer.setSize(width, height, false);

    renderer.outputColorSpace = THREE.SRGBColorSpace;

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    renderer.setClearColor(0x090a0c, 0);

    renderer.domElement.setAttribute(
      "aria-hidden",
      "true"
    );

    host.appendChild(renderer.domElement);


    const environment = createEnvironmentTexture();

    const group = new THREE.Group();

    scene.add(group);

    createLighting(scene);

    buildObject(type, group, environment);


    const state = {

      number,
      type,

      scene,
      camera,
      renderer,

      group,
      environment,

      canvas: renderer.domElement,
      host,

      visible: false,
      inModal: false,

      targetX: 0,
      targetY: 0,

      rotationX: 0,
      rotationY: 0

    };


    sceneStates.set(number, state);

    resizeScene(state);

    if (reducedMotion) {
      renderer.render(scene, camera);
    }

    observeArtwork(container, state);

    attachPointerInteraction(container, state);

    return state;

  } catch (error) {

    console.error(
      `MYRLORE archive scene ${number} could not initialise:`,
      error
    );

    host.innerHTML = `
      <div class="three-fallback">
        MYRLORE® / OBJECT STUDY
      </div>
    `;

    return null;

  }

}


/* ==========================================
   RESIZE SCENE
========================================== */

function resizeScene(state) {

  if (!state || !state.renderer) return;

  const parent = state.canvas.parentElement;

  if (!parent) return;

  const width = Math.max(parent.clientWidth, 1);
  const height = Math.max(parent.clientHeight, 1);

  state.camera.aspect = width / height;

  state.camera.updateProjectionMatrix();

  state.renderer.setSize(
    width,
    height,
    false
  );

  state.renderer.render(
    state.scene,
    state.camera
  );

}


/* ==========================================
   INTERSECTION OBSERVER
   PAUSE OFF-SCREEN OBJECTS
========================================== */

const artworkObserver = new IntersectionObserver(

  entries => {

    entries.forEach(entry => {

      const number = entry.target.dataset.entryNumber;

      const state = sceneStates.get(number);

      if (!state) return;

      state.visible = entry.isIntersecting;

    });

    updateAnimationLoop();

  },

  {
    threshold: 0.08
  }

);


function observeArtwork(container, state) {

  container.dataset.entryNumber = state.number;

  artworkObserver.observe(container);

}


/* ==========================================
   POINTER INTERACTION
========================================== */

function attachPointerInteraction(container, state) {

  container.addEventListener("pointermove", event => {

    if (event.pointerType === "touch") return;

    const rect = container.getBoundingClientRect();

    const x = (
      (event.clientX - rect.left) / rect.width
    ) * 2 - 1;

    const y = (
      (event.clientY - rect.top) / rect.height
    ) * 2 - 1;

    state.targetY = x * 0.35;
    state.targetX = -y * 0.22;

  });

  container.addEventListener("pointerleave", () => {

    state.targetX = 0;
    state.targetY = 0;

  });

}


/* ==========================================
   SHARED ANIMATION LOOP
========================================== */

let animationFrame = null;


function updateAnimationLoop() {

  if (reducedMotion) return;

  const hasVisibleScenes = [...sceneStates.values()].some(
    state => state.visible || state.inModal
  );

  if (hasVisibleScenes && animationFrame === null) {

    animationFrame = requestAnimationFrame(animateScenes);

  }

  if (!hasVisibleScenes && animationFrame !== null) {

    cancelAnimationFrame(animationFrame);

    animationFrame = null;

  }

}


function animateScenes() {

  animationFrame = null;

  let hasVisibleScenes = false;

  sceneStates.forEach(state => {

    if (!state.visible && !state.inModal) return;

    hasVisibleScenes = true;

    state.rotationX += (
      state.targetX - state.rotationX
    ) * 0.035;

    state.rotationY += (
      state.targetY - state.rotationY
    ) * 0.035;


    state.group.rotation.x =
      state.rotationX + 0.12;

    state.group.rotation.y +=
      0.0025 + state.rotationY * 0.015;

    state.group.rotation.z =
      Math.sin(Date.now() * 0.0003) * 0.035;


    state.renderer.render(
      state.scene,
      state.camera
    );

  });


  if (hasVisibleScenes) {

    animationFrame = requestAnimationFrame(
      animateScenes
    );

  }

}


/* ==========================================
   RESIZE HANDLING
========================================== */

let resizeFrame = null;

window.addEventListener("resize", () => {

  if (resizeFrame !== null) {
    cancelAnimationFrame(resizeFrame);
  }

  resizeFrame = requestAnimationFrame(() => {

    sceneStates.forEach(state => {
      resizeScene(state);
    });

    resizeFrame = null;

  });

});


/* ==========================================
   ARTWORK HTML
========================================== */

function createArtwork(type, number) {

  return `

    <div class="artwork-scene">

      <div
        class="three-host"
        data-artwork="${type}"
        data-entry="${number}"
      ></div>

    </div>

  `;

}


/* ==========================================
   DISPOSE OLD SCENES
========================================== */

function disposeScenes() {

  artworkObserver.disconnect();

  if (animationFrame !== null) {

    cancelAnimationFrame(animationFrame);

    animationFrame = null;

  }

  sceneStates.forEach(state => {

    if (state.renderer) {

      state.scene.traverse(object => {

        if (object.geometry) {
          object.geometry.dispose();
        }

        if (object.material) {

          if (Array.isArray(object.material)) {

            object.material.forEach(material => {
              material.dispose();
            });

          } else {

            object.material.dispose();

          }

        }

      });

      state.environment.dispose();

      state.renderer.dispose();

      state.renderer.domElement.remove();

    }

  });

  sceneStates.clear();

}


/* ==========================================
   RENDER ARCHIVE
========================================== */

function renderArchive(filter = "all") {

  disposeScenes();

  archiveGrid.innerHTML = "";

  const filteredEntries = archiveEntries.filter(entry => {

    return filter === "all" || entry.category === filter;

  });


  collectionCount.textContent =
    `${String(filteredEntries.length).padStart(2, "0")} ENTRIES`;


  filteredEntries.forEach((entry, index) => {

    const card = document.createElement("article");

    card.className = "archive-entry";

    card.dataset.entryNumber = entry.number;

    card.style.animationDelay = `${index * 0.07}s`;


    card.innerHTML = `

      <div class="entry-artwork">

        ${createArtwork(entry.artwork, entry.number)}

      </div>

      <div class="entry-info">

        <div class="entry-meta">

          <span>NO. ${entry.number}</span>
          <span>${entry.categoryLabel}</span>

        </div>

        <h3>${entry.title}</h3>

        <p>${entry.summary}</p>

      </div>

    `;


    archiveGrid.appendChild(card);


    const artwork = card.querySelector(".entry-artwork");

    initialiseScene(
      artwork,
      entry.artwork,
      entry.number
    );


    card.addEventListener("click", () => {

      openEntry(entry, card);

    });


    card.addEventListener("keydown", event => {

      if (event.key === "Enter" || event.key === " ") {

        event.preventDefault();

        openEntry(entry, card);

      }

    });


    card.setAttribute("tabindex", "0");

    card.setAttribute("role", "button");

    card.setAttribute(
      "aria-label",
      `Open ${entry.title}`
    );

  });

}


/* ==========================================
   FILTERS
========================================== */

filterList.addEventListener("click", event => {

  const button = event.target.closest(".filter-button");

  if (!button) return;

  const filter = button.dataset.filter;


  document.querySelectorAll(".filter-button").forEach(item => {

    item.classList.remove("active");

  });


  button.classList.add("active");

  renderArchive(filter);

});


/* ==========================================
   OPEN ENTRY
========================================== */

function openEntry(entry, triggerElement) {

  previousFocusedElement = triggerElement;

  modalNumber.textContent = `ENTRY / ${entry.number}`;

  modalCategory.textContent = entry.categoryLabel;

  modalTitle.textContent = entry.title;

  modalDescription.textContent = entry.description;

  modalDate.textContent = entry.date;


  modalArtwork.innerHTML = "";

  const state = sceneStates.get(entry.number);

  if (state) {

    currentModalState = state;

    state.inModal = true;

    modalArtwork.appendChild(state.canvas);

    resizeScene(state);

  }


  entryModal.classList.add("open");

  entryModal.setAttribute("aria-hidden", "false");

  document.body.classList.add("modal-open");


  modalClose.focus();

  updateAnimationLoop();

}


/* ==========================================
   CLOSE ENTRY
========================================== */

function closeEntry() {

  if (!entryModal.classList.contains("open")) return;


  if (currentModalState) {

    const state = currentModalState;

    state.inModal = false;

    state.host.appendChild(state.canvas);

    resizeScene(state);

    currentModalState = null;

  }


  entryModal.classList.remove("open");

  entryModal.setAttribute("aria-hidden", "true");

  document.body.classList.remove("modal-open");


  if (previousFocusedElement) {

    previousFocusedElement.focus();

  }


  updateAnimationLoop();

}


modalClose.addEventListener("click", closeEntry);


document.querySelectorAll("[data-close-modal]").forEach(element => {

  element.addEventListener("click", closeEntry);

});


/* ==========================================
   KEYBOARD SUPPORT
========================================== */

document.addEventListener("keydown", event => {

  if (event.key === "Escape") {

    closeEntry();

  }

});


/* ==========================================
   FOOTER YEAR
========================================== */

archiveYear.textContent = new Date().getFullYear();


/* ==========================================
   INITIALISE
========================================== */

renderArchive();
