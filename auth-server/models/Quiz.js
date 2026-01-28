const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuizSchema = new Schema({
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    module: { type: Schema.Types.ObjectId, ref: 'Module' }, // null for Final Course Quiz
    title: { type: String, required: true },
    creationMode: { type: String, enum: ['manual', 'ai'], default: 'manual' },
    isPublished: { type: Boolean, default: false },
    questions: [{
        questionText: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctAnswerIndex: { type: Number, required: true },
        explanation: { type: String }
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', QuizSchema);