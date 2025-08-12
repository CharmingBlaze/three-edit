import { VID, HEID, FID } from "../types";
import type { EditMode, OID } from "./kinds";

export interface MeshSelection {
  mode: EditMode;
  objects: Set<OID>;
  verts: Set<VID>;
  edges: Set<HEID>; // canonical half-edge id
  faces: Set<FID>;
  active?: { kind: EditMode; id: number } | null;
}

export const makeSelection = (): MeshSelection => ({
  mode: "object",
  objects: new Set<OID>(),
  verts: new Set<VID>(),
  edges: new Set<HEID>(),
  faces: new Set<FID>(),
  active: null,
});

export const clear = (s: MeshSelection) => {
  s.objects.clear();
  s.verts.clear();
  s.edges.clear();
  s.faces.clear();
  s.active = null;
};
