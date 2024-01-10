import NotFoundError from "../errors/notFoundError.js";
import Report from "../models/Report.js";

const cloudinaryImageUploadMethod = async (file) => {
  return new Promise((resolve) => {
    cloudinary.uploader.upload(file, (err, res) => {
      if (err) return res.status(500).send("upload image error");
      resolve({
        res: res.secure_url,
        public_id: res.public_id,
      });
    });
  });
};
const getReports = async (req, res) => {
  try {
    const reports = await Report.find({ isDeleted: false }).populate(
      "reporterId"
    );

    if (!reports || reports.length === 0) {
      throw new NotFoundError("Not found any reports");
    }

    res.status(200).json(reports);
  } catch (err) {
    throw err;
  }
};

const getReport = async (req, res) => {
  const { id } = req.params;
  try {
    const report = await Report.findById(id).populate("reporterId");

    if (!report) {
      throw new NotFoundError("Report not found");
    }

    if (report.isDeleted) {
      res.status(410).send("Report is deleted");
    } else {
      res.status(200).json(report);
    }
  } catch (err) {
    throw err;
  }
};

const postReport = async (req, res) => {
  const { type, amount, reporterId, description } = req.body;
  try {
    let proofPhoto = [];
    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const newPath = await cloudinaryImageUploadMethod(path);
      proofPhoto.push({ url: newPath.res, public_id: newPath.public_id });
    }

    const newReport = new Comment({
      type,
      amount,
      reporterId,
      description,
      proofPhoto,
    });
    const savedReport = await newReport.save();

    res.status(201).json({
      message: "Create report successfully",
      report: savedReport,
    });
  } catch (err) {
    res.status(err.status || 400).json({
      message: err.messageObject || err.message,
    });
  }
};

const updateReport = async (req, res) => {
  const { _id } = req.params;
  const { type, amount, reporterId, description } = req.body;

  try {
    const reportExist = await Report.findById(_id);

    if (!reportExist) {
      throw new NotFoundError("Report not found");
    }

    let oldImageArray = [];
    if (!Array.isArray(oldImage)) oldImageArray.push(oldImage);
    else oldImageArray = oldImage;
    let imageUpdate = [];
    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const newPath = await cloudinaryImageUploadMethod(path);
      imageUpdate.push({ url: newPath.res, public_id: newPath.public_id });
    }
    let deleteImage = [];
    for (let i = 0; i < reportExist.proofPhoto.length; i++) {
      const isNotDelete = oldImageArray.filter((element) => {
        return element === reportExist.proofPhoto[i].public_id;
      });
      console.log(isNotDelete);
      if (isNotDelete.length > 0) {
        imageUpdate.push({
          url: reportExist.proofPhoto[i].url,
          public_id: reportExist.proofPhoto[i].public_id,
        });
      } else {
        console.log("is not delete", isNotDelete.length);
        deleteImage.push(reportExist.proofPhoto[i].public_id);
      }
    }
    //
    if (deleteImage.length > 0) {
      console.log(deleteImage.length);
      console.log(deleteImage);
      await cloudinary.api.delete_resources(
        deleteImage,
        function (err, result) {
          console.log(result);
        }
      );
    }

    reportExist.type = type !== undefined ? type : reportExist.type;
    reportExist.description =
      description !== undefined ? description : reportExist.description;
    reportExist.amount = amount !== undefined ? amount : reportExist.amount;
    reportExist.reporterId =
      reporterId !== undefined ? reporterId : reportExist.reporterId;
    reportExist.proofPhoto = imageUpdate;

    const updatedReport = await reportExist.save();

    res.status(200).json(updatedReport);
  } catch (err) {
    res.status(err.status || 400).json({
      message: err.messageObject || err.message,
    });
  }
};

const deleteReport = async (req, res) => {
  const { _id } = req.params;
  try {
    const reportExist = await Report.findByIdAndUpdate(
      _id,
      { isDeleted: true },
      { new: true }
    );
    if (!reportExist) {
      throw new NotFoundError("Report not found");
    }
    res.status(200).json({
      message: "Deleted report successfully",
      report: reportExist,
    });
  } catch (err) {
    res.status(err.status || 400).json({
      message: err.messageObject || err.message,
    });
  }
};

export { getReports, getReport, postReport, updateReport, deleteReport };
