import { makeSelection, MeshSelection } from "../core/topology/MeshSelection";
import { History } from "../ops/History";
import { EditableMesh } from "../core/topology/EditableMesh";
import * as Q from "../core/topology/MeshQueries";
import type { EditMode } from "../core/topology/kinds";
import type { Command } from "../ops/Command";

export class SelectionManager {
  readonly sel: MeshSelection = makeSelection();
  constructor(private mesh: EditableMesh, private history: History) {}

  setMode(mode: EditMode) { this.sel.mode = mode; this.clearNonDomain(); }

  replace(kind: EditMode, ids: number[]) {
    const before = snapshot(this.sel);
    this.clear();
    ids.forEach(id => this.add(kind, id));
    this.pushSelectionChange(before);
  }

  toggle(kind: EditMode, id: number) {
    const before = snapshot(this.sel);
    this._toggle(kind, id);
    this.pushSelectionChange(before);
  }

  // Conversions
  facesToBoundaryEdges(){ return Q.facesToBoundaryEdges(this.mesh, this.sel.faces); }
  edgesToVerts(){ return Q.edgesToVerts(this.mesh, this.sel.edges); }
  vertsToFaces(){ return Q.vertsToFaces(this.mesh, this.sel.verts); }

  // Selection ops
  grow(){ Q.growSelection(this.mesh, this.sel); }
  shrink(){ Q.shrinkSelection(this.mesh, this.sel); }
  loop(){ Q.edgeLoopFromSeed(this.mesh, this.sel); }
  ring(){ Q.edgeRingFromSeed(this.mesh, this.sel); }

  // internals
  private add(kind: EditMode, id: number){
    if (kind === "object") this.sel.objects.add(id as any);
    else if (kind === "vertex") this.sel.verts.add(id as any);
    else if (kind === "edge") this.sel.edges.add(id as any);
    else if (kind === "face") this.sel.faces.add(id as any);
    this.sel.active = { kind, id };
  }
  private _toggle(kind: EditMode, id: number){
    const set = kind === "object" ? this.sel.objects
      : kind === "vertex" ? this.sel.verts
      : kind === "edge" ? this.sel.edges
      : this.sel.faces;
    if (set.has(id as any)) set.delete(id as any); else set.add(id as any);
    this.sel.active = { kind, id };
  }
  private clear(){ this.sel.objects.clear(); this.sel.verts.clear(); this.sel.edges.clear(); this.sel.faces.clear(); this.sel.active=null; }
  private clearNonDomain(){
    if (this.sel.mode === "object") { this.sel.verts.clear(); this.sel.edges.clear(); this.sel.faces.clear(); }
    if (this.sel.mode === "vertex") { this.sel.objects.clear(); this.sel.edges.clear(); this.sel.faces.clear(); }
    if (this.sel.mode === "edge")   { this.sel.objects.clear(); this.sel.verts.clear(); this.sel.faces.clear(); }
    if (this.sel.mode === "face")   { this.sel.objects.clear(); this.sel.verts.clear(); this.sel.edges.clear(); }
  }

  private pushSelectionChange(before: MeshSelection){
    const after = snapshot(this.sel);
    this.history.run({ mesh: this.mesh }, new SelectionChangeCommand(before, after, this.sel));
  }
}

class SelectionChangeCommand implements Command {
  name = "Selection Change";
  constructor(private before: MeshSelection, private after: MeshSelection, private target: MeshSelection) {}
  do(){ apply(this.target, this.after); }
  undo(){ apply(this.target, this.before); }
}

function snapshot(sel: MeshSelection): MeshSelection {
  return {
    mode: sel.mode,
    objects: new Set(sel.objects),
    verts: new Set(sel.verts),
    edges: new Set(sel.edges),
    faces: new Set(sel.faces),
    active: sel.active ? { ...sel.active } : null,
  };
}
function apply(target: MeshSelection, snap: MeshSelection){
  target.mode = snap.mode;
  target.objects = new Set(snap.objects);
  target.verts = new Set(snap.verts);
  target.edges = new Set(snap.edges);
  target.faces = new Set(snap.faces);
  target.active = snap.active ? { ...snap.active } : null;
}
