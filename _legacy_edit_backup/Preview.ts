export type PreviewLine = { a: [number, number, number]; b: [number, number, number] };
export type PreviewPoint = { p: [number, number, number] };
export class Preview {
  lines: PreviewLine[] = [];
  points: PreviewPoint[] = [];
  clear() { this.lines.length = 0; this.points.length = 0; }
  addLine(a: [number, number, number], b: [number, number, number]) { this.lines.push({ a, b }); }
  addPoint(p: [number, number, number]) { this.points.push({ p }); }
}
