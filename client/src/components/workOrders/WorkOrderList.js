import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, IconButton,
  Menu, MenuItem, ListItemIcon, ListItemText, Divider,
  Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, Button, CircularProgress, Alert,
  Tooltip, Avatar, AvatarGroup, useTheme,
  Card, CardContent, CardMedia, CardActionArea, Grid
} from '@mui/material';
import { 
  Assignment as AssignmentIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon,
  CheckCircle as CompleteIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Image as ImageIcon,
  Comment as CommentIcon,
  LocationOn as LocationIcon,
  Event as CalendarIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { format, isPast, isToday, differenceInDays } from 'date-fns';

// Import custom components
import PriorityBadge from '../common/PriorityBadge';

const WorkOrderList = ({ 
  workOrders = [], 
  onEdit,
  onDelete,
  onUpdateStatus,
  loading = false,
  error = null,
  viewType = 'table' // 'table' or 'grid'
}) => {
  const theme = useTheme();
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  
  // Open the actions menu
  const handleMenuOpen = (event, workOrderId) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedWorkOrderId(workOrderId);
  };
  
  // Close the actions menu
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  // Get the current selected work order
  const getSelectedWorkOrder = () => {
    return workOrders.find(wo => wo._id === selectedWorkOrderId);
  };
  
  // Handle edit work order
  const handleEditWorkOrder = (event) => {
    event.stopPropagation();
    handleMenuClose();
    if (onEdit) {
      onEdit(selectedWorkOrderId);
    }
  };
  
  // Handle delete confirmation dialog
  const handleDeleteConfirm = (event) => {
    event.stopPropagation();
    handleMenuClose();
    setConfirmAction('delete');
    setConfirmDialogOpen(true);
  };
  
  // Handle status change confirmation dialog
  const handleStatusChangeConfirm = (event, newStatus) => {
    event.stopPropagation();
    handleMenuClose();
    setConfirmAction({ type: 'updateStatus', value: newStatus });
    setConfirmDialogOpen(true);
  };
  
  // Close confirmation dialog
  const handleConfirmDialogClose = () => {
    setConfirmDialogOpen(false);
    setConfirmAction(null);
  };
  
  // Execute confirmed action
  const handleConfirmAction = async () => {
    if (!confirmAction || !selectedWorkOrderId) return;
    
    setActionLoading(true);
    setActionError('');
    setActionSuccess('');
    
    try {
      if (confirmAction === 'delete') {
        await onDelete(selectedWorkOrderId);
        setActionSuccess('Work order deleted successfully');
      } else if (confirmAction.type === 'updateStatus') {
        await onUpdateStatus(selectedWorkOrderId, confirmAction.value);
        setActionSuccess(`Status updated to ${confirmAction.value}`);
      }
    } catch (err) {
      console.error('Action failed:', err);
      setActionError(err.message || 'Action failed. Please try again.');
    } finally {
      setActionLoading(false);
      handleConfirmDialogClose();
      
      // Clear messages after 3 seconds
      setTimeout(() => {
        setActionError('');
        setActionSuccess('');
      }, 3000);
    }
  };
  
  // Status options and colors
  const statusConfig = {
    'open': { color: 'primary', label: 'Open' },
    'in-progress': { color: 'warning', label: 'In Progress' },
    'paused': { color: 'secondary', label: 'Paused' },
    'completed': { color: 'success', label: 'Completed' },
    'cancelled': { color: 'error', label: 'Cancelled' }
  };
  
  // Format location for display
  const formatLocation = (location) => {
    if (!location) return 'Unknown';
    
    // Convert location value to display name
    if (location.startsWith('room-')) {
      return location.replace('room-', 'Room ');
    }
    
    // Capitalize first letter
    return location.charAt(0).toUpperCase() + location.slice(1);
  };
  
  // Get due date display with color
  const getDueDateDisplay = (dueDate) => {
    if (!dueDate) return null;
    
    const date = new Date(dueDate);
    const isPastDue = isPast(date) && !isToday(date);
    const isToday = Math.abs(differenceInDays(date, new Date())) < 1;
    const isSoon = differenceInDays(date, new Date()) <= 3;
    
    let color = 'textSecondary';
    if (isPastDue) color = 'error';
    else if (isToday) color = 'warning.main';
    else if (isSoon) color = 'warning.light';
    
    return {
      text: format(date, 'MMM d, yyyy'),
      color,
      isPastDue,
      isToday,
      isSoon
    };
  };
  
  // Render table view
  const renderTableView = () => {
    if (workOrders.length === 0) {
      return (
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            No work orders found
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph sx={{ mt: 1 }}>
            Create a new work order or adjust your filters to see results.
          </Typography>
        </Paper>
      );
    }
    
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {workOrders.map((workOrder) => {
              const dueDate = getDueDateDisplay(workOrder.dueDate);
              
              return (
                <TableRow 
                  key={workOrder._id} 
                  hover
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { 
                      backgroundColor: theme.palette.action.hover 
                    }
                  }}
                  component={Link}
                  to={`/workorders/${workOrder._id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Typography variant="body2" fontWeight="medium">
                        {workOrder.title}
                      </Typography>
                      {workOrder.isRecurring && (
                        <Tooltip title="Recurring Task">
                          <Chip 
                            label="Recurring" 
                            color="secondary" 
                            size="small" 
                            sx={{ ml: 1 }}
                          />
                        </Tooltip>
                      )}
                      {workOrder.images && workOrder.images.length > 0 && (
                        <Tooltip title={`${workOrder.images.length} images`}>
                          <IconButton size="small" sx={{ ml: 0.5 }}>
                            <ImageIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <LocationIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                      {formatLocation(workOrder.location)}
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Chip 
                      label={statusConfig[workOrder.status]?.label || workOrder.status} 
                      color={statusConfig[workOrder.status]?.color || 'default'}
                      size="small"
                    />
                  </TableCell>
                  
                  <TableCell>
                    <PriorityBadge priority={workOrder.priority} />
                  </TableCell>
                  
                  <TableCell>
                    {dueDate ? (
                      <Typography 
                        variant="body2" 
                        color={dueDate.color}
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          fontWeight: dueDate.isPastDue || dueDate.isToday ? 'bold' : 'normal'
                        }}
                      >
                        <CalendarIcon 
                          fontSize="small" 
                          sx={{ mr: 0.5, opacity: 0.7 }} 
                        />
                        {dueDate.text}
                        {dueDate.isPastDue && ' (Overdue)'}
                        {dueDate.isToday && ' (Today)'}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No due date
                      </Typography>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {workOrder.assignedTo ? (
                      <Box display="flex" alignItems="center">
                        <Avatar 
                          sx={{ 
                            width: 24, 
                            height: 24, 
                            fontSize: '0.875rem',
                            bgcolor: theme.palette.primary.main,
                            mr: 1
                          }}
                        >
                          {workOrder.assignedTo.name.charAt(0)}
                        </Avatar>
                        <Typography variant="body2">
                          {workOrder.assignedTo.name}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Unassigned
                      </Typography>
                    )}
                  </TableCell>
                  
                  <TableCell align="right" onClick={(e) => e.preventDefault()}>
                    <IconButton
                      size="small"
                      aria-label="more actions"
                      onClick={(e) => handleMenuOpen(e, workOrder._id)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };
  
  // Render grid view
  const renderGridView = () => {
    if (workOrders.length === 0) {
      return (
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            No work orders found
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph sx={{ mt: 1 }}>
            Create a new work order or adjust your filters to see results.
          </Typography>
        </Paper>
      );
    }
    
    return (
      <Grid container spacing={2}>
        {workOrders.map((workOrder) => {
          const dueDate = getDueDateDisplay(workOrder.dueDate);
          
          return (
            <Grid item xs={12} sm={6} md={4} key={workOrder._id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <CardActionArea 
                  component={Link}
                  to={`/workorders/${workOrder._id}`}
                  sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                >
                  {workOrder.images && workOrder.images.length > 0 && (
                    <CardMedia
                      component="img"
                      height="140"
                      image={workOrder.images[0]}
                      alt={workOrder.title}
                    />
                  )}
                  
                  <CardContent sx={{ flex: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Typography variant="h6" component="div" noWrap sx={{ maxWidth: '70%' }}>
                        {workOrder.title}
                      </Typography>
                      
                      <IconButton
                        size="small"
                        aria-label="more actions"
                        onClick={(e) => handleMenuOpen(e, workOrder._id)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                    
                    <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                      <Chip 
                        label={statusConfig[workOrder.status]?.label || workOrder.status} 
                        color={statusConfig[workOrder.status]?.color || 'default'}
                        size="small"
                      />
                      
                      <PriorityBadge priority={workOrder.priority} size="small" />
                      
                      {workOrder.isRecurring && (
                        <Chip 
                          label="Recurring" 
                          color="secondary" 
                          size="small" 
                        />
                      )}
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom sx={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      mb: 2
                    }}>
                      {workOrder.description}
                    </Typography>
                    
                    <Box display="flex" alignItems="center" mb={1}>
                      <LocationIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                      <Typography variant="body2">
                        {formatLocation(workOrder.location)}
                      </Typography>
                    </Box>
                    
                    {dueDate && (
                      <Box display="flex" alignItems="center" mb={1}>
                        <CalendarIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                        <Typography 
                          variant="body2" 
                          color={dueDate.color}
                          sx={{ 
                            fontWeight: dueDate.isPastDue || dueDate.isToday ? 'bold' : 'normal'
                          }}
                        >
                          {dueDate.text}
                          {dueDate.isPastDue && ' (Overdue)'}
                          {dueDate.isToday && ' (Today)'}
                        </Typography>
                      </Box>
                    )}
                    
                    <Box display="flex" alignItems="center">
                      <PersonIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                      <Typography variant="body2">
                        {workOrder.assignedTo 
                          ? workOrder.assignedTo.name 
                          : 'Unassigned'}
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    );
  };
  
  // Handle loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Handle error state
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }
  
  return (
    <Box>
      {/* Success/Error messages */}
      {actionSuccess && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setActionSuccess('')}>
          {actionSuccess}
        </Alert>
      )}
      
      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError('')}>
          {actionError}
        </Alert>
      )}
      
      {/* Work Order List */}
      {viewType === 'table' ? renderTableView() : renderGridView()}
      
      {/* Work Order Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem 
          component={Link} 
          to={`/workorders/${selectedWorkOrderId}`}
          onClick={handleMenuClose}
        >
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleEditWorkOrder}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        
        {/* Status Change Options - only show relevant status changes */}
        {selectedWorkOrderId && (
          <>
            <Divider />
            
            {['open', 'paused'].includes(getSelectedWorkOrder()?.status) && (
              <MenuItem onClick={(e) => handleStatusChangeConfirm(e, 'in-progress')}>
                <ListItemIcon>
                  <StartIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Start Work</ListItemText>
              </MenuItem>
            )}
            
            {getSelectedWorkOrder()?.status === 'in-progress' && (
              <MenuItem onClick={(e) => handleStatusChangeConfirm(e, 'paused')}>
                <ListItemIcon>
                  <StopIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Pause Work</ListItemText>
              </MenuItem>
            )}
            
            {['open', 'in-progress', 'paused'].includes(getSelectedWorkOrder()?.status) && (
              <MenuItem onClick={(e) => handleStatusChangeConfirm(e, 'completed')}>
                <ListItemIcon>
                  <CompleteIcon fontSize="small" color="success" />
                </ListItemIcon>
                <ListItemText>Mark Completed</ListItemText>
              </MenuItem>
            )}
            
            {['open', 'in-progress', 'paused'].includes(getSelectedWorkOrder()?.status) && (
              <MenuItem onClick={(e) => handleStatusChangeConfirm(e, 'cancelled')}>
                <ListItemIcon>
                  <CancelIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>Cancel</ListItemText>
              </MenuItem>
            )}
          </>
        )}
        
        <Divider />
        
        <MenuItem onClick={handleDeleteConfirm}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: theme.palette.error.main }}>
            Delete
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
            ? 'Delete Work Order' 
            : `Change Status to ${confirmAction?.value === 'in-progress' 
              ? 'In Progress' 
              : confirmAction?.value.charAt(0).toUpperCase() + confirmAction?.value.slice(1)}`}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmAction === 'delete'
              ? 'Are you sure you want to delete this work order? This action cannot be undone.'
              : `Are you sure you want to change the status to "${confirmAction?.value}"?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmDialogClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmAction} 
            color={confirmAction === 'delete' ? 'error' : 'primary'} 
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkOrderList;