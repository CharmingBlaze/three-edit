import { EditableMesh } from "../core/topology/EditableMesh";

export type NodeId = number;
export interface SceneNode {
  id: NodeId;
  name: string;
  mesh?: EditableMesh;
  children: NodeId[];
  parent: NodeId | null;
}

export class SceneGraph {
  private nodes = new Map<NodeId, SceneNode>();
  private root: NodeId;
  private nextId = 1;
  constructor() {
    this.root = this.createNode({ name: "Root", parent: null });
  }
  createNode({ name, parent, mesh }: { name: string; parent: NodeId | null; mesh?: EditableMesh }) {
    const id = this.nextId++;
    this.nodes.set(id, { id, name, mesh, children: [], parent });
    if (parent) this.nodes.get(parent)!.children.push(id);
    return id;
  }
  getNode(id: NodeId) { return this.nodes.get(id) ?? null; }
  getRoot() { return this.root; }
}
