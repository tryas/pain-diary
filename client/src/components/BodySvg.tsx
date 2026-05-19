import { useRef, useState, useCallback } from "react";
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
  /** Height of the image in px (or CSS value). Default: "42vh" capped at 340px */
  imgHeight?: number | string;
}

const BODY_IMAGES: Record<BodyView, string> = {
  front: bodyFront,
  back: bodyBack,
  left: bodyLeft,
  right: bodyRight,
};

// Natural aspect ratio for each image (width / height)
// front: 424/865, back: 429/865, left: 434/899, right: 433/885
const ASPECT: Record<BodyView, number> = {
  front: 424 / 865,
  back:  429 / 865,
  left:  434 / 899,
  right: 433 / 885,
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
  const wrapRef = useRef<HTMLDivElement>(null);
  const [renderedHeight, setRenderedHeight] = useState<number>(0);
  const viewPoints = painPoints.filter((p) => p.view === view);

  // Compute rendered image dimensions from wrapper size
  const getImgDims = () => {
    if (!wrapRef.current) return null;
    const h = wrapRef.current.offsetHeight;
    const w = h * ASPECT[view];
    return { w, h };
  };

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!onClickPoint) return;
      const dims = getImgDims();
      if (!dims) return;
      const rect = e.currentTarget.getBoundingClientRect();
      // The image is centred in the wrapper; compute its left offset
      const imgLeft = (rect.width - dims.w) / 2;
      const relX = e.clientX - rect.left - imgLeft;
      const relY = e.clientY - rect.top;
      // Clamp to image bounds
      if (relX < 0 || relX > dims.w || relY < 0 || relY > dims.h) return;
      const x = (relX / dims.w) * 100;
      const y = (relY / dims.h) * 100;
      onClickPoint(x, y);
    },
    [onClickPoint, view]
  );

  const dims = getImgDims();

  return (
    // Wrapper: fixed height, centers the img, click target
    <div
      ref={wrapRef}
      className={`relative flex justify-center overflow-hidden select-none ${interactive ? "cursor-crosshair" : ""}`}
      style={{ height: typeof imgHeight === "number" ? `${imgHeight}px` : imgHeight }}
      onClick={interactive ? handleClick : undefined}
      data-testid={`body-svg-${view}`}
      onLoad={() => setRenderedHeight(wrapRef.current?.offsetHeight ?? 0)}
    >
      <img
        src={BODY_IMAGES[view]}
        alt="Тело"
        style={{ height: "100%", width: "auto" }}
        draggable={false}
      />

      {/* Pain point dots — positioned over the image using computed pixel offsets */}
      {dims && viewPoints.map((point) => {
        const wrapW = wrapRef.current?.offsetWidth ?? 0;
        const imgLeft = (wrapW - dims.w) / 2;

        const dotLeft = imgLeft + (point.x / 100) * dims.w;
        const dotTop  = (point.y / 100) * dims.h;

        const color = intensityColor(point.intensity);
        return (
          <div
            key={point.id}
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
      })}
    </div>
  );
}
