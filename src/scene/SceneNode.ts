import { Matrix4, Vector3, Quaternion, Euler } from 'three';
import { EditableMesh } from '../core/EditableMesh';

export interface SceneNodeParams {
  name?: string;
  mesh?: EditableMesh;
  userData?: Record<string, any>;
  visible?: boolean;
  tags?: string[];
}

/**
 * A single node in the scene graph with transform, children, and optional mesh
 */
export class SceneNode {
  readonly id: string;
  name: string;
  parent: SceneNode | null;
  children: SceneNode[];
  transform: Matrix4;
  mesh?: EditableMesh;
  userData: Record<string, any>;
  visible: boolean;
  tags: string[];
  private _worldMatrix: Matrix4;
  private _worldMatrixDirty: boolean;

  constructor(params: SceneNodeParams = {}) {
    this.id = crypto.randomUUID();
    this.name = params.name ?? `Node_${this.id.slice(0, 8)}`;
    this.parent = null;
    this.children = [];
    this.transform = new Matrix4();
    this.mesh = params.mesh;
    this.userData = params.userData ?? {};
    this.visible = params.visible ?? true;
    this.tags = params.tags ?? [];
    this._worldMatrix = new Matrix4();
    this._worldMatrixDirty = true;
  }

  /**
   * Add a child node to this node
   */
  addChild(child: SceneNode): void {
    if (child === this) {
      throw new Error('Cannot add node as its own child');
    }
    
    if (child.parent === this) {
      return; // Already a child
    }

    // Remove from previous parent
    if (child.parent) {
      child.parent.removeChild(child.id);
    }

    // Add to this node
    child.parent = this;
    this.children.push(child);
    child._markWorldMatrixDirty();
  }

  /**
   * Remove a child node by ID
   */
  removeChild(childId: string): boolean {
    const index = this.children.findIndex(child => child.id === childId);
    if (index === -1) {
      return false;
    }

    const child = this.children[index];
    child.parent = null;
    this.children.splice(index, 1);
    child._markWorldMatrixDirty();
    return true;
  }

  /**
   * Get the world transform matrix (computed from parent chain)
   */
  getWorldMatrix(): Matrix4 {
    if (this._worldMatrixDirty) {
      this._updateWorldMatrix();
    }
    return this._worldMatrix.clone();
  }

  /**
   * Set the local transform matrix
   */
  setTransform(matrix: Matrix4): void {
    this.transform.copy(matrix);
    this._markWorldMatrixDirty();
  }

  /**
   * Set position in local space
   */
  setPosition(position: Vector3): void {
    const currentPosition = new Vector3();
    this.transform.decompose(currentPosition, new Quaternion(), new Vector3());
    this.transform.setPosition(position);
    this._markWorldMatrixDirty();
  }

  /**
   * Set rotation in local space
   */
  setRotation(rotation: Euler): void {
    const currentPosition = new Vector3();
    const currentScale = new Vector3();
    this.transform.decompose(currentPosition, new Quaternion(), currentScale);
    this.transform.compose(currentPosition, new Quaternion().setFromEuler(rotation), currentScale);
    this._markWorldMatrixDirty();
  }

  /**
   * Set scale in local space
   */
  setScale(scale: Vector3): void {
    const currentPosition = new Vector3();
    const currentRotation = new Quaternion();
    this.transform.decompose(currentPosition, currentRotation, new Vector3());
    this.transform.compose(currentPosition, currentRotation, scale);
    this._markWorldMatrixDirty();
  }

  /**
   * Get position in local space
   */
  getPosition(): Vector3 {
    const position = new Vector3();
    this.transform.decompose(position, new Quaternion(), new Vector3());
    return position;
  }

  /**
   * Get rotation in local space
   */
  getRotation(): Euler {
    const rotation = new Quaternion();
    this.transform.decompose(new Vector3(), rotation, new Vector3());
    return new Euler().setFromQuaternion(rotation);
  }

  /**
   * Get scale in local space
   */
  getScale(): Vector3 {
    const scale = new Vector3();
    this.transform.decompose(new Vector3(), new Quaternion(), scale);
    return scale;
  }

  /**
   * Get position in world space
   */
  getWorldPosition(): Vector3 {
    const worldMatrix = this.getWorldMatrix();
    const position = new Vector3();
    worldMatrix.decompose(position, new Quaternion(), new Vector3());
    return position;
  }

  /**
   * Check if this node is a descendant of the given node
   */
  isDescendantOf(node: SceneNode): boolean {
    let current: SceneNode | null = this.parent;
    while (current) {
      if (current === node) {
        return true;
      }
      current = current.parent;
    }
    return false;
  }

  /**
   * Get the depth of this node in the hierarchy
   */
  getDepth(): number {
    let depth = 0;
    let current: SceneNode | null = this.parent;
    while (current) {
      depth++;
      current = current.parent;
    }
    return depth;
  }

  /**
   * Find a child node by name (recursive)
   */
  findChildByName(name: string): SceneNode | null {
    for (const child of this.children) {
      if (child.name === name) {
        return child;
      }
      const found = child.findChildByName(name);
      if (found) {
        return found;
      }
    }
    return null;
  }

  /**
   * Find a child node by tag (recursive)
   */
  findChildrenByTag(tag: string): SceneNode[] {
    const results: SceneNode[] = [];
    for (const child of this.children) {
      if (child.tags.includes(tag)) {
        results.push(child);
      }
      results.push(...child.findChildrenByTag(tag));
    }
    return results;
  }

  /**
   * Clone this node (without children)
   */
  clone(): SceneNode {
    const cloned = new SceneNode({
      name: this.name,
      mesh: this.mesh, // Note: mesh reference is shared
      userData: { ...this.userData },
      visible: this.visible,
      tags: [...this.tags]
    });
    cloned.transform.copy(this.transform);
    return cloned;
  }

  /**
   * Mark world matrix as dirty and propagate to children
   */
  private _markWorldMatrixDirty(): void {
    if (this._worldMatrixDirty) return; // Already dirty, avoid infinite recursion
    this._worldMatrixDirty = true;
    for (const child of this.children) {
      child._markWorldMatrixDirty();
    }
  }

  /**
   * Update the world matrix by combining with parent transforms
   */
  private _updateWorldMatrix(): void {
    if (this.parent) {
      this._worldMatrix.multiplyMatrices(this.parent.getWorldMatrix(), this.transform);
    } else {
      this._worldMatrix.copy(this.transform);
    }
    this._worldMatrixDirty = false;
  }
} 