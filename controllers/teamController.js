import BadRequestError from "../errors/badRequestError.js";
import NotFoundError from "../errors/notFoundError.js";
import Team from "../models/Team.js";
import Department from "../models/Department.js";
import User from "../models/User.js";
import Position from "../models/Position.js";

const getTeams = async (req, res) => {
  try {
    const team = await Team.find({ isDeleted: false }).populate("managerId");
    if (!team) {
      throw new NotFoundError("Not found any team");
    }
    res.status(200).json(team);
  } catch (err) {
    throw err;
  }
};
const getTeamsByDepartmentId = async (req, res) => {
  try {
    const id = req.params.departmentId;
    const department = Department.findById(id);
    if (!department)
      throw new NotFoundError(
        `The Teams with department id ${id} does not exists`
      );
    else if (department.isDeleted === true) {
      res.status(410).send("Department is deleted");
    } else {
      const team = await Team.find({
        departmentId: id,
        isDeleted: false,
      }).populate("managerId");
      if (!team)
        throw new NotFoundError(`Not found Team in department id ${id}`);

      res.status(200).json(team);
    }
  } catch (err) {
    throw err;
  }
};

const getTeam = async (req, res) => {
  const { id } = req.params;
  try {
    const team = await Team.findById(id).populate("managerId");
    if (team && team.isDeleted === false) {
      res.status(200).json(team);
    } else if (team && team.isDeleted === true) {
      res.status(410).send("Team is deleted");
    } else {
      throw new NotFoundError("Team not found");
    }
  } catch (err) {
    throw err;
  }
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
const postTeam = async (req, res) => {
  const { managerId, name, departmentId } = req.body;
  try {
    const department = await Department.findOne({
      id: departmentId,
      isDeleted: false,
    });
    if (!department)
      throw new NotFoundError(
        `The Teams with Department id ${departmentId} does not exists`
      );
    else if (department.isDeleted === true) {
      res.status(410).send(`Department with id ${departmentId} is deleted`);
    }
    const manager = await User.findOne({ id: managerId, isEmployee: true });
    const managerPosition = await Position.findOne({
      code: "TEM",
      isDeleted: false,
    });
    if (!manager)
      throw new NotFoundError(
        `The manager with user id ${managerId} does not exists`
      );
    else if (manager.isEmployee === false) {
      res.status(410).send(`Manager with user id ${managerId} is deleted`);
    } else {
      const teamExist = await Team.findOne({
        code: generateTeamCode(name, department.name),
      });
      if (teamExist && teamExist.isDeleted === true) {
        const users = await User.find({
          teamId: teamExist._id,
          isEmployee: false,
        });

        teamExist.managerId = managerId;
        teamExist.name = name;
        teamExist.departmentId = departmentId;
        teamExist.code = generateTeamCode(name, department.name);
        teamExist.isDeleted = false;
        const newTeam = await teamExist.save();

        if (users.length === 0)
          throw new NotFoundError(`Not found user in Team id ${teamExist._id}`);
        else {
          users.map(async (user) => {
            user.isEmployee = true;
            user.teamId = newTeam.id;
            await user.save();
          });
        }
        manager.teamId = newTeam._id;
        manager.positionId = managerPosition._id;
        await manager.save();
        res.status(201).json({
          message: "restore Team successfully",
          team: newTeam,
        });
      } else if (!teamExist) {
        const team = new Team({
          departmentId,
          name,
          managerId,
          code: generateTeamCode(name, department.name),
        });
        const newTeam = await team.save();
        manager.teamId = newTeam._id;
        manager.positionId = managerPosition._id;
        await manager.save();
        res.status(200).json({
          message: "Create Team successfully",
          team: newTeam,
        });
      } else {
        throw new BadRequestError(`Team with name ${teamExist.name} exist`);
      }
    }
  } catch (err) {
    throw err;
  }
};

const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { managerId, name, departmentId } = req.body;
    const department = await Department.findOne({
      _id: departmentId,
      isDeleted: false,
    });
    if (!department)
      throw new NotFoundError(
        `The Teams with Department id ${departmentId} does not exists`
      );
    else if (department.isDeleted === true) {
      res.status(410).send(`Department with id ${departmentId} is deleted`);
    }
    const team = await Team.findById({ _id: id, isDeleted: false });
    if (!team) {
      throw new NotFoundError("Not found Team");
    }

    const manager = await User.findOne({ _id: managerId, isEmployee: true });
    if (!manager)
      throw new NotFoundError(
        `The manager with user id ${managerId} does not exists`
      );
    else if (manager.isEmployee === false) {
      res.status(410).send(`Manager with user id ${managerId} is deleted`);
    }
    const managerPosition = await Position.findOne({
      code: "TEM",
      isDeleted: false,
    });
    team.managerId = managerId || team.managerId;
    team.name = name || team.name;
    team.departmentId = departmentId || team.departmentId;
    team.code = generateTeamCode(name, department.name) || team.code;

    const updateTeam = await team.save();
    manager.teamId = updateTeam.id;
    manager.positionId = managerPosition.id;
    await manager.save();
    res.status(200).json(updateTeam);
  } catch (err) {
    throw err;
  }
};

const deleteTeam = async (req, res) => {
  const { id } = req.params;
  try {
    const team = await Team.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
    const users = await User.find({ teamId: id, isEmployee: true });
    users.map(async (user) => {
      user.isEmployee = false;
      await user.save();
    });
    res.status(200).json({
      message: "Deleted Team successfully",
      team: team,
    });
  } catch (err) {
    throw err;
  }
};

export {
  getTeams,
  getTeamsByDepartmentId,
  getTeam,
  postTeam,
  updateTeam,
  deleteTeam,
};
