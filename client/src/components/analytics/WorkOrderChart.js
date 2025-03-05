import React, { useState } from 'react';
import { 
  Box, Paper, Typography, CircularProgress, 
  Card, CardContent, CardHeader, FormControl, 
  InputLabel, Select, MenuItem, ButtonGroup, Button
} from '@mui/material';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  ResponsiveContainer, Legend, Tooltip, ReferenceLine
} from 'recharts';
import { format, subDays, eachDayOfInterval, parseISO } from 'date-fns';

// Custom tooltip component
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
            {`${entry.name}: ${entry.value}`}
          </Typography>
        ))}
      </Card>
    );
  }
  return null;
};

const WorkOrderChart = ({ data, loading, title = "Work Order Trends" }) => {
  const [timeRange, setTimeRange] = useState('week');
  const [chartType, setChartType] = useState('line');
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={400}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Check if data is empty
  const hasData = data && data.length > 0;
  
  // Generate mock data for development if no data provided
  const generateMockData = () => {
    const today = new Date();
    let days;
    
    switch (timeRange) {
      case 'week':
        days = 7;
        break;
      case 'month':
        days = 30;
        break;
      case 'quarter':
        days = 90;
        break;
      default:
        days = 7;
    }
    
    // Generate dates for the specified range
    const dateRange = eachDayOfInterval({
      start: subDays(today, days - 1),
      end: today
    });
    
    // Create mock data for each date
    return dateRange.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const displayDate = format(date, 'MMM dd');
      
      // Generate some random but reasonable values
      const created = Math.floor(Math.random() * 8) + 1;
      const completed = Math.floor(Math.random() * created) + 1;
      
      return {
        date: dateStr,
        displayDate,
        created,
        completed,
        open: created - completed
      };
    });
  };
  
  const chartData = hasData ? data : generateMockData();
  
  // Format dates for display
  const formattedData = chartData.map(item => ({
    ...item,
    displayDate: item.displayDate || format(parseISO(item.date), 'MMM dd')
  }));
  
  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
    // In a real implementation, you would fetch or filter data based on this value
  };
  
  const renderChart = () => {
    if (chartType === 'line') {
      return (
        <LineChart
          data={formattedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="displayDate" />
          <YAxis allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <ReferenceLine y={0} stroke="#000" />
          <Line 
            type="monotone" 
            dataKey="created" 
            name="Created" 
            stroke="#2196f3" 
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="completed" 
            name="Completed" 
            stroke="#4caf50" 
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="open" 
            name="Open" 
            stroke="#ff9800" 
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
        </LineChart>
      );
    } else {
      return (
        <BarChart
          data={formattedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="displayDate" />
          <YAxis allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="created" name="Created" fill="#2196f3" />
          <Bar dataKey="completed" name="Completed" fill="#4caf50" />
          <Bar dataKey="open" name="Open" fill="#ff9800" />
        </BarChart>
      );
    }
  };
  
  return (
    <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
      <CardHeader 
        title={title}
        action={
          <Box display="flex" alignItems="center">
            <ButtonGroup size="small" sx={{ mr: 2 }}>
              <Button 
                variant={chartType === 'line' ? 'contained' : 'outlined'} 
                onClick={() => setChartType('line')}
              >
                Line
              </Button>
              <Button 
                variant={chartType === 'bar' ? 'contained' : 'outlined'} 
                onClick={() => setChartType('bar')}
              >
                Bar
              </Button>
            </ButtonGroup>
            
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
              </Select>
            </FormControl>
          </Box>
        }
      />
      <CardContent>
        {hasData || true ? (
          <ResponsiveContainer width="100%" height={300}>
            {renderChart()}
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

export default WorkOrderChart;