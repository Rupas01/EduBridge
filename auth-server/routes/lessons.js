const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Lesson = require('../models/Lesson');

// @route   GET api/lessons/:id
// @desc    Get a single lesson by its ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);

        if (!lesson) {
            return res.status(404).json({ msg: 'Lesson not found' });
        }
        res.json(lesson);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;