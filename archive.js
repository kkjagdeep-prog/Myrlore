
/* ==========================================
   MYRLORE® — STUDIO ARCHIVE
   ARCHIVE CONTENT + INTERACTIONS
========================================== */


/*
  ADD NEW ENTRIES HERE.

  Available categories:
  objects
  materials
  typography

  Available artwork styles:
  chrome
  material
  type
  geometry
  light
  form
*/

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


/* ==========================================
   ARTWORK GENERATOR
========================================== */

function createArtwork(type) {

  const artworkTypes = {
    chrome: `
      <div class="artwork-scene art-chrome">
        <div class="chrome-object"></div>
      </div>
    `,

    material: `
      <div class="artwork-scene art-material">
        <div class="material-object"></div>
      </div>
    `,

    type: `
      <div class="artwork-scene art-type">
        <div class="type-object">M<span>.</span></div>
      </div>
    `,

    geometry: `
      <div class="artwork-scene art-geometry">
        <div class="geometry-object"></div>
      </div>
    `,

    light: `
      <div class="artwork-scene art-light">
        <div class="light-object"></div>
      </div>
    `,

    form: `
      <div class="artwork-scene art-form">
        <div class="form-object"></div>
      </div>
    `
  };

  return artworkTypes[type] || artworkTypes.chrome;
}


/* ==========================================
   RENDER ARCHIVE
========================================== */

function renderArchive(filter = "all") {

  const filteredEntries = archiveEntries.filter(entry => {
    return filter === "all" || entry.category === filter;
  });

  archiveGrid.innerHTML = "";

  collectionCount.textContent =
    `${String(filteredEntries.length).padStart(2, "0")} ENTRIES`;

  filteredEntries.forEach((entry, index) => {

    const card = document.createElement("article");

    card.className = "archive-entry";
    card.dataset.entryNumber = entry.number;
    card.style.animationDelay = `${index * 0.07}s`;

    card.innerHTML = `

      <div class="entry-artwork">

        ${createArtwork(entry.artwork)}

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
    card.setAttribute("aria-label", `Open ${entry.title}`);

    archiveGrid.appendChild(card);

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

  modalArtwork.innerHTML = createArtwork(entry.artwork);

  modalCategory.textContent = entry.categoryLabel;

  modalTitle.textContent = entry.title;

  modalDescription.textContent = entry.description;

  modalDate.textContent = entry.date;

  entryModal.classList.add("open");
  entryModal.setAttribute("aria-hidden", "false");

  document.body.classList.add("modal-open");

  modalClose.focus();

}


/* ==========================================
   CLOSE ENTRY
========================================== */

function closeEntry() {

  if (!entryModal.classList.contains("open")) return;

  entryModal.classList.remove("open");
  entryModal.setAttribute("aria-hidden", "true");

  document.body.classList.remove("modal-open");

  if (previousFocusedElement) {
    previousFocusedElement.focus();
  }

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
