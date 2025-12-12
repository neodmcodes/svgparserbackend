import { Router } from 'express';
import { DesignController } from '../controllers/designController';

const router = Router();

router.get('/', DesignController.getAllDesigns);
router.get('/:id', DesignController.getDesignById);

export default router;

