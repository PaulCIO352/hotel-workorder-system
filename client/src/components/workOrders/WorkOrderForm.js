import React, { useState, useEffect } from 'react';
import { 
  Box, TextField, Button, Grid, Typography, 
  FormControl, InputLabel, Select, MenuItem,
  CircularProgress, Alert, Paper, Divider,
  Switch, FormControlLabel, useTheme,
  FormHelperText
} from '@mui/material';
import { 
  Assignment as AssignmentIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';

// Import custom components
import ImageUpload from '../common/ImageUpload';

const WorkOrderForm = ({ 
  onSubmit, 
  initialValues = null, 
  isEdit = false,
  onCancel,
  users = [],
  locations = []
}) => {
  const theme = useTheme();
  
  // Default form values
  const defaultValues = {
    title: '',
    description: '',
    location: '',
    priority: 'medium',
    assignedTo: '',
    images: [],
    dueDate: null,
    isRecurring: false
  };
  
  // Form state
  const [formData, setFormData] = useState(initialValues || defaultValues);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Priority options for dropdown
  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];
  
  // Default locations if none provided
  const defaultLocations = [
    { value: 'lobby', label: 'Lobby' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'kitchen', label: 'Kitchen' },
    { value: 'pool', label: 'Pool Area' },
    { value: 'gym', label: 'Fitness Center' },
    { value: 'conference', label: 'Conference Room' },
    { value: 'common', label: 'Common Areas' }
  ];
  
  // Use provided locations or defaults
  const locationOptions = locations.length > 0 
    ? locations 
    : defaultLocations;
  
  // Room-specific locations
  const roomLocations = Array.from({ length: 50 }, (_, i) => ({
    value: `room-${i + 100}`,
    label: `Room ${i + 100}`
  }));
  
  // Concatenate room locations with general locations
  const allLocations = [...locationOptions, ...roomLocations];
  
  // Update form data when initialValues change
  useEffect(() => {
    if (initialValues) {
      setFormData({
        ...initialValues,
        // Ensure images array is properly formatted
        images: initialValues.images || []
      });
    }
  }, [initialValues]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    
    // For Switch components, use checked instead of value
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Clear validation error for the field when it's changed
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  // Handle date picker change
  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      dueDate: date
    }));
    
    // Clear validation error for due date
    if (errors.dueDate) {
      setErrors(prev => ({
        ...prev,
        dueDate: undefined
      }));
    }
  };
  
  // Handle image upload change
  const handleImagesChange = (newImages) => {
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.location) {
      newErrors.location = 'Location is required';
    }
    
    // Due date should be in the future if provided
    if (formData.dueDate && new Date(formData.dueDate) < new Date()) {
      newErrors.dueDate = 'Due date must be in the future';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await onSubmit(formData);
      setSuccess(isEdit ? 'Work order updated successfully' : 'Work order created successfully');
      
      // Reset form if not editing
      if (!isEdit) {
        setFormData(defaultValues);
      }
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Error saving work order:', err);
      setError(err.message || 'Failed to save work order. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <AssignmentIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6">
          {isEdit ? 'Edit Work Order' : 'Create New Work Order'}
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
          {success}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <TextField
              required
              fullWidth
              id="title"
              name="title"
              label="Work Order Title"
              placeholder="Brief description of the issue"
              value={formData.title}
              onChange={handleChange}
              error={Boolean(errors.title)}
              helperText={errors.title}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth error={Boolean(errors.location)}>
              <InputLabel id="location-label">Location</InputLabel>
              <Select
                labelId="location-label"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                label="Location"
                disabled={loading}
              >
                <MenuItem value="">
                  <em>Select a location</em>
                </MenuItem>
                
                {/* General locations */}
                <li>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', ml: 2, mt: 1 }}>
                    Common Areas
                  </Typography>
                </li>
                {locationOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
                
                {/* Room locations */}
                <li>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', ml: 2, mt: 1 }}>
                    Guest Rooms
                  </Typography>
                </li>
                {roomLocations.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.location && <FormHelperText>{errors.location}</FormHelperText>}
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="description"
              name="description"
              label="Description"
              placeholder="Detailed description of the issue"
              multiline
              rows={4}
              value={formData.description}
              onChange={handleChange}
              error={Boolean(errors.description)}
              helperText={errors.description}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="priority-label">Priority</InputLabel>
              <Select
                labelId="priority-label"
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                label="Priority"
                disabled={loading}
              >
                {priorityOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="assigned-to-label">Assign To</InputLabel>
              <Select
                labelId="assigned-to-label"
                id="assignedTo"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                label="Assign To"
                disabled={loading}
              >
                <MenuItem value="">
                  <em>Unassigned</em>
                </MenuItem>
                {users.map(user => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.name} ({user.department})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Due Date (Optional)"
                value={formData.dueDate}
                onChange={handleDateChange}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth
                    error={Boolean(errors.dueDate)}
                    helperText={errors.dueDate}
                    disabled={loading}
                  />
                )}
                minDate={new Date()}
                disabled={loading}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isRecurring}
                  onChange={handleChange}
                  name="isRecurring"
                  color="primary"
                  disabled={loading}
                />
              }
              label="This is a recurring task"
            />
            {formData.isRecurring && (
              <Typography variant="caption" color="textSecondary" display="block">
                Note: You'll need to set up the recurring schedule separately.
              </Typography>
            )}
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Add Photos (Optional)
            </Typography>
            <ImageUpload
              onChange={handleImagesChange}
              initialImages={formData.images}
              maxImages={5}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" mt={2} gap={2}>
              {onCancel && (
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={onCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
              )}
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={loading ? <CircularProgress size={24} /> : <SaveIcon />}
                disabled={loading}
              >
                {loading ? 'Saving...' : isEdit ? 'Update Work Order' : 'Create Work Order'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default WorkOrderForm;