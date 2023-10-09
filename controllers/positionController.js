import BadRequestError from '../errors/badRequestError.js';
import NotFoundError from '../errors/notFoundError.js';
import Position from '../models/Position.js';

const getPositions = async (req,res) => {
    try{
        const position = await Position.find({isDeleted: false})
        if(!position) {
            throw new NotFoundError('Not found any position')
        }
        res.status(200).json(position);
    }catch(err){
        throw err
    }
};

const getPosition = async (req,res) =>{
    const {_id} = req.params;
    try{
        const position = await Position.findById(_id)
        if (position && position.isDeleted === false) {
            res.status(200).json(position);
          } else if (position && position.isDeleted === true) {
            res.status(410).send("Position is deleted");
          } else {
            throw new NotFoundError("Position not found");
          }
    }catch(err){
        throw err
    }
};

const postPosition = async (req,res) =>{
    const {code, name, basicSalary} = req.body;
    try{
        const positionExist = await Position.findOne({code});   
        if(positionExist && positionExist.isDeleted===true){
            positionExist.code= code ;
            positionExist.name=name;
            positionExist.basicSalary= basicSalary;
            positionExist.isDeleted= false;
            const newPosition = await positionExist.save()
            res.status(201).json({
                message: 'restore Position successfully',
                position: newPosition,
            })
        }
        else if (!positionExist){
            const position = new Position({code,name, basicSalary});
            const newPosition = await position.save()
            res.status(200).json({
                message: 'Create Position successfully',
                position: newPosition,
            })
        }
        else{
            throw new BadRequestError(`Position with code ${positionExist.code} exist`)
        }

    }catch(err){
        throw err;
    }
};

const updatePosition = async (req,res) => {
    const {_id}= req.params;
    const {code,name,basicSalary} = req.body;
    const position = await Position.findById(_id);
    if(!position) {
        throw new NotFoundError('Not found Position');
    }
    position.code= code ? code : position.code;
    position.name=name ? name : position.name;
    position.basicSalary= basicSalary ? basicSalary : position.basicSalary;
    try{ 
        const updatePosition = await position.save();
        res.status(200).json(updatePosition)
    }
    catch(err){
        throw err
    }
};

const deletePosition = async (req,res) => {
    const {_id} = req.params;
    try{
        const position = await Position.findByIdAndUpdate(_id,{ isDeleted: true},{new: true});
        res.status(200).json({
            message: 'Deleted Position successfully',
            position: position,
        })
    }
    catch(err){
        throw err
    }
}

export {getPositions,getPosition,postPosition,updatePosition,deletePosition}
