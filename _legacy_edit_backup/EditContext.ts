import { EditableMesh } from "../core/topology/EditableMesh";
import { MeshSelection } from "../core/topology/MeshSelection";
import { History } from "../ops";
import { Constraints, Snapping, Preview } from ".";
import { EventBus } from "../runtime";

export interface EditContext {
  mesh: EditableMesh;
  selection: MeshSelection;
  history: History;
  constraints: Constraints;
  snapping: Snapping;
  preview: Preview;
  events: EventBus;
}
