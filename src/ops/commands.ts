import { EditableMesh } from "../core/topology/EditableMesh";
import { Command, CommandCtx } from "./Command";
import { translateObject, scaleObject, rotateObject } from "./object";
import { VID } from "../core/types";

export class TranslateVertsCommand implements Command {
  name = "Translate Vertices";
  private before: Map<number, [number,number,number]> = new Map();
  constructor(private verts: number[], private delta: [number,number,number]) {}
  do(ctx: CommandCtx): void {
    const m = ctx.mesh; const [dx,dy,dz] = this.delta;
    if (this.before.size === 0) {
      for (const v of this.verts) {
        const p = m.position.get(v as VID) ?? [0,0,0];
        this.before.set(v, [p[0], p[1], p[2]]);
      }
    }
    for (const v of this.verts) {
      const p = m.position.get(v as VID) ?? [0,0,0];
      m.position.set(v as VID, [p[0]+dx, p[1]+dy, p[2]+dz]);
    }
  }
  undo(ctx: CommandCtx): void {
    const m = ctx.mesh;
    for (const [v, p] of this.before) m.position.set(v as VID, [p[0], p[1], p[2]]);
  }
}

export class ScaleVertsCommand implements Command {
  name = "Scale Vertices";
  private before: Map<number, [number,number,number]> = new Map();
  constructor(private verts: number[], private center: [number,number,number], private scale: [number,number,number]) {}
  do(ctx: CommandCtx): void {
    const m = ctx.mesh; const [cx,cy,cz] = this.center; const [sx,sy,sz] = this.scale;
    if (this.before.size === 0) {
      for (const v of this.verts) {
        const p = m.position.get(v as VID) ?? [0,0,0];
        this.before.set(v, [p[0], p[1], p[2]]);
      }
    }
    for (const v of this.verts) {
      const p = m.position.get(v as VID) ?? [0,0,0];
      const dx = p[0]-cx, dy = p[1]-cy, dz = p[2]-cz;
      m.position.set(v as VID, [cx + dx*sx, cy + dy*sy, cz + dz*sz]);
    }
  }
  undo(ctx: CommandCtx): void { const m = ctx.mesh; for (const [v,p] of this.before) m.position.set(v as VID, [p[0],p[1],p[2]]); }
}

export class RotateVertsCommand implements Command {
  name = "Rotate Vertices";
  private before: Map<number, [number,number,number]> = new Map();
  constructor(private verts: number[], private center: [number,number,number], private axis: [number,number,number], private angle: number) {}
  do(ctx: CommandCtx): void {
    const m = ctx.mesh; const [cx,cy,cz] = this.center; const [ax,ay,az] = this.axis; const ang = this.angle;
    const len = Math.hypot(ax,ay,az) || 1; const x = ax/len, y = ay/len, z = az/len;
    const c = Math.cos(ang), s = Math.sin(ang), t = 1 - c;
    // Build row-major 3x3 rotation matrix
    const r00 = t*x*x + c,   r01 = t*x*y - s*z, r02 = t*x*z + s*y;
    const r10 = t*x*y + s*z, r11 = t*y*y + c,   r12 = t*y*z - s*x;
    const r20 = t*x*z - s*y, r21 = t*y*z + s*x, r22 = t*z*z + c;
    if (this.before.size === 0) {
      for (const v of this.verts) { const p = m.position.get(v as VID) ?? [0,0,0]; this.before.set(v, [p[0],p[1],p[2]]); }
    }
    for (const v of this.verts) {
      const p = m.position.get(v as VID) ?? [0,0,0];
      const dx = p[0]-cx, dy = p[1]-cy, dz = p[2]-cz;
      const nx = r00*dx + r01*dy + r02*dz;
      const ny = r10*dx + r11*dy + r12*dz;
      const nz = r20*dx + r21*dy + r22*dz;
      m.position.set(v as VID, [cx + nx, cy + ny, cz + nz]);
    }
  }
  undo(ctx: CommandCtx): void { const m = ctx.mesh; for (const [v,p] of this.before) m.position.set(v as VID, [p[0],p[1],p[2]]); }
}

export type TransformSpec = {
  translate?: [number,number,number];
  scale?: [number,number,number] | number;
  rotate?: { axis: [number,number,number]; angle: number };
};

export class TransformObjectCommand implements Command {
  name = "Transform Object";
  private before: Array<[number,number,number]> = [];
  constructor(private oids: number[], private spec: TransformSpec) {}
  do(ctx: CommandCtx): void {
    // Snapshot all vertex positions once
    if (this.before.length === 0) {
      const V = ctx.mesh.vertices();
      for (let v = 0; v < V.length; v++) {
        if (!V[v]) { this.before.push([0,0,0]); continue; }
        const p = ctx.mesh.position.get(v as VID) ?? [0,0,0];
        this.before.push([p[0], p[1], p[2]]);
      }
    }
    // For now, no scene graph, so apply to whole mesh when any object id present
    if (this.spec.translate) translateObject(ctx.mesh, this.spec.translate);
    if (this.spec.scale !== undefined) scaleObject(ctx.mesh, this.spec.scale);
    if (this.spec.rotate) rotateObject(ctx.mesh, this.spec.rotate.axis, this.spec.rotate.angle);
  }
  undo(ctx: CommandCtx): void {
    const V = ctx.mesh.vertices();
    for (let v = 0; v < V.length && v < this.before.length; v++) {
      if (!V[v]) continue; const p = this.before[v]!;
      ctx.mesh.position.set(v as VID, [p[0], p[1], p[2]]);
    }
  }
}
