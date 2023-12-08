import BadRequestError from "../errors/badRequestError.js";
import NotFoundError from "../errors/notFoundError.js";
import Department from "../models/Department.js";
import User from "../models/User.js";
import Team from "../models/Team.js";
import Position from "../models/Position.js";
import Attendance from "../models/Attendance.js";
import Holiday from "../models/Holiday.js";
import { eachDayOfInterval, isWeekend, isSameDay } from 'date-fns';


const getDepartments = async (req, res) => {
  try {
    const department = await Department.find({ isDeleted: false }).populate(
      "managerId"
    );
    if (!department) {
      throw new NotFoundError("Not found any Department");
    }
    res.status(200).json(department);
  } catch (err) {
    throw err;
  }
};

const getDepartment = async (req, res) => {
  const { id } = req.params;
  try {
    const department = await Department.findById(id).populate("managerId");
    if (department && department.isDeleted === false) {
      res.status(200).json(department);
    } else if (department && department.isDeleted === true) {
      res.status(410).send("Department is deleted");
    } else {
      throw new NotFoundError("Department not found");
    }
  } catch (err) {
    throw err;
  }
};
const generateDepartmentCode = (DepartmentName) => {
  const cleanedDepartmentName = DepartmentName.toUpperCase().replace(/\s/g, "");
  const DepartmentCode = cleanedDepartmentName.substring(0, 3);

  return DepartmentCode;
};
const generateTeamCode = (TeamName, DepartmentName) => {
  const cleanedTeamName = TeamName.toUpperCase().replace(/\s/g, "");
  const cleanedDepartmentName = DepartmentName.toUpperCase().replace(/\s/g, "");
  const TeamCode =
    cleanedDepartmentName.substring(0, 3) +
    "_" +
    cleanedTeamName.substring(0, 3);

  return TeamCode;
};
const generateUserCode = (positionCode, positionAmount) => {
  positionAmount++;
  let formattedAmount = positionAmount.toString().padStart(3, "0");
  let userCode = positionCode + "_" + formattedAmount;

  return userCode;
};
const postDepartment = async (req, res) => {
  const { managerId, name } = req.body;
  try {
    const manager = await User.findOne({ _id: managerId, isEmployee: true });
    if (!manager)
      throw new NotFoundError(
        `The manager with user id ${managerId} does not exists`
      );
    else if (manager.isEmployee === false) {
      res.status(410).send(`Manager with user id ${managerId} is deleted`);
    }
    const managerPosition = await Position.findOne({
      code: "DEM",
      isDeleted: false,
    });
    const departmentExist = await Department.findOne({
      code: generateDepartmentCode(name),
    });
    if (departmentExist && departmentExist.isDeleted === true) {
      departmentExist.managerId = managerId;
      departmentExist.name = name;
      departmentExist.code = generateDepartmentCode(name);
      departmentExist.isDeleted = false;
      const newDepartment = await departmentExist.save();
      manager.departmentId = newDepartment.id;
      manager.positionId = managerPosition.id;
      if (manager.teamId != null) {
        manager.teamId = null;
      }
      await manager.save();
      const teams = await Team.find({
        departmentId: departmentExist.id,
        isDeleted: false,
      });
      if (teams.length === 0)
        throw new NotFoundError(
          `Not found Team in Department id ${departmentExist.id}`
        );
      else {
        teams.map(async (team) => {
          team.departmentId = newDepartment.id;
          await team.save();
        });
      }
      res.status(201).json({
        message: "restore Department successfully",
        department: newDepartment,
      });
    } else if (!departmentExist) {
      const department = new Department({
        name,
        managerId,
        code: generateDepartmentCode(name),
      });
      const newDepartment = await department.save();
      manager.departmentId = newDepartment._id;
      manager.positionId = managerPosition._id;
      const positionAmount = await User.countDocuments({
        positionId: managerPosition._id,
        isEmployee: true,
      });
      manager.code = generateUserCode(managerPosition.code, positionAmount);
      if (manager.teamId != null) {
        manager.teamId = null;
      }
      await manager.save();
      res.status(200).json({
        message: "Create Department successfully",
        department: newDepartment,
      });
    } else {
      throw new BadRequestError(
        `Department with code ${departmentExist.name} exist`
      );
    }
  } catch (err) {
    throw err;
  }
};

const updateDepartment = async (req, res) => {
  const { id } = req.params;
  const { managerId, name } = req.body;
  try {
    const manager = await User.findOne({ _id: managerId, isEmployee: true });
    if (!manager)
      throw new NotFoundError(
        `The manager with user id ${managerId} does not exists`
      );
    else if (manager.isEmployee === false) {
      res.status(410).send(`Manager with user id ${managerId} is deleted`);
    }
    const managerPosition = await Position.findOne({
      code: "DEM",
      isDeleted: false,
    });
    const department = await Department.findById({ _id: id, isDeleted: false });
    if (!department) {
      throw new NotFoundError("Not found Department");
    }
    department.managerId = managerId || department.managerId;
    department.name = name || department.name;
    department.code = generateDepartmentCode(name) || department.code;

    const updateDepartment = await department.save();
    const teams = await Team.find({ departmentId: id, isDeleted: false });
    if (teams || teams.length != 0) {
      await Promise.all(
        teams.map(async (team) => {
          team.code =
            generateTeamCode(name, updateDepartment.name) || team.code;
          await team.save();
        })
      );
    }

    manager.departmentId = updateDepartment.id;
    manager.positionId = managerPosition.id;
    const positionAmount = await User.countDocuments({
      positionId: managerPosition._id,
      isEmployee: true,
    });
    manager.code = generateUserCode(managerPosition.code, positionAmount);
    if (manager.teamId != null) {
      manager.teamId = null;
    }
    await manager.save();
    res.status(200).json(updateDepartment);
  } catch (err) {
    throw err;
  }
};

const deleteDepartment = async (req, res) => {
  const { id } = req.params;
  try {
    const teams = await Team.find({ departmentId: id, isDeleted: false });
    if (teams.length === 0)
      throw new NotFoundError(`Not found Team in Department id ${id}`);
    else {
      teams.map(async (team) => {
        team.isDeleted = true;
        await team.save();
      });
    }
    const department = await Department.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
    res.status(200).json({
      message: "Deleted Department successfully",
      department: department,
    });
  } catch (err) {
    throw err;
  }
};

const getDepartmentEmployeeRatio = async (req, res) => {
  try {
    const departments = await Department.find({ isDeleted: false });
    const employeeRatios = [];
    const user = await User.find({ isEmployee: true });
    console.log(user.length);

    for (const department of departments) {
      const employeesInDepartment =  (
        await User.find({ isEmployee: true, departmentId: department._id })
      ).length;
      console.log({ employeesInDepartment });

      const employeeRatio =
        user.length > 0 ? (employeesInDepartment + 1) / user.length : 0;

      employeeRatios.push({
        departmentName: department.name,
        employeeRatio,
      });
    }
    const sumRatios = employeeRatios.reduce(
      (sum, ratio) => sum + ratio.employeeRatio,
      0
    );
    const adjustmentFactor = sumRatios !== 1 ? 1 / sumRatios : 1;

    // Apply the adjustment factor to make the sum of ratios equal to 1
    for (const ratio of employeeRatios) {
      ratio.employeeRatio *= adjustmentFactor;
    }

    res.status(200).json(employeeRatios);
  } catch (err) {
    throw err;
  }
};
const getAbsenteeismRatio = async (req, res) => {
  const { month, year } = req.params;

  try {
    const departments = await Department.find({ isDeleted: false });
    const absenteeismRatios = [];

    const absenteeismCounts = await getAbsenteeismCountForAllEmployees(year, month);

    for (const department of departments) {
      const employeesInDepartment = await User.find({
        isEmployee: true,
        departmentId: department._id,
      });

      let absentEmployees = 0;

      for (const employee of employeesInDepartment) {
        absentEmployees = absentEmployees + await getAbsenteeismCountForUser(employee._id,year,month) ;
      }

      const absenteeismRatio =
      absentEmployees > 0 ? (absentEmployees / absenteeismCounts) : 0;

      absenteeismRatios.push({
        departmentName: department.name,
        absenteeismRatio,
      });
    }

    res.status(200).json(absenteeismRatios);
  } catch (err) {
    throw err;
  }
};


const getAbsenteeismCountForAllEmployees = async (year, month) => {
  try {
    const users = await User.find({ isEmployee: true });
    let absenteeismCounts = 0;

    for (const user of users) {
      const absenteeismCount = await getAbsenteeismCountForUser(user._id, year, month);
      absenteeismCounts = absenteeismCounts + absenteeismCount;
    }

    return absenteeismCounts;
  } catch (err) {
    throw err;
  }
};

const getAbsenteeismCountForUser = async (userId, year, month) => {
  try {
    // Lấy danh sách ngày lễ trong tháng
    const holidays = await Holiday.find({
      day: {
        $gte: new Date(year, month - 1, 1),
        $lte: new Date(year, month, 0),
      },
      isDeleted: false,
    });
    console.log({holidays})
    
    // const holidays = holidaysData.map(holiday => {
    //   const formattedDate = new Date(holiday.day).toISOString().split('T')[0];
    //   return `new Date('${formattedDate}')`;
    // });

    // Lấy danh sách chấm công của nhân viên trong tháng
    const attendances = await Attendance.find({
      userId,
      attendanceDate: {
        $gte: new Date(year, month - 1, 1),
        $lte: new Date(year, month, 0),
        $nin: holidays.day
      },
      isDeleted: false,
    });

    // Lọc những ngày chấm công không trùng với ngày lễ, thứ 7 và chủ nhật
    const validAttendances = attendances.filter((attendance) => {
      const attendanceDate = new Date(attendance.attendanceDate);
      const isWeekend = attendanceDate.getDay() === 0 || attendanceDate.getDay() === 6;
      return !isWeekend ;
    });

    const workday = await getWorkingDaysInMonth(year,month,holidays).length
    // Đếm số lượt nghỉ
    const absenteeismCount = workday - validAttendances.length;

    return absenteeismCount;
  } catch (err) {
    throw err;
  }
};

const getWorkingDaysInMonth = (year, month, holidays) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const allDaysInMonth = eachDayOfInterval({ start: startDate, end: endDate });

  const workingDays = allDaysInMonth.filter((day) => !isWeekend(day) && !holidays.some((holiday) => isSameDay(day, holiday)));
  console.log({workingDays})

  return workingDays;
};

const getRatioNewEmployeeOfDepartment = async (req,res) =>{
  const {month,year} = req.params
  try {
  
    const departments = await Department.find({ isDeleted: false });
    const employeeRatios = [];

    const users = await User.find({ isEmployee: true });
    const newEmployees = await getNewEmployeesInMonth(users,month,year);

    for (const department of departments) {
      const newEmployeesInDepartment = newEmployees.filter(
        (employee) => String(employee.departmentId) === String(department._id)
      );

      const employeeRatio =
        users.length > 0 ? (newEmployeesInDepartment.length ) / users.length : 0;

      employeeRatios.push({
        departmentName: department.name,
        employeeRatio,
      });
    }

    const sumRatios = employeeRatios.reduce(
      (sum, ratio) => sum + ratio.employeeRatio,
      0
    );
    const adjustmentFactor = sumRatios !== 1 ? 1 / sumRatios : 1;

    // Apply the adjustment factor to make the sum of ratios equal to 1
    for (const ratio of employeeRatios) {
      ratio.employeeRatio *= adjustmentFactor;
    }

    res.status(200).json(employeeRatios);
  } catch (err) {
    throw err;
  }
}

const getNewEmployeesInMonth = async (users, month,year) => {
  try {
    const endDayOfMonth = new Date(
      year,month,0
    );
    console.log({endDayOfMonth})
    const firstDayOfMonth = new Date(
      year,
      month - 1,
      1
    );
    console.log({firstDayOfMonth})

    const newEmployees = await Promise.all(
      users.map(async (user) => {
        const joinDate = new Date(user.createdAt);
        if (
          joinDate >= firstDayOfMonth &&
          joinDate <= endDayOfMonth &&
          user.isEmployee === true
        ) {
          return user;
        }
      })
    );

    return newEmployees.filter((employee) => employee !== undefined);
  } catch (err) {
    throw err;
  }
};


export {
  getDepartments,
  getDepartment,
  postDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentEmployeeRatio,
  getAbsenteeismRatio,
  getRatioNewEmployeeOfDepartment,

};
