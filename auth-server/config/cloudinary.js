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
        folder: 'edubridge_uploads', // A general folder for all uploads
        resource_type: 'auto', // Let Cloudinary detect if it's an image or video
        allowed_formats: ['mp4', 'mov', 'jpg', 'png'], // Add image formats
    },
});

const upload = multer({ storage: storage });

module.exports = upload;