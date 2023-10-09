import BadRequestError from '../errors/badRequestError.js';
import NotFoundError from '../errors/notFoundError.js';
import LeaveRequest from '../models/leaveRequest.js';
import User from '../models/User.js';
import {parse, format } from 'date-fns';

const getLeaveRequests = async (req,res) => {
    try{
        const leaveRequest = await LeaveRequest.find({isDeleted: false})
        if(!leaveRequest) {
            throw new NotFoundError('Not found any leave request')
        }
        res.status(200).json(leaveRequest);
    }catch(err){
        throw err
    }
};

const getLeaveRequest = async (req,res) =>{
    const {_id} = req.params;
    try{
        const leaveRequest = await LeaveRequest.findById(_id)
        if (leaveRequest && leaveRequest.isDeleted === false) {
            res.status(200).json(leaveRequest);
          } else if (leaveRequest && leaveRequest.isDeleted === true) {
            res.status(410).send("Leave request is deleted");
          } else {
            throw new NotFoundError("Leave request not found");
          }
    }catch(err){
        throw err
    }
};
const getLeaveRequestsByUserId = async (req,res) =>{
    try {
        const _id = req.params._id;
        const user = User.findById(_id);
        if (!user)
            throw new NotFoundError(
            `The leave requests with user _id ${_id} does not exists`
            );
        else if (user.isDeleted === true) {
            res.status(410).send("User is deleted");
        } else {
            const leaveRequests = await LeaveRequest.find({ userId: _id , isDeleted: false});
            if (leaveRequests.length === 0)
            throw new NotFoundError(`Not found leave requests in user id ${_id}`);

            res.status(200).json(leaveRequests);
        }
    } catch (err) {
        throw err;
    }
};

const postLeaveRequest = async (req,res) =>{
    const {reason, status, userId, endDate} = req.body;
    try{
        const leaveRequestExist = await LeaveRequest.findOne({userId}); 
        const currentDate = new Date(); 
        const endDay = parse(endDate, 'dd/MM/yyyy', new Date());
        const isoEndDayStr = format(endDay, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        const twentyFourHoursInMilliseconds = 24 * 60 * 60 * 1000;
        if((endDay.getFullYear() < currentDate.getFullYear()
        ||(endDay.getFullYear() === currentDate.getFullYear() && endDay.getMonth() + 1 < currentDate.getMonth())
        ||(endDay.getFullYear() === currentDate.getFullYear() && endDay.getMonth() + 1 === currentDate.getMonth() 
            && endDay.getDate() < currentDate.getDate())))
        {
            throw new BadRequestError
            (`The end date cannot be past the beginning date`)
        }
        if(leaveRequestExist && ((currentDate - leaveRequestExist.createdAt) / twentyFourHoursInMilliseconds > 1) 
        && (leaveRequestExist.isDeleted === false))
        {
            throw new BadRequestError
            (`The employee with the given ${leaveRequestExist.userId} requested leave in the past.`)
        }
        else if(leaveRequestExist 
        && ((currentDate - leaveRequestExist.createdAt) / twentyFourHoursInMilliseconds < 1) 
        && ((currentDate - leaveRequestExist.createdAt) / twentyFourHoursInMilliseconds > 0) 
        && (leaveRequestExist.isDeleted === true))
        {
            leaveRequestExist.reason = reason;
            leaveRequestExist.status = status;
            leaveRequestExist.endDate = isoEndDayStr;
            const newLeaveRequest = await leaveRequestExist.save()
            res.status(201).json({
                message: 'restore leave request successfully',
                leaveRequest: newLeaveRequest,
            })
        }
        else if (!leaveRequestExist){
            const newLeaveRequest = new LeaveRequest({reason, status, userId, endDate: isoEndDayStr});
            await newLeaveRequest.save()
                res.status(200).json({
                    message: 'Create Leave Request successfully',
                    leaveRequest: newLeaveRequest,
                })
        }
        
    }catch(err){
        throw err;
    }
};

const updateLeaveRequest = async (req,res) => {
    const {_id}= req.params;
    const {reason, status, userId, endDate} = req.body;
    const endDay = parse(endDate, 'dd/MM/yyyy', new Date());
    const isoEndDayStr = format(endDay, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
    const leaveRequestExist = await LeaveRequest.findById(_id);
    if(!leaveRequestExist) {
        throw new NotFoundError('Not found Leave Request');
    }
    else{
        leaveRequestExist.reason = reason||leaveRequestExist.reason;
        leaveRequestExist.status = status||leaveRequestExist.status;
        leaveRequestExist.endDate = isoEndDayStr||leaveRequestExist.endDate;
    }
    try{
        const updateLeaveRequest = await leaveRequestExist.save();
        res.status(200).json(updateLeaveRequest)
    }
    catch(err){
        throw err
    }
};

const deleteLeaveRequest = async (req,res) => {
    const {_id} = req.params;
    try{
        const leaveRequestExist = await LeaveRequest.findByIdAndUpdate(_id,{ isDeleted: true},{new: true});
        res.status(200).json({
            message: 'Deleted Leave Request successfully',
            leaveRequest: leaveRequestExist,
        })
    }
    catch(err){
        throw err
    }
}

export {getLeaveRequests,getLeaveRequest,getLeaveRequestsByUserId,postLeaveRequest,updateLeaveRequest,deleteLeaveRequest}