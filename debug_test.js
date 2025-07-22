import * as EditingSystem from './src/editing/index.js';

console.log('Testing operations with empty objects...');

const modules = [
  EditingSystem.GeometryOperations, 
  EditingSystem.VertexOperations, 
  EditingSystem.EdgeOperations, 
  EditingSystem.FaceOperations, 
  EditingSystem.UVOperations
];

const moduleNames = ['GeometryOperations', 'VertexOperations', 'EdgeOperations', 'FaceOperations', 'UVOperations'];

for (let i = 0; i < modules.length; i++) {
  const module = modules[i];
  const moduleName = moduleNames[i];
  
  console.log(`\nTesting ${moduleName}:`);
  
  // Get all function properties
  const operations = Object.getOwnPropertyNames(module).filter(name => 
    typeof module[name] === 'function' && name !== 'validateParameters'
  );
  
  console.log(`Operations: ${operations.join(', ')}`);
  
  for (const operation of operations) {
    try {
      console.log(`  Testing ${operation}...`);
      const result = module[operation]({});
      console.log(`    Result:`, result);
    } catch (error) {
      console.log(`    Error: ${error.message}`);
    }
  }
} 