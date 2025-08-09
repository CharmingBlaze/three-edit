import { EditContext } from "./EditContext";
export type OperatorPhase = "idle"|"running"|"finished"|"canceled";
export interface PointerState {
  screenX:number; screenY:number;
  rayOrigin:[number,number,number];
  rayDir:[number,number,number];
  shift?:boolean; alt?:boolean; ctrl?:boolean;
}
export interface Operator {
  readonly id: string;
  phase: OperatorPhase;
  begin(ctx:EditContext, start:PointerState): void;
  update(ctx:EditContext, cur:PointerState): void;
  commit(ctx:EditContext): void;
  cancel(ctx:EditContext): void;
}
