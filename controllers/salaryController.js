import NotFoundError from "../errors/notFoundError.js";
import Salary from "../models/Salary.js";
import SalaryGrade from "../models/SalaryGrade.js";
import Bonus from "../models/Bonus.js"
import Allowance from "../models/Allowance.js";
import Position from "../models/Position.js";


const getSalaries = async (req,res) =>{
    try{
        const salary = await Salary.find({ isDeleted: true })
            .populate('idUser')
            .populate('idPosition')
            .populate('idSalaryGrade')
            .populate('idBonus')
            .populate('idAllowance');
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
            .populate('idUser')
            .populate('idPosition')
            .populate('idSalaryGrade')
            .populate('idBonus')
            .populate('idAllowance');
        if (salary && salary.isDeleted === false) {
              res.status(200).json(salary);
            } else if (salary && salary.isDeleted === true) {
              res.status(410).send("salary is deleted");
            } else {
              throw new NotFoundError("salary  not found");
            }

    }catch(err){
        throw err
    }
}

const postSalary = async (req,res) =>{
    const {idUser, idPosition, idSalaryGrade, idBonus, idAllowance, daysOff} = req.body
    try{
                const totalSalary = (await calculateTotalSalary(idPosition, idSalaryGrade, idBonus, idAllowance, daysOff)).totalSalary;
                const incomeTax = (await calculateTotalSalary(idPosition, idSalaryGrade, idBonus, idAllowance, daysOff)).taxRate;
                const totalIncome=(await calculateTotalSalary(idPosition, idSalaryGrade, idBonus, idAllowance, daysOff)).totalIncome;
                const incomeTaxAmount = (await calculateTotalSalary(idPosition, idSalaryGrade, idBonus, idAllowance, daysOff)).incomeTaxAmount;
                const newSalary = new Salary({
                    idUser,
                    idPosition,
                    idSalaryGrade,
                    idBonus,
                    idAllowance,
                    payDay: new Date(),
                    daysOff,
                    totalSalary,
                    incomeTax,
                    totalIncome,
                    incomeTaxAmount
                });
                await newSalary.save();
                res.status(201).json({ message: 'Salary created successfully', salary: newSalary });

    }catch(err){
        throw err
    }
}

const updateSalary = async (req,res) =>{
    const {id} = req.params;
    try{
        const {payDay} = req.body
        const salary = await Salary.findById(id);
        if(!salary){
            throw new NotFoundError('Not found salary');
        }
        salary.payDay = payDay ? payDay:salary.payDay
        const updateSalary = await salary.save();
        res.status(200).json(updateSalary)

    }
    catch(err){
        throw err
    }
}

const calculateTotalSalary = async (idPosition, idSalaryGrade, idBonus, idAllowances, daysOff) => {
    const salaryGrade = await SalaryGrade.findById(idSalaryGrade);
    const position = await Position.findById(idPosition);
    const allowances = await Allowance.find({ _id: { $in: idAllowances } });

    const baseSalary = position ? position.basicSalary : 0;

    // Truy vấn tất cả các bản ghi Bonus cùng lúc
    const bonuses = await Bonus.find({ _id: { $in: idBonus } });

    let bonusAmount = 0;
    if (bonuses && bonuses.length > 0) {
        bonusAmount = bonuses.reduce((total, bonus) => {
            if (bonus.bonusType === 'percentage') {
                return total + (baseSalary * bonus.bonusAmount) / 100;
            } else if (bonus.bonusType === 'fixed') {
                return total + bonus.bonusAmount;
            }
            return total;
        }, 0);
    }

    // Tính tổng phụ cấp từ danh sách các mức phụ cấp của nhân viên
    const allowanceAmount = allowances.reduce((total, allowance) => total + allowance.amount, 0);

    // Tính toán thuế thu nhập cá nhân dựa trên tổng thu nhập
    const totalIncome = baseSalary * salaryGrade.level + bonusAmount + allowanceAmount - (daysOff * someDeduction);

    const incomeTaxAmount = calculateIncomeTax(totalIncome).incomeTaxAmount;

    const taxRate = calculateIncomeTax(totalIncome).taxRate
    // Tính mức lương cuối cùng sau khi trừ thuế
    const totalSalary = totalIncome - incomeTaxAmount;

    // Trả về tổng thu nhập và mức lương
    return {
        totalIncome,
        taxRate,
        incomeTaxAmount,
        totalSalary,
        
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




export {getSalaries,getSalary,postSalary}