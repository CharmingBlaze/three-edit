// UMD/ESM shim for Three-Edit demo
// If a global UMD build is present (window.ThreeEdit), use it.
// Otherwise, fall back to importing the local source ESM.

// Note: relies on Vite supporting top-level await.

let io: any, core: any, ops: any, easy: any;
const g: any = (globalThis as any).ThreeEdit;

if (g && (g.io || g.core || g.ops || g.easy)) {
  ({ io, core, ops, easy } = g);
} else {
  const lib = await import('../src/index');
  ({ io, core, ops, easy } = lib as any);
}

export { io, core, ops, easy };
