const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProgressSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    // Tracks IDs of lessons finished
    completedLessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }], 
    // Tracks quiz results
    completedQuizzes: [{ 
        quiz: { type: Schema.Types.ObjectId, ref: 'Quiz' },
        score: Number,
        passed: Boolean,
        attemptedAt: { type: Date, default: Date.now }
    }],
    lastAccessed: { type: Date, default: Date.now }
});

// Ensure a user has only one progress doc per course
ProgressSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Progress', ProgressSchema);