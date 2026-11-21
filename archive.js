/* ==========================================
   MYRLORE® — STUDIO ARCHIVE
   PREMIUM THREE.JS OBJECT COLLECTION
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
    medium: "POLISHED CHROME / 3D FORM",
    focus: "FLUID GEOMETRY",
    palette: "CHROME · GRAPHITE · CHAMPAGNE",
    process: "A flowing ribbon structure was shaped around a central polished core, then layered with darker metal and fine champagne accents.",
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
    medium: "LAYERED METALLIC SURFACES",
    focus: "SURFACE & CONTRAST",
    palette: "SILVER · CHARCOAL · WARM METAL",
    process: "Three ribbon-like surfaces overlap to explore how material, depth and directional light change the reading of a form.",
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
    medium: "EXTRUDED CHROME LETTERFORM",
    focus: "TYPE AS OBJECT",
    palette: "CHROME · GRAPHITE · CHAMPAGNE",
    process: "A custom geometric letterform is extruded, bevelled and paired with a dark inset backing to give typography physical presence.",
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
    medium: "CHROME / ORBITAL STRUCTURE",
    focus: "REPETITION & SYMMETRY",
    palette: "SILVER · CHAMPAGNE · BLACK",
    process: "Intersecting metallic rings create a balanced spatial composition around a single central point.",
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
    medium: "GLASS / CHROME / LIGHT",
    focus: "REFRACTION & REFLECTION",
    palette: "ICE GLASS · SILVER · WARM LIGHT",
    process: "A translucent central form is framed by metallic rings and controlled points of light to study contrast and depth.",
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
    medium: "LATHE-FORMED CHROME",
    focus: "CONTOUR & BALANCE",
    palette: "CHROME · GRAPHITE · CHAMPAGNE",
    process: "A rotationally formed silhouette is traced by a spiral and fine contour lines, creating a study of proportion and movement.",
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
const modalSpecs = document.querySelector("#modalSpecs");
const modalDate = document.querySelector("#modalDate");

const archiveYear = document.querySelector("#archiveYear");

let previousFocusedElement = null;
let currentModalState = null;

const sceneStates = new Map();

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;


/* ==========================================
   ENVIRONMENT TEXTURE
========================================== */

function createEnvironmentTexture() {

  const canvas = document.createElement("canvas");

  canvas.width = 1536;
  canvas.height = 768;

  const context = canvas.getContext("2d");

  const gradient = context.createLinearGradient(
    0, 0, 0, canvas.height
  );

  gradient.addColorStop(0, "#e7e9eb");
  gradient.addColorStop(0.18, "#89919b");
  gradient.addColorStop(0.38, "#242a32");
  gradient.addColorStop(0.58, "#080a0e");
  gradient.addColorStop(0.76, "#626a75");
  gradient.addColorStop(1, "#d8dadd");

  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Broad, feathered studio softboxes create smoother metal reflections.
  function drawSoftbox(x, y, width, height, colour, alpha = 1) {
    const boxGradient = context.createLinearGradient(x, y, x + width, y + height);
    boxGradient.addColorStop(0, `rgba(${colour}, 0)`);
    boxGradient.addColorStop(0.18, `rgba(${colour}, ${0.42 * alpha})`);
    boxGradient.addColorStop(0.5, `rgba(${colour}, ${0.92 * alpha})`);
    boxGradient.addColorStop(0.82, `rgba(${colour}, ${0.42 * alpha})`);
    boxGradient.addColorStop(1, `rgba(${colour}, 0)`);
    context.fillStyle = boxGradient;
    context.fillRect(x, y, width, height);
  }

  drawSoftbox(110, 70, 170, 470, "255,255,255", 0.9);
  drawSoftbox(430, 20, 90, 390, "210,218,228", 0.72);
  drawSoftbox(820, 85, 210, 450, "255,255,248", 0.88);
  drawSoftbox(1260, 45, 115, 410, "190,201,216", 0.68);

  const floorGlow = context.createLinearGradient(0, 610, 0, 690);
  floorGlow.addColorStop(0, "rgba(255,255,255,0)");
  floorGlow.addColorStop(0.5, "rgba(255,255,255,0.38)");
  floorGlow.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = floorGlow;
  context.fillRect(0, 610, canvas.width, 80);

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

    color: 0xe2e5e9,
    metalness: 1,
    roughness: 0.16,

    envMap: environment,
    envMapIntensity: 1.9,

    clearcoat: 1,
    clearcoatRoughness: 0.08

  });

}


function createDarkMetalMaterial(environment) {

  return new THREE.MeshPhysicalMaterial({

    color: 0x292e36,
    metalness: 1,
    roughness: 0.24,

    envMap: environment,
    envMapIntensity: 1.65,

    clearcoat: 1,
    clearcoatRoughness: 0.14

  });

}


function createChampagneMaterial(environment) {

  return new THREE.MeshPhysicalMaterial({

    color: 0xc6b69a,
    metalness: 0.95,
    roughness: 0.2,

    envMap: environment,
    envMapIntensity: 1.7,

    clearcoat: 1,
    clearcoatRoughness: 0.12

  });

}


function createGlassMaterial(environment) {

  return new THREE.MeshPhysicalMaterial({

    color: 0xdce5ed,

    metalness: 0.05,
    roughness: 0.08,

    transmission: 0.92,
    thickness: 1.2,
    ior: 1.45,

    transparent: true,
    opacity: 1,

    envMap: environment,
    envMapIntensity: 1.5,

    clearcoat: 1,
    clearcoatRoughness: 0.04

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
   GEOMETRY HELPERS
========================================== */

// Smooth sculptural tube

function addTube(
  group,
  points,
  radius,
  material,
  segments = 160,
  radialSegments = 20
) {

  const curve = new THREE.CatmullRomCurve3(
    points.map(point => new THREE.Vector3(...point))
  );

  const geometry = new THREE.TubeGeometry(
    curve,
    segments,
    radius,
    radialSegments,
    false
  );

  const mesh = new THREE.Mesh(geometry, material);

  group.add(mesh);

  return mesh;
}


// Custom flowing ribbon surface

function addRibbon(
  group,
  points,
  width,
  material,
  options = {}
) {

  const segments = options.segments || 150;
  const widthSegments = options.widthSegments || 16;

  const twist = options.twist || 0;
  const wave = options.wave || 0;

  const curve = new THREE.CatmullRomCurve3(
    points.map(point => new THREE.Vector3(...point))
  );

  const frames = curve.computeFrenetFrames(
    segments,
    false
  );

  const positions = [];
  const uvs = [];
  const indices = [];

  for (let i = 0; i <= segments; i++) {

    const t = i / segments;

    const center = curve.getPointAt(t);

    const normal = frames.normals[i];
    const binormal = frames.binormals[i];

    const angle = twist * t * Math.PI * 2;

    const rotatedNormal = normal.clone()
      .multiplyScalar(Math.cos(angle))
      .add(
        binormal.clone().multiplyScalar(Math.sin(angle))
      );

    const rotatedBinormal = binormal.clone()
      .multiplyScalar(Math.cos(angle))
      .sub(
        normal.clone().multiplyScalar(Math.sin(angle))
      );

    const widthVariation =
      1 + Math.sin(t * Math.PI * 2) * wave;

    for (let j = 0; j <= widthSegments; j++) {

      const v = j / widthSegments;

      const side = (v - 0.5) * width * widthVariation;

      const point = center.clone().add(
        rotatedNormal.clone().multiplyScalar(side)
      );

      // Slight sculptural curvature

      point.add(
        rotatedBinormal.clone().multiplyScalar(
          Math.sin(v * Math.PI) * 0.035
        )
      );

      positions.push(
        point.x,
        point.y,
        point.z
      );

      uvs.push(t, v);

      if (i < segments && j < widthSegments) {

        const a = i * (widthSegments + 1) + j;
        const b = a + widthSegments + 1;

        indices.push(
          a, b, a + 1,
          b, b + 1, a + 1
        );

      }

    }

  }

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );

  geometry.setAttribute(
    "uv",
    new THREE.Float32BufferAttribute(uvs, 2)
  );

  geometry.setIndex(indices);

  geometry.computeVertexNormals();

  const mesh = new THREE.Mesh(
    geometry,
    material
  );

  group.add(mesh);

  return mesh;
}


/* ==========================================
   OBJECT 001 — LIQUID FORM
   FLUID CHROME SCULPTURE
========================================== */

function createLiquidForm(group, environment) {

  const chrome = createChromeMaterial(environment);
  const darkMetal = createDarkMetalMaterial(environment);
  const champagne = createChampagneMaterial(environment);

  // Main flowing surface

  addRibbon(
    group,

    [
      [-1.25, -0.55, -0.25],
      [-0.95, 0.25, 0.35],
      [-0.35, 0.95, 0.2],
      [0.4, 0.72, -0.25],
      [1.05, 0.05, -0.3],
      [0.85, -0.7, 0.25],
      [0.1, -0.85, 0.4],
      [-0.65, -0.35, 0.25]
    ],

    0.34,
    chrome,

    {
      twist: 1.15,
      wave: 0.24,
      segments: 200,
      widthSegments: 24
    }

  );


  // Secondary folded chrome surface

  addRibbon(
    group,

    [
      [-1.05, 0.5, -0.5],
      [-0.55, 0.95, -0.1],
      [0.2, 0.9, 0.45],
      [1.1, 0.35, 0.3],
      [0.95, -0.4, -0.15],
      [0.25, -0.95, -0.4],
      [-0.65, -0.75, -0.25]
    ],

    0.18,
    darkMetal,

    {
      twist: 0.8,
      wave: 0.3,
      segments: 180
    }

  );


  // Flowing metallic edge

  addTube(
    group,

    [
      [-1.1, -0.45, 0.1],
      [-0.7, 0.3, 0.55],
      [0.0, 0.85, 0.45],
      [0.8, 0.5, 0.15],
      [1.05, -0.2, 0.35],
      [0.45, -0.85, 0.55],
      [-0.45, -0.75, 0.45]
    ],

    0.035,
    champagne,
    180,
    12

  );


  // Central polished core

  const core = new THREE.Mesh(

    new THREE.SphereGeometry(
      0.34,
      64,
      64
    ),

    darkMetal

  );

  core.position.set(0, 0, 0);

  group.add(core);


  // Floating chrome droplets

  const dropletMaterial = chrome;

  [
    [-1.15, 0.55, 0.15, 0.095],
    [1.15, 0.6, -0.15, 0.07],
    [0.95, -0.85, 0.15, 0.11]
  ].forEach(item => {

    const droplet = new THREE.Mesh(

      new THREE.SphereGeometry(
        item[3],
        32,
        32
      ),

      dropletMaterial

    );

    droplet.position.set(
      item[0],
      item[1],
      item[2]
    );

    droplet.scale.set(1, 1.4, 0.85);

    group.add(droplet);

  });

}


/* ==========================================
   OBJECT 002 — SURFACE / 01
   LAYERED METALLIC RIBBONS
========================================== */

function createMaterialStudy(group, environment) {

  const chrome = createChromeMaterial(environment);
  const darkMetal = createDarkMetalMaterial(environment);
  const champagne = createChampagneMaterial(environment);

  // Upper flowing chrome layer

  addRibbon(
    group,

    [
      [-1.5, 0.55, -0.15],
      [-1.0, 0.8, 0.25],
      [-0.35, 0.65, 0.4],
      [0.35, 0.25, 0.15],
      [1.0, 0.15, -0.2],
      [1.45, 0.48, -0.1]
    ],

    0.42,
    chrome,

    {
      twist: 0.16,
      wave: 0.22,
      segments: 180
    }

  );


  // Middle dark metallic layer

  addRibbon(
    group,

    [
      [-1.45, 0.05, 0.25],
      [-0.85, -0.05, 0.45],
      [-0.2, 0.15, 0.2],
      [0.5, 0.55, -0.15],
      [1.25, 0.35, -0.3],
      [1.5, -0.05, -0.15]
    ],

    0.3,
    darkMetal,

    {
      twist: 0.3,
      wave: 0.18,
      segments: 180
    }

  );


  // Lower polished surface

  addRibbon(
    group,

    [
      [-1.35, -0.55, -0.3],
      [-0.8, -0.75, -0.1],
      [-0.15, -0.55, 0.25],
      [0.55, -0.25, 0.35],
      [1.15, -0.35, 0.05],
      [1.4, -0.65, -0.15]
    ],

    0.38,
    chrome,

    {
      twist: 0.2,
      wave: 0.26,
      segments: 180
    }

  );


  // Fine champagne edge detail

  addTube(
    group,

    [
      [-1.35, 0.42, 0.15],
      [-0.75, 0.62, 0.4],
      [-0.1, 0.45, 0.35],
      [0.65, 0.12, 0.05],
      [1.3, 0.2, -0.1]
    ],

    0.018,
    champagne,
    150,
    10

  );


  // Floating structural supports

  const supportMaterial = darkMetal;

  [
    [-0.85, -0.95, 0],
    [0.8, -0.95, 0]
  ].forEach(position => {

    const support = new THREE.Mesh(

      new THREE.CylinderGeometry(
        0.035,
        0.05,
        0.3,
        24
      ),

      supportMaterial

    );

    support.position.set(...position);

    group.add(support);

  });

}


/* ==========================================
   OBJECT 003 — TYPOGRAPHIC SILENCE
   SCULPTED CHROME LETTERFORM
========================================== */

function createTypography(group, environment) {

  const chrome = createChromeMaterial(environment);
  const darkMetal = createDarkMetalMaterial(environment);
  const champagne = createChampagneMaterial(environment);

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
      depth: 0.32,

      bevelEnabled: true,
      bevelSegments: 8,

      steps: 2,

      bevelSize: 0.075,
      bevelThickness: 0.075,

      curveSegments: 24

    }

  );

  geometry.center();


  const letter = new THREE.Mesh(
    geometry,
    chrome
  );

  letter.scale.set(1.25, 1.25, 1.25);

  group.add(letter);


  // Dark inset backing

  const backing = new THREE.Mesh(

    new THREE.ExtrudeGeometry(

      shape,

      {
        depth: 0.08,
        bevelEnabled: true,
        bevelSegments: 3,
        bevelSize: 0.025,
        bevelThickness: 0.025
      }

    ),

    darkMetal

  );

  backing.scale.set(1.28, 1.28, 0.65);

  backing.position.z = -0.28;

  group.add(backing);


  // Sculptural diagonal detail

  addTube(
    group,

    [
      [-1.1, -0.95, 0.25],
      [-0.72, -0.2, 0.35],
      [-0.15, 0.55, 0.4],
      [0.45, 1.0, 0.25],
      [1.1, 0.65, 0.1]
    ],

    0.025,
    champagne,
    130,
    10

  );


  // Floating signature point

  const dot = new THREE.Mesh(

    new THREE.SphereGeometry(
      0.105,
      40,
      40
    ),

    champagne

  );

  dot.position.set(1.35, -0.75, 0.2);

  group.add(dot);


  // Small metallic base

  const base = new THREE.Mesh(

    new THREE.CylinderGeometry(
      0.82,
      0.92,
      0.055,
      96
    ),

    darkMetal

  );

  base.position.y = -1.12;

  group.add(base);

}


/* ==========================================
   OBJECT 004 — ORBITAL GEOMETRY
   ORIGINAL DESIGN — UNCHANGED
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
        28,
        180
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
   GLASS AND CHROME LIGHT SCULPTURE
========================================== */

function createLightStudy(group, environment) {

  const chrome = createChromeMaterial(environment);
  const darkMetal = createDarkMetalMaterial(environment);
  const glass = createGlassMaterial(environment);

  // Central glass sculpture

  const glassCore = new THREE.Mesh(

    new THREE.SphereGeometry(
      0.58,
      96,
      96
    ),

    glass

  );

  glassCore.scale.set(0.8, 1.25, 0.8);

  group.add(glassCore);


  // Floating chrome orbital ring

  const outerRing = new THREE.Mesh(

    new THREE.TorusGeometry(
      1.08,
      0.045,
      28,
      200
    ),

    chrome

  );

  outerRing.rotation.set(
    0.8,
    0.25,
    0.35
  );

  group.add(outerRing);


  // Second intersecting ring

  const innerRing = new THREE.Mesh(

    new THREE.TorusGeometry(
      0.78,
      0.025,
      26,
      180
    ),

    darkMetal

  );

  innerRing.rotation.set(
    1.2,
    0.75,
    -0.4
  );

  group.add(innerRing);


  // Illuminated central column

  const lightMaterial = new THREE.MeshPhysicalMaterial({

    color: 0xf2eee3,

    emissive: 0xd5c8ae,
    emissiveIntensity: 2.1,

    metalness: 0.2,
    roughness: 0.15

  });

  const innerLight = new THREE.Mesh(

    new THREE.CylinderGeometry(
      0.035,
      0.035,
      2.0,
      32
    ),

    lightMaterial

  );

  innerLight.rotation.z = Math.PI / 5;

  group.add(innerLight);


  // Glass halo

  const halo = new THREE.Mesh(

    new THREE.TorusGeometry(
      0.48,
      0.075,
      28,
      160
    ),

    glass

  );

  halo.rotation.set(
    1.3,
    0.2,
    0.6
  );

  group.add(halo);


  // Small chrome nodes

  [
    [-1.05, 0.3, 0],
    [0.95, -0.55, 0.1],
    [0.25, 1.05, -0.1]
  ].forEach(position => {

    const node = new THREE.Mesh(

      new THREE.SphereGeometry(
        0.09,
        32,
        32
      ),

      chrome

    );

    node.position.set(...position);

    group.add(node);

  });


  // Controlled illumination

  const glow = new THREE.PointLight(
    0xe6d8bd,
    32,
    7
  );

  glow.position.set(0.2, 0.3, 1.2);

  group.add(glow);


  const secondaryGlow = new THREE.PointLight(
    0xb8cce8,
    15,
    6
  );

  secondaryGlow.position.set(-1.2, -0.5, -0.8);

  group.add(secondaryGlow);


  // Floating base

  const base = new THREE.Mesh(

    new THREE.CylinderGeometry(
      0.58,
      0.72,
      0.09,
      96
    ),

    darkMetal

  );

  base.position.y = -1.2;

  group.add(base);

}


/* ==========================================
   OBJECT 006 — CONTOUR
   ORGANIC CHROME SCULPTURE
========================================== */

function createContour(group, environment) {

  const chrome = createChromeMaterial(environment);
  const darkMetal = createDarkMetalMaterial(environment);
  const champagne = createChampagneMaterial(environment);

  // Organic profile

  const points = [];

  for (let i = 0; i <= 48; i++) {

    const t = i / 48;

    const y = -1.25 + t * 2.5;

    const taper = Math.sin(t * Math.PI);

    const baseRadius =
      0.2 +
      taper * 0.55 +
      Math.sin(t * Math.PI * 3) * 0.09;

    const radius = Math.max(
      0.08,
      baseRadius
    );

    points.push(
      new THREE.Vector2(radius, y)
    );

  }


  const geometry = new THREE.LatheGeometry(
    points,
    160
  );

  geometry.computeVertexNormals();


  const object = new THREE.Mesh(
    geometry,
    chrome
  );

  object.scale.set(
    0.9,
    1,
    0.9
  );

  group.add(object);


  // Sculptural spiral around the form

  const spiralPoints = [];

  for (let i = 0; i <= 220; i++) {

    const t = i / 220;

    const angle = t * Math.PI * 4.2;

    const y = -1.12 + t * 2.25;

    const taper = Math.sin(
      (t * 0.92 + 0.04) * Math.PI
    );

    const radius =
      0.22 +
      taper * 0.53 +
      Math.sin(t * Math.PI * 3) * 0.075;

    spiralPoints.push([

      Math.cos(angle) * radius,

      y,

      Math.sin(angle) * radius

    ]);

  }


  addTube(
    group,
    spiralPoints,
    0.035,
    darkMetal,
    260,
    16
  );


  // Thin champagne contour line

  const contourPoints = [];

  for (let i = 0; i <= 160; i++) {

    const t = i / 160;

    const angle = t * Math.PI * 2;

    const y = -0.9 + t * 1.8;

    const radius =
      0.82 +
      Math.sin(t * Math.PI * 3) * 0.06;

    contourPoints.push([

      Math.cos(angle) * radius,

      y,

      Math.sin(angle) * radius

    ]);

  }


  addTube(
    group,
    contourPoints,
    0.018,
    champagne,
    200,
    14
  );


  // Sculptural base

  const base = new THREE.Mesh(

    new THREE.TorusGeometry(
      0.46,
      0.035,
      24,
      128
    ),

    darkMetal

  );

  base.rotation.x = Math.PI / 2;

  base.position.y = -1.18;

  group.add(base);


  // Small polished crown

  const crown = new THREE.Mesh(

    new THREE.SphereGeometry(
      0.13,
      40,
      40
    ),

    champagne

  );

  crown.position.y = 1.27;

  group.add(crown);

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
      Math.min(window.devicePixelRatio || 1, 1.75)
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

  if (reducedMotion || document.hidden) return;

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

document.addEventListener("visibilitychange", () => {
  if (document.hidden && animationFrame !== null) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  } else {
    updateAnimationLoop();
  }
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

        <div class="entry-tags" aria-label="Study metadata">
          <span>${entry.focus}</span>
          <span>${entry.medium}</span>
        </div>

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
    item.setAttribute("aria-pressed", "false");
  });

  button.classList.add("active");
  button.setAttribute("aria-pressed", "true");

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

  if (modalSpecs) {
    modalSpecs.innerHTML = `
      <div class="modal-spec">
        <span>MEDIUM</span>
        <strong>${entry.medium}</strong>
      </div>
      <div class="modal-spec">
        <span>FOCUS</span>
        <strong>${entry.focus}</strong>
      </div>
      <div class="modal-spec">
        <span>PALETTE</span>
        <strong>${entry.palette}</strong>
      </div>
      <div class="modal-spec modal-spec-wide">
        <span>PROCESS NOTE</span>
        <strong>${entry.process}</strong>
      </div>
    `;
  }

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

  if (!entryModal.classList.contains("open")) return;

  if (event.key === "Escape") {
    closeEntry();
    return;
  }

  if (event.key === "Tab") {
    const focusable = [...entryModal.querySelectorAll(
      'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    )].filter(element => element.offsetParent !== null);

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
