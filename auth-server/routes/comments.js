const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Comment = require('../models/Comment');
const Post = require('../models/Post');

// @route    GET api/comments/:postId
router.get('/:postId', auth, async (req, res) => {
    try {
        console.log("Fetching comments for post:", req.params.postId);
        
        const comments = await Comment.find({ post: req.params.postId })
            .populate('user', 'username profilePictureUrl')
            .sort({ createdAt: -1 });

        res.json(comments);
    } catch (err) {
        console.error("Comment Fetch Error:", err.message);
        res.status(500).send('Server Error');
    }
});

// @route    POST api/comments/:postId
router.post('/:postId', auth, async (req, res) => {
    try {
        const newComment = new Comment({
            text: req.body.text,
            user: req.user.id,
            post: req.params.postId
        });

        const comment = await newComment.save();
        
        // Increment the comment count on the post
        await Post.findByIdAndUpdate(req.params.postId, { $inc: { commentsCount: 1 } });

        const populatedComment = await comment.populate('user', 'username profilePictureUrl');
        res.json(populatedComment);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;