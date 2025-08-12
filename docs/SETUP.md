# Setup

This repository is a headless, modular mesh editing core for Three.js editors.

## Prerequisites
- Node.js 18+
- npm 9+

## Install
```sh
npm i
```

## Build
```sh
npm run build
```

## Test
```sh
npm test
```

## Project structure
- `src/core/` core data structures and topology
- `src/ops/` editing operations built on primitives
- `src/edit/` tool scaffolds, command/history
- `src/io/` import/export and adapters (OBJ/MTL, glTF, Three.js)
- `src/testing/` Vitest tests
- `docs/` documentation

## TypeScript settings
- Strict mode enabled
- ESLint + Prettier

## Running tests in watch mode
```sh
npm run test:watch
```

## IDE tips
- Enable TypeScript type checking
- Prettier on save
- Consider the bracketed ID brands (`VID`, `HEID`, `FID`) when refactoring.
