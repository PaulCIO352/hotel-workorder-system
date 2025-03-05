const PartsRequest = require('../models/PartsRequest');
const WorkOrder = require('../models/WorkOrder');
const mongoose = require('mongoose');
const emailService = require('../config/email');
const emailTemplates = require('../utils/emailTemplates');

// Get all parts requests
exports.getAllPartsRequests = async (req, res) => {
  try {
    // Get query parameters for filtering
    const { status, workOrderId, search } = req.query;
    
    // Build filter object
    let filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (workOrderId) {
      filter.workOrderId = workOrderId;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }
    
    const partsRequests = await PartsRequest.find(filter)
      .populate('workOrderId', 'title location')
      .populate('requestedBy', 'name username')
      .populate('approvedBy', 'name username')
      .sort({ created: -1 });
    
    res.json(partsRequests);
  } catch (err) {
    console.error('Error getting parts requests:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get parts requests for a specific work order
exports.getWorkOrderPartsRequests = async (req, res) => {
  try {
    const { workOrderId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(workOrderId)) {
      return res.status(400).json({ message: 'Invalid work order ID' });
    }
    
    const partsRequests = await PartsRequest.find({ workOrderId })
      .populate('requestedBy', 'name username')
      .populate('approvedBy', 'name username')
      .sort({ created: -1 });
    
    res.json(partsRequests);
  } catch (err) {
    console.error('Error getting work order parts requests:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create a new parts request
exports.createPartsRequest = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      quantity, 
      estimatedCost, 
      workOrderId, 
      requestedBy,
      notes 
    } = req.body;
    
    // Validate required fields
    if (!name || !workOrderId || !requestedBy) {
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
    
    // Create new parts request
    const newPartsRequest = new PartsRequest({
      name,
      description: description || '',
      quantity: quantity || 1,
      estimatedCost: estimatedCost || 0,
      workOrderId,
      requestedBy,
      status: 'requested',
      notes: notes || ''
    });
    
    const partsRequest = await newPartsRequest.save();
    
    // Populate fields before returning
    const populatedRequest = await PartsRequest.findById(partsRequest._id)
      .populate('workOrderId', 'title location')
      .populate('requestedBy', 'name username');
    
    // Send email notification to managers
    try {
      // Get manager email addresses
      const managers = await require('../models/User').find({ role: 'manager' });
      const managerEmails = managers.map(manager => manager.email).filter(Boolean);
      
      if (managerEmails.length > 0) {
        const requestedBy = await require('../models/User').findById(requestedBy);
        const emailContent = emailTemplates.partsRequestCreated({
          partName: name,
          quantity,
          workOrderTitle: workOrder.title,
          location: workOrder.location,
          requestedBy: requestedBy ? requestedBy.name : 'Unknown',
          estimatedCost: estimatedCost || 0
        });
        
        await emailService.sendEmail(
          managerEmails, 
          `New Parts Request: ${name}`, 
          emailContent
        );
      }
    } catch (emailErr) {
      console.error('Error sending email notification:', emailErr);
      // Continue with response even if email fails
    }
    
    res.status(201).json(populatedRequest);
  } catch (err) {
    console.error('Error creating parts request:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update a parts request
exports.updatePartsRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid parts request ID' });
    }
    
    // Find parts request
    const partsRequest = await PartsRequest.findById(id);
    if (!partsRequest) {
      return res.status(404).json({ message: 'Parts request not found' });
    }
    
    // Check for status change from requested to approved
    const statusChanged = updateData.status && 
                         updateData.status !== partsRequest.status &&
                         updateData.status === 'approved';
    
    // Update parts request with new data
    Object.keys(updateData).forEach(key => {
      partsRequest[key] = updateData[key];
    });
    
    // Update the 'updated' timestamp
    partsRequest.updated = Date.now();
    
    const updatedRequest = await partsRequest.save();
    
    // Populate fields before returning
    const populatedRequest = await PartsRequest.findById(updatedRequest._id)
      .populate('workOrderId', 'title location')
      .populate('requestedBy', 'name username')
      .populate('approvedBy', 'name username');
    
    // Send email notification for status change
    if (statusChanged && updateData.approvedBy) {
      try {
        // Get requester email
        const requester = await require('../models/User').findById(partsRequest.requestedBy);
        
        if (requester && requester.email) {
          const approver = await require('../models/User').findById(updateData.approvedBy);
          const workOrder = await WorkOrder.findById(partsRequest.workOrderId);
          
          const emailContent = emailTemplates.partsRequestApproved({
            partName: partsRequest.name,
            quantity: partsRequest.quantity,
            workOrderTitle: workOrder ? workOrder.title : 'Unknown',
            approvedBy: approver ? approver.name : 'Unknown'
          });
          
          await emailService.sendEmail(
            requester.email, 
            `Parts Request Approved: ${partsRequest.name}`, 
            emailContent
          );
        }
      } catch (emailErr) {
        console.error('Error sending email notification:', emailErr);
        // Continue with response even if email fails
      }
    }
    
    res.json(populatedRequest);
  } catch (err) {
    console.error('Error updating parts request:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete a parts request
exports.deletePartsRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid parts request ID' });
    }
    
    const partsRequest = await PartsRequest.findById(id);
    if (!partsRequest) {
      return res.status(404).json({ message: 'Parts request not found' });
    }
    
    await partsRequest.remove();
    
    res.json({ message: 'Parts request deleted successfully' });
  } catch (err) {
    console.error('Error deleting parts request:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};