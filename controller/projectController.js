import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { v2 as cloudinary } from 'cloudinary';
import { Project } from '../models/projectSchema.js';


// ADD PROJECT
export const addNewProject = catchAsyncErrors(async (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("Project Banner Image Required!", 404));
    }
    const { projectBanner } = req.files;
    const {
        title,
        description,
        gitRepoLink,
        projectLink,
        techStack,
        technologies,
        deployed,
    } = req.body;
    if (
        !title ||
        !description ||
        !gitRepoLink ||
        !projectLink ||
        !techStack ||
        !technologies ||
        !deployed
    ) {
        return next(new ErrorHandler("Please Provide All Details!", 400));
    }
    const cloudinaryResponse = await cloudinary.uploader.upload(
        projectBanner.tempFilePath,
        { folder: "PORTFOLIO PROJECT IMAGES" }
    );
    if (!cloudinaryResponse || cloudinaryResponse.error) {
        console.error(
            "Cloudinary Error:",
            cloudinaryResponse.error || "Unknown Cloudinary error"
        );
        return next(new ErrorHandler("Failed to upload avatar to Cloudinary", 500));
    }
    const project = await Project.create({
        title,
        description,
        gitRepoLink,
        projectLink,
        techStack,
        technologies,
        deployed,
        projectBanner: {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
        }
    });

    res.status(201).json({
        success: true,
        message: "New Project Added!",
        project,
    });
});



// UPDATE PROJECT
export const updateProject = catchAsyncErrors(async (req, res, next) => {
    const newProjectData = {
        title: req.body.title,
        description: req.body.description,
        techStack: req.body.techStack,
        technologies: req.body.technologies,
        deployed: req.body.deployed,
        projectLink: req.body.projectLink,
        gitRepoLink: req.body.gitRepoLink,
    };
    if (req.files && req.files.projectBanner) {
        const projectBanner = req.files.projectBanner;
        const project = await Project.findById(req.params.id);
        const projectImageId = project.projectBanner.public_id;
        await cloudinary.uploader.destroy(projectImageId);
        const newProjectImage = await cloudinary.uploader.upload(
            projectBanner.tempFilePath,
            {
                folder: "PORTFOLIO PROJECT IMAGES",
            }
        );
        newProjectData.projectBanner = {
            public_id: newProjectImage.public_id,
            url: newProjectImage.secure_url,
        };
    }
    const project = await Project.findByIdAndUpdate(
        req.params.id,
        newProjectData,
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        }
    );
    res.status(200).json({
        success: true,
        message: "Project Updated!",
        project,
    });
});




// DELETE PROJECT
export const deleteProject = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) {
        return next(new ErrorHandler("Already Deleted!", 404));
    }
    const projectImageId = project.projectBanner.public_id;
    await cloudinary.uploader.destroy(projectImageId);
    await project.deleteOne();
    res.status(200).json({
        success: true,
        message: "Project Deleted!",
    });
});


// GET ALL PROJECTS
export const getAllProjects = catchAsyncErrors(async (req, res, next) => {
    const projects = await Project.find();
    res.status(200).json({
        success: true,
        projects,
    });
});


// GET SINGLE PROJECT
export const getSingleProject = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    try {
        const project = await Project.findById(id);
        res.status(200).json({
            success: true,
            project,
        });
    } catch (error) {
        res.status(400).json({
            error,
        });
    }
});