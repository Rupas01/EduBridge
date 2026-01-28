const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BitSchema = new Schema({
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    videoUrl: { // In the future, this would point to the video file
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Bit', BitSchema);