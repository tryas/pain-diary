import { useState, useCallback } from "react";
import { BodySvg } from "./BodySvg";
import { StructurePicker } from "./StructurePicker";
import type { BodyView, PainPoint } from "@shared/schema";
import { findZoneAtPoint } from "@/data/anatomy";
import { Button } from "@/components/ui/button";

interface BodyMapProps {
  painPoints: PainPoint[];
  onChange: (points: PainPoint[]) => void;
  readOnly?: boolean;
}

const VIEWS: BodyView[] = ["front", "back", "left", "right"];
const VIEW_LABELS: Record<BodyView, string> = {
  front: "Спереди",
  back: "Сзади",
  left: "Слева",
  right: "Справа",
};

interface PendingPoint {
  x: number;
  y: number;
  view: BodyView;
  zoneId: string;
  zoneName: string;
}

export function BodyMap({ painPoints, onChange, readOnly = false }: BodyMapProps) {
  const [activeView, setActiveView] = useState<BodyView>("front");
  const [pendingPoint, setPendingPoint] = useState<PendingPoint | null>(null);

  const handleBodyClick = useCallback(
    (x: number, y: number) => {
      if (readOnly) return;
      const zone = findZoneAtPoint(x, y, activeView);
      setPendingPoint({
        x,
        y,
        view: activeView,
        zoneId: zone?.id ?? `${activeView}-unknown`,
        zoneName: zone?.name ?? getRegionName(x, y),
      });
    },
    [activeView, readOnly]
  );

  const handleStructureSave = useCallback(
    (point: PainPoint) => {
      onChange([...painPoints, point]);
      setPendingPoint(null);
    },
    [painPoints, onChange]
  );

  const handleRemovePoint = useCallback(
    (id: string) => {
      onChange(painPoints.filter((p) => p.id !== id));
    },
    [painPoints, onChange]
  );

  return (
    <div className="flex flex-col gap-3">
      {/* View selector */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg">
        {VIEWS.map((v) => (
          <button
            key={v}
            onClick={() => setActiveView(v)}
            data-testid={`view-tab-${v}`}
            className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
              activeView === v
                ? "bg-background shadow text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {VIEW_LABELS[v]}
          </button>
        ))}
      </div>

      {/* Body SVG */}
      <div className="relative">
        <div className="flex justify-center">
          <div className="w-full max-w-[260px]" style={{ aspectRatio: "270 / 585" }}>
            <BodySvg
              view={activeView}
              painPoints={painPoints}
              onClickPoint={!readOnly ? handleBodyClick : undefined}
              interactive={!readOnly}
            />
          </div>
        </div>
        {!readOnly && (
          <p className="text-center text-xs text-muted-foreground mt-1">
            Нажмите на место боли
          </p>
        )}
      </div>

      {/* Pain point list for current view */}
      {painPoints.filter((p) => p.view === activeView).length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">Отмеченные точки:</span>
          {painPoints
            .filter((p) => p.view === activeView)
            .map((point) => (
              <div
                key={point.id}
                className="flex items-start gap-2 p-2 bg-muted/40 rounded-lg border border-border/30"
                data-testid={`pain-point-item-${point.id}`}
              >
                <div
                  className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0"
                  style={{ backgroundColor: intensityColor(point.intensity) }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium leading-tight">{point.zoneName}</div>
                  {point.structures.length > 0 && (
                    <div className="text-xs text-muted-foreground mt-0.5 leading-tight">
                      {point.structures.slice(0, 2).join(", ")}
                      {point.structures.length > 2 && ` +${point.structures.length - 2}`}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      Интенсивность: <strong>{point.intensity}/10</strong>
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {PAIN_TYPE_LABELS[point.painType as keyof typeof PAIN_TYPE_LABELS] ?? point.painType}
                    </span>
                  </div>
                </div>
                {!readOnly && (
                  <button
                    onClick={() => handleRemovePoint(point.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors text-xs"
                    data-testid={`remove-point-${point.id}`}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
        </div>
      )}

      {/* Structure picker dialog */}
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
  sharp: "Острая",
  aching: "Ноющая",
  burning: "Жжение",
  throbbing: "Пульсирующая",
  pressing: "Давящая",
  stabbing: "Колющая",
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
