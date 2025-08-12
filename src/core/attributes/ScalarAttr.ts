import { AttributeLayer } from "./AttributeLayer";
export class ScalarAttr implements AttributeLayer<number> {
  size = 0;
  private a = new Float32Array(0);
  constructor(n = 0) { this.resize(n); }
  get(i: number) { return this.a[i]!; }
  set(i: number, v: number) { this.a[i] = v; }
  resize(n: number) { const b = new Float32Array(n); b.set(this.a.subarray(0, Math.min(this.size, n))); this.a = b; this.size = n; }
  clone() { const c = new ScalarAttr(this.size); (c as any).a.set(this.a); return c; }
}
