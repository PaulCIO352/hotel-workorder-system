import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, IconButton,
  Grid, CircularProgress, Alert, Switch, Tooltip,
  Collapse, Card, CardContent
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  KeyboardArrowDown as ExpandMoreIcon,
  KeyboardArrowUp as ExpandLessIcon,
  AccessTime as AccessTimeIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

// API
import { recurringAPI, userAPI } from '../utils/api';

// Components
import RecurringTaskForm from '../components/recurring/RecurringTaskForm';

const RecurringTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [editTaskId, setEditTaskId] = useState(null);
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch recurring tasks
        const tasksRes = await recurringAPI.getAll();
        setTasks(tasksRes.data);
        
        // Fetch users for reference
        const usersRes = await userAPI.getAll();
        setUsers(usersRes.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch data', err);
        setError('Failed to load recurring tasks');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleToggleExpand = (taskId) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };
  
  const handleToggleActive = async (taskId, currentActive) => {
    try {
      const task = tasks.find(t => t._id === taskId);
      if (!task) return;
      
      const updatedTask = await recurringAPI.update(taskId, {
        ...task,
        active: !currentActive
      });
      
      setTasks(tasks.map(task => 
        task._id === taskId ? updatedTask.data : task
      ));
    } catch (err) {
      console.error('Failed to update task status', err);
      alert('Failed to update task status');
    }
  };
  
  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this recurring task?')) {
      try {
        await recurringAPI.delete(taskId);
        setTasks(tasks.filter(task => task._id !== taskId));
      } catch (err) {
        console.error('Failed to delete recurring task', err);
        alert('Failed to delete recurring task');
      }
    }
  };
  
  const handleTaskAdded = (newTask) => {
    setTasks([newTask, ...tasks]);
  };
  
  const handleEditTask = (taskId) => {
    setEditTaskId(taskId);
  };
  
  const handleTaskUpdated = (updatedTask) => {
    setTasks(tasks.map(task => 
      task._id === updatedTask._id ? updatedTask : task
    ));
    setEditTaskId(null);
  };
  
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'low': return 'success';
      case 'medium': return 'info';
      case 'high': return 'warning';
      case 'urgent': return 'error';
      default: return 'default';
    }
  };
  
  const getFrequencyText = (task) => {
    switch(task.frequency) {
      case 'daily':
        return 'Every day';
      case 'weekly':
        return `Every ${getDayOfWeekName(task.dayOfWeek)}`;
      case 'monthly':
        return `Day ${task.dayOfMonth} of each month`;
      case 'quarterly':
        return 'Every 3 months';
      case 'yearly':
        return `${getMonthName(task.month)} ${task.dayOfMonth}`;
      default:
        return task.frequency;
    }
  };
  
  const getDayOfWeekName = (dayOfWeek) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };
  
  const getMonthName = (month) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month];
  };
  
  // Function to find user name by ID
  const getUserName = (userId) => {
    const user = users.find(u => u._id === userId);
    return user ? user.name : 'Unassigned';
  };
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Recurring Tasks
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setEditTaskId('new')}
        >
          New Recurring Task
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {editTaskId && (
            <Box mb={4}>
              <RecurringTaskForm 
                onTaskAdded={handleTaskAdded}
                onTaskUpdated={handleTaskUpdated}
                editTask={editTaskId === 'new' ? null : tasks.find(t => t._id === editTaskId)}
                onCancel={() => setEditTaskId(null)}
              />
            </Box>
          )}
          
          {tasks.length === 0 ? (
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No recurring tasks found
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Create your first recurring task to get started
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setEditTaskId('new')}
              >
                Create Recurring Task
              </Button>
            </Paper>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width="30px"></TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Frequency</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Assigned To</TableCell>
                    <TableCell>Next Due</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tasks.map((task) => (
                    <React.Fragment key={task._id}>
                      <TableRow>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleExpand(task._id)}
                          >
                            {expandedTaskId === task._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </TableCell>
                        <TableCell>{task.title}</TableCell>
                        <TableCell>{task.location}</TableCell>
                        <TableCell>
                          <Tooltip title={getFrequencyText(task)}>
                            <Chip 
                              icon={<ScheduleIcon />}
                              label={task.frequency.toUpperCase()} 
                              size="small"
                              variant="outlined"
                            />
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={task.priority.toUpperCase()} 
                            color={getPriorityColor(task.priority)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{getUserName(task.assignedTo)}</TableCell>
                        <TableCell>
                          {task.nextGenerationDue && (
                            format(new Date(task.nextGenerationDue), 'MMM d, yyyy')
                          )}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={task.active}
                            onChange={() => handleToggleActive(task._id, task.active)}
                            color="primary"
                            size="small"
                          />
                          <Typography variant="body2" component="span" ml={1}>
                            {task.active ? 'Active' : 'Inactive'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton 
                            color="primary" 
                            onClick={() => handleEditTask(task._id)}
                            size="small"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            color="error"
                            onClick={() => handleDeleteTask(task._id)}
                            size="small"
                            sx={{ ml: 1 }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={9} sx={{ p: 0, borderBottom: 'none' }}>
                          <Collapse in={expandedTaskId === task._id} timeout="auto" unmountOnExit>
                            <Box p={3} bgcolor="action.hover">
                              <Grid container spacing={3}>
                                <Grid item xs={12} md={8}>
                                  <Typography variant="h6" gutterBottom>
                                    Description
                                  </Typography>
                                  <Typography variant="body2" paragraph>
                                    {task.description}
                                  </Typography>
                                  
                                  <Typography variant="subtitle2" gutterBottom>
                                    Schedule Details
                                  </Typography>
                                  <Typography variant="body2">
                                    {getFrequencyText(task)}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                  <Card variant="outlined">
                                    <CardContent>
                                      <Typography variant="subtitle2" gutterBottom>
                                        <AccessTimeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Last Generated
                                      </Typography>
                                      <Typography variant="body2" paragraph>
                                        {task.lastGenerated 
                                          ? format(new Date(task.lastGenerated), 'PPpp')
                                          : 'Never'}
                                      </Typography>
                                      
                                      <Typography variant="subtitle2" gutterBottom>
                                        <EventIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Next Due
                                      </Typography>
                                      <Typography variant="body2">
                                        {task.nextGenerationDue 
                                          ? format(new Date(task.nextGenerationDue), 'PPpp')
                                          : 'Not scheduled'}
                                      </Typography>
                                    </CardContent>
                                  </Card>
                                </Grid>
                              </Grid>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
    </Box>
  );
};

export default RecurringTasks;