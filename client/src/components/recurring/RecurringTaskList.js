import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, IconButton,
  Collapse, Switch, Tooltip, Menu, MenuItem, ListItemIcon,
  ListItemText, Divider, Alert, Button, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, useTheme,
  Grid, Card, CardContent
} from '@mui/material';
import { 
  Event as EventIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  PlayArrow as PlayArrowIcon,
  Build as BuildIcon,
  AccessTime as AccessTimeIcon,
  Schedule as ScheduleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon,
  Room as LocationIcon,
  PriorityHigh as PriorityIcon
} from '@mui/icons-material';
import { format, isPast } from 'date-fns';

const RecurringTaskList = ({ 
  tasks = [], 
  onToggleActive,
  onDeleteTask,
  onEditTask,
  onRunNow
}) => {
  const theme = useTheme();
  const [expandedId, setExpandedId] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [alertInfo, setAlertInfo] = useState({ show: false, severity: 'success', message: '' });
  
  // Toggle expanded row
  const handleToggleExpand = (taskId) => {
    setExpandedId(expandedId === taskId ? null : taskId);
  };
  
  // Open context menu
  const handleMenuOpen = (event, taskId) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedTaskId(taskId);
  };
  
  // Close context menu
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  // Handle toggle active state
  const handleToggleActive = async (taskId, currentActive) => {
    try {
      await onToggleActive(taskId, !currentActive);
      setAlertInfo({
        show: true,
        severity: 'success',
        message: `Task ${!currentActive ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      setAlertInfo({
        show: true,
        severity: 'error',
        message: `Error: ${error.message || 'Failed to update task status'}`
      });
    }
    
    // Auto hide alert after 5 seconds
    setTimeout(() => {
      setAlertInfo(prev => ({ ...prev, show: false }));
    }, 5000);
  };
  
  // Handle edit action
  const handleEditTask = () => {
    handleMenuClose();
    if (onEditTask) {
      onEditTask(selectedTaskId);
    }
  };
  
  // Open delete confirmation dialog
  const handleDeleteConfirm = () => {
    handleMenuClose();
    setConfirmAction('delete');
    setConfirmDialogOpen(true);
  };
  
  // Open run now confirmation dialog
  const handleRunNowConfirm = () => {
    handleMenuClose();
    setConfirmAction('runNow');
    setConfirmDialogOpen(true);
  };
  
  // Close confirmation dialog
  const handleConfirmDialogClose = () => {
    setConfirmDialogOpen(false);
    setConfirmAction(null);
  };
  
  // Execute confirmed action
  const handleConfirmAction = async () => {
    if (!confirmAction || !selectedTaskId) return;
    
    try {
      if (confirmAction === 'delete') {
        await onDeleteTask(selectedTaskId);
        setAlertInfo({
          show: true,
          severity: 'success',
          message: 'Recurring task deleted successfully'
        });
      } else if (confirmAction === 'runNow') {
        await onRunNow(selectedTaskId);
        setAlertInfo({
          show: true,
          severity: 'success',
          message: 'Task work order created successfully'
        });
      }
    } catch (error) {
      setAlertInfo({
        show: true,
        severity: 'error',
        message: `Error: ${error.message || 'Something went wrong'}`
      });
    } finally {
      handleConfirmDialogClose();
      
      // Auto hide alert after 5 seconds
      setTimeout(() => {
        setAlertInfo(prev => ({ ...prev, show: false }));
      }, 5000);
    }
  };
  
  // Helper to get user-friendly frequency text
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
  
  // Helper to get day name
  const getDayOfWeekName = (dayOfWeek) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };
  
  // Helper to get month name
  const getMonthName = (month) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month];
  };
  
  // Priority color & label mapping
  const priorityConfig = {
    low: { color: 'success', label: 'Low' },
    medium: { color: 'info', label: 'Medium' },
    high: { color: 'warning', label: 'High' },
    urgent: { color: 'error', label: 'Urgent' }
  };
  
  // If no tasks available
  if (tasks.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <EventIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">
            Recurring Tasks
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Typography variant="body1" align="center" color="textSecondary" sx={{ my: 4 }}>
          No recurring tasks found. Create your first recurring task to automate maintenance workflows.
        </Typography>
      </Paper>
    );
  }
  
  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center">
          <EventIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">
            Recurring Tasks
          </Typography>
        </Box>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      {/* Alert for actions */}
      <Collapse in={alertInfo.show}>
        <Alert 
          severity={alertInfo.severity} 
          sx={{ mb: 2 }}
          onClose={() => setAlertInfo(prev => ({ ...prev, show: false }))}
        >
          {alertInfo.message}
        </Alert>
      </Collapse>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="30px"></TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Frequency</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Next Due</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task) => (
              <React.Fragment key={task._id}>
                <TableRow hover>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      onClick={() => handleToggleExpand(task._id)}
                    >
                      {expandedId === task._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
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
                      label={priorityConfig[task.priority]?.label || task.priority} 
                      color={priorityConfig[task.priority]?.color || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {task.nextGenerationDue ? (
                      <Typography 
                        variant="body2" 
                        color={isPast(new Date(task.nextGenerationDue)) ? 'error' : 'textPrimary'}
                      >
                        {format(new Date(task.nextGenerationDue), 'MMM d, yyyy')}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Not scheduled
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Switch
                      checked={task.active}
                      onChange={() => handleToggleActive(task._id, task.active)}
                      color="primary"
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      aria-label="more actions"
                      onClick={(e) => handleMenuOpen(e, task._id)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
                
                {/* Expanded details row */}
                <TableRow>
                  <TableCell 
                    colSpan={8} 
                    sx={{ 
                      p: 0, 
                      borderBottom: expandedId === task._id ? `1px solid ${theme.palette.divider}` : 'none'
                    }}
                  >
                    <Collapse in={expandedId === task._id} timeout="auto" unmountOnExit>
                      <Box p={3} bgcolor={theme.palette.action.hover}>
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={8}>
                            <Typography variant="subtitle2" gutterBottom>
                              Description
                            </Typography>
                            <Typography variant="body2" paragraph>
                              {task.description || 'No description provided'}
                            </Typography>
                            
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                              <Grid item xs={12} sm={6}>
                                <Box display="flex" alignItems="center" mb={1}>
                                  <LocationIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                                  <Typography variant="subtitle2">
                                    Location: {task.location}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Box display="flex" alignItems="center" mb={1}>
                                  <PriorityIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                                  <Typography variant="subtitle2">
                                    Priority: {priorityConfig[task.priority]?.label || task.priority}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={12}>
                                <Box display="flex" alignItems="center">
                                  <ScheduleIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                                  <Typography variant="subtitle2">
                                    Schedule: {getFrequencyText(task)}
                                  </Typography>
                                </Box>
                              </Grid>
                            </Grid>
                          </Grid>
                          
                          <Grid item xs={12} md={4}>
                            <Card variant="outlined">
                              <CardContent>
                                <Typography variant="subtitle2" gutterBottom>
                                  <AccessTimeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                  Task History
                                </Typography>
                                
                                <Box mt={1}>
                                  <Typography variant="body2">
                                    <strong>Last Generated:</strong> {task.lastGenerated 
                                      ? format(new Date(task.lastGenerated), 'MMM d, yyyy')
                                      : 'Never'}
                                  </Typography>
                                  <Typography variant="body2">
                                    <strong>Next Due:</strong> {task.nextGenerationDue 
                                      ? format(new Date(task.nextGenerationDue), 'MMM d, yyyy')
                                      : 'Not scheduled'}
                                  </Typography>
                                </Box>
                                
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<RefreshIcon />}
                                  onClick={() => handleRunNowConfirm()}
                                  sx={{ mt: 2 }}
                                  disabled={!task.active}
                                >
                                  Run Task Now
                                </Button>
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
      
      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditTask}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Task</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleRunNowConfirm}>
          <ListItemIcon>
            <PlayArrowIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Run Task Now</ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleDeleteConfirm}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: theme.palette.error.main }}>
            Delete Task
          </ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleConfirmDialogClose}
      >
        <DialogTitle>
          {confirmAction === 'delete' 
            ? 'Delete Recurring Task' 
            : 'Run Task Now'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmAction === 'delete'
              ? 'Are you sure you want to delete this recurring task? This will remove all future scheduled occurrences.'
              : 'Are you sure you want to run this task now? This will create a new work order immediately, regardless of the schedule.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmDialogClose} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmAction} 
            color={confirmAction === 'delete' ? 'error' : 'primary'} 
            autoFocus
            startIcon={confirmAction === 'delete' ? <DeleteIcon /> : <BuildIcon />}
          >
            {confirmAction === 'delete' ? 'Delete' : 'Create Work Order'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default RecurringTaskList;