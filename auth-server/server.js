const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/api/messages', require('./routes/messages'));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/bits', require('./routes/bits'));
app.use('/api/search', require('./routes/search'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/users', require('./routes/users'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/lessons', require('./routes/lessons'));
app.use('/api/quizzes', require('./routes/quizzes'));

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_room', (room) => {
        socket.join(room);
    });

    socket.on('join_user_inbox', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined their private inbox room`);
    });

    socket.on('send_message', (data) => {
        socket.to(data.conversationId).emit('receive_message', data);
        if (data.recipientId) {
            socket.to(data.recipientId).emit('update_inbox', data);
            socket.to(data.recipientId).emit('refresh_badge');
        }
    });

    // NEW: Notify users when a message is deleted for everyone
    socket.on('delete_message_everyone', (data) => {
        // Broadcast to the room so both screens update the bubble to "Deleted"
        io.to(data.conversationId).emit('message_deleted_everyone', data.messageId);
    });

    socket.on('disconnect', () => console.log('User disconnected'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => console.log(`Server started on port ${PORT} (Socket Enabled)`));