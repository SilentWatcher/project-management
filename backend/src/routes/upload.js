import express from 'express';
import {
  uploadImage,
  uploadAvatar,
  uploadAttachment,
  uploadImageCtrl,
  uploadAvatarCtrl,
  uploadTaskAttachmentCtrl,
  deleteImageCtrl,
} from '../controllers/uploadController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Upload endpoints
router.post('/image', uploadImage.single('file'), uploadImageCtrl);
router.post('/avatar', uploadAvatar.single('file'), uploadAvatarCtrl);
router.post('/task/:taskId', uploadAttachment.single('file'), uploadTaskAttachmentCtrl);

// Delete image
router.delete('/:publicId', deleteImageCtrl);

export default router;
