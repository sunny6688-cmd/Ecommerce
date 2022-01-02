const ErrorHandler = require("../utils/errorhandler");

module.exports = (err,req,res,next) => {

    err.statusCode = err.statusCode || 500
    err.message = err.message || "Internal Server Error"

    if(err.name=="CastError"){
        console.log(`Error: ${err.message}`);
        const message = `Resource Not Found Invalid: ${err.path}`;
        err = new ErrorHandler(message,400);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message
    });
};