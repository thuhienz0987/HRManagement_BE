import NotFoundError from "../errors/notFoundError.js";
import Holiday from "../models/Holiday.js";
import {parse, format } from 'date-fns'

const getHolidays = async (req,res) =>{
    try{
        const holiday = await Holiday.find({isDeleted: false})
        if(!holiday){
            throw new NotFoundError('Not found any holiday')
        }
        res.status(200).json(holiday);

    }catch(err){
        throw err
    }
};

const getHoliday = async(req,res) =>{
    const {id}= req.params;
    try{
        const holiday = await Holiday.findById(id);
        if (holiday && holiday.isDeleted === false) {
            res.status(200).json(holiday);
          } else if (holiday && holiday.isDeleted === true) {
            res.status(410).send("Holiday is deleted");
          } else {
            throw new NotFoundError("Holiday not found");
          }
    }catch(err){
        throw err
    }
   
};

const postHoliday = async (req,res) =>{
    try{
        const {day,name,code} = req.body
        const dateObj = parse(day, 'dd/MM/yyyy', new Date());
        const isoDateStr = format(dateObj, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        const holidayExist = await Holiday.findOne({day: isoDateStr});
        
        if(holidayExist&&holidayExist.isDeleted===true){
            console.log('hi')
            holidayExist.code = code;
            holidayExist.name= name;
            holidayExist.day= isoDateStr;
            holidayExist.isDeleted = false;
            const newHoliday = await holidayExist.save();
            res.status(201).json({
                message: 'restore holiday successfully',
                holiday: newHoliday,
            })
        }
        else if(!holidayExist){
            const holiday = new Holiday({day: isoDateStr,name, code})
            const newHoliday = await holiday.save()
            res.status(200).json({
                message: 'Create holiday successfully',
                holiday: newHoliday,
            })
        }
    }catch(err){
        throw err
    }
};

const updateHoliday = async (req,res) =>{
    const {id}= req.params;
    const {day,name,code} = req.body;
    const dateObj = parse(day, 'dd/MM/yyyy', new Date());
    const isoDateStr = format(dateObj, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

    const holiday = await Holiday.findById(id)
        if(!holiday){
            throw new NotFoundError('Not found holiday')
        }
        holiday.day = day ? isoDateStr : holiday.day;
        holiday.name = name ? name : holiday.name;
        holiday.code =code ? code : holiday.code;
    try{
        const updateHoliday = await holiday.save();
        res.status(200).json(updateHoliday);

    }catch(err){
        throw err
    }
};

const deleteHoliday = async (req,res) =>{
    const {id} = req.params;
    try{
        const holiday = await Holiday.findByIdAndUpdate(id,{isDeleted: true},{new: true});
        res.status(200).json({
            message: 'Deleted holiday successfully',
            holiday: holiday,
        })
    }catch(err){
        throw err
    }
};

export {getHolidays,getHoliday,postHoliday,updateHoliday,deleteHoliday}