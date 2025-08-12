import { EditableMesh } from "../core/topology/EditableMesh";

/**
 * Apply a transform matrix (row-major 4x4 or column-major like Three.js) to all vertex positions.
 * If from Three.js Matrix4, pass .elements (column-major). Set columnMajor=true.
 */
export function transformObject(mesh: EditableMesh, m: number[], columnMajor = true): void {
  if (columnMajor && m.length === 16) {
    // Three.js column-major elements
    const e = m;
    const V = mesh.vertices();
    for (let v = 0; v < V.length; v++) {
      if (!V[v]) continue;
      const p = mesh.position.get(v) ?? [0, 0, 0];
      const x = p[0], y = p[1], z = p[2];
      const nx = (e[0] ?? 1)*x + (e[4] ?? 0)*y + (e[8] ?? 0)*z + (e[12] ?? 0);
      const ny = (e[1] ?? 0)*x + (e[5] ?? 1)*y + (e[9] ?? 0)*z + (e[13] ?? 0);
      const nz = (e[2] ?? 0)*x + (e[6] ?? 0)*y + (e[10] ?? 1)*z + (e[14] ?? 0);
      mesh.position.set(v, [nx, ny, nz]);
    }
  } else if (m.length === 16) {
    // Row-major 4x4
    const e = m;
    const V = mesh.vertices();
    for (let v = 0; v < V.length; v++) {
      if (!V[v]) continue;
      const p = mesh.position.get(v) ?? [0, 0, 0];
      const x = p[0], y = p[1], z = p[2];
      const nx = (e[0] ?? 1)*x + (e[1] ?? 0)*y + (e[2] ?? 0)*z + (e[3] ?? 0);
      const ny = (e[4] ?? 0)*x + (e[5] ?? 1)*y + (e[6] ?? 0)*z + (e[7] ?? 0);
      const nz = (e[8] ?? 0)*x + (e[9] ?? 0)*y + (e[10] ?? 1)*z + (e[11] ?? 0);
      mesh.position.set(v, [nx, ny, nz]);
    }
  } else if (m.length === 12) {
    // Row-major 3x4 (affine)
    const e = m;
    const V = mesh.vertices();
    for (let v = 0; v < V.length; v++) {
      if (!V[v]) continue;
      const p = mesh.position.get(v) ?? [0, 0, 0];
      const x = p[0], y = p[1], z = p[2];
      const nx = (e[0] ?? 1)*x + (e[1] ?? 0)*y + (e[2] ?? 0)*z + (e[3] ?? 0);
      const ny = (e[4] ?? 0)*x + (e[5] ?? 1)*y + (e[6] ?? 0)*z + (e[7] ?? 0);
      const nz = (e[8] ?? 0)*x + (e[9] ?? 0)*y + (e[10] ?? 1)*z + (e[11] ?? 0);
      mesh.position.set(v, [nx, ny, nz]);
    }
  } else if (columnMajor && m.length === 9) {
    // Column-major 3x3 (rotation/scale only)
    const e = m;
    const V = mesh.vertices();
    for (let v = 0; v < V.length; v++) {
      if (!V[v]) continue;
      const p = mesh.position.get(v) ?? [0, 0, 0];
      const x = p[0], y = p[1], z = p[2];
      const nx = (e[0] ?? 1)*x + (e[3] ?? 0)*y + (e[6] ?? 0)*z;
      const ny = (e[1] ?? 0)*x + (e[4] ?? 1)*y + (e[7] ?? 0)*z;
      const nz = (e[2] ?? 0)*x + (e[5] ?? 0)*y + (e[8] ?? 1)*z;
      mesh.position.set(v, [nx, ny, nz]);
    }
  } else if (m.length === 9) {
    // Row-major 3x3 (rotation/scale only)
    const e = m;
    const V = mesh.vertices();
    for (let v = 0; v < V.length; v++) {
      if (!V[v]) continue;
      const p = mesh.position.get(v) ?? [0, 0, 0];
      const x = p[0], y = p[1], z = p[2];
      const nx = (e[0] ?? 1)*x + (e[1] ?? 0)*y + (e[2] ?? 0)*z;
      const ny = (e[3] ?? 0)*x + (e[4] ?? 1)*y + (e[5] ?? 0)*z;
      const nz = (e[6] ?? 0)*x + (e[7] ?? 0)*y + (e[8] ?? 1)*z;
      mesh.position.set(v, [nx, ny, nz]);
    }
  }
}

/** Translate entire object by delta */
export function translateObject(mesh: EditableMesh, delta: [number, number, number]): void {
  const [dx, dy, dz] = delta; const V = mesh.vertices();
  for (let v = 0; v < V.length; v++) {
    if (!V[v]) continue;
    const p = mesh.position.get(v) ?? [0, 0, 0];
    mesh.position.set(v, [p[0] + dx, p[1] + dy, p[2] + dz]);
  }
}

/** Uniform/non-uniform scale around origin */
export function scaleObject(mesh: EditableMesh, s: [number, number, number] | number): void {
  const sx = typeof s === "number" ? s : (s[0] ?? 1);
  const sy = typeof s === "number" ? s : (s[1] ?? 1);
  const sz = typeof s === "number" ? s : (s[2] ?? 1);
  const V = mesh.vertices();
  for (let v = 0; v < V.length; v++) {
    if (!V[v]) continue;
    const p = mesh.position.get(v) ?? [0, 0, 0];
    mesh.position.set(v, [p[0] * sx, p[1] * sy, p[2] * sz]);
  }
}

/** Rotate around axis by angle (radians) using simple axis-angle around origin */
export function rotateObject(mesh: EditableMesh, axis: [number, number, number], angleRad: number): void {
  const [ax, ay, az] = axis; const len = Math.hypot(ax, ay, az) || 1; const x = ax/len, y = ay/len, z = az/len;
  const c = Math.cos(angleRad), s = Math.sin(angleRad), t = 1 - c;
  const m = [
    t*x*x + c,   t*x*y - s*z, t*x*z + s*y, 0,
    t*x*y + s*z, t*y*y + c,   t*y*z - s*x, 0,
    t*x*z - s*y, t*y*z + s*x, t*z*z + c,   0,
    0,0,0,1
  ];
  transformObject(mesh, m, false);
}

/** Mirror object across axis plane through origin. axis: 'x' | 'y' | 'z' */
export function mirrorObject(mesh: EditableMesh, axis: 'x'|'y'|'z'): void {
  const V = mesh.vertices();
  for (let v = 0; v < V.length; v++) {
    if (!V[v]) continue;
    const p = mesh.position.get(v) ?? [0,0,0];
    if (axis === 'x') mesh.position.set(v, [-p[0], p[1], p[2]]);
    else if (axis === 'y') mesh.position.set(v, [p[0], -p[1], p[2]]);
    else mesh.position.set(v, [p[0], p[1], -p[2]]);
  }
}

/** Translate object so its bounds min corner sits at origin (simple align). */
export function alignObjectToOrigin(mesh: EditableMesh): void {
  const b = mesh.bounds();
  const dx = -b.min[0]!, dy = -b.min[1]!, dz = -b.min[2]!;
  translateObject(mesh, [dx, dy, dz]);
}

/** Snap all vertex positions to a grid of a given step size. */
export function snapObjectToGrid(mesh: EditableMesh, step = 1): void {
  const V = mesh.vertices(); const s = step || 1;
  for (let v = 0; v < V.length; v++) {
    if (!V[v]) continue; const p = mesh.position.get(v) ?? [0,0,0];
    const sx = Math.round(p[0]! / s) * s; const sy = Math.round(p[1]! / s) * s; const sz = Math.round(p[2]! / s) * s;
    mesh.position.set(v, [sx, sy, sz]);
  }
}
