import * as THREE from "three";

/* ==========================================
   MYRLORE® — FORM LAB 2.0
   CUSTOM SCULPTURE EDITOR
========================================== */

const viewport = document.querySelector("#viewport");
const loadingMessage = document.querySelector("#loadingMessage");

const presetList = document.querySelector("#presetList");
const materialOptions = document.querySelector("#materialOptions");
const lightingOptions = document.querySelector("#lightingOptions");

const randomButton = document.querySelector("#randomButton");
const resetButton = document.querySelector("#resetButton");
const geometryReset = document.querySelector("#geometryReset");
const autoRotateInput = document.querySelector("#autoRotate");

const objectNumber = document.querySelector("#objectNumber");
const currentYear = document.querySelector("#currentYear");

const twistControl = document.querySelector("#twistControl");
const scaleControl = document.querySelector("#scaleControl");
const thicknessControl = document.querySelector("#thicknessControl");
const complexityControl = document.querySelector("#complexityControl");

const twistValue = document.querySelector("#twistValue");
const scaleValue = document.querySelector("#scaleValue");
const thicknessValue = document.querySelector("#thicknessValue");
const complexityValue = document.querySelector("#complexityValue");

currentYear.textContent = new Date().getFullYear();


/* ==========================================
   DEFAULT SETTINGS
========================================== */

const defaults = {
  preset: "liquid",
  material: "chrome",
  lighting: "studio",
  autoRotate: true,

  twist: 0.35,
  scale: 1,
  thickness: 1,
  complexity: 5
};

let currentPreset = defaults.preset;
let currentMaterial = defaults.material;
let currentLighting = defaults.lighting;

let parameters = {
  twist: defaults.twist,
  scale: defaults.scale,
  thickness: defaults.thickness,
  complexity: defaults.complexity
};

let scene;
let camera;
let renderer;
let sculptureGroup;

let environmentTexture;

let animationFrame = null;
let resizeObserver = null;

let isDragging = false;

let previousPointer = {
  x: 0,
  y: 0
};

let targetRotationX = 0;
let targetRotationY = 0;

let zoom = 5.2;

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;


/* ==========================================
   ENVIRONMENT REFLECTION
========================================== */

function createEnvironment() {
  const canvas = document.createElement("canvas");

  canvas.width = 1024;
  canvas.height = 512;

  const ctx = canvas.getContext("2d");

  const gradient = ctx.createLinearGradient(
    0, 0, 0, 512
  );

  gradient.addColorStop(0, "#e7e9ec");
  gradient.addColorStop(0.16, "#747b84");
  gradient.addColorStop(0.35, "#252a32");
  gradient.addColorStop(0.53, "#090b0e");
  gradient.addColorStop(0.72, "#6c737c");
  gradient.addColorStop(1, "#d5d8dc");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1024, 512);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(85, 55, 115, 255);

  ctx.fillStyle = "#d9dce0";
  ctx.fillRect(300, 20, 65, 210);

  ctx.fillStyle = "#f5f5f2";
  ctx.fillRect(585, 65, 145, 260);

  ctx.fillStyle = "#aab0b8";
  ctx.fillRect(840, 100, 75, 230);

  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.fillRect(0, 420, 1024, 14);

  const texture = new THREE.CanvasTexture(canvas);

  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;

  return texture;
}


/* ==========================================
   MATERIAL SYSTEM
========================================== */

function getMaterial() {
  const settings = {
    chrome: {
      color: 0xe2e5e8,
      metalness: 1,
      roughness: 0.13,
      envMapIntensity: 2
    },

    titanium: {
      color: 0x626b78,
      metalness: 1,
      roughness: 0.25,
      envMapIntensity: 1.65
    },

    champagne: {
      color: 0xc6b69a,
      metalness: 0.96,
      roughness: 0.19,
      envMapIntensity: 1.8
    }
  };

  return new THREE.MeshPhysicalMaterial({
    ...settings[currentMaterial],
    envMap: environmentTexture,
    clearcoat: 1,
    clearcoatRoughness: 0.1
  });
}


function getDarkMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: 0x242932,
    metalness: 0.95,
    roughness: 0.22,
    envMap: environmentTexture,
    envMapIntensity: 1.5,
    clearcoat: 1
  });
}


/* ==========================================
   LIGHTING SYSTEM
========================================== */

const lights = {};

function createLighting() {
  lights.ambient = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(lights.ambient);

  lights.key = new THREE.DirectionalLight(0xffffff, 3.5);
  lights.key.position.set(4, 5, 6);
  scene.add(lights.key);

  lights.fill = new THREE.DirectionalLight(0xb7c4d4, 2.1);
  lights.fill.position.set(-5, 1, 4);
  scene.add(lights.fill);

  lights.rim = new THREE.PointLight(0xc6b69a, 35, 12);
  lights.rim.position.set(0, -3, -3);
  scene.add(lights.rim);

  lights.top = new THREE.PointLight(0xffffff, 25, 10);
  lights.top.position.set(0, 4, -1);
  scene.add(lights.top);

  applyLighting(currentLighting);
}


function applyLighting(mode) {
  const presets = {
    studio: {
      ambient: 0.8,
      key: 3.5,
      fill: 2.1,
      rim: 35,
      top: 25,
      background: 0x111419
    },

    contrast: {
      ambient: 0.35,
      key: 5.2,
      fill: 0.8,
      rim: 48,
      top: 12,
      background: 0x080a0d
    },

    warm: {
      ambient: 0.9,
      key: 2.8,
      fill: 1.3,
      rim: 42,
      top: 30,
      background: 0x191510
    }
  };

  const p = presets[mode];

  lights.ambient.intensity = p.ambient;
  lights.key.intensity = p.key;
  lights.fill.intensity = p.fill;
  lights.rim.intensity = p.rim;
  lights.top.intensity = p.top;

  lights.key.color.set(
    mode === "warm" ? 0xffe2bb : 0xffffff
  );

  lights.fill.color.set(
    mode === "warm" ? 0xc6a47b : 0xb7c4d4
  );

  lights.rim.color.set(
    mode === "warm" ? 0xe5a969 : 0xc6b69a
  );

  scene.background = new THREE.Color(p.background);
}


/* ==========================================
   GEOMETRY HELPERS
========================================== */

function createMesh(
  geometry,
  material = getMaterial()
) {
  const mesh = new THREE.Mesh(geometry, material);

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return mesh;
}


function addRing(
  group,
  radius,
  tube,
  rotation,
  material
) {
  const ring = createMesh(
    new THREE.TorusGeometry(
      radius,
      tube * parameters.thickness,
      20 + parameters.complexity * 3,
      100 + parameters.complexity * 15
    ),
    material
  );

  ring.rotation.set(...rotation);

  group.add(ring);

  return ring;
}


/* ==========================================
   CUSTOM GEOMETRY DEFORMATION
========================================== */

function deformGeometry(geometry) {
  const position = geometry.attributes.position;

  const twistAmount = parameters.twist;
  const thicknessAmount = parameters.thickness;

  for (let i = 0; i < position.count; i++) {
    let x = position.getX(i);
    let y = position.getY(i);
    let z = position.getZ(i);

    // Twist the geometry around its vertical axis.

    const angle = twistAmount * y * 0.48;

    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const twistedX = x * cos - z * sin;
    const twistedZ = x * sin + z * cos;

    x = twistedX;
    z = twistedZ;

    // Adjust the thickness of the form.

    x *= thicknessAmount;
    z *= thicknessAmount;

    position.setXYZ(i, x, y, z);
  }

  position.needsUpdate = true;

  geometry.computeVertexNormals();

  geometry.computeBoundingSphere();

  return geometry;
}


function applyCustomParameters() {
  if (!sculptureGroup) return;

  sculptureGroup.traverse(object => {
    if (
      object.isMesh &&
      object.geometry
    ) {
      deformGeometry(object.geometry);
    }
  });

  sculptureGroup.scale.setScalar(parameters.scale);
}


/* ==========================================
   PRESET 01 — LIQUID KNOT
========================================== */

function createLiquidKnot(group) {
  const detail = parameters.complexity;

  const main = createMesh(
    new THREE.TorusKnotGeometry(
      0.95,
      0.29 * parameters.thickness,
      180 + detail * 30,
      20 + detail * 5,
      2,
      3
    )
  );

  main.scale.set(1.05, 0.95, 0.9);
  main.rotation.set(0.25, 0.2, 0);

  group.add(main);

  const inner = createMesh(
    new THREE.TorusKnotGeometry(
      0.48,
      0.075 * parameters.thickness,
      120 + detail * 15,
      16 + detail * 2,
      3,
      5
    ),
    getDarkMaterial()
  );

  inner.scale.set(1.1, 1, 0.8);
  inner.rotation.set(0.8, 0.2, 0.5);

  group.add(inner);

  const core = createMesh(
    new THREE.IcosahedronGeometry(
      0.23,
      Math.min(2 + detail / 2, 6)
    ),
    getMaterial()
  );

  group.add(core);
}


/* ==========================================
   PRESET 02 — ORBITAL RINGS
========================================== */

function createOrbital(group) {
  const material = getMaterial();

  addRing(
    group,
    1.12,
    0.035,
    [0.1, 0.2, 0],
    material
  );

  addRing(
    group,
    0.91,
    0.045,
    [1.1, 0.5, 0.2],
    material
  );

  addRing(
    group,
    0.75,
    0.032,
    [0.5, 1.2, 0.8],
    material
  );

  addRing(
    group,
    1.35,
    0.018,
    [1.7, 0.4, 0.5],
    getDarkMaterial()
  );

  const center = createMesh(
    new THREE.IcosahedronGeometry(
      0.23,
      Math.min(2 + parameters.complexity / 2, 6)
    ),
    new THREE.MeshPhysicalMaterial({
      color: 0xc6b69a,
      metalness: 0.95,
      roughness: 0.15,
      envMap: environmentTexture,
      envMapIntensity: 2
    })
  );

  group.add(center);
}


/* ==========================================
   PRESET 03 — MONOLITH
========================================== */

function createMonolith(group) {
  const material = getMaterial();

  const shape = new THREE.Shape();

  shape.moveTo(-0.55, -1.15);
  shape.lineTo(-0.72, 0.75);
  shape.lineTo(-0.35, 1.35);
  shape.lineTo(0.42, 1.15);
  shape.lineTo(0.72, 0.72);
  shape.lineTo(0.55, -1.15);
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.34 * parameters.thickness,
    bevelEnabled: true,
    bevelSegments: parameters.complexity,
    bevelSize: 0.1,
    bevelThickness: 0.1,
    steps: 1,
    curveSegments: 4 + parameters.complexity * 2
  });

  geometry.center();

  const body = createMesh(geometry, material);

  body.rotation.set(0.15, -0.3, 0.08);

  group.add(body);

  const slash = createMesh(
    new THREE.TorusGeometry(
      0.85,
      0.035 * parameters.thickness,
      20 + parameters.complexity * 2,
      100 + parameters.complexity * 12
    ),
    getDarkMaterial()
  );

  slash.scale.set(1.4, 0.38, 1);
  slash.rotation.set(0.8, 0.1, -0.3);

  group.add(slash);

  const base = createMesh(
    new THREE.CylinderGeometry(
      0.55,
      0.7,
      0.12 * parameters.thickness,
      32 + parameters.complexity * 12
    ),
    getDarkMaterial()
  );

  base.position.y = -1.35;

  group.add(base);
}


/* ==========================================
   PRESET 04 — FLUID WAVE
========================================== */

function createFluidWave(group) {
  const detail = parameters.complexity;
  const material = getMaterial();

  const points = [];

  const pointCount = 35 + detail * 12;

  for (let i = 0; i <= pointCount; i++) {
    const t = i / pointCount;

    const x = (t - 0.5) * 3.2;

    const y =
      Math.sin(t * Math.PI * 3) * 0.55;

    const z =
      Math.cos(t * Math.PI * 2) * 0.25;

    points.push(
      new THREE.Vector3(x, y, z)
    );
  }

  const curve = new THREE.CatmullRomCurve3(points);

  const wave = createMesh(
    new THREE.TubeGeometry(
      curve,
      100 + detail * 30,
      0.17 * parameters.thickness,
      12 + detail * 3,
      false
    ),
    material
  );

  group.add(wave);

  const secondaryPoints = [];

  for (let i = 0; i <= pointCount; i++) {
    const t = i / pointCount;

    const x = (t - 0.5) * 2.9;

    const y =
      Math.sin(t * Math.PI * 3 + 1.1) * 0.45;

    const z =
      -0.42 + Math.cos(t * Math.PI * 2) * 0.2;

    secondaryPoints.push(
      new THREE.Vector3(x, y, z)
    );
  }

  const secondaryCurve = new THREE.CatmullRomCurve3(
    secondaryPoints
  );

  const secondary = createMesh(
    new THREE.TubeGeometry(
      secondaryCurve,
      100 + detail * 30,
      0.055 * parameters.thickness,
      10 + detail * 2,
      false
    ),
    getDarkMaterial()
  );

  group.add(secondary);
}


/* ==========================================
   PRESET 05 — CHROME BLOOM
========================================== */

function createChromeBloom(group) {
  const material = getMaterial();

  const petalCount = 5 + parameters.complexity;

  for (let i = 0; i < petalCount; i++) {
    const angle =
      (i / petalCount) * Math.PI * 2;

    const petal = createMesh(
      new THREE.SphereGeometry(
        0.55,
        24 + parameters.complexity * 5,
        20 + parameters.complexity * 4
      ),
      material
    );

    petal.scale.set(
      0.35,
      0.95,
      0.19
    );

    petal.position.set(
      Math.cos(angle) * 0.62,
      Math.sin(angle) * 0.62,
      0
    );

    petal.rotation.z = angle - Math.PI / 2;

    group.add(petal);
  }

  const center = createMesh(
    new THREE.SphereGeometry(
      0.4,
      32 + parameters.complexity * 4,
      32 + parameters.complexity * 4
    ),
    getDarkMaterial()
  );

  group.add(center);

  const outerRing = createMesh(
    new THREE.TorusGeometry(
      1.25,
      0.025 * parameters.thickness,
      20 + parameters.complexity * 2,
      100 + parameters.complexity * 12
    ),
    getMaterial()
  );

  outerRing.rotation.x = 0.4;

  group.add(outerRing);
}


/* ==========================================
   PRESET REGISTRY
========================================== */

const presetBuilders = {
  liquid: createLiquidKnot,
  orbit: createOrbital,
  spire: createMonolith,
  wave: createFluidWave,
  bloom: createChromeBloom
};


/* ==========================================
   OBJECT CLEANUP
========================================== */

function clearGroup(group) {
  group.traverse(object => {
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

  while (group.children.length) {
    group.remove(group.children[0]);
  }
}


/* ==========================================
   BUILD SCULPTURE
========================================== */

function buildSculpture(preset) {
  if (!sculptureGroup) return;

  clearGroup(sculptureGroup);

  presetBuilders[preset](sculptureGroup);

  currentPreset = preset;

  applyCustomParameters();

  sculptureGroup.rotation.set(0, 0, 0);

  targetRotationX = 0;
  targetRotationY = 0;

  const presetIndex =
    Object.keys(presetBuilders).indexOf(preset) + 1;

  objectNumber.textContent =
    `OBJECT / ${String(presetIndex).padStart(3, "0")}`;

  renderOnce();
}


/* ==========================================
   GEOMETRY CONTROL SYSTEM
========================================== */

function updateParameterDisplays() {
  twistValue.textContent =
    Number(parameters.twist).toFixed(2);

  scaleValue.textContent =
    Number(parameters.scale).toFixed(2);

  thicknessValue.textContent =
    Number(parameters.thickness).toFixed(2);

  complexityValue.textContent =
    String(parameters.complexity);
}


function readGeometryControls() {
  parameters.twist = Number(twistControl.value);
  parameters.scale = Number(scaleControl.value);
  parameters.thickness = Number(thicknessControl.value);
  parameters.complexity = Number(complexityControl.value);

  updateParameterDisplays();
}


function syncGeometryControls() {
  twistControl.value = parameters.twist;
  scaleControl.value = parameters.scale;
  thicknessControl.value = parameters.thickness;
  complexityControl.value = parameters.complexity;

  updateParameterDisplays();
}


function updateGeometry() {
  readGeometryControls();

  // Rebuild from the original geometry so that
  // slider changes never accumulate deformation.

  buildSculpture(currentPreset);
}


[
  twistControl,
  scaleControl,
  thicknessControl,
  complexityControl
].forEach(control => {
  control.addEventListener("input", updateGeometry);
});


geometryReset.addEventListener("click", () => {
  parameters.twist = defaults.twist;
  parameters.scale = defaults.scale;
  parameters.thickness = defaults.thickness;
  parameters.complexity = defaults.complexity;

  syncGeometryControls();

  buildSculpture(currentPreset);
});


/* ==========================================
   MATERIAL UPDATE
========================================== */

function updateMaterial() {
  buildSculpture(currentPreset);
}


/* ==========================================
   SCENE INITIALISATION
========================================== */

function initialise() {
  scene = new THREE.Scene();

  scene.background = new THREE.Color(0x111419);

  camera = new THREE.PerspectiveCamera(
    38,
    viewport.clientWidth / viewport.clientHeight,
    0.1,
    100
  );

  camera.position.set(0, 0, zoom);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: "high-performance"
  });

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, 1.75)
  );

  renderer.setSize(
    viewport.clientWidth,
    viewport.clientHeight
  );

  renderer.outputColorSpace = THREE.SRGBColorSpace;

  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  renderer.domElement.setAttribute(
    "aria-label",
    "Interactive 3D sculpture. Drag to rotate."
  );

  viewport.appendChild(renderer.domElement);

  environmentTexture = createEnvironment();

  sculptureGroup = new THREE.Group();

  scene.add(sculptureGroup);

  createLighting();

  syncGeometryControls();

  buildSculpture(currentPreset);

  resizeObserver = new ResizeObserver(resizeRenderer);

  resizeObserver.observe(viewport);

  loadingMessage.classList.add("hidden");

  if (!reducedMotion) {
    startAnimation();
  }
}


/* ==========================================
   RENDERING
========================================== */

function renderOnce() {
  if (!renderer || !scene || !camera) return;

  renderer.render(scene, camera);
}


function animate() {
  animationFrame = null;

  if (!renderer) return;

  if (autoRotateInput.checked && !isDragging) {
    sculptureGroup.rotation.y += 0.0028;
  }

  sculptureGroup.rotation.x += (
    targetRotationX - sculptureGroup.rotation.x
  ) * 0.06;

  if (!isDragging) {
    sculptureGroup.rotation.y += (
      targetRotationY - sculptureGroup.rotation.y
    ) * 0.035;
  }

  renderer.render(scene, camera);

  animationFrame = requestAnimationFrame(animate);
}


function startAnimation() {
  if (animationFrame !== null || reducedMotion) return;

  animationFrame = requestAnimationFrame(animate);
}


/* ==========================================
   RESIZE
========================================== */

function resizeRenderer() {
  if (!renderer || !camera) return;

  const width = Math.max(viewport.clientWidth, 1);
  const height = Math.max(viewport.clientHeight, 1);

  camera.aspect = width / height;

  camera.updateProjectionMatrix();

  renderer.setSize(width, height);

  renderOnce();
}


/* ==========================================
   POINTER ROTATION AND ZOOM
========================================== */

function setupPointerEvents() {
  viewport.addEventListener("pointerdown", event => {
    if (event.target !== renderer.domElement) return;

    isDragging = true;

    previousPointer.x = event.clientX;
    previousPointer.y = event.clientY;

    viewport.setPointerCapture(event.pointerId);
  });

  viewport.addEventListener("pointermove", event => {
    if (!isDragging) return;

    const deltaX = event.clientX - previousPointer.x;
    const deltaY = event.clientY - previousPointer.y;

    targetRotationY += deltaX * 0.006;
    targetRotationX += deltaY * 0.006;

    previousPointer.x = event.clientX;
    previousPointer.y = event.clientY;

    if (reducedMotion) {
      sculptureGroup.rotation.y = targetRotationY;
      sculptureGroup.rotation.x = targetRotationX;

      renderOnce();
    }
  });

  viewport.addEventListener("pointerup", () => {
    isDragging = false;
  });

  viewport.addEventListener("pointercancel", () => {
    isDragging = false;
  });

  viewport.addEventListener("wheel", event => {
    event.preventDefault();

    zoom += event.deltaY * 0.003;

    zoom = THREE.MathUtils.clamp(
      zoom,
      3.2,
      8
    );

    camera.position.z = zoom;

    renderOnce();
  }, {
    passive: false
  });
}


/* ==========================================
   PRESET CONTROLS
========================================== */

presetList.addEventListener("click", event => {
  const button = event.target.closest("[data-preset]");

  if (!button) return;

  buildSculpture(button.dataset.preset);

  presetList.querySelectorAll(".preset-button").forEach(item => {
    item.classList.toggle("active", item === button);
  });
});


/* ==========================================
   MATERIAL CONTROLS
========================================== */

materialOptions.addEventListener("click", event => {
  const button = event.target.closest("[data-material]");

  if (!button) return;

  currentMaterial = button.dataset.material;

  materialOptions.querySelectorAll(".material-button").forEach(item => {
    item.classList.toggle("active", item === button);
  });

  updateMaterial();
});


/* ==========================================
   LIGHTING CONTROLS
========================================== */

lightingOptions.addEventListener("click", event => {
  const button = event.target.closest("[data-lighting]");

  if (!button) return;

  currentLighting = button.dataset.lighting;

  applyLighting(currentLighting);

  lightingOptions.querySelectorAll(".lighting-button").forEach(item => {
    item.classList.toggle("active", item === button);
  });

  renderOnce();
});


/* ==========================================
   RANDOM GENERATOR
========================================== */

randomButton.addEventListener("click", () => {
  const presets = Object.keys(presetBuilders);

  const materials = [
    "chrome",
    "titanium",
    "champagne"
  ];

  const lightingModes = [
    "studio",
    "contrast",
    "warm"
  ];

  const randomItem = array => {
    return array[
      Math.floor(Math.random() * array.length)
    ];
  };

  currentPreset = randomItem(presets);
  currentMaterial = randomItem(materials);
  currentLighting = randomItem(lightingModes);

  parameters.twist = Number(
    (Math.random() * 3.2 - 1.6).toFixed(2)
  );

  parameters.scale = Number(
    (0.75 + Math.random() * 0.65).toFixed(2)
  );

  parameters.thickness = Number(
    (0.65 + Math.random() * 0.75).toFixed(2)
  );

  parameters.complexity =
    Math.floor(Math.random() * 7) + 2;

  syncGeometryControls();

  buildSculpture(currentPreset);

  applyLighting(currentLighting);

  updateActiveControls();

  renderOnce();
});


/* ==========================================
   ACTIVE CONTROL STATES
========================================== */

function updateActiveControls() {
  presetList.querySelectorAll(".preset-button").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.preset === currentPreset
    );
  });

  materialOptions.querySelectorAll(".material-button").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.material === currentMaterial
    );
  });

  lightingOptions.querySelectorAll(".lighting-button").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.lighting === currentLighting
    );
  });
}


/* ==========================================
   AUTO ROTATION
========================================== */

autoRotateInput.addEventListener("change", () => {
  if (autoRotateInput.checked) {
    startAnimation();
  } else {
    renderOnce();
  }
});


/* ==========================================
   RESET ALL SETTINGS
========================================== */

resetButton.addEventListener("click", () => {
  currentPreset = defaults.preset;
  currentMaterial = defaults.material;
  currentLighting = defaults.lighting;

  parameters.twist = defaults.twist;
  parameters.scale = defaults.scale;
  parameters.thickness = defaults.thickness;
  parameters.complexity = defaults.complexity;

  autoRotateInput.checked = defaults.autoRotate;

  zoom = 5.2;

  camera.position.z = zoom;

  targetRotationX = 0;
  targetRotationY = 0;

  sculptureGroup.rotation.set(0, 0, 0);

  syncGeometryControls();

  buildSculpture(currentPreset);

  applyLighting(currentLighting);

  updateActiveControls();

  renderOnce();
});


/* ==========================================
   CLEANUP
========================================== */

window.addEventListener("beforeunload", () => {
  if (animationFrame !== null) {
    cancelAnimationFrame(animationFrame);
  }

  resizeObserver?.disconnect();

  if (renderer) {
    renderer.dispose();
  }

  environmentTexture?.dispose();
});


/* ==========================================
   START FORM LAB
========================================== */

try {
  setupPointerEvents();
  initialise();

} catch (error) {
  console.error(
    "MYRLORE Form Lab failed to initialise:",
    error
  );

  loadingMessage.textContent =
    "3D INITIALISATION FAILED — PLEASE CHECK WEBGL SUPPORT";
}
