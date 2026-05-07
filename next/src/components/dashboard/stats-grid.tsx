"use client";

import { formatBytes } from "@/lib/api";
import type { Stats } from "@/lib/api";
import { Folder, CloudUpload, Image, PieChart } from "lucide-react";

interface StatsGridProps { stats: Stats | null; }

export function StatsGrid({ stats }: StatsGridProps) {
  const pct = parseFloat(stats?.storagePercentage || "0") || 0;
  const imgCount = (stats?.categoryBreakdown || []).find((c) => c._id === "image")?.count || 0;

  const items = [
    { label: "Total Files", value: String(stats?.totalFiles ?? 0), icon: Folder, color: "from-[rgba(99,102,241,0.15)] to-transparent", iconBg: "bg-[rgba(99,102,241,0.15)]", iconColor: "text-[#818cf8]" },
    { label: "Storage Used", value: formatBytes(stats?.storageUsed || 0), icon: CloudUpload, color: "from-[rgba(6,182,212,0.15)] to-transparent", iconBg: "bg-[rgba(6,182,212,0.15)]", iconColor: "text-[#06b6d4]" },
    { label: "Images", value: String(imgCount), icon: Image, color: "from-[rgba(16,185,129,0.15)] to-transparent", iconBg: "bg-[rgba(16,185,129,0.15)]", iconColor: "text-[#10b981]" },
    { label: "Space Used", value: `${pct}%`, icon: PieChart, color: "from-[rgba(245,158,11,0.15)] to-transparent", iconBg: "bg-[rgba(245,158,11,0.15)]", iconColor: "text-[#f59e0b]" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 transition-all hover:-translate-y-1 hover:border-[rgba(255,255,255,0.15)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] cursor-pointer relative overflow-hidden group">
            <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 relative z-10 ${item.iconBg}`}>
              <Icon className={`w-[22px] h-[22px] ${item.iconColor}`} />
            </div>
            <div className="relative z-10">
              <div className="text-2xl font-extrabold leading-none">{item.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{item.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
