const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

router.get('/conversations', auth, async (req, res) => {
    try {
        const conversations = await Conversation.find({ 
            participants: { $in: [req.user.id] },
            hiddenBy: { $ne: req.user.id } 
        })
        .populate('participants', 'firstName lastName profilePictureUrl')
        .sort({ updatedAt: -1 });

        const formattedConversations = await Promise.all(conversations.map(async (conv) => {
            const unreadCount = await Message.countDocuments({
                conversationId: conv._id,
                sender: { $ne: req.user.id },
                read: false,
                deletedBy: { $ne: req.user.id }
            });
            const otherParticipant = conv.participants.filter(p => p._id.toString() !== req.user.id);
            return { ...conv._doc, participants: otherParticipant, unreadCount };
        }));
        res.json(formattedConversations);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/start', auth, async (req, res) => {
    const { recipientId } = req.body;
    try {
        let conversation = await Conversation.findOne({ participants: { $all: [req.user.id, recipientId] } });
        if (!conversation) {
            conversation = new Conversation({ participants: [req.user.id, recipientId] });
            await conversation.save();
        } else {
            await Conversation.findByIdAndUpdate(conversation._id, { $pull: { hiddenBy: req.user.id } });
        }
        res.json(conversation);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.get('/history/:conversationId', auth, async (req, res) => {
    try {
        const messages = await Message.find({ 
            conversationId: req.params.conversationId,
            deletedBy: { $ne: req.user.id } // Filter out "Delete for me" messages
        })
        .populate('replyTo', 'text mediaType mediaUrl isDeletedForEveryone')
        .sort({ createdAt: 1 })
        .limit(100);
        res.json(messages);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/send', auth, async (req, res) => {
    const { conversationId, text, recipientId, mediaUrl, mediaType, replyTo } = req.body;
    try {
        const newMessage = new Message({
            conversationId,
            sender: req.user.id,
            recipientId,
            text,
            mediaUrl,
            mediaType: mediaType || 'text',
            replyTo: replyTo || null
        });
        await newMessage.save();
        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: mediaType !== 'text' ? `Sent an ${mediaType}` : text,
            updatedAt: Date.now(),
            $pull: { hiddenBy: { $in: [req.user.id, recipientId] } } 
        });
        const populatedMsg = await Message.findById(newMessage._id).populate('replyTo', 'text mediaType mediaUrl');
        res.json(populatedMsg);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.put('/read/:conversationId', auth, async (req, res) => {
    try {
        await Message.updateMany(
            { conversationId: req.params.conversationId, sender: { $ne: req.user.id }, read: false },
            { $set: { read: true } }
        );
        res.json({ msg: 'Read' });
    } catch (err) { res.status(500).send('Server Error'); }
});

// @route   DELETE api/messages/:id
// @desc    Delete message (type: "me" or "everyone")
router.delete('/:id', auth, async (req, res) => {
    const { type } = req.query; // "me" or "everyone"
    try {
        const message = await Message.findById(req.params.id);
        if (!message) return res.status(404).json({ msg: 'Message not found' });

        if (type === 'everyone') {
            // Only sender can delete for everyone
            if (message.sender.toString() !== req.user.id) return res.status(401).json({ msg: 'Unauthorized' });
            
            message.isDeletedForEveryone = true;
            message.text = ""; // Clear data for privacy
            message.mediaUrl = null;
            await message.save();
        } else {
            // Delete for me
            if (!message.deletedBy.includes(req.user.id)) {
                message.deletedBy.push(req.user.id);
            }
            // If both users have deleted for themselves, remove from server permanently
            const conversation = await Conversation.findById(message.conversationId);
            if (message.deletedBy.length >= conversation.participants.length) {
                await message.deleteOne();
                return res.json({ msg: 'Purged from server' });
            }
            await message.save();
        }
        res.json({ msg: 'Action completed', isDeletedForEveryone: message.isDeletedForEveryone });
    } catch (err) { res.status(500).send('Server Error'); }
});

router.delete('/conversation/:id', auth, async (req, res) => {
    try {
        await Conversation.findByIdAndUpdate(req.params.id, { $addToSet: { hiddenBy: req.user.id } });
        await Message.updateMany({ conversationId: req.params.id }, { $addToSet: { deletedBy: req.user.id } });
        res.json({ msg: 'Conversation hidden' });
    } catch (err) { res.status(500).send('Server Error'); }
});

router.get('/unread-total', auth, async (req, res) => {
    try {
        const count = await Message.countDocuments({ recipientId: req.user.id, read: false, deletedBy: { $ne: req.user.id } });
        res.json({ total: count });
    } catch (err) { res.status(500).send('Server Error'); }
});

module.exports = router;