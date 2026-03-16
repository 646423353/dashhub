import { uploadFields } from '../middleware/upload.js';

/**
 * 上传文件
 * POST /api/upload
 */
export const uploadFiles = async (req, res) => {
  try {
    // Process files
    const uploadedFiles = {};

    if (req.files) {
      if (req.files.logo) {
        uploadedFiles.logo = `/uploads/images/${req.files.logo[0].filename}`;
      }
      // cover 支持多张，返回路径数组
      if (req.files.cover && req.files.cover.length > 0) {
        uploadedFiles.cover = req.files.cover.map(f => `/uploads/images/${f.filename}`);
      }
      // video 支持多个，返回路径数组
      if (req.files.video && req.files.video.length > 0) {
        uploadedFiles.video = req.files.video.map(f => `/uploads/videos/${f.filename}`);
      }
      if (req.files.avatar) {
        uploadedFiles.avatar = `/uploads/avatars/${req.files.avatar[0].filename}`;
      }
    }

    res.json({
      success: true,
      message: 'Files uploaded successfully',
      data: uploadedFiles
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload files'
    });
  }
};

// Export the upload middleware
export { uploadFields };
