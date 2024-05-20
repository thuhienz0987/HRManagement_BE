import Chat from "../models/Chat.js";

const save_chat = async (req, res) => {
  try {
    var chat = new Chat({
      receiverId: req.body.receiverId,
      senderId: req.body.senderId,
      message: req.body.message,
    });

    var newChat = await chat.save();
    res.status(200).send({ message: "Chat inserted!", data: newChat });
  } catch (err) {
    res.status(err.status || 400).json({
      message: err.messageObject || err.message,
    });
  }
};

const update_chat = async (req, res) => {
  try {
    var existingChat = await Chat.findById(req.params._id);
    existingChat.message = req.body.message;
    var updatedChat = await existingChat.save();
    res.status(200).send({ message: "Chat updated!", data: updatedChat });
  } catch (err) {
    res.status(err.status || 400).json({
      message: err.messageObject || err.message,
    });
  }
};

const delete_chat = async (req, res) => {
  try {
    var deleteChat = await Chat.deleteOne({ _id: req.params._id });
    res.status(200).send({ message: "Chat deleted!", data: deleteChat });
  } catch (err) {
    res.status(err.status || 400).json({
      message: err.messageObject || err.message,
    });
  }
};

export { delete_chat, save_chat, update_chat };
