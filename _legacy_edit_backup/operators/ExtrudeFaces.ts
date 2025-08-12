import { Operator, PointerState } from "../Operator";
import { EditContext } from "../EditContext";
import { ExtrudeFaces } from "../../ops/extrude";

export class ExtrudeFacesOperator implements Operator {
  readonly id = "extrude_faces"; phase: "idle" | "running" | "finished" | "canceled" = "idle";
  private faces: number[] = [];
  private start: [number, number, number] = [0, 0, 0];
  private offset = 0;

  begin(ctx: EditContext, start: PointerState) {
    this.phase = "running";
    this.faces = [...ctx.selection.faces];
    this.start = ctx.snapping.snap(start).point;
  }
  update(ctx: EditContext, cur: PointerState) {
    const p = ctx.snapping.snap(cur).point;
    this.offset = p[1] - this.start[1]; // simple placeholder distance
    ctx.preview.clear();
    // TODO: draw preview loops shifted by offset
  }
  commit(ctx: EditContext) {
    ctx.preview.clear();
    ctx.history.run({ mesh: ctx.mesh }, new ExtrudeFaces(new Set(this.faces), this.offset));
    this.phase = "finished";
  }
  cancel(ctx: EditContext) { this.phase = "canceled"; ctx.preview.clear(); }
}
