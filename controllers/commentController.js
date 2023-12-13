import BadRequestError from "../errors/badRequestError.js";
import NotFoundError from "../errors/notFoundError.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";
import Position from "../models/Position.js";

const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ isDeleted: false })
      .populate("reviewerId")
      .populate("revieweeId");

    if (!comments || comments.length === 0) {
      throw new NotFoundError("Not found any comments");
    }

    res.status(200).json(comments);
  } catch (err) {
    throw err;
  }
};

const getComment = async (req, res) => {
  const { id } = req.params;
  try {
    const comment = await Comment.findById(id)
      .populate("reviewerId")
      .populate("revieweeId");

    if (!comment) {
      throw new NotFoundError("Comment not found");
    }

    if (comment.isDeleted) {
      res.status(410).send("Comment is deleted");
    } else {
      res.status(200).json(comment);
    }
  } catch (err) {
    throw err;
  }
};

const getCommentsByReviewerIdInMonth = async (req, res) => {
  try {
    const { reviewerId, month, year } = req.params;
    const user = await User.findById({ _id: reviewerId });
    const currentDate = new Date(year, month - 1, 1);
    const nextMonthDate = new Date(year, month, 1);
    if (!user) {
      throw new NotFoundError(`Reviewer with id ${reviewerId} does not exist`);
    }

    if (user.isDeleted) {
      res.status(410).send("User is deleted");
    } else {
      const comments = await Comment.find({
        createdAt: {
          $gte: currentDate,
          $lt: nextMonthDate,
        },
        reviewerId: reviewerId,
        isDeleted: false,
      })
        .populate("reviewerId")
        .populate("revieweeId");

      if (comments.length === 0) {
        throw new NotFoundError(`Not found comments for user id ${reviewerId}`);
      }

      res.status(200).json(comments);
    }
  } catch (err) {
    throw err;
  }
};

const getLeaderNotCommentByDepartmentIdMonth = async (req, res) => {
  try {
    const { departmentId, month, year } = req.params;
    const teamLeaderPosition = await Position.findOne({ code: "TEM" });

    const leaders = await User.find({
      departmentId: departmentId,
      positionId: teamLeaderPosition._id,
      isEmployee: true,
    })
      .populate("departmentId")
      .populate("positionId")
      .populate("teamId");

    if (!leaders || leaders.length === 0) {
      throw new NotFoundError("User not found");
    }

    const leadersWithoutPassword = leaders.map((user) => {
      user.password = undefined;
      return user;
    });
    const currentDate = new Date(year, month - 1, 1);
    const nextMonthDate = new Date(year, month, 1);

    const comments = await Comment.find({
      createdAt: {
        $gte: currentDate,
        $lt: nextMonthDate,
      },
      isDeleted: false,
      revieweeId: { $in: leadersWithoutPassword.map((user) => user._id) },
    });
    const leadersWithoutComments = leadersWithoutPassword.filter((leader) => {
      return !comments.some(
        (comment) => comment.revieweeId.toString() === leader._id.toString()
      );
    });

    res.status(200).json(leadersWithoutComments);
  } catch (err) {
    throw err;
  }
};
const getEmployeeNotCommentByTeamIdMonth = async (req, res) => {
  try {
    const { teamId, month, year } = req.params;
    const employeePosition = await Position.findOne({ code: "EMP" });

    const employees = await User.find({
      teamId: teamId,
      positionId: employeePosition._id,
      isEmployee: true,
    })
      .populate("departmentId")
      .populate("positionId")
      .populate("teamId");

    if (!employees || employees.length === 0) {
      throw new NotFoundError("User not found");
    }

    const employeesWithoutPassword = employees.map((user) => {
      user.password = undefined;
      return user;
    });
    const currentDate = new Date(year, month - 1, 1);
    const nextMonthDate = new Date(year, month, 1);

    const comments = await Comment.find({
      createdAt: {
        $gte: currentDate,
        $lt: nextMonthDate,
      },
      isDeleted: false,
      revieweeId: { $in: employeesWithoutPassword.map((user) => user._id) },
    });
    const employeesWithoutComments = employeesWithoutPassword.filter((user) => {
      return !comments.some(
        (comment) => comment.revieweeId.toString() === user._id.toString()
      );
    });

    res.status(200).json(employeesWithoutComments);
  } catch (err) {
    throw err;
  }
};
const getDepManagerNotCommentMonth = async (req, res) => {
  try {
    const { month, year } = req.params;
    const depManagerPosition = await Position.findOne({ code: "DEM" });

    const managers = await User.find({
      positionId: depManagerPosition._id,
      isEmployee: true,
    })
      .populate("departmentId")
      .populate("positionId")
      .populate("teamId");

    if (!managers || managers.length === 0) {
      throw new NotFoundError("User not found");
    }

    const managersWithoutPassword = managers.map((user) => {
      user.password = undefined;
      return user;
    });
    const currentDate = new Date(year, month - 1, 1);
    const nextMonthDate = new Date(year, month, 1);

    const comments = await Comment.find({
      createdAt: {
        $gte: currentDate,
        $lt: nextMonthDate,
      },
      isDeleted: false,
      revieweeId: { $in: managersWithoutPassword.map((user) => user._id) },
    });
    const managersWithoutComments = managersWithoutPassword.filter((user) => {
      return !comments.some(
        (comment) => comment.revieweeId.toString() === user._id.toString()
      );
    });

    res.status(200).json(managersWithoutComments);
  } catch (err) {
    throw err;
  }
};
const postComment = async (req, res) => {
  const { rate, comment, reviewerId, revieweeId } = req.body;
  try {
    const currentDate = new Date();

    const existingComment = await Comment.findOne({
      reviewerId,
      revieweeId,
      createdAt: {
        $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
        $lt: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
      },
    });

    if (existingComment) {
      const formattedDate = `${
        existingComment.createdAt.getMonth() + 1
      }/${existingComment.createdAt.getFullYear()}`;
      throw new BadRequestError(
        `A comment already exists for this pair in ${formattedDate}.`
      );
    }

    const newComment = new Comment({ rate, comment, reviewerId, revieweeId });
    await newComment.save();

    res.status(200).json({
      message: "Create Comment successfully",
      comment: newComment,
    });
  } catch (err) {
    throw err;
  }
};

const updateComment = async (req, res) => {
  const { _id } = req.params;
  const { rate, comment } = req.body;

  try {
    const commentExist = await Comment.findById(_id);

    if (!commentExist) {
      throw new NotFoundError("Comment not found");
    }

    commentExist.rate = rate !== undefined ? rate : commentExist.rate;
    commentExist.comment =
      comment !== undefined ? comment : commentExist.comment;

    const updatedComment = await commentExist.save();

    res.status(200).json(updatedComment);
  } catch (err) {
    throw err;
  }
};

const additionalComment = async (req, res) => {
  const { rate, comment, reviewerId, revieweeId } = req.body;
  try {
    const currentDate = new Date();

    const existingComment = await Comment.findOne({
      reviewerId,
      revieweeId,
      createdAt: {
        $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
        $lt: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
      },
    });

    if (existingComment) {
      const formattedDate = `${
        existingComment.createdAt.getMonth() + 1
      }/${existingComment.createdAt.getFullYear()}`;
      throw new BadRequestError(
        `A comment already exists for this pair in ${formattedDate}.`
      );
    }

    const newComment = new Comment({ rate, comment, reviewerId, revieweeId });
    await newComment.save();

    res.status(200).json({
      message: "Create Comment successfully",
      comment: newComment,
    });
  } catch (err) {
    throw err;
  }
};

const deleteComment = async (req, res) => {
  const { _id } = req.params;
  try {
    const commentExist = await Comment.findByIdAndUpdate(
      _id,
      { isDeleted: true },
      { new: true }
    );
    res.status(200).json({
      message: "Deleted Comment successfully",
      comment: commentExist,
    });
  } catch (err) {
    throw err;
  }
};

export {
  getComments,
  getComment,
  getCommentsByReviewerIdInMonth,
  getLeaderNotCommentByDepartmentIdMonth,
  getEmployeeNotCommentByTeamIdMonth,
  getDepManagerNotCommentMonth,
  postComment,
  updateComment,
  additionalComment,
  deleteComment,
};
