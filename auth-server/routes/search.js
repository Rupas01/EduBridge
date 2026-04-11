const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Course = require('../models/Course');
const User = require('../models/User');
const Post = require('../models/Post');
const Bit = require('../models/Bit');

router.get('/', auth, async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ msg: "Empty search query" });

    try {
        const regex = { $regex: query, $options: 'i' };

        const [courses, people, posts, bits] = await Promise.all([
            Course.find({ $or: [{ title: regex }, { category: regex }] }).populate('mentor', 'username').limit(5),
            User.find({ username: regex }).select('username profilePictureUrl bio').limit(5),
            Post.find({ content: regex }).populate('user', 'username').limit(5),
            // FIX: Changed .populate('user') to .populate('creator')
            Bit.find({ title: regex }).populate('creator', 'username').limit(5)
        ]);

        res.json({ courses, people, posts, bits });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;