  // Toolbar UI (modes)
  const styleEl = document.createElement('style'); styleEl.textContent = ToolbarStyles; document.head.appendChild(styleEl);
  const toolbar = new ToolbarBuilder();
  toolbar.getElement().style.position = 'absolute';
  toolbar.getElement().style.top = '10px';
  toolbar.getElement().style.left = '10px';
  toolbar.getElement().style.zIndex = '10';
  document.body.appendChild(toolbar.getElement());
  toolbar.addButton({ id: 't', label: 'Move', toggle: true, active: true, title: 'G - Translate', onClick: ()=> gizmoEasy.setMode('translate') });
  toolbar.addButton({ id: 'r', label: 'Rotate', toggle: true, title: 'R - Rotate', onClick: ()=> gizmoEasy.setMode('rotate') });
  toolbar.addButton({ id: 's', label: 'Scale', toggle: true, title: 'S - Scale', onClick: ()=> gizmoEasy.setMode('scale') });
// Three-Edit 3D Editor Demo (2025)
// - Clean UI, dropdown menus
// - Create primitives (Three-Edit adapter and raw Three.js)
// - Selection modes: object, vertex, edge, face
// - Basic operations: translate/rotate/scale (vertex/object), extrude/inset/bevel (face)
// - Mouse: Orbit controls, click select, drag to translate in screen plane

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// Use source during development to avoid dist desync
// Import via shim that prefers UMD global `ThreeEdit` if available, else falls back to source ESM
import { io, core, ops, easy } from "./te";
import type { PickResult } from "../src/easy/Picking";
import { History as EasyHistoryClass } from "../src/easy/History";
import { SelectionManager as EasySelectionManagerClass } from "../src/easy/SelectionManager";
import { GizmoManager as EasyGizmoManagerClass } from "../src/easy/GizmoManager";
import { GridAxes } from "../src/easy/Grid";
import { Cursor3D } from "../src/easy/Cursor";
import { Snapping } from "../src/easy/Snapping";
import { Keymap } from "../src/easy/Keymap";
import * as Overlays from "../src/easy/Overlays";
import { ToolbarBuilder, ToolbarStyles } from "../src/easy/Toolbar";
import { EventHub, defaultHub } from "../src/easy/EventHub";
import { Mouse } from "../src/easy/Mouse";
import { InteractionController } from "../src/easy/InteractionController";

// Types
type Mode = "object" | "vertex" | "edge" | "face";

type EdgeKey = string; // canonical edge key
function edgeKey(a: number, b: number): EdgeKey { return a < b ? `${a}|${b}` : `${b}|${a}`; }

// State
let mode: Mode = "object";
let container: HTMLElement;
let renderer: THREE.WebGLRenderer;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let controls: OrbitControls;
let raycaster = new THREE.Raycaster();
let pointer = new THREE.Vector2();
let objectSelected = false; // kept only for UI state; selection state is in selectionEasy
// easy helpers
let selectionEasy: EasySelectionManagerClass;
let historyEasy: EasyHistoryClass;
let gizmoEasy: EasyGizmoManagerClass;
let hub: EventHub;
let mouse: Mouse;
let interaction: InteractionController;

// Library mesh and Three mesh
let editable = new core.topology.EditableMesh();
let meshObj: THREE.Mesh;
let mapping: { triFaces: number[]; triCornerHEs: Array<[number, number, number]> } = { triFaces: [], triCornerHEs: [] };

// Selection state now fully managed by SelectionManager (selectionEasy)

// Visual helpers
let gridAxes: GridAxes;
let lights: THREE.Group;
let cursor: Cursor3D;

// UI elements
const ui = {
  primitiveSelect: document.getElementById("primitive-select") as HTMLSelectElement,
  addPrimitive: document.getElementById("add-primitive") as HTMLButtonElement,
  modeSelect: document.getElementById("mode-select") as HTMLSelectElement,
  btnTranslate: document.getElementById("btn-translate") as HTMLButtonElement,
  btnRotate: document.getElementById("btn-rotate") as HTMLButtonElement,
  btnScale: document.getElementById("btn-scale") as HTMLButtonElement,
  btnExtrude: document.getElementById("btn-extrude") as HTMLButtonElement,
  btnInset: document.getElementById("btn-inset") as HTMLButtonElement,
  btnBevel: document.getElementById("btn-bevel") as HTMLButtonElement,
  btnDelete: document.getElementById("btn-delete") as HTMLButtonElement,
  btnClear: document.getElementById("btn-clear-select") as HTMLButtonElement,
  btnNew: document.getElementById("btn-new") as HTMLButtonElement,
  status: document.getElementById("status-text") as HTMLSpanElement,
};

// Prevent duplicate init in HMR / previews
let rafId = 0;
init();
animate();

function cleanup(){
  try {
    window.removeEventListener("resize", onResize);
    if (renderer?.domElement){
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("contextmenu", (e)=> e.preventDefault());
      renderer.domElement.parentElement?.removeChild(renderer.domElement);
    }
    (controls as any)?.dispose?.();
    (gridAxes as any)?.removeFrom?.(scene);
    (cursor as any)?.removeFrom?.(scene);
    (gizmoEasy as any)?.dispose?.();
    interaction?.dispose();
    mouse?.detach();
    renderer?.dispose?.();
    cancelAnimationFrame(rafId);
  } catch {}
}

function init() {
  container = document.getElementById("viewport")!;
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x101215);

  camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 500);
  camera.position.set(3, 2, 4);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // Event hub
  hub = defaultHub;
  // Sticky event topics so late subscribers get current state
  hub.sticky('gizmo.mode.changed', true);
  hub.sticky('pivot.changed', true);
  // Mouse emitter -> publishes mouse.* and mouse.pick to hub
  mouse = new Mouse({ dom: renderer.domElement, camera, pick: (x:number,y:number)=> easy.pick(x, y, camera, meshObj as any, mapping as any) });
  mouse.attach();

  // easy: Grid
  gridAxes = new GridAxes({ size: 50, divisions: 50, showAxes: true });
  gridAxes.addTo(scene);

  lights = new THREE.Group();
  const hemi = new THREE.HemisphereLight(0xffffff, 0x303030, 1.0);
  const key = new THREE.DirectionalLight(0xffffff, 1.0); key.position.set(5, 10, 7);
  const fill = new THREE.DirectionalLight(0x88aaff, 0.4); fill.position.set(-7, 5, -3);
  lights.add(hemi, key, fill);
  scene.add(lights);

  // Initial empty mesh object
  const emptyGeom = new THREE.BufferGeometry();
  const mat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.1, roughness: 0.8, flatShading: false });
  meshObj = new THREE.Mesh(emptyGeom, mat);
  scene.add(meshObj);

  // Selection overlays managed by easy.Overlays

  // easy: initialize selection, history, gizmo
  selectionEasy = new EasySelectionManagerClass(hub);
  historyEasy = new EasyHistoryClass();
  gizmoEasy = new EasyGizmoManagerClass({
    scene, camera, dom: renderer.domElement,
    meshObj, editable,
    selection: selectionEasy,
    history: historyEasy,
    hub,
    options: { mode: 'translate', pivot: 'centroid' },
    onDraggingChanged: (dragging)=>{
      controls.enabled = !dragging;
      controls.enableRotate = !dragging;
      hub.emit('gizmo.dragging.changed', { dragging });
    },
    onEditedTick: ()=>{ rebuildGeometryOnly(); updateOverlays(); hub.emit('mesh.edited.tick', {}); },
    onEditedCommit: ()=>{ rebuildThree(); hub.emit('mesh.edited.commit', {}); }
  });

  // Mouse/keys interaction controller: enables screen-plane dragging without relying on gizmo
  interaction = new InteractionController({
    dom: renderer.domElement,
    camera,
    meshObj,
    editable,
    selection: selectionEasy,
    hub,
    getGizmoControl: ()=> gizmoEasy.getControl() as any,
    onEditedTick: ()=>{ rebuildGeometryOnly(); updateOverlays(); hub.emit('mesh.edited.tick', {}); },
    onEditedCommit: ()=>{ rebuildThree(); hub.emit('mesh.edited.commit', {}); }
  });

  // Ensure OrbitControls is disabled as soon as user presses on gizmo
  const tc = gizmoEasy.getControl();
  tc.addEventListener('mouseDown', ()=>{ controls.enabled = false; controls.enableRotate = false; });
  tc.addEventListener('mouseUp',   ()=>{ controls.enabled = true;  controls.enableRotate = true;  });
  (tc as any).addEventListener('hoveron',   ()=>{ controls.enabled = false; });
  (tc as any).addEventListener('hoveroff',  ()=>{ if (!(tc as any).dragging) controls.enabled = true; });

  // easy: snapping and keymap
  const snapping = new Snapping({ translate: 0.1, rotate: 0, scale: 0 });
  gizmoEasy.setSnap(snapping.get());
  const keymap = new Keymap();
  keymap.attach(window);
  keymap.bind('g', () => gizmoEasy.setMode('translate'));
  keymap.bind('r', () => gizmoEasy.setMode('rotate'));
  keymap.bind('s', () => gizmoEasy.setMode('scale'));
  // Keyboard nudges: screen-plane translate using arrow keys
  function nudge(dx: number, dy: number){
    const viewRight = new THREE.Vector3(); const viewUp = new THREE.Vector3();
    camera.getWorldDirection(viewUp).negate();
    viewRight.crossVectors(camera.up, viewUp).normalize();
    const viewUpOrtho = new THREE.Vector3().crossVectors(viewUp, viewRight).normalize();
    const dist = Math.hypot(camera.position.x, camera.position.y, camera.position.z);
    const step = 0.02 * dist; // base step scaled by distance
    const worldDelta = new THREE.Vector3()
      .addScaledVector(viewRight, dx * step)
      .addScaledVector(viewUpOrtho, dy * step);
    const verts = selectionEasy.getVerticesForEdit(editable);
    if (verts.length){
      easy.applyTranslate(verts as any, worldDelta as any, meshObj, editable as any);
      rebuildThree();
      hub.emit('mesh.edited.commit', {});
    }
  }
  keymap.bind('ArrowLeft',  ()=> nudge(-1, 0));
  keymap.bind('ArrowRight', ()=> nudge(+1, 0));
  keymap.bind('ArrowUp',    ()=> nudge(0, +1));
  keymap.bind('ArrowDown',  ()=> nudge(0, -1));

  // easy: 3D cursor for pivot=cursor
  cursor = new Cursor3D({ size: 0.25 });
  cursor.addTo(scene);

  // Toolbar UI (modes)
  const styleEl = document.createElement('style'); styleEl.textContent = ToolbarStyles; document.head.appendChild(styleEl);
  const toolbar = new ToolbarBuilder();
  toolbar.getElement().style.position = 'absolute';
  toolbar.getElement().style.top = '10px';
  toolbar.getElement().style.left = '10px';
  toolbar.getElement().style.zIndex = '10';
  document.body.appendChild(toolbar.getElement());
  toolbar.addButton({ id: 't', label: 'Move', toggle: true, active: true, title: 'G - Translate', onClick: ()=> gizmoEasy.setMode('translate') });
  toolbar.addButton({ id: 'r', label: 'Rotate', toggle: true, title: 'R - Rotate', onClick: ()=> gizmoEasy.setMode('rotate') });
  toolbar.addButton({ id: 's', label: 'Scale', toggle: true, title: 'S - Scale', onClick: ()=> gizmoEasy.setMode('scale') });

  // Events
  hub.on('selection.changed', ()=>{ updateOverlays(); gizmoEasy.refresh(); });
  window.addEventListener("resize", onResize);
  renderer.domElement.addEventListener("pointerdown", onPointerDown);
  renderer.domElement.addEventListener("pointermove", onPointerMove);
  renderer.domElement.addEventListener("pointerup", onPointerUp);
  renderer.domElement.addEventListener("contextmenu", (e)=> e.preventDefault());

  ui.addPrimitive.addEventListener("click", onAddPrimitive);
  ui.modeSelect.addEventListener("change", () => {
    mode = ui.modeSelect.value as Mode;
    setStatus(`Mode: ${mode}`);
    selectionEasy.setMode(mode as any);
    if (mode === 'object' && !selectionEasy.objectSelected){
      // Auto-select object when entering object mode so gizmo is immediately usable
      selectionEasy.objectSelected = true;
    }
    updateOverlays(); gizmoEasy.setMode('translate'); gizmoEasy.refresh();
  });
  ui.btnClear.addEventListener("click", () => { selectionEasy.clear(); selectionEasy.objectSelected = false; updateOverlays(); gizmoEasy.refresh(); });
  ui.btnNew.addEventListener("click", () => { newScene(); });

  ui.btnTranslate.addEventListener("click", () => { gizmoEasy.setMode('translate'); });
  ui.btnRotate.addEventListener("click", () => { gizmoEasy.setMode('rotate'); });
  ui.btnScale.addEventListener("click", () => { gizmoEasy.setMode('scale'); });

  ui.btnExtrude.addEventListener("click", onExtrude);
  ui.btnInset.addEventListener("click", onInset);
  ui.btnBevel.addEventListener("click", onBevel);
  ui.btnDelete.addEventListener("click", onDelete);

  // Seed scene with a box
  editable = io.three.buildPrimitive({ kind: "box", size: [1, 1, 1], segments: [1, 1, 1] });
  interaction.setEditable(editable);
  rebuildThree();
  // Start in object mode with object selected so gizmo can operate immediately
  mode = 'object';
  ui.modeSelect.value = 'object';
  selectionEasy.setMode('object');
  selectionEasy.objectSelected = true;
  updateOverlays();
  gizmoEasy.refresh();
}

function onResize() {
  const w = container.clientWidth, h = container.clientHeight;
  camera.aspect = w / h; camera.updateProjectionMatrix();
  renderer.setSize(w, h); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

function animate() {
  rafId = requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

function setStatus(msg: string){ ui.status.textContent = msg; }

// --- Geometry Sync ---
function rebuildThree() {
  const { geometry, triFaces, triCornerHEs } = io.three.toThreeWithMapping(editable);
  mapping.triFaces = triFaces;
  mapping.triCornerHEs = triCornerHEs;
  geometry.computeVertexNormals();
  disposeGeometry(meshObj.geometry);
  meshObj.geometry = geometry;
  updateOverlays();
  gizmoEasy.refresh();
}

// Rebuild geometry and mapping only (no gizmo refresh) to avoid snapping gizmo back during dragging
function rebuildGeometryOnly(){
  const { geometry, triFaces, triCornerHEs } = io.three.toThreeWithMapping(editable);
  mapping.triFaces = triFaces;
  mapping.triCornerHEs = triCornerHEs;
  geometry.computeVertexNormals();
  disposeGeometry(meshObj.geometry);
  meshObj.geometry = geometry;
}

function disposeGeometry(g: THREE.BufferGeometry){ g.dispose?.(); }

// --- Selection ---
function emitSelectionChanged(){ hub.emit('selection.changed', {}); }

function pick(event: PointerEvent){
  return easy.pick(event.clientX, event.clientY, camera, meshObj as any, mapping as any);
}

function onPointerDown(e: PointerEvent){
  // If gizmo is actively dragging, ignore selection logic
  const tc = gizmoEasy.getControl();
  if ((tc as any).dragging) return;
  // Mouse helper already emits mouse.down via hub
  // Right-click: place cursor and set pivot to cursor
  if (e.button === 2){
    const h = pick(e);
    if (h && h.raw){
      cursor.setPosition(h.raw.point);
      gizmoEasy.setPivot('cursor');
      gizmoEasy.setCursor(cursor.getPosition());
      gizmoEasy.refresh();
    }
    return;
  }
  if (drag.mode) {
    drag.active = true; drag.startX = e.clientX; drag.startY = e.clientY; return;
  }
  const h = pick(e);
  if (!h) {
    if (mode === 'object') {
      // Keep current object selection on empty click in object mode
      gizmoEasy.refresh(); emitSelectionChanged();
      return;
    }
    if (!e.shiftKey) { selectionEasy.clear(); selectionEasy.objectSelected = false; }
    updateOverlays(); gizmoEasy.refresh(); emitSelectionChanged();
    return;
  }
  const tri = h.tri ?? -1; if (tri < 0) return;
  const faceId = h.face ?? mapping.triFaces[tri];
  const cornerHEs = mapping.triCornerHEs[tri];
  if (mode === "face") {
    if (!e.shiftKey) { selectionEasy.faces.clear(); }
    selectionEasy.faces.add(faceId);
  } else if (mode === "vertex") {
    const he = cornerHEs[closestCornerOfHit(h)];
    const v = editable.halfEdges()[he]!.v;
    if (!e.shiftKey) selectionEasy.verts.clear();
    selectionEasy.verts.add(v);
  } else if (mode === "edge") {
    const he = cornerHEs[closestEdgeOfHit(h)];
    const heRec = editable.halfEdges()[he]!;
    // Find from-vertex: previous in face loop
    const prev = prevOf(editable, he);
    const vA = editable.halfEdges()[prev]!.v;
    const vB = heRec.v;
    const key = edgeKey(vA, vB);
    if (!e.shiftKey) selectionEasy.edges.clear();
    if (selectionEasy.edges.has(key)) selectionEasy.edges.delete(key); else selectionEasy.edges.add(key);
  } else {
    // object mode: mark object selected (face set optional)
    if (!e.shiftKey) { selectionEasy.clear(); }
    selectionEasy.objectSelected = true;
  }
  updateOverlays(); gizmoEasy.refresh(); emitSelectionChanged();
}

function onPointerMove(e: PointerEvent){
  // Ignore if gizmo is dragging
  if ((gizmoEasy.getControl() as any).dragging) return;
  if (!drag.active || !drag.mode) return;
  // Mouse helper already emits mouse.move via hub
  const dx = (e.clientX - drag.startX);
  const dy = (e.clientY - drag.startY);
  drag.startX = e.clientX; drag.startY = e.clientY;
  const scale = 0.002 * Math.hypot(camera.position.x, camera.position.y, camera.position.z);
  const delta: [number, number, number] = [dx * scale, -dy * scale, 0];
  const viewRight = new THREE.Vector3(); const viewUp = new THREE.Vector3();
  camera.getWorldDirection(viewUp).negate(); // forward
  viewRight.crossVectors(camera.up, viewUp).normalize();
  const viewUpOrtho = new THREE.Vector3().crossVectors(viewUp, viewRight).normalize();
  const worldDelta = new THREE.Vector3()
    .addScaledVector(viewRight, delta[0])
    .addScaledVector(viewUpOrtho, delta[1]);

  if (mode === "vertex") {
    const verts = Array.from(selVerts);
    const cmd = new ops.TranslateCommand(verts, [worldDelta.x, worldDelta.y, worldDelta.z]);
    cmd.do({ mesh: editable } as any);
  } else if (mode === "object") {
    const V = editable.vertices(); const allV: number[] = [];
    for (let i=0;i<V.length;i++){ if (V[i]) allV.push(i); }
    if (allV.length){
      const cmd = new ops.TranslateCommand(allV, [worldDelta.x, worldDelta.y, worldDelta.z]);
      cmd.do({ mesh: editable } as any);
    }
  }
  rebuildThree();
}

function onPointerUp(){
  drag.active = false;
  // Mouse helper already emits mouse.up via hub
}

// Vite HMR: ensure prior renderer/context is disposed before reloading module
try {
  const anyImport: any = import.meta as any;
  if (anyImport && anyImport.hot) {
    anyImport.hot.dispose(() => {
      cleanup();
    });
  }
} catch {}


function closestCornerOfHit(hit: PickResult){
  // Use barycentric to choose dominant
  const raw = hit.raw!;
  const bc = (raw as any).uv2 || raw.uv; // uv2 used by some setups; fallback to uv (not exact barycentric)
  if (!bc) return 0;
  // uv here is not barycentric; three doesn't provide barycentric directly. Approx by face normal orientation using .face.a/b/c would need indexed geo.
  // Fallback: choose vertex nearest to hit point among triangle vertices.
  const tri = hit.tri ?? 0;
  const geom = meshObj.geometry as THREE.BufferGeometry;
  const pos = geom.getAttribute("position") as THREE.BufferAttribute;
  const i0 = tri * 3 + 0, i1 = tri * 3 + 1, i2 = tri * 3 + 2;
  const p0 = new THREE.Vector3(pos.getX(i0), pos.getY(i0), pos.getZ(i0));
  const p1 = new THREE.Vector3(pos.getX(i1), pos.getY(i1), pos.getZ(i1));
  const p2 = new THREE.Vector3(pos.getX(i2), pos.getY(i2), pos.getZ(i2));
  const hp = raw.point as THREE.Vector3;
  const d0 = hp.distanceToSquared(p0);
  const d1 = hp.distanceToSquared(p1);
  const d2 = hp.distanceToSquared(p2);
  return d0 <= d1 && d0 <= d2 ? 0 : (d1 <= d2 ? 1 : 2);
}

function closestEdgeOfHit(hit: PickResult){
  // Choose edge opposite the farthest corner
  const tri = hit.tri ?? 0;
  const geom = meshObj.geometry as THREE.BufferGeometry;
  const pos = geom.getAttribute("position") as THREE.BufferAttribute;
  const i0 = tri * 3 + 0, i1 = tri * 3 + 1, i2 = tri * 3 + 2;
  const p = hit.raw!.point as THREE.Vector3;
  const v0 = new THREE.Vector3(pos.getX(i0), pos.getY(i0), pos.getZ(i0));
  const v1 = new THREE.Vector3(pos.getX(i1), pos.getY(i1), pos.getZ(i1));
  const v2 = new THREE.Vector3(pos.getX(i2), pos.getY(i2), pos.getZ(i2));
  const d0 = p.distanceToSquared(v0), d1 = p.distanceToSquared(v1), d2 = p.distanceToSquared(v2);
  // Edge indices in triangle corner order: 0:(1-2), 1:(2-0), 2:(0-1)
  const far = d0 > d1 && d0 > d2 ? 0 : (d1 > d2 ? 1 : 2);
  return far; // map to corner index as representative
}

function prevOf(mesh: core.topology.EditableMesh, he: number){
  const HE = mesh.halfEdges();
  let cur = he; for (let i=0; i<HE.length; i++) { const n = HE[cur]!.next; if (n === he) return cur; cur = n; }
  return he;
}

// --- Overlays ---
function updateOverlays(){
  updateVertsOverlay();
  updateEdgesOverlay();
  updateFacesOverlay();
}

function syncSelectionToEasy(){
  selectionEasy.setMode(mode as any);
  selectionEasy.clear();
  if (mode === 'object'){
    selectionEasy.objectSelected = objectSelected;
  } else if (mode === 'vertex'){
    for (const v of selVerts) selectionEasy.verts.add(v);
  } else if (mode === 'edge'){
    for (const k of selEdges) selectionEasy.edges.add(k);
  } else if (mode === 'face'){
    for (const f of selFaces) selectionEasy.faces.add(f);
  }
}

function updateVertsOverlay(){
  Overlays.showVerts(Array.from(selectionEasy.verts), editable, scene, { color: 0x33ccff, size: 6 });
}

function updateEdgesOverlay(){
  const edges: Array<[number,number]> = [];
  for (const key of selectionEasy.edges){
    const [a, b] = key.split('|').map(Number);
    if (Number.isFinite(a) && Number.isFinite(b)) edges.push([a,b]);
  }
  Overlays.showEdges(edges, editable, scene, { color: 0xffaa00 });
}

function updateFacesOverlay(){
  Overlays.showFaces(Array.from(selectionEasy.faces), meshObj, mapping, scene, { color: 0x00ff88, opacity: 0.25 });
}

// --- UI Actions ---
async function onAddPrimitive(){
  const val = ui.primitiveSelect.value;
  if (!val || val === "none") return;
  if (val.startsWith("three:")){
    const kind = val.split(":")[1];
    let g: THREE.BufferGeometry;
    switch (kind){
      case "box": g = new THREE.BoxGeometry(1,1,1,1,1,1); break;
      case "plane": g = new THREE.PlaneGeometry(1,1,1,1); break;
      case "sphere": g = new THREE.SphereGeometry(0.5, 32, 16); break;
      case "capsule": {
        const CG = (THREE as any).CapsuleGeometry;
        // Use CapsuleGeometry if available; otherwise fall back to a sphere
        g = CG ? new CG(0.35, 1.0, 8, 16) : new THREE.SphereGeometry(0.5, 16, 12);
        break;
      }
      default: g = new THREE.BoxGeometry(1,1,1,1,1,1);
    }
    editable = io.three.fromThreeBufferGeometry(g);
  } else {
    switch(val){
      case "box": editable = io.three.buildPrimitive({ kind: "box", size: [1,1,1], segments: [1,1,1] }); break;
      case "plane": editable = io.three.buildPrimitive({ kind: "plane", size: [2,2], segments: [2,2] }); break;
      case "sphere": editable = io.three.buildPrimitive({ kind: "sphere", radius: 0.5, widthSegments: 32, heightSegments: 16 }); break;
      case "icosphere": editable = io.three.buildPrimitive({ kind: "icosphere", radius: 0.5, detail: 2 }); break;
      case "cylinder": editable = io.three.buildPrimitive({ kind: "cylinder", radiusTop: 0.5, radiusBottom: 0.5, height: 1, radialSegments: 16 }); break;
      case "cone": editable = io.three.buildPrimitive({ kind: "cone", radius: 0.5, height: 1, radialSegments: 16 }); break;
      case "capsule": editable = io.three.buildPrimitive({ kind: "capsule", radius: 0.35, length: 1.0, capSegments: 6, radialSegments: 12 }); break;
      case "pyramid": editable = io.three.buildPrimitive({ kind: "pyramid", base: "square", size: [1,1], height: 1 }); break;
      case "lathe": editable = io.three.buildPrimitive({ kind: "lathe", points: [[0.0,0.0],[0.2,0.1],[0.5,0.2],[0.55,0.4],[0.3,0.5],[0.1,0.6]], segments: 48 }); break;
      case "tube": {
        const path = new THREE.CatmullRomCurve3([
          new THREE.Vector3(-1,0,0), new THREE.Vector3(-0.3,0.4,0.2), new THREE.Vector3(0.5,0.1,-0.2), new THREE.Vector3(1,0,0)
        ]);
        // @ts-ignore closed supported in new types
        editable = io.three.buildPrimitive({ kind: "tube", path, tubularSegments: 100, radius: 0.05, radialSegments: 8, closed: false });
        break;
      }
      case "torus": editable = io.three.buildPrimitive({ kind: "torus", radius: 0.6, tube: 0.2, radialSegments: 16, tubularSegments: 64 }); break;
      case "torusKnot": editable = io.three.buildPrimitive({ kind: "torusKnot", radius: 0.6, tube: 0.2, tubularSegments: 128, radialSegments: 16, p: 2, q: 3 }); break;
      default: editable = io.three.buildPrimitive({ kind: "box" as any });
    }
  }
  selectionEasy.clear();
  interaction.setEditable(editable);
  rebuildThree();
  // Auto-select the object (all faces) in object mode so gizmo can attach
  if (mode === 'object'){
    selectionEasy.objectSelected = true;
    updateOverlays();
    gizmoEasy.refresh();
  }
}

function onExtrude(){
  if (selectionEasy.faces.size === 0){ setStatus("Select faces to extrude."); return; }
  const cmd = new ops.ExtrudeFacesCommand(Array.from(selectionEasy.faces) as any, 0.2);
  cmd.do({ mesh: editable } as any);
  rebuildThree();
}

function onInset(){
  if (selectionEasy.faces.size === 0){ setStatus("Select faces to inset."); return; }
  const created = ops.insetFacesTopological(editable, Array.from(selectionEasy.faces) as any, 0.85);
  selectionEasy.faces.clear(); for (const f of created) selectionEasy.faces.add(f);
  rebuildThree();
}

function onBevel(){
  // Placeholder: if bevel op present, wire it; else notify
  try {
    // @ts-ignore optional operator
    if (ops.bevel?.bevelEdges){
      const edgesArr: Array<[number,number]> = Array.from(selectionEasy.edges).map(k => k.split("|").map(Number) as [number,number]);
      // @ts-ignore
      const created = ops.bevel.bevelEdges(editable, edgesArr, { width: 0.05, segments: 1 });
      rebuildThree();
      return;
    }
  } catch {}
  setStatus("Bevel op not implemented in library.");
}

function onDelete(){
  // Simple delete: if faces selected, delete faces via build util
  if (selectionEasy.faces.size > 0){
    const { deleteFaces } = (core.topology as any);
    if (deleteFaces) { deleteFaces(editable, Array.from(selectionEasy.faces) as any); selectionEasy.clear(); rebuildThree(); return; }
  }
  setStatus("Delete: nothing to delete or API missing.");
}

// --- Drag Transforms ---
const drag: { mode: null | "translate"|"rotate"|"scale"; active: boolean; startX: number; startY: number } = {
  mode: null, active: false, startX: 0, startY: 0
};
function startDragMode(m: typeof drag.mode){ drag.mode = m; setStatus(`${m} (drag mouse)`); }

function newScene(){
  editable = new core.topology.EditableMesh();
  selectionEasy.clear();
  interaction.setEditable(editable);
  rebuildThree();
}
