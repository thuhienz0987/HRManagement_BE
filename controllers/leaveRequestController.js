import ROLES_LIST from "../config/roles_list.js";
import BadRequestError from "../errors/badRequestError.js";
import NotFoundError from "../errors/notFoundError.js";
import LeaveRequest from "../models/LeaveRequest.js";
import User from "../models/User.js";
import { parse, format, differenceInDays, isWithinInterval, max, min , subMonths,startOfMonth, endOfMonth } from "date-fns";

const getLeaveRequests = async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.find({ isDeleted: false }).populate(
      "userId"
    );
    if (!leaveRequest) {
      throw new NotFoundError("Not found any leave request");
    }
    res.status(200).json(leaveRequest);
  } catch (err) {
    throw err;
  }
};

const getLeaveRequest = async (req, res) => {
  const { id } = req.params;
  try {
    const leaveRequest = await LeaveRequest.findById(id).populate("userId");
    if (leaveRequest && leaveRequest.isDeleted === false) {
      res.status(200).json(leaveRequest);
    } else if (leaveRequest && leaveRequest.isDeleted === true) {
      res.status(410).send("Leave request is deleted");
    } else {
      throw new NotFoundError("Leave request not found");
    }
  } catch (err) {
    throw err;
  }
};
const getRemainingLeaveRequestDaysByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user)
      throw new NotFoundError(`User with id ${userId} does not exists`);
    else if (user && user.isEmployee === false) {
      res.status(410).send("User has quit");
    } else {
      const currentYear = new Date().getFullYear();
      const startDate = new Date(currentYear, 0, 1); // January 1st of the current year
      const endDate = new Date(currentYear, 11, 31);
      let leaveRequestsDays = 0;
      const leaveRequests = await LeaveRequest.find({
        userId: userId,
        status: "approved",
        isDeleted: false,
        startDate: { $gte: startDate },
        endDate: { $lte: endDate },
      });

      leaveRequests.forEach((leaveRequest) => {
        const start = new Date(leaveRequest.startDate);
        const end = new Date(leaveRequest.endDate);
        const timeDifference = Math.abs(end.getTime() - start.getTime());
        const leaveDays = Math.ceil(timeDifference / (1000 * 60 * 60 * 24)) + 1; // Adding 1 to include both start and end dates
        leaveRequestsDays += leaveDays;
      });
      let remainingLeaveRequestDays = 12 - leaveRequestsDays;

      res.status(200).json(remainingLeaveRequestDays);
    }
  } catch (err) {
    throw err;
  }
};
const getLeaveRequestsByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findOne({ _id: userId });
    if (!user)
      throw new NotFoundError(`User with id ${userId} does not exists`);
    else if (user && user.isEmployee === false) {
      res.status(410).send("User is deleted");
    } else {
      const leaveRequests = await LeaveRequest.find({
        userId: userId,
        isDeleted: false,
      }).populate("userId");
      if (!leaveRequests || leaveRequests.length === 0)
        throw new NotFoundError(
          `Not found leave requests in user id ${userId}`
        );

      res.status(200).json(leaveRequests);
    }
  } catch (err) {
    throw err;
  }
};



const getLeaveRequestsOfMonthByUserId = async (userId) => {
  try {
    const user = await User.findOne({ _id: userId });

    if (!user) {
      throw new NotFoundError(`User with id ${userId} does not exist`);
    } else if (user && user.isEmployee === false) {
      res.status(410).send("User is deleted");
    } else {
      // Xác định thời gian từ đầu đến cuối của tháng trước
      const currentDate = new Date();
      const startOfLastMonth = startOfMonth(subMonths(currentDate, 1));
      const endOfLastMonth = endOfMonth(subMonths(currentDate, 1));

      let paidLeaveDays = 0

      const leaveRequests = await LeaveRequest.find({
        userId: userId,
        isDeleted: false,
        startDate: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      }).populate("userId");
  
      if (!leaveRequests || leaveRequests.length === 0) {
        // throw new NotFoundError(`No leave requests found for user id ${userId}`);
        return {
          leaveRequests: [],
          totalLeaveDaysInMonth: 0,
          paidLeaveDays: 0,
        };
      }
  
      // Tính tổng số ngày nghỉ trong tháng
      const totalLeaveDaysInMonth = leaveRequests.reduce((totalDays, leaveRequest) => {
        const daysInMonth = calculateLeaveDaysInMonth(leaveRequest.startDate, leaveRequest.endDate, startOfLastMonth);
        if(leaveRequest.paidLeaveDays > daysInMonth){
          paidLeaveDays = paidLeaveDays + daysInMonth
        }else{
          paidLeaveDays = paidLeaveDays + leaveRequest.paidLeaveDays
        }
        return totalDays + daysInMonth;
      }, 0);
  
      return {leaveRequests,totalLeaveDaysInMonth,paidLeaveDays}
      // res.status(200).json({ leaveRequests, totalLeaveDaysInMonth, paidLeaveDays });
    }} catch (err) {
      throw err
    }
  };

const calculateLeaveDaysInMonth = (startDate, endDate, month) => {
  const startOfMonthDate = startOfMonth(month);
  const endOfMonthDate = endOfMonth(month);

  // Clip the start date to the first day of the month
  const clippedStartDate = max([startDate, startOfMonthDate]);

  // Clip the end date to the last day of the month
  const clippedEndDate = min([endDate, endOfMonthDate]);

  // Calculate the days in the month
  const daysInMonth = differenceInDays(clippedEndDate, clippedStartDate) + 1;

  return daysInMonth;
};


const postLeaveRequest = async (req, res) => {
  const { reason, userId, startDate, endDate } = req.body;

  try {
    const currentDate = new Date();
    const newStartDate = new Date(startDate);
    newStartDate.setDate(newStartDate.getDate() + 1);
    const newEndDate = new Date(endDate);
    newEndDate.setDate(newEndDate.getDate() + 1);
    const approver = await User.findOne({
      roles: { $in: [ROLES_LIST.HRManager] },
    });

    // Check if the start date is greater than the current date
    if (newStartDate < currentDate) {
      throw new BadRequestError(
        `The start date must be later than the current date.`
      );
    }
    // Check if the start date is greater than the end date
    if (newStartDate > newEndDate) {
      throw new BadRequestError(
        "The start date must be earlier than the end date."
      );
    }

    // Check for overlapping leave requests for the specified user
    const overlappingRequests = await LeaveRequest.find({
      userId,
      isDeleted: false,
      $or: [
        {
          startDate: { $gte: startDate, $lt: endDate },
        },
        {
          endDate: { $gt: startDate, $lte: endDate },
        },
        {
          startDate: { $lte: startDate },
          endDate: { $gte: endDate },
        },
      ],
    });

    // Check if there are any overlapping requests
    if (overlappingRequests.length > 0) {
      throw new BadRequestError(
        `The user already has overlapping leave requests for the specified time.`
      );
    }
    const currentYear = new Date().getFullYear();
    const startYearDate = new Date(currentYear, 0, 1); // January 1st of the current year
    const endYearDate = new Date(currentYear, 11, 31);
    let leaveRequestsDays = 0;
    const leaveRequests = await LeaveRequest.find({
      userId: userId,
      status: "approved",
      isDeleted: false,
      startDate: { $gte: startYearDate },
      endDate: { $lte: endYearDate },
    });

    leaveRequests.forEach((leaveRequest) => {
      const start = new Date(leaveRequest.startDate);
      const end = new Date(leaveRequest.endDate);
      const timeDifference = Math.abs(end.getTime() - start.getTime());
      const leaveDays = Math.ceil(timeDifference / (1000 * 60 * 60 * 24)) + 1; // Adding 1 to include both start and end dates
      leaveRequestsDays += leaveDays;
    });
    const startPost = new Date(startDate);
    const endPost = new Date(endDate);
    const timeDifferencePost = Math.abs(
      endPost.getTime() - startPost.getTime()
    );
    const leaveDaysPost =
      Math.ceil(timeDifferencePost / (1000 * 60 * 60 * 24)) + 1;
    let paidLeaveDays = leaveDaysPost;
    if (leaveDaysPost > 12 - leaveRequestsDays)
      paidLeaveDays = 12 - leaveRequestsDays;
    // Create a new leave request
    const newLeaveRequest = new LeaveRequest({
      reason,
      userId,
      paidLeaveDays,
      approverId: approver._id,
      startDate: startDate,
      endDate: endDate,
    });

    await newLeaveRequest.save();

    res.status(200).json({
      message: "Create Leave Request successfully",
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
      throw new NotFoundError("Not found Leave Request");
    }

    const newStartDate = new Date(startDate);
    newStartDate.setDate(newStartDate.getDate() + 1);
    const newEndDate = new Date(endDate);
    newEndDate.setDate(newEndDate.getDate() + 1);
    // Check if the start date is greater than the end date
    if (newStartDate > newEndDate) {
      throw new BadRequestError(
        "The start date must be earlier than the end date."
      );
    }

    // Check for overlapping leave requests for the specified user
    const overlappingRequests = await LeaveRequest.find({
      userId: leaveRequestExist.userId,
      isDeleted: false,
      _id: { $ne: id }, // Exclude the current leave request
      $or: [
        {
          startDate: { $gte: startDate, $lt: endDate },
        },
        {
          endDate: { $gt: startDate, $lte: endDate },
        },
        {
          startDate: { $lte: startDate },
          endDate: { $gte: endDate },
        },
      ],
    });

    // Check if there are any overlapping requests
    if (overlappingRequests.length > 0) {
      throw new BadRequestError(
        "The user already has overlapping leave requests for the specified time."
      );
    }

    // Check if the start date is in the future or is the same as the current date
    const currentDate = new Date();
    if (newStartDate < currentDate) {
      throw new BadRequestError(
        "The start date must be in the future or the same as the current date."
      );
    }

    // Update leave request fields only if the new values are provided
    leaveRequestExist.reason =
      reason !== undefined ? reason : leaveRequestExist.reason;
    leaveRequestExist.startDate = startDate;
    leaveRequestExist.endDate = endDate;
    const currentYear = new Date().getFullYear();
    const startYearDate = new Date(currentYear, 0, 1); // January 1st of the current year
    const endYearDate = new Date(currentYear, 11, 31);
    let leaveRequestsDays = 0;
    const leaveRequests = await LeaveRequest.find({
      userId: leaveRequestExist.userId,
      status: "approved",
      isDeleted: false,
      startDate: { $gte: startYearDate },
      endDate: { $lte: endYearDate },
    });

    leaveRequests.forEach((leaveRequest) => {
      const start = new Date(leaveRequest.startDate);
      const end = new Date(leaveRequest.endDate);
      const timeDifference = Math.abs(end.getTime() - start.getTime());
      const leaveDays = Math.ceil(timeDifference / (1000 * 60 * 60 * 24)) + 1; // Adding 1 to include both start and end dates
      leaveRequestsDays += leaveDays;
    });
    const startPost = new Date(startDate);
    const endPost = new Date(endDate);
    const timeDifferencePost = Math.abs(
      endPost.getTime() - startPost.getTime()
    );
    const leaveDaysPost =
      Math.ceil(timeDifferencePost / (1000 * 60 * 60 * 24)) + 1;
    let paidLeaveDays = leaveDaysPost;
    if (leaveDaysPost > 12 - leaveRequestsDays)
      paidLeaveDays = 12 - leaveRequestsDays;
    leaveRequestExist.paidLeaveDays = paidLeaveDays;
    const updatedLeaveRequest = await leaveRequestExist.save();
    res.status(200).json(updatedLeaveRequest);
  } catch (err) {
    throw err;
  }
};

const ChangeStatus = async (req, res) => {
  const { id } = req.params;
  const { newStatus } = req.body;

  try {
    const leaveRequest = await LeaveRequest.findById(id);

    if (!leaveRequest) {
      throw new NotFoundError("Leave Request not found");
    }

    if (!newStatus || !["approved", "denied"].includes(newStatus)) {
      throw new BadRequestError("Invalid status provided");
    }

    if (leaveRequest.status !== "pending") {
      throw new BadRequestError(
        'Leave request can only be changed from "pending" status'
      );
    }

    // Update status, approverId, and add to history
    leaveRequest.status = newStatus;
    // leaveRequest.approverId = approverId;

    // Save the leave request
    const updatedLeaveRequest = await leaveRequest.save();

    res.status(200).json({
      message: "Status changed successfully",
      leaveRequest: updatedLeaveRequest,
    });
  } catch (err) {
    throw err;
  }
};

const deleteLeaveRequest = async (req, res) => {
  const { id } = req.params;
  try {
    const leaveRequestExist = await LeaveRequest.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
    res.status(200).json({
      message: "Deleted Leave Request successfully",
      leaveRequest: leaveRequestExist,
    });
  } catch (err) {
    throw err;
  }
};

export {
  getLeaveRequests,
  getLeaveRequest,
  getRemainingLeaveRequestDaysByUserId,
  getLeaveRequestsByUserId,
  postLeaveRequest,
  updateLeaveRequest,
  ChangeStatus,
  deleteLeaveRequest,
  getLeaveRequestsOfMonthByUserId,
};
