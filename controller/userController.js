import {v2 as cloudinary} from 'cloudinary';
import { catchAsyncErrors } from '../middlewares/catchAsyncError.js';
import { User } from '../models/userSchema.js';
import ErrorHandler from '../middlewares/error.js';
import {generateToken} from '../utils/jwtToken.js'
import crypto from 'crypto';
import { sendEmail } from '../utils/sendEmail.js';


// REGISTER A USER
export const register = catchAsyncErrors(async(req, res, next) => {
    if(!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("Avatar and resume both are Required", 400));
    }

    // uploading avatar
    const {avatar} = req.files;
    const cloudinaryResponseForAvatar = await cloudinary.uploader.upload(
        avatar.tempFilePath,
        {folder : "PORTFOLIO AVATAR"}
    );

    if(!cloudinaryResponseForAvatar || cloudinaryResponseForAvatar.error) {
        console.error("Cloudinary Error : ", cloudinaryResponseForAvatar.error || "Unknown Cloudinary error");
        return next(new ErrorHandler("Failed to upload avatar", 500));
    }

    // uploading resume
    const {resume} = req.files;
    const cloudinaryResponseForResume = await cloudinary.uploader.upload(
        resume.tempFilePath,
        {folder : "PORTFOLIO RESUME"}
    );

    if(!cloudinaryResponseForResume || cloudinaryResponseForResume.error) {
        console.error("Cloudinary Error : ", cloudinaryResponseForResume.error || "Unknown Cloudinary error");
        return next(new ErrorHandler("Failed to upload resume", 500));
    }

    const {fullName, email, phone, aboutMe, password, portfolioURL, 
        githubURL, instagramURL, twitterURL, facebookURL, linkedInURL} = req.body;

    const user = await User.create({
        fullName, email, phone, aboutMe, password, portfolioURL, 
        githubURL, instagramURL, twitterURL, facebookURL, linkedInURL,
        avatar: {
            public_id: cloudinaryResponseForAvatar.public_id,
            url: cloudinaryResponseForAvatar.secure_url, 
        },
        resume: {
            public_id: cloudinaryResponseForResume.public_id,
            url: cloudinaryResponseForResume.secure_url, 
        },
    });
    generateToken(user, "Registered!", 201, res);
});


// LOGIN USER
export const login = catchAsyncErrors(async(req, res, next) => {
    const {email, password} = req.body;
    if(!email || !password) {
        return next(new ErrorHandler("Provide email and password", 400)); 
    }

    const user = await User.findOne({email}).select("+password");
    if(!user) {
        return next(new ErrorHandler("Invalid email or password", 404));
    }

    const isPasswordMatched = await user.comparePassword(password);
    if(!isPasswordMatched) {
        return next(new ErrorHandler("Invalid password", 401));
    }

    generateToken(user, "Login Successfully!", 200, res);
})


// LOGOUT USER
export const logout = catchAsyncErrors(async(req, res, next) => {
    res.status(200).cookie("token", "", {
        httpOnly : true,
        expires : new Date(Date.now()),
        sameSite : "None",
        secure : true
    }).json({
        success : true,
        message : "Logged Out !!"
    })
});


// GET USER
export const getUser = catchAsyncErrors(async(req, res, next) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success : true,
        user
    })
})


// UPDATE PROFILE
export const updateProfile = catchAsyncErrors(async(req, res, next) => {
    const newUserData = {
        fullName : req.body.fullName,
        email : req.body.email,
        phone : req.body.phone,
        aboutMe : req.body.aboutMe,
        githubURL : req.body.githubURL,
        instagramURL : req.body.instagramURL,
        portfolioURL : req.body.portfolioURL,
        facebookURL : req.body.facebookURL,
        twitterURL : req.body.twitterURL,
        linkedInURL : req.body.linkedInURL
    };

    if(req.files && req.files.avatar) {
        const avatar = req.files.avatar;
        const user = await User.findById(req.user.id);
        const profileImageId = user.avatar.public_id;
        if (profileImageId) {
            await cloudinary.uploader.destroy(profileImageId);
        }
        const newProfileImage = await cloudinary.uploader.upload(
            avatar.tempFilePath,
            {folder : "PORTFOLIO AVATAR"}
        );
        newUserData.avatar = {
            public_id: newProfileImage.public_id,
            url: newProfileImage.secure_url, 
        }
    }

    if(req.files && req.files.resume) {
        const resume = req.files.resume;
        const user = await User.findById(req.user.id);
        const resumeFileId = user.resume.public_id;
        if (resumeFileId) {
            await cloudinary.uploader.destroy(resumeFileId);
        }
        const newResume = await cloudinary.uploader.upload(
            resume.tempFilePath,
            {folder : "PORTFOLIO RESUME"}
        );
        newUserData.resume = {
            public_id: newResume.public_id,
            url: newResume.secure_url, 
        }
    }


    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        runValidators : true,
        new : true,
        useFindAndModify : false
    });

    res.status(200).json({
        success : true,
        message : "Profile Updated !!",
        user
    })
})


// UPDATE PASSWORD
export const updatePassword = catchAsyncErrors(async(req, res, next) => {
    const {currentPassword, newPassword, confirmNewPassword} = req.body;
    const user = await User.findById(req.user.id).select("+password");
    if(!currentPassword || !newPassword || !confirmNewPassword) {
        return next(new ErrorHandler("Please fill all the fields", 400));
    }

    const isPasswordMatched = await user.comparePassword(currentPassword);
    if(!isPasswordMatched) {
        return next(new ErrorHandler("Incorrect current Password", 400));
    }

    if(newPassword != confirmNewPassword) {
        return next(new ErrorHandler("New password and Confirm New Password do not match", 400));
    }

    user.password = newPassword;
    await user.save();
    res.status(200).json({
        success : true,
        message : "Password updated!"
    });
})


// GET USER FOR PORTFOLIO
export const getUserForPortfolio = catchAsyncErrors(async(req, res, next) => {
    const id = "666017d1a38158808fecb046";
    const user = await User.findById(id);
    res.status(200).json({
        success : true,
        user
    });
});


// FORGOT PASSWORD
export const forgotPassword = catchAsyncErrors(async(req, res, next) => {
    const email = req.body.email;
    if(!email) {
        return next(new ErrorHandler("Please enter email !", 404));
    }
    const user = await User.findOne({email : req.body.email});
    if(!user) {
        return next(new ErrorHandler("User Not Found !", 404));
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({validateBeforeSave : false});

    const resetPasswordUrl = `${process.env.DASHBOARD_URL}/password/reset/${resetToken}`;

    const message = `Your Reset Password Token is:- \n ${resetPasswordUrl}  \n
    If You've not requested this email then, please ignore it.
    \n
    This link is valid for only 5 minutes`;

    try {
        await sendEmail({
            email : user.email,
            subject : `Personal Portfolio Dashboard Password Recovery`,
            message,
        });
        res.status(201).json({
            success : true,
            message: `Email sent to ${user.email} successfully`,
        })
    } catch(error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorHandler(error.message, 500));
    }
})


// RESET PASSWORD
export const resetPassword = catchAsyncErrors(async(req, res, next) => {
    const {token} = req.params;
    const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({resetPasswordToken, resetPasswordExpire : { $gt : Date.now()}});

    if(!user) {
        return next(new ErrorHandler("Reset password token is invalid or has been expired", 400));
    }

    if(req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password & Confirm Password do not match"));
    }

    user.password = await req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    generateToken(user, "Reset Password Successfully!", 200, res);
});