"use client";

import { formatBytes } from "@/lib/api";
import type { User, Stats } from "@/lib/api";
import { Separator } from "@/components/ui/separator";
import { Folder, Image, Video, FileText, Music, Archive, Star, LogOut } from "lucide-react";

interface SidebarProps {
  user: User;
  stats: Stats | null;
  category: string;
  setCategory: (c: string) => void;
  totalFiles: number;
  categoryCounts: Record<string, number>;
  onLogout: () => void;
}

const navItems = [
  { id: "all", label: "All Files", icon: Folder },
  { id: "image", label: "Images", icon: Image },
  { id: "video", label: "Videos", icon: Video },
  { id: "document", label: "Documents", icon: FileText },
  { id: "audio", label: "Audio", icon: Music },
  { id: "archive", label: "Archives", icon: Archive },
];

export function Sidebar({ user, stats, category, setCategory, totalFiles, categoryCounts, onLogout }: SidebarProps) {
  const pct = parseFloat(stats?.storagePercentage || "0") || 0;
  const initial = (user?.name || "U")[0].toUpperCase();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-6 border-b border-sidebar-border">
        <div className="w-9 h-9 bg-gradient-to-br from-[#6366f1] to-[#06b6d4] rounded-xl flex items-center justify-center text-base shrink-0">☁️</div>
        <div>
          <div className="text-sm font-extrabold gradient-text leading-tight">CloudVault</div>
          <div className="text-[11px] text-muted-foreground">File Storage System</div>
        </div>
      </div>

      {/* Storage */}
      <div className="mx-4 mt-4 mb-2 p-4 rounded-xl border border-sidebar-border bg-gradient-to-br from-[rgba(99,102,241,0.1)] to-[rgba(6,182,212,0.05)]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Storage Used</span>
          <span className="text-xs font-bold text-[#818cf8]">{pct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-[#1a1d2e] overflow-hidden mb-2">
          <div className="h-full rounded-full bg-gradient-to-r from-[#6366f1] to-[#06b6d4] transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
        <div className="text-xs text-muted-foreground">
          {formatBytes(stats?.storageUsed || 0)} / {formatBytes(stats?.storageLimit || 5368709120)}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-2">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2.5 py-3">Files</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const count = item.id === "all" ? totalFiles : (categoryCounts[item.id] || 0);
          const active = category === item.id;
          return (
            <button key={item.id} onClick={() => setCategory(item.id)} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5 border border-transparent ${active ? "bg-[rgba(99,102,241,0.25)] text-[#818cf8] border-[rgba(99,102,241,0.2)] font-semibold" : "text-muted-foreground hover:bg-card hover:text-foreground hover:border-border"}`}>
              <Icon className="w-[18px] h-[18px] shrink-0" />
              {item.label}
              {count > 0 && <span className="ml-auto text-[11px] font-bold bg-[rgba(99,102,241,0.25)] text-[#818cf8] px-2 py-0.5 rounded-full">{count}</span>}
            </button>
          );
        })}

        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2.5 py-3 mt-2">Quick Access</div>
        <button onClick={() => setCategory("starred")} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border border-transparent ${category === "starred" ? "bg-[rgba(99,102,241,0.25)] text-[#818cf8] border-[rgba(99,102,241,0.2)] font-semibold" : "text-muted-foreground hover:bg-card hover:text-foreground hover:border-border"}`}>
          <Star className="w-[18px] h-[18px] shrink-0" />
          Starred
        </button>
      </nav>

      {/* User */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2.5 p-2.5 bg-card border border-border rounded-xl">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366f1] to-[#06b6d4] flex items-center justify-center text-xs font-bold text-white shrink-0">{initial}</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{user.name}</div>
            <div className="text-[11px] text-muted-foreground truncate">{user.email}</div>
          </div>
          <button onClick={onLogout} className="text-muted-foreground hover:text-[#ef4444] transition-colors p-1" title="Logout" id="logout-btn">
            <LogOut className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
