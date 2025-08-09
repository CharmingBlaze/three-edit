import { Operator, PointerState } from "../Operator";
import { EditContext } from "../EditContext";

export class BevelOperator implements Operator {
  readonly id = "bevel"; phase: "idle" | "running" | "finished" | "canceled" = "idle";
  begin(_ctx: EditContext, _start: PointerState) { this.phase = "running"; }
  update(_ctx: EditContext, _cur: PointerState) { /* TODO: preview */ }
  commit(_ctx: EditContext) { this.phase = "finished"; }
  cancel(_ctx: EditContext) { this.phase = "canceled"; }
}
