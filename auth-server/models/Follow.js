    const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FollowSchema = new Schema({
    // The user who is doing the following (the pupil)
    follower: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // The user who is being followed (the mentor)
    following: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('Follow', FollowSchema);