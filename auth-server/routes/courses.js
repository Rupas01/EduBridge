const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const User = require('../models/User');
const Module = require('../models/Module');
const Quiz = require('../models/Quiz');
const Progress = require('../models/Progress');

// @route   GET api/courses/:id
router.get('/:id', auth, async (req, res) => {
    try {
        const courseId = req.params.id;
        const userId = req.user.id;

        const course = await Course.findById(courseId)
            .populate('mentor', 'username')
            .populate({ path: 'curriculum.item', options: { strictPopulate: false } })
            .lean();

        if (!course) return res.status(404).json({ msg: 'Course not found' });

        const isMentor = course.mentor._id.toString() === userId;
        const userDoc = await User.findById(userId);
        const isEnrolled = userDoc.enrolledCourses.map(id => id.toString()).includes(courseId.toString());

        // 1. Fetch Student Progress Data
        const progress = await Progress.findOne({ user: userId, course: courseId }).lean();
        const completedLessonIds = progress?.completedLessons?.map(id => id.toString()) || [];
        const completedQuizzes = progress?.completedQuizzes || [];
        const completedQuizIds = completedQuizzes.map(q => q.quiz.toString());

        let canAccessNext = true; 
        let totalItemsCount = 0; 
        let completedItemsCount = 0;

        // 2. Process Curriculum and Gating
        if (course.curriculum && course.curriculum.length > 0) {
            for (let entry of course.curriculum) {
                if (entry.type === 'module' && entry.item) {
                    const populatedModule = await Module.findById(entry.item._id).populate('lessons').lean();
                    const moduleQuizzes = await Quiz.find({ module: entry.item._id }).lean();
                    let allModuleLessonsDone = true;

                    if (populatedModule.lessons) {
                        populatedModule.lessons = populatedModule.lessons.map((lesson) => {
                            totalItemsCount++;
                            const isDone = completedLessonIds.includes(lesson._id.toString());
                            if (isDone) completedItemsCount++;
                            const locked = !isMentor && !isDone && (totalItemsCount > 1 && !canAccessNext);
                            canAccessNext = isDone; 
                            if (!isDone) allModuleLessonsDone = false;
                            return { ...lesson, isLocked: locked, isCompleted: isDone };
                        });
                    }

                    const processedQuizzes = moduleQuizzes.map(q => {
                        totalItemsCount++;
                        const isDone = completedQuizIds.includes(q._id.toString());
                        if (isDone) completedItemsCount++;
                        return {
                            ...q,
                            isCompleted: isDone,
                            isLocked: !isMentor && (!isEnrolled || !allModuleLessonsDone)
                        };
                    });
                    entry.item = { ...populatedModule, quizzes: isMentor ? processedQuizzes : processedQuizzes.filter(q => q.isPublished) };
                }

                if (entry.type === 'quiz' && entry.item) {
                    const quizDoc = await Quiz.findById(entry.item._id).lean();
                    if (!isMentor && (!quizDoc || !quizDoc.isPublished)) {
                        entry.hidden = true;
                    } else {
                        totalItemsCount++;
                        const isDone = completedQuizIds.includes(quizDoc._id.toString());
                        if (isDone) completedItemsCount++;
                        const isFinalLocked = !isMentor && (!isEnrolled || completedItemsCount < totalItemsCount - 1);
                        entry.item = { ...quizDoc, isLocked: isFinalLocked, isCompleted: isDone };
                    }
                }
            }
            course.curriculum = course.curriculum.filter(entry => !entry.hidden);
        }

        // 3. PERFORMANCE ANALYTICS CALCULATION
        let totalQuizPercentage = 0;
        let quizzesAttempted = completedQuizzes.length;

        for (let q of completedQuizzes) {
            const quizData = await Quiz.findById(q.quiz).select('questions').lean();
            if (quizData && quizData.questions.length > 0) {
                totalQuizPercentage += (q.score / quizData.questions.length) * 100;
            }
        }

        const averageScore = quizzesAttempted > 0 ? Math.round(totalQuizPercentage / quizzesAttempted) : 0;

        let grade = "N/A";
        let gradeColor = "#999";
        if (quizzesAttempted > 0) {
            if (averageScore >= 90) { grade = "A+"; gradeColor = "#4CAF50"; }
            else if (averageScore >= 80) { grade = "A"; gradeColor = "#8BC34A"; }
            else if (averageScore >= 70) { grade = "B"; gradeColor = "#FFC107"; }
            else if (averageScore >= 60) { grade = "C"; gradeColor = "#FF9800"; }
            else { grade = "D"; gradeColor = "#F44336"; }
        }

        course.isEnrolled = isEnrolled;
        course.isMentor = isMentor;
        course.stats = {
            totalLessons: totalItemsCount,
            completedLessons: completedItemsCount,
            progressPercentage: totalItemsCount > 0 ? Math.round((completedItemsCount / totalItemsCount) * 100) : 0,
            averageScore,
            performanceGrade: grade,
            gradeColor,
            quizzesPassed: completedQuizzes.filter(q => q.passed).length
        };

        res.json(course);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// ... Keep the rest of your file (POST modules, enroll, etc.) as is ...

// @route   POST api/courses/:id/complete-lesson
// @desc    Mark a lesson as completed for the current user
router.post('/:id/complete-lesson', auth, async (req, res) => {
    const { lessonId } = req.body;
    const courseId = req.params.id;

    try {
        let progress = await Progress.findOne({ user: req.user.id, course: courseId });

        if (!progress) {
            // Create progress doc if it doesn't exist (first lesson completed)
            progress = new Progress({
                user: req.user.id,
                course: courseId,
                completedLessons: [lessonId]
            });
        } else {
            // Add lesson only if not already present
            if (!progress.completedLessons.includes(lessonId)) {
                progress.completedLessons.push(lessonId);
            }
        }

        progress.lastAccessed = Date.now();
        await progress.save();

        res.json(progress);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/courses
// @desc    Create a new course
// @access  Private
router.post('/', auth, async (req, res) => {
    const { title, description, category, thumbnailUrl } = req.body;

    if (!title || !description || !category) {
        return res.status(400).json({ msg: 'Please enter all required fields.' });
    }

    try {
        const newCourse = new Course({
            title,
            description,
            category,
            thumbnailUrl,
            mentor: req.user.id
        });

        const course = await newCourse.save();
        res.status(201).json(course);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST Add Module
// @route   POST api/courses/:id/modules
router.post('/:id/modules', auth, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ msg: 'Course not found' });

        // Ensure the person adding the module is the mentor
        if (course.mentor.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        // 1. Create the Module document
        const newModule = new Module({
            title: req.body.title,
            course: req.params.id,
            lessons: []
        });
        const savedModule = await newModule.save();

        // 2. Add it to the Course Curriculum array
        course.curriculum.push({
            type: 'module',
            item: savedModule._id,
            typeModel: 'Module' // This matches the 'refPath' logic in Course.js
        });

        await course.save();

        // 3. Return the saved module to the frontend
        res.json(savedModule);
    } catch (err) {
        console.error("Detailed Module Error:", err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   POST api/courses/:id/enroll
// @desc    Enroll the current user in a course
// @access  Private
router.post('/:id/enroll', auth, async (req, res) => {
    try {
        const courseId = req.params.id;
        const user = await User.findById(req.user.id);

        if (user.enrolledCourses.includes(courseId)) {
            return res.status(400).json({ msg: 'Already enrolled in this course' });
        }

        user.enrolledCourses.push(courseId);
        await user.save();
        res.json(user.enrolledCourses);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/courses/:id/enroll
// @desc    Unenroll from a course
router.delete('/:id/enroll', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        // Remove the courseId from the array
        user.enrolledCourses = user.enrolledCourses.filter(
            id => id.toString() !== req.params.id
        );

        await user.save();
        res.json({ msg: 'Successfully unenrolled', enrolledCourses: user.enrolledCourses });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST api/courses/:id/lessons
router.post('/:id/lessons', auth, async (req, res) => {
    const { title, description, contentType, content, videoUrl, moduleId } = req.body;
    try {
        // Strict Rule: Articles/Videos must have a module
        if (!moduleId || moduleId === "null" || moduleId === "") {
            return res.status(400).json({ msg: "Content must be added to a module." });
        }

        const newLesson = new Lesson({
            title,
            // Fallback for Articles so AI has context later
            description: contentType === 'blog' ? (content?.substring(0, 200) + "...") : description,
            contentType,
            content,
            videoUrl,
            course: req.params.id
        });

        const savedLesson = await newLesson.save();
        const targetModule = await Module.findById(moduleId);
        if (targetModule) {
            targetModule.lessons.push(savedLesson._id);
            await targetModule.save();
        }
        res.json(savedLesson);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/courses/lessons/:id
// @desc    Delete a lesson and remove its reference from the module
router.delete('/lessons/:id', auth, async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) return res.status(404).json({ msg: 'Lesson not found' });

        await Module.updateMany(
            { lessons: req.params.id },
            { $pull: { lessons: req.params.id } }
        );

        await Lesson.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Lesson removed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;