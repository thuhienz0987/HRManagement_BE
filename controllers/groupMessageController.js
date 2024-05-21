import GroupMessage from "../models/GroupMessage.js";

const saveGroupMessage = async (req, res) => {
  try {
    var message = GroupMessage({
      senderId: req.body.senderId,
      groupId: req.body.groupId,
      message: req.body.message,
    });

    var newMessage = await message.save();
    var showMessage = await GroupMessage.findById(newMessage._id)
      .populate("senderId")
      .populate("groupId");
    res
      .status(200)
      .send({ message: "Save message successfully!", data: showMessage });
  } catch (err) {
    res.status(err.status || 400).json({
      message: err.messageObject || err.message,
    });
  }
};

const loadGroupMessage = async (req, res) => {
  try {
    const groupMessages = await GroupMessage.find({
      groupId: req.params.groupId,
    })
      .populate("senderId")
      .populate("groupId");
    res
      .status(200)
      .send({ message: "Load message successfully!", data: groupMessages });
  } catch (err) {
    res.status(err.status || 400).json({
      message: err.messageObject || err.message,
    });
  }
};

const updateGroupMessage = async (req, res) => {
  try {
    var existingMessage = await GroupMessage.findById(req.params._id);
    existingMessage.message = req.body.message;
    var updatedMessage = await existingMessage.save();
    res
      .status(200)
      .send({ message: "Group message updated!", data: updatedMessage });
  } catch (err) {
    res.status(err.status || 400).json({
      message: err.messageObject || err.message,
    });
  }
};

const deleteGroupMessage = async (req, res) => {
  try {
    await GroupMessage.deleteOne({ _id: req.params._id });
    res.status(200).send({ message: "Delete message successfully!" });
  } catch (err) {
    res.status(err.status || 400).json({
      message: err.messageObject || err.message,
    });
  }
};

export {
  saveGroupMessage,
  loadGroupMessage,
  updateGroupMessage,
  deleteGroupMessage,
};
