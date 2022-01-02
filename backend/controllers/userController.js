const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

const User = require("../models/usermodel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

//Register a user.

exports.registerUser = catchAsyncErrors( async (req,res,next) => {

    const {name,email,password} = req.body;
    const user = await User.create({
        name,email,password,
        avatar: {
            public_id: "This is a sample id",
            url: "Sample url"
        }
    });

    sendToken(user,201,res);
})

exports.loginUser = catchAsyncErrors( async (req,res,next) => {

    const {email,password} = req.body;

    //Checking if email password is given
    if(!email||!password)
    {
        return next(new ErrorHandler("Please Enter email and password",400));
    }

    //Checking if user exist or not
    const user = await User.findOne({email}).select("+password");

    if(!user)
    {
        return next(new ErrorHandler("Invalid Email or Password",401));
    }

    const isPasswordMatched = user.comparePassword(password);

    if(!isPasswordMatched)
    {
        return next(new ErrorHandler("Invalid Email or Password",401));
    }

    sendToken(user,200,res);
});

//Logout User.
exports.logoutUser = catchAsyncErrors( async (req,res,next)=> {
    res.cookie("token",null,{
        expires: new Date(Date.now()),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: " Logged Out successfully "
    })
})

//Forget Password
exports.forgotPassword = catchAsyncErrors( async (req,res,next)=> {

    //find user using email.
    const user = await User.findOne({email: req.body.email});
    if(!user)
    {
        return next(new ErrorHandler("User Not Found",404));
    }

    //Get ResetPassword Token.
    const resetToken = user.getResetPasswordToken();

    //Save user model with resetPassword token added in user model.
    await user.save({validateBeforeSave: false});

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;
    const emailMessage = `Your Password Reset Url is :- \n\n ${resetPasswordUrl}`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Ecommerce Password Reset',
            message: emailMessage
        });

        res.status(200).json({
            success: true,
            message: `Email For Password Reset sent to ${user.email} successfully`
        });

    } catch (error) {
        //Rollback user model with resetPassword token added in user model.
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({validateBeforeSave: false});
        return next(new ErrorHandler(error.message,500));
    }
});

//Reset Password
exports.resetPassword = catchAsyncErrors(async (req,res,next) => {
    //Creating hashed token.
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {$gt: Date.now()}
    });

    if(!user){
        return next(new ErrorHandler("Reset Password Token is inValid or has been expired",404));
    }

    if(req.params.password!=req.params.confirmPassword)
    {
        return next(new ErrorHandler("Password Dose Not Match",400));
    }

    user.password = req.params.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user,200,res);
});

//Get user Details
exports.getUserDetails = catchAsyncErrors(async (req,res,next)=> {
    const user = await User.findById(req.user.id);

    if(!user)
    {
        return next(new ErrorHandler("user not found",404));
    }
    res.status(200).json({
        success: true,
        user
    });
});

//Update Profile 
exports.updateUserProfile = catchAsyncErrors(async (req,res,next)=>{

    const newUserData = {
        name: req.body.name,
        email: req.body.email
    };

    //Need to add cloudinary for avatar update.
    const user = await User.findByIdAndUpdate(req.user.id,newUserData,{
        new: true,
        runValidators: true,
        useFindAndModify: true
    });

    res.status(200).json({
        success: true,
        user
    })
});

//Get all users (admin)
exports.getAllUser = catchAsyncErrors(async (req,res,next)=>{
    const users = await User.find();

    res.status(200).json({
        success: true,
        users
    });
});

//Get single user (admin)
exports.getSingleUser = catchAsyncErrors(async (req,res,next)=>{
    const user = await User.findById(req.params.id);

    if(!user)
    {
        return next(new ErrorHandler(`User not found with id ${req.params.id}`,404));
    }

    res.status(200).json({
        success: true,
        user
    });
});

//Update user Role (Admin)
exports.updateUserRole = catchAsyncErrors(async (req,res,next)=>{

    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    };

    //Here we won't do req.user.id else the admin it self will get updated.
    const user = await User.findByIdAndUpdate(req.params.id,newUserData,{
        new: true,
        runValidators: true,
        useFindAndModify: true
    });

    if(!user)
    {
        return next(new ErrorHandler(`User dose not exist with ${req.params.id}`,400));
    }

    res.status(200).json({
        success: true,
        user
    })
});

//Delete User (Admin)
exports.deleteUser = catchAsyncErrors(async (req,res,next)=>{

    //Here we won't do req.user.id else the admin it self will get deleted.
    const user = User.findById(req.params.id);

    if(!user)
    {
        return next(new ErrorHandler(`User dose not exist with ${req.params.id}`,400));
    }

    await user.remove();

    res.status(200).json({
        success: true,
        message: `User Deleted Successfully`
    })

});
