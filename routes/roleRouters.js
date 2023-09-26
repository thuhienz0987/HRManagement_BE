const Router = require("express");
const { deleteRole, getRole, getRoles, postRole, updateRole } = require("../controllers/roleController.js");
const roleRouter = Router();

roleRouter.get('/roles',getRoles);
roleRouter.get('/role/:id',getRole);
roleRouter.post('/role',postRole);
roleRouter.put('/role/:id',updateRole);
roleRouter.delete('/role/:id',deleteRole);

module.exports = roleRouter;