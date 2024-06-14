import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import crypto from 'crypto'

const userSchema = new mongoose.Schema({
    fullName : {
        type : String,
        required : [true, "Name required"]
    },
    email : {
        type : String,
        required : [true, "Email required"]
    },
    phone : {
        type : String,
        required : [true, "Phone required"]
    },
    aboutMe : {
        type : String,
        required : [true, "About me section is required"]
    },
    password : {
        type : String,
        required : [true, "Password required"],
        minLength : [8, "Password must contain At least 8 characters"],
        select : false
    },
    avatar : {
        public_id : {
            type : String,
            required : true
        },
        url : {
            type : String,
            required : true,
        }
    },
    resume : {
        public_id : {
            type : String,
            required : true
        },
        url : {
            type : String,
            required : true,
        }
    },
    portfolioURL: {
        type: String,
        required: [true, "Portfolio URL Required!"],
    },
    githubURL: {
        type: String,
    },
    instagramURL: {
        type: String,
    },
    twitterURL: {
        type: String,
    },
    linkedInURL: {
        type: String,
    },
    facebookURL: {
        type: String,
    },
    resetPasswordToken : String,
    resetPasswordExpire : Date,
});


// FOR HASHING THE PASSWORD
userSchema.pre("save", async function(next) {
    if(!this.isModified("password")) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
})


// FOR COMPARING PASSWORD WITH HASHED PASSWORD
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}


// GENERATING JSON WEB TOKEN
userSchema.methods.generateJsonWebToken = function() {
    return jwt.sign(
        {id : this._id},
        process.env.JWT_SECRET_KEY,
        { expiresIn : process.env.JWT_EXPIRES }
    )
}

// GENERATING RESET PASSWORD TOKEN
userSchema.methods.getResetPasswordToken = function() {
    // generating token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // hashing and adding reset password token to userSchema
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // setting reset password token expiry time
    this.resetPasswordExpire = Date.now() + 5 * 60 * 1000;

    return resetToken;
}

export const User = mongoose.model("User", userSchema);