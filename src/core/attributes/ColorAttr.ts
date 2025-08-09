import { AttributeLayer } from "./AttributeLayer";
export class ColorAttr implements AttributeLayer<[number, number, number]> {
  size = 0;
  private a = new Float32Array(0);
  constructor(n = 0) { this.resize(n); }
  get(i: number) { const o = i * 3; return [this.a[o]!, this.a[o + 1]!, this.a[o + 2]!] as [number,number,number]; }
  set(i: number, v: [number, number, number]) { const o = i * 3; this.a[o] = v[0]; this.a[o + 1] = v[1]; this.a[o + 2] = v[2]; }
  resize(n: number) { const b = new Float32Array(n * 3); b.set(this.a.subarray(0, Math.min(this.size, n) * 3)); this.a = b; this.size = n; }
  clone() { const c = new ColorAttr(this.size); (c as any).a.set(this.a); return c as AttributeLayer<[number,number,number]> as ColorAttr; }
}
