import InternalServerError from "../errors/internalServerError.js";
import NotFoundError from "../errors/notFoundError.js";
import cloudinary from "../helper/imageUpload.js";
import GroupChat from "../models/GroupChat.js";
import GroupMember from "../models/GroupMember.js";

const createGroup = async (req, res) => {
  try {
    const group = new GroupChat({
      creatorId: req.params.userId,
      name: req.body.name,
      limit: req.body.limit,
    });

    var result;
    if (req.file) {
      try {
        result = await cloudinary.uploader.upload(req.file.path, {
          public_id: `${group._id}_image_id`,
          width: 500,
          height: 500,
          crop: "fill",
        });
      } catch (err) {
        console.log(err);
        throw new InternalServerError(
          "Unable to upload group image, please try again"
        );
      }
    }

    var groupImage;
    // check if image upload or not
    if (result) {
      groupImage = result.url;
      group.groupImage = groupImage;
    }

    var newGroup = await group.save();
    res.status(200).send({ message: "Group created!", data: newGroup });
  } catch (err) {
    res.status(err.status || 400).json({
      message: err.messageObject || err.message,
    });
  }
};

const getGroupById = async (req, res) => {
  const { id } = req.params;
  try {
    const group = await GroupChat.findById(id).populate("creatorId");
    if (group) {
      res.status(200).json(group);
    } else {
      throw new NotFoundError("Group not found");
    }
  } catch (err) {
    res.status(err.status || 404).json({
      message: err.messageObject || err.message,
    });
  }
};

const getGroups = async (req, res) => {
  try {
    const myGroups = await GroupChat.find({
      creatorId: req.params.creatorId,
    }).populate("creatorId");
    const joinedGroups = await GroupMember.find({
      userId: req.params.creatorId,
    }).populate("groupId");

    res.status(200).json({ myGroups: myGroups, joinedGroups: joinedGroups });
  } catch (err) {
    throw err;
  }
};

const updateGroup = async (req, res) => {
  try {
    if (parseInt(req.body.limit) < parseInt(req.body.last_limit)) {
      await GroupMember.deleteMany({ groupId: req.params._id });
    }

    var result;
    if (req.file) {
      try {
        result = await cloudinary.uploader.upload(req.file.path, {
          public_id: `${req.params._id}_image_id`,
          width: 500,
          height: 500,
          crop: "fill",
        });
      } catch (err) {
        console.log(err);
        throw new InternalServerError(
          "Unable to upload group image, please try again"
        );
      }
    }

    var updateGroup;
    // check if image upload or not
    if (result) {
      updateGroup = {
        name: req.body.name,
        groupImage: result.url,
        limit: req.body.limit,
      };
    } else {
      updateGroup = {
        name: req.body.name,
        limit: req.body.limit,
      };
    }

    var newGroup = await GroupChat.findByIdAndUpdate(
      { _id: req.params._id },
      {
        $set: updateGroup,
      }
    );
    res.status(200).send({ message: "Group updated!", data: newGroup });
  } catch (err) {
    res.status(err.status || 400).json({
      message: err.messageObject || err.message,
    });
  }
};

const deleteGroup = async (req, res) => {
  try {
    await GroupChat.deleteOne({ _id: req.params._id });
    await GroupMember.deleteMany({ groupId: req.params._id });

    res
      .status(200)
      .send({ success: true, msg: "Group chat deleted successfully!" });
  } catch (err) {
    res.status(err.status || 404).json({
      message: err.messageObject || err.message,
    });
  }
};

export { getGroupById, getGroups, createGroup, updateGroup, deleteGroup };
