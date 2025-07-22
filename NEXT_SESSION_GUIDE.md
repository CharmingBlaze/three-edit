# Next Session Guide - Three.js Advanced Editing Library

## 🎯 IMMEDIATE NEXT STEPS

### 1. Test System Modularization (HIGH PRIORITY)
**Location**: `src/tests/`
**Target Files**:
- `SystemIntegration.test.js` (469 lines)
- `GeometryOperations.test.js` (541 lines)
- `HistorySystem.test.js` (605 lines)
- `SceneManager.test.js` (617 lines)
- `TransformManager.test.js` (518 lines)

**Recommended Structure**:
```
src/tests/
├── framework/
│   ├── TestFramework.js
│   ├── TestUtils.js
│   └── index.js
├── integration/
│   ├── SystemIntegration.test.js
│   └── index.js
├── operations/
│   ├── geometryOperations.test.js
│   ├── vertexOperations.test.js
│   ├── edgeOperations.test.js
│   ├── faceOperations.test.js
│   └── index.js
├── managers/
│   ├── sceneManager.test.js
│   ├── transformManager.test.js
│   ├── historyManager.test.js
│   └── index.js
└── runners/
    ├── runTests.js
    ├── runModularTests.js
    └── index.js
```

### 2. Quick Commands to Run
```bash
# Check current syntax
node -c src/index.js

# Run tests (if available)
npm test

# Check file sizes
find src/ -name "*.js" -exec wc -l {} + | sort -n
```

## 📁 CURRENT MODULAR STRUCTURE

### ✅ Completed Systems
```
src/
├── core/                    # ✅ Core data structures
├── converter/              # ✅ Three.js conversion
├── editing/operations/     # ✅ Editing operations (UV, Drawing, Sculpting, Object, Mirror)
├── scene/core/            # ✅ Scene management
├── selection/             # ✅ Selection system
├── transforms/core/       # ✅ Transform system
├── materials/core/        # ✅ Materials system
├── history/core/          # ✅ History system
├── events/types/          # ✅ Event types
├── utils/math/            # ✅ Math utilities
├── utils/validation/      # ✅ Validation utilities
├── animation/             # ✅ Well organized
├── rendering/             # ✅ Well organized
└── primitives/            # ✅ Well organized
```

### 🔄 Needs Work
```
src/
└── tests/                 # 🔄 Needs modularization
```

## 🛠️ REFACTORING PATTERNS

### For Large Files:
1. **Identify Functions**: Extract related functions into separate modules
2. **Create Subdirectory**: Group related functionality
3. **Create Index File**: Centralize exports
4. **Update Imports**: Update all affected files
5. **Delete Original**: Remove the large file after migration
6. **Test**: Run syntax checks

### Example Pattern:
```javascript
// Before: largeFile.js (500+ lines)
export class LargeClass { /* ... */ }
export function operation1() { /* ... */ }
export function operation2() { /* ... */ }
export function utility1() { /* ... */ }

// After: modular structure
// core/LargeClass.js
export class LargeClass { /* ... */ }

// operations/operation1.js
export function operation1() { /* ... */ }

// operations/operation2.js
export function operation2() { /* ... */ }

// utils/utility1.js
export function utility1() { /* ... */ }

// index.js
export * from './core/LargeClass.js';
export * from './operations/operation1.js';
export * from './operations/operation2.js';
export * from './utils/utility1.js';
```

## 📋 CHECKLIST FOR NEXT SESSION

### Before Starting:
- [ ] Read `REFACTORING_PROGRESS.md` for full context
- [ ] Run `node -c src/index.js` to ensure current state is clean
- [ ] Check if any tests are failing

### During Refactoring:
- [ ] Choose one large test file to modularize
- [ ] Create the new directory structure
- [ ] Extract functions/classes into focused modules
- [ ] Create index.js files for exports
- [ ] Update import statements
- [ ] Run syntax checks after each change
- [ ] Update `REFACTORING_PROGRESS.md`

### After Refactoring:
- [ ] Run all available tests
- [ ] Update this guide with new progress
- [ ] Document any issues or patterns discovered

## 🔍 QUICK DIAGNOSTICS

### Check File Sizes:
```bash
# Find large files (>300 lines)
find src/ -name "*.js" -exec wc -l {} + | awk '$1 > 300'
```

### Check Import Issues:
```bash
# Look for import errors
node -c src/index.js 2>&1 | grep -i error
```

### Check Module Structure:
```bash
# List all index.js files
find src/ -name "index.js" | sort
```

## 📚 KEY FILES TO REFERENCE

- `REFACTORING_PROGRESS.md` - Complete progress documentation
- `src/index.js` - Main entry point
- `package.json` - Dependencies and scripts
- `README.md` - Project overview

## 🎯 SUCCESS METRICS

- **File Size**: No file > 300 lines
- **Modularity**: Each module has single responsibility
- **Imports**: All imports use new modular structure
- **Tests**: All tests pass
- **Documentation**: JSDoc comments on all exports

---

**Last Session**: Completed utils/math and utils/validation modularization
**Next Target**: Test system modularization
**Estimated Time**: 2-3 hours for test system 