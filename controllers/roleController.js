import BadRequestError from '../errors/badRequestError.js';
import NotFoundError from '../errors/notFoundError.js'
import Role from '../models/Role.js'

const getRoles = async (req,res) => {
    try{
        const role = await Role.find({isDeleted: false})
        if(!role) {
            throw new NotFoundError('NOT FOUND ROLE')
        }
        res.status(200).json(role);
    }catch(err){
        throw err
    }
};

const getRole = async (req,res) =>{
    const {id} = req.params;
    try{
        const role = Role.findById(id)
        if (role && role.isDeleted === false) {
            res.status(200).json(role);
          } else if (role && role.isDeleted === true) {
            res.status(410).send("role is deleted");
          } else {
            throw new NotFoundError("role not found");
          }
    }catch(err){
        throw err
    }
};

const postRole = async (req,res) =>{
    const {code, name} = req.body;
  
    
    const roleExist = await Role.findOne({code});

    const role = new Role({code,name});

    if(roleExist){
        throw new BadRequestError('role exist');
    }
    try{
        const newRole = await role.save();
        res.status(201).json(newRole);
    }catch(err){
        throw err;
    }
};

const updateRole = async (req,res) => {
    const {id}= req.params;
    const {code,name} = req.body;
    const role = await Role.findById(id);
    if(!role) {
        throw new NotFoundError('NOT FOUND');
    }
    role.code= code;
    role.name=name;
    try{
        const updateRole = await role.save();
        res.status(200).json(updateRole)
    }
    catch(err){
        throw err
    }
};

const deleteRole = async (req,res) => {
    const {id} = req.params;
    
    try{
        const role = Role.findByIdAndUpdate({id},{isDeleted: true},{new: true});
        if(!role){
            throw new BadRequestError('Role has been deleted');
        }
        res.status(200).json({
            message: 'Deleted Role successfully',
            role: role,
        })
    }
    catch(err){
        throw err
    }
}

export {getRoles,getRole,postRole,updateRole,deleteRole}
