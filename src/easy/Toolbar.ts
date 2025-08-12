export type ToolbarButtonSpec = {
  id: string;
  label?: string;
  title?: string;
  iconHTML?: string; // optional inline icon
  toggle?: boolean;  // if true, button is toggleable
  active?: boolean;  // initial active
  onClick: (active: boolean, ev: MouseEvent) => void;
};

/** Lightweight toolbar builder for editor UIs. */
export class ToolbarBuilder {
  readonly root: HTMLElement;
  private buttons = new Map<string, HTMLButtonElement>();
  private toggleState = new Map<string, boolean>();

  constructor(container?: HTMLElement){
    this.root = document.createElement('div');
    this.root.className = 'te-toolbar';
    Object.assign(this.root.style, {
      display: 'flex', gap: '6px', alignItems: 'center'
    } as CSSStyleDeclaration);
    if (container) container.appendChild(this.root);
  }

  addButton(spec: ToolbarButtonSpec){
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'te-btn';
    btn.title = spec.title ?? '';
    btn.setAttribute('data-id', spec.id);
    btn.innerHTML = spec.iconHTML ?? spec.label ?? spec.id;
    if (spec.toggle){
      this.toggleState.set(spec.id, !!spec.active);
      this.applyToggleVisual(btn, !!spec.active);
    }
    btn.addEventListener('click', (ev) => {
      let active = false;
      if (spec.toggle){
        const cur = this.toggleState.get(spec.id) ?? false;
        active = !cur;
        this.toggleState.set(spec.id, active);
        this.applyToggleVisual(btn, active);
      }
      spec.onClick(this.toggleState.get(spec.id) ?? false, ev);
    });
    this.root.appendChild(btn);
    this.buttons.set(spec.id, btn);
    return btn;
  }

  setActive(id: string, active: boolean){
    const btn = this.buttons.get(id); if (!btn) return;
    this.toggleState.set(id, active);
    this.applyToggleVisual(btn, active);
  }

  setEnabled(id: string, enabled: boolean){
    const btn = this.buttons.get(id); if (!btn) return;
    btn.disabled = !enabled;
    btn.style.opacity = enabled ? '1' : '0.5';
  }

  getElement(){ return this.root; }

  private applyToggleVisual(btn: HTMLButtonElement, active: boolean){
    btn.style.background = active ? 'var(--te-accent, #2d6cdf)' : '';
    btn.style.color = active ? '#fff' : '';
    btn.style.border = active ? '1px solid #1e4ea8' : '';
  }
}

// Basic styles suggestion (optional):
export const ToolbarStyles = `.te-toolbar{padding:6px;background:#1b1e24;border:1px solid #2a2f38;border-radius:6px}
.te-btn{padding:6px 10px;border-radius:4px;border:1px solid #2a2f38;background:#232730;color:#e6e6e6;cursor:pointer}
.te-btn:hover{filter:brightness(1.15)}`;
