import NotFoundError from "../errors/notFoundError.js";
import Event from "../models/Event.js";

const getEvents = async (req,res) =>{
    try{
        const event = await Event.find({isDeleted: false})
        if(!event) {
            throw new NotFoundError('Not found any event')
        }
        res.status(200).json(event);
    }catch(err){
        throw err
    }
}

const getEvent = async (req, res) =>{
    const {id} = req.params;
    try{
        const event = await Event.findById(id)
        if (event && event.isDeleted === false) {
            res.status(200).json(event);
          } else if (event && event.isDeleted === true) {
            res.status(410).send("Event is deleted");
          } else {
            throw new NotFoundError("Event not found");
          }
    }catch(err){
        throw err
    }
}

const getEventsByDate = async (req, res) => {
    const { year, month, day } = req.params;
  
    try {
      // Tạo một đối tượng Date cho ngày cụ thể
      const targetDate = new Date(year, month - 1, day);
  
      // Sử dụng Mongoose để tìm các sự kiện cho ngày cụ thể
      const events = await Event.find({
        isDeleted: false,
        date: targetDate,
      });
  
      if (events.length === 0) {
        throw new NotFoundError(`No events found for ${day}/${month}/${year}`);
      }
  
      res.status(200).json(events);
    } catch (err) {
      throw err
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
      throw err
    }
};  

const postEvent = async (req, res) => {
    const { name, description, dateTime, users } = req.body;

    try {
        // Tìm tất cả sự kiện trong cùng khung giờ
        const eventsInSameTime = await Event.find({ dateTime: dateTime });

        // Lọc ra các người tham gia chung trong các sự kiện cùng khung giờ
        const commonUsers = eventsInSameTime.reduce((common, event) => {
            return common.concat(event.users);
        }, []).map(user => user.toString());

        // Kiểm tra xem có người tham gia nào đã tham gia sự kiện khác trong cùng khung giờ
        for (const user of users) {
            if (commonUsers.includes(user.toString())) {
                return res.status(400).json({ message: "Một số người tham gia đã tham gia sự kiện trong cùng khung giờ." });
            }
        }

        // Nếu không có người tham gia chung, tạo sự kiện mới
        const newEvent = new Event({
            name: name,
            description: description,
            dateTime: dateTime,
            users: users,
        });

        // Lưu sự kiện vào cơ sở dữ liệu
        await newEvent.save();

        // Trả về thành công hoặc thông tin về sự kiện đã tạo
        res.status(201).json(newEvent);
    } catch (err) {
        throw err;
    }
};

const updateEvent = async(req,res) =>{

}
  
  
export {getEvents,getEvent, getEventsByDate, getEventsByMonth, postEvent,updateEvent}