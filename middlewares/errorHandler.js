const errorHandler = (err, req, res, next) => {
    console.log("ERROR LOG ", new Date().toLocaleString());
    console.log("Request: ", req.method, req.originalUrl);
    console.log("Params: ", req.params);
    console.log("Body: ", req.body);
    console.log("Query: ", req.query);
    console.log("Error:", err);
    console.log("Error stack: ", err.stack);
    console.log("--------------------------------------------------------------------");
    const messageError = err.messageObject || err.message;
    // format error
    const error = {
        status: "Error",
        error: messageError,
    };
    const status = err.status?err.status:400;
    res.status(status).json(error);
};

export default errorHandler;