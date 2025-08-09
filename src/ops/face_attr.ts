import { Command, CommandCtx } from "./Command";
import { EditableMesh } from "../core/topology/EditableMesh";
import { ScalarAttr } from "../core/attributes/ScalarAttr";

export class AssignMaterialCommand implements Command {
  name = "Assign Material";
  private before = new Map<number, number>();
  constructor(private faces: number[], private matId: number) {}
  do({ mesh }: CommandCtx): void {
    let attr = mesh.faceAttr.get("material") as ScalarAttr | undefined;
    if (!attr) { attr = new ScalarAttr(0); mesh.faceAttr.set("material", attr); }
    for (const f of this.faces) {
      const prev = (attr.get(f) ?? 0) as number; this.before.set(f, prev);
      attr.resize(f + 1); attr.set(f, this.matId);
    }
  }
  undo({ mesh }: CommandCtx): void {
    const attr = mesh.faceAttr.get("material") as ScalarAttr | undefined; if (!attr) return;
    for (const [f, v] of this.before) { attr.set(f, v); }
  }
}

export class MarkSeamCommand implements Command {
  name = "Mark Seam";
  private before = new Map<number, number>();
  constructor(private edges: number[], private on: boolean) {}
  do({ mesh }: CommandCtx): void {
    // store per-half-edge attr "seam" as 0/1
    let attr = mesh.heAttr.get("seam") as ScalarAttr | undefined;
    if (!attr) { attr = new ScalarAttr(0); mesh.heAttr.set("seam", attr); }
    for (const he of this.edges) { const prev = (attr.get(he) ?? 0) as number; this.before.set(he, prev); attr.resize(he + 1); attr.set(he, this.on ? 1 : 0); }
  }
  undo({ mesh }: CommandCtx): void {
    const attr = mesh.heAttr.get("seam") as ScalarAttr | undefined; if (!attr) return;
    for (const [he, v] of this.before) attr.set(he, v);
  }
}

export class MarkSharpCommand implements Command {
  name = "Mark Sharp";
  private before = new Map<number, number>();
  constructor(private edges: number[], private on: boolean) {}
  do({ mesh }: CommandCtx): void {
    let attr = mesh.heAttr.get("hard") as ScalarAttr | undefined;
    if (!attr) { attr = new ScalarAttr(0); mesh.heAttr.set("hard", attr); }
    for (const he of this.edges) { const prev = (attr.get(he) ?? 0) as number; this.before.set(he, prev); attr.resize(he + 1); attr.set(he, this.on ? 1 : 0); }
  }
  undo({ mesh }: CommandCtx): void {
    const attr = mesh.heAttr.get("hard") as ScalarAttr | undefined; if (!attr) return;
    for (const [he, v] of this.before) attr.set(he, v);
  }
}
