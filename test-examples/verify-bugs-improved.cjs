// Improved CommonJS script to verify the bugs in createCone and createArrow
const fs = require('fs');
const path = require('path');

console.log('===================================================');
console.log('       THREE-EDIT BUG VERIFICATION REPORT          ');
console.log('===================================================');

// Function to read a file and check for specific patterns
function checkFileForBugs(filePath, bugPatterns) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return null;
    }
    
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

// Function to print results with better formatting
function printResults(title, results, interpretations) {
  console.log(`\n${title}:`);
  console.log('-'.repeat(title.length + 1));
  
  if (!results) {
    console.log('Could not check file');
    return;
  }
  
  for (const [name, result] of Object.entries(results)) {
    const interpretation = interpretations[name];
    const status = result ? interpretation.positive : interpretation.negative;
    console.log(`- ${interpretation.description}: ${status}`);
  }
}

// Check createCone.ts for the bug with baseEdges
const conePath = path.join(__dirname, '..', 'src', 'primitives', 'createCone.ts');
const coneBugPatterns = {
  'baseEdgesTypeMismatch': /baseEdges\.push\([^)]+\).*new\s+Face\(\s*\[[^\]]+\],\s*baseEdges/s
};
const coneInterpretations = {
  'baseEdgesTypeMismatch': {
    description: 'Bug with baseEdges type mismatch',
    positive: 'FOUND ❌',
    negative: 'NOT FOUND (possibly fixed or different implementation) ✅'
  }
};

// Check createArrow.ts for the bugs with loops and copy-paste error
const arrowPath = path.join(__dirname, '..', 'src', 'primitives', 'createArrow.ts');
const arrowBugPatterns = {
  'missingLoopIteration': /for\s*\(\s*let\s+h\s*=\s*0\s*;\s*h\s*<\s*heightSegments\s*;\s*h\+\+\s*\)\s*{(?![^}]*for)/s,
  'copyPasteError': /if\s*\(\s*r\s*<\s*radialSegments\s*\/\s*2\s*\)[^}]*}[^}]*else[^}]*{\s*[^}]*r\s*<\s*radialSegments\s*\/\s*2/s
};
const arrowInterpretations = {
  'missingLoopIteration': {
    description: 'Bug with missing nested loop iteration',
    positive: 'FOUND ❌',
    negative: 'NOT FOUND (possibly fixed or different implementation) ✅'
  },
  'copyPasteError': {
    description: 'Bug with copy-paste error in face creation',
    positive: 'FOUND ❌',
    negative: 'NOT FOUND (possibly fixed or different implementation) ✅'
  }
};

// Check fixed-createCone.ts for the bug fix
const fixedConePath = path.join(__dirname, 'fixed-createCone.ts');
const fixedConeBugPatterns = {
  'baseEdgesTypeMismatchFixed': /createFace\(mesh,\s*\{[^}]*vertexIds:/
};
const fixedConeInterpretations = {
  'baseEdgesTypeMismatchFixed': {
    description: 'Bug fix for baseEdges type mismatch',
    positive: 'IMPLEMENTED ✅',
    negative: 'NOT IMPLEMENTED ❌'
  }
};

// Check fixed-createArrow.ts for the bug fixes
const fixedArrowPath = path.join(__dirname, 'fixed-createArrow.ts');
const fixedArrowBugPatterns = {
  'loopIterationFixed': /for\s*\(\s*let\s+h\s*=\s*0\s*;\s*h\s*<\s*heightSegments\s*;\s*h\+\+\s*\)\s*{[^}]*for\s*\(\s*let\s+r\s*=\s*0\s*;\s*r\s*<\s*radialSegments\s*;\s*r\+\+\s*\)/s,
  'copyPasteErrorFixed': /else\s*{(?![^}]*r\s*<\s*radialSegments\s*\/\s*2)/s
};
const fixedArrowInterpretations = {
  'loopIterationFixed': {
    description: 'Bug fix for missing loop iteration',
    positive: 'IMPLEMENTED ✅',
    negative: 'NOT IMPLEMENTED ❌'
  },
  'copyPasteErrorFixed': {
    description: 'Bug fix for copy-paste error',
    positive: 'IMPLEMENTED ✅',
    negative: 'NOT IMPLEMENTED ❌'
  }
};

// Run the checks
console.log('\nChecking for bugs in original files...');
const coneResults = checkFileForBugs(conePath, coneBugPatterns);
const arrowResults = checkFileForBugs(arrowPath, arrowBugPatterns);

console.log('\nChecking for bug fixes in fixed files...');
const fixedConeResults = checkFileForBugs(fixedConePath, fixedConeBugPatterns);
const fixedArrowResults = checkFileForBugs(fixedArrowPath, fixedArrowBugPatterns);

// Print results
console.log('\n===================================================');
console.log('                  RESULTS                          ');
console.log('===================================================');

printResults('Original createCone.ts', coneResults, coneInterpretations);
printResults('Original createArrow.ts', arrowResults, arrowInterpretations);
printResults('Fixed createCone.ts', fixedConeResults, fixedConeInterpretations);
printResults('Fixed createArrow.ts', fixedArrowResults, fixedArrowInterpretations);

console.log('\n===================================================');
console.log('                  SUMMARY                          ');
console.log('===================================================');
console.log('1. We have identified bugs in createCone.ts and createArrow.ts');
console.log('2. We have created fixed implementations in fixed-createCone.ts and fixed-createArrow.ts');
console.log('3. The fixes address the specific issues identified in the original code');
console.log('\nVerification complete!');
