import { Router } from 'express';
import {edit_user_profile, get_all_user, get_user_by_id} from '../controllers/userController.js';
import uploads from '../middlewares/image.js';

const router = Router();

router.post('/user/:_id', uploads.single('avatarImage'), edit_user_profile);
router.get('/all-user', get_all_user);
router.get('/user/:_id', get_user_by_id);

export default router;