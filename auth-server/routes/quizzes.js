const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Quiz = require('../models/Quiz');
const Course = require('../models/Course');
const Module = require('../models/Module');
const { callAIService } = require('../services/aiService');
const Progress = require('../models/Progress'); // <--- CRITICAL IMPORT

// @route   POST api/quizzes/save
// @desc    Create or Update a quiz
router.post('/save', auth, async (req, res) => {
    const { quizId, courseId, moduleId, title, questions, isPublished, creationMode } = req.body;

    try {
        let quiz;

        if (quizId) {
            // UPDATE EXISTING
            quiz = await Quiz.findById(quizId);
            if (!quiz) return res.status(404).json({ msg: 'Quiz not found' });

            quiz.title = title || quiz.title;
            quiz.questions = questions;
            quiz.isPublished = isPublished;
            quiz.creationMode = creationMode;

            await quiz.save();
        } else {
            // CREATE NEW
            quiz = new Quiz({
                course: courseId,
                module: moduleId || null,
                title: title || (moduleId ? "Module Quiz" : "Final Quiz"),
                questions,
                isPublished,
                creationMode
            });
            await quiz.save();

            // Link to Course Curriculum ONLY if it's a standalone final quiz
            if (!moduleId) {
                const course = await Course.findById(courseId);
                course.curriculum.push({
                    type: 'quiz',
                    item: quiz._id,
                    typeModel: 'Quiz'
                });
                await course.save();
            }
        }

        res.json(quiz);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/quizzes/generate-ai
// @desc    Collect data and call AI to generate quiz questions
router.post('/generate-ai', auth, async (req, res) => {
    const { courseId, moduleId } = req.body;

    try {
        let sourceText = "";

        if (moduleId) {
            // MODULE SCOPE: Get lessons from specific module
            const module = await Module.findById(moduleId).populate('lessons');
            sourceText = module.lessons
                .map(l => `Lesson: ${l.title}\nContext: ${l.description || l.content}`)
                .join("\n\n");
        } else {
            // COURSE SCOPE: Get all lessons from all modules
            const course = await Course.findById(courseId).populate({
                path: 'curriculum.item',
                populate: { path: 'lessons' }
            });

            course.curriculum.forEach(entry => {
                if (entry.type === 'module' && entry.item.lessons) {
                    entry.item.lessons.forEach(l => {
                        sourceText += `Lesson: ${l.title}\nContext: ${l.description || l.content}\n\n`;
                    });
                }
            });
        }

        if (!sourceText.trim()) {
            return res.status(400).json({ msg: "No content available to generate a quiz. Add lessons first." });
        }

        // AI PROMPT CONSTRUCTION
        const prompt = `
You are an AI that generates quizzes for college students.

TASK:
Create EXACTLY 10 multiple-choice questions based ONLY on the given Context Data.

RULES:
1. Use ONLY the information from the Context Data.
2. If the Context Data is insufficient, create VERY BASIC questions related to the main topic.
3. Each question MUST have exactly 4 options.
4. Only ONE option must be correct.
5. The correct answer must be indicated using a ZERO-BASED index (0, 1, 2, or 3).
6. Explanations must be short and clear (1–2 sentences).
7. Do NOT add extra text, comments, or explanations outside the JSON.
8. Output MUST be valid JSON. No markdown. No trailing commas.

CONTEXT DATA:
${sourceText}

OUTPUT FORMAT (STRICT — FOLLOW EXACTLY):
{
  "questions": [
    {
      "questionText": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswerIndex": 0,
      "explanation": "Short explanation here"
    }
  ]
}
`;


        const aiResult = await callAIService(prompt);

        // OpenRouter models usually return { questions: [...] }
        const questions = aiResult.questions || aiResult;

        res.json(questions);
    } catch (err) {
        res.status(500).json({ msg: "AI failed to generate quiz questions." });
    }
});

// @route   DELETE api/quizzes/:id
router.delete('/:id', auth, async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return res.status(404).json({ msg: 'Quiz not found' });

        // If it's a standalone course quiz, remove from Course curriculum
        if (!quiz.module) {
            await Course.findByIdAndUpdate(quiz.course, {
                $pull: { curriculum: { item: quiz._id } }
            });
        }

        await Quiz.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Quiz removed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET api/quizzes/:id
// @desc    Get a single quiz by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({ msg: 'Quiz not found' });
        }

        res.json(quiz);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Quiz not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   POST api/quizzes/:id/submit
// @desc    Submit quiz score and update course progress
router.post('/:id/submit', auth, async (req, res) => {
    const { score, passed, courseId } = req.body;

    try {
        let progress = await Progress.findOne({ user: req.user.id, course: courseId });

        if (!progress) {
            progress = new Progress({ user: req.user.id, course: courseId, completedQuizzes: [] });
        }

        // Add or Update quiz result
        const quizIndex = progress.completedQuizzes.findIndex(q => q.quiz.toString() === req.params.id);
        
        const quizResult = { quiz: req.params.id, score, passed, attemptedAt: Date.now() };

        if (quizIndex > -1) {
            progress.completedQuizzes[quizIndex] = quizResult;
        } else {
            progress.completedQuizzes.push(quizResult);
        }

        await progress.save();
        res.json(progress);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;