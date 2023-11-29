import BadRequestError from "../errors/badRequestError.js";
import NotFoundError from "../errors/notFoundError.js";
import Department from "../models/Department.js";
import User from "../models/User.js";
import Team from "../models/Team.js";
import Position from "../models/Position.js";

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
const postDepartment = async (req, res) => {
  const { managerId, name } = req.body;
  try {
    const manager = await User.findOne({ id: managerId, isEmployee: true });
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
      manager.departmentId = newDepartment.id;
      manager.positionId = managerPosition.id;
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
    const manager = await User.findOne({ id: managerId, isEmployee: true });
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
    const department = await Department.findById(id);
    if (!department) {
      throw new NotFoundError("Not found Department");
    }
    department.managerId = managerId || department.managerId;
    department.name = name || department.name;

    const updateDepartment = await Department.save();
    manager.departmentId = updateDepartment.id;
    manager.positionId = managerPosition.id;
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

export {
  getDepartments,
  getDepartment,
  postDepartment,
  updateDepartment,
  deleteDepartment,
};
