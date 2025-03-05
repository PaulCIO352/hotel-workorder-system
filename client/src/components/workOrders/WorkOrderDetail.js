import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, Button, Chip, Divider,
  Card, CardContent, CardMedia, Dialog, DialogContent,
  MenuItem, Menu, IconButton, Tab, Tabs, CircularProgress, 
  Alert, Avatar, useTheme
} from '@mui/material';
import { 
  Assignment as AssignmentIcon,
  Build as BuildIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon,
  Inventory as InventoryIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  LocationOn as LocationIcon,
  AccessTime as AccessTimeIcon,
  Photo as PhotoIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CompleteIcon,
  Cancel as CancelIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon
} from '@mui/icons-material';
import { format, formatDistance } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';

// Import custom components
import TimeTracker from '../timeTracking/TimeTracker';
import TimeEntryList from '../timeTracking/TimeEntryList';
import CommentList from '../comments/CommentList';
import CommentForm from '../comments/CommentForm';
import PartRequestList from '../parts/PartRequestList';
import PartRequestForm from '../parts/PartRequestForm';
import PriorityBadge from '../common/PriorityBadge';

// TabPanel component for showing content based on selected tab
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`workorder-tabpanel-${index}`}
      aria-labelledby={`workorder-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const WorkOrderDetail = ({ 
  workOrder,
  onUpdateStatus,
  onEdit,
  onDelete,
  loading = false,
  error = null
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  
  // Status options and colors
  const statusConfig = {
    'open': { color: 'primary', label: 'Open' },
    'in-progress': { color: 'warning', label: 'In Progress' },
    'paused': { color: 'secondary', label: 'Paused' },
    'completed': { color: 'success', label: 'Completed' },
    'cancelled': { color: 'error', label: 'Cancelled' }
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Open the actions menu
  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  // Close the actions menu
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  // Handle edit work order
  const handleEditWorkOrder = () => {
    handleMenuClose();
    if (onEdit) {
      onEdit(workOrder._id);
    }
  };
  
  // Handle delete confirmation dialog
  const handleDeleteConfirm = () => {
    handleMenuClose();
    setConfirmAction('delete');
    setConfirmDialogOpen(true);
  };
  
  // Handle status change confirmation dialog
  const handleStatusChangeConfirm = (newStatus) => {
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
    if (!confirmAction || !workOrder) return;
    
    setActionLoading(true);
    setActionError('');
    setActionSuccess('');
    
    try {
      if (confirmAction === 'delete') {
        await onDelete(workOrder._id);
        setActionSuccess('Work order deleted successfully');
        // Navigate back to work orders list after short delay
        setTimeout(() => {
          navigate('/workorders');
        }, 1500);
      } else if (confirmAction.type === 'updateStatus') {
        await onUpdateStatus(workOrder._id, confirmAction.value);
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
  
  // Handle case when no work order is available
  if (!workOrder) {
    return (
      <Alert severity="warning" sx={{ mb: 3 }}>
        Work order not found
      </Alert>
    );
  }

  return (
    <Box>
      {/* Action Success/Error Alerts */}
      {actionSuccess && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setActionSuccess('')}>
          {actionSuccess}
        </Alert>
      )}
      
      {actionError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setActionError('')}>
          {actionError}
        </Alert>
      )}
      
      {/* Header with back button and actions */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button
          component={Link}
          to="/workorders"
          startIcon={<ArrowBackIcon />}
          color="inherit"
        >
          Back to Work Orders
        </Button>
        
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            onClick={handleEditWorkOrder}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          
          <Button
            aria-label="more actions"
            aria-controls="work-order-menu"
            aria-haspopup="true"
            onClick={handleMenuOpen}
            variant="contained"
          >
            Actions
          </Button>
          
          <Menu
            id="work-order-menu"
            anchorEl={menuAnchorEl}
            keepMounted
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
          >
            {/* Status Change Options - only show relevant status changes */}
            {['open', 'paused'].includes(workOrder.status) && (
              <MenuItem onClick={() => handleStatusChangeConfirm('in-progress')}>
                <ListItemIcon>
                  <StartIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="inherit">Start Work</Typography>
              </MenuItem>
            )}
            
            {workOrder.status === 'in-progress' && (
              <MenuItem onClick={() => handleStatusChangeConfirm('paused')}>
                <ListItemIcon>
                  <StopIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="inherit">Pause Work</Typography>
              </MenuItem>
            )}
            
            {['open', 'in-progress', 'paused'].includes(workOrder.status) && (
              <MenuItem onClick={() => handleStatusChangeConfirm('completed')}>
                <ListItemIcon>
                  <CompleteIcon fontSize="small" color="success" />
                </ListItemIcon>
                <Typography variant="inherit">Mark Completed</Typography>
              </MenuItem>
            )}
            
            {['open', 'in-progress', 'paused'].includes(workOrder.status) && (
              <MenuItem onClick={() => handleStatusChangeConfirm('cancelled')}>
                <ListItemIcon>
                  <CancelIcon fontSize="small" color="error" />
                </ListItemIcon>
                <Typography variant="inherit">Cancel Work Order</Typography>
              </MenuItem>
            )}
            
            <Divider />
            
            <MenuItem onClick={handleDeleteConfirm}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <Typography variant="inherit" color="error">Delete Work Order</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Box>
      
      {/* Work Order Details */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h5" gutterBottom>
              {workOrder.title}
            </Typography>
            
            <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
              <Chip 
                label={statusConfig[workOrder.status]?.label || workOrder.status} 
                color={statusConfig[workOrder.status]?.color || 'default'}
              />
              
              <PriorityBadge priority={workOrder.priority} />
              
              {workOrder.isRecurring && (
                <Chip 
                  label="Recurring Task" 
                  color="secondary" 
                />
              )}
            </Box>
            
            <Typography variant="body1" paragraph>
              {workOrder.description}
            </Typography>
            
            <Box display="flex" alignItems="center" mb={1}>
              <LocationIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2">
                <strong>Location:</strong> {formatLocation(workOrder.location)}
              </Typography>
            </Box>
            
            <Box display="flex" alignItems="center" mb={1}>
              <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2">
                <strong>Created:</strong> {format(new Date(workOrder.created), 'PPpp')}
              </Typography>
            </Box>
            
            {workOrder.dueDate && (
              <Box display="flex" alignItems="center" mb={1}>
                <EventIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  <strong>Due By:</strong> {format(new Date(workOrder.dueDate), 'PPp')}
                </Typography>
              </Box>
            )}
            
            <Box display="flex" alignItems="center">
              <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2">
                <strong>Assigned To:</strong> {workOrder.assignedTo ? workOrder.assignedTo.name : 'Unassigned'}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Work Order Status
                </Typography>
                
                <Box mt={2} mb={4} display="flex" justifyContent="center">
                  <Chip 
                    label={statusConfig[workOrder.status]?.label || workOrder.status} 
                    color={statusConfig[workOrder.status]?.color || 'default'}
                    size="large"
                    sx={{ px: 2, py: 3, fontSize: '1.1rem' }}
                  />
                </Box>
                
                <Typography variant="subtitle2" gutterBottom>
                  Time Spent
                </Typography>
                <Typography variant="body1" gutterBottom color="text.secondary">
                  {workOrder.totalTimeSpent ? (
                    <>
                      {Math.floor(workOrder.totalTimeSpent / 60)} hours{' '}
                      {workOrder.totalTimeSpent % 60} minutes
                    </>
                  ) : (
                    'No time logged yet'
                  )}
                </Typography>
                
                {workOrder.completedDate && (
                  <>
                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                      Completed
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {format(new Date(workOrder.completedDate), 'PPp')}
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Photo Gallery */}
        {workOrder.images && workOrder.images.length > 0 && (
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              <PhotoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Photos ({workOrder.images.length})
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              {workOrder.images.map((image, index) => (
                <Grid item xs={6} sm={4} md={3} lg={2} key={index}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'scale(1.05)'
                      }
                    }} 
                    onClick={() => setSelectedImage(image)}
                  >
                    <CardMedia
                      component="img"
                      height="140"
                      image={image}
                      alt={`Work order image ${index + 1}`}
                    />
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            {/* Image Preview Dialog */}
            <Dialog
              open={Boolean(selectedImage)}
              onClose={() => setSelectedImage(null)}
              maxWidth="md"
              fullWidth
            >
              <DialogContent sx={{ p: 1 }}>
                {selectedImage && (
                  <img 
                    src={selectedImage} 
                    alt="Work order" 
                    style={{ width: '100%', height: 'auto', cursor: 'pointer' }} 
                    onClick={() => setSelectedImage(null)}
                  />
                )}
              </DialogContent>
            </Dialog>
          </Box>
        )}
      </Paper>
      
      {/* Tabs for Time Tracking, Comments, and Parts Requests */}
      <Paper elevation={2}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="work order tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Time Tracking" id="tab-0" />
          <Tab label="Comments" id="tab-1" />
          <Tab label="Parts Requests" id="tab-2" />
        </Tabs>
        
        {/* Time Tracking Tab */}
        <TabPanel value={tabValue} index={0}>
          <TimeTracker 
            workOrderId={workOrder._id} 
            workOrderStatus={workOrder.status} 
          />
        </TabPanel>
        
        {/* Comments Tab */}
        <TabPanel value={tabValue} index={1}>
          <CommentList 
            comments={workOrder.comments || []}
            onDeleteComment={() => {}}
          />
          <CommentForm
            onAddComment={() => {}}
            workOrderId={workOrder._id}
          />
        </TabPanel>
        
        {/* Parts Requests Tab */}
        <TabPanel value={tabValue} index={2}>
          <PartRequestList 
            partsRequests={workOrder.partsRequests || []}
            onUpdateStatus={() => {}}
            onDeleteRequest={() => {}}
            onEditRequest={() => {}}
          />
          <PartRequestForm
            onAddPartRequest={() => {}}
            workOrders={[{ _id: workOrder._id, title: workOrder.title }]}
          />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default WorkOrderDetail;