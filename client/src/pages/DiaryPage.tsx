import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { PainEntry, PainPoint } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, ChevronRight, Activity } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

const intensityColor = (v: number) => {
  if (v <= 3) return "#22c55e";
  if (v <= 6) return "#f59e0b";
  return "#ef4444";
};

function getPainPoints(entry: PainEntry): PainPoint[] {
  try { return JSON.parse(entry.painPoints); } catch { return []; }
}

function EntryCard({ entry, onDelete }: { entry: PainEntry; onDelete: (id: number) => void }) {
  const points = getPainPoints(entry);
  const maxIntensity = points.length > 0 ? Math.max(...points.map((p) => p.intensity)) : 0;
  const date = parseISO(entry.date);

  return (
    <div className="bg-card rounded-2xl border border-border/60 overflow-hidden shadow-sm" data-testid={`entry-card-${entry.id}`}>
      <Link href={`/entry/${entry.id}`}>
        <div className="p-4 cursor-pointer hover:bg-muted/30 transition-colors">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-muted-foreground">
                  {format(date, "d MMMM yyyy, HH:mm", { locale: ru })}
                </span>
              </div>
              <h3 className="font-semibold text-sm leading-tight mb-2 truncate">{entry.title}</h3>
              {points.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {points.slice(0, 4).map((p) => (
                    <span key={p.id} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-muted border border-border/40">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: intensityColor(p.intensity) }} />
                      {p.zoneName}
                    </span>
                  ))}
                  {points.length > 4 && <span className="text-xs text-muted-foreground px-1">+{points.length - 4}</span>}
                </div>
              ) : (
                <span className="text-xs text-muted-foreground italic">Нет отмеченных точек</span>
              )}
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              {maxIntensity > 0 && (
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm" style={{ backgroundColor: intensityColor(maxIntensity) }}>
                  {maxIntensity}
                </div>
              )}
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </Link>
      <div className="px-4 py-2 border-t border-border/30 bg-muted/20 flex justify-end">
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(entry.id); }}
          className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
          data-testid={`delete-entry-${entry.id}`}
        >
          <Trash2 className="w-3 h-3" />
          Удалить
        </button>
      </div>
    </div>
  );
}

export default function DiaryPage() {
  const { toast } = useToast();

  const { data: entries = [], isLoading, isError } = useQuery<PainEntry[]>({
    queryKey: ["/api/entries"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/entries/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      toast({ title: "Запись удалена" });
    },
  });

  const grouped = groupByDate(entries);

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border/40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <Activity className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight">Дневник болей</h1>
            <p className="text-xs text-muted-foreground leading-none">{pluralEntries(entries.length)}</p>
          </div>
        </div>
        <Link href="/new">
          <Button size="sm" className="rounded-xl gap-1.5" data-testid="new-entry-btn">
            <Plus className="w-4 h-4" />
            Новая
          </Button>
        </Link>
      </div>

      <div className="flex-1 px-4 py-4 flex flex-col gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
        ) : isError ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-4xl">⚠️</div>
            <div>
              <p className="font-semibold text-base">Нет связи с сервером</p>
              <p className="text-sm text-muted-foreground mt-1">Откройте приложение через ссылку в чате Perplexity</p>
            </div>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-4xl">🩺</div>
            <div>
              <p className="font-semibold text-base">Нет записей</p>
              <p className="text-sm text-muted-foreground mt-1">Нажмите «Новая», чтобы добавить первую запись</p>
            </div>
            <Link href="/new">
              <Button className="rounded-xl gap-2"><Plus className="w-4 h-4" />Добавить запись</Button>
            </Link>
          </div>
        ) : (
          Object.entries(grouped).map(([dateKey, dayEntries]) => (
            <div key={dateKey}>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{dateKey}</p>
              <div className="flex flex-col gap-3">
                {dayEntries.map((entry) => (
                  <EntryCard key={entry.id} entry={entry} onDelete={(id) => deleteMutation.mutate(id)} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function pluralEntries(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} запись`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} записи`;
  return `${n} записей`;
}

function groupByDate(entries: PainEntry[]): Record<string, PainEntry[]> {
  const groups: Record<string, PainEntry[]> = {};
  for (const entry of entries) {
    try {
      const key = format(parseISO(entry.date), "d MMMM yyyy", { locale: ru });
      if (!groups[key]) groups[key] = [];
      groups[key].push(entry);
    } catch {
      if (!groups["Неизвестная дата"]) groups["Неизвестная дата"] = [];
      groups["Неизвестная дата"].push(entry);
    }
  }
  return groups;
}
