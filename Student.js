const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  rollNumber: { type: Number, required: true, unique: true },
  email: { type: String, required: true, unique: true, trim: true },
  department: { type: String, required: true, trim: true },
  gpa: { type: Number, min: 0, max: 4 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);
