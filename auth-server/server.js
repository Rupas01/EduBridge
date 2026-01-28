const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', require('./routes/profile'));
app.use('/api/search', require('./routes/search'));
app.use('/api/users', require('./routes/users'))
app.use('/api/courses', require('./routes/courses'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/lessons', require('./routes/lessons'));
app.use('/api/bits', require('./routes/bits'));
app.use('/api/quizzes', require('./routes/quizzes'))

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));