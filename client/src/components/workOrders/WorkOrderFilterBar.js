import React, { useState } from 'react';
import { 
  Paper, Box, TextField, Grid, InputAdornment, 
  FormControl, InputLabel, Select, MenuItem, 
  IconButton, Button, Chip, Tooltip, Typography,
  Popover, Collapse, Card, CardContent, Switch,
  FormControlLabel, useTheme
} from '@mui/material';
import { 
  Search as SearchIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format, isValid } from 'date-fns';

const WorkOrderFilterBar = ({ 
  filters, 
  onFilterChange,
  onClearFilters,
  locations = [],
  users = []
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    createdAfter: null,
    createdBefore: null,
    dueAfter: null,
    dueBefore: null,
    includeCompleted: true,
    includeCancelled: false
  });
  
  // Active filters count (excluding search)
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.status) count++;
    if (filters.priority) count++;
    if (filters.location) count++;
    if (filters.assignedTo) count++;
    
    // Add advanced filter counts
    if (advancedFilters.createdAfter) count++;
    if (advancedFilters.createdBefore) count++;
    if (advancedFilters.dueAfter) count++;
    if (advancedFilters.dueBefore) count++;
    if (!advancedFilters.includeCompleted) count++;
    if (advancedFilters.includeCancelled) count++;
    
    return count;
  };
  
  // Priority options
  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];
  
  // Status options
  const statusOptions = [
    { value: 'open', label: 'Open' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'paused', label: 'Paused' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];
  
  // Default locations if none provided
  const defaultLocations = [
    { value: 'lobby', label: 'Lobby' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'kitchen', label: 'Kitchen' },
    { value: 'pool', label: 'Pool Area' },
    { value: 'gym', label: 'Fitness Center' },
    { value: 'conference', label: 'Conference Room' },
    { value: 'common', label: 'Common Areas' }
  ];
  
  // Use provided locations or defaults
  const locationOptions = locations.length > 0 
    ? locations 
    : defaultLocations;
  
  // Handle basic filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };
  
  // Handle advanced filter changes
  const handleAdvancedFilterChange = (name, value) => {
    setAdvancedFilters(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Apply the advanced filters to the main filters
    // This allows the parent component to handle all filters uniformly
    onFilterChange({
      ...filters,
      [name]: value
    });
  };
  
  // Handle switch filter changes
  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    handleAdvancedFilterChange(name, checked);
  };
  
  // Toggle expanded state
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  // Handle clear all filters
  const handleClearAll = () => {
    // Reset basic filters
    onClearFilters();
    
    // Reset advanced filters
    setAdvancedFilters({
      createdAfter: null,
      createdBefore: null,
      dueAfter: null,
      dueBefore: null,
      includeCompleted: true,
      includeCancelled: false
    });
  };
  
  // Format date for display
  const formatDate = (date) => {
    if (!date || !isValid(new Date(date))) return '';
    return format(new Date(date), 'MMM d, yyyy');
  };
  
  return (
    <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
      <Box>
        {/* Basic Filters */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search work orders..."
              name="search"
              value={filters.search || ''}
              onChange={handleFilterChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: filters.search && (
                  <InputAdornment position="end">
                    <IconButton 
                      size="small" 
                      onClick={() => handleFilterChange({ target: { name: 'search', value: '' } })}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              size="small"
            />
          </Grid>
          
          <Grid item xs={6} md={2}>
            <FormControl size="small" fullWidth>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                name="status"
                value={filters.status || ''}
                label="Status"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All Statuses</MenuItem>
                {statusOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <FormControl size="small" fullWidth>
              <InputLabel id="priority-filter-label">Priority</InputLabel>
              <Select
                labelId="priority-filter-label"
                id="priority-filter"
                name="priority"
                value={filters.priority || ''}
                label="Priority"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All Priorities</MenuItem>
                {priorityOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <FormControl size="small" fullWidth>
              <InputLabel id="assigned-to-filter-label">Assigned To</InputLabel>
              <Select
                labelId="assigned-to-filter-label"
                id="assigned-to-filter"
                name="assignedTo"
                value={filters.assignedTo || ''}
                label="Assigned To"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All Staff</MenuItem>
                <MenuItem value="unassigned">Unassigned</MenuItem>
                {users.map(user => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <Box display="flex" justifyContent="flex-end">
              <Button
                color="primary"
                onClick={toggleExpanded}
                endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              >
                Advanced
                {getActiveFilterCount() > 0 && (
                  <Chip
                    label={getActiveFilterCount()}
                    color="primary"
                    size="small"
                    sx={{ ml: 1 }}
                  />
                )}
              </Button>
            </Box>
          </Grid>
        </Grid>
        
        {/* Advanced Filters */}
        <Collapse in={expanded}>
          <Box mt={3}>
            <Typography variant="subtitle2" gutterBottom>
              Advanced Filters
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Created After"
                    value={advancedFilters.createdAfter}
                    onChange={(date) => handleAdvancedFilterChange('createdAfter', date)}
                    renderInput={(params) => <TextField size="small" {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Created Before"
                    value={advancedFilters.createdBefore}
                    onChange={(date) => handleAdvancedFilterChange('createdBefore', date)}
                    renderInput={(params) => <TextField size="small" {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Due After"
                    value={advancedFilters.dueAfter}
                    onChange={(date) => handleAdvancedFilterChange('dueAfter', date)}
                    renderInput={(params) => <TextField size="small" {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Due Before"
                    value={advancedFilters.dueBefore}
                    onChange={(date) => handleAdvancedFilterChange('dueBefore', date)}
                    renderInput={(params) => <TextField size="small" {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl size="small" fullWidth>
                  <InputLabel id="location-filter-label">Location</InputLabel>
                  <Select
                    labelId="location-filter-label"
                    id="location-filter"
                    name="location"
                    value={filters.location || ''}
                    label="Location"
                    onChange={handleFilterChange}
                  >
                    <MenuItem value="">All Locations</MenuItem>
                    {locationOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={advancedFilters.includeCompleted}
                      onChange={handleSwitchChange}
                      name="includeCompleted"
                    />
                  }
                  label="Include Completed"
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={advancedFilters.includeCancelled}
                      onChange={handleSwitchChange}
                      name="includeCancelled"
                    />
                  }
                  label="Include Cancelled"
                />
              </Grid>
              
              <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<ClearIcon />}
                  onClick={handleClearAll}
                  disabled={getActiveFilterCount() === 0 && !filters.search}
                >
                  Clear All Filters
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
        
        {/* Active Filters Display */}
        {getActiveFilterCount() > 0 && (
          <Box mt={2} display="flex" flexWrap="wrap" gap={1}>
            {filters.status && (
              <Chip 
                label={`Status: ${filters.status}`}
                onDelete={() => handleFilterChange({ target: { name: 'status', value: '' } })}
                size="small"
              />
            )}
            
            {filters.priority && (
              <Chip 
                label={`Priority: ${filters.priority}`}
                onDelete={() => handleFilterChange({ target: { name: 'priority', value: '' } })}
                size="small"
              />
            )}
            
            {filters.location && (
              <Chip 
                label={`Location: ${filters.location}`}
                onDelete={() => handleFilterChange({ target: { name: 'location', value: '' } })}
                size="small"
              />
            )}
            
            {filters.assignedTo && (
              <Chip 
                label={`Assigned To: ${
                  filters.assignedTo === 'unassigned' 
                    ? 'Unassigned' 
                    : users.find(u => u._id === filters.assignedTo)?.name || filters.assignedTo
                }`}
                onDelete={() => handleFilterChange({ target: { name: 'assignedTo', value: '' } })}
                size="small"
              />
            )}
            
            {advancedFilters.createdAfter && (
              <Chip 
                label={`Created After: ${formatDate(advancedFilters.createdAfter)}`}
                onDelete={() => handleAdvancedFilterChange('createdAfter', null)}
                size="small"
              />
            )}
            
            {advancedFilters.createdBefore && (
              <Chip 
                label={`Created Before: ${formatDate(advancedFilters.createdBefore)}`}
                onDelete={() => handleAdvancedFilterChange('createdBefore', null)}
                size="small"
              />
            )}
            
            {advancedFilters.dueAfter && (
              <Chip 
                label={`Due After: ${formatDate(advancedFilters.dueAfter)}`}
                onDelete={() => handleAdvancedFilterChange('dueAfter', null)}
                size="small"
              />
            )}
            
            {advancedFilters.dueBefore && (
              <Chip 
                label={`Due Before: ${formatDate(advancedFilters.dueBefore)}`}
                onDelete={() => handleAdvancedFilterChange('dueBefore', null)}
                size="small"
              />
            )}
            
            {!advancedFilters.includeCompleted && (
              <Chip 
                label="Excluding Completed"
                onDelete={() => handleAdvancedFilterChange('includeCompleted', true)}
                size="small"
              />
            )}
            
            {advancedFilters.includeCancelled && (
              <Chip 
                label="Including Cancelled"
                onDelete={() => handleAdvancedFilterChange('includeCancelled', false)}
                size="small"
              />
            )}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default WorkOrderFilterBar;