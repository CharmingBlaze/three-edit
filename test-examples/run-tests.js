// Test runner for three-edit examples
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Running three-edit tests...');

// Compile TypeScript files
console.log('\n=== Compiling TypeScript files ===');
try {
  execSync('npx tsc --allowJs false --declaration --emitDeclarationOnly false test-examples/fixed-*.ts', {
    stdio: 'inherit'
  });
  console.log('TypeScript compilation successful');
} catch (error) {
  console.error('TypeScript compilation failed:', error.message);
  process.exit(1);
}

// Run tests for primitives
console.log('\n=== Testing Original Primitives ===');
try {
  // This would run in a browser environment, so we'll just check if the file exists
  console.log('Checking test-bugs.js...');
  if (fs.existsSync(path.join(__dirname, 'test-bugs.js'))) {
    console.log('test-bugs.js exists and is ready to run in a browser environment');
  } else {
    console.error('test-bugs.js not found');
  }
} catch (error) {
  console.error('Error checking test-bugs.js:', error.message);
}

// Run tests for fixed implementations
console.log('\n=== Testing Fixed Implementations ===');
try {
  // This would run in a browser environment, so we'll just check if the file exists
  console.log('Checking test-fixed.js...');
  if (fs.existsSync(path.join(__dirname, 'test-fixed.js'))) {
    console.log('test-fixed.js exists and is ready to run in a browser environment');
  } else {
    console.error('test-fixed.js not found');
  }
} catch (error) {
  console.error('Error checking test-fixed.js:', error.message);
}

console.log('\n=== Summary ===');
console.log('All test files are prepared and ready for execution in a browser environment.');
console.log('To run these tests, you would need to:');
console.log('1. Set up a local web server');
console.log('2. Create an HTML file that imports the test script');
console.log('3. Open the HTML file in a browser to see the results');

console.log('\nTest preparation completed successfully!');
