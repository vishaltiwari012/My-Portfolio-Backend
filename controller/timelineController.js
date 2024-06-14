import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import {Timeline} from '../models/timelineSchema.js';


// CREATE TIMELINE
export const postTimeline = catchAsyncErrors(async(req, res, next) => {
    const {title, description, from, to} = req.body;
    if(!title || !description || !from || !to) {
        return next(new ErrorHandler("Please fill all fields", 400));
    }
    const newTimeline = await Timeline.create({ title, description, timeline : {from, to}});
    res.status(200).json({
        success : true,
        message : "TimeLine Added !",
        newTimeline
    });
});


// DELETE TIMELINE
export const deleteTimeline = catchAsyncErrors(async(req, res, next) => {
    const {id} = req.params;
    let timeline = await Timeline.findById(id);
    if(!timeline) {
        return next(new ErrorHandler("Timeline not found", 404));
    }

    await timeline.deleteOne();
    res.status(200).json({
        success : true,
        message : "Timeline deleted !"
    });
});


// GET ALL TIMELINE
export const getAllTimelines = catchAsyncErrors(async(req, res, next) => {
    const timelines = await Timeline.find();
    res.status(200).json({
        success : true,
        timelines
    })
})