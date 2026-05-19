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

export function BodySvg({ view, painPoints, onClickPoint, interactive = true }: BodySvgProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  // Track image natural size to detect when it's rendered
  const [imgLoaded, setImgLoaded] = useState(false);
  const viewPoints = painPoints.filter((p) => p.view === view);

  const handleClick = useCallback((e: React.MouseEvent<HTMLImageElement>) => {
    if (!onClickPoint) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    onClickPoint(x, y);
  }, [onClickPoint]);

  return (
    // Outer container: full height, centers the image horizontally
    <div className="relative h-full flex justify-center">
      {/* Image: h-full, w-auto — its actual rendered rect is what we measure */}
      <img
        ref={imgRef}
        src={BODY_IMAGES[view]}
        alt="Тело"
        className={`h-full w-auto object-contain select-none ${interactive ? "cursor-crosshair" : ""}`}
        draggable={false}
        onLoad={() => setImgLoaded(true)}
        onClick={interactive ? handleClick : undefined}
        data-testid={`body-svg-${view}`}
      />

      {/* Pain point dots — positioned relative to the outer container,
          but coordinates are in image space, so we convert using img rect */}
      {imgLoaded && viewPoints.map((point) => {
        const imgEl = imgRef.current;
        if (!imgEl) return null;
        const containerEl = imgEl.parentElement;
        if (!containerEl) return null;

        const imgRect = imgEl.getBoundingClientRect();
        const containerRect = containerEl.getBoundingClientRect();

        // Image offset within the container (in %)
        const imgLeftPct = ((imgRect.left - containerRect.left) / containerRect.width) * 100;
        const imgTopPct = ((imgRect.top - containerRect.top) / containerRect.height) * 100;
        const imgWPct = (imgRect.width / containerRect.width) * 100;
        const imgHPct = (imgRect.height / containerRect.height) * 100;

        const dotLeftPct = imgLeftPct + (point.x / 100) * imgWPct;
        const dotTopPct = imgTopPct + (point.y / 100) * imgHPct;

        const color = intensityColor(point.intensity);
        return (
          <div
            key={point.id}
            className="absolute pointer-events-none"
            style={{
              left: `${dotLeftPct}%`,
              top: `${dotTopPct}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {/* Pulse ring */}
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
            {/* Badge */}
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
