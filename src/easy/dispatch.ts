import { EditableMesh } from "../core/topology/EditableMesh";
import { SelectionManager } from "../runtime/SelectionManager";
import { History } from "../ops/History";
import { TransformObjectCommand, TranslateVertsCommand, ScaleVertsCommand, RotateVertsCommand } from "../ops/commands";
import * as Q from "../core/topology/MeshQueries";

export interface EasyMesh { mesh: EditableMesh; history: History; sel: SelectionManager["sel"]; }

function collectVertsForSelection(mesh: EditableMesh, sel: EasyMesh["sel"]): number[] {
  if (sel.verts.size) return [...sel.verts];
  if (sel.edges.size) return [...Q.edgesToVerts(mesh, sel.edges)];
  if (sel.faces.size) return [...Q.edgesToVerts(mesh, Q.facesToBoundaryEdges(mesh, sel.faces))];
  return [];
}

export function translate(ez: EasyMesh, dx:number,dy:number,dz:number){
  const { mesh, history, sel } = ez; const delta:[number,number,number] = [dx,dy,dz];
  if (sel.mode === "object") {
    history.run({mesh}, new TransformObjectCommand([...sel.objects], { translate: delta }));
    return ez;
  }
  const verts = collectVertsForSelection(mesh, sel);
  history.run({mesh}, new TranslateVertsCommand(verts, delta));
  return ez;
}

export function scale(ez: EasyMesh, sx:number, sy:number, sz:number){
  const { mesh, history, sel } = ez; const s:[number,number,number] = [sx,sy,sz];
  if (sel.mode === "object") {
    history.run({mesh}, new TransformObjectCommand([...sel.objects], { scale: s }));
    return ez;
  }
  const verts = collectVertsForSelection(mesh, sel);
  // compute center
  let cx=0,cy=0,cz=0; for (const v of verts){ const p = mesh.position.get(v) ?? [0,0,0]; cx+=p[0]; cy+=p[1]; cz+=p[2]; }
  const inv = verts.length || 1; const center:[number,number,number] = [cx/inv, cy/inv, cz/inv];
  history.run({mesh}, new ScaleVertsCommand(verts, center, s));
  return ez;
}

export function rotate(ez: EasyMesh, axis:[number,number,number], angle:number){
  const { mesh, history, sel } = ez;
  if (sel.mode === "object") {
    history.run({mesh}, new TransformObjectCommand([...sel.objects], { rotate: { axis, angle } }));
    return ez;
  }
  const verts = collectVertsForSelection(mesh, sel);
  let cx=0,cy=0,cz=0; for (const v of verts){ const p = mesh.position.get(v) ?? [0,0,0]; cx+=p[0]; cy+=p[1]; cz+=p[2]; }
  const inv = verts.length || 1; const center:[number,number,number] = [cx/inv, cy/inv, cz/inv];
  history.run({mesh}, new RotateVertsCommand(verts, center, axis, angle));
  return ez;
}
