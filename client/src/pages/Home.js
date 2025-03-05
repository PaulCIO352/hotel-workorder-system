import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, CardActions,
  Button, Divider, Paper, CircularProgress, Alert
} from '@mui/material';
import { 
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  AccessTime as AccessTimeIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

// API
import { workOrderAPI } from '../utils/api';

const Home = () => {
  const [stats, setStats] = useState({
    open: 0,
    inProgress: 0,
    urgent: 0,
    completed: 0
  });
  const [recentWorkOrders, setRecentWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch work orders
        const res = await workOrderAPI.getAll({ limit: 5, sort: '-created' });
        setRecentWorkOrders(res.data);
        
        // Calculate stats
        const allWorkOrders = await workOrderAPI.getAll();
        const workOrders = allWorkOrders.data;
        
        const openCount = workOrders.filter(wo => wo.status === 'open').length;
        const inProgressCount = workOrders.filter(wo => wo.status === 'in-progress').length;
        const urgentCount = workOrders.filter(wo => wo.priority === 'urgent').length;
        const completedCount = workOrders.filter(wo => wo.status === 'completed').length;
        
        setStats({
          open: openCount,
          inProgress: inProgressCount,
          urgent: urgentCount,
          completed: completedCount
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'low': return 'success.main';
      case 'medium': return 'info.main';
      case 'high': return 'warning.main';
      case 'urgent': return 'error.main';
      default: return 'text.secondary';
    }
  };
  
  if (loading) return <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Hotel Work Order Dashboard
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Open Work Orders
              </Typography>
              <Typography variant="h3" component="div" color="primary">
                {stats.open}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Waiting to be assigned
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                In Progress
              </Typography>
              <Typography variant="h3" component="div" color="info.main">
                {stats.inProgress}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Currently being worked on
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Urgent Tasks
              </Typography>
              <Typography variant="h3" component="div" color="error.main">
                {stats.urgent}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                High priority work orders
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Completed
              </Typography>
              <Typography variant="h3" component="div" color="success.main">
                {stats.completed}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Successfully resolved
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            <AssignmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Recent Work Orders
          </Typography>
          
          <Button 
            component={Link} 
            to="/workorders" 
            endIcon={<ArrowForwardIcon />}
            size="small"
          >
            View All
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        {recentWorkOrders.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No work orders found. Create your first work order to get started.
          </Typography>
        ) : (
          recentWorkOrders.map((workOrder) => (
            <Card key={workOrder._id} sx={{ mb: 2 }}>
              <CardContent sx={{ pb: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {workOrder.title}
                </Typography>
                
                <Box display="flex" alignItems="center" mb={1}>
                  <Box 
                    sx={{ 
                      width: 10, 
                      height: 10, 
                      borderRadius: '50%', 
                      bgcolor: getPriorityColor(workOrder.priority),
                      mr: 1 
                    }} 
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                    {workOrder.priority.charAt(0).toUpperCase() + workOrder.priority.slice(1)} Priority
                  </Typography>
                  
                  {workOrder.status === 'open' && (
                    <Typography variant="body2" color="primary" sx={{ mr: 2 }}>
                      <AssignmentIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                      Open
                    </Typography>
                  )}
                  {workOrder.status === 'in-progress' && (
                    <Typography variant="body2" color="info.main" sx={{ mr: 2 }}>
                      <AccessTimeIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                      In Progress
                    </Typography>
                  )}
                  {workOrder.status === 'completed' && (
                    <Typography variant="body2" color="success.main" sx={{ mr: 2 }}>
                      <CheckCircleIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                      Completed
                    </Typography>
                  )}
                  
                  <Typography variant="body2" color="text.secondary">
                    Location: {workOrder.location}
                  </Typography>
                </Box>
                
                <Typography variant="body2" noWrap>
                  {workOrder.description.length > 100 
                    ? `${workOrder.description.substring(0, 100)}...` 
                    : workOrder.description}
                </Typography>
              </CardContent>
              
              <CardActions>
                <Button 
                  size="small" 
                  component={Link} 
                  to={`/workorders/${workOrder._id}`}
                >
                  View Details
                </Button>
              </CardActions>
            </Card>
          ))
        )}
      </Paper>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Button 
              variant="contained" 
              component={Link} 
              to="/workorders"
              sx={{ mr: 2, mb: 2 }}
            >
              View All Work Orders
            </Button>
            
            <Button 
              variant="contained" 
              color="success" 
              component={Link} 
              to="/workorders?status=open"
              sx={{ mr: 2, mb: 2 }}
            >
              Open Work Orders
            </Button>
            
            <Button 
              variant="contained" 
              color="error" 
              component={Link} 
              to="/workorders?priority=urgent"
              sx={{ mr: 2, mb: 2 }}
            >
              Urgent Tasks
            </Button>
            
            <Button 
              variant="contained" 
              color="secondary" 
              component={Link} 
              to="/recurring"
              sx={{ mb: 2 }}
            >
              Recurring Tasks
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              System Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="body2" paragraph>
              Welcome to the Hotel Work Order Management System. This system helps you track and manage maintenance tasks, repairs, and other work orders for your hotel.
            </Typography>
            
            <Typography variant="body2" paragraph>
              Use the navigation menu to access different sections of the application. You can create new work orders, track time spent on tasks, request parts, and set up recurring maintenance schedules.
            </Typography>
            
            <Typography variant="body2">
              The analytics section provides insights into your maintenance operations, helping you identify trends and improve efficiency.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Home;