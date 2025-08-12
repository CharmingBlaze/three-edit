import { EditableMesh } from '../core/EditableMesh';
import { CreateSphereOptions } from './types';
import { createVertex, createFace, createPrimitiveContext, normalizeOptions, createFacesFromGrid } from './helpers';
import { validatePrimitive } from './validation';
import { Vector3 } from 'three';

/**
 * Creates a sphere as an EditableMesh using a simple icosahedron approach.
 * @param options - Options for creating the sphere.
 * @returns A new EditableMesh instance representing a sphere.
 */
export function createSphere(options: CreateSphereOptions = {}): EditableMesh {
  // Normalize options with defaults
  const normalizedOptions = normalizeOptions(options, {
    radius: 1,
    widthSegments: 8,
    heightSegments: 6,
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
      // Standard spherical coordinates: phi is azimuthal angle, theta is polar angle
      const phi = normalizedOptions.phiStart + u * normalizedOptions.phiLength;
      const theta = normalizedOptions.thetaStart + v * normalizedOptions.thetaLength;
      
      const x = offsetX + normalizedOptions.radius * Math.sin(theta) * Math.cos(phi);
      const y = offsetY + normalizedOptions.radius * Math.cos(theta);
      const z = offsetZ + normalizedOptions.radius * Math.sin(theta) * Math.sin(phi);
      
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

  // Create quad faces using the helper function
  createFacesFromGrid(mesh, grid, normalizedOptions.materialId, context);

  // Calculate face normals
  mesh.faces.forEach(face => {
    if (face.normal) {
      // Recalculate normal to ensure it's correct
      const v1 = mesh.getVertex(face.vertices[0]!);
      const v2 = mesh.getVertex(face.vertices[1]!);
      const v3 = mesh.getVertex(face.vertices[2]!);
      
      if (v1 && v2 && v3) {
        const edge1 = new Vector3(v2.x - v1.x, v2.y - v1.y, v2.z - v1.z);
        const edge2 = new Vector3(v3.x - v1.x, v3.y - v1.y, v3.z - v1.z);
        face.normal = new Vector3().crossVectors(edge1, edge2).normalize();
      }
    }
  });

  // Validate if requested
  if (normalizedOptions.validate) {
    const validation = validatePrimitive(mesh, 'Sphere');
    if (!validation.isValid) {
      console.warn('Sphere validation warnings:', validation.warnings);
    }
  }

  return mesh;
}

