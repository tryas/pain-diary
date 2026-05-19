import { useState, useRef, useEffect, useCallback } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, getDay, setHours, setMinutes, getHours, getMinutes } from "date-fns";
import { ru } from "date-fns/locale";
import { Calendar, Clock, ChevronLeft, ChevronRight, X } from "lucide-react";

interface Props {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
}

// ─── Analog Clock ────────────────────────────────────────────────────────────
function AnalogClock({ date, onChange }: { date: Date; onChange: (d: Date) => void }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef<"hour" | "minute" | null>(null);

  const hours = getHours(date);
  const minutes = getMinutes(date);

  const hourAngle = ((hours % 12) / 12) * 360 + (minutes / 60) * 30;
  const minuteAngle = (minutes / 60) * 360;

  const angleToPoint = (angle: number, r: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: 100 + r * Math.cos(rad), y: 100 + r * Math.sin(rad) };
  };

  const hourTip = angleToPoint(hourAngle, 52);
  const minuteTip = angleToPoint(minuteAngle, 70);

  const getAngleFromEvent = (e: React.PointerEvent | PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return 0;
    const rect = svg.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    let angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (angle < 0) angle += 360;
    return angle;
  };

  const handlePointerDown = (e: React.PointerEvent, type: "hour" | "minute") => {
    e.preventDefault();
    dragging.current = type;
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!dragging.current) return;
    const angle = getAngleFromEvent(e);
    if (dragging.current === "hour") {
      const h = Math.round((angle / 360) * 12) % 12;
      const newH = hours >= 12 ? h + 12 : h;
      onChange(setHours(date, newH));
    } else {
      const m = Math.round((angle / 360) * 60) % 60;
      onChange(setMinutes(date, m));
    }
  }, [date, hours, onChange]);

  const handlePointerUp = useCallback(() => {
    dragging.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  // Hour labels
  const hourLabels = Array.from({ length: 12 }, (_, i) => {
    const angle = ((i + 1) / 12) * 360;
    const p = angleToPoint(angle, 80);
    return { label: i + 1, ...p };
  });

  // Minute ticks
  const minuteTicks = Array.from({ length: 60 }, (_, i) => {
    const a = (i / 60) * 360;
    const inner = i % 5 === 0 ? 88 : 92;
    const outer = 96;
    const p1 = angleToPoint(a, inner);
    const p2 = angleToPoint(a, outer);
    return { p1, p2, major: i % 5 === 0 };
  });

  return (
    <div className="flex flex-col items-center gap-3">
      {/* AM/PM toggle */}
      <div className="flex gap-2 text-sm">
        <button
          onClick={() => onChange(setHours(date, hours < 12 ? hours : hours - 12))}
          className={`px-4 py-1.5 rounded-full border font-medium transition-colors ${hours < 12 ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}
        >
          AM
        </button>
        <button
          onClick={() => onChange(setHours(date, hours >= 12 ? hours : hours + 12))}
          className={`px-4 py-1.5 rounded-full border font-medium transition-colors ${hours >= 12 ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}
        >
          PM
        </button>
      </div>

      {/* Time display */}
      <div className="text-3xl font-mono font-bold tracking-widest text-foreground">
        {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}
      </div>

      {/* SVG Clock face */}
      <svg ref={svgRef} viewBox="0 0 200 200" className="w-52 h-52 select-none touch-none">
        {/* Face */}
        <circle cx="100" cy="100" r="98" fill="var(--background)" stroke="var(--border)" strokeWidth="1.5" />
        <circle cx="100" cy="100" r="92" fill="hsl(var(--muted)/0.3)" />

        {/* Minute ticks */}
        {minuteTicks.map((t, i) => (
          <line
            key={i}
            x1={t.p1.x} y1={t.p1.y}
            x2={t.p2.x} y2={t.p2.y}
            stroke={t.major ? "hsl(var(--foreground)/0.4)" : "hsl(var(--foreground)/0.15)"}
            strokeWidth={t.major ? 1.5 : 0.8}
          />
        ))}

        {/* Hour labels */}
        {hourLabels.map((h) => (
          <text
            key={h.label}
            x={h.x} y={h.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="11"
            fontWeight="600"
            fill="hsl(var(--foreground)/0.7)"
          >
            {h.label}
          </text>
        ))}

        {/* Hour hand */}
        <line
          x1="100" y1="100"
          x2={hourTip.x} y2={hourTip.y}
          stroke="hsl(var(--foreground))"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Minute hand */}
        <line
          x1="100" y1="100"
          x2={minuteTip.x} y2={minuteTip.y}
          stroke="hsl(var(--primary))"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Center dot */}
        <circle cx="100" cy="100" r="4" fill="hsl(var(--foreground))" />

        {/* Hour handle (draggable) */}
        <circle
          cx={hourTip.x} cy={hourTip.y} r="10"
          fill="hsl(var(--foreground))"
          opacity="0.15"
          style={{ cursor: "grab" }}
          onPointerDown={(e) => handlePointerDown(e, "hour")}
        />
        <circle
          cx={hourTip.x} cy={hourTip.y} r="5"
          fill="hsl(var(--foreground))"
          style={{ cursor: "grab" }}
          onPointerDown={(e) => handlePointerDown(e, "hour")}
        />

        {/* Minute handle (draggable) */}
        <circle
          cx={minuteTip.x} cy={minuteTip.y} r="10"
          fill="hsl(var(--primary))"
          opacity="0.2"
          style={{ cursor: "grab" }}
          onPointerDown={(e) => handlePointerDown(e, "minute")}
        />
        <circle
          cx={minuteTip.x} cy={minuteTip.y} r="5"
          fill="hsl(var(--primary))"
          style={{ cursor: "grab" }}
          onPointerDown={(e) => handlePointerDown(e, "minute")}
        />
      </svg>
      <p className="text-xs text-muted-foreground">Перетащите стрелку для выбора времени</p>
    </div>
  );
}

// ─── Calendar ────────────────────────────────────────────────────────────────
function CalendarPicker({ date, onChange }: { date: Date; onChange: (d: Date) => void }) {
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(date));

  const days = eachDayOfInterval({ start: startOfMonth(viewMonth), end: endOfMonth(viewMonth) });
  const startDow = (getDay(startOfMonth(viewMonth)) + 6) % 7; // Mon=0

  const selectDay = (d: Date) => {
    const newDate = setMinutes(setHours(d, getHours(date)), getMinutes(date));
    onChange(newDate);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Month nav */}
      <div className="flex items-center justify-between px-1">
        <button onClick={() => setViewMonth(subMonths(viewMonth, 1))} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold capitalize">
          {format(viewMonth, "LLLL yyyy", { locale: ru })}
        </span>
        <button onClick={() => setViewMonth(addMonths(viewMonth, 1))} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 text-center">
        {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((d) => (
          <span key={d} className="text-xs font-medium text-muted-foreground py-1">{d}</span>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 text-center gap-y-0.5">
        {Array.from({ length: startDow }).map((_, i) => <div key={`e${i}`} />)}
        {days.map((d) => {
          const selected = isSameDay(d, date);
          const inMonth = isSameMonth(d, viewMonth);
          const isToday = isSameDay(d, new Date());
          return (
            <button
              key={d.toISOString()}
              onClick={() => selectDay(d)}
              className={`w-9 h-9 mx-auto rounded-full text-sm font-medium transition-colors
                ${selected ? "bg-primary text-primary-foreground" :
                  isToday ? "text-primary font-bold border border-primary/40" :
                    inMonth ? "hover:bg-muted text-foreground" : "text-muted-foreground/40"}`}
            >
              {format(d, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── DateTimePicker ───────────────────────────────────────────────────────────
type Tab = "calendar" | "clock";

export function DateTimePicker({ value, onChange, label }: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("calendar");

  return (
    <>
      {/* Trigger button */}
      <div className="flex flex-col gap-1">
        {label && <span className="text-xs font-medium text-muted-foreground">{label}</span>}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-left hover:border-primary/50 transition-colors"
        >
          <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="flex-1">{format(value, "d MMMM yyyy", { locale: ru })}</span>
          <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="font-mono">{format(value, "HH:mm")}</span>
        </button>
      </div>

      {/* Bottom sheet */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* Sheet */}
          <div className="relative bg-background rounded-t-3xl shadow-2xl pb-safe-bottom max-h-[92vh] overflow-y-auto">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <span className="font-semibold text-base">Дата и время</span>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab switcher */}
            <div className="flex gap-1 mx-5 mt-4 p-1 bg-muted/40 rounded-xl">
              <button
                onClick={() => setTab("calendar")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "calendar" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
              >
                <Calendar className="w-3.5 h-3.5" /> Дата
              </button>
              <button
                onClick={() => setTab("clock")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "clock" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
              >
                <Clock className="w-3.5 h-3.5" /> Время
              </button>
            </div>

            {/* Content */}
            <div className="px-5 py-4">
              {tab === "calendar" ? (
                <CalendarPicker date={value} onChange={onChange} />
              ) : (
                <AnalogClock date={value} onChange={onChange} />
              )}
            </div>

            {/* Confirm */}
            <div className="px-5 pb-6 pt-2">
              <button
                onClick={() => setOpen(false)}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
              >
                Готово — {format(value, "d MMMM yyyy, HH:mm", { locale: ru })}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
