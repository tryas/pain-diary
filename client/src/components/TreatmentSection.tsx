import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Plus, Trash2, Pill, Dumbbell, Stethoscope, MoreHorizontal, ThumbsUp, Minus, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateTimePicker } from "./DateTimePicker";
import type { Treatment } from "@shared/schema";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";

const TREATMENT_TYPES = [
  { value: "medication", label: "Лекарство", icon: Pill },
  { value: "procedure", label: "Процедура", icon: Stethoscope },
  { value: "exercise", label: "Упражнение", icon: Dumbbell },
  { value: "other", label: "Другое", icon: MoreHorizontal },
] as const;

const RESULT_OPTIONS = [
  { value: "helped", label: "Помогло", icon: ThumbsUp, color: "text-green-500 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800" },
  { value: "no_effect", label: "Без эффекта", icon: Minus, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800" },
  { value: "worse", label: "Хуже", icon: ThumbsDown, color: "text-red-500 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800" },
] as const;

const TYPE_ICONS: Record<string, React.ElementType> = {
  medication: Pill, procedure: Stethoscope, exercise: Dumbbell, other: MoreHorizontal,
};
const TYPE_LABELS: Record<string, string> = {
  medication: "Лекарство", procedure: "Процедура", exercise: "Упражнение", other: "Другое",
};

interface Props {
  entryId: number;
}

export function TreatmentSection({ entryId }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<string>("medication");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState("");
  const [date, setDate] = useState(() => new Date());

  const { data: treatments = [] } = useQuery<Treatment[]>({
    queryKey: [`/api/entries/${entryId}/treatments`],
    queryFn: () => fetch(`/api/entries/${entryId}/treatments`).then((r) => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      fetch(`/api/entries/${entryId}/treatments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title: title.trim() || TYPE_LABELS[type],
          notes,
          result,
          date: date.toISOString(),
        }),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/entries/${entryId}/treatments`] });
      setShowForm(false);
      setTitle(""); setNotes(""); setResult(""); setType("medication");
      setDate(new Date());
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => fetch(`/api/treatments/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/api/entries/${entryId}/treatments`] }),
  });

  const getResultInfo = (r: string) => RESULT_OPTIONS.find((o) => o.value === r);

  return (
    <div className="flex flex-col gap-3">
      {treatments.map((t) => {
        const Icon = TYPE_ICONS[t.type] ?? MoreHorizontal;
        const resultInfo = getResultInfo(t.result ?? "");
        const ResultIcon = resultInfo ? resultInfo.icon : null;
        return (
          <div key={t.id} className="bg-card rounded-2xl border border-border/60 p-4 flex flex-col gap-2">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{t.title}</p>
                <p className="text-xs text-muted-foreground">
                  {TYPE_LABELS[t.type]} · {format(parseISO(t.date), "d MMM yyyy, HH:mm", { locale: ru })}
                </p>
              </div>
              <button
                onClick={() => deleteMutation.mutate(t.id)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            {t.notes && <p className="text-xs text-muted-foreground pl-12">{t.notes}</p>}
            {resultInfo && (
              <div className={`ml-12 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium w-fit ${resultInfo.color}`}>
                {ResultIcon && <ResultIcon className="w-3 h-3" />}
                {resultInfo.label}
              </div>
            )}
          </div>
        );
      })}

      {showForm ? (
        <div className="bg-muted/20 rounded-2xl border border-border/60 p-4 flex flex-col gap-3">
          <p className="text-sm font-semibold">Новая запись о лечении</p>

          {/* Type */}
          <div className="grid grid-cols-4 gap-2">
            {TREATMENT_TYPES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setType(value)}
                className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-medium transition-colors ${
                  type === value ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border/60 text-muted-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`Название (${TYPE_LABELS[type].toLowerCase()})`}
            className="rounded-xl text-sm"
          />

          {/* DateTimePicker */}
          <DateTimePicker value={date} onChange={setDate} label="Дата и время" />

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Дозировка, описание процедуры..."
            rows={2}
            className="w-full text-sm rounded-xl border border-border bg-muted/20 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
          />

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Эффект</p>
            <div className="flex gap-2">
              {RESULT_OPTIONS.map(({ value, label, icon: Icon, color }) => (
                <button
                  key={value}
                  onClick={() => setResult(result === value ? "" : value)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-medium transition-colors ${
                    result === value ? color : "bg-card border-border/60 text-muted-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowForm(false)}>Отмена</Button>
            <Button className="flex-1 rounded-xl" onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
              {createMutation.isPending ? "..." : "Добавить"}
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border/60 text-sm text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
        >
          <Plus className="w-4 h-4" />
          Добавить процедуру / лечение
        </button>
      )}
    </div>
  );
}
