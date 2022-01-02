const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,"Please Enter your Name"],
        maxlength: [30,"Name cannot exceed 30 character"],
        minlength: [4,"Name should have more tha 5 chars"]
    },
    email: {
        type: String,
        required: [true,"Please Enter your Email"],
        unique: true,
        validate: [validator.isEmail,"Please Enter a valid Email"]
    },
    password: {
        type: String,
        required: [true,"Please Enter your Password"],
        minlength: [8,"Password should be greator than 8 characters"],
        select: false
    },
    avatar: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
    },
    role: {
        type: String,
        default: "user"
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
});


userSchema.pre("save", async function(next){
    if(!this.isModified("password"))
    {
        next();
    }
    this.password = await bcrypt.hash(this.password,10);
})

//JWT TOKEN GENERATION .
userSchema.methods.getJWTToken = function(){
    return jwt.sign({id: this._id},process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRY
    });
};

userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
}

//Generating password reset token
userSchema.methods.getResetPasswordToken = function(){

    //Generating Token.
    const resetToken = crypto.randomBytes(20).toString("hex");

    //Hashing and adding to user schema.
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

module.exports = mongoose.model("User",userSchema);