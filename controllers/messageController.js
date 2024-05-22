import Message from "../models/Message.js";
import GroupMessage from "../models/GroupMessage.js";
import GroupChat from "../models/GroupChat.js";
import GroupMember from "../models/GroupMember.js";

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

const getUserMessageHistory = async (req, res) => {
  const userId = req.params.userId;

  try {
    // Find distinct users who exchanged messages with the given user
    const distinctUsers = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
      .distinct("receiverId")
      .populate("receiverId")
      .populate("senderId");

    // Get the last message exchanged with each distinct user
    let messageHistory = await Promise.all(
      distinctUsers.map(async (otherUserId) => {
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: userId },
          ],
        })
          .sort({ createdAt: -1 })
          .limit(1); // Get the last message exchanged
        if (lastMessage) {
          return {
            userId: otherUserId._id,
            createdAt: lastMessage.createdAt,
            lastMessage: lastMessage.message,
          };
        } else return;
      })
    );

    messageHistory = messageHistory.filter((n) => n);

    const userCreatedGroups = await GroupChat.find({
      creatorId: userId,
    }).populate("creatorId");

    const userMemberGroups = await GroupMember.find({
      memberId: userId,
    })
      .populate("groupId")
      .populate("memberId");

    const allGroups = [
      ...userCreatedGroups,
      ...userMemberGroups.map((group) => group.groupId),
    ];

    const groupHistory = await Promise.all(
      allGroups.map(async (group) => {
        const lastMessage = await GroupMessage.findOne({ groupId: group._id })
          .sort({ createdAt: -1 })
          .limit(1);
        if (lastMessage) {
          return {
            groupId: group._id,
            groupName: group.name,
            groupImage: group.groupImage,
            lastMessage: lastMessage.message,
          };
        } else return;
      })
    );
    res.status(200).json({
      messageHistory: messageHistory,
      groupHistory: groupHistory,
    });
  } catch (error) {
    res.status(500).json({ message: error.message }); // Handle any errors
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

export { deleteMessage, saveMessage, getUserMessageHistory, updateMessage };
