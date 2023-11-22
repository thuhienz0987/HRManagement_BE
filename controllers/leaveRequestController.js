import ROLES_LIST from '../config/roles_list.js';
import BadRequestError from '../errors/badRequestError.js';
import NotFoundError from '../errors/notFoundError.js';
import LeaveRequest from '../models/LeaveRequest.js';
import User from '../models/User.js';
import {parse, format } from 'date-fns';

const getLeaveRequests = async (req,res) => {
    try{
        const leaveRequest = await LeaveRequest.find({isDeleted: false}).populate('userId')
        if(!leaveRequest) {
            throw new NotFoundError('Not found any leave request')
        }
        res.status(200).json(leaveRequest);
    }catch(err){
        throw err
    }
};

const getLeaveRequest = async (req,res) =>{
    const {id} = req.params;
    try{
        const leaveRequest = await LeaveRequest.findById(id).populate('userId')
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
        const id = req.params.id;
        const user = await User.findById(id);
        if (!user)
            throw new NotFoundError(
            `User with id ${id} does not exists`
            );
        else if (user && user.isDeleted === true) {
            res.status(410).send("User is deleted");
        } else {
            const leaveRequests = await LeaveRequest.find({ userId: id , isDeleted: false});
            if (!leaveRequests || leaveRequests.length === 0)
            throw new NotFoundError(`Not found leave requests in user id ${id}`);

            res.status(200).json(leaveRequests);
        }
    } catch (err) {
        throw err;
    }
};

const postLeaveRequest = async (req, res) => {
    const { reason,userId, startDate, endDate } = req.body;

    try {
        const currentDate = new Date();
        const newStartDate = new Date(startDate);
        const newEndDate = new Date(endDate);
        const approver = await User.findOne({ roles: { $in: [ROLES_LIST.HRManager] } });


        // Check if the start date is greater than the current date
        if (newStartDate <= currentDate) {
            throw new BadRequestError(`The start date must be later than the current date.`);
        }
        // Check if the start date is greater than the end date
        if (newStartDate >= newEndDate) {
            throw new BadRequestError('The start date must be earlier than the end date.');
        }

        // Check for overlapping leave requests for the specified user
        const overlappingRequests = await LeaveRequest.find({
            userId,
            isDeleted: false,
            $or: [
                {
                    startDate: { $gte: newStartDate, $lt: newEndDate },
                },
                {
                    endDate: { $gt: newStartDate, $lte: newEndDate },
                },
                {
                    startDate: { $lte: newStartDate },
                    endDate: { $gte: newEndDate },
                },
            ],
        });

        // Check if there are any overlapping requests
        if (overlappingRequests.length > 0) {
            throw new BadRequestError(`The user already has overlapping leave requests for the specified time.`);
        }

        // Create a new leave request
        const newLeaveRequest = new LeaveRequest({
            reason,
            userId,
            approverId: approver.id,
            startDate: newStartDate,
            endDate: newEndDate,
        });

        await newLeaveRequest.save();

        res.status(200).json({
            message: 'Create Leave Request successfully',
            leaveRequest: newLeaveRequest,
        });
    } catch (err) {
        throw err;
    }
};



const updateLeaveRequest = async (req, res) => {
    const { id } = req.params;
    const { reason, startDate, endDate } = req.body;

    try {
        const leaveRequestExist = await LeaveRequest.findById(id);

        if (!leaveRequestExist) {
            throw new NotFoundError('Not found Leave Request');
        }

        const newStartDate = new Date(startDate);
        const newEndDate = new Date(endDate);

        // Check if the start date is greater than the end date
        if (newStartDate >= newEndDate) {
            throw new BadRequestError('The start date must be earlier than the end date.');
        }

        // Check for overlapping leave requests for the specified user
        const overlappingRequests = await LeaveRequest.find({
            userId: leaveRequestExist.userId,
            isDeleted: false,
            id: { $ne: id }, // Exclude the current leave request
            $or: [
                {
                    startDate: { $lt: newEndDate, $gte: newStartDate },
                },
                {
                    endDate: { $gt: newStartDate, $lte: newEndDate },
                },
                {
                    startDate: { $lte: newStartDate },
                    endDate: { $gte: newEndDate },
                },
            ],
        });

        // Check if there are any overlapping requests
        if (overlappingRequests.length > 0) {
            throw new BadRequestError('The user already has overlapping leave requests for the specified time.');
        }

        // Check if the start date is in the future or is the same as the current date
        const currentDate = new Date();
        if (newStartDate < currentDate) {
            throw new BadRequestError('The start date must be in the future or the same as the current date.');
        }

        // Update leave request fields only if the new values are provided
        leaveRequestExist.reason = reason !== undefined ? reason : leaveRequestExist.reason;
        leaveRequestExist.startDate = newStartDate;
        leaveRequestExist.endDate = newEndDate;

        const updatedLeaveRequest = await leaveRequestExist.save();
        res.status(200).json(updatedLeaveRequest);
    } catch (err) {
        throw err;
    }
};

const ChangeStatus = async (req,res) =>{

    const { id } = req.params;
    const { newStatus } = req.body;

    try {
        const leaveRequest = await LeaveRequest.findById(id);

        if (!leaveRequest) {
            throw new NotFoundError('Leave Request not found');
        }

        if (!newStatus || !['approved', 'denied'].includes(newStatus)) {
            throw new BadRequestError('Invalid status provided');
        }

        if (leaveRequest.status !== 'pending') {
            throw new BadRequestError('Leave request can only be changed from "pending" status');
        }

        // Update status, approverId, and add to history
        leaveRequest.status = newStatus;
        // leaveRequest.approverId = approverId;

        // Save the leave request
        const updatedLeaveRequest = await leaveRequest.save();

        res.status(200).json({
            message: 'Status changed successfully',
            leaveRequest: updatedLeaveRequest,
        });
    } catch (err) {
        throw err;
    }
};


const deleteLeaveRequest = async (req,res) => {
    const {id} = req.params;
    try{
        const leaveRequestExist = await LeaveRequest.findByIdAndUpdate(id,{ isDeleted: true},{new: true});
        res.status(200).json({
            message: 'Deleted Leave Request successfully',
            leaveRequest: leaveRequestExist,
        })
    }
    catch(err){
        throw err
    }
}

export {getLeaveRequests,getLeaveRequest,getLeaveRequestsByUserId,postLeaveRequest,updateLeaveRequest,ChangeStatus,deleteLeaveRequest}