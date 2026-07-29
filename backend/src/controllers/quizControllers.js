import { sql } from "../config/db-config.js";
import { nanoid } from "nanoid";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const createQuiz = async (req, res) => {
  try {
    const { topic, difficulty, numQuestions, creatorName, duration } = req.body;

    if (!topic || !difficulty || !numQuestions || !creatorName || !duration) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const quizCode = nanoid(6).toUpperCase();

    const prompt = `
    Generate ${numQuestions} multiple choice questions on topic "${topic}" 
    with difficulty "${difficulty}".

    You MUST return ONLY a JSON object with a single "questions" key containing the array of questions.

    Example valid output:
    {
      "questions": [
        {
          "question": "Sample Question?",
          "options": {
            "A": "Option 1",
            "B": "Option 2",
            "C": "Option 3",
            "D": "Option 4"
          },
          "correct_answer": "A",
          "explanation": "Reasoning here."
        }
      ]
    }
    `;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "openai/gpt-oss-120b",
      response_format: { type: "json_object" },
      max_tokens: 7000,
    });

    const aiResponse = completion.choices[0].message.content;
    const parsedData = JSON.parse(aiResponse);
    const questionsArray = parsedData.questions || parsedData;

    const quizResult = await sql`
      INSERT INTO quizzes (topic, difficulty, num_questions, duration, quiz_code, created_by)
      VALUES (${topic}, ${difficulty}, ${numQuestions}, ${duration}, ${quizCode}, ${creatorName})
      RETURNING id
    `;

    const quizID = quizResult[0].id;

    for (let q of questionsArray) {
      await sql`
        INSERT INTO questions 
        (quiz_id, question_text, options, correct_answer, explanation)
        VALUES (
          ${quizID},
          ${q.question},
          ${JSON.stringify(q.options)},
          ${q.correct_answer},
          ${q.explanation}
        )
      `;
    }

    res.status(201).json({
      message: "Quiz created successfully",
      quizCode,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getQuiz = async (req, res) => {
  try {
    const quizzes = await sql`
      SELECT id, topic, num_questions, difficulty
      FROM quizzes
    `;

    res.status(200).json({ quizzes });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Quiz not found or server error" });
  }
};

export const getQuizByCode = async (req, res) => {
  try {
    const { code } = req.params;

    const quiz = await sql`
      SELECT id, topic, num_questions, difficulty, duration, created_by
      FROM quizzes
      WHERE quiz_code = ${code}
    `;

    if (quiz.length === 0) {
      return res.status(404).json({ message: "Quiz not found for this code." });
    }

    res.status(200).json({ quiz: quiz[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getQuizQuestions = async (req, res) => {
  try {
    const { code } = req.params;

    const quiz = await sql`SELECT id FROM quizzes WHERE quiz_code = ${code}`;
    
    if (quiz.length === 0) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Exclude correct_answer and explanation so the client can't cheat
    const questions = await sql`
      SELECT id, question_text, options
      FROM questions
      WHERE quiz_id = ${quiz[0].id}
    `;

    res.status(200).json({ questions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const { code } = req.params;
    const { answers, playerName, timeTaken } = req.body;
    // answers: { questionId: "A", ... }
    // playerName: string (optional)
    // timeTaken: number in seconds (optional)

    const quiz = await sql`SELECT id, num_questions, duration FROM quizzes WHERE quiz_code = ${code}`;
    
    if (quiz.length === 0) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const quizId = quiz[0].id;

    // Fetch the correct answers from the DB
    const questions = await sql`
      SELECT id, question_text, options, correct_answer, explanation
      FROM questions
      WHERE quiz_id = ${quizId}
    `;

    let score = 0;
    const results = questions.map((q) => {
      const userAnswer = answers[q.id];
      const isCorrect = userAnswer === q.correct_answer;
      
      if (isCorrect) score++;

      return {
        id: q.id,
        question: q.question_text,
        options: q.options,
        userAnswer,
        correctAnswer: q.correct_answer,
        isCorrect,
        explanation: q.explanation
      };
    });

    // Save to leaderboard if a player name was provided
    if (playerName && playerName.trim()) {
      const durationSeconds = quiz[0].duration * 60;
      const actualTimeTaken = (typeof timeTaken === "number" && timeTaken > 0)
        ? timeTaken
        : durationSeconds;

      await sql`
        INSERT INTO leaderboard (quiz_id, player_name, score, time_taken_seconds)
        VALUES (${quizId}, ${playerName.trim()}, ${score}, ${actualTimeTaken})
      `;
    }

    res.status(200).json({
      score,
      total: quiz[0].num_questions,
      results
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// GET /api/quiz/:code/leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const { code } = req.params;

    const quiz = await sql`SELECT id, topic FROM quizzes WHERE quiz_code = ${code}`;

    if (quiz.length === 0) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const quizId = quiz[0].id;

    const entries = await sql`
      SELECT
        id,
        player_name,
        score,
        time_taken_seconds,
        submitted_at,
        RANK() OVER (ORDER BY score DESC, time_taken_seconds ASC) AS rank
      FROM leaderboard
      WHERE quiz_id = ${quizId}
      ORDER BY score DESC, time_taken_seconds ASC
      LIMIT 100
    `;

    res.status(200).json({
      quizCode: code,
      topic: quiz[0].topic,
      leaderboard: entries
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};