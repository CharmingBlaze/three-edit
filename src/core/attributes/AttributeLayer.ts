export interface AttributeLayer<T> {
  readonly size: number;
  get(i: number): T;
  set(i: number, v: T): void;
  resize(n: number): void;
  clone(): AttributeLayer<T>;
}
