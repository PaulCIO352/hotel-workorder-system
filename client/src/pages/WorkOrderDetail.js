import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Paper, Grid, Button, Chip, Divider,
  Card, CardContent, CardMedia, Dialog, DialogContent,
  Tab, Tabs, CircularProgress, Alert
} from '@mui/material';
import { 
  AccessTime as AccessTimeIcon, 
  Assignment as AssignmentIcon,
  PhotoCamera as PhotoCameraIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Comment as CommentIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

// Components
import TimeTracker from '../components/timeTracking/TimeTracker';
import CommentList from '../components/comments/CommentList';
import CommentForm from '../components/comments/CommentForm';
import PartRequestList from '../components/parts/PartRequestList';
import PartRequestForm from '../components/parts/PartRequestForm';

// API
import { workOrderAPI, commentAPI, partsAPI } from '../utils/api';

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
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const WorkOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workOrder, setWorkOrder] = useState(null);
  const [comments, setComments] = useState([]);
  const [partsRequests, setPartsRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Fetch work order details on component mount
  useEffect(() => {
    const fetchWorkOrder = async () => {
      try {
        setLoading(true);
        const res = await workOrderAPI.getById(id);
        setWorkOrder(res.data);
        
        // Fetch comments for this work order
        const commentsRes = await commentAPI.getForWorkOrder(id);
        setComments(commentsRes.data);
        
        // Fetch parts requests for this work order
        const partsRes = await partsAPI.getForWorkOrder(id);
        setPartsRequests(partsRes.data);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load work order details');
        setLoading(false);
        console.error(err);
      }
    };
    
    fetchWorkOrder();
  }, [id]);
  
  const handleAddComment = async (newComment) => {
    try {
      const commentData = {
        workOrderId: id,
        text: newComment.text,
        userId: newComment.userId // This should be the current logged-in user
      };
      
      const res = await commentAPI.create(commentData);
      setComments([...comments, res.data]);
    } catch (err) {
      console.error('Failed to add comment', err);
    }
  };
  
  const handleAddPartRequest = async (newPartRequest) => {
    try {
      const partData = {
        ...newPartRequest,
        workOrderId: id,
        status: 'requested'
      };
      
      const res = await partsAPI.create(partData);
      setPartsRequests([...partsRequests, res.data]);
    } catch (err) {
      console.error('Failed to add part request', err);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return 'info';
      case 'in-progress': return 'warning';
      case 'paused': return 'secondary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };
  
  if (loading) return <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!workOrder) return <Alert severity="warning">Work order not found</Alert>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Work Order: {workOrder.title}
        </Typography>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={() => navigate('/workorders')}
        >
          Back to List
        </Button>
      </Box>
      
      <Paper elevation={3} sx={{ mb: 3, p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              <AssignmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Details
            </Typography>
            <Typography variant="body1" paragraph>
              {workOrder.description}
            </Typography>
            
            <Box display="flex" alignItems="center" mb={1}>
              <LocationIcon color="action" sx={{ mr: 1 }} />
              <Typography variant="body2">
                Location: {workOrder.location}
              </Typography>
            </Box>
            
            <Box display="flex" alignItems="center" mb={1}>
              <PersonIcon color="action" sx={{ mr: 1 }} />
              <Typography variant="body2">
                Assigned to: {workOrder.assignedTo ? workOrder.assignedTo.name : 'Unassigned'}
              </Typography>
            </Box>
            
            <Box display="flex" alignItems="center" mb={1}>
              <AccessTimeIcon color="action" sx={{ mr: 1 }} />
              <Typography variant="body2">
                Created: {format(new Date(workOrder.created), 'PPpp')}
              </Typography>
            </Box>
            
            {workOrder.dueDate && (
              <Box display="flex" alignItems="center" mb={1}>
                <AccessTimeIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Due by: {format(new Date(workOrder.dueDate), 'PPp')}
                </Typography>
              </Box>
            )}
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box display="flex" flexDirection="column" alignItems="flex-start" gap={2}>
              <Chip 
                label={`Status: ${workOrder.status.toUpperCase()}`}
                color={getStatusColor(workOrder.status)}
                sx={{ mb: 1 }}
              />
              <Chip 
                label={`Priority: ${workOrder.priority.toUpperCase()}`}
                color={getPriorityColor(workOrder.priority)}
                sx={{ mb: 1 }}
              />
              {workOrder.isRecurring && (
                <Chip 
                  label="Recurring Task"
                  color="secondary"
                  sx={{ mb: 1 }}
                />
              )}
              
              <Typography variant="body2" sx={{ mt: 2 }}>
                Total Time Spent: {Math.floor(workOrder.totalTimeSpent / 60)} hr {workOrder.totalTimeSpent % 60} min
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        {workOrder.images && workOrder.images.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              <PhotoCameraIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Photos
            </Typography>
            <Grid container spacing={2}>
              {workOrder.images.map((image, index) => (
                <Grid item xs={6} sm={4} md={3} key={index}>
                  <Card 
                    sx={{ cursor: 'pointer' }} 
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
            
            <Dialog
              open={Boolean(selectedImage)}
              onClose={() => setSelectedImage(null)}
              maxWidth="md"
              fullWidth
            >
              <DialogContent>
                {selectedImage && (
                  <img 
                    src={selectedImage} 
                    alt="Work order" 
                    style={{ width: '100%', height: 'auto' }} 
                  />
                )}
              </DialogContent>
            </Dialog>
          </>
        )}
      </Paper>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="work order tabs">
          <Tab label="Time Tracking" id="workorder-tab-0" />
          <Tab 
            label={<Box display="flex" alignItems="center">
              <CommentIcon sx={{ mr: 0.5 }} />
              Comments ({comments.length})
            </Box>} 
            id="workorder-tab-1" 
          />
          <Tab label="Parts Requests" id="workorder-tab-2" />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        <TimeTracker workOrderId={id} workOrderStatus={workOrder.status} />
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <CommentList comments={comments} />
        <CommentForm onAddComment={handleAddComment} />
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <PartRequestList partsRequests={partsRequests} />
        <PartRequestForm onAddPartRequest={handleAddPartRequest} />
      </TabPanel>
    </Box>
  );
};

export default WorkOrderDetail;