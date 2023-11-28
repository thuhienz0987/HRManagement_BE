import { Router } from 'express';
import handleRefreshToken from '../controllers/refreshController.js';

// init refresh token router
const router = Router();


// refresh token router
router.post('/refresh', handleRefreshToken);

export default router;