const { Router } = require('express');
const authController = require('../controllers/authController');
const { isValidResetToken } = require('../middlewares/user');

// initial auth routes
const router = Router();

// auth routes
router.post('/login', authController.login_post);

router.get('/logout', authController.logout_post);

router.post('/forget-password', authController.forget_password);
router.get('/favicon.ico', ()=>{});

router.get('/reset-password', (req, res) => res.render('resetPassword', {
    token: req.query.token,
    id: req.query.id
    }));

router.post('/reset-password', isValidResetToken, authController.reset_password);
module.exports = router;