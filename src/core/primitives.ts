import { EditableMesh } from "./topology/EditableMesh";

export interface PrimitiveResult {
  mesh: EditableMesh;
  meta?: Record<string, any>;
}

export type PrimitiveFactory<Opts> = (opts: Opts) => PrimitiveResult;
