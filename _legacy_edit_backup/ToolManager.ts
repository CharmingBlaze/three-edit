import { Operator, PointerState } from "./Operator";
import { EditContext } from "./EditContext";
export class ToolManager {
  private active: Operator | null = null;
  constructor(private ctx: EditContext) {}
  start(op: Operator, start: PointerState) { this.cancel(); this.active = op; op.begin(this.ctx, start); }
  move(state: PointerState) { if (this.active?.phase === "running") this.active.update(this.ctx, state); }
  up() { if (this.active?.phase === "running") { this.active.commit(this.ctx); this.active = null; } }
  cancel() { if (this.active) { this.active.cancel(this.ctx); this.active = null; } }
}
