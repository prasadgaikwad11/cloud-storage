const express = require('express');
const router = express.Router();
const {
  uploadFiles,
  getFiles,
  downloadFile,
  deleteFile,
  renameFile,
  toggleStar,
  getStorageStats,
} = require('../controllers/fileController');
const { protect } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');

// All file routes are protected by JWT middleware
router.use(protect);

// @route   GET /api/files/stats  — must be before /:id routes
router.get('/stats', getStorageStats);

// @route   POST /api/files/upload
router.post('/upload', upload.array('files', 10), handleMulterError, uploadFiles);

// @route   GET /api/files
router.get('/', getFiles);

// @route   GET /api/files/:id/download
router.get('/:id/download', downloadFile);

// @route   DELETE /api/files/:id
router.delete('/:id', deleteFile);

// @route   PATCH /api/files/:id/rename
router.patch('/:id/rename', renameFile);

// @route   PATCH /api/files/:id/star
router.patch('/:id/star', toggleStar);

module.exports = router;
