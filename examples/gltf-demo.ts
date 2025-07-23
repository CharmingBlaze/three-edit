/**
 * GLTF Import/Export Demo
 * Demonstrates the new modular GLTF system
 */

import { createCube } from '../src/primitives/createCube';
import { SceneGraph, SceneNode } from '../src/scene';
import { GLTFManager } from '../src/exporters/gltf';

async function demonstrateGLTF() {
  console.log('🚀 GLTF Import/Export Demo');
  
  try {
    // Create a simple scene with a cube
    const sceneGraph = new SceneGraph();
    const cube = createCube();
    
    const node = new SceneNode({
      name: 'DemoCube',
      mesh: cube
    });
    
    sceneGraph.addNode(node);
    
    console.log('✅ Created scene graph with cube');
    console.log(`   - Scene has ${sceneGraph.getAllNodes().length} nodes`);
    console.log(`   - Cube has ${cube.getVertexCount()} vertices, ${cube.getFaceCount()} faces`);
    
    // Export to GLTF
    console.log('\n📤 Exporting to GLTF...');
    const gltfBlob = await GLTFManager.export(sceneGraph, {
      binary: false,
      includeNormals: true,
      includeUVs: true,
      includeMaterials: true
    });
    
    console.log(`✅ Exported GLTF (${gltfBlob.size} bytes)`);
    
    // Export to GLB (binary)
    console.log('\n📤 Exporting to GLB...');
    const glbBlob = await GLTFManager.export(sceneGraph, {
      binary: true,
      includeNormals: true,
      includeUVs: true,
      includeMaterials: true
    });
    
    console.log(`✅ Exported GLB (${glbBlob.size} bytes)`);
    
    // Export just the mesh
    console.log('\n📤 Exporting mesh only...');
    const meshBlob = await GLTFManager.exportMesh(cube, {
      binary: false,
      includeNormals: true,
      includeUVs: true
    });
    
    console.log(`✅ Exported mesh (${meshBlob.size} bytes)`);
    
    // Create GLTF JSON structure
    console.log('\n📋 Creating GLTF JSON...');
    const gltfJSON = GLTFManager.createDefault();
    console.log('✅ Created default GLTF structure');
    console.log(`   - Version: ${gltfJSON.asset.version}`);
    console.log(`   - Generator: ${gltfJSON.asset.generator}`);
    
    // Validate GLTF structure
    console.log('\n🔍 Validating GLTF...');
    const errors = GLTFManager.validate(gltfJSON);
    if (errors.length === 0) {
      console.log('✅ GLTF structure is valid');
    } else {
      console.log('❌ GLTF validation errors:', errors);
    }
    
    // Save files (browser environment)
    if (typeof window !== 'undefined') {
      console.log('\n💾 Saving files...');
      await GLTFManager.save(sceneGraph, 'demo-scene.gltf');
      await GLTFManager.save(sceneGraph, 'demo-scene.glb', { binary: true });
      await GLTFManager.saveMesh(cube, 'demo-cube.gltf');
      
      console.log('✅ Files saved successfully');
    } else {
      console.log('\n💾 File saving skipped (not in browser environment)');
    }
    
    console.log('\n🎉 GLTF demo completed successfully!');
    
  } catch (error) {
    console.error('❌ GLTF demo failed:', error);
  }
}

// Import demo (would be used with actual GLTF files)
async function demonstrateImport() {
  console.log('\n📥 GLTF Import Demo');
  
  try {
    // This would be used with actual GLTF files
    // const sceneGraph = await GLTFManager.import('model.gltf');
    // const mesh = await GLTFManager.importMesh('model.glb');
    
    console.log('✅ Import demo structure ready');
    console.log('   (Actual import requires GLTF files)');
    
  } catch (error) {
    console.error('❌ Import demo failed:', error);
  }
}

// Run the demo
if (typeof window !== 'undefined') {
  // Browser environment
  window.addEventListener('load', () => {
    demonstrateGLTF().then(() => {
      demonstrateImport();
    });
  });
} else {
  // Node.js environment
  demonstrateGLTF().then(() => {
    demonstrateImport();
  });
}

export { demonstrateGLTF, demonstrateImport }; 