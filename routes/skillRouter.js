import express from 'express';
import { isAuthenticated } from '../middlewares/auth.js';
import { addNewSkill, deleteSkill, getAllSkills, updateSkill } from '../controller/skillController.js';

const router = express.Router();

router.post("/add", isAuthenticated, addNewSkill);
router.get("/getall", getAllSkills);
router.delete("/delete/:id", isAuthenticated, deleteSkill);
router.put("/update/:id", isAuthenticated, updateSkill);

export default router;