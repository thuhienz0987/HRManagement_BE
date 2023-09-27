import BadRequestError from '../errors/badRequestError.js';
import NotFoundError from '../errors/notFoundError.js'
import Role from '../models/Role.js'

const getRoles = async (req,res) => {
    try{
        const role = await Role.find({isDeleted: false})
        if(!role) {
            throw new NotFoundError('Not found any role')
        }
        res.status(200).json(role);
    }catch(err){
        throw err
    }
};

const getRole = async (req,res) =>{
    const {id} = req.params;
    try{
        const role = await Role.findById(id)
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
    const {code, name, basicSalary} = req.body;
    try{
        const roleExist = await Role.findOne({code});   
        if(roleExist && roleExist.isDeleted===true){
            roleExist.code= code;
            roleExist.name=name;
            roleExist.basicSalary= basicSalary;
            const newRole = await roleExist.save()
            res.status(201).json({
                message: 'restore Role successfully',
                role: newRole,
            })
        }
        else if (!roleExist){
            const role = new Role({code,name, basicSalary});
            const newRole = await role.save()
            res.status(200).json({
                message: 'Create Role successfully',
                role: newRole,
            })
        }
        else{
            throw new BadRequestError(`Role with code ${roleExist.code} exist`)
        }

    }catch(err){
        throw err;
    }
};

const updateRole = async (req,res) => {
    const {id}= req.params;
    const {code,name,basicSalary} = req.body;
    const role = await Role.findById(id);
    if(!role) {
        throw new NotFoundError('Not found role');
    }
    role.code= code;
    role.name=name;
    role.basicSalary= basicSalary;
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
        const role = await Role.findByIdAndUpdate(id,{ isDeleted: true},{new: true});
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
