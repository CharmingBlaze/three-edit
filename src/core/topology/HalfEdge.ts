import { VID, HEID, FID } from "../types";

export interface Vertex { he: HEID }     // one outgoing half-edge
export interface Face   { he: HEID }     // one boundary half-edge
export interface HalfEdge {
  v: VID;     // the vertex it points to
  next: HEID; // next half-edge around face
  twin: HEID; // opposite half-edge
  face: FID;  // face this half-edge borders
}
