import express from "express";
import { sendQuizCode } from "../controllers/emailControllers.js";

const router = express.Router();

router.post("/send-quiz-code", sendQuizCode);

export default router;
