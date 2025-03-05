import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, IconButton,
  TextField, MenuItem, FormControl, InputLabel,
  Select, Grid, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { 
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';

// API
import { workOrderAPI, userAPI } from '../utils/api';

// Components
import WorkOrderForm from '../components/workOrders/WorkOrderForm';

const WorkOrders = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assignedTo: '',
    search: ''
  });
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check URL query params for initial filters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    const statusParam = params.get('status');
    const priorityParam = params.get('priority');
    const assignedToParam = params.get('assignedTo');
    const searchParam = params.get('search');
    
    if (statusParam || priorityParam || assignedToParam || searchParam) {
      setFilters({
        status: statusParam || '',
        priority: priorityParam || '',
        assignedTo: assignedToParam || '',
        search: searchParam || ''
      });
    }
  }, [location.search]);
  
  // Fetch work orders and users on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Build filter params
        const filterParams = {};
        if (filters.status) filterParams.status = filters.status;
        if (filters.priority) filterParams.priority = filters.priority;
        if (filters.assignedTo) filterParams.assignedTo = filters.assignedTo;
        if (filters.search) filterParams.search = filters.search;
        
        // Fetch work orders with filters
        const workOrdersRes = await workOrderAPI.getAll(filterParams);
        setWorkOrders(workOrdersRes.data);
        
        // Fetch users for assignment dropdown
        const usersRes = await userAPI.getAll();
        setUsers(usersRes.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch data', err);
        setError('Failed to load work orders');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [filters]);
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handleWorkOrderAdded = (newWorkOrder) => {
    setWorkOrders([newWorkOrder, ...workOrders]);
    setOpenForm(false);
  };
  
  const handleDeleteWorkOrder = async (id) => {
    if (window.confirm('Are you sure you want to delete this work order?')) {
      try {
        await workOrderAPI.delete(id);
        setWorkOrders(workOrders.filter(wo => wo._id !== id));
      } catch (err) {
        console.error('Failed to delete work order', err);
        alert('Failed to delete work order');
      }
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
  
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'low': return 'success';
      case 'medium': return 'info';
      case 'high': return 'warning';
      case 'urgent': return 'error';
      default: return 'default';
    }
  };
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Work Orders
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenForm(true)}
        >
          New Work Order
        </Button>
      </Box>
      
      {/* Filter Bar */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              name="search"
              label="Search"
              value={filters.search}
              onChange={handleFilterChange}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
              }}
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                name="status"
                value={filters.status}
                label="Status"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="paused">Paused</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="priority-filter-label">Priority</InputLabel>
              <Select
                labelId="priority-filter-label"
                id="priority-filter"
                name="priority"
                value={filters.priority}
                label="Priority"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All Priorities</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="assigned-filter-label">Assigned To</InputLabel>
              <Select
                labelId="assigned-filter-label"
                id="assigned-filter"
                name="assignedTo"
                value={filters.assignedTo}
                label="Assigned To"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All Staff</MenuItem>
                {users.map(user => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        workOrders.length === 0 ? (
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No work orders found
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {filters.status || filters.priority || filters.assignedTo || filters.search 
                ? 'Try changing your filters or search term'
                : 'Create your first work order to get started'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenForm(true)}
            >
              Create Work Order
            </Button>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {workOrders.map((workOrder) => (
                  <TableRow key={workOrder._id}>
                    <TableCell>
                      {workOrder.title}
                      {workOrder.isRecurring && (
                        <Chip 
                          label="Recurring" 
                          color="secondary" 
                          size="small" 
                          sx={{ ml: 1 }}
                        />
                      )}
                    </TableCell>
                    <TableCell>{workOrder.location}</TableCell>
                    <TableCell>
                      <Chip 
                        label={workOrder.status.toUpperCase()} 
                        color={getStatusColor(workOrder.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={workOrder.priority.toUpperCase()} 
                        color={getPriorityColor(workOrder.priority)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {format(new Date(workOrder.created), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      {workOrder.assignedTo ? workOrder.assignedTo.name : 'Unassigned'}
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        color="primary" 
                        component={Link} 
                        to={`/workorders/${workOrder._id}`}
                        size="small"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        color="secondary"
                        component={Link} 
                        to={`/workorders/${workOrder._id}/edit`}
                        size="small"
                        sx={{ mx: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        color="error"
                        onClick={() => handleDeleteWorkOrder(workOrder._id)}
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )
      )}
      
      {/* Work Order Form Dialog */}
      <Dialog 
        open={openForm} 
        onClose={() => setOpenForm(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Work Order</DialogTitle>
        <DialogContent>
          <WorkOrderForm 
            onWorkOrderAdded={handleWorkOrderAdded}
            users={users}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkOrders;