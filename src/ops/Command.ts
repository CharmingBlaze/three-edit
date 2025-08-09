import { EditableMesh } from "../core/topology/EditableMesh";
export interface CommandCtx { mesh: EditableMesh }
export interface Command { name: string; do(ctx: CommandCtx): void; undo(ctx: CommandCtx): void; merge?(prev: Command): boolean; }
