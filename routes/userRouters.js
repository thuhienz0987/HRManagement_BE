const { Router } = require('express');
const userController = require('../controllers/userController');
const uploads = require('../middlewares/image');

const router = Router();

router.post('/user/:_id', uploads.single('avatarImage'), userController.edit_user_profile);
router.get('/all-user', userController.get_all_user);
router.get('/user/:_id', userController.get_user_by_id);

module.exports = router;