import React, { useState, useEffect } from 'react';
import { 
  Box, TextField, Button, Grid, Typography, 
  FormControl, InputLabel, Select, MenuItem,
  CircularProgress, Alert, Paper, Divider
} from '@mui/material';
import { 
  Inventory as InventoryIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

const PartRequestForm = ({ 
  onAddPartRequest,
  onUpdatePartRequest,
  workOrders = [],
  editRequestId = null,
  initialPartRequest = null
}) => {
  // Initial state for form
  const initialState = {
    name: '',
    description: '',
    quantity: 1,
    estimatedCost: 0,
    workOrderId: '',
    notes: ''
  };
  
  // Form state
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Mock user ID - in a real app, you would get this from authentication
  const userId = '12345';
  
  // If editing, load the initial data
  useEffect(() => {
    if (editRequestId && initialPartRequest) {
      setFormData({
        name: initialPartRequest.name || '',
        description: initialPartRequest.description || '',
        quantity: initialPartRequest.quantity || 1,
        estimatedCost: initialPartRequest.estimatedCost || 0,
        workOrderId: initialPartRequest.workOrderId || '',
        notes: initialPartRequest.notes || ''
      });
    } else {
      // Reset form if not editing
      setFormData(initialState);
    }
  }, [editRequestId, initialPartRequest]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Convert numeric fields to numbers
    if (name === 'quantity' || name === 'estimatedCost') {
      setFormData({
        ...formData,
        [name]: value === '' ? '' : Number(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim()) {
      setError('Part name is required');
      return;
    }
    
    if (!formData.workOrderId) {
      setError('Please select a work order');
      return;
    }
    
    if (formData.quantity < 1) {
      setError('Quantity must be at least 1');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      // Prepare data for submission
      const partRequestData = {
        ...formData,
        requestedBy: userId,
        status: 'requested'
      };
      
      // Call appropriate handler based on whether we're editing or creating
      if (editRequestId) {
        await onUpdatePartRequest({
          _id: editRequestId,
          ...partRequestData
        });
        setSuccess(true);
      } else {
        await onAddPartRequest(partRequestData);
        // Reset form on successful creation
        setFormData(initialState);
        setSuccess(true);
      }
    } catch (err) {
      console.error('Error saving part request:', err);
      setError('Failed to save part request. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Paper elevation={0} sx={{ p: 0 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <InventoryIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6">
          {editRequestId ? 'Edit Part Request' : 'Create New Part Request'}
        </Typography>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Part request {editRequestId ? 'updated' : 'created'} successfully!
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              id="name"
              name="name"
              label="Part Name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel id="work-order-label">Work Order</InputLabel>
              <Select
                labelId="work-order-label"
                id="workOrderId"
                name="workOrderId"
                value={formData.workOrderId}
                onChange={handleChange}
                label="Work Order"
                disabled={loading || (editRequestId && initialPartRequest)}
              >
                <MenuItem value="">
                  <em>Select a work order</em>
                </MenuItem>
                {workOrders.map((wo) => (
                  <MenuItem key={wo._id} value={wo._id}>
                    {wo.title} ({wo.location})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="quantity"
              name="quantity"
              label="Quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              disabled={loading}
              InputProps={{ inputProps: { min: 1 } }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="estimatedCost"
              name="estimatedCost"
              label="Estimated Cost ($)"
              type="number"
              value={formData.estimatedCost}
              onChange={handleChange}
              disabled={loading}
              InputProps={{ inputProps: { min: 0, step: "0.01" } }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="description"
              name="description"
              label="Description"
              multiline
              rows={2}
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="notes"
              name="notes"
              label="Additional Notes"
              multiline
              rows={2}
              value={formData.notes}
              onChange={handleChange}
              disabled={loading}
              placeholder="Any special requirements or considerations"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" mt={2} gap={2}>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<CancelIcon />}
                disabled={loading}
                onClick={() => setFormData(initialState)}
              >
                Reset
              </Button>
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={loading ? <CircularProgress size={24} /> : <SaveIcon />}
                disabled={loading}
              >
                {loading ? 'Saving...' : editRequestId ? 'Update Request' : 'Submit Request'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default PartRequestForm;