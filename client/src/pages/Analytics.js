import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, Card, CardContent,
  FormControl, InputLabel, Select, MenuItem,
  CircularProgress, Alert
} from '@mui/material';
import { 
  BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { format, startOfDay, subDays, subMonths } from 'date-fns';

// API
import { analyticsAPI, workOrderAPI } from '../utils/api';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Analytics = () => {
  const [timeFrame, setTimeFrame] = useState('week');
  const [dailyStats, setDailyStats] = useState(null);
  const [priorityData, setPriorityData] = useState([]);
  const [timeSpentData, setTimeSpentData] = useState([]);
  const [completionData, setCompletionData] = useState([]);
  const [recentWorkOrders, setRecentWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        
        // Calculate date ranges based on selected time frame
        const today = startOfDay(new Date());
        let startDate;
        
        switch(timeFrame) {
          case 'week':
            startDate = subDays(today, 7);
            break;
          case 'month':
            startDate = subDays(today, 30);
            break;
          case 'quarter':
            startDate = subMonths(today, 3);
            break;
          case 'year':
            startDate = subMonths(today, 12);
            break;
          default:
            startDate = subDays(today, 7);
        }
        
        // Format dates for API
        const startDateString = format(startDate, 'yyyy-MM-dd');
        const endDateString = format(today, 'yyyy-MM-dd');
        
        // Fetch daily stats for today
        const dailyRes = await analyticsAPI.getDailyStats(format(today, 'yyyy-MM-dd'));
        setDailyStats(dailyRes.data);
        
        // Fetch priority distribution
        const priorityRes = await analyticsAPI.getWorkOrdersByPriority(startDateString, endDateString);
        setPriorityData(priorityRes.data);
        
        // Fetch time spent by department
        const timeSpentRes = await analyticsAPI.getTimeSpentByDepartment(startDateString, endDateString);
        setTimeSpentData(timeSpentRes.data);
        
        // Fetch completion stats
        const completionRes = await analyticsAPI.getCompletionStats(startDateString, endDateString);
        setCompletionData(completionRes.data);
        
        // Fetch recent work orders
        const workOrdersRes = await workOrderAPI.getAll({ 
          limit: 10, 
          sort: '-created' 
        });
        setRecentWorkOrders(workOrdersRes.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch analytics data', err);
        setError('Failed to load analytics data');
        setLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, [timeFrame]);
  
  const handleTimeFrameChange = (event) => {
    setTimeFrame(event.target.value);
  };
  
  // Mock data for UI development - Replace with actual API data
  const mockDailyStats = {
    date: new Date(),
    openWorkOrders: 12,
    inProgressWorkOrders: 8,
    completedToday: 5,
    totalMinutesWorkedToday: 480, // 8 hours
    averageCompletionTime: 105 // in minutes
  };
  
  const mockPriorityData = [
    { name: 'Low', value: 10 },
    { name: 'Medium', value: 25 },
    { name: 'High', value: 15 },
    { name: 'Urgent', value: 5 }
  ];
  
  const mockTimeSpentData = [
    { name: 'Maintenance', timeSpent: 1200 }, // in minutes
    { name: 'Housekeeping', timeSpent: 840 },
    { name: 'Engineering', timeSpent: 600 },
    { name: 'IT Support', timeSpent: 300 }
  ];
  
  const mockCompletionData = [
    { date: '2023-01-01', completed: 2 },
    { date: '2023-01-02', completed: 5 },
    { date: '2023-01-03', completed: 3 },
    { date: '2023-01-04', completed: 7 },
    { date: '2023-01-05', completed: 2 },
    { date: '2023-01-06', completed: 4 },
    { date: '2023-01-07', completed: 6 }
  ];
  
  // Use mock data for development
  const displayDailyStats = dailyStats || mockDailyStats;
  const displayPriorityData = priorityData.length ? priorityData : mockPriorityData;
  const displayTimeSpentData = timeSpentData.length ? timeSpentData : mockTimeSpentData;
  const displayCompletionData = completionData.length ? completionData : mockCompletionData;
  
  if (loading) return <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Analytics Dashboard
        </Typography>
        
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel id="timeframe-select-label">Time Frame</InputLabel>
          <Select
            labelId="timeframe-select-label"
            id="timeframe-select"
            value={timeFrame}
            label="Time Frame"
            onChange={handleTimeFrameChange}
          >
            <MenuItem value="week">Last 7 Days</MenuItem>
            <MenuItem value="month">Last 30 Days</MenuItem>
            <MenuItem value="quarter">Last 3 Months</MenuItem>
            <MenuItem value="year">Last 12 Months</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {/* Daily Stats Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Open Work Orders
              </Typography>
              <Typography variant="h4" component="div">
                {displayDailyStats.openWorkOrders}
              </Typography>
              <Typography variant="body2">
                Waiting to be assigned
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                In Progress
              </Typography>
              <Typography variant="h4" component="div">
                {displayDailyStats.inProgressWorkOrders}
              </Typography>
              <Typography variant="body2">
                Currently being worked on
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Completed Today
              </Typography>
              <Typography variant="h4" component="div">
                {displayDailyStats.completedToday}
              </Typography>
              <Typography variant="body2">
                Finished in the last 24h
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Hours Worked Today
              </Typography>
              <Typography variant="h4" component="div">
                {Math.round(displayDailyStats.totalMinutesWorkedToday / 60 * 10) / 10}h
              </Typography>
              <Typography variant="body2">
                Total across all work orders
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Avg. Completion Time
              </Typography>
              <Typography variant="h4" component="div">
                {Math.floor(displayDailyStats.averageCompletionTime / 60)}h {displayDailyStats.averageCompletionTime % 60}m
              </Typography>
              <Typography variant="body2">
                From open to completion
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Charts */}
      <Grid container spacing={3}>
        {/* Priority Distribution */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Work Orders by Priority
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={displayPriorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {displayPriorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Time Spent by Department */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Time Spent by Department (Hours)
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart
                data={displayTimeSpentData.map(item => ({
                  ...item,
                  timeSpent: Math.round(item.timeSpent / 60 * 10) / 10 // Convert minutes to hours
                }))}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="timeSpent" name="Hours" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Completion Trends */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Work Orders Completed Over Time
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart
                data={displayCompletionData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => {
                    // Format the date for display
                    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => {
                    return new Date(date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    });
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="completed" name="Completed Work Orders" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;