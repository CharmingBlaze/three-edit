export enum DirtyFlag {
  None = 0,
  Topology = 1 << 0,
  Position = 1 << 1,
  Normal = 1 << 2,
  UV = 1 << 3,
}
export class Dirty {
  private mask: number = DirtyFlag.None;
  set(f: DirtyFlag) { this.mask |= f; }
  clear() { this.mask = DirtyFlag.None; }
  has(f: DirtyFlag) { return (this.mask & f) !== 0; }
}
