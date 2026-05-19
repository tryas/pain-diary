import { useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Camera, FileText, Trash2, ImageIcon, X } from "lucide-react";
import type { Attachment } from "@shared/schema";

interface Props {
  entryId: number;
}

type AttachmentMeta = Omit<Attachment, "data">;

function formatBytes(b: number) {
  if (b < 1024) return `${b} Б`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} КБ`;
  return `${(b / 1024 / 1024).toFixed(1)} МБ`;
}

export function AttachmentUpload({ entryId }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<{ url: string; name: string } | null>(null);

  const { data: attachments = [] } = useQuery<AttachmentMeta[]>({
    queryKey: [`/api/entries/${entryId}/attachments`],
    queryFn: () => fetch(`/api/entries/${entryId}/attachments`).then((r) => r.json()),
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`/api/entries/${entryId}/attachments`, { method: "POST", body: form });
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/entries/${entryId}/attachments`] });
      setPreview(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => fetch(`/api/attachments/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/api/entries/${entryId}/attachments`] }),
  });

  const handleFile = (file: File) => {
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreview({ url, name: file.name });
    }
    uploadMutation.mutate(file);
  };

  const openAttachment = async (id: number, mimeType: string) => {
    const res = await fetch(`/api/attachments/${id}`);
    const att: Attachment = await res.json();
    const link = document.createElement("a");
    link.href = att.data;
    link.download = att.filename;
    link.click();
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Upload buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => { if (fileRef.current) { fileRef.current.accept = "image/*"; fileRef.current.capture = "environment"; fileRef.current.click(); } }}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border/60 bg-muted/20 text-sm text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors active:scale-95"
        >
          <Camera className="w-4 h-4" />
          Сфотографировать
        </button>
        <button
          onClick={() => { if (fileRef.current) { fileRef.current.accept = "image/*,application/pdf,.doc,.docx"; fileRef.current.removeAttribute("capture"); fileRef.current.click(); } }}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border/60 bg-muted/20 text-sm text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors active:scale-95"
        >
          <FileText className="w-4 h-4" />
          Выбрать файл
        </button>
        <input ref={fileRef} type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
      </div>

      {/* Upload progress */}
      {uploadMutation.isPending && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
          <div className="w-3 h-3 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
          Загрузка...
        </div>
      )}

      {/* Attachments list */}
      {attachments.length > 0 && (
        <div className="flex flex-col gap-2">
          {attachments.map((att) => (
            <div key={att.id} className="flex items-center gap-3 bg-muted/30 rounded-xl px-3 py-2.5 border border-border/40">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                {att.mimeType.startsWith("image/") ? (
                  <ImageIcon className="w-4 h-4 text-primary" />
                ) : (
                  <FileText className="w-4 h-4 text-primary" />
                )}
              </div>
              <button className="flex-1 text-left min-w-0" onClick={() => openAttachment(att.id, att.mimeType)}>
                <p className="text-sm font-medium truncate">{att.filename}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(att.size)}</p>
              </button>
              <button
                onClick={() => deleteMutation.mutate(att.id)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
