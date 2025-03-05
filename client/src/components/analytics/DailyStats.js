import React from 'react';
import { 
  Box, Grid, Card, CardContent, Typography, 
  CircularProgress, Divider
} from '@mui/material';
import { 
  Assignment as AssignmentIcon,
  Pending as PendingIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';

const DailyStats = ({ stats, loading }) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  // Fallback if stats are not provided
  const displayStats = stats || {
    openWorkOrders: 0,
    inProgressWorkOrders: 0,
    completedToday: 0,
    totalMinutesWorkedToday: 0,
    averageCompletionTime: 0
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={1}>
              <AssignmentIcon color="primary" sx={{ mr: 1 }} />
              <Typography color="textSecondary" variant="subtitle2">
                Open Work Orders
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Typography variant="h4" component="div" color="primary.main">
              {displayStats.openWorkOrders}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Waiting to be assigned
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={1}>
              <PendingIcon color="warning" sx={{ mr: 1 }} />
              <Typography color="textSecondary" variant="subtitle2">
                In Progress
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Typography variant="h4" component="div" color="warning.main">
              {displayStats.inProgressWorkOrders}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Currently being worked on
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={1}>
              <CheckCircleIcon color="success" sx={{ mr: 1 }} />
              <Typography color="textSecondary" variant="subtitle2">
                Completed Today
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Typography variant="h4" component="div" color="success.main">
              {displayStats.completedToday}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Finished in the last 24h
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={1}>
              <AccessTimeIcon color="info" sx={{ mr: 1 }} />
              <Typography color="textSecondary" variant="subtitle2">
                Hours Worked Today
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Typography variant="h4" component="div" color="info.main">
              {Math.round(displayStats.totalMinutesWorkedToday / 60 * 10) / 10}h
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Total across all tasks
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={1}>
              <SpeedIcon color="secondary" sx={{ mr: 1 }} />
              <Typography color="textSecondary" variant="subtitle2">
                Avg. Completion Time
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Typography variant="h4" component="div" color="secondary.main">
              {Math.floor(displayStats.averageCompletionTime / 60)}h {displayStats.averageCompletionTime % 60}m
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              From open to completion
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default DailyStats;