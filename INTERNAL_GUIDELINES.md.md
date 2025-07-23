📌 Prompt for Cursor.ai: Build and Edit This Library Using Best Practices

You are helping develop a professional-level, modular, TypeScript-based 3D editing library called three-edit.It is a headless companion to Three.js and is used to build full-featured 3D editors, modeling tools, and CAD systems.

Follow every rule below strictly — these are not suggestions.

✅ 🧠 Guidelines for All Code You Write or Modify

🔧 1. Use Best Coding Practices

Write TypeScript, not JavaScript

Use const, readonly, and immutability where appropriate

Functions must do one clear thing. No catch-all utilities.

Prefer pure functions where possible (especially math & transforms)

No any, no // @ts-ignore, no loose types

📦 2. Make Everything Modular

Never write god files

Split large logic into single-responsibility files

Organize by feature/system, not type

Use folders like editing/, geometry/, scene/, utils/, uv/, exporters/

Use index.ts files in each folder to expose public APIs

🧼 3. Safe, Scalable Design

Never mutate shared state directly — use controlled methods

Geometry operations must preserve topology

Scene graph and mesh systems must be fully decoupled

Everything must be testable (design accordingly)

🚦 4. Fix While You Work

Fix broken imports, invalid types, or sloppy code near what you're editing

Remove unused variables

Rename confusing or unclear names

Leave every file better than you found it

📚 5. Document and Type Everything

Every class/function must have JSDoc-style comments

Every exported type/interface should be clearly named and described

Keep parameter and return types as explicit as possible

🧩 Expected System Architecture

Folder Example:

src/
├── core/             # EditableMesh and topological data
├── editing/          # Mesh operations (extrude, bevel, etc.)
├── geometry/         # Primitives like createCube, createSphere
├── scene/            # SceneGraph, SceneNode, transform hierarchy
├── uv/               # UV unwrap and manipulation
├── selection/        # Selection system
├── exporters/        # Export formats (GLTF, OBJ, JSON, etc.)
├── utils/            # Math, validation, ID generation
├── index.ts          # Main entrypoint

🧱 Key Systems to Build and Maintain



💡 Extra Principles

Respect user data — don’t overwrite userData, tags, or metadata

Always prefer small reusable tools over monolithic classes

Don’t assume UI — this library is headless and should work in CLI, browser, or editor backends

Use crypto.randomUUID() or your internal ID generator for consistent unique IDs

🧪 Testing Rules

Write tests for every new function or class

Validate behavior under invalid input (e.g., bad face indices)

Include edge case tests for all geometry modifications

Run all tests with npm run test (if setup)

🛡️ Never Do This

Never write more than 150–300 lines in one file

Never use any or skip types

Never mutate arrays in-place unless clearly controlled (e.g., .push() inside a method)

Never mix unrelated responsibilities in a single class or function

Never ignore matrix, uv, or normal updates after geometry editing

🎯 Your Mission as Cursor

Everything you touch must become cleaner, safer, and more modular than it was before.If something is broken, fix it. If something is unclear, refactor it. If something is duplicated, abstract it.And always follow the pattern of “small files, typed interfaces, safe transforms.”

