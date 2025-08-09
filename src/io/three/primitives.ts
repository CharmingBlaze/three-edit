// /io/three/primitives.ts
import * as THREE from "three";
import { EditableMesh } from "../../core/topology/EditableMesh";
import { fromThreeBufferGeometry } from "./FromThree";
// Optional (commented): if you want to weld duplicates before import
// import { BufferGeometryUtils } from "three-stdlib"; // or "three/examples/jsm/utils/BufferGeometryUtils.js"

/**
 * NOTE:
 * - Keep this file small & adapter-only. Core remains renderer-agnostic.
 * - UVs/normals come from Three; importer converts UVs to per-corner.
 * - If you care about quads in-editor, run a tri->quad merge after import.
 */

export type PrimitiveOpts =
  // Boxes & planes
  | { kind: "box";      size?: [number, number, number]; segments?: [number, number, number] }
  | { kind: "plane";    size?: [number, number];         segments?: [number, number] } // "grid" = plane with segments

  // Spheres
  | { kind: "sphere";   radius?: number; widthSegments?: number; heightSegments?: number } // UV sphere
  | { kind: "icosphere"; radius?: number; detail?: number } // icosahedron-subdiv based

  // Cylinders, cones, capsules, pyramids
  | { kind: "cylinder"; radiusTop?: number; radiusBottom?: number; height?: number; radialSegments?: number; heightSegments?: number; openEnded?: boolean }
  | { kind: "cone";     radius?: number; height?: number; radialSegments?: number; heightSegments?: number; openEnded?: boolean }
  | { kind: "capsule";  radius?: number; length?: number; capSegments?: number; radialSegments?: number } // Three r125+ has CapsuleGeometry
  | { kind: "pyramid";  base?: "square" | "tri"; size?: [number, number]; height?: number; flatShaded?: boolean }

  // Curves/lathe/tubes
  | { kind: "lathe";    points: Array<[number, number]>; segments?: number; closed?: boolean }
  | { kind: "tube";     path: THREE.Curve<THREE.Vector3>; tubularSegments?: number; radius?: number; radialSegments?: number; closed?: boolean }

  // Donuts & knots
  | { kind: "torus";    radius?: number; tube?: number; radialSegments?: number; tubularSegments?: number }
  | { kind: "torusKnot"; radius?: number; tube?: number; tubularSegments?: number; radialSegments?: number; p?: number; q?: number };

export function buildPrimitive(opts: PrimitiveOpts): EditableMesh {
  let geom: THREE.BufferGeometry;

  switch (opts.kind) {
    // -------------------------------------------
    // BOX / PLANE
    // -------------------------------------------
    case "box": {
      const [x=1, y=1, z=1] = opts.size ?? [];
      const [sx=1, sy=1, sz=1] = opts.segments ?? [];
      geom = new THREE.BoxGeometry(x, y, z, sx, sy, sz);
      break;
    }
    case "plane": {
      const [w=1, h=1] = opts.size ?? [];
      const [ws=1, hs=1] = opts.segments ?? [];
      geom = new THREE.PlaneGeometry(w, h, ws, hs);
      break;
    }

    // -------------------------------------------
    // SPHERES
    // -------------------------------------------
    case "sphere": {
      const r  = opts.radius ?? 0.5;
      const ws = opts.widthSegments ?? 32;
      const hs = opts.heightSegments ?? 16;
      geom = new THREE.SphereGeometry(r, ws, hs);
      break;
    }
    case "icosphere": {
      const r = opts.radius ?? 0.5;
      const detail = opts.detail ?? 2; // 0..5 usually; higher=denser
      geom = new THREE.IcosahedronGeometry(r, detail);
      break;
    }

    // -------------------------------------------
    // CYLINDER / CONE / CAPSULE / PYRAMID
    // -------------------------------------------
    case "cylinder": {
      geom = new THREE.CylinderGeometry(
        opts.radiusTop ?? 0.5,
        opts.radiusBottom ?? 0.5,
        opts.height ?? 1,
        opts.radialSegments ?? 16,
        opts.heightSegments ?? 1,
        opts.openEnded ?? false
      );
      break;
    }
    case "cone": {
      const radius = opts.radius ?? 0.5;
      const height = opts.height ?? 1;
      const radialSegments = opts.radialSegments ?? 16;
      const heightSegments = opts.heightSegments ?? 1;
      const openEnded = opts.openEnded ?? false;
      geom = new THREE.ConeGeometry(radius, height, radialSegments, heightSegments, openEnded);
      break;
    }
    case "capsule": {
      // CapsuleGeometry(radius=0.5, length=1, capSegments=4, radialSegments=8)
      const radius = opts.radius ?? 0.35;
      const length = opts.length ?? 1.0;
      const capSegments = opts.capSegments ?? 6;
      const radialSegments = opts.radialSegments ?? 12;

      // @ts-ignore - keep runtime guard for older Three
      const Ctor = (THREE as any).CapsuleGeometry;
      if (Ctor) {
        // @ts-ignore
        geom = new Ctor(radius, length, capSegments, radialSegments);
      } else {
        // Fallback: build a cylinder + two half-spheres (simple & good enough)
        const cyl = new THREE.CylinderGeometry(radius, radius, length, radialSegments, 1, true);
        const hemiTop = new THREE.SphereGeometry(radius, radialSegments, capSegments/2, 0, Math.PI*2, 0, Math.PI/2);
        const hemiBot = new THREE.SphereGeometry(radius, radialSegments, capSegments/2, 0, Math.PI*2, Math.PI/2, Math.PI/2);
        hemiTop.translate(0,  length/2, 0);
        hemiBot.translate(0, -length/2, 0);
        // Optional: merge pieces with BufferGeometryUtils if available; else leave separate and import piecewise.
        // For simplicity here, just merge attributes if possible:
        const g = new THREE.BufferGeometry();
        const merged = (THREE as any).BufferGeometryUtils?.mergeGeometries?.([cyl, hemiTop, hemiBot], true);
        geom = merged ?? g.copy(cyl); // fallback to cylinder only if utils missing
      }
      break;
    }
    case "pyramid": {
      const base = opts.base ?? "square";
      const height = opts.height ?? 1;

      if (base === "tri") {
        // Triangular pyramid (tetra)
        const radius = (opts.size?.[0] ?? 1) * 0.5;
        geom = new THREE.TetrahedronGeometry(radius, 0);
      } else {
        // Square/rect pyramid: 4-sided cone scaled to base size
        const sx = opts.size?.[0] ?? 1;
        const sz = opts.size?.[1] ?? sx;
        const radius = Math.max(sx, sz) * 0.5;
        geom = new THREE.ConeGeometry(radius, height, 4, 1, false);
        geom.scale(sx / (2 * radius), 1, sz / (2 * radius));
      }
      break;
    }

    // -------------------------------------------
    // LATHES / TUBES
    // -------------------------------------------
    case "lathe": {
      const pts = (opts.points ?? []).map(([x, y]) => new THREE.Vector2(x, y));
      const segments = opts.segments ?? 24;
      // d.ts supports closed? in newer Three; ignore if not present
      // @ts-ignore
      geom = new THREE.LatheGeometry(pts, segments, 0, Math.PI * 2, opts.closed ?? false);
      break;
    }
    case "tube": {
      geom = new THREE.TubeGeometry(
        opts.path,
        opts.tubularSegments ?? 64,
        opts.radius ?? 0.05,
        opts.radialSegments ?? 8,
        opts.closed ?? false
      );
      break;
    }

    // -------------------------------------------
    // DONUTS
    // -------------------------------------------
    case "torus": {
      geom = new THREE.TorusGeometry(
        opts.radius ?? 0.5,
        opts.tube ?? 0.15,
        opts.radialSegments ?? 16,
        opts.tubularSegments ?? 64
      );
      break;
    }
    case "torusKnot": {
      geom = new THREE.TorusKnotGeometry(
        opts.radius ?? 0.5,
        opts.tube ?? 0.15,
        opts.tubularSegments ?? 128,
        opts.radialSegments ?? 16,
        opts.p ?? 2,
        opts.q ?? 3
      );
      break;
    }

    // -------------------------------------------
    default: {
      // Exhaustive check helper
      const _never: never = opts as never;
      throw new Error(`Unknown primitive kind: ${(_never as any)?.kind}`);
    }
  }

  // Ensure normals (and implicit UVs from Three's generators)
  geom.computeVertexNormals();

  // OPTIONAL: ensure indexed geometry (avoid extra deps if you want)
  if (!geom.getIndex()) {
    // Try to weld vertices to produce an indexed geometry if BufferGeometryUtils is available at runtime
    const utils = (THREE as any).BufferGeometryUtils as {
      mergeVertices?: (g: THREE.BufferGeometry, tol?: number) => THREE.BufferGeometry;
    } | undefined;
    if (utils?.mergeVertices) {
      geom = utils.mergeVertices(geom);
    } else {
      // Fallback: leave geometry non-indexed (or explicitly ensure non-indexed)
      geom = geom.toNonIndexed();
    }
  }

  const mesh = fromThreeBufferGeometry(geom);

  // OPTIONAL: make editing quad-friendly (don’t cross seams/materials)
  // tryMergeTrisToQuads(mesh, { angleDeg: 3, respectSeams: true });

  // OPTIONAL: for square pyramid, keep faces visually flat in-editor
  // if (opts.kind === "pyramid" && opts.base !== "tri" && opts.flatShaded) markFaceNormalsFlat(mesh);

  return mesh;
}
