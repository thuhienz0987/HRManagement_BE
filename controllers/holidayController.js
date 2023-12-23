import NotFoundError from "../errors/notFoundError.js";
import Holiday from "../models/Holiday.js";
import { parse, format } from "date-fns";
import BadRequestError from "../errors/badRequestError.js";

const getHolidays = async (req, res) => {
  try {
    const holiday = await Holiday.find({ isDeleted: false });
    if (!holiday) {
      throw new NotFoundError("Not found any holiday");
    }
    res.status(200).json(holiday);
  } catch (err) {
    throw err;
  }
};

const getHoliday = async (req, res) => {
  const { id } = req.params;
  try {
    const holiday = await Holiday.findById(id);
    if (holiday && holiday.isDeleted === false) {
      res.status(200).json(holiday);
    } else if (holiday && holiday.isDeleted === true) {
      res.status(410).send("Holiday is deleted");
    } else {
      throw new NotFoundError("Holiday not found");
    }
  } catch (err) {
    throw err;
  }
};

const postHoliday = async (req, res) => {
  try {
    const { day, name } = req.body;
    const dateObj = parse(day, "dd/MM/yyyy", new Date());
    const isoDateStr = format(dateObj, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
    let holidayExist = await Holiday.findOne({ day: isoDateStr });

    if (holidayExist && holidayExist.isDeleted === true) {
      holidayExist.name = name;
      holidayExist.isDeleted = false;
      const updatedHoliday = await holidayExist.save(); // Ensure the save method is available for the holidayExist object
      res.status(201).json({
        message: "restore holiday successfully",
        holiday: updatedHoliday,
      });
    } else if (holidayExist && holidayExist.isDeleted === false) {
      throw new BadRequestError(`Holiday with day ${holidayExist.day} exists`);
    } else {
      const newHoliday = new Holiday({ day: isoDateStr, name });
      const savedHoliday = await newHoliday.save();
      res.status(200).json({
        message: "Create holiday successfully",
        holiday: savedHoliday,
      });
    }
  } catch (err) {
    throw err;
  }
};

const updateHoliday = async (req, res) => {
  const { id } = req.params;
  const { day, name } = req.body;
  const dateObj = parse(day, "dd/MM/yyyy", new Date());
  const isoDateStr = format(dateObj, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

  try {
    let holiday = await Holiday.findById(id);
    if (!holiday) {
      throw new NotFoundError("Holiday not found");
    }

    // Update holiday properties
    holiday.day = day ? isoDateStr : holiday.day;
    holiday.name = name ? name : holiday.name;

    // Save the updated holiday
    const updatedHoliday = await holiday.save();
    res.status(200).json(updatedHoliday);
  } catch (err) {
    throw err;
  }
};

const deleteHoliday = async (req, res) => {
  const { id } = req.params;
  try {
    const holiday = await Holiday.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
    res.status(200).json({
      message: "Deleted holiday successfully",
      holiday: holiday,
    });
  } catch (err) {
    throw err;
  }
};

export { getHolidays, getHoliday, postHoliday, updateHoliday, deleteHoliday };
