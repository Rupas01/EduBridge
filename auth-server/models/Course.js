const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
    mentor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    thumbnailUrl: { type: String },
    category: { type: String, required: true },
    curriculum: [{
        type: { type: String, enum: ['module', 'quiz'], required: true },
        item: { type: Schema.Types.ObjectId, refPath: 'curriculum.typeModel' },
        typeModel: { type: String, enum: ['Module', 'Quiz'], required: true }
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Course', CourseSchema);