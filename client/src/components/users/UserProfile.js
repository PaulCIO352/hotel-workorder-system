import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, Avatar, Divider, 
  Chip, Button, Card, CardContent, CardHeader, 
  List, ListItem, ListItemText, ListItemIcon,
  CircularProgress, useTheme, Tab, Tabs, Alert
} from '@mui/material';
import { 
  Person as PersonIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  Work as WorkIcon,
  Assignment as AssignmentIcon,
  Edit as EditIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  DoNotDisturb as BlockIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

// TabPanel component for showing content based on selected tab
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
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

const UserProfile = ({ 
  userId,
  user = null,
  onEditUser,
  loading = false,
  error = null 
}) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [workOrderStats, setWorkOrderStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    open: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  
  // Role display mapping
  const roleDisplay = {
    admin: { label: 'Administrator', color: 'error' },
    manager: { label: 'Manager', color: 'warning' },
    maintenance: { label: 'Maintenance Staff', color: 'info' },
    housekeeping: { label: 'Housekeeping Staff', color: 'success' },
    staff: { label: 'General Staff', color: 'default' }
  };
  
  // In a real app, you would fetch these statistics from the API
  useEffect(() => {
    // Mock data for demonstration
    setWorkOrderStats({
      total: 24,
      completed: 18,
      inProgress: 3,
      open: 3
    });
    
    setRecentActivity([
      { 
        type: 'workOrder',
        action: 'completed',
        title: 'Fix broken AC in Room 304',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      { 
        type: 'workOrder',
        action: 'started',
        title: 'Replace light bulbs in hallway',
        date: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
      },
      { 
        type: 'comment',
        action: 'added',
        title: 'Ordered replacement parts',
        workOrder: 'Repair lobby door',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      { 
        type: 'workOrder',
        action: 'completed',
        title: 'Clean pool filters',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      }
    ]);
  }, [userId]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }
  
  if (!user) {
    return (
      <Alert severity="warning" sx={{ mb: 3 }}>
        User not found
      </Alert>
    );
  }

  // Get avatar color based on role
  const getAvatarColor = () => {
    const roleInfo = roleDisplay[user.role] || roleDisplay.staff;
    return theme.palette[roleInfo.color]?.main || theme.palette.primary.main;
  };
  
  // Get avatar text from name
  const getAvatarText = () => {
    if (!user.name) return '?';
    const nameParts = user.name.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };
  
  return (
    <Box>
      {/* User profile header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={2} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Avatar
              sx={{ 
                width: 100, 
                height: 100, 
                backgroundColor: getAvatarColor(),
                fontSize: '2.5rem',
                margin: { xs: 'auto', md: '0' }
              }}
            >
              {getAvatarText()}
            </Avatar>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h4" gutterBottom>
              {user.name}
            </Typography>
            
            <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
              <Chip 
                label={roleDisplay[user.role]?.label || user.role} 
                color={roleDisplay[user.role]?.color || 'default'}
              />
              
              <Chip 
                label={user.department.charAt(0).toUpperCase() + user.department.slice(1)} 
                variant="outlined"
              />
              
              <Chip 
                icon={user.active ? <CheckCircleIcon /> : <BlockIcon />}
                label={user.active ? 'Active' : 'Inactive'} 
                color={user.active ? 'success' : 'default'}
              />
            </Box>
            
            <Box display="flex" alignItems="center" mb={1}>
              <EmailIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
              <Typography variant="body2">{user.email}</Typography>
            </Box>
            
            <Box display="flex" alignItems="center">
              <BadgeIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
              <Typography variant="body2">Username: {user.username}</Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'center', md: 'right' } }}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => onEditUser && onEditUser(user._id)}
            >
              Edit Profile
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Tabs for different sections */}
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="user profile tabs">
          <Tab label="Overview" id="user-tab-0" />
          <Tab label="Work Orders" id="user-tab-1" />
          <Tab label="Recent Activity" id="user-tab-2" />
          <Tab label="Time Tracking" id="user-tab-3" />
        </Tabs>
        
        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardHeader title="User Information" />
                <Divider />
                <CardContent>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <PersonIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Full Name" 
                        secondary={user.name} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <EmailIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Email" 
                        secondary={user.email} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <BadgeIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Username" 
                        secondary={user.username} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <WorkIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Department" 
                        secondary={user.department.charAt(0).toUpperCase() + user.department.slice(1)} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <AccessTimeIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Joined" 
                        secondary={format(new Date(user.created), 'MMMM d, yyyy')} 
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Card variant="outlined">
                <CardHeader title="Work Order Statistics" />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Box textAlign="center" p={2}>
                        <Typography variant="h4" color="primary">
                          {workOrderStats.total}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Total Assigned
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={6} sm={3}>
                      <Box textAlign="center" p={2}>
                        <Typography variant="h4" color="success.main">
                          {workOrderStats.completed}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Completed
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={6} sm={3}>
                      <Box textAlign="center" p={2}>
                        <Typography variant="h4" color="warning.main">
                          {workOrderStats.inProgress}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          In Progress
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={6} sm={3}>
                      <Box textAlign="center" p={2}>
                        <Typography variant="h4" color="info.main">
                          {workOrderStats.open}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Open
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Completion Rate
                  </Typography>
                  
                  <Box position="relative" display="flex" alignItems="center">
                    <Box 
                      sx={{ 
                        width: '100%', 
                        height: 10, 
                        backgroundColor: theme.palette.grey[200],
                        borderRadius: 5
                      }}
                    >
                      <Box 
                        sx={{ 
                          width: `${workOrderStats.total ? (workOrderStats.completed / workOrderStats.total) * 100 : 0}%`, 
                          height: 10, 
                          backgroundColor: theme.palette.success.main,
                          borderRadius: 5
                        }}
                      />
                    </Box>
                    <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
                      {workOrderStats.total ? Math.round((workOrderStats.completed / workOrderStats.total) * 100) : 0}%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Work Orders Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Assigned Work Orders
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            This section would display a list of work orders assigned to this user.
            You can implement this by filtering work orders by the user's ID.
          </Alert>
          
          <Button
            variant="contained"
            component={Link}
            to="/workorders"
            startIcon={<AssignmentIcon />}
          >
            View All Work Orders
          </Button>
        </TabPanel>
        
        {/* Recent Activity Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          
          <List>
            {recentActivity.map((activity, index) => (
              <ListItem key={index} divider sx={{ py: 2 }}>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1">
                      {activity.type === 'workOrder' ? (
                        <>
                          {activity.action === 'completed' ? 'Completed work order: ' : 'Started work on: '}
                          <Link 
                            to="#" 
                            style={{ 
                              color: theme.palette.primary.main,
                              textDecoration: 'none'
                            }}
                          >
                            {activity.title}
                          </Link>
                        </>
                      ) : (
                        <>
                          Added comment: "{activity.title}" on work order{' '}
                          <Link 
                            to="#" 
                            style={{ 
                              color: theme.palette.primary.main,
                              textDecoration: 'none'
                            }}
                          >
                            {activity.workOrder}
                          </Link>
                        </>
                      )}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      {format(activity.date, 'PPpp')}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </TabPanel>
        
        {/* Time Tracking Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Time Tracking History
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            This section would display time tracking history for this user.
            You can implement this by filtering time entries by the user's ID.
          </Alert>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default UserProfile;