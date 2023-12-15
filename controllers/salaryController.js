import NotFoundError from "../errors/notFoundError.js";
import Salary from "../models/Salary.js";
import Allowance from "../models/Allowance.js";
import Position from "../models/Position.js";
import Attendance from "../models/Attendance.js";
import Holiday from "../models/Holiday.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import Comment from "../models/Comment.js";
import { getLeaveRequestsOfMonthByUserId, getRemainingLeaveRequestDaysByUserId } from "./leaveRequestController.js";
import { isFirstDayOfMonth } from "date-fns";

const getSalaries = async (req, res) => {
  try {
    const salary = await Salary.find()
      .populate("userId")
      .populate("idPosition")
      .populate("idAllowance")
      .populate("idComment");

    if (!salary) {
      throw new NotFoundError("Not found any salary");
    }
    res.status(200).json(salary);
  } catch (err) {
    throw err;
  }
};

const getSalary = async (req, res) => {
  const { id } = req.params;
  try {
    const salary = await Salary.findById(id)
      .populate("userId")
      .populate("idPosition")
      .populate("idAllowance")
      .populate("idComment");
    if (salary) {
      res.status(200).json(salary);
    } else {
      throw new NotFoundError("salary  not found");
    }
  } catch (err) {
    throw err;
  }
};

const postSalary = async (req, res) => {
  const { userId, idAllowance } = req.body;
  try {
    const user = await User.findById(userId).populate("positionId");
    const idPosition = user.positionId;
    const salaryGrade = user.salaryGrade;
    const today = new Date();
    const firstDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    ); // Ngày đầu tiên của tháng trước
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 0); // Ngày cuối cùng của tháng trước

    const comment = await Comment.findOne({
      revieweeId: new mongoose.Types.ObjectId(userId),
      commentMonth: {
        $gte: new Date(today.getFullYear(), today.getMonth()-1, 1),
        $lte: new Date(today.getFullYear(), today.getMonth() , 0),
      },
      isDeleted: false,
    });

    const idComment = comment === undefined ? null : comment._id;

    const holidays = await Holiday.find({
      day: {
        $gte: firstDayOfMonth,
        $lte: lastDayOfMonth,
      },
      isDeleted: false,
    });
    const presentDate = await Attendance.countDocuments({
      userId: userId,
      attendanceDate: {
        $gte: firstDayOfMonth,
        $lte: lastDayOfMonth,
      },
      isDeleted: false,
    });


    // const dayLeaves = await getRemainingLeaveRequestDaysByUserId(userId);
    // if(dayLeaves !== 0){
    //   const leaveDaysInMonth = await getLeaveRequestsOfMonthByUserId(userId);
    //   if()
    // }

const overTimeDayResult = await Attendance.aggregate([
  {
    $match: {
      userId: new mongoose.Types.ObjectId(userId),
      attendanceDate: {
        $gte: firstDayOfMonth,
        $lte: lastDayOfMonth,
      },
      isDeleted: false,
    },
  },
  {
    $addFields: {
      isWeekendOrHoliday: {
        $cond: {
          if: {
            $or: [
              { $eq: [{ $dayOfWeek: "$attendanceDate" }, 0] }, // Chủ nhật
              { $eq: [{ $dayOfWeek: "$attendanceDate" }, 6] }, // Thứ 7
              { $in: ["$attendanceDate", holidays] }, // Ngày lễ
            ],
          },
          then: true,
          else: false,
        },
      },
    },
  },
  {
    $match: {
      isWeekendOrHoliday: true,
    },
  },
  {
    $group: {
      _id: "$userId",
      totalOvertimeDays: { $sum: 1 }, // Đếm số lượng ngày tăng ca
    },
  },
  {
    $project: {
      _id: 0,
      userId: "$_id",
      totalOvertimeDays: 1,
    },
  },
]);

// overTimeData sẽ chứa số lượng ngày tăng ca, bao gồm cả ngày lễ, thứ 7 và chủ nhật.
const overTimeDays = overTimeDayResult.map((entry) => entry.totalOvertimeDays);

// Sum up the total overtime days for the month
const overTimeDay = overTimeDays.reduce((sum, days) => sum + days, 0);

const overTimeData = await Attendance.aggregate([
  {
    $match: {
      userId: new mongoose.Types.ObjectId(userId),
      attendanceDate: {
        $gte: firstDayOfMonth,
        $lte: lastDayOfMonth,
        $nin: holidays,
      },
      isDeleted: false,
    },
  },
  {
    $addFields: {
      isWeekendOrHoliday: {
        $cond: {
          if: {
            $or: [
              { $eq: [{ $dayOfWeek: "$attendanceDate" }, 0] }, // Chủ nhật
              { $eq: [{ $dayOfWeek: "$attendanceDate" }, 6] }, // Thứ 7
              { $in: ["$attendanceDate", holidays] }, // Ngày lễ
              
            ],
          },
          then: true,
          else: false,
        },
      },
    },
  },
  {
    $match: {
      isWeekendOrHoliday: false,
    },
  },
  {
    $group: {
      _id: "$userId",
      totalOvertime: { $sum: "$overTime" },
    },
  },
  {
    $project: {
      _id: 0,
      userId: "$_id",
      totalOvertime: 1,
    },
  },
]);

    // Extract the total overtime hours for each day
    const dailyOvertimeHours = overTimeData.map((entry) => entry.totalOvertime);

    // Sum up the total overtime hours for the month
    const overTime = dailyOvertimeHours.reduce((sum, hours) => sum + hours, 0);

    const calculate = await calculateTotalSalary(
      idPosition,
      salaryGrade,
      idAllowance,
      presentDate,
      overTimeDay,
      overTime,
      idComment
    );

    const totalSalary = calculate.totalSalary;
    const incomeTax = calculate.taxRate;
    const totalIncome = calculate.totalIncome;
    const incomeTaxAmount = calculate.incomeTaxAmount;
    const bonus = calculate.bonus;

    const newSalary = new Salary({
      userId,
      idPosition,
      salaryGrade,
      idAllowance,
      payDay: null,
      presentDate,
      totalSalary,
      incomeTax,
      idComment,
      totalIncome,
      incomeTaxAmount,
      overTimeDay,
      overTime,
      bonus,
    });

    await newSalary.save();

    res
      .status(201)
      .json({ message: "Salary created successfully", salary: newSalary });
  } catch (err) {
    throw err;
  }
};

const updateSalary = async (req, res) => {
  const { id } = req.params;
  const { idAllowance } = req.body;
  try {
    const salary = await Salary.findById(id);
    if (!salary) {
      throw new NotFoundError("Not found salary");
    }
    salary.totalSalary = (
      await calculateTotalSalary(
        salary.idPosition,
        salary.salaryGrade,
        idAllowance,
        salary.presentDate,
        salary.overTimeDay,
        salary.overTime,
        salary.idComment
      )
    ).totalSalary;
    salary.incomeTax = (
      await calculateTotalSalary(
        salary.idPosition,
        salary.salaryGrade,
        idAllowance,
        salary.presentDate,
        salary.overTimeDay,
        salary.overTime,
        salary.idComment
      )
    ).taxRate;
    salary.totalIncome = (
      await calculateTotalSalary(
        salary.idPosition,
        salary.salaryGrade,
        idAllowance,
        salary.presentDate,
        salary.overTimeDay,
        salary.overTime,
        salary.idComment
      )
    ).totalIncome;
    salary.incomeTaxAmount = (
      await calculateTotalSalary(
        salary.idPosition,
        salary.salaryGrade,
        idAllowance,
        salary.presentDate,
        salary.overTimeDay,
        salary.overTime,
        salary.idComment
      )
    ).incomeTaxAmount;
    salary.bonus = (
      await calculateTotalSalary(
        salary.idPosition,
        salary.salaryGrade,
        idAllowance,
        salary.presentDate,
        salary.overTimeDay,
        salary.overTime,
        salary.idComment
      )
    ).bonus;
    const updateSalary = await salary.save();
    res.status(200).json(updateSalary);
  } catch (err) {
    throw err;
  }
};

const confirmSalary = async (req, res) => {
  const { id } = req.params;
  try {
    const { payDay } = req.body;
    const salary = await Salary.findById(id);
    if (!salary) {
      throw new NotFoundError("Not found salary");
    }
    salary.payDay = payDay ? payDay : salary.payDay;
    const updateSalary = await salary.save();
    res.status(200).json(updateSalary);
  } catch (err) {
    throw err;
  }
};

const calculateTotalSalary = async (
  idPosition,
  salaryGrade,
  idAllowances,
  presentDate,
  overTimeDay,
  overTime,
  idComment
) => {
  const position = await Position.findById(idPosition);
  const allowances = await Allowance.find({ _id: { $in: idAllowances } });

  const baseSalary = position ? position.basicSalary : 0;

  let bonus = 0;
  if (idComment === null) {
    bonus = 0;
  } else {
    const comment = await Comment.findById(idComment);
    bonus = await calculateBonus(comment.rate);
  }


  // Tính tổng phụ cấp từ danh sách các mức phụ cấp của nhân viên
  const allowanceAmount = allowances.reduce(
    (total, allowance) => total + allowance.amount,
    0
  );


  const total =
    ((baseSalary * salaryGrade) / 22) * (presentDate + overTimeDay) +
    allowanceAmount +
    (overTime * ((baseSalary * salaryGrade) / 22)) / 8;
  const totalIncome = total * bonus + total;

  // Tính toán thuế thu nhập cá nhân dựa trên tổng thu nhập
  const incomeTaxAmount = (await calculateIncomeTax(totalIncome)).incomeTaxAmount;

  const taxRate = (await calculateIncomeTax(totalIncome)).taxRate;

  console.log({ totalIncome });
  console.log({ incomeTaxAmount });
  // Tính mức lương cuối cùng sau khi trừ thuế
  const totalSalary = totalIncome - incomeTaxAmount;

  // Trả về tổng thu nhập và mức lương
  return {
    totalIncome,
    taxRate,
    incomeTaxAmount,
    totalSalary,
    bonus,
  };
};

// Hàm tính thuế thu nhập cá nhân dựa trên thu nhập và thuế suất
const  calculateIncomeTax = async (income) => {
  console.log({income})
  let taxRate = 5;
  if (income <= 5000000) {
    taxRate = 5;
  } else if (income <= 10000000) {
    taxRate = 10;
  } else if (income <= 18000000) {
    taxRate = 15;
  } else if (income <= 32000000) {
    taxRate = 20;
  } else if (income <= 52000000) {
    taxRate = 25;
  } else if (income < 80000000) {
    taxRate = 30;
  } else taxRate = 35;

  const incomeTaxAmount = income * (taxRate / 100);

  return {
    incomeTaxAmount: incomeTaxAmount,
    taxRate: taxRate,
  };
}

const calculateBonus = async (rate) => {
  let bonus = 0;
  switch (rate) {
    case 8:
      bonus = 0.08;
      break;
    case 9:
      bonus = 0.09;
      break;
    case 10:
      bonus = 0.1;
      break;
    default:
      bonus = 0;
  }
  return bonus;
};

export {
  getSalaries,
  getSalary,
  postSalary,
  updateSalary,
  confirmSalary,
  calculateBonus,
  calculateIncomeTax,
};
