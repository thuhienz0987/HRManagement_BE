const { Router } = require('express');
const refreshController = require('../controllers/refreshController');

// init refresh token router
const router = Router();


// refresh token router
router.get('/refresh', refreshController.handleRefreshToken);

module.exports = router;