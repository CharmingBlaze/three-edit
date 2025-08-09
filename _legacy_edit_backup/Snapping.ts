import { PointerState } from "./Operator";
export type SnapMode = "none" | "grid";
export class Snapping {
  mode: SnapMode = "grid"; grid = 0.1;
  snap(s: PointerState) {
    if (this.mode !== "grid") return { hit: false, point: [0, 0, 0] as [number, number, number] };
    const t = -s.rayOrigin[2] / s.rayDir[2];
    const p: [number, number, number] = [
      s.rayOrigin[0] + s.rayDir[0] * t,
      s.rayOrigin[1] + s.rayDir[1] * t,
      0,
    ];
    const g = this.grid;
    return { hit: true, point: [Math.round(p[0] / g) * g, Math.round(p[1] / g) * g, 0] as [number, number, number] };
  }
}
