import BadRequestError from "../errors/badRequestError.js";
import NotFoundError from "../errors/notFoundError.js";
import Event from "../models/Event.js";

const getEvents = async (req, res) => {
  try {
    const event = await Event.find({ isDeleted: false });
    if (!event) {
      throw new NotFoundError("Not found any event");
    }
    res.status(200).json(event);
  } catch (err) {
    throw err;
  }
};

const getEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.findById(id);
    if (event && event.isDeleted === false) {
      res.status(200).json(event);
    } else if (event && event.isDeleted === true) {
      res.status(410).send("Event is deleted");
    } else {
      throw new NotFoundError("Event not found");
    }
  } catch (err) {
    throw err;
  }
};

const getEventsByDate = async (req, res) => {
  const { day, month, year } = req.params;
  // const targetDate = new Date(year, month - 1, day);

  // console.log({targetDate});
  try {
    // Tạo một đối tượng Date cho ngày cụ thể
    const targetDate = new Date(year, month - 1, day);

    // Sử dụng Mongoose để tìm các sự kiện cho ngày cụ thể
    const events = await Event.find({
      isDeleted: false,
      date: {
        $gte: targetDate,
        $lte: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (events.length === 0) {
      throw new NotFoundError(`No events found for ${day}/${month}/${year}`);
    }

    res.status(200).json(events);
  } catch (err) {
    throw err;
  }
};
const getEventsByMonth = async (req, res) => {
  const { year, month } = req.params;

  try {
    // Calculate the start and end date of the specified month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Use Mongoose to find events for the specified month
    const events = await Event.find({
      isDeleted: false,
      date: { $gte: startDate, $lte: endDate },
    });

    if (events.length === 0) {
      throw new NotFoundError(`No events found for ${month}/${year}`);
    }

    res.status(200).json(events);
  } catch (err) {
    throw err;
  }
};

const postEvent = async (req, res) => {
  const { name, description, room, dateTime, users } = req.body;

  try {
    // Tìm tất cả sự kiện chưa bị xóa trong cùng khung giờ, trừ sự kiện hiện tại
    const eventsInSameTime = await Event.find({
      dateTime: dateTime,
      isDeleted: false,
    });
    
//new mongoose.Types.ObjectId(user._id)

    // Lọc ra các người tham gia bắt buộc từ các sự kiện trong cùng khung giờ
    const commonMandatoryUsers = eventsInSameTime
      .map((event) => event.users)
      .reduce((common, eventUsers) => {
        return common.concat(eventUsers.filter((user) => user.mandatory));
      }, [])
      .map((user) => user.user.toString());

    // Lọc ra các người tham gia bắt buộc từ `users` của sự kiện hiện tại
    const mandatoryUsers = users.filter((user) => user.mandatory);

    // Kiểm tra xem có người tham gia bắt buộc nào đã tham gia sự kiện khác trong cùng khung giờ
    for (const user of mandatoryUsers) {
      if (commonMandatoryUsers.includes(user.user.toString())) {
        throw new BadRequestError(
          "Some mandatory participants attended another event during the same time frame"
        );
      }
    }

    const eventUsingRoom = eventsInSameTime.find(
      (event) => event.room === room
    );
    if (eventUsingRoom) {
      throw new BadRequestError(
        "The room is already booked for another event during the same time frame"
      );
    }

    // Nếu không có người tham gia bắt buộc trùng thời gian với sự kiện khác, tạo sự kiện mới
    const newEvent = new Event({
      name: name,
      description: description,
      dateTime: dateTime,
      room: room,
      users: users,
    });

    // Lưu sự kiện vào cơ sở dữ liệu
    await newEvent.save();

    // Trả về thành công hoặc thông tin về sự kiện đã tạo
    res.status(201).json({
      message: "Create event successfully",
      newEvent: newEvent,
    });
  } catch (err) {
    throw err;
  }
};

const updateEvent = async (req, res) => {
  const { id } = req.params;
  const { name, description, room, dateTime, users } = req.body;

  try {
    // Tìm sự kiện dựa trên ID
    const event = await Event.findById(id);

    if (!event) {
      throw new NotFoundError("Event not found");
    }

    // Kiểm tra xem sự kiện đã bị xóa chưa
    if (event.isDeleted) {
      res.status(410).send("Event is deleted");
      return;
    }

    // Tìm tất cả sự kiện chưa bị xóa trong cùng khung giờ, trừ sự kiện hiện tại
    const eventsInSameTime = await Event.find({
      dateTime: dateTime,
      isDeleted: false,
      _id: { $ne: id },
    });

    // Lọc ra các người tham gia bắt buộc từ sự kiện hiện tại
    const mandatoryUsers = users.filter((user) => user.mandatory);

    // Lọc ra các người tham gia bắt buộc từ các sự kiện trong cùng khung giờ
    const commonMandatoryUsers = eventsInSameTime
      .map((event) => event.users)
      .reduce((common, eventUsers) => {
        return common.concat(eventUsers.filter((user) => user.mandatory));
      }, [])
      .map((user) => user.user.toString());

    // Kiểm tra xem có người tham gia bắt buộc nào đã tham gia sự kiện khác trong cùng khung giờ
    for (const user of mandatoryUsers) {
      if (commonMandatoryUsers.includes(user.user.toString())) {
        throw new BadRequestError(
          "Some mandatory participants attended another event during the same time frame"
        );
      }
    }
    const eventUsingRoom = eventsInSameTime.find(
      (event) => event.room === room
    );
    if (eventUsingRoom) {
      throw new BadRequestError(
        "The room is already booked for another event during the same time frame"
      );
    }

    // Cập nhật thông tin của sự kiện
    event.name = name;
    event.description = description;
    event.room = room;
    event.dateTime = dateTime;
    event.users = users;

    // Lưu sự kiện đã cập nhật vào cơ sở dữ liệu
    await event.save();

    res.status(200).json(event);
  } catch (err) {
    throw err;
  }
};

const deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.findByIdAndUpdate(id, { isDeleted: true });
    res.status(200).json({
      message: "Deleted event successfully",
      event: event,
    });
  } catch (err) {
    throw err;
  }
};

export {
  getEvents,
  getEvent,
  getEventsByDate,
  getEventsByMonth,
  postEvent,
  updateEvent,
  deleteEvent,
};
