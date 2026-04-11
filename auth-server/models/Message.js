const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String },
    mediaUrl: { type: String },
    mediaType: {
        type: String,
        enum: ['text', 'image', 'video', 'audio'],
        default: 'text'
    },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // For "Delete for me"
    isDeletedForEveryone: { type: Boolean, default: false }, // For "Delete for everyone"
    createdAt: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
});

module.exports = mongoose.model('Message', MessageSchema);