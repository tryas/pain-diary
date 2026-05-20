import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { idb } from "@/lib/idb";
import { BodyMap } from "@/components/BodyMap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateTimePicker } from "@/components/DateTimePicker";
import type { PainPoint } from "@shared/schema";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function NewEntryPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [painPoints, setPainPoints] = useState<PainPoint[]>([]);
  const [entryDate, setEntryDate] = useState(() => new Date());

  const createMutation = useMutation({
    mutationFn: () =>
      idb.createEntry({
        title: title.trim() || "Запись без названия",
        date: entryDate.toISOString(),
        notes,
        painPoints: JSON.stringify(painPoints),
      }),
    onSuccess: (entry) => {
      qc.invalidateQueries({ queryKey: ["entries"] });
      toast({ title: "Запись сохранена", description: "Теперь можно добавить фото и процедуры" });
      navigate(`/entry/${entry.id}`);
    },
    onError: () => toast({ title: "Ошибка сохранения", variant: "destructive" }),
  });

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border/40 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate("/")} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-base font-bold flex-1">Новая запись</h1>
        <Button size="sm" className="rounded-xl gap-1.5" onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
          <Save className="w-4 h-4" />
          {createMutation.isPending ? "..." : "Сохранить"}
        </Button>
      </div>

      <div className="flex-1 px-4 py-4 flex flex-col gap-5">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Название записи</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Например: Боль в спине утром" className="rounded-xl" />
        </div>

        <DateTimePicker value={entryDate} onChange={setEntryDate} label="Дата и время" />

        <div>
          <label className="text-sm font-medium mb-2 block">
            Карта тела
            <span className="text-xs font-normal text-muted-foreground ml-1.5">Выберите место боли из списка</span>
          </label>
          <BodyMap painPoints={painPoints} onChange={setPainPoints} />
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Общие заметки</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Как началась боль? С чем связываете? Что помогает?" rows={3}
            className="w-full text-sm rounded-xl border border-border bg-muted/20 px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-primary/40" />
        </div>

        <Button className="w-full rounded-xl py-5 text-base font-semibold" onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
          {createMutation.isPending ? "Сохранение..." : "Сохранить запись"}
        </Button>
        <div className="h-4" />
      </div>
    </div>
  );
}
