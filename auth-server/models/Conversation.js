const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    lastMessage: { type: String },
    // Tracks who has "deleted" the conversation from their inbox
    hiddenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Conversation', ConversationSchema);