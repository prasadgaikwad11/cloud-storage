"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowDownUp, LayoutGrid, List } from "lucide-react";

const filters = [
  { id: "all", label: "All" },
  { id: "image", label: "🖼 Images" },
  { id: "video", label: "🎬 Videos" },
  { id: "document", label: "📄 Docs" },
  { id: "audio", label: "🎵 Audio" },
  { id: "archive", label: "🗜 Archives" },
];

const sortOptions = [
  { label: "Newest First", sortBy: "createdAt", order: "desc" as const },
  { label: "Oldest First", sortBy: "createdAt", order: "asc" as const },
  { label: "Name A→Z", sortBy: "name", order: "asc" as const },
  { label: "Name Z→A", sortBy: "name", order: "desc" as const },
  { label: "Largest First", sortBy: "size", order: "desc" as const },
  { label: "Smallest First", sortBy: "size", order: "asc" as const },
];

interface FilesToolbarProps {
  category: string;
  setCategory: (c: string) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  setSortBy: (s: string) => void;
  setSortOrder: (o: "asc" | "desc") => void;
  viewMode: "grid" | "list";
  setViewMode: (v: "grid" | "list") => void;
}

export function FilesToolbar({ category, setCategory, sortBy, sortOrder, setSortBy, setSortOrder, viewMode, setViewMode }: FilesToolbarProps) {
  const currentSort = sortOptions.find((s) => s.sortBy === sortBy && s.order === sortOrder) || sortOptions[0];

  return (
    <div className="flex items-center gap-3 mb-5 flex-wrap">
      {/* Filter tabs */}
      <div className="flex gap-1 bg-card border border-border rounded-xl p-1 flex-wrap">
        {filters.map((f) => (
          <button key={f.id} onClick={() => setCategory(f.id)} className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${category === f.id ? "bg-[#6366f1] text-white font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-[#1d2035]"}`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Sort */}
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-card border border-border text-foreground hover:bg-[#1d2035] hover:border-[rgba(255,255,255,0.15)] transition-all cursor-pointer" id="sort-btn">
              <ArrowDownUp className="w-3.5 h-3.5" />
              {currentSort.label}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-card border-border">
            {sortOptions.map((opt, i) => (
              <div key={opt.label}>
                {(i === 2 || i === 4) && <DropdownMenuSeparator />}
                <DropdownMenuItem onClick={() => { setSortBy(opt.sortBy); setSortOrder(opt.order); }} className="cursor-pointer">
                  {opt.label}
                </DropdownMenuItem>
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View toggle */}
        <div className="flex bg-card border border-border rounded-xl overflow-hidden">
          <button onClick={() => setViewMode("grid")} className={`px-3 py-2 transition-all ${viewMode === "grid" ? "bg-[#6366f1] text-white" : "text-muted-foreground hover:text-foreground hover:bg-[#1d2035]"}`} title="Grid View">
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode("list")} className={`px-3 py-2 transition-all ${viewMode === "list" ? "bg-[#6366f1] text-white" : "text-muted-foreground hover:text-foreground hover:bg-[#1d2035]"}`} title="List View">
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
