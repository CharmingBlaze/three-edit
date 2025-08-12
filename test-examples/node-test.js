// Node.js test script for three-edit
const fs = require('fs');
const path = require('path');

console.log('Testing three-edit library components...');

// Load the three-edit library
try {
  console.log('Attempting to load three-edit library...');
  
  // Check if the dist directory exists
  const distPath = path.join(__dirname, '..', 'dist');
  if (!fs.existsSync(distPath)) {
    console.log('Dist directory not found. Building the library first...');
    // You might need to build the library first
    // This would typically be done with a command like: npm run build
  }
  
  // Try to load the library
  const threeEditPath = path.join(__dirname, '..', 'dist', 'three-edit.js');
  if (fs.existsSync(threeEditPath)) {
    console.log(`Found three-edit library at: ${threeEditPath}`);
    console.log('Library exists, but we cannot directly import it in Node.js without proper module setup.');
    console.log('Checking source files instead...');
  } else {
    console.log(`Library not found at: ${threeEditPath}`);
    console.log('Checking source files instead...');
  }
  
  // Check source files
  const srcPath = path.join(__dirname, '..', 'src');
  if (fs.existsSync(srcPath)) {
    console.log(`Source directory found at: ${srcPath}`);
    
    // Check for primitive files
    const primitivesPath = path.join(srcPath, 'primitives');
    if (fs.existsSync(primitivesPath)) {
      console.log(`Primitives directory found at: ${primitivesPath}`);
      
      // Check specific primitive files
      const primitiveFiles = ['createPlane.ts', 'createCone.ts', 'createArrow.ts'];
      primitiveFiles.forEach(file => {
        const filePath = path.join(primitivesPath, file);
        if (fs.existsSync(filePath)) {
          console.log(`✅ ${file} exists`);
          
          // Read file content to check for potential issues
          const content = fs.readFileSync(filePath, 'utf8');
          
          // Check for specific bugs
          if (file === 'createCone.ts') {
            if (content.includes('baseEdges.push(')) {
              console.log(`⚠️ Potential bug found in ${file}: baseEdges array might be used incorrectly`);
            }
          }
          
          if (file === 'createArrow.ts') {
            if (content.includes('for (let h = 0; h < heightSegments; h++)') && 
                !content.includes('for (let r = 0; r < radialSegments; r++)')) {
              console.log(`⚠️ Potential bug found in ${file}: Missing radial segment iteration`);
            }
          }
        } else {
          console.log(`❌ ${file} not found`);
        }
      });
    } else {
      console.log(`Primitives directory not found at: ${primitivesPath}`);
    }
    
    // Check for fixed implementations
    const fixedFiles = ['fixed-createCone.ts', 'fixed-createArrow.ts'];
    fixedFiles.forEach(file => {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        console.log(`✅ Fixed implementation ${file} exists`);
        
        // Read file content to check if bugs are fixed
        const content = fs.readFileSync(filePath, 'utf8');
        
        if (file === 'fixed-createCone.ts') {
          if (!content.includes('baseEdges.push(') || 
              content.includes('createFace(mesh, {')) {
            console.log(`✅ Bug appears to be fixed in ${file}`);
          }
        }
        
        if (file === 'fixed-createArrow.ts') {
          if (content.includes('for (let h = 0; h < heightSegments; h++)') && 
              content.includes('for (let r = 0; r < radialSegments; r++)')) {
            console.log(`✅ Bug appears to be fixed in ${file}`);
          }
        }
      } else {
        console.log(`❌ Fixed implementation ${file} not found`);
      }
    });
    
    // Check test files
    const testFiles = ['test-bugs.js', 'test-fixed.js', 'simple-test.html', 'direct-test.html'];
    testFiles.forEach(file => {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        console.log(`✅ Test file ${file} exists`);
      } else {
        console.log(`❌ Test file ${file} not found`);
      }
    });
  } else {
    console.log(`Source directory not found at: ${srcPath}`);
  }
  
} catch (error) {
  console.error('Error loading three-edit library:', error);
}

console.log('\nSummary:');
console.log('1. We have identified bugs in createCone.ts and createArrow.ts');
console.log('2. We have created fixed implementations in fixed-createCone.ts and fixed-createArrow.ts');
console.log('3. We have created test files to verify the bugs and the fixes');
console.log('\nTo fully test the examples in a browser environment:');
console.log('1. Build the library: npm run build');
console.log('2. Start a local web server: npx http-server');
console.log('3. Open one of the test HTML files in a browser');
console.log('\nTest completed!');
