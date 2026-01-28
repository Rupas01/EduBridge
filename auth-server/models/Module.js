const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ModuleSchema = new Schema({
    title: { type: String, required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course' },
    lessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }]
});

module.exports = mongoose.model('Module', ModuleSchema);