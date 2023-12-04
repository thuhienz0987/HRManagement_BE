import NotFoundError from "../errors/notFoundError.js";
import Salary from "../models/Salary.js";
import SalaryGrade from "../models/SalaryGrade.js";
import Allowance from "../models/Allowance.js";
import Position from "../models/Position.js";
import Attendance from "../models/Attendance.js";
import Holiday from "../models/Holiday.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import Comment from "../models/Comment.js";


const getSalaries = async (req,res) =>{
    try{
        const salary = await Salary.find()
            .populate('userId')
            .populate('idPosition')
            .populate('idSalaryGrade')
            .populate('idAllowance')
            .populate('idComment');
          
        if(!salary){
            throw new NotFoundError('Not found any salary')
        }
        res.status(200).json(salary);
    }catch(err){
        throw err
    }
}


const getSalary = async (req,res) =>{
    const {id} = req.params 
    try{
        const salary = await Salary.findById(id)
            .populate('userId')
            .populate('idPosition')
            .populate('idSalaryGrade')
            .populate('idAllowance')
            .populate('idComment');
        if (salary ) {
              res.status(200).json(salary);
        }else {
              throw new NotFoundError("salary  not found");
            }

    }catch(err){
        throw err
    }
}

const postSalary = async (req,res) =>{
    const {userId, idSalaryGrade, idAllowance} = req.body
    try{
                
                const user= await User.findById(userId).populate('positionId');
                const idPosition = user.positionId;
                const today = new Date();
                const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1); // Ngày đầu tiên của tháng trước
                const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 0); // Ngày cuối cùng của tháng trước

                const comment = await Comment.findOne({
                  revieweeId: new mongoose.Types.ObjectId(userId),
                  createdAt: {
                    $gte: new Date(today.getFullYear(), today.getMonth(), 1),
                    $lte: new Date(today.getFullYear(), today.getMonth()+1, 0),
                  },
                  isDeleted: false,
                });


                if (!comment) {
                  return res.status(404).json({ message: 'No comment found for the specified user and date range.' });
                }
                const idComment = comment._id

                const holidays = await Holiday.find({
                    day: {
                        $gte: firstDayOfMonth,
                        $lte: lastDayOfMonth,
                    },
                    isDeleted: false
                  });
                const presentDate = await Attendance.countDocuments({
                    userId: userId,
                    attendanceDate: {
                        $gte: firstDayOfMonth,
                        $lte: lastDayOfMonth,
                    },
                    isDeleted: false
                  });
                  const overTimeDay = await Attendance.countDocuments({
                    userId: userId,
                    attendanceDate: {
                        $gte: firstDayOfMonth,
                        $lte: lastDayOfMonth,
                        $in: holidays
                    },
                    isDeleted: false
                  });

                  const overTimeData = await Attendance.aggregate([
                    {
                      $match: { ////Sử dụng $match để lọc các bản ghi theo điều kiện nhất định.
                        userId: userId,
                        attendanceDate: {
                          $gte: firstDayOfMonth,
                          $lte: lastDayOfMonth,
                          $nin: holidays
                        },
                        isDeleted: false
                      }
                    },
                    {
                      $project: { //Sử dụng $project để chỉ trích các trường cần thiết.
                        attendanceDate: 1,
                        checkOutTime: { $dateToString: { format: '%H:%M:%S', date: '$attendanceTime.checkOutTime' } }
                      }
                    },
                    {
                      $match: { //Sử dụng $match thêm lần nữa để lọc bản ghi dựa trên thời gian checkOutTime.
                        checkOutTime: { $gte: '17:00:00' }
                      }
                    },
                    {
                      $group: { //Sử dụng $group để nhóm và tính tổng số giờ làm thêm cho mỗi ngày.
                        _id: '$attendanceDate',
                        totalOvertime: { $sum: 1 }
                      }
                    },
                    {
                      $project: { //Sử dụng $project cuối cùng để tái định dạng kết quả.
                        _id: 0,
                        date: '$_id',
                        totalOvertime: 1
                      }
                    }
                  ]);

                  // Extract the total overtime hours for each day
                    const dailyOvertimeHours = overTimeData.map(entry => entry.totalOvertime);

                    // Sum up the total overtime hours for the month
                    const overTime = dailyOvertimeHours.reduce((sum, hours) => sum + hours, 0);

                

                  const calculate = await calculateTotalSalary(idPosition, idSalaryGrade, idAllowance, presentDate, overTimeDay, overTime, idComment);
                // const totalSalary = (await calculateTotalSalary(idPosition, idSalaryGrade, idAllowance, presentDate, overTimeDay, overTime, idComment)).totalSalary;
                // const incomeTax = (await calculateTotalSalary(idPosition, idSalaryGrade, idAllowance, presentDate,overTimeDay,overTime,idComment)).taxRate;
                // const totalIncome=(await calculateTotalSalary(idPosition, idSalaryGrade, idAllowance, presentDate,overTimeDay,overTime,idComment)).totalIncome;
                // const incomeTaxAmount = (await calculateTotalSalary(idPosition, idSalaryGrade, idAllowance, presentDate,overTimeDay,overTime,idComment)).incomeTaxAmount;
                // const bonus = (await calculateTotalSalary(idPosition, idSalaryGrade, idAllowance, presentDate,overTimeDay,overTime)).bonus;
                const totalSalary= calculate.totalSalary;
                const incomeTax= calculate.incomeTax;
                const totalIncome= calculate.totalIncome;
                const incomeTaxAmount= calculate.incomeTaxAmount;
                const bonus= calculate.bonus;



                
                const newSalary = new Salary({
                    userId,
                    idPosition,
                    idSalaryGrade,
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
                    bonus
                });
                
                await newSalary.save();

                res.status(201).json({ message: 'Salary created successfully', salary: newSalary });

    }catch(err){
        throw err
    }
};

const updateSalary = async (req,res) =>{
    const {id} = req.params;
    const {idAllowance} = req.body;
    try{
        const salary = await Salary.findById(id);
        if(!salary){
            throw new NotFoundError('Not found salary');
        }
        salary.totalSalary = (await calculateTotalSalary(salary.idPosition, salary.idSalaryGrade, idAllowance, salary.presentDate,salary.overTimeDay, salary.overTime,salary.idComment)).totalSalary;
        salary.incomeTax = (await calculateTotalSalary(salary.idPosition, salary.idSalaryGrade, idAllowance, salary.presentDate, salary.overTimeDay, salary.overTime,salary.idComment)).taxRate;
        salary.totalIncome=(await calculateTotalSalary(salary.idPosition, salary.idSalaryGrade, idAllowance, salary.presentDate,salary.overTimeDay, salary.overTime,salary.idComment)).totalIncome;
        salary.incomeTaxAmount = (await calculateTotalSalary(salary.idPosition, salary.idSalaryGrade, idAllowance, salary.presentDate,salary.overTimeDay, salary.overTime,salary.idComment)).incomeTaxAmount;
        salary.bonus = (await calculateTotalSalary(salary.idPosition, salary.idSalaryGrade, idAllowance, salary.presentDate,salary.overTimeDay, salary.overTime,salary.idComment)).bonus;
        const updateSalary = await salary.save();
        res.status(200).json(updateSalary)

    }
    catch(err){
        throw err
    }
};

const confirmSalary = async (req,res) =>{
    const {id} = req.params;
    try{
        const {payDay} = req.body
        const salary = await Salary.findById(id);
        if(!salary){
            throw new NotFoundError('Not found salary');
        }
        salary.payDay = payDay ? payDay:salary.payDay;
        const updateSalary = await salary.save();
        res.status(200).json(updateSalary)

    }
    catch(err){
        throw err
    }
}



const calculateTotalSalary = async (idPosition, idSalaryGrade, idAllowances, presentDate, overTimeDay, overTime, idComment) => {
    const salaryGrade = await SalaryGrade.findById(idSalaryGrade);
    const position = await Position.findById(idPosition);
    const allowances = await Allowance.find({ _id: { $in: idAllowances } });

    const baseSalary = position ? position.basicSalary : 0;


    // Truy vấn tất cả các bản ghi Bonus cùng lúc
    const comment = await Comment.findById(idComment);

    const bonus = await calculateBonus(comment.rate);

    // Tính tổng phụ cấp từ danh sách các mức phụ cấp của nhân viên
    const allowanceAmount = allowances.reduce((total, allowance) => total + allowance.amount, 0);

    const total = (baseSalary * salaryGrade.factor )/26 * (presentDate + overTimeDay)+ allowanceAmount  + overTime*((baseSalary * salaryGrade.factor  + allowanceAmount)/26)/8;
    const totalIncome = total*bonus + total;


    // Tính toán thuế thu nhập cá nhân dựa trên tổng thu nhập
    const incomeTaxAmount = calculateIncomeTax(totalIncome).incomeTaxAmount;

    const taxRate = calculateIncomeTax(totalIncome).taxRate

    console.log({totalIncome})
    console.log({incomeTaxAmount})
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
}


// Hàm tính thuế thu nhập cá nhân dựa trên thu nhập và thuế suất
function calculateIncomeTax(income) {
    let taxRate = 5;
    if(income<=5000000){
        taxRate=5
    }else if(income<=10000000){
            taxRate=10
        }else if(income<=18000000){
                taxRate=15
            }else if(income<=32000000){
                    taxRate=20
                }else if(income<=52000000){
                        taxRate=25
                    }else if(income<80000000){
                            taxRate=30
                        }else taxRate=35
    const incomeTaxAmount = income * (taxRate / 100);
    return {
        incomeTaxAmount,taxRate
    };
}




const  calculateBonus = async (rate)=> {
  let bonus = 0;
  switch (rate){
    case 8:
      bonus= 0.08
      break;
    case 9:
      bonus = 0.09
      break;
    case 10:
      bonus = 0.1
      break;
    default:
      bonus = 0;
  }
return bonus;
}

export {getSalaries,getSalary,postSalary, updateSalary,confirmSalary, calculateBonus,calculateIncomeTax}