import React, { useState } from 'react';
import { 
  Box, Paper, Typography, CircularProgress, 
  Card, CardContent, CardHeader, FormControl, 
  InputLabel, Select, MenuItem 
} from '@mui/material';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  Legend, Tooltip
} from 'recharts';

// Colors for chart segments
const COLORS = ['#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0'];

// Custom tooltip component for the pie chart
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <Card sx={{ p: 1, border: '1px solid #ccc', backgroundColor: '#fff' }}>
        <Typography variant="body2" color="textPrimary">
          {`${payload[0].name}: ${payload[0].value}`}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {`${(payload[0].percent * 100).toFixed(1)}% of total`}
        </Typography>
      </Card>
    );
  }
  return null;
};

const PriorityPieChart = ({ data, loading, title = "Work Orders by Priority" }) => {
  const [timeRange, setTimeRange] = useState('all');
  
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
    { name: 'Low', value: 10 },
    { name: 'Medium', value: 25 },
    { name: 'High', value: 15 },
    { name: 'Urgent', value: 5 }
  ];
  
  // Calculate total for percentage
  const total = chartData.reduce((sum, entry) => sum + entry.value, 0);
  
  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
    // In a real implementation, you would fetch or filter data based on this value
  };
  
  // Custom rendering for legend
  const renderLegend = (props) => {
    const { payload } = props;
    
    return (
      <Box display="flex" flexDirection="column" mt={2}>
        {payload.map((entry, index) => (
          <Box 
            key={`legend-item-${index}`} 
            display="flex" 
            alignItems="center" 
            mb={1}
          >
            <Box 
              width={12} 
              height={12} 
              bgcolor={entry.color} 
              mr={1} 
              borderRadius="50%" 
            />
            <Typography variant="body2" color="textPrimary">
              {entry.value}: {chartData[index].value} 
              ({total > 0 ? ((chartData[index].value / total) * 100).toFixed(1) : 0}%)
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };
  
  return (
    <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
      <CardHeader 
        title={title}
        action={
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="time-range-label">Time Range</InputLabel>
            <Select
              labelId="time-range-label"
              id="time-range-select"
              value={timeRange}
              onChange={handleTimeRangeChange}
              label="Time Range"
            >
              <MenuItem value="all">All Time</MenuItem>
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="quarter">This Quarter</MenuItem>
            </Select>
          </FormControl>
        }
      />
      <CardContent>
        {hasData || true ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => 
                  percent > 0.1 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
                }
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={renderLegend} />
            </PieChart>
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

export default PriorityPieChart;