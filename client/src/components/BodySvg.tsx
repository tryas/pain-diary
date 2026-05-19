import { useRef, useCallback, useState, useEffect } from "react";
import type { BodyView, PainPoint } from "@shared/schema";
import { getZonesForView, findZoneAtPoint, pointInPolygon } from "@/data/anatomy";
import type { AnatomicalZone } from "@/data/anatomy";

// Diagrams from medical reference (Russian anatomical labels)
import diagramFront from "@assets/diagram-front.png";
import diagramBack  from "@assets/diagram-back.png";

// Fallback: real-photo body images for side views
import bodyLeft  from "@assets/body-left.jpg";
import bodyRight from "@assets/body-right.jpg";

interface BodySvgProps {
  view: BodyView;
  painPoints: PainPoint[];
  onClickPoint?: (x: number, y: number) => void;
  interactive?: boolean;
  imgHeight?: number | string;
}

// Natural dimensions of each diagram/image (used to set correct SVG viewBox)
const DIAGRAM_DIMS: Record<BodyView, { w: number; h: number }> = {
  front: { w: 530, h: 770 },
  back:  { w: 547, h: 799 },
  left:  { w: 434, h: 899 },
  right: { w: 433, h: 885 },
};

const BODY_IMAGES: Record<BodyView, string> = {
  front: diagramFront,
  back:  diagramBack,
  left:  bodyLeft,
  right: bodyRight,
};

const intensityColor = (intensity: number) => {
  if (intensity <= 3) return "#22c55e";
  if (intensity <= 6) return "#f59e0b";
  return "#ef4444";
};

// Highlight colour for zone hover/active
const HOVER_FILL   = "rgba(59,130,246,0.25)";
const HOVER_STROKE = "rgba(59,130,246,0.85)";
const ACTIVE_FILL  = "rgba(239,68,68,0.22)";
const ACTIVE_STROKE= "rgba(239,68,68,0.9)";

export function BodySvg({
  view,
  painPoints,
  onClickPoint,
  interactive = true,
  imgHeight = 340,
}: BodySvgProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [flashZone,   setFlashZone]   = useState<string | null>(null);
  const [containerW,  setContainerW]  = useState(0);

  const viewPoints = painPoints.filter(p => p.view === view);
  const zones = getZonesForView(view);
  const dims  = DIAGRAM_DIMS[view];

  // Track container width for responsive dot positioning
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setContainerW(el.clientWidth));
    ro.observe(el);
    setContainerW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const heightStyle = typeof imgHeight === "number" ? `${imgHeight}px` : imgHeight;

  // Convert % coords → SVG units (viewBox = 0 0 100 100)
  const ptsToStr = (poly: [number,number][]) =>
    poly.map(([x,y]) => `${x},${y}`).join(" ");

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!interactive) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width)  * 100;
    const y = ((e.clientY - rect.top)  / rect.height) * 100;
    const z = zones.find(z => pointInPolygon(x, y, z.polygon));
    setHoveredZone(z?.id ?? null);
  }, [zones, interactive]);

  const handleMouseLeave = useCallback(() => {
    setHoveredZone(null);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!onClickPoint) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width)  * 100;
    const y = ((e.clientY - rect.top)  / rect.height) * 100;

    const zone = findZoneAtPoint(x, y, view);
    if (zone) {
      setFlashZone(zone.id);
      setTimeout(() => setFlashZone(null), 600);
    }
    onClickPoint(x, y);
  }, [onClickPoint, view]);

  // Compute rendered image height for dot overlay
  const imgAspect = dims.h / dims.w;
  // The SVG fills the container width, height is auto from aspect ratio
  const renderedH = containerW > 0 ? containerW * imgAspect : 0;

  return (
    <div
      ref={containerRef}
      className="relative select-none w-full"
      data-testid={`body-svg-${view}`}
    >
      {/* SVG overlay on top of diagram image */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full block"
        style={{
          height: heightStyle,
          backgroundImage: `url(${BODY_IMAGES[view]})`,
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
          cursor: interactive ? "crosshair" : "default",
        }}
        onMouseMove={interactive ? handleMouseMove : undefined}
        onMouseLeave={interactive ? handleMouseLeave : undefined}
        onClick={interactive ? handleClick : undefined}
      >
        {/* Zone polygons */}
        {zones.map(zone => {
          const isHover  = zone.id === hoveredZone;
          const isFlash  = zone.id === flashZone;
          const hasPain  = viewPoints.some(p => p.zoneId === zone.id);
          return (
            <polygon
              key={zone.id}
              points={ptsToStr(zone.polygon)}
              fill={
                isFlash  ? ACTIVE_FILL  :
                isHover  ? HOVER_FILL   :
                hasPain  ? "rgba(239,68,68,0.12)" :
                "transparent"
              }
              stroke={
                isFlash  ? ACTIVE_STROKE  :
                isHover  ? HOVER_STROKE   :
                hasPain  ? "rgba(239,68,68,0.5)" :
                "transparent"
              }
              strokeWidth={isHover || isFlash ? "0.4" : "0.2"}
              style={{ transition: "fill 0.1s, stroke 0.1s" }}
            />
          );
        })}

        {/* Hover zone label */}
        {hoveredZone && (() => {
          const z = zones.find(z => z.id === hoveredZone);
          if (!z) return null;
          const cx = z.polygon.reduce((s,p) => s+p[0], 0) / z.polygon.length;
          const cy = z.polygon.reduce((s,p) => s+p[1], 0) / z.polygon.length;
          // Clamp label inside viewbox
          const lx = Math.max(2, Math.min(78, cx));
          const ly = Math.max(4, Math.min(96, cy));
          return (
            <g>
              <rect
                x={lx - 0.5} y={ly - 3.5}
                width={Math.min(z.name.length * 1.55 + 1, 40)} height={4.5}
                rx="0.8" ry="0.8"
                fill="rgba(0,0,0,0.72)"
              />
              <text
                x={lx + 0.2} y={ly - 0.2}
                fontSize="3.2"
                fill="white"
                fontFamily="system-ui,sans-serif"
                style={{ pointerEvents: "none" }}
              >
                {z.name}
              </text>
            </g>
          );
        })()}

        {/* Pain point dots */}
        {viewPoints.map(point => (
          <g key={point.id}>
            <circle
              cx={point.x} cy={point.y} r="2.8"
              fill={intensityColor(point.intensity)}
              stroke="white" strokeWidth="0.6"
              opacity="0.9"
            />
            <text
              x={point.x} y={point.y + 1.1}
              fontSize="2.8" textAnchor="middle"
              fill="white" fontWeight="bold"
              fontFamily="system-ui,sans-serif"
              style={{ pointerEvents: "none" }}
            >
              {point.intensity}
            </text>
          </g>
        ))}
      </svg>


    </div>
  );
}
