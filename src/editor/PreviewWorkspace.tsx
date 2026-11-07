import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type MouseEventHandler,
  type ReactNode,
} from 'react';
import {
  ArrowsOutSimpleIcon,
  DesktopIcon,
  DeviceMobileIcon,
  SidebarSimpleIcon,
  XIcon,
} from '@phosphor-icons/react';
import { Button } from './ui';
import { useAdminTheme } from './AdminTheme';
import css from './preview-workspace.module.css';

type Mode = 'off' | 'split' | 'float';
type Box = { x: number; y: number; width: number };
const storageKey = 'quinecms:preview-workspace';
// Infinity places the floating window in the bottom-right corner; it is not
// stored (JSON writes null), so an unmoved window stays docked to that corner.
const defaults = {
  mode: 'split' as Mode,
  split: 45,
  device: 'desktop',
  box: { x: Infinity, y: Infinity, width: 480 },
};
function read() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    return {
      mode: (['off', 'split', 'float'].includes(saved.mode)
        ? saved.mode
        : 'split') as Mode,
      split: Number.isFinite(saved.split)
        ? Math.max(25, Math.min(70, saved.split))
        : defaults.split,
      device: saved.device === 'mobile' ? 'mobile' : 'desktop',
      box:
        saved.box &&
        ['x', 'y', 'width'].every((k) => Number.isFinite(saved.box[k]))
          ? (saved.box as Box)
          : defaults.box,
    };
  } catch {
    return defaults;
  }
}
const Context = createContext<ReturnType<typeof useWorkspaceState> | null>(
  null,
);
function useWorkspaceState() {
  const [state, set] = useState(read);
  const [bounds, setBounds] = useState({ width: 1000, height: 700 });
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {}
  }, [state]);
  return { state, set, bounds, setBounds, host };
}
export function PreviewProvider({ children }: { children: ReactNode }) {
  const value = useWorkspaceState();
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
function useWorkspace() {
  const context = useContext(Context);
  if (!context) throw new Error('PreviewProvider is required');
  return context;
}
export function PreviewToggle() {
  const { state, set } = useWorkspace();
  return (
    <Button
      className={css.toggle}
      aria-label="Toggle preview"
      aria-pressed={state.mode !== 'off'}
      onClick={() =>
        set((s) => ({ ...s, mode: s.mode === 'off' ? 'split' : 'off' }))
      }
    >
      Preview
    </Button>
  );
}
export function Workbench({
  preview,
  children,
}: {
  preview: boolean;
  children: ReactNode;
}) {
  const { state, host, setBounds } = useWorkspace();
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const measure = () =>
      setBounds({ width: element.clientWidth, height: element.clientHeight });
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [host, setBounds]);
  return (
    <div
      ref={host}
      className={css.workbench}
      data-preview={preview ? state.mode : 'off'}
      style={{ '--preview-share': `${state.split}%` } as CSSProperties}
    >
      {children}
    </div>
  );
}
/** The window's toolbar height and its inset from the workspace edges. */
const bar = 28,
  inset = 16;
export function constrainPreview(
  box: Box,
  bounds: { width: number; height: number },
  ratio: number,
): Box {
  const room = {
    width: Math.max(1, bounds.width - inset * 2),
    height: Math.max(1, bounds.height - inset * 2),
  };
  const maximum = Math.max(
    1,
    Math.min(room.width, (room.height - bar) * ratio),
  );
  const width = Math.min(maximum, Math.max(Math.min(240, maximum), box.width));
  const clamp = (value: number, limit: number) =>
    Math.max(inset, Math.min(Number.isFinite(value) ? value : limit, limit));
  return {
    width,
    x: clamp(box.x, inset + room.width - width),
    y: clamp(box.y, inset + room.height - (width / ratio + bar)),
  };
}
/** One mounted canvas. Only its geometry changes across Off / Split / Float. */
export function Preview({
  children,
  toolbar,
  onClickCapture,
}: {
  children: ReactNode;
  toolbar?: ReactNode;
  onClickCapture?: MouseEventHandler;
}) {
  const { state, set, bounds, host } = useWorkspace();
  const { mode } = useAdminTheme();
  const viewport = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [available, setAvailable] = useState({ width: 640, height: 600 });
  const mobile = state.device === 'mobile';
  const logical = mobile
    ? { width: 390, height: 844 }
    : { width: 1280, height: 800 };
  const ratio = logical.width / logical.height;
  const box = constrainPreview(state.box, bounds, ratio);
  useEffect(() => {
    const node = viewport.current;
    if (!node || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() =>
      setAvailable({ width: node.clientWidth, height: node.clientHeight }),
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const floating = state.mode === 'float';
  const scale = Math.max(
    0.01,
    floating
      ? Math.min(
          available.width / logical.width,
          available.height / logical.height,
        )
      : Math.min(available.width / logical.width, mobile ? 1 : Infinity),
  );
  // A docked preview is a full-height browser viewport. Only the floating
  // window locks the device aspect ratio; split must not letterbox vertically.
  const canvasHeight = floating ? logical.height : available.height / scale;
  function gesture(event: PointerEvent<HTMLElement>, kind: string) {
    if (
      event.button !== 0 ||
      (kind === 'move' && (event.target as Element).closest('button'))
    )
      return;
    event.preventDefault();
    const target = event.currentTarget,
      startX = event.clientX,
      startY = event.clientY;
    if (kind === 'split') {
      target.dataset.pointer = 'true';
      target.focus();
    }
    target.setPointerCapture(event.pointerId);
    setDragging(true);
    function move(e: globalThis.PointerEvent) {
      const dx = e.clientX - startX,
        dy = e.clientY - startY;
      if (kind === 'split') {
        const rect = host.current?.getBoundingClientRect();
        if (rect)
          set((s) => ({
            ...s,
            split: Math.max(
              25,
              Math.min(70, ((rect.right - e.clientX) / rect.width) * 100),
            ),
          }));
      } else if (kind === 'move')
        set((s) => ({
          ...s,
          box: constrainPreview(
            { ...box, x: box.x + dx, y: box.y + dy },
            bounds,
            ratio,
          ),
        }));
      else {
        const left = kind.includes('w'),
          top = kind.includes('n');
        const delta =
          Math.abs(dx) > Math.abs(dy * ratio)
            ? dx * (left ? -1 : 1)
            : dy * ratio * (top ? -1 : 1);
        const width = Math.min(
          Math.max(240, box.width + delta),
          bounds.width - inset * 2,
          (bounds.height - inset * 2 - bar) * ratio,
        );
        set((s) => ({
          ...s,
          box: constrainPreview(
            {
              width,
              x: left ? box.x + box.width - width : box.x,
              y: top ? box.y + (box.width - width) / ratio : box.y,
            },
            bounds,
            ratio,
          ),
        }));
      }
    }
    function end() {
      setDragging(false);
      target.removeEventListener('pointermove', move);
      target.removeEventListener('pointerup', end);
      target.removeEventListener('pointercancel', end);
      target.removeEventListener('lostpointercapture', end);
    }
    target.addEventListener('pointermove', move);
    target.addEventListener('pointerup', end);
    target.addEventListener('pointercancel', end);
    target.addEventListener('lostpointercapture', end);
  }
  return (
    <section
      className={css.preview}
      data-admin-mode={mode}
      data-preview-mode={state.mode}
      data-dragging={dragging || undefined}
      aria-label="Live preview"
      style={
        state.mode === 'float'
          ? {
              left: box.x,
              top: box.y,
              width: box.width,
              height: box.width / ratio + bar,
            }
          : undefined
      }
    >
      <div
        role="separator"
        tabIndex={0}
        aria-label="Resize editor and preview"
        aria-orientation="vertical"
        aria-valuemin={25}
        aria-valuemax={70}
        aria-valuenow={Math.round(state.split)}
        className={css.splitter}
        onPointerDown={(e) => gesture(e, 'split')}
        onBlur={(e) => delete e.currentTarget.dataset.pointer}
        onKeyDown={(e) => {
          delete e.currentTarget.dataset.pointer;
          if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            set((s) => ({
              ...s,
              split: Math.max(
                25,
                Math.min(70, s.split + (e.key === 'ArrowLeft' ? 2 : -2)),
              ),
            }));
          }
        }}
      />
      <div
        className={`admin-ui ${css.toolbar}`}
        data-mode={mode}
        onPointerDown={(e) => state.mode === 'float' && gesture(e, 'move')}
      >
        <span className={css.caption}>Preview</span>
        {toolbar}
        <Button
          size="sm"
          variant="ghost"
          aria-label={state.mode === 'float' ? 'Dock preview' : 'Float preview'}
          title={
            state.mode === 'float'
              ? 'Dock beside the editor'
              : 'Float over the editor'
          }
          icon={
            state.mode === 'float' ? (
              <SidebarSimpleIcon />
            ) : (
              <ArrowsOutSimpleIcon />
            )
          }
          onClick={() =>
            set((s) => ({ ...s, mode: s.mode === 'float' ? 'split' : 'float' }))
          }
        >
          <span className={css.label}>
            {state.mode === 'float' ? 'Dock' : 'Float'}
          </span>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          aria-label="Toggle preview width"
          title={mobile ? 'Show the desktop width' : 'Show the mobile width'}
          icon={mobile ? <DeviceMobileIcon /> : <DesktopIcon />}
          onClick={() =>
            set((s) => ({ ...s, device: mobile ? 'desktop' : 'mobile' }))
          }
        >
          <span className={css.label}>{mobile ? 'Mobile' : 'Desktop'}</span>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          shape="square"
          aria-label="Close preview"
          title="Close preview"
          icon={<XIcon />}
          onClick={() => set((s) => ({ ...s, mode: 'off' }))}
        />
      </div>
      <div ref={viewport} className={css.viewport}>
        <div
          className={css.scaled}
          style={{
            width: logical.width * scale,
            height: canvasHeight * scale,
          }}
        >
          <div
            className={css.canvas}
            onClickCapture={onClickCapture}
            data-device={state.device}
            style={{
              width: logical.width,
              height: canvasHeight,
              transform: `scale(${scale})`,
            }}
          >
            {children}
          </div>
        </div>
      </div>
      {['nw', 'ne', 'sw', 'se'].map((corner) => (
        <div
          key={corner}
          className={css.corner}
          data-corner={corner}
          onPointerDown={(e) => gesture(e, corner)}
        />
      ))}
    </section>
  );
}
