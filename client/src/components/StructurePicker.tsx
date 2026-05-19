import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import type { PainPoint, PainIntensity, PainType } from "@shared/schema";
import { allZones } from "@/data/anatomy";
import type { AnatomicalStructure } from "@/data/anatomy";

interface PendingPoint {
  x: number;
  y: number;
  view: "front" | "back" | "left" | "right";
  zoneId: string;
  zoneName: string;
}

interface StructurePickerProps {
  pending: PendingPoint;
  onSave: (point: PainPoint) => void;
  onCancel: () => void;
}

const PAIN_TYPES: { value: PainType; label: string; emoji: string }[] = [
  { value: "sharp", label: "Острая", emoji: "⚡" },
  { value: "aching", label: "Ноющая", emoji: "😣" },
  { value: "burning", label: "Жжение", emoji: "🔥" },
  { value: "throbbing", label: "Пульсирующая", emoji: "💓" },
  { value: "pressing", label: "Давящая", emoji: "🏋" },
  { value: "stabbing", label: "Колющая", emoji: "🗡" },
];

const TYPE_LABELS: Record<string, string> = {
  muscle: "Мышца",
  tendon: "Сухожилие",
  ligament: "Связка",
  organ: "Орган",
  nerve: "Нерв",
  bone: "Кость",
  joint: "Сустав",
};

const TYPE_COLORS: Record<string, string> = {
  muscle: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  tendon: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  ligament: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  organ: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  nerve: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  bone: "bg-stone-100 text-stone-700 dark:bg-stone-900/30 dark:text-stone-400",
  joint: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

function intensityColor(v: number) {
  if (v <= 3) return "text-green-500";
  if (v <= 6) return "text-yellow-500";
  return "text-red-500";
}

export function StructurePicker({ pending, onSave, onCancel }: StructurePickerProps) {
  const [intensity, setIntensity] = useState<PainIntensity>(5);
  const [painType, setPainType] = useState<PainType>("aching");
  const [selectedStructures, setSelectedStructures] = useState<string[]>([]);
  const [note, setNote] = useState("");

  const zone = allZones.find((z) => z.id === pending.zoneId);
  const structures: AnatomicalStructure[] = zone?.structures ?? [];

  const toggleStructure = (name: string) => {
    setSelectedStructures((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  const handleSave = () => {
    // Use polygon centroid as dot position (so the marker appears on the correct zone)
    let dotX = pending.x;
    let dotY = pending.y;
    if (zone && zone.polygon.length > 0) {
      dotX = zone.polygon.reduce((s, p) => s + p[0], 0) / zone.polygon.length;
      dotY = zone.polygon.reduce((s, p) => s + p[1], 0) / zone.polygon.length;
    }
    const point: PainPoint = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      view: pending.view,
      x: dotX,
      y: dotY,
      intensity,
      painType,
      zoneId: pending.zoneId,
      zoneName: pending.zoneName,
      structures: selectedStructures,
      note,
    };
    onSave(point);
  };

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-lg bg-background rounded-t-2xl shadow-2xl flex flex-col max-h-[88vh]"
        data-testid="structure-picker"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        <div className="px-4 pb-2 border-b border-border">
          <h2 className="font-semibold text-base">{pending.zoneName}</h2>
          <p className="text-xs text-muted-foreground">Уточните боль</p>
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-3 flex flex-col gap-5">
          {/* Intensity slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Интенсивность боли</span>
              <span className={`text-xl font-bold ${intensityColor(intensity)}`}>
                {intensity}/10
              </span>
            </div>
            <Slider
              min={1}
              max={10}
              step={1}
              value={[intensity]}
              onValueChange={([v]) => setIntensity(v as PainIntensity)}
              data-testid="intensity-slider"
              className="py-1"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Слабая</span>
              <span>Умеренная</span>
              <span>Сильная</span>
            </div>
          </div>

          {/* Pain type */}
          <div>
            <span className="text-sm font-medium mb-2 block">Тип боли</span>
            <div className="grid grid-cols-3 gap-2">
              {PAIN_TYPES.map(({ value, label, emoji }) => (
                <button
                  key={value}
                  onClick={() => setPainType(value)}
                  data-testid={`pain-type-${value}`}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-medium transition-all ${
                    painType === value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/40 text-muted-foreground"
                  }`}
                >
                  <span className="text-lg">{emoji}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Anatomical structures */}
          <div>
            <span className="text-sm font-medium mb-2 block">
              Анатомические структуры
              <span className="text-xs text-muted-foreground font-normal ml-1">(можно выбрать несколько)</span>
            </span>
            {structures.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {structures.map((s) => {
                  const isSelected = selectedStructures.includes(s.name);
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleStructure(s.name)}
                      data-testid={`structure-${s.id}`}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : `border-border ${TYPE_COLORS[s.type] ?? ""}`
                      }`}
                    >
                      <span className="text-[10px] opacity-70 uppercase tracking-wide">
                        {TYPE_LABELS[s.type] ?? s.type}
                      </span>
                      {s.name}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                Точное место не определено — зона сохранена как: <strong>{pending.zoneName}</strong>
              </p>
            )}
          </div>

          {/* Note */}
          <div>
            <span className="text-sm font-medium mb-1.5 block">Заметка (необязательно)</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Когда началась, с чем связана..."
              rows={2}
              data-testid="point-note"
              className="w-full text-sm rounded-lg border border-border bg-muted/30 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-4 py-4 border-t border-border">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            data-testid="cancel-structure"
          >
            Отмена
          </Button>
          <Button
            className="flex-1"
            onClick={handleSave}
            data-testid="save-structure"
          >
            Добавить точку
          </Button>
        </div>
      </div>
    </div>
  );
}
