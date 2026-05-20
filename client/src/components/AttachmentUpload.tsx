import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { idb } from "@/lib/idb";
import type { IDBAttachment } from "@/lib/idb";
import { Camera, FileText, Trash2, ImageIcon } from "lucide-react";

function formatBytes(b: number) {
  if (b < 1024) return `${b} Б`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} КБ`;
  return `${(b / 1024 / 1024).toFixed(1)} МБ`;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function AttachmentUpload({ entryId }: { entryId: number }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const qc = useQueryClient();

  const { data: attachments = [] } = useQuery<IDBAttachment[]>({
    queryKey: ["attachments", entryId],
    queryFn: () => idb.getAttachments(entryId),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => idb.deleteAttachment(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attachments", entryId] }),
  });

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const data = await fileToBase64(file);
      await idb.createAttachment({
        entryId,
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        data,
        createdAt: new Date().toISOString(),
      });
      qc.invalidateQueries({ queryKey: ["attachments", entryId] });
    } finally {
      setUploading(false);
    }
  };

  const openAttachment = (att: IDBAttachment) => {
    const link = document.createElement("a");
    link.href = att.data;
    link.download = att.filename;
    link.click();
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <button
          onClick={() => { if (fileRef.current) { fileRef.current.accept = "image/*"; fileRef.current.setAttribute("capture", "environment"); fileRef.current.click(); } }}
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

      {uploading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
          <div className="w-3 h-3 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
          Загрузка...
        </div>
      )}

      {attachments.length > 0 && (
        <div className="flex flex-col gap-2">
          {attachments.map((att) => (
            <div key={att.id} className="flex items-center gap-3 bg-muted/30 rounded-xl px-3 py-2.5 border border-border/40">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                {att.mimeType.startsWith("image/") ? <ImageIcon className="w-4 h-4 text-primary" /> : <FileText className="w-4 h-4 text-primary" />}
              </div>
              <button className="flex-1 text-left min-w-0" onClick={() => openAttachment(att)}>
                <p className="text-sm font-medium truncate">{att.filename}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(att.size)}</p>
              </button>
              <button onClick={() => deleteMutation.mutate(att.id!)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
