import { snapDeferralCoord, applyCanvasCenterSnap } from "@shared/deferralCardCanvas";
import type { DeferralCanvasElement } from "@shared/deferralCardCanvas";

export interface DraggableOptions {
  element: DeferralCanvasElement;
  snapToGrid: boolean;
  contentWidth: number;
  innerHeight: number;
  onMove: (x: number, y: number) => void;
  onCenterGuidesChange: (guides: { vertical: boolean; horizontal: boolean } | null) => void;
  width?: number;
  height?: number;
  originX?: number;
  originY?: number;
}

export function draggable(node: HTMLElement, opts: DraggableOptions): { update: (o: DraggableOptions) => void; destroy: () => void } {
  let current = opts;

  const onPointerDown = (e: PointerEvent) => {
    e.stopPropagation();
    const target = node;
    target.setPointerCapture(e.pointerId);
    const startX = e.clientX;
    const startY = e.clientY;
    const width = current.width ?? estimateWidth(current.element);
    const height = current.height ?? estimateHeight(current.element);
    const origX = current.originX ?? current.element.x;
    const origY = current.originY ?? current.element.y;
    let curX = origX;
    let curY = origY;
    const maxX = Math.max(0, current.contentWidth - width);
    const maxY = Math.max(0, current.innerHeight - height);

    const onPointerMove = (ev: PointerEvent) => {
      let nx = Math.max(0, Math.min(maxX, origX + (ev.clientX - startX)));
      let ny = Math.max(0, Math.min(maxY, origY + (ev.clientY - startY)));
      if (current.snapToGrid) {
        nx = snapDeferralCoord(nx);
        ny = snapDeferralCoord(ny);
      }
      const centered = applyCanvasCenterSnap(nx, ny, width, height, current.contentWidth, current.innerHeight);
      nx = centered.x;
      ny = centered.y;
      if (centered.showVerticalGuide || centered.showHorizontalGuide) {
        current.onCenterGuidesChange({
          vertical: centered.showVerticalGuide,
          horizontal: centered.showHorizontalGuide,
        });
      } else {
        current.onCenterGuidesChange(null);
      }
      curX = nx;
      curY = ny;
      target.style.left = `${curX}px`;
      target.style.top = `${curY}px`;
    };

    const endDrag = (commit: boolean) => {
      target.releasePointerCapture(e.pointerId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerCancel);
      current.onCenterGuidesChange(null);
      if (commit) current.onMove(curX, curY);
    };
    const onPointerUp = () => endDrag(true);
    const onPointerCancel = () => endDrag(false);

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerCancel);
  };

  node.addEventListener("pointerdown", onPointerDown);

  return {
    update(o: DraggableOptions) {
      current = o;
    },
    destroy() {
      node.removeEventListener("pointerdown", onPointerDown);
    },
  };
}

function estimateWidth(el: DeferralCanvasElement): number {
  return (el as any).width ?? 0;
}
function estimateHeight(el: DeferralCanvasElement): number {
  return (el as any).height ?? 0;
}
