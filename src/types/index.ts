/**
 * Unified Type Definitions for Three-Edit
 * 
 * This module consolidates all TypeScript type definitions from scattered files
 * into a single, well-organized system. It provides:
 * 
 * - Geometry-related types
 * - Operation-related types
 * - Validation-related types
 * - Primitive-related types
 * 
 * All types are well-documented and follow consistent patterns.
 */

// Export geometry types
export * from './geometry';

// Export operation types
export * from './operations';

// Export core types
export * from './core';

// Re-export commonly used Three.js types for convenience
export type { Vector3, Matrix4, Quaternion } from 'three';

/**
 * Common result types used throughout the library
 */

/**
 * Generic success/failure result
 */
export interface Result<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  warnings?: string[];
}

/**
 * Async result for operations that may be asynchronous
 */
export interface AsyncResult<T = any> extends Promise<Result<T>> {}

/**
 * Progress callback for long-running operations
 */
export interface ProgressCallback {
  (progress: number, message?: string): void;
}

/**
 * Cancellation token for cancellable operations
 */
export interface CancellationToken {
  isCancelled: boolean;
  cancel(): void;
  onCancelled(callback: () => void): void;
}

/**
 * Event emitter interface for reactive operations
 */
export interface EventEmitter<T = any> {
  on(event: string, callback: (data: T) => void): void;
  off(event: string, callback: (data: T) => void): void;
  emit(event: string, data: T): void;
}

/**
 * Disposable interface for cleanup
 */
export interface Disposable {
  dispose(): void;
}

/**
 * Configurable interface for objects with options
 */
export interface Configurable<T = any> {
  configure(options: Partial<T>): void;
  getConfiguration(): T;
}

/**
 * Validatable interface for objects that can be validated
 */
export interface Validatable {
  validate(): Result<boolean>;
  getValidationErrors(): string[];
  getValidationWarnings(): string[];
}

/**
 * Serializable interface for objects that can be serialized
 */
export interface Serializable {
  serialize(): any;
  deserialize(data: any): void;
}

/**
 * Cloneable interface for objects that can be cloned
 */
export interface Cloneable<T = any> {
  clone(): T;
}

/**
 * Equatable interface for objects that can be compared
 */
export interface Equatable<T = any> {
  equals(other: T): boolean;
}

/**
 * Hashable interface for objects that can be hashed
 */
export interface Hashable {
  hashCode(): number;
}

/**
 * Sortable interface for objects that can be sorted
 */
export interface Sortable<T = any> {
  compareTo(other: T): number;
}

/**
 * Iterable interface for objects that can be iterated
 */
export interface Iterable<T = any> {
  [Symbol.iterator](): Iterator<T>;
}

/**
 * Collection interface for objects that contain other objects
 */
export interface Collection<T = any> extends Iterable<T> {
  size: number;
  add(item: T): boolean;
  remove(item: T): boolean;
  contains(item: T): boolean;
  clear(): void;
  toArray(): T[];
}

/**
 * Map interface for key-value collections
 */
export interface Map<K = any, V = any> extends Iterable<[K, V]> {
  size: number;
  set(key: K, value: V): void;
  get(key: K): V | undefined;
  has(key: K): boolean;
  delete(key: K): boolean;
  clear(): void;
  keys(): Iterable<K>;
  values(): Iterable<V>;
  entries(): Iterable<[K, V]>;
}

/**
 * Set interface for unique value collections
 */
export interface Set<T = any> extends Collection<T> {
  add(item: T): boolean;
  delete(item: T): boolean;
  has(item: T): boolean;
}

/**
 * Queue interface for FIFO collections
 */
export interface Queue<T = any> extends Collection<T> {
  enqueue(item: T): void;
  dequeue(): T | undefined;
  peek(): T | undefined;
}

/**
 * Stack interface for LIFO collections
 */
export interface Stack<T = any> extends Collection<T> {
  push(item: T): void;
  pop(): T | undefined;
  peek(): T | undefined;
}

/**
 * Priority queue interface for ordered collections
 */
export interface PriorityQueue<T = any> extends Collection<T> {
  enqueue(item: T, priority: number): void;
  dequeue(): T | undefined;
  peek(): T | undefined;
  changePriority(item: T, priority: number): boolean;
}

/**
 * Tree interface for hierarchical data structures
 */
export interface TreeNode<T = any> {
  value: T;
  children: TreeNode<T>[];
  parent?: TreeNode<T>;
  addChild(child: TreeNode<T>): void;
  removeChild(child: TreeNode<T>): boolean;
  findChild(predicate: (node: TreeNode<T>) => boolean): TreeNode<T> | undefined;
  traverse(callback: (node: TreeNode<T>) => void): void;
}

/**
 * Graph interface for network data structures
 */
export interface GraphNode<T = any> {
  value: T;
  edges: GraphEdge<T>[];
  addEdge(edge: GraphEdge<T>): void;
  removeEdge(edge: GraphEdge<T>): boolean;
  getNeighbors(): GraphNode<T>[];
}

export interface GraphEdge<T = any> {
  from: GraphNode<T>;
  to: GraphNode<T>;
  weight?: number;
  data?: any;
}

export interface Graph<T = any> {
  nodes: GraphNode<T>[];
  edges: GraphEdge<T>[];
  addNode(node: GraphNode<T>): void;
  removeNode(node: GraphNode<T>): boolean;
  addEdge(edge: GraphEdge<T>): void;
  removeEdge(edge: GraphEdge<T>): boolean;
  findNode(predicate: (node: GraphNode<T>) => boolean): GraphNode<T> | undefined;
  traverse(startNode: GraphNode<T>, callback: (node: GraphNode<T>) => void): void;
} 