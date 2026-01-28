const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const Follow = require('../models/Follow');
const Bit = require('../models/Bit');

// Route for the logged-in user's own profile
router.get('/me', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const [
            user,
            teachingsCount,
            pupilsCount,
            mentorsCount,
            courses,
            bits
        ] = await Promise.all([
            User.findById(userId).select('-password'),
            Course.countDocuments({ mentor: userId }),
            Follow.countDocuments({ following: userId }),
            Follow.countDocuments({ follower: userId }),
            Course.find({ mentor: userId }).sort({ createdAt: -1 }),
            Bit.find({ creator: userId }).sort({ createdAt: -1 })
        ]);

        const profileData = {
            user,
            teachingsCount,
            pupilsCount,
            mentorsCount,
            courses,
            bits,
            isSelf: true, // This is always true for the '/me' route
            profilePictureUrl: 'https://placehold.co/100x100/EFEFEF/3B3B3B?text=PFP'
        };
        res.json(profileData);
    } catch (err) {
        console.error(err.message);
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

router.put('/', auth, async (req, res) => {
    const { firstName, lastName, bio } = req.body;

    const profileFields = {};
    if (firstName) profileFields.firstName = firstName;
    if (lastName) profileFields.lastName = lastName;
    if (bio) profileFields.bio = bio;

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