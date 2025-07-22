# Contributing to the Three.js Advanced Editing Library

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
