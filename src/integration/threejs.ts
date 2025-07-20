import { EditableMesh } from '../core/EditableMesh.ts';
import { Vertex } from '../core/Vertex.ts';
import { Face } from '../core/Face.ts';

// Three.js types (we'll define these to avoid external dependencies in tests)
interface Vector3 {
  x: number;
  y: number;
  z: number;
  [key: string]: any; // Allow additional properties
}

interface Material {
  name?: string;
  type?: string;
  [key: string]: any;
}

interface Mesh {
  geometry: any;
  material: Material | Material[];
  position?: Vector3;
  rotation?: Vector3;
  scale?: Vector3;
  userData?: any;
}

interface Object3D {
  children: Object3D[];
  position?: Vector3;
  rotation?: Vector3;
  scale?: Vector3;
  userData?: any;
  add(child: Object3D): void;
  remove(child: Object3D): void;
}

interface Scene extends Object3D {
  children: Object3D[];
}

interface Group extends Object3D {
  children: Object3D[];
}

/**
 * Three.js integration options
 */
export interface ThreeJSIntegrationOptions {
  preserveMaterials?: boolean;
  preserveTransform?: boolean;
  preserveUserData?: boolean;
  generateNormals?: boolean;
  generateUVs?: boolean;
}

/**
 * Material conversion options
 */
export interface MaterialConversionOptions {
  defaultMaterial?: Material;
  materialMapping?: Map<number, Material>;
  preserveMaterialIndices?: boolean;
}

/**
 * Animation conversion options
 */
export interface AnimationConversionOptions {
  preserveKeyframes?: boolean;
  frameRate?: number;
  loop?: boolean;
  duration?: number;
}

/**
 * Scene graph options
 */
export interface SceneGraphOptions {
  createGroups?: boolean;
  preserveHierarchy?: boolean;
  flattenMeshes?: boolean;
}

/**
 * Convert EditableMesh to Three.js Mesh
 */
export function convertToThreeMesh(
  editableMesh: EditableMesh,
  options: ThreeJSIntegrationOptions = {}
): Mesh {
  const {
    preserveMaterials = true,
    preserveUserData = true,
    generateNormals = true,
    generateUVs = true
  } = options;

  // Create geometry data
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  // Convert vertices
  editableMesh.vertices.forEach(vertex => {
    positions.push(vertex.x, vertex.y, vertex.z);
    
    if (generateNormals && vertex.normal) {
      normals.push(vertex.normal.x, vertex.normal.y, vertex.normal.z);
    }
    
    if (generateUVs && vertex.uv) {
      uvs.push(vertex.uv.u, vertex.uv.v);
    }
  });

  // Convert faces to indices
  editableMesh.faces.forEach(face => {
    // Triangulate face if needed
    if (face.vertices.length === 3) {
      indices.push(...face.vertices);
    } else if (face.vertices.length > 3) {
      // Simple triangulation (fan)
      for (let i = 1; i < face.vertices.length - 1; i++) {
        indices.push(face.vertices[0], face.vertices[i], face.vertices[i + 1]);
      }
    }
  });

  // Create geometry object
  const geometry = {
    attributes: {
      position: { array: new Float32Array(positions), itemSize: 3 },
      ...(normals.length > 0 && { normal: { array: new Float32Array(normals), itemSize: 3 } }),
      ...(uvs.length > 0 && { uv: { array: new Float32Array(uvs), itemSize: 2 } })
    },
    index: indices.length > 0 ? new Uint32Array(indices) : undefined
  };

  // Create material
  let material: Material | Material[] = { type: 'MeshStandardMaterial' };
  
  if (preserveMaterials) {
    const materialIndices = new Set(editableMesh.faces.map(f => f.materialIndex));
    if (materialIndices.size === 1) {
      material = { type: 'MeshStandardMaterial', materialIndex: Array.from(materialIndices)[0] };
    } else if (materialIndices.size > 1) {
      material = Array.from(materialIndices).map(index => ({
        type: 'MeshStandardMaterial',
        materialIndex: index
      }));
    }
  }

  // Create mesh
  const mesh: Mesh = {
    geometry,
    material
  };

  // Note: Transform preservation could be added in the future

  // Preserve user data if requested
  if (preserveUserData) {
    mesh.userData = {
      vertexCount: editableMesh.vertices.length,
      faceCount: editableMesh.faces.length,
      edgeCount: editableMesh.edges.length,
      sourceType: 'EditableMesh'
    };
  }

  return mesh;
}

/**
 * Convert Three.js Mesh to EditableMesh
 */
export function convertFromThreeMesh(
  threeMesh: Mesh,
  options: ThreeJSIntegrationOptions = {}
): EditableMesh {
  const {
    preserveMaterials = true,
    preserveUserData = true,
    generateNormals = true,
    generateUVs = true
  } = options;

  const editableMesh = new EditableMesh();

  // Extract geometry data
  const geometry = threeMesh.geometry;
  const positions = geometry.attributes.position?.array || [];
  const normals = geometry.attributes.normal?.array || [];
  const uvs = geometry.attributes.uv?.array || [];
  const indices = geometry.index?.array || [];

  // Convert vertices
  for (let i = 0; i < positions.length; i += 3) {
    const vertex = new Vertex(positions[i], positions[i + 1], positions[i + 2]);
    
         if (generateNormals && normals.length > i + 2) {
       vertex.normal = {
         x: normals[i],
         y: normals[i + 1],
         z: normals[i + 2]
       } as any;
     }
    
    if (generateUVs && uvs.length > (i / 3) * 2 + 1) {
      const uvIndex = Math.floor(i / 3) * 2;
      vertex.uv = {
        u: uvs[uvIndex],
        v: uvs[uvIndex + 1]
      };
    }
    
    editableMesh.addVertex(vertex);
  }

  // Convert faces
  if (indices.length > 0) {
    for (let i = 0; i < indices.length; i += 3) {
      const face = new Face([indices[i], indices[i + 1], indices[i + 2]], []);
      
      if (preserveMaterials && Array.isArray(threeMesh.material)) {
        // Handle multiple materials
        face.materialIndex = 0; // Default to first material
      } else if (preserveMaterials && typeof threeMesh.material === 'object') {
        face.materialIndex = (threeMesh.material as any).materialIndex || 0;
      }
      
      editableMesh.addFace(face);
    }
  } else {
    // No indices, create faces from vertices
    for (let i = 0; i < positions.length / 3; i += 3) {
      const face = new Face([i, i + 1, i + 2], []);
      editableMesh.addFace(face);
    }
  }

  // Preserve user data if requested
  if (preserveUserData && threeMesh.userData) {
    // Note: EditableMesh doesn't have userData, but we could add it
  }

  return editableMesh;
}

/**
 * Convert materials between Three.js and EditableMesh
 */
export function convertMaterials(
  materials: Material[],
  options: MaterialConversionOptions = {}
): Map<number, Material> {
  const {
    defaultMaterial = { type: 'MeshStandardMaterial' },
    materialMapping = new Map(),
    preserveMaterialIndices = true
  } = options;

  const materialMap = new Map<number, Material>();

  materials.forEach((material, index) => {
    if (preserveMaterialIndices) {
      materialMap.set(index, material);
    } else {
      materialMap.set(index, { ...defaultMaterial, ...material });
    }
  });

  // Merge with existing mapping
  materialMapping.forEach((material, index) => {
    materialMap.set(index, material);
  });

  return materialMap;
}

/**
 * Create Three.js animation from EditableMesh animation
 */
export function createThreeAnimation(
  animationFrames: EditableMesh[],
  options: AnimationConversionOptions = {}
): any {
  const {
    loop = false,
    duration = 1.0
  } = options;

  const tracks: any[] = [];

  // Create position tracks for each vertex
  const vertexCount = animationFrames[0]?.vertices.length || 0;
  
  for (let vertexIndex = 0; vertexIndex < vertexCount; vertexIndex++) {
    const times: number[] = [];
    const values: number[] = [];

    animationFrames.forEach((frame, frameIndex) => {
      const time = (frameIndex / (animationFrames.length - 1)) * duration;
      const vertex = frame.vertices[vertexIndex];
      
      if (vertex) {
        times.push(time);
        values.push(vertex.x, vertex.y, vertex.z);
      }
    });

    if (times.length > 0) {
      tracks.push({
        name: `vertex_${vertexIndex}.position`,
        times: times,
        values: values,
        type: 'vector3'
      });
    }
  }

  return {
    duration,
    tracks,
    loop
  };
}

/**
 * Integrate EditableMesh into Three.js scene graph
 */
export function integrateIntoScene(
  editableMesh: EditableMesh,
  scene: Scene,
  options: SceneGraphOptions = {}
): Object3D {
  const {
    createGroups = true,
    flattenMeshes = false
  } = options;

  // Convert to Three.js mesh
  const threeMesh = convertToThreeMesh(editableMesh);

  if (flattenMeshes) {
    // Add directly to scene
    scene.add(threeMesh as any);
    return threeMesh as any;
  }

  if (createGroups) {
    // Create a group to contain the mesh
    const group: Group = {
      children: [],
      add(child: Object3D) {
        this.children.push(child);
      },
      remove(child: Object3D) {
        const index = this.children.indexOf(child);
        if (index !== -1) {
          this.children.splice(index, 1);
        }
      }
    };

    group.add(threeMesh as any);
    scene.add(group as any);
    return group;
  }

  // Add mesh directly to scene
  scene.add(threeMesh as any);
  return threeMesh as any;
}

/**
 * Extract EditableMesh from Three.js scene graph
 */
export function extractFromScene(
  scene: Scene,
  options: ThreeJSIntegrationOptions = {}
): EditableMesh[] {
  const meshes: EditableMesh[] = [];

  function traverseObject(obj: Object3D): void {
    // Check if this is a mesh
    if ('geometry' in obj && 'material' in obj) {
      const mesh = obj as any as Mesh;
      const editableMesh = convertFromThreeMesh(mesh, options);
      meshes.push(editableMesh);
    }

    // Traverse children
    obj.children.forEach(child => traverseObject(child));
  }

  traverseObject(scene);
  return meshes;
}

/**
 * Create scene graph from multiple EditableMeshes
 */
export function createSceneGraph(
  meshes: EditableMesh[],
  options: SceneGraphOptions = {}
): Scene {
  const {
    createGroups = true
  } = options;

  const scene: Scene = {
    children: [],
    add(child: Object3D) {
      this.children.push(child);
    },
    remove(child: Object3D) {
      const index = this.children.indexOf(child);
      if (index !== -1) {
        this.children.splice(index, 1);
      }
    }
  };

  if (createGroups && meshes.length > 1) {
    // Create a group for all meshes
    const group: Group = {
      children: [],
      add(child: Object3D) {
        this.children.push(child);
      },
      remove(child: Object3D) {
        const index = this.children.indexOf(child);
        if (index !== -1) {
          this.children.splice(index, 1);
        }
      }
    };

    meshes.forEach(mesh => {
      const threeMesh = convertToThreeMesh(mesh);
      group.add(threeMesh as any);
    });

    scene.add(group as any);
  } else {
    // Add meshes directly to scene
    meshes.forEach(mesh => {
      const threeMesh = convertToThreeMesh(mesh);
      scene.add(threeMesh as any);
    });
  }

  return scene;
}

/**
 * Validate Three.js integration
 */
export function validateThreeJSIntegration(
  editableMesh: EditableMesh,
  threeMesh: Mesh
): boolean {
  // Check vertex count
  const editableVertexCount = editableMesh.vertices.length;
  const threeVertexCount = threeMesh.geometry.attributes.position?.array?.length / 3 || 0;
  
  if (editableVertexCount !== threeVertexCount) {
    return false;
  }

  // Check face count (approximate)
  const editableFaceCount = editableMesh.faces.length;
  const threeIndexCount = threeMesh.geometry.index?.array?.length || 0;
  const threeFaceCount = threeIndexCount / 3;
  
  if (editableFaceCount !== threeFaceCount) {
    return false;
  }

  return true;
} 