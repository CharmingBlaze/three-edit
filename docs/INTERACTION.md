# Interaction and Architecture Overview

Three-Edit separates geometry editing, input handling, and gizmo UI. The key public modules are exposed under `src/easy/` and re-exported via `easy`.

## Components

- `SelectionManager`
  - Central source of truth for selection state: `verts`, `edges`, `faces`, and `objectSelected`.
  - Modes: `object | vertex | edge | face`.
  - Helper methods:
    - `setMode(mode)`
    - `toggleFromPick(hit)` — toggle selection from a raycast hit
    - `getVerticesForEdit(editable)` — resolve current selection to vertex ids for transforms
    - `getCentroid(editable, meshObj)` — centroid in world space for pivoting

- `TransformEngine`
  - Headless math operations you can call without the gizmo:
    - `applyTranslate(verts, delta, meshObj, editable)`
    - `applyRotate(verts, { pivot, axis, angle }, meshObj, editable)`
    - `applyScale(verts, { pivot, scale }, meshObj, editable)`
  - Works on vertex ids and uses mesh/world transforms from `meshObj`.

- `GizmoManager`
  - Attaches an interactive transform gizmo to your `meshObj`.
  - Backed by a pluggable `GizmoAdapter` (default: `TransformControlsGizmo`) so you can swap UI.
  - Key options: `mode` (`translate|rotate|scale`), `pivot` (`centroid|cursor`).
  - Methods: `setMode()`, `setPivot()`, `setCursor()`, `getControl()`, `refresh()`.

- `InteractionController`
  - Turns raw mouse/keyboard input into editing gestures (drag, nudge, rotate/scale modifiers, snapping).
  - Coordinates with `SelectionManager` and `TransformEngine`.
  - Typical callbacks:
    - `onEditedTick()` — live update while dragging
    - `onEditedCommit()` — finalize, rebuild normals, push history

## Typical Wiring

```ts
const hub = easy.defaultHub;
const selection = new easy.SelectionManager(hub);
const gizmo = new easy.GizmoManager({ scene, camera, dom, meshObj, editable, selection, hub });
const interaction = new easy.InteractionController({ dom, camera, meshObj, editable, selection, hub, getGizmoControl: () => gizmo.getControl() });
```

## Picks and Overlays
- Picks are obtained via your raycaster and mapped to mesh elements. A typical hit includes:
  - `tri` (triangle index), `face` (face id), and raw intersection data.
- Overlays (optional visual helpers) can render selected `verts`, `edges`, and `faces`.

## Snapping and Modifiers
- The `InteractionController` supports modifier-driven snapping (e.g., Ctrl/Shift while dragging).
- You can also call `TransformEngine` directly to implement custom snapping strategies.

## History and Events
- The `EventHub` publishes `selection.changed`, edited ticks/commits, and other lifecycle signals.
- An `EasyHistory` helper can consume these and provide undo/redo.

## Swapping Gizmo UI
- Implement `GizmoAdapter` to integrate a different gizmo library:
```ts
class MyGizmo implements easy.GizmoAdapter {/* ... */}
const gizmo = new easy.GizmoManager({ /*...*/ gizmoAdapter: new MyGizmo(/*...*/) });
```

## Notes
- Three.js is a peer dependency; keep versions compatible.
- Demo shows UMD and ESM integration — see `demo/te.ts` for shim logic.
