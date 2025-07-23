import { EditableMesh } from '../core/EditableMesh';
import { CreateCubeOptions, PrimitiveResult } from './types';
import { createVertex, createFace, createPrimitiveContext, normalizeOptions } from './helpers';
import { validatePrimitive } from './validation';
import { Vector3 } from 'three';

/**
 * Creates a cube as an EditableMesh.
 * @param options - Options for creating the cube.
 * @returns A new EditableMesh instance representing a cube.
 */
export function createCube(options: CreateCubeOptions = {}): EditableMesh {
  // Normalize options with defaults
  const normalizedOptions = normalizeOptions(options, {
    width: 1,
    height: 1,
    depth: 1,
    widthSegments: 1,
    heightSegments: 1,
    depthSegments: 1,
    name: 'Cube',
    materialId: 0,
    centered: true,
    uvLayout: 'box',
    smoothNormals: false,
    validate: true
  }) as Required<CreateCubeOptions>;

  // Validate parameters
  if (normalizedOptions.width <= 0 || normalizedOptions.height <= 0 || normalizedOptions.depth <= 0) {
    throw new Error('Cube dimensions must be positive');
  }
  if (normalizedOptions.widthSegments < 1 || normalizedOptions.heightSegments < 1 || normalizedOptions.depthSegments < 1) {
    throw new Error('Cube segments must be at least 1');
  }

  // Create mesh and context
  const mesh = new EditableMesh({ name: normalizedOptions.name });
  const context = createPrimitiveContext(mesh, normalizedOptions);

  // Calculate offsets for centered positioning
  const offsetX = normalizedOptions.centered ? -normalizedOptions.width / 2 : 0;
  const offsetY = normalizedOptions.centered ? -normalizedOptions.height / 2 : 0;
  const offsetZ = normalizedOptions.centered ? -normalizedOptions.depth / 2 : 0;

  // Create vertices for each face
  const vertices: number[][][] = [];
  
  // Front face (Z = depth/2)
  const frontVertices: number[][] = [];
  for (let y = 0; y <= normalizedOptions.heightSegments; y++) {
    const row: number[] = [];
    for (let x = 0; x <= normalizedOptions.widthSegments; x++) {
      const vertexX = offsetX + (x / normalizedOptions.widthSegments) * normalizedOptions.width;
      const vertexY = offsetY + (y / normalizedOptions.heightSegments) * normalizedOptions.height;
      const vertexZ = offsetZ + normalizedOptions.depth;
      
      const uv = {
        u: x / normalizedOptions.widthSegments,
        v: y / normalizedOptions.heightSegments
      };
      
             const result = createVertex(mesh, {
         x: vertexX,
         y: vertexY,
         z: vertexZ,
         uv,
         normal: new Vector3(0, 0, 1)
       }, context);
      row.push(result.id);
    }
    frontVertices.push(row);
  }
  vertices.push(frontVertices);

  // Back face (Z = -depth/2)
  const backVertices: number[][] = [];
  for (let y = 0; y <= normalizedOptions.heightSegments; y++) {
    const row: number[] = [];
    for (let x = 0; x <= normalizedOptions.widthSegments; x++) {
      const vertexX = offsetX + (x / normalizedOptions.widthSegments) * normalizedOptions.width;
      const vertexY = offsetY + (y / normalizedOptions.heightSegments) * normalizedOptions.height;
      const vertexZ = offsetZ;
      
      const uv = {
        u: 1 - (x / normalizedOptions.widthSegments),
        v: y / normalizedOptions.heightSegments
      };
      
             const result = createVertex(mesh, {
         x: vertexX,
         y: vertexY,
         z: vertexZ,
         uv,
         normal: new Vector3(0, 0, -1)
       }, context);
      row.push(result.id);
    }
    backVertices.push(row);
  }
  vertices.push(backVertices);

  // Left face (X = -width/2)
  const leftVertices: number[][] = [];
  for (let y = 0; y <= normalizedOptions.heightSegments; y++) {
    const row: number[] = [];
    for (let z = 0; z <= normalizedOptions.depthSegments; z++) {
      const vertexX = offsetX;
      const vertexY = offsetY + (y / normalizedOptions.heightSegments) * normalizedOptions.height;
      const vertexZ = offsetZ + (z / normalizedOptions.depthSegments) * normalizedOptions.depth;
      
      const uv = {
        u: z / normalizedOptions.depthSegments,
        v: y / normalizedOptions.heightSegments
      };
      
             const result = createVertex(mesh, {
         x: vertexX,
         y: vertexY,
         z: vertexZ,
         uv,
         normal: new Vector3(-1, 0, 0)
       }, context);
      row.push(result.id);
    }
    leftVertices.push(row);
  }
  vertices.push(leftVertices);

  // Right face (X = width/2)
  const rightVertices: number[][] = [];
  for (let y = 0; y <= normalizedOptions.heightSegments; y++) {
    const row: number[] = [];
    for (let z = 0; z <= normalizedOptions.depthSegments; z++) {
      const vertexX = offsetX + normalizedOptions.width;
      const vertexY = offsetY + (y / normalizedOptions.heightSegments) * normalizedOptions.height;
      const vertexZ = offsetZ + (z / normalizedOptions.depthSegments) * normalizedOptions.depth;
      
      const uv = {
        u: 1 - (z / normalizedOptions.depthSegments),
        v: y / normalizedOptions.heightSegments
      };
      
             const result = createVertex(mesh, {
         x: vertexX,
         y: vertexY,
         z: vertexZ,
         uv,
         normal: new Vector3(1, 0, 0)
       }, context);
      row.push(result.id);
    }
    rightVertices.push(row);
  }
  vertices.push(rightVertices);

  // Top face (Y = height/2)
  const topVertices: number[][] = [];
  for (let z = 0; z <= normalizedOptions.depthSegments; z++) {
    const row: number[] = [];
    for (let x = 0; x <= normalizedOptions.widthSegments; x++) {
      const vertexX = offsetX + (x / normalizedOptions.widthSegments) * normalizedOptions.width;
      const vertexY = offsetY + normalizedOptions.height;
      const vertexZ = offsetZ + (z / normalizedOptions.depthSegments) * normalizedOptions.depth;
      
      const uv = {
        u: x / normalizedOptions.widthSegments,
        v: z / normalizedOptions.depthSegments
      };
      
             const result = createVertex(mesh, {
         x: vertexX,
         y: vertexY,
         z: vertexZ,
         uv,
         normal: new Vector3(0, 1, 0)
       }, context);
      row.push(result.id);
    }
    topVertices.push(row);
  }
  vertices.push(topVertices);

  // Bottom face (Y = -height/2)
  const bottomVertices: number[][] = [];
  for (let z = 0; z <= normalizedOptions.depthSegments; z++) {
    const row: number[] = [];
    for (let x = 0; x <= normalizedOptions.widthSegments; x++) {
      const vertexX = offsetX + (x / normalizedOptions.widthSegments) * normalizedOptions.width;
      const vertexY = offsetY;
      const vertexZ = offsetZ + (z / normalizedOptions.depthSegments) * normalizedOptions.depth;
      
      const uv = {
        u: x / normalizedOptions.widthSegments,
        v: 1 - (z / normalizedOptions.depthSegments)
      };
      
             const result = createVertex(mesh, {
         x: vertexX,
         y: vertexY,
         z: vertexZ,
         uv,
         normal: new Vector3(0, -1, 0)
       }, context);
      row.push(result.id);
    }
    bottomVertices.push(row);
  }
  vertices.push(bottomVertices);

  // Create faces for each side
  const faceMaterialId = normalizedOptions.materialId;

  // Front face
  for (let y = 0; y < normalizedOptions.heightSegments; y++) {
    for (let x = 0; x < normalizedOptions.widthSegments; x++) {
      const v1 = frontVertices[y][x];
      const v2 = frontVertices[y][x + 1];
      const v3 = frontVertices[y + 1][x + 1];
      const v4 = frontVertices[y + 1][x];

      // Create two triangular faces
      createFace(mesh, {
        vertexIds: [v1, v2, v3],
        materialId: faceMaterialId
      }, context);

      createFace(mesh, {
        vertexIds: [v1, v3, v4],
        materialId: faceMaterialId
      }, context);
    }
  }

  // Back face
  for (let y = 0; y < normalizedOptions.heightSegments; y++) {
    for (let x = 0; x < normalizedOptions.widthSegments; x++) {
      const v1 = backVertices[y][x];
      const v2 = backVertices[y][x + 1];
      const v3 = backVertices[y + 1][x + 1];
      const v4 = backVertices[y + 1][x];

      // Create two triangular faces
      createFace(mesh, {
        vertexIds: [v1, v3, v2],
        materialId: faceMaterialId
      }, context);

      createFace(mesh, {
        vertexIds: [v1, v4, v3],
        materialId: faceMaterialId
      }, context);
    }
  }

  // Left face
  for (let y = 0; y < normalizedOptions.heightSegments; y++) {
    for (let z = 0; z < normalizedOptions.depthSegments; z++) {
      const v1 = leftVertices[y][z];
      const v2 = leftVertices[y][z + 1];
      const v3 = leftVertices[y + 1][z + 1];
      const v4 = leftVertices[y + 1][z];

      // Create two triangular faces
      createFace(mesh, {
        vertexIds: [v1, v3, v2],
        materialId: faceMaterialId
      }, context);

      createFace(mesh, {
        vertexIds: [v1, v4, v3],
        materialId: faceMaterialId
      }, context);
    }
  }

  // Right face
  for (let y = 0; y < normalizedOptions.heightSegments; y++) {
    for (let z = 0; z < normalizedOptions.depthSegments; z++) {
      const v1 = rightVertices[y][z];
      const v2 = rightVertices[y][z + 1];
      const v3 = rightVertices[y + 1][z + 1];
      const v4 = rightVertices[y + 1][z];

      // Create two triangular faces
      createFace(mesh, {
        vertexIds: [v1, v2, v3],
        materialId: faceMaterialId
      }, context);

      createFace(mesh, {
        vertexIds: [v1, v3, v4],
        materialId: faceMaterialId
      }, context);
    }
  }

  // Top face
  for (let z = 0; z < normalizedOptions.depthSegments; z++) {
    for (let x = 0; x < normalizedOptions.widthSegments; x++) {
      const v1 = topVertices[z][x];
      const v2 = topVertices[z][x + 1];
      const v3 = topVertices[z + 1][x + 1];
      const v4 = topVertices[z + 1][x];

      // Create two triangular faces
      createFace(mesh, {
        vertexIds: [v1, v2, v3],
        materialId: faceMaterialId
      }, context);

      createFace(mesh, {
        vertexIds: [v1, v3, v4],
        materialId: faceMaterialId
      }, context);
    }
  }

  // Bottom face
  for (let z = 0; z < normalizedOptions.depthSegments; z++) {
    for (let x = 0; x < normalizedOptions.widthSegments; x++) {
      const v1 = bottomVertices[z][x];
      const v2 = bottomVertices[z][x + 1];
      const v3 = bottomVertices[z + 1][x + 1];
      const v4 = bottomVertices[z + 1][x];

      // Create two triangular faces
      createFace(mesh, {
        vertexIds: [v1, v3, v2],
        materialId: faceMaterialId
      }, context);

      createFace(mesh, {
        vertexIds: [v1, v4, v3],
        materialId: faceMaterialId
      }, context);
    }
  }

  // Validate if requested
  if (normalizedOptions.validate) {
    const validation = validatePrimitive(mesh, 'Cube');
    if (!validation.isValid) {
      console.warn('Cube validation warnings:', validation.warnings);
    }
  }

  return mesh;
}

