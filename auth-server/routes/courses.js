const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const User = require('../models/User');
const Module = require('../models/Module');
const Quiz = require('../models/Quiz');
const Progress = require('../models/Progress');

// @route    GET api/courses
// @desc     Get all courses (for the Explore screen recommendations)
router.get('/', auth, async (req, res) => {
    try {
        // Fetch all courses and populate mentor info
        const courses = await Course.find()
            .populate('mentor', 'username profilePictureUrl')
            .sort({ createdAt: -1 })
            .limit(10); // Limit to 10 for performance

        res.json(courses);
    } catch (err) {
        console.error("Fetch All Courses Error:", err.message);
        res.status(500).send('Server Error');
    }
});


// @route    GET api/courses/enrolled
router.get('/enrolled', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const courses = await Course.find({ _id: { $in: user.enrolledCourses } })
            .populate('mentor', 'username')
            .lean();

        // Calculate progress for each course
        const enrichedCourses = await Promise.all(courses.map(async (course) => {
            const progress = await Progress.findOne({ user: req.user.id, course: course._id });
            
            // Count total items (lessons inside modules + standalone quizzes)
            let totalItems = 0;
            const modules = await Module.find({ course: course._id });
            modules.forEach(m => totalItems += m.lessons.length);
            const quizzes = await Quiz.find({ course: course._id });
            totalItems += quizzes.length;

            const completedCount = (progress?.completedLessons?.length || 0) + (progress?.completedQuizzes?.length || 0);
            const percentage = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

            return {
                ...course,
                progressPercentage: percentage,
                isCompleted: percentage === 100 && totalItems > 0
            };
        }));

        res.json(enrichedCourses);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route    GET api/courses/saved
router.get('/saved', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const courses = await Course.find({ _id: { $in: user.savedCourses } })
            .populate('mentor', 'username');
        res.json(courses);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

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

// @route   POST api/courses
router.post('/', auth, async (req, res) => {
    const { title, description, category, thumbnailUrl } = req.body;
    if (!title || !description || !category) {
        return res.status(400).json({ msg: 'Please enter all required fields.' });
    }
    try {
        const newCourse = new Course({
            title, description, category, thumbnailUrl,
            mentor: req.user.id
        });
        const course = await newCourse.save();
        res.status(201).json(course);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST api/courses/:id/enroll
router.post('/:id/enroll', auth, async (req, res) => {
    try {
        const courseId = req.params.id;
        const user = await User.findById(req.user.id);
        if (user.enrolledCourses.includes(courseId)) {
            return res.status(400).json({ msg: 'Already enrolled' });
        }
        user.enrolledCourses.push(courseId);
        await user.save();
        res.json(user.enrolledCourses);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/courses/:id/enroll
router.delete('/:id/enroll', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.enrolledCourses = user.enrolledCourses.filter(id => id.toString() !== req.params.id);
        await user.save();
        res.json({ msg: 'Successfully unenrolled', enrolledCourses: user.enrolledCourses });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST api/courses/:id/complete-lesson
router.post('/:id/complete-lesson', auth, async (req, res) => {
    const { lessonId } = req.body;
    const courseId = req.params.id;
    try {
        let progress = await Progress.findOne({ user: req.user.id, course: courseId });
        if (!progress) {
            progress = new Progress({ user: req.user.id, course: courseId, completedLessons: [lessonId] });
        } else {
            if (!progress.completedLessons.includes(lessonId)) {
                progress.completedLessons.push(lessonId);
            }
        }
        progress.lastAccessed = Date.now();
        await progress.save();
        res.json(progress);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST api/courses/:id/modules
router.post('/:id/modules', auth, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ msg: 'Course not found' });
        if (course.mentor.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

        const newModule = new Module({ title: req.body.title, course: req.params.id, lessons: [] });
        const savedModule = await newModule.save();

        course.curriculum.push({ type: 'module', item: savedModule._id, typeModel: 'Module' });
        await course.save();
        res.json(savedModule);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   POST api/courses/:id/lessons
router.post('/:id/lessons', auth, async (req, res) => {
    const { title, description, contentType, content, videoUrl, moduleId } = req.body;
    try {
        if (!moduleId || moduleId === "null" || moduleId === "") return res.status(400).json({ msg: "Module required." });

        const newLesson = new Lesson({
            title, contentType, content, videoUrl, course: req.params.id,
            description: contentType === 'blog' ? (content?.substring(0, 200) + "...") : description,
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
router.delete('/lessons/:id', auth, async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) return res.status(404).json({ msg: 'Lesson not found' });
        await Module.updateMany({ lessons: req.params.id }, { $pull: { lessons: req.params.id } });
        await Lesson.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Lesson removed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;