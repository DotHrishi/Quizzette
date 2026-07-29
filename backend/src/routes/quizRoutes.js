import express from "express";
import { createQuiz, getQuiz, getQuizByCode, getQuizQuestions, submitQuiz, getLeaderboard } from "../controllers/quizControllers.js";

const router = express.Router();

router.post("/create", createQuiz);
router.get("/getQuizzes", getQuiz);
router.get("/:code", getQuizByCode);
router.get("/:code/questions", getQuizQuestions);
router.post("/:code/submit", submitQuiz);
router.get("/:code/leaderboard", getLeaderboard);

export default router;