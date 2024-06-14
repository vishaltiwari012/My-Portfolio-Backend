import express from 'express';
import { isAuthenticated } from '../middlewares/auth.js';
import { deleteTimeline, getAllTimelines, postTimeline } from '../controller/timelineController.js';

const router = express.Router();

router.post("/add", isAuthenticated, postTimeline);
router.get("/getall", getAllTimelines);
router.delete("/delete/:id", isAuthenticated, deleteTimeline);

export default router;