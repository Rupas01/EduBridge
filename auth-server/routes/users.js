const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Follow = require('../models/Follow');
const User = require('../models/User'); // This line was missing

// @route   POST api/users/:userId/follow
// @desc    Follow a user
// @access  Private
router.post('/:userId/follow', auth, async (req, res) => {
    try {
        const userToFollowId = req.params.userId;
        const currentUserId = req.user.id;

        if (userToFollowId === currentUserId) {
            return res.status(400).json({ msg: 'You cannot follow yourself.' });
        }

        const alreadyFollowing = await Follow.findOne({
            follower: currentUserId,
            following: userToFollowId
        });

        if (alreadyFollowing) {
            return res.status(400).json({ msg: 'You are already following this user.' });
        }

        const newFollow = new Follow({
            follower: currentUserId,
            following: userToFollowId
        });

        await newFollow.save();
        res.json({ msg: 'User followed successfully.' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/users/:userId/unfollow
// @desc    Unfollow a user
// @access  Private
router.delete('/:userId/unfollow', auth, async (req, res) => {
    try {
        const userToUnfollowId = req.params.userId;
        const currentUserId = req.user.id;

        const result = await Follow.deleteOne({
            follower: currentUserId,
            following: userToUnfollowId
        });
        
        if (result.deletedCount === 0) {
            return res.status(400).json({ msg: 'You are not following this user.' });
        }

        res.json({ msg: 'User unfollowed successfully.' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/users/my-learnings
// @desc    Get all courses a user is enrolled in
// @access  Private
router.get('/my-learnings', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate({
            path: 'enrolledCourses',
            populate: { path: 'mentor', select: 'username' }
        });
        
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        
        res.json(user.enrolledCourses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;