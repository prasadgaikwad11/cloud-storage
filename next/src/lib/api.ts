const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000/api";

/* ── Types ─────────────────────────────────────────────────────── */
export interface User {
  id: string;
  name: string;
  email: string;
  storageUsed: number;
  storageLimit: number;
  createdAt: string;
}

export interface FileItem {
  id: string;
  name: string;
  originalName: string;
  size: number;
  mimeType: string;
  category: "image" | "video" | "audio" | "document" | "archive" | "other";
  extension: string;
  isStarred: boolean;
  downloadCount: number;
  uploadedAt: string;
  updatedAt: string;
  s3Url?: string;
}

export interface Stats {
  storageUsed: number;
  storageLimit: number;
  storagePercentage: string;
  totalFiles: number;
  categoryBreakdown: { _id: string; count: number; totalSize: number }[];
  recentFiles: {
    id: string;
    name: string;
    size: number;
    category: string;
    extension: string;
    mimeType: string;
    uploadedAt: string;
  }[];
}

/* ── Token helpers ─────────────────────────────────────────────── */
export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("cloudToken");
};

export const Auth = {
  setSession: (token: string, user: User) => {
    localStorage.setItem("cloudToken", token);
    localStorage.setItem("cloudUser", JSON.stringify(user));
  },
  clearSession: () => {
    localStorage.removeItem("cloudToken");
    localStorage.removeItem("cloudUser");
  },
  getUser: (): User | null => {
    try {
      const raw = localStorage.getItem("cloudUser");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  isAuthenticated: (): boolean => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("cloudToken");
  },
};

/* ── Core fetch wrapper ────────────────────────────────────────── */
async function request<T = Record<string, unknown>>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  if (options.body instanceof FormData) {
    delete defaultHeaders["Content-Type"];
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers as Record<string, string> || {}),
    },
  };

  const res = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await res.json();

  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      Auth.clearSession();
      const path = window.location.pathname;
      if (!path.includes("/login") && !path.includes("/register") && path !== "/") {
        window.location.href = "/login";
      }
    }
    throw new Error(data.message || "Request failed");
  }

  return data as T;
}

/* ── Auth API ──────────────────────────────────────────────────── */
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    request<{ success: boolean; token: string; user: User; message: string }>(
      "/auth/register",
      { method: "POST", body: JSON.stringify(data) }
    ),

  login: (data: { email: string; password: string }) =>
    request<{ success: boolean; token: string; user: User; message: string }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify(data) }
    ),

  getMe: () =>
    request<{ success: boolean; user: User }>("/auth/me"),

  updateProfile: (data: { name: string }) =>
    request<{ success: boolean; user: User; message: string }>(
      "/auth/profile",
      { method: "PATCH", body: JSON.stringify(data) }
    ),
};

/* ── Files API ─────────────────────────────────────────────────── */
export const filesAPI = {
  upload: (
    files: FileList | File[],
    onProgress?: (percent: number) => void
  ): Promise<{ success: boolean; message: string; files: FileItem[] }> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append("files", file));

      const xhr = new XMLHttpRequest();
      const token = getToken();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable && onProgress) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      });

      xhr.addEventListener("load", () => {
        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(data);
          } else {
            reject(new Error(data.message || "Upload failed"));
          }
        } catch {
          reject(new Error("Invalid server response"));
        }
      });

      xhr.addEventListener("error", () =>
        reject(new Error("Upload failed. Network error."))
      );
      xhr.addEventListener("abort", () =>
        reject(new Error("Upload cancelled."))
      );

      xhr.open("POST", `${API_BASE}/files/upload`);
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.send(formData);
    });
  },

  getFiles: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request<{
      success: boolean;
      files: FileItem[];
      pagination: { total: number; page: number; limit: number; pages: number };
    }>(`/files${qs ? "?" + qs : ""}`);
  },

  getStats: () =>
    request<{ success: boolean; stats: Stats }>("/files/stats"),

  download: (fileId: string) =>
    request<{
      success: boolean;
      downloadUrl: string;
      fileName: string;
      expiresIn: number;
    }>(`/files/${fileId}/download`),

  delete: (fileId: string) =>
    request<{ success: boolean; message: string }>(`/files/${fileId}`, {
      method: "DELETE",
    }),

  rename: (fileId: string, name: string) =>
    request<{ success: boolean; message: string; file: { id: string; name: string } }>(
      `/files/${fileId}/rename`,
      { method: "PATCH", body: JSON.stringify({ name }) }
    ),

  toggleStar: (fileId: string) =>
    request<{ success: boolean; isStarred: boolean; message: string }>(
      `/files/${fileId}/star`,
      { method: "PATCH" }
    ),
};

/* ── Utility ───────────────────────────────────────────────────── */
export const formatBytes = (bytes: number): string => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  const hr = Math.floor(diff / 3600000);
  const day = Math.floor(diff / 86400000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  if (hr < 24) return `${hr}h ago`;
  if (day < 30) return `${day}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

export const FILE_ICONS: Record<string, string> = {
  image: "🖼️",
  video: "🎬",
  audio: "🎵",
  document: "📄",
  archive: "🗜️",
  other: "📁",
};
