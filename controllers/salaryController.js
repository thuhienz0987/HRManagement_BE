import NotFoundError from "../errors/notFoundError.js";
import Salary from "../models/Salary.js";
import Allowance from "../models/Allowance.js";
import Position from "../models/Position.js";
import Attendance from "../models/Attendance.js";
import Holiday from "../models/Holiday.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import Comment from "../models/Comment.js";
import {
  getLeaveRequestsOfMonthByUserId,
  getRemainingLeaveRequestDaysByUserId,
} from "./leaveRequestController.js";
import { isFirstDayOfMonth } from "date-fns";
import Department from "../models/Department.js";
import BadRequestError from "../errors/badRequestError.js";

const getSalaries = async (req, res) => {
  try {
    const salaries = await Salary.find()
      .populate("userId")
      .populate({
        path: "userId",
        populate: {
          path: "departmentId",
          model: "Department",
        },
      })
      .populate("idPosition")
      .populate("idAllowance")
      .populate("idComment");

    if (!salaries) {
      throw new NotFoundError("Not found any salary");
    }
    res.status(200).json(salaries);
  } catch (err) {
    throw err;
  }
};

const getSalary = async (req, res) => {
  const { id } = req.params;
  try {
    const salary = await Salary.findById(id)
      .populate("userId")
      .populate({
        path: "userId",
        populate: {
          path: "departmentId",
          model: "Department",
        },
      })
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

const getSalaryByUserId = async (req, res) => {
  const { id } = req.params;
  try {
    const salary = await Salary.find({ userId: id })
      .populate("userId")
      .populate("idPosition")
      .populate("idAllowance")
      .populate("idComment");
    if (salary) {
      res.status(200).json(salary);
    } else {
      throw new NotFoundError("Salary not found");
    }
  } catch (err) {
    res.status(err.status || 404).json({
      message: err.messageObject || err.message,
    });
  }
};

const postSalary = async (req, res) => {
  const { userId, idAllowance } = req.body;
  try {
    const today = new Date();
    const existingSalary = await Salary.findOne({
      userId,
      createdAt: {
        $gte: new Date(today.getFullYear(), today.getMonth(), 1),
        $lte: new Date(today.getFullYear(), today.getMonth() + 1, 1),
      },
    });

    if (existingSalary) {
      throw new BadRequestError("Salary already calculated for this month.");
    }

    if (!idAllowance) {
      idAllowance = [];
    } else if (idAllowance || idAllowance.length != 0) {
      await Promise.all(
        idAllowance.map(async (id) => {
          const allowance = await Allowance.findById(id);
          if (!allowance) {
            throw new NotFoundError("Allowance not found");
          }
        })
      );
    }
    const user = await User.findById(userId).populate("positionId");
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const idPosition = user.positionId;
    const salaryGrade = user.salaryGrade;

    const firstDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    ); // Ngày đầu tiên của tháng trước
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 0); // Ngày cuối cùng của tháng trước

    const comment = await Comment.findOne({
      revieweeId: new mongoose.Types.ObjectId(userId),
      commentMonth: {
        $gte: new Date(today.getFullYear(), today.getMonth() - 1, 1),
        $lte: new Date(today.getFullYear(), today.getMonth(), 0),
      },
      isDeleted: false,
    });

    const idComment = !comment ? null : comment._id;

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

    const dayLeaves = await getLeaveRequestsOfMonthByUserId(userId);
    const paidLeaveDays = dayLeaves.paidLeaveDays;
    const totalLeaveRequest = dayLeaves.totalLeaveDaysInMonth;

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
    const overTimeDays = overTimeDayResult.map(
      (entry) => entry.totalOvertimeDays
    );

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
      idComment,
      paidLeaveDays
    );

    const overTimeMoney = calculate.overTimeMoney; // tang ca gio
    const overTimeDayMoney = calculate.overTimeDayMoney; // tang ca ngay
    const allowanceAmount = calculate.allowanceAmount; // phu cap
    const dayMoney = calculate.dayMoney; // theo ngay (tru ngay le)
    const bonusMoney = calculate.bonusMoney; // thuong

    const totalSalary = calculate.totalSalary; // trc thue
    const incomeTax = calculate.taxRate; // thue
    const totalIncome = calculate.totalIncome; // sau thue
    const incomeTaxAmount = calculate.incomeTaxAmount; // tien thue
    const bonus = calculate.bonus;
    const paidLeaveDaysMoney = calculate.paidLeaveDaysMoney;

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
      paidLeaveDays,
      totalLeaveRequest,
      overTimeDayMoney,
      overTimeMoney,
      dayMoney,
      bonusMoney,
      allowanceAmount,
      paidLeaveDaysMoney,
    });

    const postSalary = await newSalary.save();

    res
      .status(201)
      .json({ message: "Salary created successfully", salary: postSalary });
  } catch (err) {
    res.status(err.status || 400).json({
      message: err.messageObject || err.message,
    });
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
    if (!idAllowance) {
      idAllowance = [];
    } else if (idAllowance && idAllowance.length != 0) {
      await Promise.all(
        idAllowance.map(async (id) => {
          const allowance = await Allowance.findById(id);
          if (!allowance) {
            throw new NotFoundError("Allowance not found");
          }
        })
      );
    }
    const user = await User.findById(salary.userId);
    const salaryGrade = user.salaryGrade;
    console.log({ salary });
    const calculate = await calculateTotalSalary(
      salary.idPosition,
      salaryGrade,
      idAllowance,
      salary.presentDate,
      salary.overTimeDay,
      salary.overTime,
      salary.idComment,
      salary.paidLeaveDays
    );

    console.log({ calculate });
    salary.idAllowance = idAllowance;
    salary.overTimeMoney = calculate.overTimeMoney; // tang ca gio
    salary.overTimeDayMoney = calculate.overTimeDayMoney; // tang ca ngay
    salary.allowanceAmount = calculate.allowanceAmount; // phu cap
    salary.dayMoney = calculate.dayMoney; // theo ngay (tru ngay le)
    salary.bonusMoney = calculate.bonusMoney; // thuong
    salary.paidLeaveDaysMoney = calculate.paidLeaveDaysMoney; // thuong

    salary.totalSalary = calculate.totalSalary; // trc thue
    salary.incomeTax = calculate.taxRate; // thue
    salary.totalIncome = calculate.totalIncome; // sau thue
    salary.incomeTaxAmount = calculate.incomeTaxAmount; // tien thue
    salary.bonus = calculate.bonus;

    const updateSalary = await salary.save();
    res
      .status(200)
      .json({ message: "Update salary successfully", salary: updateSalary });
  } catch (err) {
    res.status(err.status || 400).json({
      message: err.messageObject || err.message,
    });
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
    res
      .status(200)
      .json({ message: "Update salary successfully", salary: updateSalary });
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
  idComment,
  paidLeaveDays
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

  const salaryADay = await ((baseSalary * salaryGrade) / 22);

  const overTimeMoney = await ((overTime * salaryADay) / 8);
  const overTimeDayMoney = (await overTimeDay) * 2 * salaryADay;
  const dayMoney = (await salaryADay) * (presentDate - overTimeDay);
  const paidLeaveDaysMoney = (await paidLeaveDays) * salaryADay;

  // Tính tổng phụ cấp từ danh sách các mức phụ cấp của nhân viên
  const allowanceAmount = allowances.reduce(
    (total, allowance) => total + allowance.amount,
    0
  );

  const total = await (dayMoney +
    overTimeMoney +
    overTimeDayMoney +
    allowanceAmount +
    paidLeaveDaysMoney);
  const bonusMoney = (await total) * bonus;
  const totalIncome = bonusMoney + total; // trc thue

  // Tính toán thuế thu nhập cá nhân dựa trên tổng thu nhập
  const incomeTaxAmount = (await calculateIncomeTax(totalIncome))
    .incomeTaxAmount;

  const taxRate = (await calculateIncomeTax(totalIncome)).taxRate;

  // Tính mức lương cuối cùng sau khi trừ thuế
  const totalSalary = totalIncome - incomeTaxAmount;

  // Trả về tổng thu nhập và mức lương
  return {
    overTimeMoney,
    overTimeDayMoney,
    dayMoney,
    allowanceAmount,
    bonusMoney,
    totalIncome,
    taxRate,
    incomeTaxAmount,
    totalSalary,
    bonus,
    paidLeaveDaysMoney,
  };
};

// Hàm tính thuế thu nhập cá nhân dựa trên thu nhập và thuế suất
const calculateIncomeTax = async (income) => {
  console.log({ income });
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
};

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
  getSalaryByUserId,
};
