import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/utils/cn";
import { tableStyles } from "@/styles/table.style";
// import "./table-resizer.css";

interface TableResizerProps {
  columnId: string;
  isResizing: boolean;
  onResizeStart: (columnId: string, startX: number) => void;
  onResizeMove: (currentX: number) => void;
  onResizeEnd: () => void;
  direction?: "ltr" | "rtl";
  isDragging?: boolean;
  width?: number;
  withoutTailwind?: boolean;
}

export function TableResizer({
  columnId,
  isResizing,
  onResizeStart,
  onResizeMove,
  onResizeEnd,
  direction = "ltr",
  isDragging = false,
  width,
  withoutTailwind = false,
}: TableResizerProps) {
  const styles = tableStyles();
  const resizerRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      onResizeStart(columnId, event.clientX);
    },
    [columnId, onResizeStart]
  );

  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const touch = event.touches[0];
      onResizeStart(columnId, touch.clientX);
    },
    [columnId, onResizeStart]
  );

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (event: MouseEvent) => {
      event.preventDefault();
      onResizeMove(event.clientX);
    };

    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault();
      const touch = event.touches[0];
      onResizeMove(touch.clientX);
    };

    const handleEnd = () => {
      onResizeEnd();
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [isResizing, onResizeMove, onResizeEnd]);

  return (
    <>
      <div
        ref={resizerRef}
        className={cn(
          withoutTailwind
            ? ["rtg-resizer", direction, isDragging && "is-dragging"]
            : [
                "rtg-table-resizer",
                styles.resizer(),
                direction,
                isDragging && "cursor-col-resize",
              ]
        )}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={(e) => e.stopPropagation()}
        data-resize-column-id={columnId}
        role="separator"
        aria-orientation="vertical"
        aria-label={`Resize column ${columnId}`}
        aria-valuenow={width}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onResizeStart(columnId, e.currentTarget.getBoundingClientRect().x);
          }
        }}
      />
      {isResizing && (
        <div
          ref={indicatorRef}
          className={cn(
            withoutTailwind
              ? ["rtg-resizer-indicator", direction]
              : [
                  "rtg-table-resizer-indicator",
                  styles.resizerIndicator(),
                  direction,
                ]
          )}
          data-resize-indicator-id={columnId}
          role="presentation"
          aria-hidden="true"
        />
      )}
    </>
  );
}
