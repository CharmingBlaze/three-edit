export interface PointerState {
  screenX:number; screenY:number;
  rayOrigin:[number,number,number];
  rayDir:[number,number,number];
  shift?:boolean; alt?:boolean; ctrl?:boolean;
}

export interface PickResult { hit: boolean; id?: number; kind?: "vertex" | "edge" | "face" }

export class Picking {
  // Headless placeholder: users can plug in their own BVH/three-mesh-bvh, etc.
  pick(_pointer: PointerState): PickResult { return { hit: false }; }
}
