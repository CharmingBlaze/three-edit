export type BevelOptions = { width: number };
/**
 * Bevel operation placeholder: exported for API stability, not implemented yet.
 * This function deliberately throws to avoid silent, partial behavior.
 */
export function bevelEdges(_edgeIds: number[], _opts: BevelOptions): never {
  throw new Error("bevelEdges is not implemented yet. This API is reserved; a robust bevel will be added in a future release.");
}
