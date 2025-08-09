import { Command, CommandCtx } from "./Command";
import { resolveVertsForEdit, ResolveOptions } from "../edit/SelectionResolve";
import { MeshSelection } from "../core/topology/MeshSelection";
import { EditableMesh } from "../core/topology/EditableMesh";
export class TranslateCommand implements Command {
  name = "Translate"; private before: Array<[number, number, number]> = [];
  constructor(private verts: number[], private delta: [number, number, number]) {}
  do({ mesh }: CommandCtx) {
    this.before.length = 0;
    for (const v of this.verts) {
      const p = mesh.position.get(v)! as [number, number, number];
      this.before.push([p[0], p[1], p[2]]);
      mesh.position.set(v, [p[0] + this.delta[0], p[1] + this.delta[1], p[2] + this.delta[2]]);
    }
  }
  undo({ mesh }: CommandCtx) { for (let i = 0; i < this.verts.length; i++) mesh.position.set(this.verts[i]!, this.before[i]!); }
  merge(prev: Command) {
    const p = prev as TranslateCommand;
    if (p?.name !== "Translate") return false;
    if (p.verts.length !== this.verts.length) return false;
    for (let i = 0; i < p.verts.length; i++) if (p.verts[i] !== this.verts[i]) return false;
    p.delta = [p.delta[0] + this.delta[0], p.delta[1] + this.delta[1], p.delta[2] + this.delta[2]];
    return true;
  }
}

/** Build a TranslateCommand from a selection, resolving coincident vertices (and more) via options. */
export function makeTranslateFromSelection(
  mesh: EditableMesh,
  selection: MeshSelection,
  delta: [number, number, number],
  options: ResolveOptions
): TranslateCommand {
  const verts = resolveVertsForEdit(mesh, selection, options);
  return new TranslateCommand(verts as number[], delta);
}
