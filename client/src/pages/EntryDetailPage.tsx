import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { BodyMap } from "@/components/BodyMap";
import { TreatmentSection } from "@/components/TreatmentSection";
import { AttachmentUpload } from "@/components/AttachmentUpload";
import { DynamicsSection } from "@/components/DynamicsSection";
import { DateTimePicker } from "@/components/DateTimePicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { PainEntry, PainPoint } from "@shared/schema";
import { ArrowLeft, Trash2, Edit2, Save, X, Activity, Stethoscope, Paperclip, TrendingUp } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

const PAIN_TYPE_LABELS: Record<string, string> = {
  sharp: "Острая", aching: "Ноющая", burning: "Жжение",
  throbbing: "Пульсирующая", pressing: "Давящая", stabbing: "Колющая",
};
const VIEW_LABELS: Record<string, string> = {
  front: "спереди", back: "сзади", left: "слева", right: "справа",
};
const intensityColor = (v: number) => v <= 3 ? "#22c55e" : v <= 6 ? "#f59e0b" : "#ef4444";

function getPainPoints(entry: PainEntry): PainPoint[] {
  try { return JSON.parse(entry.painPoints); } catch { return []; }
}

type Tab = "pain" | "dynamics" | "treatment" | "files";

const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: "pain", label: "Боль", Icon: Activity },
  { id: "dynamics", label: "Динамика", Icon: TrendingUp },
  { id: "treatment", label: "Лечение", Icon: Stethoscope },
  { id: "files", label: "Файлы", Icon: Paperclip },
];

export default function EntryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editPoints, setEditPoints] = useState<PainPoint[]>([]);
  const [editDate, setEditDate] = useState(() => new Date());
  const [activeTab, setActiveTab] = useState<Tab>("pain");

  const { data: entry, isLoading } = useQuery<PainEntry>({
    queryKey: ["/api/entries", parseInt(id)],
    queryFn: () => apiRequest("GET", `/api/entries/${id}`).then((r) => r.json()),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/entries/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      navigate("/");
      toast({ title: "Запись удалена" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => apiRequest("PATCH", `/api/entries/${id}`, {
      title: editTitle.trim() || "Запись без названия",
      date: editDate.toISOString(),
      notes: editNotes,
      painPoints: JSON.stringify(editPoints),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/entries", parseInt(id)] });
      setEditing(false);
      toast({ title: "Запись обновлена" });
    },
  });

  const startEditing = () => {
    if (!entry) return;
    setEditTitle(entry.title);
    setEditNotes(entry.notes ?? "");
    setEditPoints(getPainPoints(entry));
    try { setEditDate(new Date(entry.date)); } catch { setEditDate(new Date()); }
    setEditing(true);
  };

  if (isLoading) return (
    <div className="max-w-lg mx-auto px-4 py-4 flex flex-col gap-4">
      <Skeleton className="h-12 rounded-xl" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );

  if (!entry) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <p className="text-muted-foreground">Запись не найдена</p>
      <Button className="mt-4" onClick={() => navigate("/")}>Назад</Button>
    </div>
  );

  const points = getPainPoints(entry);
  const date = parseISO(entry.date);
  const numId = parseInt(id);

  // For DynamicsSection: initial values from first pain point if available
  const firstPoint = points[0];

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border/40 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate("/")} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center hover:text-foreground text-muted-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold truncate">{entry.title}</h1>
          <p className="text-xs text-muted-foreground">{format(date, "d MMMM yyyy, HH:mm", { locale: ru })}</p>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button onClick={() => setEditing(false)} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground"><X className="w-4 h-4" /></button>
              <button onClick={() => updateMutation.mutate()} className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground"><Save className="w-4 h-4" /></button>
            </>
          ) : (
            <>
              <button onClick={startEditing} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => deleteMutation.mutate()} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      {!editing && (
        <div className="flex border-b border-border/40 bg-background overflow-x-auto">
          {TABS.map(({ id: tabId, label, Icon }) => (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              className={`flex items-center gap-1.5 px-3 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                activeTab === tabId
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 px-4 py-3 flex flex-col gap-3">
        {/* Editing mode */}
        {editing && (
          <>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Название</label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="rounded-xl" />
            </div>
            <DateTimePicker value={editDate} onChange={setEditDate} label="Дата и время" />
            <div>
              <label className="text-sm font-medium mb-2 block">Карта тела</label>
              <BodyMap painPoints={editPoints} onChange={setEditPoints} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Заметки</label>
              <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={3}
                className="w-full text-sm rounded-xl border border-border bg-muted/20 px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Фото и документы</label>
              <AttachmentUpload entryId={numId} />
            </div>
            <Button className="w-full rounded-xl py-5 text-base font-semibold" onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Сохранение..." : "Сохранить изменения"}
            </Button>
          </>
        )}

        {/* Tab: Боль */}
        {!editing && activeTab === "pain" && (
          <>
            <BodyMap painPoints={points} onChange={() => {}} readOnly />

            {points.length > 0 && (
              <div className="flex flex-col gap-3">
                <h2 className="text-sm font-semibold">Детали боли</h2>
                {points.map((point) => (
                  <div key={point.id} className="bg-card rounded-2xl border border-border/60 p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-base flex-shrink-0" style={{ backgroundColor: intensityColor(point.intensity) }}>{point.intensity}</div>
                      <div>
                        <p className="font-semibold text-sm">{point.zoneName}</p>
                        <p className="text-xs text-muted-foreground">{PAIN_TYPE_LABELS[point.painType] ?? point.painType} · {VIEW_LABELS[point.view] ?? point.view}</p>
                      </div>
                    </div>
                    {point.structures.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {point.structures.map((s) => <span key={s} className="text-xs px-2 py-1 rounded-full bg-muted border border-border/40">{s}</span>)}
                      </div>
                    )}
                    {point.note && <p className="text-xs text-muted-foreground italic border-t border-border/30 pt-2">{point.note}</p>}
                  </div>
                ))}
              </div>
            )}

            {entry.notes ? (
              <div className="bg-muted/30 rounded-2xl p-4 border border-border/40">
                <p className="text-xs font-semibold text-muted-foreground mb-1">Заметки</p>
                <p className="text-sm">{entry.notes}</p>
              </div>
            ) : null}
          </>
        )}

        {/* Tab: Динамика */}
        {!editing && activeTab === "dynamics" && (
          <DynamicsSection
            entryId={numId}
            initialIntensity={firstPoint?.intensity ?? 5}
            initialPainType={firstPoint?.painType ?? "aching"}
          />
        )}

        {/* Tab: Лечение */}
        {!editing && activeTab === "treatment" && (
          <TreatmentSection entryId={numId} />
        )}

        {/* Tab: Файлы */}
        {!editing && activeTab === "files" && (
          <AttachmentUpload entryId={numId} />
        )}

        <div className="h-4" />
      </div>
    </div>
  );
}
