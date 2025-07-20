import { EditableMesh } from '../core/EditableMesh.ts';
import { Vertex } from '../core/Vertex.ts';
import { Face } from '../core/Face.ts';

/**
 * Collada import/export options
 */
export interface ColladaOptions {
  preserveMaterials?: boolean;
  preserveAnimations?: boolean;
  preserveHierarchy?: boolean;
  version?: string;
  upAxis?: 'Y_UP' | 'Z_UP' | 'X_UP';
}

/**
 * Collada geometry structure
 */
export interface ColladaGeometry {
  id: string;
  name: string;
  vertices: number[];
  indices: number[];
  normals?: number[];
  uvs?: number[];
}

/**
 * Collada material structure
 */
export interface ColladaMaterial {
  id: string;
  name: string;
  type: string;
  properties: Map<string, any>;
}

/**
 * Collada animation structure
 */
export interface ColladaAnimation {
  id: string;
  name: string;
  type: string;
  keyframes: ColladaKeyframe[];
}

/**
 * Collada keyframe structure
 */
export interface ColladaKeyframe {
  time: number;
  value: any;
  interpolation?: string;
}

/**
 * Import Collada file to EditableMesh
 */
export function importCollada(
  data: string,
  options: ColladaOptions = {}
): EditableMesh[] {

  const meshes: EditableMesh[] = [];

  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, 'text/xml');
    
    if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
      throw new Error('Invalid XML format');
    }

    // Parse library_geometries
    const geometries = xmlDoc.getElementsByTagName('geometry');
    
    for (let i = 0; i < geometries.length; i++) {
      const geometry = geometries[i];
      const mesh = parseColladaGeometry(geometry, options);
      if (mesh) {
        meshes.push(mesh);
      }
    }

    return meshes;
  } catch (error) {
    console.error('Collada import error:', error);
    throw new Error(`Failed to import Collada: ${error}`);
  }
}

/**
 * Parse Collada geometry element
 */
function parseColladaGeometry(
  geometryElement: Element,
  options: ColladaOptions
): EditableMesh | null {
  const mesh = new EditableMesh();
  
  try {
    // Find mesh element
    const meshElement = geometryElement.getElementsByTagName('mesh')[0];
    if (!meshElement) {
      return null;
    }

    // Parse source elements
    const sources = meshElement.getElementsByTagName('source');
    const verticesSource = meshElement.getElementsByTagName('vertices')[0];
    
    let positions: number[] = [];
    let normals: number[] = [];
    let uvs: number[] = [];
    
    // Parse position source
    for (let i = 0; i < sources.length; i++) {
      const source = sources[i];
      const id = source.getAttribute('id');
      const floatArray = source.getElementsByTagName('float_array')[0];
      
      if (floatArray) {
        const values = floatArray.textContent?.split(' ').map(Number) || [];
        
        if (id?.includes('position')) {
          positions = values;
        } else if (id?.includes('normal')) {
          normals = values;
        } else if (id?.includes('map')) {
          uvs = values;
        }
      }
    }

    // Parse vertices
    for (let i = 0; i < positions.length; i += 3) {
      if (i + 2 < positions.length) {
        const vertex = new Vertex(positions[i], positions[i + 1], positions[i + 2]);
        
        // Add normal if available
        if (normals.length > i + 2) {
          vertex.normal = {
            x: normals[i],
            y: normals[i + 1],
            z: normals[i + 2]
          } as any;
        }
        
        // Add UV if available
        if (uvs.length > (i / 3) * 2 + 1) {
          const uvIndex = Math.floor(i / 3) * 2;
          vertex.uv = {
            u: uvs[uvIndex],
            v: uvs[uvIndex + 1]
          };
        }
        
        mesh.addVertex(vertex);
      }
    }

    // Parse triangles or polylist
    const triangles = meshElement.getElementsByTagName('triangles')[0];
    const polylist = meshElement.getElementsByTagName('polylist')[0];
    
    if (triangles) {
      const pElement = triangles.getElementsByTagName('p')[0];
      if (pElement) {
        const indices = pElement.textContent?.split(' ').map(Number) || [];
        
        for (let i = 0; i < indices.length; i += 3) {
          if (i + 2 < indices.length) {
            const face = new Face([indices[i], indices[i + 1], indices[i + 2]], []);
            mesh.addFace(face);
          }
        }
      }
    } else if (polylist) {
      const pElement = polylist.getElementsByTagName('p')[0];
      const vcountElement = polylist.getElementsByTagName('vcount')[0];
      
      if (pElement && vcountElement) {
        const indices = pElement.textContent?.split(' ').map(Number) || [];
        const vcounts = vcountElement.textContent?.split(' ').map(Number) || [];
        
        let indexOffset = 0;
        for (const vcount of vcounts) {
          if (vcount >= 3) {
            // Create triangular faces from polygon
            for (let i = 1; i < vcount - 1; i++) {
              const face = new Face([
                indices[indexOffset],
                indices[indexOffset + i],
                indices[indexOffset + i + 1]
              ], []);
              mesh.addFace(face);
            }
            indexOffset += vcount;
          }
        }
      }
    }

    return mesh;
  } catch (error) {
    console.warn('Collada geometry parsing failed:', error);
    return null;
  }
}

/**
 * Export EditableMesh to Collada format
 */
export function exportCollada(
  meshes: EditableMesh[],
  options: ColladaOptions = {}
): string {
  const {
    preserveMaterials = true,
    preserveAnimations = false,
    preserveHierarchy = true,
    version = '1.5',
    upAxis = 'Y_UP'
  } = options;

  let output = '<?xml version="1.0" encoding="utf-8"?>\n';
  output += `<COLLADA xmlns="http://www.collada.org/2005/11/COLLADASchema" version="1.5">\n`;
  
  output += '  <asset>\n';
  output += '    <contributor>\n';
  output += '      <author>Three-Edit Library</author>\n';
  output += '      <authoring_tool>Three-Edit</authoring_tool>\n';
  output += '    </contributor>\n';
  output += '    <created>2024-01-01T00:00:00Z</created>\n';
  output += '    <modified>2024-01-01T00:00:00Z</modified>\n';
  output += `    <unit name="meter" meter="1"/>\n`;
  output += `    <up_axis>${upAxis}</up_axis>\n`;
  output += '  </asset>\n\n';

  // Export library_geometries
  output += '  <library_geometries>\n';
  
  meshes.forEach((mesh, index) => {
    const geometryId = `geometry-${index}`;
    const meshId = `mesh-${index}`;
    const positionId = `position-${index}`;
    const normalId = `normal-${index}`;
    const uvId = `uv-${index}`;
    
    output += `    <geometry id="${geometryId}" name="Mesh${index}">\n`;
    output += `      <mesh>\n`;
    
    // Export positions
    const positions: number[] = [];
    mesh.vertices.forEach(vertex => {
      positions.push(vertex.x, vertex.y, vertex.z);
    });
    
    output += `        <source id="${positionId}">\n`;
    output += `          <float_array id="${positionId}-array" count="${positions.length}">`;
    output += positions.join(' ') + '</float_array>\n';
    output += '          <technique_common>\n';
    output += `            <accessor source="#${positionId}-array" count="${mesh.vertices.length}" stride="3">\n`;
    output += '              <param name="X" type="float"/>\n';
    output += '              <param name="Y" type="float"/>\n';
    output += '              <param name="Z" type="float"/>\n';
    output += '            </accessor>\n';
    output += '          </technique_common>\n';
    output += '        </source>\n';

    // Export normals if available
    const normals: number[] = [];
    let hasNormals = false;
    
    mesh.vertices.forEach(vertex => {
      if (vertex.normal) {
        normals.push(vertex.normal.x, vertex.normal.y, vertex.normal.z);
        hasNormals = true;
      } else {
        normals.push(0, 0, 0);
      }
    });

    if (hasNormals) {
      output += `        <source id="${normalId}">\n`;
      output += `          <float_array id="${normalId}-array" count="${normals.length}">`;
      output += normals.join(' ') + '</float_array>\n';
      output += '          <technique_common>\n';
      output += `            <accessor source="#${normalId}-array" count="${mesh.vertices.length}" stride="3">\n`;
      output += '              <param name="X" type="float"/>\n';
      output += '              <param name="Y" type="float"/>\n';
      output += '              <param name="Z" type="float"/>\n';
      output += '            </accessor>\n';
      output += '          </technique_common>\n';
      output += '        </source>\n';
    }

    // Export UVs if available
    const uvs: number[] = [];
    let hasUVs = false;
    
    mesh.vertices.forEach(vertex => {
      if (vertex.uv) {
        uvs.push(vertex.uv.u, vertex.uv.v);
        hasUVs = true;
      } else {
        uvs.push(0, 0);
      }
    });

    if (hasUVs) {
      output += `        <source id="${uvId}">\n`;
      output += `          <float_array id="${uvId}-array" count="${uvs.length}">`;
      output += uvs.join(' ') + '</float_array>\n';
      output += '          <technique_common>\n';
      output += `            <accessor source="#${uvId}-array" count="${mesh.vertices.length}" stride="2">\n`;
      output += '              <param name="S" type="float"/>\n';
      output += '              <param name="T" type="float"/>\n';
      output += '            </accessor>\n';
      output += '          </technique_common>\n';
      output += '        </source>\n';
    }

    // Export vertices
    output += `        <vertices id="${meshId}-vertices">\n`;
    output += `          <input semantic="POSITION" source="#${positionId}"/>\n`;
    if (hasNormals) {
      output += `          <input semantic="NORMAL" source="#${normalId}"/>\n`;
    }
    if (hasUVs) {
      output += `          <input semantic="TEXCOORD" source="#${uvId}"/>\n`;
    }
    output += '        </vertices>\n';

    // Export triangles
    output += `        <triangles count="${mesh.faces.length}">\n`;
    output += `          <input semantic="VERTEX" source="#${meshId}-vertices" offset="0"/>\n`;
    
    const indices: number[] = [];
    mesh.faces.forEach(face => {
      face.vertices.forEach(vertexIndex => {
        indices.push(vertexIndex);
      });
    });
    
    output += `          <p>${indices.join(' ')}</p>\n`;
    output += '        </triangles>\n';
    
    output += '      </mesh>\n';
    output += '    </geometry>\n';
  });
  
  output += '  </library_geometries>\n\n';

  // Export library_visual_scenes
  output += '  <library_visual_scenes>\n';
  output += '    <visual_scene id="Scene" name="Scene">\n';
  
  meshes.forEach((mesh, index) => {
    const nodeId = `node-${index}`;
    const geometryId = `geometry-${index}`;
    
    output += `      <node id="${nodeId}" name="Mesh${index}" type="NODE">\n`;
    output += '        <matrix sid="transform">1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 1</matrix>\n';
    output += `        <instance_geometry url="#${geometryId}"/>\n`;
    output += '      </node>\n';
  });
  
  output += '    </visual_scene>\n';
  output += '  </library_visual_scenes>\n\n';

  // Export scene
  output += '  <scene>\n';
  output += '    <instance_visual_scene url="#Scene"/>\n';
  output += '  </scene>\n';

  output += '</COLLADA>';

  return output;
}

/**
 * Validate Collada data
 */
export function validateCollada(data: string): boolean {
  try {
    return data.includes('<COLLADA') && data.includes('</COLLADA>');
  } catch (error) {
    return false;
  }
}

/**
 * Get Collada file information
 */
export function getColladaInfo(data: string): {
  version: string;
  upAxis: string;
  meshCount: number;
  vertexCount: number;
  faceCount: number;
} {
  const info = {
    version: '1.5',
    upAxis: 'Y_UP',
    meshCount: 0,
    vertexCount: 0,
    faceCount: 0
  };

  try {
    // Parse version
    const versionMatch = data.match(/version="([^"]+)"/);
    if (versionMatch) {
      info.version = versionMatch[1];
    }

    // Parse up axis
    const upAxisMatch = data.match(/<up_axis>([^<]+)<\/up_axis>/);
    if (upAxisMatch) {
      info.upAxis = upAxisMatch[1];
    }

    // Count geometries
    const geometryMatches = data.match(/<geometry/g);
    info.meshCount = geometryMatches ? geometryMatches.length : 0;

    // Count vertices and faces (simplified)
    const positionMatches = data.match(/<float_array[^>]*count="(\d+)"/g);
    if (positionMatches) {
      for (const match of positionMatches) {
        const countMatch = match.match(/count="(\d+)"/);
        if (countMatch) {
          const count = parseInt(countMatch[1]);
          if (count % 3 === 0) {
            info.vertexCount += count / 3;
          }
        }
      }
    }

    const triangleMatches = data.match(/<triangles[^>]*count="(\d+)"/g);
    if (triangleMatches) {
      for (const match of triangleMatches) {
        const countMatch = match.match(/count="(\d+)"/);
        if (countMatch) {
          info.faceCount += parseInt(countMatch[1]);
        }
      }
    }
  } catch (error) {
    console.warn('Collada info parsing failed:', error);
  }

  return info;
} 