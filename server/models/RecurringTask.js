const mongoose = require('mongoose');

const RecurringTaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
    required: true
  },
  dayOfWeek: {
    type: Number,
    min: 0,
    max: 6,
    default: 1  // Monday
  },
  dayOfMonth: {
    type: Number,
    min: 1,
    max: 31,
    default: 1
  },
  month: {
    type: Number,
    min: 0,
    max: 11,
    default: 0  // January
  },
  location: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastGenerated: {
    type: Date
  },
  nextGenerationDue: {
    type: Date
  },
  active: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('RecurringTask', RecurringTaskSchema);