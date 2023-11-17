import Attendance from "../models/Attendance.js";
import NotFoundError from "../errors/notFoundError.js";
import BadRequestError from "../errors/badRequestError.js";

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
    const attendance = await Attendance.findByIdAndUpdate(_id,{ isDeleted: true},{new: true});
    res.status(200).json({
        message: 'Deleted attendance successfully',
        attendance: attendance,
    })  }catch(err){
    throw err
}
}

export {getAttendances,getAttendance,postAttendance,closeAttendance,updateAttendance,deleteAttendance}
