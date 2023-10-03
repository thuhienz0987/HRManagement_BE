import BadRequestError from '../errors/badRequestError.js';
import NotFoundError from '../errors/notFoundError.js';
import Department from '../models/Department.js';
import Division from '../models/Division.js';
import User from '../models/User.js';

const getDepartments = async (req,res) => {
    try{
        const department = await Department.find({isDeleted: false})
        if(!department) {
            throw new NotFoundError('Not found any department')
        }
        res.status(200).json(department);
    }catch(err){
        throw err
    }
};
const getDepartmentsByDivisionId = async (req,res) =>{
    try {
    const _id = req.params._id;
    const division = Division.findById(_id);
    if (!division)
        throw new NotFoundError(
        `The departments with division _id ${_id} does not exists`
        );
    else if (division.isDeleted === true) {
        res.status(410).send("Division is deleted");
    } else {
        const department = await Department.find({ divisionId: _id , isDeleted: false});
        if (department.length === 0)
        throw new NotFoundError(`Not found department in division id ${_id}`);

        res.status(200).json(department);
    }
    } catch (err) {
    throw err;
    }
};

const getDepartment = async (req,res) =>{
    const {_id} = req.params;
    try{
        const department = await Department.findById(_id)
        if (department && department.isDeleted === false) {
            res.status(200).json(department);
          } else if (department && department.isDeleted === true) {
            res.status(410).send("Department is deleted");
          } else {
            throw new NotFoundError("Department not found");
          }
    }catch(err){
        throw err
    }
};
const generateDepartmentCode = (departmentName, divisionName) => {
    const cleanedDepartmentName = departmentName.toUpperCase().replace(/\s/g, '');
    const cleanedDivisionName = divisionName.toUpperCase().replace(/\s/g, '');
    const departmentCode = cleanedDivisionName.substring(0, 3) + '_' + cleanedDepartmentName.substring(0, 3);
  
    return departmentCode;
}
const postDepartment = async (req,res) =>{
    const {managerId, name, divisionId} = req.body;
    try{
        const division = await Division.findOne({_id: divisionId});
        if (!division)
            throw new NotFoundError(
            `The departments with division _id ${divisionId} does not exists`
        );
        else if (division.isDeleted === true) {
            res.status(410).send("Division is deleted");
        } 
        else {
            const departmentExist = await Department.findOne({code: generateDepartmentCode(name,division.name)});   
            if(departmentExist && departmentExist.isDeleted===true){
                departmentExist.managerId= managerId;
                departmentExist.name=name;
                departmentExist.divisionId= divisionId;
                departmentExist.employeeCount = await User.countDocuments({ departmentId: departmentExist._id, isDeleted: false});
                departmentExist.code = generateDepartmentCode(name,division.name);
                departmentExist.isDeleted = false;
                const newDepartment = await departmentExist.save();
                division.departmentCount = await Department.countDocuments({ divisionId: divisionId, isDeleted: false  });
                await division.save();
                res.status(201).json({
                    message: 'restore Department successfully',
                    department: newDepartment,
                })
            }
            else if (!departmentExist){
                const department = new Department({divisionId,name, managerId, code: generateDepartmentCode(name,division.name)});
                department.employeeCount = await User.countDocuments({ departmentId: department._id, isDeleted: false});
                const newDepartment = await department.save();
                division.departmentCount = await Department.countDocuments({ divisionId: divisionId, isDeleted: false  });
                await division.save();
                res.status(200).json({
                    message: 'Create Department successfully',
                    department: newDepartment,
                })
            }
            else{
                throw new BadRequestError(`Department with code ${departmentExist.name} exist`)
            }
        }
    }catch(err){
        throw err;
    }
};

const updateDepartment = async (req,res) => {
    try{
        const {_id}= req.params;
        const {managerId,name,divisionId} = req.body;
        const division = await Division.findOne({_id: divisionId});
        if (!division)
            throw new NotFoundError(
            `The departments with division _id ${divisionId} does not exists`
        );
        else if (division.isDeleted === true) {
            res.status(410).send(`Division with _id ${divisionId} is deleted`);
        } 
        else {
            const department = await Department.findById(_id);
            const departmentOld = await Department.findById(_id);
            if(!department) {
                throw new NotFoundError('Not found department');
            }
            department.managerId= managerId||department.managerId;
            department.name=name||department.name;
            department.divisionId= divisionId||department.divisionId;
            department.code = generateDepartmentCode(name,division.name)||department.code;
            
            const updateDepartment = await department.save();
            const divisionOld = await Division.findOne({_id: departmentOld.divisionId});
            if (!divisionOld)
                throw new NotFoundError(
                `The departments with division _id ${departmentOld.divisionId} does not exists`
            );
            else if (divisionOld.isDeleted === true) {
                res.status(410).send(`Division with _id ${departmentOld.divisionId} is deleted`);
            } 
            else {
                divisionOld.departmentCount = await Department.countDocuments({ divisionId: departmentOld.divisionId, isDeleted: false  });
                await divisionOld.save();
            }
            division.departmentCount = await Department.countDocuments({ divisionId: divisionId, isDeleted: false  });
            await division.save();
            res.status(200).json(updateDepartment);
        }
    }
    catch(err){
        throw err
    }
};

const deleteDepartment = async (req,res) => {
    const {_id} = req.params;
    try{
        const department = await Department.findByIdAndUpdate(_id,{ isDeleted: true},{new: true});
        const users = await User.find({ departmentId: _id , isDeleted: false});
        if (users.length === 0)
            throw new NotFoundError(`Not found user in department id ${_id}`);
        else {
            users.map(async (user) => {
                user.isDeleted = true;
                await user.save();
            });
        }
        const divisionOld = await Division.findOne({_id: department.divisionId});
        if (!divisionOld)
            throw new NotFoundError(
            `The departments with division _id ${department.divisionId} does not exists`
        );
        else if (divisionOld.isDeleted === true) {
            res.status(410).send(`Division with _id ${department.divisionId} is deleted`);
        } 
        else {
            divisionOld.departmentCount = await Department.countDocuments({ divisionId: department.divisionId, isDeleted: false });
            await divisionOld.save();
        }
        res.status(200).json({
            message: 'Deleted Department successfully',
            department: department,
        })
    }
    catch(err){
        throw err
    }
}

export {getDepartments,getDepartmentsByDivisionId,getDepartment,postDepartment,updateDepartment,deleteDepartment}
