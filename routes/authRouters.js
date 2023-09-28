import { Router } from 'express';
import {login_post, logout_post, forget_password, reset_password} from '../controllers/authController.js';
import  isValidResetToken from '../middlewares/user.js';


// initial auth routes
const router = Router();

// auth routes
router.post('/login', login_post);

router.get('/logout', logout_post);

router.post('/forget-password', forget_password);
router.get('/favicon.ico', ()=>{});

router.get('/reset-password', (req, res) => res.render('resetPassword', {
    token: req.query.token,
    id: req.query.id
    }));

router.post('/reset-password', isValidResetToken, reset_password);
export default router;