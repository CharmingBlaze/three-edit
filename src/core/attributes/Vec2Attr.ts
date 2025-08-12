import { AttributeLayer } from "./AttributeLayer";
export class Vec2Attr implements AttributeLayer<[number, number]> {
  size = 0;
  private a = new Float32Array(0);
  constructor(n = 0) { this.resize(n); }
  get(i: number) { const o = i * 2; return [this.a[o]!, this.a[o + 1]!] as [number, number]; }
  set(i: number, v: [number, number]) { const o = i * 2; this.a[o] = v[0]; this.a[o + 1] = v[1]; }
  resize(n: number) { const b = new Float32Array(n * 2); b.set(this.a.subarray(0, Math.min(this.size, n) * 2)); this.a = b; this.size = n; }
  clone() { const c = new Vec2Attr(this.size); (c as any).a.set(this.a); return c; }
}
