"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Auth, filesAPI, formatBytes, timeAgo, FILE_ICONS } from "@/lib/api";
import type { FileItem, Stats, User } from "@/lib/api";
import { toast } from "sonner";
import { Sidebar } from "@/components/dashboard/sidebar";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { UploadZone } from "@/components/dashboard/upload-zone";
import { FilesToolbar } from "@/components/dashboard/files-toolbar";
import { FilesGrid } from "@/components/dashboard/files-grid";
import { RecentFiles } from "@/components/dashboard/recent-files";
import { RenameDialog } from "@/components/dashboard/rename-dialog";
import { DeleteDialog } from "@/components/dashboard/delete-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Upload, Search } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Rename/Delete state
  const [renameTarget, setRenameTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!Auth.isAuthenticated()) { router.replace("/login"); return; }
    setUser(Auth.getUser());
    loadData();
  }, [router]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, filesRes] = await Promise.all([
        filesAPI.getStats(),
        filesAPI.getFiles(),
      ]);
      setStats(statsRes.stats);
      setFiles(filesRes.files || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load data";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filtered + sorted files
  const filteredFiles = useMemo(() => {
    let result = [...files];
    if (category === "starred") result = result.filter((f) => f.isStarred);
    else if (category !== "all") result = result.filter((f) => f.category === category);
    if (searchQuery) result = result.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
    result.sort((a, b) => {
      let aVal: string | number = (a as unknown as Record<string, unknown>)[sortBy] as string;
      let bVal: string | number = (b as unknown as Record<string, unknown>)[sortBy] as string;
      if (sortBy === "name") { aVal = (aVal as string)?.toLowerCase() || ""; bVal = (bVal as string)?.toLowerCase() || ""; }
      else if (sortBy === "uploadedAt" || sortBy === "createdAt") { aVal = new Date(aVal as string).getTime(); bVal = new Date(bVal as string).getTime(); }
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return result;
  }, [files, category, searchQuery, sortBy, sortOrder]);

  const handleSearch = (value: string) => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => setSearchQuery(value.trim()), 300);
  };

  const handleUpload = async (fileList: FileList | File[]) => {
    if (Array.from(fileList).length > 10) { toast.warning("Maximum 10 files per upload."); return; }
    try {
      const result = await filesAPI.upload(fileList, () => {});
      toast.success(result.message || "Files uploaded!");
      await loadData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    }
  };

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      toast.info("Generating download link…");
      const data = await filesAPI.download(fileId);
      const a = document.createElement("a");
      a.href = data.downloadUrl; a.download = fileName; a.target = "_blank";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      toast.success("Download started!");
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Download failed."); }
  };

  const handleRename = async (newName: string) => {
    if (!renameTarget) return;
    try {
      await filesAPI.rename(renameTarget.id, newName);
      toast.success("File renamed!"); setRenameTarget(null); await loadData();
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Rename failed."); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await filesAPI.delete(deleteTarget.id);
      toast.success("File deleted."); setDeleteTarget(null); await loadData();
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Delete failed."); }
  };

  const handleToggleStar = async (fileId: string) => {
    try {
      const data = await filesAPI.toggleStar(fileId);
      setFiles((prev) => prev.map((f) => f.id === fileId ? { ...f, isStarred: data.isStarred } : f));
    } catch { toast.error("Failed to update star."); }
  };

  const categoryCounts = useMemo(() => {
    const c: Record<string, number> = { image: 0, video: 0, document: 0, audio: 0, archive: 0, other: 0 };
    (stats?.categoryBreakdown || []).forEach((cat) => { if (c[cat._id] !== undefined) c[cat._id] = cat.count; });
    return c;
  }, [stats]);

  const initial = (user?.name || "U")[0].toUpperCase();

  if (!user) return null;

  const sidebarContent = (
    <Sidebar
      user={user}
      stats={stats}
      category={category}
      setCategory={(c) => { setCategory(c); setSidebarOpen(false); }}
      totalFiles={files.length}
      categoryCounts={categoryCounts}
      onLogout={() => { Auth.clearSession(); toast.info("Logged out."); setTimeout(() => router.push("/login"), 500); }}
    />
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[260px] shrink-0 flex-col fixed top-0 left-0 h-screen bg-sidebar border-r border-sidebar-border overflow-y-auto z-40">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-[260px] p-0 bg-sidebar border-sidebar-border">
          {sidebarContent}
        </SheetContent>
      </Sheet>

      {/* Main */}
      <main className="flex-1 lg:ml-[260px] flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border h-16 flex items-center px-4 md:px-7 gap-4">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex-1 max-w-[480px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search files…" onChange={(e) => handleSearch(e.target.value)} className="pl-10 h-[42px] bg-[#1a1d2e] border-border" id="search-input" />
          </div>
          <div className="flex items-center gap-2.5 ml-auto">
            <Button size="sm" className="bg-gradient-to-br from-[#6366f1] to-[#4f46e5] text-white" onClick={() => fileInputRef.current?.click()} id="upload-btn-header">
              <Upload className="w-4 h-4 mr-1" /> Upload
            </Button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6366f1] to-[#06b6d4] flex items-center justify-center text-sm font-bold text-white shrink-0">
              {initial}
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-7">
          {/* Page header */}
          <div className="flex items-center justify-between mb-7 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-extrabold">My Files</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Manage your cloud storage</p>
            </div>
            <Button className="bg-gradient-to-br from-[#6366f1] to-[#4f46e5] text-white" onClick={() => fileInputRef.current?.click()} id="upload-btn-main">
              + Upload Files
            </Button>
          </div>

          <StatsGrid stats={stats} />
          <UploadZone onUpload={handleUpload} fileInputRef={fileInputRef} />
          <FilesToolbar category={category} setCategory={setCategory} sortBy={sortBy} sortOrder={sortOrder} setSortBy={setSortBy} setSortOrder={setSortOrder} viewMode={viewMode} setViewMode={setViewMode} />
          <FilesGrid files={filteredFiles} viewMode={viewMode} loading={loading} searchQuery={searchQuery} onDownload={handleDownload} onRename={(id, name) => setRenameTarget({ id, name })} onDelete={(id, name) => setDeleteTarget({ id, name })} onToggleStar={handleToggleStar} />
          <RecentFiles files={stats?.recentFiles || []} onDownload={handleDownload} onViewAll={() => setCategory("all")} />
        </div>
      </main>

      <input ref={fileInputRef} type="file" multiple hidden accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.tar,.gz" onChange={(e) => { if (e.target.files?.length) handleUpload(e.target.files); e.target.value = ""; }} />
      <RenameDialog target={renameTarget} onClose={() => setRenameTarget(null)} onConfirm={handleRename} />
      <DeleteDialog target={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />
    </div>
  );
}
