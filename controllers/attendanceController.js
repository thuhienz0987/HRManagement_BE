import Attendance from "../models/Attendance.js";
import NotFoundError from "../errors/notFoundError.js";
import BadRequestError from "../errors/badRequestError.js";
import User from "../models/User.js"
import { startOfDay , set, addMinutes,addHours ,format } from 'date-fns';
import * as dateFns from 'date-fns';
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

const getAttendancesByDate = async (req,res) =>{
  const {day,month,year} = req.params;

  try{
    const targetDate = new Date(year, month-1, day);

    const attendances = await Attendance.find({
      isDeleted: false,
      attendanceDate: {$gte: targetDate, $lte: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000) },
    });

    if(attendances.length === 0){
      throw new NotFoundError(`No attendance found for ${day}/${month}/${year}`);
    }

    res.status(200).json(attendances);

  }catch(err){
    throw err
  }
}

const getAttendancesByMonth= async (req,res) =>{
  const {month,year} = req.params;

  try{
    const targetDate = new Date(year, month-1, 1);
    const endDate = new Date(year, month, 0);


    const attendances = await Attendance.find({
      isDeleted: false,
      attendanceDate: {$gte: targetDate, $lte: endDate },
    });

    if(attendances.length === 0){
      throw new NotFoundError(`No attendance found for ${month}/${year}`);
    }

    res.status(200).json(attendances);

  }catch(err){
    throw err
  }
}


const getAttendanceByMonth= async (req,res) =>{
  const {month,year,userId} = req.params;

  try{
    const targetDate = new Date(year, month-1, 1);
    const endDate = new Date(year, month, 0);


    const attendances = await Attendance.find({
      isDeleted: false,
      userId:new mongoose.Types.ObjectId(userId),
      attendanceDate: {$gte: targetDate, $lte: endDate },
    });

    if(attendances.length === 0){
      throw new NotFoundError(`No attendance found for ${month}/${year}`);
    }

    res.status(200).json(attendances);

  }catch(err){
    throw err
  }
}


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
      throw new BadRequestError("You took attendance today.")
    }

    // Nếu chưa có bảng chấm công cho userId trong ngày hôm nay, tạo bảng chấm công mới
    const newAttendance = new Attendance({
      userId: userId,

    });

    await newAttendance.save();
    res.status(200).json({ message: "Attendance was successful.", attendance: newAttendance });
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
      throw new NotFoundError("Not found attendance")
    }

    // Kiểm tra xem bảng chấm công đã được đóng hay chưa
    if (attendance.checkOutTime) {
      throw new BadRequestError("Attendance has been closed.")
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
      attendance: attendance
    
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
      throw new NotFoundError("Not found attendance")
    }
    // Kiểm tra xem bảng chấm công đã được đóng hay chưa
    if (!attendance.checkOutTime) {
      throw new BadRequestError("Attendance is not closed yet.")
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

const deleteAttendance = async (req,res) =>{
  const {id} = req.params;

  try{
    const attendance = await Attendance.findByIdAndUpdate(id,{ isDeleted: true},{new: true});
    res.status(200).json({
        message: 'Deleted attendance successfully',
        attendance: attendance,
    })  }catch(err){
    throw err
}
}

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
        const attendanceDate = new Date(year, month - 1, day, 0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0
        const randomCheckInHour = getRndInteger(7,8);
        
        const randomCheckOutHour = getRndInteger(17,20);
        console.log({randomCheckInHour})
        const checkInTime = new Date(year, month - 1, day, randomCheckInHour, 0);
        console.log({checkInTime})
        const checkOutTime = new Date(year, month - 1, day, randomCheckOutHour, 0);
        // Check if attendance already exists for the user on the current date
        // const existingAttendance = await Attendance.findOne({
        //   userId: user.id,
        //   attendanceDate: {
        //     $gte: attendanceDate,
        //     $lt: addMinutes(attendanceDate, 1440), // 1440 minutes = 24 hours
        //   },
        // });

          // Create a new attendance record
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

    console.log(`Mock attendance data generated successfully. ${recordsCreated} records created.`);
    res.status(200).send(`Mock attendance data generated successfully. ${recordsCreated} records created.`);
  } catch (err) {
    console.error('Error generating mock attendance data:', err);
    res.status(500).send('Error generating mock attendance data.');
  }
};

// Helper function to get a random integer between min (inclusive) and max (exclusive)
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}
const hour = getRndInteger(7, 10);
const minute = getRndInteger(0, 60);








export {getAttendances,getAttendance,getAttendancesByDate,getAttendancesByMonth,postAttendance,closeAttendance,updateAttendance,deleteAttendance,getAttendanceByMonth, generateMockAttendanceData}



