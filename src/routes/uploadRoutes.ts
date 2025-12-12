import { Router } from 'express';
import { UploadController } from '../controllers/uploadController';
import { upload } from '../middleware/upload';

const router = Router();

router.post('/', upload.single('file'), UploadController.uploadSVG);

export default router;

