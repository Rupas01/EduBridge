const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Bit = require('../models/Bit');

// @route   POST api/bits
// @desc    Create a new Bit
// @access  Private
router.post('/', auth, async (req, res) => {
    const { title, videoUrl } = req.body;

    if (!title || !videoUrl) {
        return res.status(400).json({ msg: 'Please provide a title and video URL.' });
    }

    try {
        const newBit = new Bit({
            title,
            videoUrl,
            creator: req.user.id
        });

        const bit = await newBit.save();
        res.status(201).json(bit);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/bits
// @desc    Get all Bits for a feed
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const bits = await Bit.find()
            .sort({ createdAt: -1 }) // Show newest first
            .populate('creator', 'username profilePictureUrl'); // Get creator info

        res.json(bits);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;