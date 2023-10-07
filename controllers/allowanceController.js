import BadRequestError from "../errors/badRequestError.js";
import NotFoundError from "../errors/notFoundError.js";
import Allowance from "../models/Allowance.js";

const getAllowances = async (req,res) =>{
    try{
        const allowance = await Allowance.find({isDeleted: false});
        if(!allowance){
            throw new NotFoundError('Not found any allowance')
        }
        res.status(200).json(allowance)
    }catch(err){
        throw err
    }
}

const getAllowance = async (req,res) =>{
    const {id} = req.params;
    try{
        const allowance = await Allowance.findById(id)
        if (allowance && allowance.isDeleted === false) {
            res.status(200).json(allowance);
        } else if (allowance && allowance.isDeleted === true) {
            res.status(410).send("allowance is deleted");
        } else {
            throw new NotFoundError("allowance not found");
        }
    }
    catch(err){
        throw err
    }
}

const postAllowance = async (req,res) =>{
    const {name,amount, code} = req.body;
    const allowanceExist = await Allowance.findOne({code});   
    try{
        if(allowanceExist.isDeleted===true){
            allowanceExist.code= code;
            allowanceExist.name= name;
            allowanceExist.amount= amount;
            allowanceExist.isDeleted= false;
            const newAllowance= await allowanceExist.save()
            res.status(201).json({
                message: 'Restore Allowance successfully',
                allowance: newAllowance,
            })
        }
        else if (!allowanceExist){
            const allowance = new Allowance({name,code,amount});
            const newAllowance = await allowance.save()
            res.status(200).json({
                message: 'Create Allowance successfully',
                allowance: newAllowance,
            })
        }
        else{
            throw new BadRequestError(`Allowance with code ${allowanceExist.code} exist`)
        }

    }catch(err){
        throw err;
    }
};

const updateAllowance = async (req,res) =>{
    const {id} = req.params
    const {name, code, amount} = req.body 
    const allowance = await Allowance.findById(id);
    if(!role) {
        throw new NotFoundError('Not found allowance');
    }
    allowance.name = name? name:allowance.name;
    allowance.amount = amount?amount:allowance.amount;
    allowance.code= code ? code :allowance.code;
    try{
        const updateAllowance = await allowance.save()
        res.status(200).json(updateAllowance)
    }catch(err){
        throw err
    }
    
};

const deleteAllowance = async  (req,res) =>{
    const {id} = req.params
    try{
        const allowance =await Allowance.findByIdAndUpdate(id,{isDeleted:true})
        res.status(200).json({
            message:'Deleted allowance successfully',
            allowance: allowance
        })
    }catch(err) {
        throw err
    }

}

export {getAllowances, getAllowance, postAllowance, updateAllowance, deleteAllowance}