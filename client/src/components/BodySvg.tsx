import { useRef, useCallback } from "react";
import type { BodyView, PainPoint } from "@shared/schema";

import bodyFront from "@assets/body-front.jpg";
import bodyBack from "@assets/body-back.jpg";
import bodyLeft from "@assets/body-left.jpg";
import bodyRight from "@assets/body-right.jpg";

interface BodySvgProps {
  view: BodyView;
  painPoints: PainPoint[];
  onClickPoint?: (x: number, y: number) => void;
  interactive?: boolean;
  /** Height of the image in px (or CSS value). Default: 340 */
  imgHeight?: number | string;
}

const BODY_IMAGES: Record<BodyView, string> = {
  front: bodyFront,
  back: bodyBack,
  left: bodyLeft,
  right: bodyRight,
};

const intensityColor = (intensity: number) => {
  if (intensity <= 3) return "#22c55e";
  if (intensity <= 6) return "#f59e0b";
  return "#ef4444";
};

export function BodySvg({
  view,
  painPoints,
  onClickPoint,
  interactive = true,
  imgHeight = 340,
}: BodySvgProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const viewPoints = painPoints.filter((p) => p.view === view);

  // Click directly on the <img> element.
  // e.nativeEvent.offsetX/Y are relative to the img element itself — no geometry math needed.
  const handleImgClick = useCallback(
    (e: React.MouseEvent<HTMLImageElement>) => {
      if (!onClickPoint) return;
      const img = e.currentTarget;
      const rect = img.getBoundingClientRect();
      // Use clientX/Y minus img rect for robustness across browsers
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;
      const x = (relX / rect.width) * 100;
      const y = (relY / rect.height) * 100;
      onClickPoint(x, y);
    },
    [onClickPoint]
  );

  // Compute dot position over the img using the same img element rect
  // We use inline style percentages so dots stay aligned even on resize.
  const heightStyle = typeof imgHeight === "number" ? `${imgHeight}px` : imgHeight;

  return (
    // Outer wrapper: centers the img horizontally, clips overflow
    <div
      className="relative flex justify-center overflow-hidden select-none"
      style={{ height: heightStyle }}
      data-testid={`body-svg-${view}`}
    >
      <img
        ref={imgRef}
        src={BODY_IMAGES[view]}
        alt="Тело"
        style={{ height: "100%", width: "auto", display: "block" }}
        draggable={false}
        onClick={interactive ? handleImgClick : undefined}
        className={interactive ? "cursor-crosshair" : ""}
      />

      {/* Pain point dots — positioned using percentage of img rendered size */}
      {viewPoints.map((point) => {
        const color = intensityColor(point.intensity);
        return (
          <PointDot key={point.id} point={point} color={color} imgRef={imgRef} />
        );
      })}
    </div>
  );
}

// Separate component so it can read imgRef.current at render time
function PointDot({
  point,
  color,
  imgRef,
}: {
  point: PainPoint;
  color: string;
  imgRef: React.RefObject<HTMLImageElement>;
}) {
  const img = imgRef.current;
  if (!img) return null;
  const rect = img.getBoundingClientRect();
  const parentRect = img.parentElement?.getBoundingClientRect();
  if (!parentRect) return null;

  // Position relative to the parent wrapper div
  const dotLeft = (rect.left - parentRect.left) + (point.x / 100) * rect.width;
  const dotTop  = (rect.top  - parentRect.top)  + (point.y / 100) * rect.height;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: dotLeft,
        top: dotTop,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div
        className="absolute rounded-full animate-ping"
        style={{
          width: 22, height: 22,
          left: "50%", top: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: color,
          opacity: 0.35,
        }}
      />
      <div
        className="relative flex items-center justify-center rounded-full font-bold text-white shadow-lg"
        style={{
          width: 24, height: 24,
          backgroundColor: color,
          border: "2px solid white",
          fontSize: 10,
        }}
      >
        {point.intensity}
      </div>
    </div>
  );
}
