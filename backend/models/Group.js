const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  description: { 
    type: String, 
    trim: true,
    maxlength: 500,
    default: ''
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  members: [{ 
    type: String,
    required: true,
    trim: true
  }]
}, { 
  timestamps: true 
});

// Index for better query performance
groupSchema.index({ createdBy: 1, createdAt: -1 });

module.exports = mongoose.model('Group', groupSchema);