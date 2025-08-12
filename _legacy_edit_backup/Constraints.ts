export type Axis = "X" | "Y" | "Z";
export type Plane = "XY" | "YZ" | "ZX";
export class Constraints {
  axis: Axis | null = null;
  plane: Plane | null = null;
  alongNormal = false;
  reset() { this.axis = null; this.plane = null; this.alongNormal = false; }
  apply(_base: [number, number, number], d: [number, number, number]): [number, number, number] {
    if (this.alongNormal) return d;
    if (this.axis) {
      const M: Record<Axis, [number, number, number]> = { X: [1, 0, 0], Y: [0, 1, 0], Z: [0, 0, 1] };
      const a = M[this.axis]; const dot = d[0] * a[0] + d[1] * a[1] + d[2] * a[2];
      return [a[0] * dot, a[1] * dot, a[2] * dot];
    }
    if (this.plane) {
      const N: Record<Plane, [number, number, number]> = { XY: [0, 0, 1], YZ: [1, 0, 0], ZX: [0, 1, 0] };
      const n = N[this.plane]; const dot = d[0] * n[0] + d[1] * n[1] + d[2] * n[2];
      return [d[0] - n[0] * dot, d[1] - n[1] * dot, d[2] - n[2] * dot];
    }
    return d;
  }
}
