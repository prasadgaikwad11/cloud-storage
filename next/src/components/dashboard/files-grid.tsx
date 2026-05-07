"use client";

import { formatBytes, timeAgo, FILE_ICONS } from "@/lib/api";
import type { FileItem } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Download, Pencil, Star, Trash2 } from "lucide-react";

interface FilesGridProps {
  files: FileItem[];
  viewMode: "grid" | "list";
  loading: boolean;
  searchQuery: string;
  onDownload: (id: string, name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string, name: string) => void;
  onToggleStar: (id: string) => void;
}

const iconBgMap: Record<string, string> = {
  image: "bg-[rgba(99,102,241,0.12)]",
  video: "bg-[rgba(239,68,68,0.12)]",
  audio: "bg-[rgba(245,158,11,0.12)]",
  document: "bg-[rgba(6,182,212,0.12)]",
  archive: "bg-[rgba(16,185,129,0.12)]",
  other: "bg-[rgba(100,116,139,0.12)]",
};

export function FilesGrid({ files, viewMode, loading, searchQuery, onDownload, onRename, onDelete, onToggleStar }: FilesGridProps) {
  if (loading) {
    return (
      <div className={viewMode === "list" ? "flex flex-col gap-2" : "grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4"}>
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl h-40 animate-pulse" />
        ))}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <span className="text-6xl block mb-4 opacity-30">☁️</span>
        <h3 className="text-base text-foreground/70 mb-2">{searchQuery ? "No files match your search" : "No files uploaded yet"}</h3>
        <p className="text-sm">{searchQuery ? "Try a different search term." : "Drag & drop or click upload to get started."}</p>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="flex flex-col gap-2">
        {files.map((file) => (
          <div key={file.id} className="bg-card border border-border rounded-2xl px-4 py-3.5 flex items-center gap-3.5 transition-all hover:border-[rgba(255,255,255,0.15)] hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] animate-fade-in relative group">
            {file.isStarred && <span className="absolute top-2.5 left-2.5 text-xs text-[#f59e0b]">★</span>}
            <div className={`w-[42px] h-[42px] rounded-xl flex items-center justify-center text-xl shrink-0 ${iconBgMap[file.category] || iconBgMap.other}`}>
              {FILE_ICONS[file.category] || "📁"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate" title={file.name}>{file.name}</div>
              <div className="text-xs text-muted-foreground">{formatBytes(file.size)} • {timeAgo(file.uploadedAt)}</div>
            </div>
            <Badge variant="secondary" className="shrink-0 text-[10px] bg-[rgba(99,102,241,0.25)] text-[#818cf8] border-0">{(file.extension || file.category).toUpperCase()}</Badge>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <ActionBtn icon={<Download className="w-3.5 h-3.5" />} title="Download" onClick={() => onDownload(file.id, file.name)} />
              <ActionBtn icon={<Pencil className="w-3.5 h-3.5" />} title="Rename" onClick={() => onRename(file.id, file.name)} />
              <ActionBtn icon={<Star className={`w-3.5 h-3.5 ${file.isStarred ? "fill-[#f59e0b] text-[#f59e0b]" : ""}`} />} title="Star" onClick={() => onToggleStar(file.id)} />
              <ActionBtn icon={<Trash2 className="w-3.5 h-3.5" />} title="Delete" onClick={() => onDelete(file.id, file.name)} danger />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
      {files.map((file) => (
        <div key={file.id} className="bg-card border border-border rounded-2xl p-5 flex flex-col items-center gap-3 text-center transition-all hover:border-[rgba(255,255,255,0.15)] hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] animate-fade-in relative group cursor-pointer overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[rgba(99,102,241,0.04)] opacity-0 group-hover:opacity-100 transition-opacity" />
          {file.isStarred && <span className="absolute top-2.5 left-2.5 text-xs text-[#f59e0b] z-10">★</span>}
          <div className="flex gap-1 absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <ActionBtn icon={<Download className="w-3 h-3" />} title="Download" onClick={() => onDownload(file.id, file.name)} small />
            <ActionBtn icon={<Pencil className="w-3 h-3" />} title="Rename" onClick={() => onRename(file.id, file.name)} small />
            <ActionBtn icon={<Star className={`w-3 h-3 ${file.isStarred ? "fill-[#f59e0b] text-[#f59e0b]" : ""}`} />} title="Star" onClick={() => onToggleStar(file.id)} small />
            <ActionBtn icon={<Trash2 className="w-3 h-3" />} title="Delete" onClick={() => onDelete(file.id, file.name)} danger small />
          </div>
          <div className={`w-[60px] h-[60px] rounded-xl flex items-center justify-center text-2xl relative z-10 ${iconBgMap[file.category] || iconBgMap.other}`}>
            {FILE_ICONS[file.category] || "📁"}
          </div>
          <div className="w-full relative z-10">
            <div className="text-xs font-semibold truncate" title={file.name}>{file.name}</div>
            <div className="text-[11px] text-muted-foreground">{formatBytes(file.size)} • {timeAgo(file.uploadedAt)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ActionBtn({ icon, title, onClick, danger, small }: { icon: React.ReactNode; title: string; onClick: () => void; danger?: boolean; small?: boolean }) {
  return (
    <button title={title} onClick={(e) => { e.stopPropagation(); onClick(); }} className={`${small ? "w-7 h-7" : "w-[30px] h-[30px]"} bg-background border border-border rounded-lg text-muted-foreground flex items-center justify-center transition-all ${danger ? "hover:text-[#ef4444] hover:border-[rgba(239,68,68,0.4)]" : "hover:text-foreground hover:border-[rgba(255,255,255,0.15)]"}`}>
      {icon}
    </button>
  );
}
