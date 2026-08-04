const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Course = require('../models/Course');
const User = require('../models/User');
const Post = require('../models/Post');
const Bit = require('../models/Bit');

router.get('/', auth, async (req, res) => {
    const query = req.query.q;

    try {
        // Handle empty query by creating a regex only if query exists
        // If query is empty, regex becomes an empty object which matches everything
        const filter = query ? { $regex: query, $options: 'i' } : null;

        const [courses, people, posts, bits] = await Promise.all([
            Course.find(filter ? { $or: [{ title: filter }, { category: filter }] } : {})
                .populate('mentor', 'username')
                .limit(20), // Increased limit for better "View All" experience
            User.find(filter ? { username: filter } : {})
                .select('username profilePictureUrl bio')
                .limit(20),
            Post.find(filter ? { content: filter } : {})
                .populate('user', 'username')
                .limit(20),
            Bit.find(filter ? { title: filter } : {})
                .populate('creator', 'username')
                .limit(20)
        ]);

        res.json({ courses, people, posts, bits });
    } catch (err) {
        console.error("Search error:", err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;