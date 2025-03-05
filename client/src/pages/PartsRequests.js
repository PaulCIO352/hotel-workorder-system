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
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

// API
import { partsAPI, workOrderAPI, userAPI } from '../utils/api';

// Components (to be created)
import PartRequestForm from '../components/parts/PartRequestForm';

const PartsRequests = () => {
  const [partsRequests, setPartsRequests] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [editRequestId, setEditRequestId] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    workOrderId: '',
    search: ''
  });
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Build filter params
        const filterParams = {};
        if (filters.status) filterParams.status = filters.status;
        if (filters.workOrderId) filterParams.workOrderId = filters.workOrderId;
        if (filters.search) filterParams.search = filters.search;
        
        // Fetch parts requests with filters
        const partsRes = await partsAPI.getAll(filterParams);
        setPartsRequests(partsRes.data);
        
        // Fetch work orders for dropdown
        const workOrdersRes = await workOrderAPI.getAll();
        setWorkOrders(workOrdersRes.data);
        
        // Fetch users for reference
        const usersRes = await userAPI.getAll();
        setUsers(usersRes.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch data', err);
        setError('Failed to load parts requests');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [filters]);
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handleOpenForm = (requestId = null) => {
    setEditRequestId(requestId);
    setOpenForm(true);
  };
  
  const handleCloseForm = () => {
    setOpenForm(false);
    setEditRequestId(null);
  };
  
  const handlePartRequestAdded = (newPartRequest) => {
    setPartsRequests([newPartRequest, ...partsRequests]);
    handleCloseForm();
  };
  
  const handlePartRequestUpdated = (updatedPartRequest) => {
    setPartsRequests(partsRequests.map(request => 
      request._id === updatedPartRequest._id ? updatedPartRequest : request
    ));
    handleCloseForm();
  };
  
  const handleDeletePartRequest = async (id) => {
    if (window.confirm('Are you sure you want to delete this parts request?')) {
      try {
        await partsAPI.delete(id);
        setPartsRequests(partsRequests.filter(request => request._id !== id));
      } catch (err) {
        console.error('Failed to delete parts request', err);
        alert('Failed to delete parts request');
      }
    }
  };
  
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const partRequest = partsRequests.find(p => p._id === id);
      if (!partRequest) return;
      
      const updatedPartRequest = await partsAPI.update(id, {
        ...partRequest,
        status: newStatus
      });
      
      setPartsRequests(partsRequests.map(request => 
        request._id === id ? updatedPartRequest.data : request
      ));
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update status');
    }
  };
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'requested': return 'info';
      case 'approved': return 'warning';
      case 'ordered': return 'secondary';
      case 'received': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };
  
  // Function to find user name by ID
  const getUserName = (userId) => {
    const user = users.find(u => u._id === userId);
    return user ? user.name : 'Unknown';
  };
  
  // Function to find work order title by ID
  const getWorkOrderTitle = (workOrderId) => {
    const workOrder = workOrders.find(wo => wo._id === workOrderId);
    return workOrder ? workOrder.title : 'Unknown';
  };
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Parts Requests
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
        >
          New Parts Request
        </Button>
      </Box>
      
      {/* Filter Bar */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              name="search"
              label="Search Parts"
              value={filters.search}
              onChange={handleFilterChange}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
              }}
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
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
                <MenuItem value="requested">Requested</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="ordered">Ordered</MenuItem>
                <MenuItem value="received">Received</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="workorder-filter-label">Work Order</InputLabel>
              <Select
                labelId="workorder-filter-label"
                id="workorder-filter"
                name="workOrderId"
                value={filters.workOrderId}
                label="Work Order"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All Work Orders</MenuItem>
                {workOrders.map(workOrder => (
                  <MenuItem key={workOrder._id} value={workOrder._id}>
                    {workOrder.title}
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
        partsRequests.length === 0 ? (
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No parts requests found
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {filters.status || filters.workOrderId || filters.search 
                ? 'Try changing your filters or search term'
                : 'Create your first parts request to get started'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenForm()}
            >
              Create Parts Request
            </Button>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Part Name</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Work Order</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Requested By</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Est. Cost</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {partsRequests.map((request) => (
                  <TableRow key={request._id}>
                    <TableCell>{request.name}</TableCell>
                    <TableCell>{request.quantity}</TableCell>
                    <TableCell>
                      <Link to={`/workorders/${request.workOrderId}`}>
                        {getWorkOrderTitle(request.workOrderId)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={request.status.toUpperCase()} 
                        color={getStatusColor(request.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{getUserName(request.requestedBy)}</TableCell>
                    <TableCell>
                      {format(new Date(request.created), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      ${request.estimatedCost.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <IconButton 
                          color="primary" 
                          onClick={() => handleOpenForm(request._id)}
                          size="small"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          color="error"
                          onClick={() => handleDeletePartRequest(request._id)}
                          size="small"
                          sx={{ mx: 1 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                        
                        {request.status === 'requested' && (
                          <IconButton 
                            color="success"
                            onClick={() => handleUpdateStatus(request._id, 'approved')}
                            size="small"
                            title="Approve"
                          >
                            <CheckIcon fontSize="small" />
                          </IconButton>
                        )}
                        
                        {(request.status === 'requested' || request.status === 'approved') && (
                          <IconButton 
                            color="error"
                            onClick={() => handleUpdateStatus(request._id, 'cancelled')}
                            size="small"
                            title="Cancel"
                            sx={{ ml: request.status !== 'requested' ? 1 : 0 }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )
      )}
      
      {/* Parts Request Form Dialog */}
      <Dialog 
        open={openForm} 
        onClose={handleCloseForm}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editRequestId ? 'Edit Parts Request' : 'Create New Parts Request'}
        </DialogTitle>
        <DialogContent>
          <PartRequestForm 
            onAddPartRequest={handlePartRequestAdded}
            onUpdatePartRequest={handlePartRequestUpdated}
            editRequestId={editRequestId}
            workOrders={workOrders}
            initialPartRequest={editRequestId ? partsRequests.find(p => p._id === editRequestId) : null}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PartsRequests;