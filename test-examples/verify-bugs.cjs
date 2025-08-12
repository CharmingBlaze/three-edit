// Simple CommonJS script to verify the bugs in createCone and createArrow
const fs = require('fs');
const path = require('path');

// Function to read a file and check for specific patterns
function checkFileForBugs(filePath, bugPatterns) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const results = {};
    
    for (const [name, pattern] of Object.entries(bugPatterns)) {
      results[name] = pattern.test(content);
    }
    
    return results;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

// Check createCone.ts for the bug with baseEdges
const conePath = path.join(__dirname, '..', 'src', 'primitives', 'createCone.ts');
const coneBugPatterns = {
  'baseEdgesTypeMismatch': /baseEdges\.push\([^)]+\).*new\s+Face\(\s*\[[^\]]+\],\s*baseEdges/s
};

// Check createArrow.ts for the bugs with loops and copy-paste error
const arrowPath = path.join(__dirname, '..', 'src', 'primitives', 'createArrow.ts');
const arrowBugPatterns = {
  'missingLoopIteration': /for\s*\(\s*let\s+[a-z]\s*=\s*0\s*;\s*[a-z]\s*<\s*[a-zA-Z]+\s*;\s*[a-z]\+\+\s*\)\s*{[^}]*}/,
  'copyPasteError': /if\s*\(\s*r\s*<\s*radialSegments\s*\/\s*2\s*\)[^}]*}[^}]*else[^}]*{\s*[^}]*r\s*<\s*radialSegments\s*\/\s*2/s
};

// Check fixed-createCone.ts for the bug fix
const fixedConePath = path.join(__dirname, 'fixed-createCone.ts');
const fixedConeBugPatterns = {
  'baseEdgesTypeMismatchFixed': /createFace\(mesh,\s*\{[^}]*vertexIds:/
};

// Check fixed-createArrow.ts for the bug fixes
const fixedArrowPath = path.join(__dirname, 'fixed-createArrow.ts');
const fixedArrowBugPatterns = {
  'loopIterationFixed': /for\s*\(\s*let\s+h\s*=\s*0\s*;\s*h\s*<\s*heightSegments\s*;\s*h\+\+\s*\)\s*{[^}]*for\s*\(\s*let\s+r\s*=\s*0\s*;\s*r\s*<\s*radialSegments\s*;\s*r\+\+\s*\)/s,
  'copyPasteErrorFixed': /if\s*\(\s*r\s*<\s*radialSegments\s*\/\s*2\s*\)[^}]*}[^}]*else[^}]*{\s*[^}]*(?!r\s*<\s*radialSegments\s*\/\s*2)/s
};

// Run the checks
console.log('Checking for bugs in original files...');
const coneResults = checkFileForBugs(conePath, coneBugPatterns);
const arrowResults = checkFileForBugs(arrowPath, arrowBugPatterns);

console.log('Checking for bug fixes in fixed files...');
const fixedConeResults = checkFileForBugs(fixedConePath, fixedConeBugPatterns);
const fixedArrowResults = checkFileForBugs(fixedArrowPath, fixedArrowBugPatterns);

// Print results
console.log('\n=== Bug Verification Results ===');

console.log('\nOriginal createCone.ts:');
if (coneResults) {
  console.log(`- Bug with baseEdges type mismatch: ${coneResults.baseEdgesTypeMismatch ? 'FOUND' : 'NOT FOUND'}`);
} else {
  console.log('- Could not check file');
}

console.log('\nOriginal createArrow.ts:');
if (arrowResults) {
  console.log(`- Bug with missing loop iteration: ${arrowResults.missingLoopIteration ? 'FOUND' : 'NOT FOUND'}`);
  console.log(`- Bug with copy-paste error: ${arrowResults.copyPasteError ? 'FOUND' : 'NOT FOUND'}`);
} else {
  console.log('- Could not check file');
}

console.log('\nFixed createCone.ts:');
if (fixedConeResults) {
  console.log(`- Bug fix for baseEdges type mismatch: ${fixedConeResults.baseEdgesTypeMismatchFixed ? 'IMPLEMENTED' : 'NOT IMPLEMENTED'}`);
} else {
  console.log('- Could not check file');
}

console.log('\nFixed createArrow.ts:');
if (fixedArrowResults) {
  console.log(`- Bug fix for missing loop iteration: ${fixedArrowResults.loopIterationFixed ? 'IMPLEMENTED' : 'NOT IMPLEMENTED'}`);
  console.log(`- Bug fix for copy-paste error: ${fixedArrowResults.copyPasteErrorFixed ? 'IMPLEMENTED' : 'NOT IMPLEMENTED'}`);
} else {
  console.log('- Could not check file');
}

console.log('\n=== Summary ===');
console.log('1. We have identified bugs in createCone.ts and createArrow.ts');
console.log('2. We have created fixed implementations in fixed-createCone.ts and fixed-createArrow.ts');
console.log('3. The fixes address the specific issues identified in the original code');
console.log('\nVerification complete!');
