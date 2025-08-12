import { Vertex, HalfEdge, Face } from "./HalfEdge";
import { VID, HEID, FID, AttrKey, Bounds3 } from "../types";
import { Vec3Attr } from "../attributes/Vec3Attr";
import { CornerVec2 } from "../attributes/CornerAttr";

export class EditableMesh {
  private V: Vertex[] = [];
  private HE: HalfEdge[] = [];
  private F: Face[] = [];
  private freeV: VID[] = [];
  private freeHE: HEID[] = [];
  private freeF: FID[] = [];

  vertAttr = new Map<AttrKey, any>();
  faceAttr = new Map<AttrKey, any>();
  heAttr   = new Map<AttrKey, any>(); // per-corner/half-edge attributes

  readonly position = new Vec3Attr();
  readonly normal   = new Vec3Attr();
  readonly uv0      = new CornerVec2(); // per-corner UVs preferred

  constructor(){
    this.vertAttr.set("position", this.position);
    this.vertAttr.set("normal",   this.normal);
    this.heAttr.set("uv0",        this.uv0);
  }

  addVertex(p:[number,number,number]): VID {
    const id = this.freeV.pop() ?? this.V.length;
    if (id === this.V.length) this.V.push({ he: -1 });
    this.position.resize(this.V.length);
    this.normal.resize(this.V.length);
    this.position.set(id, p);
    return id;
  }

  addFace(loop: VID[]): FID {
    const f = this.allocFace();
    const n = loop.length;
    const hs: HEID[] = new Array(n);
    for (let i=0;i<n;i++) hs[i] = this.allocHE();
    for (let i=0;i<n;i++){
      const a=hs[i]!, b=hs[(i+1)%n]!;
      const vTo = loop[(i+1)%n]!;
      this.HE[a] = { v:vTo, next:b, twin:-1, face:f };
    }
    this.F[f] = { he: hs[0]! };
    for (let i=0;i<n;i++){
      const vFrom = loop[i]!;
      if (this.V[vFrom]!.he === -1) this.V[vFrom]!.he = hs[i]!;
    }
    this.patchTwins(hs, loop);
    this.uv0.resize(this.HE.length); // keep corner attrs sized
    return f;
  }

  // --- queries ---
  vertices(){ return this.V; }
  halfEdges(){ return this.HE; }
  faces(){ return this.F; }
  vertexCount(){ return this.V.length - this.freeV.length; }
  faceCount(){ return this.F.length - this.freeF.length; }

  bounds(): Bounds3 {
    const n = this.position.size;
    if (!n) return {min:[0,0,0],max:[0,0,0]};
    const min:[number,number,number]=[+Infinity,+Infinity,+Infinity];
    const max:[number,number,number]=[-Infinity,-Infinity,-Infinity];
    for (let i=0;i<n;i++){
      const p=this.position.get(i);
      for (let k=0;k<3;k++){
        if(p[k]!<min[k]!)min[k]=p[k]!;
        if(p[k]!>max[k]!)max[k]=p[k]!;
      }
    }
    return {min,max};
  }

  // --- internals ---
  private allocHE(): HEID { const id = this.freeHE.pop() ?? this.HE.length; if (id===this.HE.length) this.HE.push({v:-1,next:-1,twin:-1,face:-1}); return id; }
  private allocFace(): FID { const id = this.freeF.pop() ?? this.F.length; if (id===this.F.length) this.F.push({he:-1}); return id; }

  private edgeKey(u:VID,v:VID){ return u<v ? (u<<20)|v : (v<<20)|u; } // simple packed key (ok up to ~1M verts)
  private E = new Map<number,HEID>(); // undirected edge map

  private patchTwins(newHE: HEID[], loop: VID[]){
    const n = loop.length;
    for (let i=0;i<n;i++){
      const vFrom = loop[i]!, vTo = loop[(i+1)%n]!;
      const key = this.edgeKey(vFrom, vTo);
      const he = newHE[i]!;
      const existing = this.E.get(key);
      if (existing == null) { this.E.set(key, he); }
      else {
        // pair them
        this.HE[he]!.twin = existing;
        this.HE[existing]!.twin = he;
        this.E.delete(key);
      }
    }
  }
}
