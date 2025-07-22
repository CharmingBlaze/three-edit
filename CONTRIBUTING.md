# Contributing to the Three.js Advanced Editing Library

First off, thank you for considering contributing! This project is a modular, extensible library for advanced mesh editing in Three.js, and we welcome any contributions, from bug fixes to new features.

This document provides guidelines for contributing to the project to ensure a smooth and consistent development process.

## Core Architectural Principles

Our library is built on a few core principles to ensure it remains clean, maintainable, and easy to extend:

1.  **Modularity:** Every piece of functionality should be in its own small, focused file. For example, each vertex operation (merge, snap, connect) has its own dedicated file. This makes the code easier to understand, test, and debug.

2.  **Clear Entry Points:** The system uses clear `index.js` files at each level of the directory structure to aggregate and export functionality. This creates a clean, hierarchical API.

3.  **Static, Functional Operations:** All geometry operations are implemented as static methods within a class that acts as a namespace (e.g., `VertexOperations.merge(...)`). These operations are pure functions: they take a geometry and an options object as input and return a result object, modifying the input geometry directly. They do not rely on an internal state.

4.  **Validation:** We use a centralized `Validator` class (`src/editing/core/validation.js`) to ensure that all inputs to our operations are valid. This helps prevent common errors and ensures the stability of the library.

## Project Structure

The core logic of the library is located in the `src/editing` directory. Here is a breakdown of the key subdirectories:

-   `src/editing/operations/`: Contains all the geometry editing operations, organized into subdirectories by type.
    -   `operations/vertex/`: All vertex-specific operations (e.g., `mergeVertices.js`).
    -   `operations/edge/`: All edge-specific operations.
    -   `operations/face/`: All face-specific operations.
    -   `operations/geometry/`: High-level geometry-wide operations.
-   `src/editing/core/`: Contains the core, foundational logic of the library, such as the `validation.js` module.
-   `src/editing/utils/`: Contains helper functions that support the main operations but are not operations themselves.
-   `src/editing/factories/`: Contains factory functions for creating complex objects like the `EditManager` or `Tool` instances.
-   `src/tests/`: Contains all the tests for the library.

## How to Add a New Operation

Adding a new editing operation is the most common way to contribute. Here is a step-by-step guide:

1.  **Create the Operation File:**
    -   Identify the type of operation you are adding (e.g., vertex, edge, face).
    -   Create a new JavaScript file in the corresponding subdirectory. For example, a new vertex operation called `chamfer` would be created at `src/editing/operations/vertex/chamferVertices.js`.

2.  **Implement the Operation:**
    -   Your file should export a single function that performs the operation.
    -   The function should accept the `geometry` object and an `options` object as parameters.
    -   Use the `Validator` class to validate any inputs from the `options` object (e.g., vertex indices).
    -   Perform the geometry manipulation directly on the input `geometry` object.
    -   Return an object describing the result, including which elements were impacted.

    ```javascript
    // src/editing/operations/vertex/chamferVertices.js
    import { Validator } from '../../core/validation.js';

    export function chamfer(geometry, options) {
      const { vertexIndex, distance } = options;

      // 1. Validate inputs
      Validator.validateVertexIndices(geometry, [vertexIndex]);
      if (distance <= 0) {
        throw new Error('Chamfer distance must be positive.');
      }

      // 2. Perform the operation (your logic here)
      // ... modify geometry.attributes.position ...

      // 3. Return the result
      return {
        impacted: [vertexIndex],
        // ... other relevant result data
      };
    }
    ```

3.  **Export the New Operation:**
    -   Open the `index.js` file in the same directory (e.g., `src/editing/operations/vertex/index.js`).
    -   Import and export your new operation function.
    -   Add the function to the main `VertexOperations` class as a static method.

    ```javascript
    // src/editing/operations/vertex/index.js
    import { merge } from './mergeVertices.js';
    import { chamfer } from './chamferVertices.js'; // Import your new function

    export class VertexOperations {
      static merge = merge;
      static chamfer = chamfer; // Add your new function here
    }
    ```

4.  **Add a Test:**
    -   Create a new test case in the relevant test file (e.g., `src/tests/vertexOperations.test.js`).
    -   Write a test that creates a sample geometry, runs your new operation, and asserts that the result is correct.

## Running Tests

Our test suite uses a simple, custom test runner. To run the tests, execute the following command from the root of the project:

```bash
node src/tests/runSimpleTests.js
```

Before submitting a pull request, please ensure that all tests are passing.

## Code Style and Conventions

-   We use modern JavaScript (ES6+).
-   All code should be formatted using Prettier with the default settings.
-   Use JSDoc to document all public functions and classes.
-   Follow the existing file and naming conventions.

Thank you for contributing to our project!

First, thank you for considering contributing! We welcome all contributions that help improve the library. This document provides guidelines to ensure a smooth and consistent development process.

## Core Philosophy

Our goal is to create a powerful, predictable, and easy-to-use mesh editing library. To achieve this, we follow a few core principles:

- **Modularity**: Operations are grouped into logical, self-contained modules (`VertexOperations`, `EdgeOperations`, etc.). This makes the codebase easier to navigate, test, and maintain.
- **Functional Approach**: Operations are written as pure functions. They take geometry and options as input and return a result object containing the new geometry, without modifying the original. This ensures predictability and avoids side effects.
- **Immutability**: We never modify the input geometry. Every operation clones the geometry first (`geometry.clone()`) and applies changes to the clone.
- **Clear APIs**: Functions should be well-documented with JSDoc, explaining their purpose, parameters, and return values.

## Project Structure

The most important files and directories are:

- `src/editing/`: Contains the core operation modules (`vertexOperations.js`, etc.) and the main `index.js` barrel file.
- `src/editing/core/`: Low-level utility functions for geometry and math.
- `src/editing/validation/`: Contains the validation logic for each operation module.
- `src/tests/`: Contains the test and validation scripts.

## How to Add a New Operation

Here is a step-by-step guide to adding a new operation, using `extrudeFaces` as an example:

1.  **Choose the Right Module**: Add your function to the appropriate file in `src/editing/`. For `extrudeFaces`, this would be `faceOperations.js`.

2.  **Write the Function**: Define your function. It should accept `geometry` and an `options` object, and return an `OperationResult` (`{ success, geometry, errors }`).

3.  **Add Validation**: At the beginning of your function, use the corresponding validator to check the parameters. This ensures robustness and provides clear errors.
    ```javascript
    const validation = FaceOperationValidator.validateParams({ geometry, faceIndices, options }, FaceOperationTypes.EXTRUDE);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }
    ```

4.  **Implement the Logic**: Write the core logic for your operation. **Always clone the geometry first** to maintain immutability.
    ```javascript
    const newGeometry = geometry.clone();
    // ... your logic here ...
    return { success: true, geometry: newGeometry };
    ```

5.  **Export the Function**: Add your function to the exported object at the bottom of the module file.
    ```javascript
    export const FaceOperations = {
      // ... other operations
      extrude: extrudeFaces,
    };
    ```

6.  **Add a Test**: Open `src/tests/runSimpleTests.js` and add a new test case to verify your operation works correctly and handles invalid inputs gracefully.

## Development Workflow

### Prerequisites
- Node.js (LTS version recommended)
- npm

### Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/yourusername/threejs-edit.git
cd threejs-edit
npm install
```

### Running Tests

We use a combination of simple tests and a validation suite. Use the following commands to run them:

```bash
# Run the main test suite
npm test

# Run the modular system validation
npm run test:validation

# Run all tests and validation
npm run test:all
```

### Code Style

We use ESLint for linting and Prettier for formatting. Please run these tools before submitting your changes.

```bash
# Check for linting errors
npm run lint

# Automatically fix linting and formatting issues
npm run lint:fix
npm run format
```

## Submitting Changes

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Commit your changes, following our code style and testing guidelines.
4.  Push your branch and open a pull request.

Thank you for contributing!
