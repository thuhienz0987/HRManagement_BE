import BadRequestError from '../errors/badRequestError.js';
import NotFoundError from '../errors/notFoundError.js';
import Division from '../models/Division.js'
import Department from '../models/Department.js';

const getDivisions = async (req,res) => {
    try{
        const division = await Division.find({isDeleted: false})
        if(!division) {
            throw new NotFoundError('Not found any division')
        }
        res.status(200).json(division);
    }catch(err){
        throw err
    }
};

const getDivision = async (req,res) =>{
    const {_id} = req.params;
    try{
        const division = await Division.findById(_id)
        if (division && division.isDeleted === false) {
            res.status(200).json(division);
          } else if (division && division.isDeleted === true) {
            res.status(410).send("Division is deleted");
          } else {
            throw new NotFoundError("Division not found");
          }
    }catch(err){
        throw err
    }
};
const generateDivisionCode = (divisionName) => {
    const cleanedDivisionName = divisionName.toUpperCase().replace(/\s/g, '');
    const divisionCode = cleanedDivisionName.substring(0, 3);
  
    return divisionCode;
}
const postDivision = async (req,res) =>{
    const {managerId, name} = req.body;
    try{
        const divisionExist = await Division.findOne({code: generateDivisionCode(name)});   
        if(divisionExist && divisionExist.isDeleted===true){
            divisionExist.managerId= managerId;
            divisionExist.name=name;
            divisionExist.code = generateDivisionCode(name);
            divisionExist.departmentCount = await Department.countDocuments({ divisionId: divisionExist._id, isDeleted: false });
            divisionExist.isDeleted = false;
            const newDivision = await divisionExist.save()
            const departments = await Department.find({ divisionId: divisionExist._id , isDeleted: false});
            if (departments.length === 0)
                throw new NotFoundError(`Not found department in division id ${divisionExist._id}`);
            else {
                departments.map(async (department) => {
                    department.divisionId = newDivision._id;
                    await department.save();
                });
            }
            res.status(201).json({
                message: 'restore Division successfully',
                division: newDivision,
            })
        }
        else if (!divisionExist){
            const division = new Division({
                name, 
                managerId, 
                code: generateDivisionCode(name)
            });
            division.departmentCount = await Department.countDocuments({ divisionId: division._id, isDeleted: false  });
            const newDivision = await division.save()
            res.status(200).json({
                message: 'Create Division successfully',
                division: newDivision,
            })
        }
        else{
            throw new BadRequestError(`Division with code ${divisionExist.name} exist`)
        }

    }catch(err){
        throw err;
    }
};

const updateDivision = async (req,res) => {
    const {_id}= req.params;
    const {managerId,name} = req.body;
    const division = await Division.findById(_id);
    if(!division) {
        throw new NotFoundError('Not found division');
    }
    division.managerId= managerId||division.managerId;
    division.name=name||division.name;
    division.departmentCount= await Department.countDocuments({ divisionId: _id, isDeleted: false  })||division.departmentCount;
    try{
        const updateDivision = await division.save();
        res.status(200).json(updateDivision)
    }
    catch(err){
        throw err
    }
};

const deleteDivision = async (req,res) => {
    const {_id} = req.params;
    try{
        const departments = await Department.find({ divisionId: _id , isDeleted: false});
        if (departments.length === 0)
            throw new NotFoundError(`Not found department in division id ${_id}`);
        else {
            departments.map(async (department) => {
                department.isDeleted = true;
                await department.save();
            });
        }
        const division = await Division.findByIdAndUpdate(_id,{ isDeleted: true},{new: true});
        res.status(200).json({
            message: 'Deleted Division successfully',
            division: division,
        })
    }
    catch(err){
        throw err
    }
}

export {getDivisions,getDivision,postDivision,updateDivision,deleteDivision}
