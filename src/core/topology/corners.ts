import { EditableMesh } from "./EditableMesh";
import { HEID } from "../types";

export function getCornerUV(mesh: EditableMesh, he: HEID): [number, number] {
  const uv = mesh.uv0.get(he) ?? [0, 0];
  return [uv[0], uv[1]];
}

export function setCornerUV(mesh: EditableMesh, he: HEID, uv: [number, number]) {
  mesh.uv0.resize(Math.max(mesh.uv0.size, he + 1));
  mesh.uv0.set(he, uv);
}

export function lerpUV(u: [number, number], v: [number, number], t: number) {
  return [u[0] + (v[0] - u[0]) * t, u[1] + (v[1] - u[1]) * t] as [number, number];
}
