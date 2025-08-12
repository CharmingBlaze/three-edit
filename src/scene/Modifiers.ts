// Simple non-destructive modifier stack placeholder
import { EditableMesh } from "../core/topology/EditableMesh";

export interface Modifier {
  name: string;
  apply(src: EditableMesh): EditableMesh;
}

export class ModifierStack {
  private list: Modifier[] = [];
  add(m: Modifier) { this.list.push(m); }
  clear() { this.list.length = 0; }
  evaluate(base: EditableMesh): EditableMesh {
    // For now just return base unchanged; users can implement copies per modifier
    return base;
  }
}
