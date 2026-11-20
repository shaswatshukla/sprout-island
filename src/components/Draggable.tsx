import { type PointerEvent, type ReactNode, useRef, useState } from 'react';

interface Props {
  label: string;
  onDrop: (targetId: string) => void; // dropped over an element with data-drop="<id>"
  onTap: () => void; // click / Enter / Space: the keyboard and tap path
  onDragChange?: (dragging: boolean) => void;
  className?: string;
  disabled?: boolean;
  children: ReactNode;
}

/** A button that can be dragged with Pointer Events (touch + mouse) or simply tapped. */
export function Draggable({ label, onDrop, onTap, onDragChange, className = '', disabled, children }: Props) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const moved = useRef(false);
  const [off, setOff] = useState<{ x: number; y: number } | null>(null);

  const down = (e: PointerEvent<HTMLButtonElement>) => {
    if (disabled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY };
    moved.current = false;
  };
  const move = (e: PointerEvent<HTMLButtonElement>) => {
    const s = start.current;
    if (!s) return;
    const x = e.clientX - s.x;
    const y = e.clientY - s.y;
    if (!moved.current && Math.hypot(x, y) > 8) {
      moved.current = true;
      onDragChange?.(true);
    }
    if (moved.current) setOff({ x, y });
  };
  const end = (e: PointerEvent<HTMLButtonElement>, drop: boolean) => {
    if (!start.current) return;
    start.current = null;
    setOff(null);
    if (!moved.current) return;
    onDragChange?.(false);
    if (!drop) return;
    const target = document
      .elementsFromPoint(e.clientX, e.clientY)
      .map((el) => el.closest<HTMLElement>('[data-drop]'))
      .find(Boolean);
    if (target?.dataset.drop) onDrop(target.dataset.drop);
  };

  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      className={`draggable ${off ? 'dragging' : ''} ${className}`}
      style={off ? { transform: `translate(${off.x}px, ${off.y}px) scale(1.08)` } : undefined}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={(e) => end(e, true)}
      onPointerCancel={(e) => end(e, false)}
      onClick={() => {
        if (moved.current) {
          moved.current = false; // this click came from a drag
          return;
        }
        onTap();
      }}
    >
      {children}
    </button>
  );
}
