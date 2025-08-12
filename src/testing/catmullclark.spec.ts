import { describe, it, expect } from "vitest";
import { EditableMesh } from "../core/topology/EditableMesh";
import { makeFace } from "../core/topology/build";
import { catmullClark } from "../ops/catmullclark";

describe("catmullClark (placeholder)", () => {
  it("throws a clear error", () => {
    const m = new EditableMesh();
    const v0 = m.addVertex([0,0,0]);
    const v1 = m.addVertex([1,0,0]);
    const v2 = m.addVertex([1,1,0]);
    const v3 = m.addVertex([0,1,0]);
    const f = makeFace(m, [v0, v1, v2, v3]);
    expect(() => catmullClark(m, [f])).toThrow(/Catmull–Clark subdivision is not implemented yet/);
  });
});
