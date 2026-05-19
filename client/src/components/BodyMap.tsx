import { useState, useCallback } from "react";
import { BodySvg } from "./BodySvg";
import { StructurePicker } from "./StructurePicker";
import type { BodyView, PainPoint } from "@shared/schema";
import { findZoneAtPoint } from "@/data/anatomy";

interface BodyMapProps {
  painPoints: PainPoint[];
  onChange: (points: PainPoint[]) => void;
  readOnly?: boolean;
}

const VIEWS: { id: BodyView; label: string }[] = [
  { id: "front", label: "Спереди" },
  { id: "back",  label: "Сзади"   },
  { id: "left",  label: "Слева"   },
  { id: "right", label: "Справа"  },
];

interface PendingPoint {
  x: number; y: number;
  view: BodyView; zoneId: string; zoneName: string;
}

export function BodyMap({ painPoints, onChange, readOnly = false }: BodyMapProps) {
  const [activeView, setActiveView] = useState<BodyView>("front");
  const [pendingPoint, setPendingPoint] = useState<PendingPoint | null>(null);

  const handleBodyClick = useCallback(
    (x: number, y: number) => {
      if (readOnly) return;
      const zone = findZoneAtPoint(x, y, activeView);
      setPendingPoint({
        x, y,
        view: activeView,
        zoneId: zone?.id ?? `${activeView}-unknown`,
        zoneName: zone?.name ?? getRegionName(x, y),
      });
    },
    [activeView, readOnly]
  );

  const handleStructureSave = useCallback(
    (point: PainPoint) => { onChange([...painPoints, point]); setPendingPoint(null); },
    [painPoints, onChange]
  );

  const handleRemovePoint = useCallback(
    (id: string) => { onChange(painPoints.filter((p) => p.id !== id)); },
    [painPoints, onChange]
  );

  return (
    <div className="flex flex-col gap-2">
      {/* View tabs — compact pill row */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg">
        {VIEWS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveView(id)}
            data-testid={`view-tab-${id}`}
            className={`flex-1 py-1 rounded-md text-xs font-medium transition-all ${
              activeView === id
                ? "bg-background shadow text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Body image */}
      <div className="relative">
        <BodySvg
          view={activeView}
          painPoints={painPoints}
          onClickPoint={!readOnly ? handleBodyClick : undefined}
          interactive={!readOnly}
          imgHeight="min(80vh, 600px)"
        />
        {!readOnly && (
          <p className="absolute bottom-1 left-0 right-0 text-center text-xs text-muted-foreground/60 pointer-events-none">
            Нажмите на место боли
          </p>
        )}
      </div>

      {/* Pain points for current view — compact chips */}
      {painPoints.filter((p) => p.view === activeView).length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Отмеченные точки:</span>
          {painPoints
            .filter((p) => p.view === activeView)
            .map((point) => (
              <div
                key={point.id}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-muted/40 rounded-lg border border-border/30"
                data-testid={`pain-point-item-${point.id}`}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: intensityColor(point.intensity) }}
                />
                <div className="flex-1 min-w-0 flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-medium">{point.zoneName}</span>
                  {point.structures.length > 0 && (
                    <span className="text-xs text-muted-foreground truncate">
                      {point.structures.slice(0, 2).join(", ")}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {point.intensity}/10 · {PAIN_TYPE_LABELS[point.painType as keyof typeof PAIN_TYPE_LABELS] ?? point.painType}
                  </span>
                </div>
                {!readOnly && (
                  <button
                    onClick={() => handleRemovePoint(point.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors text-xs flex-shrink-0 w-5 h-5 flex items-center justify-center"
                    data-testid={`remove-point-${point.id}`}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
        </div>
      )}

      {pendingPoint && (
        <StructurePicker
          pending={pendingPoint}
          onSave={handleStructureSave}
          onCancel={() => setPendingPoint(null)}
        />
      )}
    </div>
  );
}

const PAIN_TYPE_LABELS = {
  sharp: "Острая", aching: "Ноющая", burning: "Жжение",
  throbbing: "Пульсирующая", pressing: "Давящая", stabbing: "Колющая",
};

function intensityColor(intensity: number) {
  if (intensity <= 3) return "#22c55e";
  if (intensity <= 6) return "#f59e0b";
  return "#ef4444";
}

function getRegionName(x: number, y: number): string {
  if (y < 20) return "Голова";
  if (y < 35) return "Шея";
  if (y < 55) return "Плечо / Грудная клетка";
  if (y < 70) return "Грудная клетка / Верхняя спина";
  if (y < 85) return "Живот / Поясница";
  if (y < 100) return "Нижний живот / Таз";
  if (y < 120) return "Бедро";
  if (y < 140) return "Колено";
  if (y < 160) return "Голень";
  if (y < 170) return "Лодыжка";
  return "Стопа";
}
