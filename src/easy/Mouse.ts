import * as THREE from 'three';
import type { EventHub } from './EventHub';
import { defaultHub } from './EventHub';

export interface MouseOpts {
  dom: HTMLElement;
  camera: THREE.Camera;
  hub?: EventHub; // defaults to defaultHub
  pick?: (x: number, y: number) => any; // returns PickResult-like object
}

export class Mouse {
  private dom: HTMLElement;
  private camera: THREE.Camera;
  private hub: EventHub;
  private pick?: (x:number,y:number)=>any;
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private onDown = (e: PointerEvent) => this.handleDown(e);
  private onMove = (e: PointerEvent) => this.handleMove(e);
  private onUp   = (e: PointerEvent) => this.handleUp(e);
  private onWheel= (e: WheelEvent)   => this.handleWheel(e);

  constructor(opts: MouseOpts){
    this.dom = opts.dom;
    this.camera = opts.camera;
    this.hub = opts.hub ?? defaultHub;
    this.pick = opts.pick;
  }

  attach(){
    this.dom.addEventListener('pointerdown', this.onDown);
    this.dom.addEventListener('pointermove', this.onMove);
    this.dom.addEventListener('pointerup', this.onUp);
    this.dom.addEventListener('wheel', this.onWheel, { passive: true });
  }

  detach(){
    this.dom.removeEventListener('pointerdown', this.onDown);
    this.dom.removeEventListener('pointermove', this.onMove);
    this.dom.removeEventListener('pointerup', this.onUp);
    this.dom.removeEventListener('wheel', this.onWheel);
  }

  private ndcAndRay(e: PointerEvent){
    const rect = this.dom.getBoundingClientRect();
    const x = e.clientX, y = e.clientY;
    const nx = ((x - rect.left) / rect.width) * 2 - 1;
    const ny = -(((y - rect.top) / rect.height) * 2 - 1);
    this.pointer.set(nx, ny);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    return { x, y, ndc: [nx, ny] as [number,number], ray: this.raycaster.ray.clone() };
  }

  private mods(e: PointerEvent | WheelEvent){
    const pe = e as PointerEvent;
    return { shift: !!pe.shiftKey, ctrl: !!pe.ctrlKey, alt: !!pe.altKey, meta: (pe as any).metaKey ?? false };
  }

  private handleDown(e: PointerEvent){
    const info = this.ndcAndRay(e);
    this.hub.emit('mouse.down', { button: e.button, ...info, mods: this.mods(e) });
    if (this.pick){
      const hit = this.pick(e.clientX, e.clientY);
      this.hub.emit('mouse.pick', { ...info, hit });
    }
  }

  private handleMove(e: PointerEvent){
    const info = this.ndcAndRay(e);
    this.hub.emit('mouse.move', { ...info, mods: this.mods(e) });
  }

  private handleUp(e: PointerEvent){
    const info = this.ndcAndRay(e);
    this.hub.emit('mouse.up', { ...info, mods: this.mods(e) });
  }

  private handleWheel(e: WheelEvent){
    this.hub.emit('mouse.wheel', { deltaX: e.deltaX, deltaY: e.deltaY, mods: this.mods(e) });
  }
}
