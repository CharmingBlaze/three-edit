import { Command, CommandCtx } from "./Command";
import { validateMesh } from "../core/topology/MeshValidator";

const DEV_VALIDATE = process.env.NODE_ENV !== "production";

export class History {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  private tx: Command[] | null = null;

  begin(){ this.tx = []; }

  run(ctx: CommandCtx, cmd: Command) {
    const prev = (this.tx ?? this.undoStack)[(this.tx ?? this.undoStack).length - 1];
    cmd.do(ctx);
    if (prev && cmd.merge?.(prev)) return;
    (this.tx ?? this.undoStack).push(cmd);
    this.redoStack.length = 0;
    if (!this.tx && DEV_VALIDATE) validateMesh(ctx.mesh);
  }

  commit(ctx: CommandCtx){
    if (!this.tx) return;
    // Optionally coalesce tx into a MultiCommand later; for now, keep as individual entries already applied.
    this.tx = null;
    if (DEV_VALIDATE) validateMesh(ctx.mesh);
  }

  cancel(ctx: CommandCtx){
    if (!this.tx) return;
    while (this.tx.length) this.tx.pop()!.undo(ctx);
    this.tx = null;
  }

  undo(ctx: CommandCtx) { const c = this.undoStack.pop(); if (!c) return; c.undo(ctx); this.redoStack.push(c); }
  redo(ctx: CommandCtx) { const c = this.redoStack.pop(); if (!c) return; c.do(ctx); this.undoStack.push(c); }
}
