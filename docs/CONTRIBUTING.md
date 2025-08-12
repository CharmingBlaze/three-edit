# Contributing

## Development Workflow
1. Fork and branch from `main`
2. `npm i`
3. Make changes with strict TypeScript and Prettier
4. Add/adjust tests in `src/testing/`
5. Ensure `npm test` passes
6. Open a PR with a concise description and links to docs

## Code Style
- Use typed IDs (`VID`, `HEID`, `FID`) consistently
- Keep core topology edits inside `src/core/topology/build.ts`
- Ops should be attribute-safe and rely on primitives
- Avoid Three.js references in core and ops

## Adding Ops
- Start from the selection and boundary walk
- Perform topology edits via primitives
- Propagate per-corner UVs and per-face materials
- Add tests verifying attribute correctness and topology validity

## Commit Messages
- Imperative tone, reference files and symbols when useful

## PR Checklist
- [ ] Tests added/updated
- [ ] Lints pass
- [ ] Docs updated (link from README if needed)
