import React, { useState } from 'react';
import { 
  Box, Paper, Typography, CircularProgress, 
  Card, CardContent, CardHeader, FormControl, 
  InputLabel, Select, MenuItem, ToggleButtonGroup, 
  ToggleButton, Tooltip
} from '@mui/material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  ResponsiveContainer, Legend, Tooltip as RechartsTooltip
} from 'recharts';
import {
  ViewWeek as ViewWeekIcon,
  CalendarViewMonth as CalendarViewMonthIcon
} from '@mui/icons-material';

// Custom tooltip component for the bar chart
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Card sx={{ p: 1, border: '1px solid #ccc', backgroundColor: '#fff' }}>
        <Typography variant="body2" fontWeight="bold" color="textPrimary">
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Typography 
            key={`tooltip-item-${index}`} 
            variant="body2" 
            color="textSecondary"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <Box 
              component="span" 
              sx={{ 
                display: 'inline-block',
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: entry.color,
                mr: 1
              }} 
            />
            {`${entry.name}: ${entry.value} hours`}
          </Typography>
        ))}
      </Card>
    );
  }
  return null;
};

const TimeSpentBarChart = ({ data, loading, title = "Time Spent by Department" }) => {
  const [timeRange, setTimeRange] = useState('week');
  const [chartView, setChartView] = useState('stacked');
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={400}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Check if data is empty
  const hasData = data && data.length > 0;
  
  // Mock data for development if no data provided
  const chartData = hasData ? data : [
    { name: 'Maintenance', timeSpent: 20.5 },
    { name: 'Housekeeping', timeSpent: 14.2 },
    { name: 'Engineering', timeSpent: 10.0 },
    { name: 'IT Support', timeSpent: 5.0 },
    { name: 'Front Desk', timeSpent: 3.5 }
  ];
  
  // Sort data by time spent (descending)
  const sortedData = [...chartData].sort((a, b) => b.timeSpent - a.timeSpent);
  
  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
    // In a real implementation, you would fetch or filter data based on this value
  };
  
  const handleChartViewChange = (event, newView) => {
    if (newView !== null) {
      setChartView(newView);
    }
  };
  
  return (
    <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
      <CardHeader 
        title={title}
        action={
          <Box display="flex" alignItems="center">
            <ToggleButtonGroup
              size="small"
              value={chartView}
              exclusive
              onChange={handleChartViewChange}
              aria-label="chart view"
              sx={{ mr: 2 }}
            >
              <ToggleButton value="stacked" aria-label="stacked view">
                <Tooltip title="Stacked View">
                  <ViewWeekIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="grouped" aria-label="grouped view">
                <Tooltip title="Grouped View">
                  <CalendarViewMonthIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
            
            <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="time-range-label">Time Range</InputLabel>
              <Select
                labelId="time-range-label"
                id="time-range-select"
                value={timeRange}
                onChange={handleTimeRangeChange}
                label="Time Range"
              >
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
                <MenuItem value="quarter">This Quarter</MenuItem>
                <MenuItem value="year">This Year</MenuItem>
              </Select>
            </FormControl>
          </Box>
        }
      />
      <CardContent>
        {hasData || true ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={sortedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" label={{ value: 'Hours', position: 'insideBottom', offset: -5 }} />
              <YAxis dataKey="name" type="category" width={100} />
              <RechartsTooltip 
                content={<CustomTooltip />} 
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              />
              <Legend />
              <Bar 
                dataKey="timeSpent" 
                name="Hours Spent" 
                fill="#8884d8" 
                barSize={chartView === 'stacked' ? 20 : 15}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            height={300}
          >
            <Typography variant="body2" color="textSecondary">
              No data available for the selected time range
            </Typography>
          </Box>
        )}
      </CardContent>
    </Paper>
  );
};

export default TimeSpentBarChart;