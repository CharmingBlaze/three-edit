import { Matrix4, Vector3, Quaternion } from '../utils/math';

/**
 * Bone structure for skeletal animation
 */
export class Bone {
  public name: string;
  public parent: Bone | null;
  public children: Bone[];
  public localMatrix: Matrix4;
  public worldMatrix: Matrix4;
  public inverseBindMatrix: Matrix4;
  public position: Vector3;
  public rotation: Quaternion;
  public scale: Vector3;
  public length: number;
  public radius: number;

  constructor(name: string, parent: Bone | null = null) {
    this.name = name;
    this.parent = parent;
    this.children = [];
    this.localMatrix = new Matrix4();
    this.worldMatrix = new Matrix4();
    this.inverseBindMatrix = new Matrix4();
    this.position = new Vector3(0, 0, 0);
    this.rotation = new Quaternion();
    this.scale = new Vector3(1, 1, 1);
    this.length = 1.0;
    this.radius = 0.1;

    if (parent) {
      parent.children.push(this);
    }
  }

  /**
   * Update the bone's transformation matrices
   */
  updateMatrices(): void {
    // Update local matrix
    this.localMatrix.compose(this.position, this.rotation, this.scale);
    
    // Update world matrix
    if (this.parent) {
      this.worldMatrix.multiplyMatrices(this.parent.worldMatrix, this.localMatrix);
    } else {
      this.worldMatrix.copy(this.localMatrix);
    }

    // Update children
    for (const child of this.children) {
      child.updateMatrices();
    }
  }

  /**
   * Set the bone's position
   */
  setPosition(x: number, y: number, z: number): void {
    this.position.set(x, y, z);
    this.updateMatrices();
  }

  /**
   * Set the bone's rotation
   */
  setRotation(x: number, y: number, z: number, w: number): void {
    this.rotation.set(x, y, z, w);
    this.updateMatrices();
  }

  /**
   * Set the bone's scale
   */
  setScale(x: number, y: number, z: number): void {
    this.scale.set(x, y, z);
    this.updateMatrices();
  }

  /**
   * Get the bone's world position
   */
  getWorldPosition(): Vector3 {
    // Extract position from world matrix
    const elements = this.worldMatrix.elements;
    return new Vector3(elements[12], elements[13], elements[14]);
  }

  /**
   * Get the bone's world rotation
   */
  getWorldRotation(): Quaternion {
    return new Quaternion().setFromRotationMatrix(this.worldMatrix);
  }

  /**
   * Calculate the inverse bind matrix for skinning
   */
  calculateInverseBindMatrix(): void {
    this.inverseBindMatrix.copy(this.worldMatrix).invert();
  }

  /**
   * Add a child bone
   */
  addChild(child: Bone): void {
    child.parent = this;
    this.children.push(child);
    child.updateMatrices();
  }

  /**
   * Remove a child bone
   */
  removeChild(child: Bone): void {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      this.children.splice(index, 1);
      child.parent = null;
    }
  }

  /**
   * Find a bone by name in the hierarchy
   */
  findBone(name: string): Bone | null {
    if (this.name === name) {
      return this;
    }
    
    for (const child of this.children) {
      const found = child.findBone(name);
      if (found) {
        return found;
      }
    }
    
    return null;
  }

  /**
   * Get all bones in the hierarchy
   */
  getAllBones(): Bone[] {
    const bones: Bone[] = [this];
    for (const child of this.children) {
      bones.push(...child.getAllBones());
    }
    return bones;
  }

  /**
   * Clone the bone hierarchy
   */
  clone(): Bone {
    const cloned = new Bone(this.name);
    cloned.position.copy(this.position);
    cloned.rotation.copy(this.rotation);
    cloned.scale.copy(this.scale);
    cloned.length = this.length;
    cloned.radius = this.radius;
    cloned.localMatrix.copy(this.localMatrix);
    cloned.worldMatrix.copy(this.worldMatrix);
    cloned.inverseBindMatrix.copy(this.inverseBindMatrix);
    
    for (const child of this.children) {
      cloned.addChild(child.clone());
    }
    
    return cloned;
  }

  /**
   * Get the bone's world direction (normalized)
   */
  getWorldDirection(): Vector3 {
    const direction = new Vector3(0, 1, 0); // Default up direction
    direction.applyQuaternion(this.getWorldRotation());
    return direction.normalize();
  }

  /**
   * Get the bone's world up vector
   */
  getWorldUp(): Vector3 {
    const up = new Vector3(0, 1, 0);
    up.applyQuaternion(this.getWorldRotation());
    return up;
  }

  /**
   * Get the bone's world right vector
   */
  getWorldRight(): Vector3 {
    const right = new Vector3(1, 0, 0);
    right.applyQuaternion(this.getWorldRotation());
    return right;
  }

  /**
   * Get the bone's world forward vector
   */
  getWorldForward(): Vector3 {
    const forward = new Vector3(0, 0, -1);
    forward.applyQuaternion(this.getWorldRotation());
    return forward;
  }

  /**
   * Get the bone's length in world space
   */
  getWorldLength(): number {
    return this.length * this.scale.y;
  }

  /**
   * Get the bone's radius in world space
   */
  getWorldRadius(): number {
    return this.radius * Math.max(this.scale.x, this.scale.z);
  }

  /**
   * Get the bone's end position in world space
   */
  getWorldEndPosition(): Vector3 {
    const endPosition = new Vector3(0, this.length, 0);
    endPosition.applyMatrix4(this.worldMatrix);
    return endPosition;
  }

  /**
   * Get the bone's center position in world space
   */
  getWorldCenterPosition(): Vector3 {
    const centerPosition = new Vector3(0, this.length * 0.5, 0);
    centerPosition.applyMatrix4(this.worldMatrix);
    return centerPosition;
  }

  /**
   * Check if this bone is a descendant of another bone
   */
  isDescendantOf(ancestor: Bone): boolean {
    if (!this.parent) return false;
    if (this.parent === ancestor) return true;
    return this.parent.isDescendantOf(ancestor);
  }

  /**
   * Get the depth of this bone in the hierarchy
   */
  getDepth(): number {
    if (!this.parent) return 0;
    return this.parent.getDepth() + 1;
  }

  /**
   * Get the path from root to this bone
   */
  getPath(): Bone[] {
    const path: Bone[] = [this];
    let current = this.parent;
    while (current) {
      path.unshift(current);
      current = current.parent;
    }
    return path;
  }

  /**
   * Get the root bone of this hierarchy
   */
  getRoot(): Bone {
    if (!this.parent) return this;
    return this.parent.getRoot();
  }

  /**
   * Get all ancestor bones (excluding self)
   */
  getAncestors(): Bone[] {
    const ancestors: Bone[] = [];
    let current = this.parent;
    while (current) {
      ancestors.push(current);
      current = current.parent;
    }
    return ancestors;
  }

  /**
   * Get all descendant bones (excluding self)
   */
  getDescendants(): Bone[] {
    const descendants: Bone[] = [];
    for (const child of this.children) {
      descendants.push(child);
      descendants.push(...child.getDescendants());
    }
    return descendants;
  }

  /**
   * Get siblings of this bone
   */
  getSiblings(): Bone[] {
    if (!this.parent) return [];
    return this.parent.children.filter(child => child !== this);
  }

  /**
   * Check if this bone has children
   */
  hasChildren(): boolean {
    return this.children.length > 0;
  }

  /**
   * Check if this bone is a leaf (no children)
   */
  isLeaf(): boolean {
    return this.children.length === 0;
  }

  /**
   * Get the number of children
   */
  getChildCount(): number {
    return this.children.length;
  }

  /**
   * Get the total number of bones in this hierarchy
   */
  getHierarchySize(): number {
    return 1 + this.children.reduce((total, child) => total + child.getHierarchySize(), 0);
  }
} 