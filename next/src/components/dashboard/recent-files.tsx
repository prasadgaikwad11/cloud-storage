"use client";

import { formatBytes, timeAgo, FILE_ICONS } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface RecentFilesProps {
  files: { id: string; name: string; size: number; category: string; uploadedAt: string }[];
  onDownload: (id: string, name: string) => void;
  onViewAll: () => void;
}

export function RecentFiles({ files, onDownload, onViewAll }: RecentFilesProps) {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold">Recent Uploads</h2>
        <Button variant="secondary" size="sm" className="border-border" onClick={onViewAll}>View All</Button>
      </div>
      {files.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">No recent uploads.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {files.map((f) => (
            <div key={f.id} onClick={() => onDownload(f.id, f.name)} className="bg-card border border-border rounded-xl px-4 py-3.5 flex items-center gap-3 cursor-pointer hover:border-[rgba(255,255,255,0.15)] transition-all">
              <span className="text-xl">{FILE_ICONS[f.category] || "📁"}</span>
              <span className="text-sm font-medium flex-1 min-w-0 truncate">{f.name}</span>
              <span className="text-xs text-muted-foreground shrink-0">{formatBytes(f.size)}</span>
              <span className="text-xs text-muted-foreground shrink-0 min-w-[70px] text-right">{timeAgo(f.uploadedAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
