const Router = require("express");
const verifyJWT = require('../middlewares/verifyJWT.js');
const errorHandler = require("../middlewares/errorHandler");
const authRouters = require('./authRouters');
const refreshRouters = require('./refreshRouters');
const userRouters = require('./userRouters');
const roleRouter = require('./roleRouters.js');

const router = Router();

router.use(authRouters);
router.use(refreshRouters);

router.use(roleRouter);
router.use(verifyJWT);
router.get('/test', (req, res) => {res.status(200).json('OK')});
router.use(userRouters);

// error handler all routes
router.use(errorHandler);

module.exports = router