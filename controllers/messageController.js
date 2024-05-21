import Message from "../models/Message.js";

const saveMessage = async (req, res) => {
  try {
    var message = new Message({
      receiverId: req.body.receiverId,
      senderId: req.body.senderId,
      message: req.body.message,
    });

    var newMessage = await message.save();
    res.status(200).send({ message: "Message inserted!", data: newMessage });
  } catch (err) {
    res.status(err.status || 400).json({
      message: err.messageObject || err.message,
    });
  }
};

const updateMessage = async (req, res) => {
  try {
    var existingMessage = await Message.findById(req.params._id);
    existingMessage.message = req.body.message;
    var updatedMessage = await existingMessage.save();
    res.status(200).send({ message: "Message updated!", data: updatedMessage });
  } catch (err) {
    res.status(err.status || 400).json({
      message: err.messageObject || err.message,
    });
  }
};

const deleteMessage = async (req, res) => {
  try {
    var deleteMessage = await Message.deleteOne({ _id: req.params._id });
    res.status(200).send({ message: "Message deleted!", data: deleteMessage });
  } catch (err) {
    res.status(err.status || 400).json({
      message: err.messageObject || err.message,
    });
  }
};

export { deleteMessage, saveMessage, updateMessage };
