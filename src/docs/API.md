# API Documentation

## Table of Contents

1. [Selection System](#selection-system)
2. [Scene System](#scene-system)
3. [Events System](#events-system)
4. [Materials System](#materials-system)
5. [UV System](#uv-system)
6. [Undo/Redo System](#undoredo-system)
7. [Utils System](#utils-system)

## Selection System

### Selection Functions (New Modular Style)

All selection operations are now pure functions, imported directly from their respective files or group index files. Example:

```js
import { setSelectionMode, addSelection, removeSelection, isSelected, getAllSelections } from '../selection/index.js';
```

**Example Usage:**
```js
import { setSelectionMode, addSelection } from '../selection/index.js';

setSelectionMode('vertex');
addSelection('vertex', 'v1');
```

## Scene System

### Scene Functions (New Modular Style)

```js
import { createScene, duplicateMesh, groupMeshes } from '../scene/index.js';
```

**Example Usage:**
```js
import { createScene } from '../scene/index.js';
const scene = createScene('MyScene');
```

## Events System

```js
import { addEventListener, removeEventListener, dispatchEvent } from '../events/index.js';
```

## Materials System

```js
import { createMaterial, setMaterialProperty } from '../materials/index.js';
```

## UV System

```js
import { unwrapFaces, packUVs } from '../editing/operations/uv/index.js';
```

## Undo/Redo System

```js
import { undo, redo } from '../undoRedo/index.js';
```

## Utils System

```js
import { calculateCentroid, calculateBoundingBox } from '../utils/math/vectorMath.js';
```

## Migration Guide

**Old Style:**
```js
import { SelectionManager } from '../selection/SelectionManager.js';
const manager = new SelectionManager();
manager.setSelectionMode('vertex');
```

**New Modular Style:**
```js
import { setSelectionMode } from '../selection/index.js';
setSelectionMode('vertex');
```
- All operations are now imported as individual functions from their respective files or group index files.
- There are no more manager or group objects—just pure functions.
- Update all your imports and usage accordingly for the new modular system. 