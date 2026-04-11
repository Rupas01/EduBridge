const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const Follow = require('../models/Follow');
const Bit = require('../models/Bit');

// @route    GET api/profile/me
router.get('/me', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const [user, teachingsCount, pupilsCount, mentorsCount, courses, bits] = await Promise.all([
            User.findById(userId).select('-password'),
            Course.countDocuments({ mentor: userId }),
            Follow.countDocuments({ following: userId }),
            Follow.countDocuments({ follower: userId }),
            Course.find({ mentor: userId }).sort({ createdAt: -1 }),
            Bit.find({ creator: userId }).sort({ createdAt: -1 })
        ]);

        const profileData = {
            user, // This now correctly contains the database's profilePictureUrl
            teachingsCount,
            pupilsCount,
            mentorsCount,
            courses,
            bits,
            isSelf: true
            // REMOVED: profilePictureUrl hardcoded string that was overriding your real data
        };
        res.json(profileData);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// New route for any user's profile
router.get('/:userId', auth, async (req, res) => {
    try {
        const profileUserId = req.params.userId;
        const currentUserId = req.user.id;

        const [
            user,
            teachingsCount,
            pupilsCount,
            mentorsCount,
            courses,
            bits,
            isFollowing
        ] = await Promise.all([
            User.findById(profileUserId).select('-password'),
            Course.countDocuments({ mentor: profileUserId }),
            Follow.countDocuments({ following: profileUserId }),
            Follow.countDocuments({ follower: profileUserId }),
            Course.find({ mentor: profileUserId }).sort({ createdAt: -1 }),
            Bit.find({ creator: profileUserId }).sort({ createdAt: -1 }),
            Follow.findOne({ follower: currentUserId, following: profileUserId })
        ]);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const profileData = {
            user,
            teachingsCount,
            pupilsCount,
            mentorsCount,
            courses,
            bits,
            isFollowing: !!isFollowing,
            isSelf: currentUserId === profileUserId,
            // profilePictureUrl: 'https://placehold.co/100x100/EFEFEF/3B3B3B?text=PFP'
        };
        res.json(profileData);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    PUT api/profile
router.put('/', auth, async (req, res) => {
    // FIX: Added profilePictureUrl to the destructuring
    const { firstName, lastName, bio, profilePictureUrl } = req.body;

    const profileFields = {};
    if (firstName) profileFields.firstName = firstName;
    if (lastName) profileFields.lastName = lastName;
    if (bio) profileFields.bio = bio;
    if (profilePictureUrl) profileFields.profilePictureUrl = profilePictureUrl; // FIX: Now saving the URL

    try {
        let user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: profileFields },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;