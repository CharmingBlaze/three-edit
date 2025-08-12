export class History {
  private stack: any[] = [];
  private redoStack: any[] = [];
  private dragBatch: any[] | null = null;

  beginDrag(){ this.dragBatch = []; }
  commitDrag(){ if (this.dragBatch && this.dragBatch.length){ this.stack.push(this.dragBatch); this.redoStack.length = 0; } this.dragBatch = null; }
  cancelDrag(){ this.dragBatch = null; }

  push(cmd: any){
    if (this.dragBatch){ this.dragBatch.push(cmd); }
    else { this.stack.push(cmd); this.redoStack.length = 0; }
  }

  undo(){
    if (!this.stack.length) return;
    const item = this.stack.pop();
    this.redoStack.push(item);
    // TODO: call item.undo() if command conforms
  }

  redo(){
    if (!this.redoStack.length) return;
    const item = this.redoStack.pop();
    this.stack.push(item);
    // TODO: call item.redo() if command conforms
  }
}
