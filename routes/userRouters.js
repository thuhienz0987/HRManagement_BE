import { Router } from 'express';
import {create_user, verifyEmailUser, edit_user_profile, get_all_user, get_user_by_id} from '../controllers/userController.js';
import uploads from '../middlewares/image.js';
import verifyRoles from "../middlewares/verifyRoles.js";
import ROLES_LIST from "../config/roles_list.js"

const router = Router();

router.post('/create-user', verifyRoles(ROLES_LIST.HRManager),uploads.single('avatarImage'), create_user);
router.post('/verify-email', verifyEmailUser);
router.post('/user/:_id',uploads.single('avatarImage'), edit_user_profile);
router.get('/all-user', verifyRoles(ROLES_LIST.CEO,ROLES_LIST.HRManager),get_all_user);
router.get('/user/:_id', get_user_by_id);

export default router;