const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'edubridge_uploads',
        resource_type: 'auto', // This is correct, it detects type automatically
        // FIXED: Added audio formats (mp3, m4a, wav) to the allowed list
        allowed_formats: ['mp4', 'mov', 'jpg', 'png', 'jpeg', 'mp3', 'm4a', 'wav', 'aac'], 
    },
});

const upload = multer({ storage: storage });

module.exports = upload;