// Dense ID utilities: simple freelist pattern helpers (optional)
export class FreeList {
  private free: number[] = [];
  alloc(next: number[]): number {
    const id = this.free.pop();
    if (id != null) return id;
    const v = next.length;
    next.push(v);
    return v;
  }
  release(id: number) { this.free.push(id); }
  get freeCount() { return this.free.length; }
}
