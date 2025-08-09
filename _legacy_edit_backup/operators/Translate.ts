import { Operator, PointerState } from "../Operator";
import { EditContext } from "../EditContext";
import { TranslateCommand } from "../../ops/transforms";
import { collectAffectedVerts } from "../selection-utils";

export class TranslateOperator implements Operator {
  readonly id = "translate"; phase: "idle" | "running" | "finished" | "canceled" = "idle";
  private start: [number, number, number] = [0, 0, 0];
  private verts: number[] = [];
  private delta: [number, number, number] = [0, 0, 0];

  begin(ctx: EditContext, start: PointerState) {
    this.phase = "running";
    this.start = ctx.snapping.snap(start).point;
    this.verts = collectAffectedVerts(ctx.mesh, ctx.selection);
  }
  update(ctx: EditContext, cur: PointerState) {
    const hit = ctx.snapping.snap(cur);
    const raw: [number, number, number] = [
      hit.point[0] - this.start[0],
      hit.point[1] - this.start[1],
      hit.point[2] - this.start[2],
    ];
    this.delta = ctx.constraints.apply(this.start, raw);
    ctx.preview.clear();
    for (const v of this.verts) {
      const p = ctx.mesh.position.get(v);
      ctx.preview.addPoint([p[0] + this.delta[0], p[1] + this.delta[1], p[2] + this.delta[2]]);
    }
  }
  commit(ctx: EditContext) {
    if (this.phase !== "running") return;
    ctx.preview.clear();
    ctx.history.run({ mesh: ctx.mesh }, new TranslateCommand(this.verts, this.delta));
    this.phase = "finished";
  }
  cancel(ctx: EditContext) { this.phase = "canceled"; ctx.preview.clear(); }
}
