const path = require('path');
const { DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const File = require('../models/File');
const User = require('../models/User');
const s3Client = require('../config/s3');

/**
 * @desc    Upload one or more files to AWS S3
 * @route   POST /api/files/upload
 * @access  Private
 */
const uploadFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded.',
      });
    }

    const uploadedFiles = [];
    let totalSize = 0;

    for (const file of req.files) {
      const extension = path.extname(file.originalname).toLowerCase().replace('.', '');
      const category = File.getCategory(file.mimetype);

      // Save file metadata to MongoDB
      const newFile = await File.create({
        userId: req.user._id,
        originalName: file.originalname,
        displayName: file.originalname,
        s3Key: file.key,
        s3Url: file.location,
        mimeType: file.mimetype,
        size: file.size,
        extension: extension || 'unknown',
        category,
      });

      uploadedFiles.push({
        id: newFile._id,
        name: newFile.displayName,
        size: newFile.size,
        mimeType: newFile.mimeType,
        category: newFile.category,
        extension: newFile.extension,
        uploadedAt: newFile.createdAt,
      });

      totalSize += file.size;
    }

    // Update user's storage used
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { storageUsed: totalSize },
    });

    res.status(201).json({
      success: true,
      message: `${uploadedFiles.length} file(s) uploaded successfully!`,
      files: uploadedFiles,
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading files.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get all files for the current user (with optional search)
 * @route   GET /api/files
 * @access  Private
 */
const getFiles = async (req, res) => {
  try {
    const {
      search = '',
      category = '',
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 50,
    } = req.query;

    // Build query
    const query = { userId: req.user._id };

    if (search) {
      query.displayName = { $regex: search, $options: 'i' };
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    // Sort options
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = { [sortBy]: sortOrder };

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const files = await File.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await File.countDocuments(query);

    // Format file data
    const formattedFiles = files.map((file) => ({
      id: file._id,
      name: file.displayName,
      originalName: file.originalName,
      size: file.size,
      mimeType: file.mimeType,
      category: file.category,
      extension: file.extension,
      isStarred: file.isStarred,
      downloadCount: file.downloadCount,
      uploadedAt: file.createdAt,
      updatedAt: file.updatedAt,
    }));

    res.json({
      success: true,
      files: formattedFiles,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('GetFiles Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching files.' });
  }
};

/**
 * @desc    Get a pre-signed download URL for a file
 * @route   GET /api/files/:id/download
 * @access  Private
 */
const downloadFile = async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found.',
      });
    }

    // Generate a pre-signed URL valid for 15 minutes
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: file.s3Key,
      ResponseContentDisposition: `attachment; filename="${file.displayName}"`,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

    // Increment download counter
    await File.findByIdAndUpdate(file._id, { $inc: { downloadCount: 1 } });

    res.json({
      success: true,
      downloadUrl: signedUrl,
      fileName: file.displayName,
      expiresIn: 900,
    });
  } catch (error) {
    console.error('Download Error:', error);
    res.status(500).json({ success: false, message: 'Error generating download link.' });
  }
};

/**
 * @desc    Delete a file from S3 and MongoDB
 * @route   DELETE /api/files/:id
 * @access  Private
 */
const deleteFile = async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found.',
      });
    }

    // Delete from AWS S3
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: file.s3Key,
    });
    await s3Client.send(deleteCommand);

    // Update user's storage used
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { storageUsed: -file.size },
    });

    // Delete from MongoDB
    await File.findByIdAndDelete(file._id);

    res.json({
      success: true,
      message: 'File deleted successfully.',
    });
  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({ success: false, message: 'Error deleting file.' });
  }
};

/**
 * @desc    Rename a file (updates displayName in MongoDB)
 * @route   PATCH /api/files/:id/rename
 * @access  Private
 */
const renameFile = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a new file name.',
      });
    }

    const file = await File.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found.',
      });
    }

    // Preserve original extension when renaming
    const originalExt = path.extname(file.originalName);
    const newExt = path.extname(name);
    const newName = newExt ? name : name + originalExt;

    file.displayName = newName;
    await file.save();

    res.json({
      success: true,
      message: 'File renamed successfully.',
      file: {
        id: file._id,
        name: file.displayName,
        updatedAt: file.updatedAt,
      },
    });
  } catch (error) {
    console.error('Rename Error:', error);
    res.status(500).json({ success: false, message: 'Error renaming file.' });
  }
};

/**
 * @desc    Toggle star status for a file
 * @route   PATCH /api/files/:id/star
 * @access  Private
 */
const toggleStar = async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, userId: req.user._id });

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found.' });
    }

    file.isStarred = !file.isStarred;
    await file.save();

    res.json({
      success: true,
      isStarred: file.isStarred,
      message: file.isStarred ? 'File starred.' : 'File unstarred.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating file.' });
  }
};

/**
 * @desc    Get storage statistics for current user
 * @route   GET /api/files/stats
 * @access  Private
 */
const getStorageStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // File counts per category
    const categoryStats = await File.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: '$category', count: { $sum: 1 }, totalSize: { $sum: '$size' } } },
    ]);

    // Recent uploads (last 5)
    const recentFiles = await File.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('displayName size category extension createdAt mimeType');

    const totalFiles = await File.countDocuments({ userId: req.user._id });

    res.json({
      success: true,
      stats: {
        storageUsed: user.storageUsed,
        storageLimit: user.storageLimit,
        storagePercentage: ((user.storageUsed / user.storageLimit) * 100).toFixed(1),
        totalFiles,
        categoryBreakdown: categoryStats,
        recentFiles: recentFiles.map((f) => ({
          id: f._id,
          name: f.displayName,
          size: f.size,
          category: f.category,
          extension: f.extension,
          mimeType: f.mimeType,
          uploadedAt: f.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('Stats Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching storage stats.' });
  }
};

module.exports = {
  uploadFiles,
  getFiles,
  downloadFile,
  deleteFile,
  renameFile,
  toggleStar,
  getStorageStats,
};
