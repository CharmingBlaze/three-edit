export type SnapSettings = {
  translate?: number; // world units
  rotate?: number;    // radians
  scale?: number;     // unitless factor increment
};

/**
 * Centralized snapping settings and helpers. Intended to plug into GizmoManager.
 */
export class Snapping {
  settings: SnapSettings = {};
  constructor(initial?: SnapSettings){ if (initial) this.settings = { ...initial }; }

  set(s: SnapSettings){ this.settings = { ...this.settings, ...s }; }
  get(){ return { ...this.settings }; }

  // Utility to quantize values
  quantizeTranslate(v: [number,number,number]){
    const t = this.settings.translate;
    if (!t || t <= 0) return v;
    return [
      Math.round(v[0]/t)*t,
      Math.round(v[1]/t)*t,
      Math.round(v[2]/t)*t,
    ] as [number,number,number];
  }

  quantizeRotate(rad: number){
    const r = this.settings.rotate;
    if (!r || r <= 0) return rad;
    return Math.round(rad / r) * r;
  }

  quantizeScale(s: [number,number,number]){
    const step = this.settings.scale;
    if (!step || step <= 0) return s;
    const q = (x: number)=> Math.round(x/step)*step;
    return [q(s[0]), q(s[1]), q(s[2])] as [number,number,number];
  }
}
