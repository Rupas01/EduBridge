const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../config/cloudinary');

// @route   POST api/upload/video
router.post('/video', [auth, upload.single('video')], (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ msg: 'No file' });
        // FIXED: Standardized key to mediaUrl
        res.json({ mediaUrl: req.file.path }); 
    } catch (err) { res.status(500).send('Server Error'); }
});

// @route   POST api/upload/image
router.post('/image', [auth, upload.single('image')], (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ msg: 'No file' });
        // FIXED: Standardized key to mediaUrl
        res.json({ mediaUrl: req.file.path }); 
    } catch (err) { res.status(500).send('Server Error'); }
});

// @route   POST api/upload/audio
router.post('/audio', [auth, upload.single('audio')], (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ msg: 'No file' });
        // FIXED: Standardized key to mediaUrl
        res.json({ mediaUrl: req.file.path }); 
    } catch (err) { res.status(500).send('Server Error'); }
});

module.exports = router;