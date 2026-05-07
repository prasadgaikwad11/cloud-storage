"use client";

import { useCallback, useState, type RefObject } from "react";

interface UploadZoneProps {
  onUpload: (files: FileList | File[]) => Promise<void>;
  fileInputRef: RefObject<HTMLInputElement | null>;
}

export function UploadZone({ onUpload, fileInputRef }: UploadZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    if (e.dataTransfer.files.length > 0) { setUploading(true); await onUpload(e.dataTransfer.files); setUploading(false); }
  }, [onUpload]);

  return (
    <div className="mb-7">
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={(e) => { if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) setDragOver(false); }}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-3xl p-10 md:p-12 text-center cursor-pointer transition-all bg-card relative overflow-hidden group ${dragOver ? "border-[#6366f1] bg-[rgba(99,102,241,0.03)] shadow-[0_0_40px_rgba(99,102,241,0.1)] scale-[1.01] border-solid" : "border-border hover:border-[#6366f1] hover:bg-[rgba(99,102,241,0.03)]"}`}
        id="upload-zone"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.05),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="w-[72px] h-[72px] bg-gradient-to-br from-[rgba(99,102,241,0.25)] to-[rgba(6,182,212,0.1)] border border-[rgba(99,102,241,0.2)] rounded-3xl flex items-center justify-center mx-auto mb-5 animate-float text-3xl relative z-10">
          📤
        </div>
        <h3 className="text-lg font-bold mb-2 relative z-10">
          {uploading ? "Uploading..." : "Drop files here to upload"}
        </h3>
        <p className="text-sm text-muted-foreground mb-5 relative z-10">
          or <span className="text-[#818cf8] underline">browse your files</span>
        </p>
        <div className="flex flex-wrap gap-2 justify-center relative z-10">
          {["Images", "Videos", "Documents", "Audio", "Archives", "Max 100MB"].map((t) => (
            <span key={t} className="px-3 py-1 bg-[#1a1d2e] border border-border rounded-full text-xs text-muted-foreground">{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
