import GroupChat from "../models/GroupChat.js";
import GroupMember from "../models/GroupMember.js";

const addMembers = async (req, res) => {
  try {
    const group = GroupChat.findById(req.body.groupId);
    if (!req.body.members) {
      res
        .status(200)
        .send({ success: false, msg: "Please select any one Member" });
    } else if (req.body.members.length > parseInt(group.limit)) {
      res.status(200).send({
        success: false,
        msg: "You can not select more than" + group.limit,
      });
    } else {
      await GroupMember.deleteMany({ groupId: req.body.groupId });

      var data = [];
      const members = req.body.members;
      for (let i = 0; i < members.length; i++) {
        data.push({
          groupId: req.body.groupId,
          memberId: members[i],
        });
      }
    }

    await GroupMember.insertMany(data);

    res.status(200).send({ message: "Members add successfully!", data: data });
  } catch (err) {
    res.status(err.status || 400).json({
      message: err.messageObject || err.message,
    });
  }
};

const getMembersByGroupId = async (req, res) => {
  const groupId = req.params.groupId;
  try {
    var members = await GroupMember.find({ groupId: groupId }).populate(
      "memberId",
      "-groupId"
    ); // Omit the groupId field from the result

    members = members.map((member) => member.memberId);
    const group = await GroupChat.findById({ _id: groupId }).populate(
      "creatorId"
    );
    members.push({ creator: group.creatorId });

    res.status(200).json(members);
  } catch (err) {
    throw err;
  }
};

export { getMembersByGroupId, addMembers };
