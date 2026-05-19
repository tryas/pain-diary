import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Plus, Trash2, TrendingDown, TrendingUp, Minus as TrendFlat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "./DateTimePicker";
import type { PainSnapshot } from "@shared/schema";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";

const PAIN_TYPES = [
  { value: "sharp", label: "Острая" },
  { value: "aching", label: "Ноющая" },
  { value: "burning", label: "Жгучая" },
  { value: "throbbing", label: "Пульсирующая" },
  { value: "pressing", label: "Давящая" },
  { value: "stabbing", label: "Колющая" },
] as const;

const PAIN_TYPE_LABELS: Record<string, string> = Object.fromEntries(PAIN_TYPES.map(t => [t.value, t.label]));

function intensityColor(v: number) {
  if (v <= 3) return "#22c55e";
  if (v <= 6) return "#f59e0b";
  return "#ef4444";
}

function intensityBg(v: number) {
  if (v <= 3) return "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800";
  if (v <= 6) return "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800";
  return "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800";
}

// ─── Sparkline chart ──────────────────────────────────────────────────────────
function Sparkline({ data }: { data: PainSnapshot[] }) {
  if (data.length < 2) return null;
  const W = 280, H = 80, PAD = 10;
  const minV = 0, maxV = 10;
  const scaleX = (i: number) => PAD + (i / (data.length - 1)) * (W - PAD * 2);
  const scaleY = (v: number) => PAD + ((maxV - v) / (maxV - minV)) * (H - PAD * 2);

  const points = data.map((s, i) => ({ x: scaleX(i), y: scaleY(s.intensity), v: s.intensity }));
  const polyline = points.map(p => `${p.x},${p.y}`).join(" ");
  const areaPath = `M${points[0].x},${H} ` + points.map(p => `L${p.x},${p.y}`).join(" ") + ` L${points[points.length - 1].x},${H} Z`;

  return (
    <div className="bg-muted/20 rounded-2xl border border-border/60 p-4">
      <p className="text-xs font-medium text-muted-foreground mb-3">Динамика интенсивности</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 80 }}>
        <defs>
          <linearGradient id="spark-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Y grid lines */}
        {[2, 5, 8].map(v => (
          <line key={v} x1={PAD} y1={scaleY(v)} x2={W - PAD} y2={scaleY(v)}
            stroke="hsl(var(--border))" strokeWidth="0.8" strokeDasharray="3,3" />
        ))}
        {/* Area fill */}
        <path d={areaPath} fill="url(#spark-grad)" />
        {/* Line */}
        <polyline points={polyline} fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {/* Dots */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={intensityColor(p.v)} stroke="white" strokeWidth="1.5" />
        ))}
      </svg>
      {/* X axis dates */}
      <div className="flex justify-between mt-1">
        {[data[0], data[data.length - 1]].map((s, i) => (
          <span key={i} className="text-xs text-muted-foreground">
            {format(parseISO(s.date), "d MMM", { locale: ru })}
          </span>
        ))}
      </div>
    </div>
  );
}

interface Props {
  entryId: number;
  initialIntensity?: number;
  initialPainType?: string;
}

export function DynamicsSection({ entryId, initialIntensity = 5, initialPainType = "aching" }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [intensity, setIntensity] = useState(initialIntensity);
  const [painType, setPainType] = useState(initialPainType);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date());

  const { data: snapshots = [] } = useQuery<PainSnapshot[]>({
    queryKey: [`/api/entries/${entryId}/snapshots`],
    queryFn: () => fetch(`/api/entries/${entryId}/snapshots`).then(r => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      fetch(`/api/entries/${entryId}/snapshots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intensity, painType, note, date: date.toISOString() }),
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/entries/${entryId}/snapshots`] });
      setShowForm(false);
      setNote("");
      setDate(new Date());
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => fetch(`/api/snapshots/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/api/entries/${entryId}/snapshots`] }),
  });

  // Trend
  const trend = snapshots.length >= 2
    ? snapshots[snapshots.length - 1].intensity - snapshots[snapshots.length - 2].intensity
    : 0;
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : TrendFlat;
  const trendColor = trend > 0 ? "text-red-500" : trend < 0 ? "text-green-500" : "text-muted-foreground";

  return (
    <div className="flex flex-col gap-3">
      {/* Summary row */}
      {snapshots.length > 0 && (
        <div className="flex items-center gap-3 bg-muted/20 rounded-2xl border border-border/60 p-4">
          <div className="flex flex-col flex-1">
            <span className="text-xs text-muted-foreground">Текущая интенсивность</span>
            <span className="text-2xl font-bold">{snapshots[snapshots.length - 1].intensity}<span className="text-sm text-muted-foreground">/10</span></span>
            <span className="text-xs text-muted-foreground mt-0.5">{PAIN_TYPE_LABELS[snapshots[snapshots.length - 1].painType] ?? ""}</span>
          </div>
          {snapshots.length >= 2 && (
            <div className={`flex flex-col items-center gap-1 ${trendColor}`}>
              <TrendIcon className="w-6 h-6" />
              <span className="text-xs font-medium">{trend > 0 ? `+${trend}` : trend}</span>
            </div>
          )}
          <div className="flex flex-col items-end text-xs text-muted-foreground">
            <span>Замеров: {snapshots.length}</span>
            {snapshots.length >= 2 && (
              <span>Нач.: {snapshots[0].intensity}</span>
            )}
          </div>
        </div>
      )}

      {/* Sparkline */}
      <Sparkline data={snapshots} />

      {/* Snapshots list */}
      {snapshots.slice().reverse().map((s) => (
        <div key={s.id} className="bg-card rounded-2xl border border-border/60 p-3 flex items-start gap-3">
          {/* Intensity badge */}
          <div className={`flex-shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center text-base font-bold ${intensityBg(s.intensity)}`}>
            {s.intensity}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{PAIN_TYPE_LABELS[s.painType] ?? s.painType}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {format(parseISO(s.date), "d MMMM yyyy, HH:mm", { locale: ru })}
            </span>
            {s.note && <p className="text-xs text-muted-foreground mt-0.5">{s.note}</p>}
          </div>
          <button
            onClick={() => deleteMutation.mutate(s.id)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}

      {/* Add form */}
      {showForm ? (
        <div className="bg-muted/20 rounded-2xl border border-border/60 p-4 flex flex-col gap-4">
          <p className="text-sm font-semibold">Обновить состояние боли</p>

          {/* DateTimePicker */}
          <DateTimePicker value={date} onChange={setDate} label="Дата и время замера" />

          {/* Intensity slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-muted-foreground">Интенсивность</span>
              <span className={`text-sm font-bold px-2 py-0.5 rounded-full border ${intensityBg(intensity)}`}>{intensity}/10</span>
            </div>
            <input
              type="range" min={1} max={10} step={1}
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>1 — слабая</span><span>10 — нестерпимая</span>
            </div>
          </div>

          {/* Pain type */}
          <div>
            <span className="text-xs font-medium text-muted-foreground block mb-2">Характер боли</span>
            <div className="grid grid-cols-3 gap-2">
              {PAIN_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setPainType(value)}
                  className={`py-2 rounded-xl border text-xs font-medium transition-colors ${painType === value ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border/60 text-muted-foreground"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Заметка (необязательно)..."
            rows={2}
            className="w-full text-sm rounded-xl border border-border bg-muted/20 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
          />

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowForm(false)}>Отмена</Button>
            <Button className="flex-1 rounded-xl" onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
              {createMutation.isPending ? "..." : "Сохранить"}
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => { setIntensity(initialIntensity); setPainType(initialPainType); setShowForm(true); }}
          className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border/60 text-sm text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
        >
          <Plus className="w-4 h-4" />
          Обновить состояние боли
        </button>
      )}
    </div>
  );
}
