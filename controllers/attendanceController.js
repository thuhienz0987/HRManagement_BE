import Attendance from "../models/Attendance.js";
import NotFoundError from "../errors/notFoundError.js";
import BadRequestError from "../errors/badRequestError.js";
import User from "../models/User.js";
import {
  startOfDay,
  set,
  addMinutes,
  addHours,
  format,
  addDays,
  startOfMonth,
} from "date-fns";
import mongoose from "mongoose";

const getAttendances = async (req, res) => {
  try {
    const attendance = await Attendance.find({ isDeleted: false });
    if (!attendance) {
      throw new NotFoundError("Not found any attendance");
    }
    res.status(200).json(attendance);
  } catch (err) {
    throw err;
  }
};

const getAttendance = async (req, res) => {
  const { id } = req.params;
  try {
    const attendance = await Attendance.findById(id);
    if (attendance && attendance.isDeleted === false) {
      res.status(200).json(attendance);
    } else if (attendance && attendance.isDeleted === true) {
      res.status(410).send("Attendance is deleted");
    } else {
      throw new NotFoundError("Attendance not found");
    }
  } catch (err) {
    throw err;
  }
};

const getAttendancesByDate = async (req, res) => {
  const { day, month, year } = req.params;

  try {
    const targetDate = new Date(year, month - 1, day);

    const attendances = await Attendance.find({
      isDeleted: false,
      attendanceDate: {
        $gte: targetDate,
        $lte: new Date(targetDate.getTime() + 12 * 60 * 60 * 1000),
      },
    }).populate({
      path: "userId",
      populate: {
        path: "departmentId",
      },
    });

    if (attendances.length === 0) {
      throw new NotFoundError(
        `No attendance found for ${day}/${month}/${year}`
      );
    }

    res.status(200).json(attendances);
  } catch (err) {
    throw err;
  }
};

const getAttendancesByMonth = async (req, res) => {
  const { month, year } = req.params;

  try {
    const targetDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendances = await Attendance.find({
      isDeleted: false,
      attendanceDate: { $gte: targetDate, $lte: endDate },
    });

    if (attendances.length === 0) {
      throw new NotFoundError(`No attendance found for ${month}/${year}`);
    }

    res.status(200).json(attendances);
  } catch (err) {
    throw err;
  }
};

const getMonthlyEmployeeAttendance = async (req, res) => {
  const { month, year } = req.params;

  try {
    // Get all users
    const users = await User.find({ isEmployee: true }).populate(
      "departmentId"
    );
    console.log({ users });

    // Initialize an array to store employee attendance information
    const employeeAttendances = [];

    // Loop through each user
    for (const user of users) {
      // Get attendance records for the user in the specified month
      const attendances = await Attendance.find({
        isDeleted: false,
        userId: new mongoose.Types.ObjectId(user._id),
        attendanceDate: {
          $gte: new Date(year, month - 1, 1),
          $lte: new Date(year, month, 0),
        },
      });

      // Calculate total overtime hours and total working days
      let totalOvertimeHours = 0;
      let totalWorkingDays = 0;

      for (const attendance of attendances) {
        if (attendance.checkInTime && attendance.checkOutTime) {
          totalOvertimeHours += attendance.overTime;
          totalWorkingDays++;
        }
      }

      // Add employee attendance information to the array
      employeeAttendances.push({
        user: user,
        totalOvertimeHours,
        totalWorkingDays,
      });
    }

    res.status(200).json(employeeAttendances);
  } catch (err) {
    throw err;
  }
};

const getAttendanceByMonth = async (req, res) => {
  const { month, year, userId } = req.params;

  try {
    const targetDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendances = await Attendance.find({
      isDeleted: false,
      userId: new mongoose.Types.ObjectId(userId),
      attendanceDate: { $gte: targetDate, $lte: endDate },
    });

    if (attendances.length === 0) {
      throw new NotFoundError(`No attendance found for ${month}/${year}`);
    }

    res.status(200).json(attendances);
  } catch (err) {
    throw err;
  }
};

const getAttendanceEmployeeToday = async (req, res) => {
  try {
    const users = await User.find({ isEmployee: true });
    console.log({ users });
    let totalEmployees = users.length;
    let onTimeEmployeesToday = 0;
    let lateEmployeesToday = 0;
    let onTimeEmployeesYesterday = 0;
    let lateEmployeesYesterday = 0;

    for (const user of users) {
      // Get attendance records for the user for today
      const today = startOfDay(new Date());
      const yesterday = startOfDay(addDays(today, -1));

      const attendancesToday = await Attendance.find({
        isDeleted: false,
        userId: new mongoose.Types.ObjectId(user._id),
        attendanceDate: {
          $gte: today,
          $lt: addMinutes(today, 24 * 60),
        },
      });

      const attendancesYesterday = await Attendance.find({
        isDeleted: false,
        userId: new mongoose.Types.ObjectId(user._id),
        attendanceDate: {
          $gte: yesterday,
          $lt: addMinutes(yesterday, 24 * 60),
        },
      });

      // Calculate total on-time, late for today
      for (const attendance of attendancesToday) {
        if (attendance.checkInTime) {
          const checkInDateTime = set(attendance.attendanceDate, {
            hours: 7,
            minutes: 30,
          });
          if (attendance.checkInTime <= checkInDateTime) {
            onTimeEmployeesToday++;
          } else {
            lateEmployeesToday++;
          }
        }
      }

      // Calculate total on-time, late for yesterday
      for (const attendance of attendancesYesterday) {
        if (attendance.checkInTime) {
          const checkInDateTime = set(attendance.attendanceDate, {
            hours: 7,
            minutes: 30,
          });
          if (attendance.checkInTime <= checkInDateTime) {
            onTimeEmployeesYesterday++;
          } else {
            lateEmployeesYesterday++;
          }
        }
      }
    }

    // Calculate percentage change
    const onTimePercentageChange = calculatePercentageChange(
      onTimeEmployeesYesterday,
      onTimeEmployeesToday
    );
    const latePercentageChange = calculatePercentageChange(
      lateEmployeesYesterday,
      lateEmployeesToday
    );

    const result = {
      onTimeEmployeesToday,
      lateEmployeesToday,
      onTimeEmployeesYesterday,
      lateEmployeesYesterday,
      onTimePercentageChange,
      latePercentageChange,
      totalEmployees,
    };

    res.status(200).json(result);
  } catch (err) {
    throw err;
  }
};

// Helper function to calculate percentage change
const calculatePercentageChange = (previousValue, currentValue) => {
  if (previousValue === 0) {
    return currentValue === 0 ? 0 : 100;
  }
  return ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
};

const getAttendanceMonthYear = async (req, res) => {
  try {
    // Lấy tất cả các năm và tháng duy nhất có trong dữ liệu chấm công
    const distinctMonths = await Attendance.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$attendanceDate" },
            month: { $month: "$attendanceDate" },
          },
        },
      },
    ]);

    // Tạo danh sách các ngày đầu tiên của từng tháng và năm
    const firstDays = distinctMonths.map((item) => {
      return startOfMonth(new Date(item._id.year, item._id.month - 1));
    });

    // Format kết quả theo định dạng mong muốn
    const formattedResult = firstDays.map((date) =>
      format(date, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")
    );

    res.status(200).json(formattedResult);
  } catch (err) {
    throw err;
  }
};

//dang low
const getAttendanceEmployee = async (req, res) => {
  try {
    const users = await User.find({ isEmployee: true });
    const { month, year } = req.params;

    const daysInMonth = new Date(year, month, 0).getDate();
    const attendanceByDay = [];

    for (let day = daysInMonth; day >= 1; day--) {
      let onTimeEmployees = 0;
      let lateEmployees = 0;
      let date = new Date(year, month - 1, day);
      let totalEmployees = users.length;

      for (const user of users) {
        // Check if the user has a dayOff for the specific day
        const formattedDate = format(date, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
        console.log({ formattedDate });
        if (user.dayOff && user.dayOff <= formattedDate) {
          console.log({ user });
          console.log(user.dayOff);
          console.log({ date });
          totalEmployees++;
          continue; // Skip this user for the current day
        }

        // Get attendance records for the user for the specific day
        const targetDate = startOfDay(new Date(year, month - 1, day));
        const attendances = await Attendance.find({
          isDeleted: false,
          userId: new mongoose.Types.ObjectId(user._id),
          attendanceDate: {
            $gte: targetDate,
            $lt: addMinutes(targetDate, 24 * 60),
          },
        });

        // Calculate total on-time and late employees for the day
        for (const attendance of attendances) {
          if (attendance.checkInTime) {
            const checkInDateTime = set(attendance.attendanceDate, {
              hours: 7,
              minutes: 30,
            });
            if (attendance.checkInTime <= checkInDateTime) {
              onTimeEmployees++;
            } else {
              lateEmployees++;
            }
          }
        }
      }

      // Add attendance information for the day to the array
      attendanceByDay.push({
        totalEmployees,
        onTimeEmployees,
        lateEmployees,
        date,
      });
    }

    res.status(200).json(attendanceByDay);
  } catch (err) {
    throw err;
  }
};

const postAttendance = async (req, res) => {
  const { userId } = req.body;
  try {
    // Kiểm tra xem đã có bảng chấm công nào cho ngày hôm nay và userId tương ứng chưa
    const existingAttendance = await Attendance.findOne({
      userId: userId,
      checkInTime: {
        $gte: new Date().setHours(0, 0, 0, 0), // Lấy thời gian bắt đầu của ngày hôm nay
        $lt: new Date().setHours(23, 59, 59, 999), // Lấy thời gian kết thúc của ngày hôm nay
      },
    });
    if (existingAttendance) {
      // Nếu đã có bảng chấm công cho userId trong ngày hôm nay, không cho phép tạo thêm
      throw new BadRequestError("You took attendance today.");
    }

    // Nếu chưa có bảng chấm công cho userId trong ngày hôm nay, tạo bảng chấm công mới
    const newAttendance = new Attendance({
      userId: userId,
    });

    await newAttendance.save();
    res.status(200).json({
      message: "Attendance was successful.",
      attendance: newAttendance,
    });
  } catch (err) {
    throw err;
  }
};

const closeAttendance = async (req, res) => {
  const { id } = req.params;
  // Kiểm tra xem bảng chấm công có tồn tại không
  try {
    const attendance = await Attendance.findById(id);

    if (!attendance) {
      throw new NotFoundError("Not found attendance");
    }

    // Kiểm tra xem bảng chấm công đã được đóng hay chưa
    if (attendance.checkOutTime) {
      throw new BadRequestError("Attendance has been closed.");
    }

    // Đặt thời gian checkOut là thời gian hiện tại
    attendance.checkOutTime = new Date();
    // Tạo một đối tượng lịch sử cập nhật mới
    const updateRecord = {
      updateDate: new Date(),
      checkInTime: attendance.checkInTime,
      checkOutTime: new Date(), // Thời gian hiện tại khi đóng
      attendanceDate: attendance.attendanceDate,
    };

    // Thêm đối tượng lịch sử cập nhật vào mảng updateHistory
    attendance.updateHistory.push(updateRecord);

    await attendance.save();

    res.status(200).json({
      message: "Closed the attendance successfully.",
      attendance: attendance,
    });
  } catch (err) {
    throw err;
  }
};

const updateAttendance = async (req, res) => {
  const { id } = req.params;
  const { checkInTime, checkOutTime, attendanceDate } = req.body; // Các thông tin mới cần cập nhật
  try {
    // Tìm bảng chấm công dựa trên id
    const attendance = await Attendance.findById(id);

    if (!attendance) {
      throw new NotFoundError("Not found attendance");
    }
    // Kiểm tra xem bảng chấm công đã được đóng hay chưa
    if (!attendance.checkOutTime) {
      throw new BadRequestError("Attendance is not closed yet.");
    }

    // Tạo một đối tượng lịch sử cập nhật mới
    const updateRecord = {
      updateDate: new Date(),
      checkInTime: attendance.checkInTime,
      checkOutTime: attendance.checkOutTime,
      attendanceDate: attendance.attendanceDate,
    };

    // Thêm đối tượng lịch sử cập nhật vào mảng updateHistory
    attendance.updateHistory.push(updateRecord);

    attendance.checkInTime = checkInTime ? checkInTime : attendance.checkInTime;
    attendance.checkOutTime = checkOutTime
      ? checkOutTime
      : attendance.checkOutTime;
    attendance.attendanceDate = attendanceDate
      ? attendanceDate
      : attendance.attendanceDate;

    const updateAttendance = await attendance.save();

    res.status(200).json(updateAttendance);
  } catch (err) {
    throw err;
  }
};

const deleteAttendance = async (req, res) => {
  const { id } = req.params;

  try {
    const attendance = await Attendance.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
    res.status(200).json({
      message: "Deleted attendance successfully",
      attendance: attendance,
    });
  } catch (err) {
    throw err;
  }
};

const generateMockAttendanceData = async (req, res) => {
  const { month, year } = req.params;

  try {
    // Fetch all users
    const users = await User.find();

    let recordsCreated = 0;

    // Loop through each user
    for (const user of users) {
      // Loop through each day in the specified month
      for (let day = 1; day <= new Date(year, month, 0).getDate(); day++) {
        const attendanceDate = new Date(year, month - 1, day); // Date without specific time

        const randomCheckInHour = getRndInteger(6, 9); // Use the provided function to generate random check-in hour
        const randomCheckOutHour = getRndInteger(16, 20); // Use the provided function to generate random check-out hour

        // Set the check-in and check-out times for the current day
        const checkInTime = new Date(
          year,
          month - 1,
          day,
          randomCheckInHour,
          0
        );
        const checkOutTime = new Date(
          year,
          month - 1,
          day,
          randomCheckOutHour,
          0
        );

        // Check if attendance already exists for the user on the current date, and create a new attendance record
        const existingAttendance = await Attendance.findOne({
          userId: user.id,
          attendanceDate: {
            $gte: attendanceDate,
            $lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000), // Add 24 hours in milliseconds
          },
        });

        if (!existingAttendance) {
          const newAttendance = new Attendance({
            userId: user.id,
            attendanceDate,
            checkInTime,
            checkOutTime,
          });

          await newAttendance.save();
          recordsCreated++;
        }
      }
    }

    console.log(
      `Mock attendance data generated successfully. ${recordsCreated} records created.`
    );
    res
      .status(200)
      .send(
        `Mock attendance data generated successfully. ${recordsCreated} records created.`
      );
  } catch (err) {
    throw err;
  }
};

// Helper function to get a random integer between min (inclusive) and max (exclusive)

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export {
  getAttendances,
  getAttendance,
  getAttendancesByDate,
  getAttendancesByMonth,
  getAttendanceByMonth,
  getMonthlyEmployeeAttendance,
  getAttendanceMonthYear,
  getAttendanceEmployeeToday,
  getAttendanceEmployee,
  postAttendance,
  closeAttendance,
  updateAttendance,
  deleteAttendance,
  generateMockAttendanceData,
};
