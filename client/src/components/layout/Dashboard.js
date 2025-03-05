import React from 'react';
import { 
  Box, Grid, Typography, Paper, Card, CardContent,
  CardActionArea, Divider, useTheme, useMediaQuery
} from '@mui/material';
import { 
  Assignment as AssignmentIcon,
  Build as BuildIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon,
  Inventory as InventoryIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

// Import any required components or hooks

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Quick action cards for main functionality
  const actionCards = [
    {
      title: 'Work Orders',
      description: 'Create and manage work orders',
      icon: <AssignmentIcon fontSize="large" color="primary" />,
      path: '/workorders',
      color: theme.palette.primary.light
    },
    {
      title: 'Users',
      description: 'Manage staff accounts',
      icon: <PersonIcon fontSize="large" color="secondary" />,
      path: '/users',
      color: theme.palette.secondary.light
    },
    {
      title: 'Recurring Tasks',
      description: 'Setup scheduled maintenance',
      icon: <EventIcon fontSize="large" style={{ color: theme.palette.success.main }} />,
      path: '/recurring',
      color: theme.palette.success.light
    },
    {
      title: 'Parts Requests',
      description: 'Request and track parts',
      icon: <InventoryIcon fontSize="large" style={{ color: theme.palette.warning.main }} />,
      path: '/parts',
      color: theme.palette.warning.light
    },
    {
      title: 'Analytics',
      description: 'View performance reports',
      icon: <AssessmentIcon fontSize="large" style={{ color: theme.palette.info.main }} />,
      path: '/analytics',
      color: theme.palette.info.light
    },
    {
      title: 'Settings',
      description: 'Configure system options',
      icon: <SettingsIcon fontSize="large" style={{ color: theme.palette.grey[700] }} />,
      path: '/settings',
      color: theme.palette.grey[200]
    }
  ];
  
  return (
    <Box>
      <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: 'background.paper' }}>
        <Typography variant="h4" gutterBottom>
          Hotel Work Order Dashboard
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Welcome to your maintenance management system. Quickly access key functions below.
        </Typography>
      </Paper>
      
      <Grid container spacing={3}>
        {/* Quick Action Cards */}
        {actionCards.map((card, index) => (
          <Grid item xs={6} md={4} lg={4} key={index}>
            <Card 
              elevation={2}
              component={Link} 
              to={card.path}
              sx={{
                height: '100%',
                textDecoration: 'none',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
            >
              <CardActionArea sx={{ height: '100%' }}>
                <CardContent 
                  sx={{ 
                    height: '100%', 
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                  }}
                >
                  <Box 
                    sx={{ 
                      mb: 2, 
                      p: 2, 
                      borderRadius: '50%', 
                      bgcolor: card.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {card.title}
                  </Typography>
                  {!isMobile && (
                    <Typography variant="body2" color="textSecondary">
                      {card.description}
                    </Typography>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Box mt={4}>
        <Paper elevation={1} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            <BuildIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Quick Tips
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body1" paragraph>
            • Create <strong>Work Orders</strong> to track maintenance tasks
          </Typography>
          <Typography variant="body1" paragraph>
            • Assign tasks to staff members from the <strong>Users</strong> section
          </Typography>
          <Typography variant="body1" paragraph>
            • Monitor completion rates and response times in <strong>Analytics</strong>
          </Typography>
          <Typography variant="body1">
            • Set up <strong>Recurring Tasks</strong> for preventive maintenance
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;