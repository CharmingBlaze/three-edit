export interface TriangulationPolicy {
  diagonal: "shortest" | "consistent-strip" | "normal-based";
  respectSeams: boolean;
}

export interface QuadPolicy {
  preferQuads: boolean;
  mergeTrisToQuads: boolean;
}

export interface SubdivOptions {
  levels: number;
  preserveCorners: boolean;
}

export const DefaultTriangulation: TriangulationPolicy = {
  diagonal: "shortest",
  respectSeams: true,
};

export const DefaultQuadPolicy: QuadPolicy = {
  preferQuads: true,
  mergeTrisToQuads: true,
};

export const DefaultSubdiv: SubdivOptions = {
  levels: 1,
  preserveCorners: true,
};
