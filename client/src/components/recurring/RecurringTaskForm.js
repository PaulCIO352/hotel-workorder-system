import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, TextField, Button, 
  Select, MenuItem, FormControl, InputLabel,
  FormHelperText, Grid, Chip, Alert
} from '@mui/material';
import { 
  CalendarMonth as CalendarIcon,
  Repeat as RepeatIcon,
  Save as SaveIcon
} from '@mui/icons-material';

// API
import { userAPI, recurringAPI } from '../../utils/api';

const RecurringTaskForm = ({ onTaskAdded, editTask = null }) => {
  const initialState = {
    title: '',
    description: '',
    frequency: 'weekly',
    dayOfWeek: 1, // Monday
    dayOfMonth: 1,
    month: 0, // January
    location: '',
    priority: 'medium',
    assignedTo: '',
    active: true
  };
  
  const [formData, setFormData] = useState(initialState);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Fetch users for assignment dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await userAPI.getAll();
        setUsers(res.data);
      } catch (err) {
        console.error('Failed to fetch users', err);
      }
    };
    
    fetchUsers();
  }, []);
  
  // If editing an existing task, populate the form
  useEffect(() => {
    if (editTask) {
      setFormData({
        title: editTask.title,
        description: editTask.description,
        frequency: editTask.frequency,
        dayOfWeek: editTask.dayOfWeek || 1,
        dayOfMonth: editTask.dayOfMonth || 1,
        month: editTask.month || 0,
        location: editTask.location,
        priority: editTask.priority,
        assignedTo: editTask.assignedTo?._id || editTask.assignedTo || '',
        active: editTask.active
      });
    }
  }, [editTask]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      let response;
      
      if (editTask) {
        // Update existing task
        response = await recurringAPI.update(editTask._id, formData);
      } else {
        // Create new task
        response = await recurringAPI.create(formData);
      }
      
      setSuccess(true);
      setFormData(initialState);
      
      if (onTaskAdded) {
        onTaskAdded(response.data);
      }
    } catch (err) {
      console.error('Failed to save recurring task', err);
      setError('Failed to save recurring task. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Helper to show the appropriate time selection fields based on frequency
  const renderFrequencyFields = () => {
    switch(formData.frequency) {
      case 'weekly':
        return (
          <FormControl fullWidth margin="normal">
            <InputLabel id="day-of-week-label">Day of Week</InputLabel>
            <Select
              labelId="day-of-week-label"
              id="dayOfWeek"
              name="dayOfWeek"
              value={formData.dayOfWeek}
              onChange={handleChange}
              label="Day of Week"
            >
              <MenuItem value={0}>Sunday</MenuItem>
              <MenuItem value={1}>Monday</MenuItem>
              <MenuItem value={2}>Tuesday</MenuItem>
              <MenuItem value={3}>Wednesday</MenuItem>
              <MenuItem value={4}>Thursday</MenuItem>
              <MenuItem value={5}>Friday</MenuItem>
              <MenuItem value={6}>Saturday</MenuItem>
            </Select>
          </FormControl>
        );
      case 'monthly':
        return (
          <FormControl fullWidth margin="normal">
            <InputLabel id="day-of-month-label">Day of Month</InputLabel>
            <Select
              labelId="day-of-month-label"
              id="dayOfMonth"
              name="dayOfMonth"
              value={formData.dayOfMonth}
              onChange={handleChange}
              label="Day of Month"
            >
              {[...Array(31)].map((_, i) => (
                <MenuItem key={i} value={i + 1}>{i + 1}</MenuItem>
              ))}
            </Select>
            <FormHelperText>
              If the month doesn't have this day, the task will be scheduled for the last day of the month.
            </FormHelperText>
          </FormControl>
        );
      case 'yearly':
        return (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel id="month-label">Month</InputLabel>
              <Select
                labelId="month-label"
                id="month"
                name="month"
                value={formData.month}
                onChange={handleChange}
                label="Month"
              >
                <MenuItem value={0}>January</MenuItem>
                <MenuItem value={1}>February</MenuItem>
                <MenuItem value={2}>March</MenuItem>
                <MenuItem value={3}>April</MenuItem>
                <MenuItem value={4}>May</MenuItem>
                <MenuItem value={5}>June</MenuItem>
                <MenuItem value={6}>July</MenuItem>
                <MenuItem value={7}>August</MenuItem>
                <MenuItem value={8}>September</MenuItem>
                <MenuItem value={9}>October</MenuItem>
                <MenuItem value={10}>November</MenuItem>
                <MenuItem value={11}>December</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="yearly-day-of-month-label">Day of Month</InputLabel>
              <Select
                labelId="yearly-day-of-month-label"
                id="dayOfMonth"
                name="dayOfMonth"
                value={formData.dayOfMonth}
                onChange={handleChange}
                label="Day of Month"
              >
                {[...Array(31)].map((_, i) => (
                  <MenuItem key={i} value={i + 1}>{i + 1}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        );
      default:
        return null;
    }
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <RepeatIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6">
          {editTask ? 'Edit Recurring Task' : 'Create New Recurring Task'}
        </Typography>
      </Box>
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Task {editTask ? 'updated' : 'created'} successfully!
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              id="title"
              name="title"
              label="Task Title"
              value={formData.title}
              onChange={handleChange}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              id="location"
              name="location"
              label="Location"
              value={formData.location}
              onChange={handleChange}
              margin="normal"
              placeholder="Room number, area, etc."
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="description"
              name="description"
              label="Task Description"
              value={formData.description}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={3}
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="frequency-label">Frequency</InputLabel>
              <Select
                labelId="frequency-label"
                id="frequency"
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                label="Frequency"
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="priority-label">Priority</InputLabel>
              <Select
                labelId="priority-label"
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                label="Priority"
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="assigned-to-label">Assign To</InputLabel>
              <Select
                labelId="assigned-to-label"
                id="assignedTo"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                label="Assign To"
              >
                <MenuItem value="">Unassigned</MenuItem>
                {users.map(user => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.name} ({user.department})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            {renderFrequencyFields()}
          </Grid>
          
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" mt={2}>
              <Chip 
                label={formData.active ? "Active" : "Inactive"} 
                color={formData.active ? "success" : "default"}
                sx={{ mr: 2 }}
              />
              <Button
                variant="outlined"
                onClick={() => setFormData(prev => ({ ...prev, active: !prev.active }))}
              >
                Toggle {formData.active ? "Inactive" : "Active"}
              </Button>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                disabled={loading}
              >
                {loading ? 'Saving...' : editTask ? 'Update Task' : 'Create Task'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default RecurringTaskForm;