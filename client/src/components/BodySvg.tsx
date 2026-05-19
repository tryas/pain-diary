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
  const viewPoints = painPoints.filter((p) => p.view === view);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onClickPoint) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onClickPoint(x, y);
  };

  return (
    <div
      className={`relative h-full select-none ${interactive ? "cursor-crosshair" : ""}`}
      onClick={interactive ? handleClick : undefined}
      data-testid={`body-svg-${view}`}
    >
      <img
        src={BODY_IMAGES[view]}
        alt={`Тело`}
        className="h-full w-auto object-contain"
        draggable={false}
      />

      {viewPoints.map((point) => {
        const color = intensityColor(point.intensity);
        return (
          <div
            key={point.id}
            className="absolute"
            style={{
              left: `${point.x}%`,
              top: `${point.y}%`,
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
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
