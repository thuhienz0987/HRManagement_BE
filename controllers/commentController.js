import BadRequestError from "../errors/badRequestError.js";
import NotFoundError from "../errors/notFoundError.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";

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

const getCommentsByReviewerId = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      throw new NotFoundError(`Reviewer with id ${id} does not exist`);
    }

    if (user.isDeleted) {
      res.status(410).send("User is deleted");
    } else {
      const comments = await Comment.find({ reviewerId: id, isDeleted: false })
        .populate("reviewerId")
        .populate("revieweeId");

      if (comments.length === 0) {
        throw new NotFoundError(`Not found comments for user id ${id}`);
      }

      res.status(200).json(comments);
    }
  } catch (err) {
    throw err;
  }
};

const getCommentsByRevieweeId = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      throw new NotFoundError(`Reviewee with id ${id} does not exist`);
    }

    if (user.isDeleted) {
      res.status(410).send("User is deleted");
    } else {
      const comments = await Comment.find({ revieweeId: id, isDeleted: false })
        .populate("reviewerId")
        .populate("revieweeId");

      if (comments.length === 0) {
        throw new NotFoundError(`Not found comments for user id ${id}`);
      }

      res.status(200).json(comments);
    }
  } catch (err) {
    throw err;
  }
};
const getEmployeeNotCommentByDepartmentIdMonth = async (req, res) => {
  try {
    const { departmentId, month, year } = req.params;

    const users = await User.find({ departmentId: departmentId })
      .populate("departmentId")
      .populate("positionId")
      .populate("teamId");

    if (!users || users.length === 0) {
      throw new NotFoundError("User not found");
    }

    const usersWithoutPassword = users.map((user) => {
      user.password = undefined;
      return user;
    });
    const currentDate = new Date(year, month - 1, 1);
    const nextMonthDate = new Date(year, month, 1);

    const commentsOfDepartment = await Comment.find({
      createdAt: {
        $gte: currentDate,
        $lt: nextMonthDate,
      },
      revieweeId: { $in: usersWithoutPassword.map((user) => user._id) },
    });
    const usersWithoutComments = usersWithoutPassword.filter((user) => {
      return !commentsOfDepartment.some(
        (comment) => comment.revieweeId.toString() === user._id.toString()
      );
    });

    res.status(200).json(usersWithoutComments);
  } catch (err) {
    throw err;
  }
};

const postComment = async (req, res) => {
  const { rate, comment, reviewerId, revieweeId } = req.body;
  try {
    const currentDate = new Date();

    // Kiểm tra xem ngày hiện tại có phải là ngày mùng 2 hay không
    if (currentDate.getDate() !== 2) {
      throw new BadRequestError(
        "Comments can only be posted on the 2nd day of each month."
      );
    }
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
  const { id } = req.params;
  const { rate, comment } = req.body;

  try {
    const commentExist = await Comment.findById(id);

    if (!commentExist) {
      throw new NotFoundError("Comment not found");
    }

    // Kiểm tra xem đã qua 2 ngày từ khi tạo comment chưa
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 1);

    if (commentExist.createdAt < twoDaysAgo) {
      throw new ForbiddenError("Updating is not allowed after 1 days");
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

    // Kiểm tra xem ngày hiện tại có phải là ngày mùng 3 hay không
    if (currentDate.getDate() !== 3) {
      throw new BadRequestError(
        "Comments can only be posted on the 2nd day of each month."
      );
    }
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
  const { id } = req.params;
  try {
    const commentExist = await Comment.findByIdAndUpdate(
      id,
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
  getCommentsByReviewerId,
  getCommentsByRevieweeId,
  getEmployeeNotCommentByDepartmentIdMonth,
  postComment,
  updateComment,
  additionalComment,
  deleteComment,
};
