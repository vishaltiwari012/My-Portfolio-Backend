import { Message } from "../models/messageSchema.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";

// Send Message
export const sendMessage = catchAsyncErrors(async(req, res, next) => {
    const {senderName, subject, message} = req.body;
    if(!senderName || !subject || !message) {
        return next(new ErrorHandler("Please fill full details", 400));
    }

    const data = await Message.create({senderName, subject, message});
    res.status(201).json({
        success : true,
        message : "Message Sent Successfully",
        data
    });
});

// Retrieve all messages
export const getAllMessages = catchAsyncErrors(async(req, res, next) => {
    const messages = await Message.find();
    return res.status(200).json({
        success : true,
        message : "All messages retrieved",
        messages
    })
})

// Delete a message
export const deleteMessage = catchAsyncErrors(async(req, res, next) => {
    const {id} = req.params;
    const message = await Message.findById(id);
    if(!message) {
        return next(new ErrorHandler("Message not found", 400));
    }

    await Message.deleteOne();
    res.status(201).json({
        success : true,
        message : "Message deleted successfully"
    })
})