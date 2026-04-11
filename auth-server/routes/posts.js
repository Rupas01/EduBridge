const express = require('express');
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const router = express.Router();
const Follow = require('../models/Follow');

// @route    GET api/posts/feed
router.get('/feed', auth, async (req, res) => {
    try {
        const followingDocs = await Follow.find({ follower: req.user.id }).select('following');
        const followingIds = followingDocs.map(doc => doc.following);
        followingIds.push(req.user.id);

        const feed = await Post.find({ user: { $in: followingIds } })
            .populate('user', 'username profilePictureUrl')
            .sort({ createdAt: -1 })
            .limit(20);

        console.log(`Feed fetched: Found ${feed.length} posts`);
        res.json(feed);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route    POST api/posts
router.post('/', auth, async (req, res) => {
    try {
        const { content, imageUrls, type } = req.body;

        console.log("--- INCOMING POST ---");
        console.log("Content:", content);
        console.log("Images received:", imageUrls ? imageUrls.length : 0);

        const newPost = new Post({
            user: req.user.id,
            content,
            imageUrls: imageUrls || [],
            type: type || (imageUrls?.length > 0 ? 'media' : 'text')
        });

        const post = await newPost.save();
        const populatedPost = await post.populate('user', 'username profilePictureUrl');

        console.log("Post saved successfully with ID:", post._id);
        res.json(populatedPost);
    } catch (err) {
        console.error("Save Error:", err.message);
        res.status(500).send('Server Error');
    }
});

// @route    GET api/posts/user/:userId
router.get('/user/:userId', auth, async (req, res) => {
    try {
        const posts = await Post.find({ user: req.params.userId })
            .populate('user', 'username profilePictureUrl')
            .sort({ createdAt: -1 });
        res.json(posts || []);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route    POST api/posts/like/:id
// @desc     Like/Unlike a post
router.post('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        // Check if the post has already been liked by this user
        if (post.likes.filter(like => like.toString() === req.user.id).length > 0) {
            // User already liked it, so "Unlike"
            const removeIndex = post.likes.map(like => like.toString()).indexOf(req.user.id);
            post.likes.splice(removeIndex, 1);
        } else {
            // Add user ID to likes array
            post.likes.unshift(req.user.id);
        }

        await post.save();
        res.json(post.likes);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});
// @route    DELETE api/posts/:id
// @desc     Delete a post by ID
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        // Security check: Only the creator can delete the post
        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized to delete this post' });
        }

        await post.deleteOne();

        res.json({ msg: 'Post successfully removed' });
    } catch (err) {
        console.error("Delete Error:", err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;