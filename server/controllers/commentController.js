const Comment = require('../models/Comment');
const WorkOrder = require('../models/WorkOrder');
const mongoose = require('mongoose');

// Get all comments
exports.getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate('userId', 'name username')
      .sort({ created: -1 });
    
    res.json(comments);
  } catch (err) {
    console.error('Error getting comments:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get comments for a specific work order
exports.getWorkOrderComments = async (req, res) => {
  try {
    const { workOrderId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(workOrderId)) {
      return res.status(400).json({ message: 'Invalid work order ID' });
    }
    
    const comments = await Comment.find({ workOrderId })
      .populate('userId', 'name username')
      .sort({ created: -1 });
    
    res.json(comments);
  } catch (err) {
    console.error('Error getting work order comments:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create a new comment
exports.createComment = async (req, res) => {
  try {
    const { text, workOrderId, userId } = req.body;
    
    // Validate required fields
    if (!text || !workOrderId || !userId) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // Check if work order exists
    if (!mongoose.Types.ObjectId.isValid(workOrderId)) {
      return res.status(400).json({ message: 'Invalid work order ID' });
    }
    
    const workOrder = await WorkOrder.findById(workOrderId);
    if (!workOrder) {
      return res.status(404).json({ message: 'Work order not found' });
    }
    
    // Create new comment
    let attachments = [];
    
    // Handle file attachments if present
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => `/uploads/${file.filename}`);
    }
    
    const newComment = new Comment({
      text,
      workOrderId,
      userId,
      attachments
    });
    
    const comment = await newComment.save();
    
    // Populate user info before returning
    const populatedComment = await Comment.findById(comment._id)
      .populate('userId', 'name username');
    
    res.status(201).json(populatedComment);
  } catch (err) {
    console.error('Error creating comment:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update a comment
exports.updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid comment ID' });
    }
    
    // Find comment
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Update comment text
    comment.text = text;
    
    // Handle attachments if present
    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map(file => `/uploads/${file.filename}`);
      comment.attachments = [...comment.attachments, ...newAttachments];
    }
    
    const updatedComment = await comment.save();
    
    // Populate user info before returning
    const populatedComment = await Comment.findById(updatedComment._id)
      .populate('userId', 'name username');
    
    res.json(populatedComment);
  } catch (err) {
    console.error('Error updating comment:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid comment ID' });
    }
    
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    await comment.remove();
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};