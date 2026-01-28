const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LessonSchema = new Schema({
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    // FIX: Removed required: true to prevent Article save crashes
    description: { type: String }, 
    contentType: { type: String, enum: ['video', 'blog', 'quiz'], required: true },
    content: { type: String },
    videoUrl: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lesson', LessonSchema);