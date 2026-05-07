/* ============================================================
   dashboard.js — Main Dashboard Logic
   ============================================================ */

// ── State ──────────────────────────────────────────────────────
const state = {
  files: [],
  filteredFiles: [],
  currentCategory: 'all',
  currentView: 'grid',
  searchQuery: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  stats: null,
  isLoading: false,
};

// ── File type → emoji icon mapping ────────────────────────────
const FILE_ICONS = {
  image:    '🖼️',
  video:    '🎬',
  audio:    '🎵',
  document: '📄',
  archive:  '🗜️',
  other:    '📁',
};

// ── Byte formatter ─────────────────────────────────────────────
const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

// ── Relative time ──────────────────────────────────────────────
const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min  = Math.floor(diff / 60000);
  const hr   = Math.floor(diff / 3600000);
  const day  = Math.floor(diff / 86400000);
  if (min < 1)  return 'Just now';
  if (min < 60) return `${min}m ago`;
  if (hr < 24)  return `${hr}h ago`;
  if (day < 30) return `${day}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', async () => {
  // Auth guard
  if (!Auth.requireAuth()) return;

  // Load user info into UI
  renderUserInfo();

  // Setup all event listeners
  setupSidebar();
  setupSearch();
  setupUploadZone();
  setupViewToggle();
  setupFilterTabs();
  setupSortDropdown();
  setupModals();
  setupLogout();

  // Load data
  await Promise.all([loadStats(), loadFiles()]);
});

/* ============================================================
   USER INFO
   ============================================================ */
function renderUserInfo() {
  const user = Auth.getUser();
  if (!user) return;

  const initial = (user.name || 'U')[0].toUpperCase();

  // Sidebar avatar + name
  setEl('user-name', user.name || 'User');
  setEl('user-email', user.email || '');
  setEl('user-avatar', initial);

  // Header avatar
  setEl('header-avatar', initial);
}

/* ============================================================
   SIDEBAR
   ============================================================ */
function setupSidebar() {
  const hamburger    = document.getElementById('hamburger');
  const sidebar      = document.getElementById('sidebar');
  const overlay      = document.getElementById('sidebar-overlay');

  const openSidebar  = () => {
    sidebar.classList.add('open');
    overlay.classList.add('visible');
  };
  const closeSidebar = () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('visible');
  };

  hamburger?.addEventListener('click', openSidebar);
  overlay?.addEventListener('click', closeSidebar);

  // Nav items
  document.querySelectorAll('.nav-item[data-category]').forEach((item) => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach((n) => n.classList.remove('active'));
      item.classList.add('active');
      state.currentCategory = item.dataset.category;
      filterAndRender();
      closeSidebar();
    });
  });
}

/* ============================================================
   SEARCH
   ============================================================ */
function setupSearch() {
  const input = document.getElementById('search-input');
  if (!input) return;

  let debounceTimer;
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      state.searchQuery = input.value.trim().toLowerCase();
      filterAndRender();
    }, 300);
  });
}

/* ============================================================
   FILTER TABS
   ============================================================ */
function setupFilterTabs() {
  document.querySelectorAll('.filter-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      state.currentCategory = tab.dataset.filter;
      filterAndRender();
    });
  });
}

/* ============================================================
   SORT
   ============================================================ */
function setupSortDropdown() {
  const btn  = document.getElementById('sort-btn');
  const menu = document.getElementById('sort-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.toggle('hidden');
  });

  document.addEventListener('click', () => menu.classList.add('hidden'));

  menu.querySelectorAll('[data-sort]').forEach((item) => {
    item.addEventListener('click', () => {
      const [sortBy, sortOrder] = item.dataset.sort.split(':');
      state.sortBy    = sortBy;
      state.sortOrder = sortOrder || 'desc';
      btn.querySelector('.sort-label').textContent = item.textContent.trim();
      filterAndRender();
      menu.classList.add('hidden');
    });
  });
}

/* ============================================================
   VIEW TOGGLE
   ============================================================ */
function setupViewToggle() {
  document.querySelectorAll('.view-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.view-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentView = btn.dataset.view;
      renderFiles();
    });
  });
}

/* ============================================================
   LOAD DATA
   ============================================================ */
async function loadStats() {
  try {
    const data = await filesAPI.getStats();
    state.stats = data.stats;
    renderStats(data.stats);
  } catch (err) {
    console.error('Stats load error:', err);
  }
}

async function loadFiles() {
  state.isLoading = true;
  showSkeletons();

  try {
    const data = await filesAPI.getFiles();
    state.files = data.files || [];
    filterAndRender();
    updateFileCount();
  } catch (err) {
    Toast.error(err.message || 'Failed to load files.');
    document.getElementById('files-grid').innerHTML = `
      <div class="files-empty">
        <span class="files-empty-icon">⚠️</span>
        <h3>Could not load files</h3>
        <p>${err.message}</p>
      </div>`;
  } finally {
    state.isLoading = false;
  }
}

/* ============================================================
   RENDER STATS
   ============================================================ */
function renderStats(stats) {
  if (!stats) return;

  // Storage bar
  const pct = parseFloat(stats.storagePercentage) || 0;
  const fill = document.getElementById('storage-fill');
  const pctEl = document.getElementById('storage-percent');
  const usedEl = document.getElementById('storage-used-text');

  if (fill)   fill.style.width = pct + '%';
  if (pctEl)  pctEl.textContent = pct + '%';
  if (usedEl) usedEl.textContent =
    `${formatBytes(stats.storageUsed)} / ${formatBytes(stats.storageLimit)}`;

  // Stat cards
  setEl('stat-total-files',  stats.totalFiles ?? 0);
  setEl('stat-storage-used', formatBytes(stats.storageUsed));
  setEl('stat-storage-pct',  pct + '%');

  // Category counts
  const counts = { image: 0, video: 0, document: 0, audio: 0, archive: 0, other: 0 };
  (stats.categoryBreakdown || []).forEach((c) => {
    if (counts[c._id] !== undefined) counts[c._id] = c.count;
  });
  setEl('stat-images',      counts.image);  // sidebar nav badge
  setEl('stat-images-card', counts.image);  // stat card value
  setEl('stat-videos',      counts.video);
  setEl('stat-docs',        counts.document);

  // Recent uploads
  renderRecentFiles(stats.recentFiles || []);
}

function renderRecentFiles(files) {
  const container = document.getElementById('recent-files-list');
  if (!container) return;

  if (files.length === 0) {
    container.innerHTML = `<p class="text-muted" style="padding:16px 0;font-size:.88rem">No recent uploads.</p>`;
    return;
  }

  container.innerHTML = files.map((f) => `
    <div class="upload-progress-item" style="cursor:pointer" onclick="triggerDownload('${f.id}','${escHtml(f.name)}')">
      <span style="font-size:1.3rem">${FILE_ICONS[f.category] || '📁'}</span>
      <span class="upload-progress-name">${escHtml(f.name)}</span>
      <span class="upload-progress-size">${formatBytes(f.size)}</span>
      <span class="upload-progress-size" style="min-width:70px">${timeAgo(f.uploadedAt)}</span>
    </div>
  `).join('');
}

/* ============================================================
   FILTER + SORT + RENDER
   ============================================================ */
function filterAndRender() {
  let files = [...state.files];

  // Handle starred special filter
  if (state.currentCategory === 'starred') {
    files = files.filter((f) => f.isStarred);
  } else if (state.currentCategory && state.currentCategory !== 'all') {
    // Filter by category
    files = files.filter((f) => f.category === state.currentCategory);
  }

  // Filter by search query
  if (state.searchQuery) {
    files = files.filter((f) =>
      f.name.toLowerCase().includes(state.searchQuery)
    );
  }

  // Sort
  files.sort((a, b) => {
    let aVal = a[state.sortBy];
    let bVal = b[state.sortBy];

    if (state.sortBy === 'name') {
      aVal = aVal?.toLowerCase() || '';
      bVal = bVal?.toLowerCase() || '';
    } else if (state.sortBy === 'uploadedAt') {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }

    if (aVal < bVal) return state.sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return state.sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  state.filteredFiles = files;
  renderFiles();
}

/* ============================================================
   RENDER FILES GRID
   ============================================================ */
function renderFiles() {
  const grid = document.getElementById('files-grid');
  if (!grid) return;

  const files = state.filteredFiles;

  if (files.length === 0) {
    grid.innerHTML = `
      <div class="files-empty">
        <span class="files-empty-icon">☁️</span>
        <h3>${state.searchQuery ? 'No files match your search' : 'No files uploaded yet'}</h3>
        <p>${state.searchQuery ? 'Try a different search term.' : 'Drag & drop or click upload to get started.'}</p>
      </div>`;
    return;
  }

  grid.className = `files-grid${state.currentView === 'list' ? ' list-view' : ''}`;

  grid.innerHTML = files.map((file) => buildFileCard(file)).join('');

  // Lazy-load image previews — swap data-src → src after render
  grid.querySelectorAll('.file-preview-img[data-src]').forEach((img) => {
    const src = img.dataset.src;
    img.removeAttribute('data-src');
    if (src) img.src = src;
  });
}

function buildFileCard(file) {
  const isListView = state.currentView === 'list';
  const icon       = FILE_ICONS[file.category] || '📁';
  const isImage    = file.category === 'image';

  const iconHtml = isImage
    ? `<img class="file-preview-img" data-src="${escHtml(file.s3Url || '')}" alt="${escHtml(file.name)}" onerror="this.replaceWith(document.createTextNode('${icon}'))">`
    : icon;

  // Safe s3Url — only used for image preview
  const safeUrl = isImage ? escHtml(file.s3Url || '') : '';

  return `
    <div class="file-card${isListView ? ' list' : ''}" data-id="${file.id}">
      <span class="file-star${file.isStarred ? ' starred' : ''}">★</span>

      <div class="file-icon-wrap ${file.category}">
        ${isImage && safeUrl
          ? `<img class="file-preview-img" data-src="${safeUrl}" alt="${escHtml(file.name)}" style="opacity:0;width:100%;height:100%;object-fit:cover;border-radius:var(--radius-md)" onload="this.style.opacity=1" onerror="this.style.display='none';this.parentElement.insertAdjacentText('beforeend','${icon}')">`
          : `<span>${icon}</span>`
        }
      </div>

      <div class="file-info" style="${isListView ? 'flex:1;min-width:0' : 'width:100%'}">
        <div class="file-name" title="${escHtml(file.name)}">${escHtml(file.name)}</div>
        <div class="file-meta">${formatBytes(file.size)} • ${timeAgo(file.uploadedAt)}</div>
      </div>

      ${isListView ? `<span class="badge badge-primary" style="flex-shrink:0">${(file.extension || file.category).toUpperCase()}</span>` : ''}

      <div class="file-actions">
        <button class="file-action-btn" title="Download" onclick="event.stopPropagation(); triggerDownload('${file.id}','${escHtml(file.name)}')">⬇</button>
        <button class="file-action-btn" title="Rename"   onclick="event.stopPropagation(); openRenameModal('${file.id}','${escHtml(file.name)}')">✏</button>
        <button class="file-action-btn" title="Star"     onclick="event.stopPropagation(); toggleFileStar('${file.id}', this)">${file.isStarred ? '★' : '☆'}</button>
        <button class="file-action-btn danger" title="Delete" onclick="event.stopPropagation(); openDeleteModal('${file.id}','${escHtml(file.name)}')">🗑</button>
      </div>
    </div>`;
}

/* ============================================================
   UPLOAD ZONE
   ============================================================ */
function setupUploadZone() {
  const zone      = document.getElementById('upload-zone');
  const fileInput = document.getElementById('file-input');
  const uploadBtn = document.getElementById('upload-btn-header');

  if (!zone || !fileInput) return;

  // Click zone → open file picker
  zone.addEventListener('click', () => fileInput.click());
  uploadBtn?.addEventListener('click', () => fileInput.click());

  // File selected via picker
  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) handleUpload(fileInput.files);
    fileInput.value = '';
  });

  // Drag & Drop
  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('drag-over');
  });

  zone.addEventListener('dragleave', (e) => {
    if (!zone.contains(e.relatedTarget)) zone.classList.remove('drag-over');
  });

  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 0) handleUpload(files);
  });

  // Global drag-over for entire page
  document.addEventListener('dragover', (e) => e.preventDefault());
  document.addEventListener('drop',     (e) => e.preventDefault());
}

/* ── Handle Upload ─────────────────────────────────────────── */
async function handleUpload(files) {
  const progressList = document.getElementById('upload-progress-list');
  if (!progressList) return;

  // Validate file count
  if (files.length > 10) {
    Toast.warning('Maximum 10 files per upload.');
    return;
  }

  // Build progress items
  const itemIds = [];
  Array.from(files).forEach((file, i) => {
    const id = `prog-${Date.now()}-${i}`;
    itemIds.push(id);
    progressList.insertAdjacentHTML('beforeend', `
      <div class="upload-progress-item" id="${id}">
        <span class="upload-status-icon" id="${id}-status">⏳</span>
        <span class="upload-progress-name">${escHtml(file.name)}</span>
        <span class="upload-progress-size">${formatBytes(file.size)}</span>
        <div class="upload-progress-bar-wrap">
          <div class="progress-bar-wrapper">
            <div class="progress-bar" id="${id}-bar" style="width:0%"></div>
          </div>
        </div>
      </div>`);
  });

  try {
    await filesAPI.upload(files, (percent) => {
      itemIds.forEach((id) => {
        const bar = document.getElementById(`${id}-bar`);
        if (bar) bar.style.width = percent + '%';
      });
    });

    // Mark all as done
    itemIds.forEach((id) => {
      const status = document.getElementById(`${id}-status`);
      const bar    = document.getElementById(`${id}-bar`);
      if (status) status.textContent = '✅';
      if (bar)    bar.style.width = '100%';
    });

    Toast.success(`${files.length} file(s) uploaded successfully!`);

    // Refresh files and stats after upload
    setTimeout(async () => {
      itemIds.forEach((id) => document.getElementById(id)?.remove());
      await Promise.all([loadFiles(), loadStats()]);
    }, 1500);

  } catch (err) {
    itemIds.forEach((id) => {
      const status = document.getElementById(`${id}-status`);
      if (status) status.textContent = '❌';
    });
    Toast.error(err.message || 'Upload failed.');
  }
}

/* ============================================================
   DOWNLOAD
   ============================================================ */
async function triggerDownload(fileId, fileName) {
  try {
    Toast.info('Generating download link…', 2000);
    const data = await filesAPI.download(fileId);

    // Open the signed URL in new tab
    const a    = document.createElement('a');
    a.href     = data.downloadUrl;
    a.download = fileName;
    a.target   = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    Toast.success('Download started!');
  } catch (err) {
    Toast.error(err.message || 'Download failed.');
  }
}

/* ============================================================
   RENAME MODAL
   ============================================================ */
let renameFileId = null;

function openRenameModal(fileId, currentName) {
  renameFileId = fileId;
  const input = document.getElementById('rename-input');
  if (input) input.value = currentName;
  document.getElementById('rename-modal')?.classList.remove('hidden');
  setTimeout(() => input?.focus(), 50);
}

function closeRenameModal() {
  renameFileId = null;
  document.getElementById('rename-modal')?.classList.add('hidden');
}

/* ============================================================
   DELETE MODAL
   ============================================================ */
let deleteFileId = null;

function openDeleteModal(fileId, fileName) {
  deleteFileId = fileId;
  setEl('delete-file-name', `"${fileName}"`);
  document.getElementById('delete-modal')?.classList.remove('hidden');
}

function closeDeleteModal() {
  deleteFileId = null;
  document.getElementById('delete-modal')?.classList.add('hidden');
}

/* ============================================================
   SETUP MODALS
   ============================================================ */
function setupModals() {
  // Rename
  document.getElementById('rename-cancel')?.addEventListener('click', closeRenameModal);
  document.getElementById('rename-confirm')?.addEventListener('click', async () => {
    const name = document.getElementById('rename-input')?.value.trim();
    if (!name) return Toast.warning('Please enter a name.');
    try {
      await filesAPI.rename(renameFileId, name);
      closeRenameModal();
      Toast.success('File renamed!');
      await loadFiles();
    } catch (err) {
      Toast.error(err.message || 'Rename failed.');
    }
  });

  // Delete
  document.getElementById('delete-cancel')?.addEventListener('click', closeDeleteModal);
  document.getElementById('delete-confirm')?.addEventListener('click', async () => {
    try {
      await filesAPI.delete(deleteFileId);
      closeDeleteModal();
      Toast.success('File deleted.');
      await Promise.all([loadFiles(), loadStats()]);
    } catch (err) {
      Toast.error(err.message || 'Delete failed.');
    }
  });

  // Close modals on overlay click
  document.querySelectorAll('.modal-overlay').forEach((overlay) => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeRenameModal();
        closeDeleteModal();
      }
    });
  });

  // Enter key for rename
  document.getElementById('rename-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('rename-confirm')?.click();
    if (e.key === 'Escape') closeRenameModal();
  });
}

/* ============================================================
   STAR TOGGLE
   ============================================================ */
async function toggleFileStar(fileId, btn) {
  try {
    const data = await filesAPI.toggleStar(fileId);
    btn.textContent = data.isStarred ? '★' : '☆';
    btn.style.color = data.isStarred ? 'var(--warning)' : '';
    const file = state.files.find((f) => f.id === fileId);
    if (file) file.isStarred = data.isStarred;
  } catch (err) {
    Toast.error('Failed to update star.');
  }
}

/* ============================================================
   LOGOUT
   ============================================================ */
function setupLogout() {
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    Auth.clearSession();
    Toast.info('Logged out successfully.');
    setTimeout(() => (window.location.href = 'login.html'), 600);
  });
}

/* ============================================================
   HELPERS
   ============================================================ */
function setEl(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function showSkeletons() {
  const grid = document.getElementById('files-grid');
  if (!grid) return;
  grid.innerHTML = Array(8).fill(`<div class="skeleton skeleton-card"></div>`).join('');
}

function updateFileCount() {
  const el = document.getElementById('total-files-nav');
  if (el) el.textContent = state.files.length;
}
