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

  const handleImgClick = useCallback(
    (e: React.MouseEvent<HTMLImageElement>) => {
      if (!onClickPoint) return;
      const img = e.currentTarget;

      // offsetX/offsetY are relative to the element itself and are NOT affected
      // by browser zoom — unlike clientX - getBoundingClientRect().left
      const offsetX = e.nativeEvent.offsetX;
      const offsetY = e.nativeEvent.offsetY;
      const x = (offsetX / img.offsetWidth) * 100;
      const y = (offsetY / img.offsetHeight) * 100;

      onClickPoint(x, y);
    },
    [onClickPoint]
  );

  const heightStyle = typeof imgHeight === "number" ? `${imgHeight}px` : imgHeight;

  return (
    <div className="relative select-none" data-testid={`body-svg-${view}`}>
      <div
        className="flex justify-center overflow-hidden"
        style={{ height: heightStyle }}
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

        {viewPoints.map((point) => (
          <PointDot key={point.id} point={point} color={intensityColor(point.intensity)} imgRef={imgRef} />
        ))}
      </div>

    </div>
  );
}

function PointDot({
  point, color, imgRef,
}: {
  point: PainPoint; color: string; imgRef: React.RefObject<HTMLImageElement>;
}) {
  const img = imgRef.current;
  if (!img) return null;
  const rect = img.getBoundingClientRect();
  const parentRect = img.parentElement?.getBoundingClientRect();
  if (!parentRect) return null;
  const dotLeft = (rect.left - parentRect.left) + (point.x / 100) * rect.width;
  const dotTop  = (rect.top  - parentRect.top)  + (point.y / 100) * rect.height;
  return (
    <div className="absolute pointer-events-none"
      style={{ left: dotLeft, top: dotTop, transform: "translate(-50%, -50%)" }}>
      <div className="absolute rounded-full animate-ping"
        style={{ width:22, height:22, left:"50%", top:"50%",
          transform:"translate(-50%,-50%)", backgroundColor:color, opacity:0.35 }} />
      <div className="relative flex items-center justify-center rounded-full font-bold text-white shadow-lg"
        style={{ width:24, height:24, backgroundColor:color, border:"2px solid white", fontSize:10 }}>
        {point.intensity}
      </div>
    </div>
  );
}
