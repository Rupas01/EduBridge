const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../config/cloudinary');

// @route   POST api/upload/video
// @desc    Upload a video file to Cloudinary
// @access  Private
router.post('/video', [auth, upload.single('video')], (req, res) => {
    console.log("--- '/api/upload/video' endpoint hit ---");
    try {
        if (!req.file) {
            console.log("[DEBUG] No file was uploaded.");
            return res.status(400).json({ msg: 'No file uploaded.' });
        }
        
        console.log("[SUCCESS] Video successfully uploaded to Cloudinary.");
        console.log("Cloudinary file data:", req.file);
        
        res.json({
            videoUrl: req.file.path,
        });
    } catch (err) {
        console.error("[ERROR] An error occurred during video upload:", err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/upload/image
// @desc    Upload an image file to Cloudinary
// @access  Private
router.post('/image', [auth, upload.single('image')], (req, res) => {
    console.log("--- '/api/upload/image' endpoint hit ---");
    try {
        if (!req.file) {
            console.log("[DEBUG] No file was uploaded.");
            return res.status(400).json({ msg: 'No file uploaded.' });
        }

        console.log("[SUCCESS] Image successfully uploaded to Cloudinary.");
        console.log("Cloudinary file data:", req.file);

        res.json({
            imageUrl: req.file.path,
        });
    } catch (err) {
        console.error("[ERROR] An error occurred during image upload:", err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;