const mongoose = require('mongoose');

const TimeEntrySchema = new mongoose.Schema({
  workOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkOrder',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  endTime: {
    type: Date,
    default: null
  },
  pausedIntervals: [{
    startPause: {
      type: Date,
      required: true
    },
    endPause: {
      type: Date,
      default: null
    }
  }],
  totalMinutes: {
    type: Number,
    default: 0
  },
  notes: {
    type: String
  }
});

// Calculate total minutes when stopped
TimeEntrySchema.pre('save', function(next) {
  if (this.endTime && this.startTime) {
    let totalMs = this.endTime - this.startTime;
    
    // Subtract paused time
    if (this.pausedIntervals && this.pausedIntervals.length > 0) {
      const pausedMs = this.pausedIntervals.reduce((total, interval) => {
        if (interval.endPause) {
          return total + (interval.endPause - interval.startPause);
        }
        return total;
      }, 0);
      
      totalMs -= pausedMs;
    }
    
    // Convert to minutes
    this.totalMinutes = Math.round(totalMs / (1000 * 60));
  }
  next();
});

module.exports = mongoose.model('TimeEntry', TimeEntrySchema);