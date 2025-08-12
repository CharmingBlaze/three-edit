export type KeyCombo = string; // e.g. 'Ctrl+Z', 'Shift+G', 'G'
export type KeyHandler = (ev: KeyboardEvent) => void;

/** Simple keymap manager: normalize combos and bind/unbind handlers. */
export class Keymap {
  private handlers = new Map<KeyCombo, KeyHandler>();
  private enabled = true;
  private listener = (ev: KeyboardEvent) => {
    if (!this.enabled) return;
    const combo = this.toCombo(ev);
    const h = this.handlers.get(combo);
    if (h){ ev.preventDefault(); h(ev); }
  };

  attach(target: Window | Document = window){
    target.addEventListener('keydown', this.listener as any);
  }
  detach(target: Window | Document = window){
    target.removeEventListener('keydown', this.listener as any);
  }

  bind(combo: KeyCombo, handler: KeyHandler){ this.handlers.set(this.normalize(combo), handler); }
  unbind(combo: KeyCombo){ this.handlers.delete(this.normalize(combo)); }

  setEnabled(v: boolean){ this.enabled = v; }

  private normalize(combo: string){
    return combo.split('+').map(s => s.trim().toLowerCase()).sort().join('+');
  }

  private toCombo(ev: KeyboardEvent){
    const parts: string[] = [];
    if (ev.ctrlKey) parts.push('ctrl');
    if (ev.shiftKey) parts.push('shift');
    if (ev.altKey) parts.push('alt');
    const key = ev.key.length === 1 ? ev.key.toLowerCase() : ev.key.toLowerCase();
    parts.push(key);
    return parts.sort().join('+');
  }
}
