const mongoose = require('mongoose');

const PartsRequestSchema = new mongoose.Schema({
  workOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkOrder',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  estimatedCost: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['requested', 'approved', 'ordered', 'received', 'cancelled'],
    default: 'requested'
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String
  }
});

// Update the 'updated' field on save
PartsRequestSchema.pre('save', function(next) {
  this.updated = Date.now();
  next();
});

module.exports = mongoose.model('PartsRequest', PartsRequestSchema);