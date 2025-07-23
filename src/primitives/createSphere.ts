import { EditableMesh } from '../core/EditableMesh';
import { CreateSphereOptions } from './types';
import { createVertex, createFace, createPrimitiveContext, normalizeOptions } from './helpers';
import { validatePrimitive } from './validation';

/**
 * Creates a sphere as an EditableMesh.
 * @param options - Options for creating the sphere.
 * @returns A new EditableMesh instance representing a sphere.
 */
export function createSphere(options: CreateSphereOptions = {}): EditableMesh {
  // Normalize options with defaults
  const normalizedOptions = normalizeOptions(options, {
    radius: 1,
    widthSegments: 32,
    heightSegments: 16,
    phiStart: 0,
    phiLength: Math.PI * 2,
    thetaStart: 0,
    thetaLength: Math.PI,
    name: 'Sphere',
    materialId: 0,
    centered: true,
    uvLayout: 'spherical',
    smoothNormals: true,
    validate: true
  }) as Required<CreateSphereOptions>;

  // Validate parameters
  if (normalizedOptions.radius <= 0) {
    throw new Error('Sphere radius must be positive');
  }
  if (normalizedOptions.widthSegments < 3) {
    throw new Error('Sphere widthSegments must be at least 3');
  }
  if (normalizedOptions.heightSegments < 2) {
    throw new Error('Sphere heightSegments must be at least 2');
  }

  // Create mesh and context
  const mesh = new EditableMesh({ name: normalizedOptions.name });
  const context = createPrimitiveContext(mesh, normalizedOptions);

  // Calculate offsets for centered positioning
  const offsetX = normalizedOptions.centered ? 0 : normalizedOptions.radius;
  const offsetY = normalizedOptions.centered ? 0 : normalizedOptions.radius;
  const offsetZ = normalizedOptions.centered ? 0 : normalizedOptions.radius;

  const grid: number[][] = [];

  // Create vertices with UVs
  for (let iy = 0; iy <= normalizedOptions.heightSegments; iy++) {
    const verticesRow: number[] = [];
    const v = iy / normalizedOptions.heightSegments;

    for (let ix = 0; ix <= normalizedOptions.widthSegments; ix++) {
      const u = ix / normalizedOptions.widthSegments;
      const x = offsetX - normalizedOptions.radius * Math.cos(normalizedOptions.phiStart + u * normalizedOptions.phiLength) * Math.sin(normalizedOptions.thetaStart + v * normalizedOptions.thetaLength);
      const y = offsetY + normalizedOptions.radius * Math.cos(normalizedOptions.thetaStart + v * normalizedOptions.thetaLength);
      const z = offsetZ + normalizedOptions.radius * Math.sin(normalizedOptions.phiStart + u * normalizedOptions.phiLength) * Math.sin(normalizedOptions.thetaStart + v * normalizedOptions.thetaLength);
      
      const uv = { u, v };
      
      const result = createVertex(mesh, {
        x,
        y,
        z,
        uv
      }, context);
      verticesRow.push(result.id);
    }
    grid.push(verticesRow);
  }

  // Create faces
  for (let iy = 0; iy < normalizedOptions.heightSegments; iy++) {
    for (let ix = 0; ix < normalizedOptions.widthSegments; ix++) {
      const v1 = grid[iy][ix + 1];
      const v2 = grid[iy][ix];
      const v3 = grid[iy + 1][ix];
      const v4 = grid[iy + 1][ix + 1];

      let faceVertexIds: number[];

      if (iy === 0 && normalizedOptions.thetaStart === 0) {
        // Bottom pole - create triangular face
        faceVertexIds = [v1, v3, v4];
      } else if (iy === normalizedOptions.heightSegments - 1 && normalizedOptions.thetaStart + normalizedOptions.thetaLength === Math.PI) {
        // Top pole - create triangular face
        faceVertexIds = [v1, v2, v3];
      } else {
        // Regular quad face
        faceVertexIds = [v1, v2, v3, v4];
      }

      createFace(mesh, {
        vertexIds: faceVertexIds,
        materialId: normalizedOptions.materialId
      }, context);
    }
  }

  // Validate if requested
  if (normalizedOptions.validate) {
    const validation = validatePrimitive(mesh, 'Sphere');
    if (!validation.isValid) {
      console.warn('Sphere validation warnings:', validation.warnings);
    }
  }

  return mesh;
}

