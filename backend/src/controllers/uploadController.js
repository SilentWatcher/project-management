import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Get allowed file types from env or use defaults
const ALLOWED_TYPES = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(',');
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880'); // 5MB default

// Create Cloudinary storage for general images
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'project-management/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
  },
});

// Create Cloudinary storage for avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'project-management/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 200, height: 200, crop: 'fill', gravity: 'face', quality: 'auto' },
    ],
  },
});

// Create Cloudinary storage for task attachments
const attachmentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'project-management/attachments',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx'],
    resource_type: 'auto',
  },
});

// Multer upload configs
export const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed. Allowed types: ${ALLOWED_TYPES.join(', ')}`), false);
    }
  },
});

export const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed. Allowed types: ${ALLOWED_TYPES.join(', ')}`), false);
    }
  },
});

export const uploadAttachment = multer({
  storage: attachmentStorage,
  limits: { fileSize: MAX_FILE_SIZE * 2 }, // 10MB for attachments
  fileFilter: (req, file, cb) => {
    const allowedAttachments = [...ALLOWED_TYPES, 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedAttachments.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  },
});

// @desc    Upload single image
// @route   POST /api/upload/image
// @access  Private
export const uploadImageCtrl = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'fail', message: 'No file uploaded' });
    }

    res.status(201).json({
      status: 'success',
      data: {
        url: req.file.path,
        publicId: req.file.filename,
        secureUrl: req.file.path,
        format: req.file.format,
        width: req.file.width,
        height: req.file.height,
        bytes: req.file.size,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: error.message });
  }
};

// @desc    Upload avatar image
// @route   POST /api/upload/avatar
// @access  Private
export const uploadAvatarCtrl = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'fail', message: 'No file uploaded' });
    }

    res.status(201).json({
      status: 'success',
      data: {
        url: req.file.path,
        publicId: req.file.filename,
        secureUrl: req.file.path,
        format: req.file.format,
        width: req.file.width,
        height: req.file.height,
        bytes: req.file.size,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: error.message });
  }
};

// @desc    Upload task attachment
// @route   POST /api/upload/task/:taskId
// @access  Private
export const uploadTaskAttachmentCtrl = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'fail', message: 'No file uploaded' });
    }

    res.status(201).json({
      status: 'success',
      data: {
        url: req.file.path,
        publicId: req.file.filename,
        secureUrl: req.file.path,
        format: req.file.format || req.file.mimetype,
        bytes: req.file.size,
        originalName: req.file.originalname,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: error.message });
  }
};

// @desc    Delete uploaded image
// @route   DELETE /api/upload/:publicId
// @access  Private
export const deleteImageCtrl = async (req, res) => {
  try {
    const { publicId } = req.params;
    
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      res.status(200).json({ status: 'success', message: 'Image deleted successfully' });
    } else {
      res.status(404).json({ status: 'fail', message: 'Image not found' });
    }
  } catch (error) {
    res.status(500).json({ status: 'fail', message: error.message });
  }
};

export default {
  uploadImageCtrl,
  uploadAvatarCtrl,
  uploadTaskAttachmentCtrl,
  deleteImageCtrl,
};
