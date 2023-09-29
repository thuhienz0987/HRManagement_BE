import BadRequestError from '../errors/badRequestError.js';
import NotFoundError from '../errors/notFoundError.js';
import Bonus from '../models/Bonus.js';

const getBonuses = async (req,res) => {
    try{
        const bonus = await Bonus.find({isDeleted: false})
        if(!bonus) {
            throw new NotFoundError('Not found any bonus')
        }
        res.status(200).json(bonus);
    }catch(err){
        throw err
    }
};

const getBonus = async (req,res) =>{
    const {id} = req.params;
    try{
        const bonus = await Bonus.findById(id)
        if (bonus && bonus.isDeleted === false) {
            res.status(200).json(bonus);
          } else if (bonus && bonus.isDeleted === true) {
            res.status(410).send("Bonus is deleted");
          } else {
            throw new NotFoundError("Bonus not found");
          }
    }catch(err){
        throw err
    }
};

const postBonus = async (req,res) =>{
    const {code, level} = req.body;
    try{
        const bonusExist = await Bonus.findOne({code});   
        if(bonusExist && bonusExist.isDeleted===true){
            bonusExist.code= code;
            bonusExist.level=level;
            const newBonus = await bonusExist.save()
            res.status(201).json({
                message: 'restore Position successfully',
                bonus: newBonus,
            })
        }
        else if (!bonusExist){
            const bonus = new Bonus({code,level});
            const newBonus = await bonus.save()
            res.status(200).json({
                message: 'Create Position successfully',
                bonus: newBonus,
            })
        }
        else{
            throw new BadRequestError(`Position with code ${bonusExist.code} exist`)
        }

    }catch(err){
        throw err;
    }
};

const updateBonus = async (req,res) => {
    const {id}= req.params;
    const {code,level} = req.body;
    const bonus = await Bonus.findById(id);
    if(!bonus) {
        throw new NotFoundError('Not found Bonus');
    }
    bonus.code= code;
    bonus.level= level;
    try{
        const updateBonus = await bonus.save();
        res.status(200).json(updateBonus)
    }
    catch(err){
        throw err
    }
};

const deleteBonus = async (req,res) => {
    const {id} = req.params;
    try{
        const bonus = await Bonus.findByIdAndUpdate(id,{ isDeleted: true},{new: true});
        res.status(200).json({
            message: 'Deleted Bonus successfully',
            bonus: bonus,
        })
    }
    catch(err){
        throw err
    }
}

export {getBonuses,getBonus,postBonus,updateBonus,deleteBonus}
