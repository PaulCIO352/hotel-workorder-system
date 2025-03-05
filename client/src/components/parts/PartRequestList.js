import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, IconButton,
  Button, Menu, MenuItem, ListItemIcon, ListItemText,
  Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, TextField, useTheme, Collapse, Alert,
  Divider
} from '@mui/material';
import { 
  Inventory as InventoryIcon,
  MoreVert as MoreVertIcon,
  Check as CheckIcon,
  Close as CancelIcon,
  LocalShipping as ShippingIcon,
  Paid as PaidIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const PartRequestList = ({ 
  partsRequests = [], 
  onUpdateStatus, 
  onDeleteRequest,
  onEditRequest
}) => {
  const theme = useTheme();
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [alertInfo, setAlertInfo] = useState({ show: false, severity: 'success', message: '' });
  
  // Get the current selected request
  const getSelectedRequest = () => {
    return partsRequests.find(request => request._id === selectedRequestId);
  };
  
  // Open the actions menu
  const handleMenuOpen = (event, requestId) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedRequestId(requestId);
  };
  
  // Close the actions menu
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  // Handle status update confirmation
  const handleStatusUpdateConfirm = (newStatus) => {
    handleMenuClose();
    setConfirmAction({ type: 'status', value: newStatus });
    setConfirmDialogOpen(true);
  };
  
  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    handleMenuClose();
    setConfirmAction({ type: 'delete' });
    setConfirmDialogOpen(true);
  };
  
  // Handle edit action
  const handleEdit = () => {
    handleMenuClose();
    if (onEditRequest) {
      onEditRequest(selectedRequestId);
    }
  };
  
  // Handle confirmation dialog close
  const handleConfirmDialogClose = () => {
    setConfirmDialogOpen(false);
    setConfirmAction(null);
  };
  
  // Execute the confirmed action
  const handleConfirmAction = async () => {
    if (!confirmAction || !selectedRequestId) return;
    
    try {
      if (confirmAction.type === 'status') {
        await onUpdateStatus(selectedRequestId, confirmAction.value);
        setAlertInfo({
          show: true,
          severity: 'success',
          message: `Request status updated to ${confirmAction.value}`
        });
      } else if (confirmAction.type === 'delete') {
        await onDeleteRequest(selectedRequestId);
        setAlertInfo({
          show: true,
          severity: 'success',
          message: 'Request deleted successfully'
        });
      }
    } catch (error) {
      setAlertInfo({
        show: true,
        severity: 'error',
        message: `Error: ${error.message || 'Something went wrong'}`
      });
    } finally {
      handleConfirmDialogClose();
      
      // Auto hide alert after 5 seconds
      setTimeout(() => {
        setAlertInfo(prev => ({ ...prev, show: false }));
      }, 5000);
    }
  };
  
  // Toggle expanded row
  const handleToggleExpand = (requestId) => {
    setExpandedId(expandedId === requestId ? null : requestId);
  };
  
  // Get color for status chip
  const getStatusColor = (status) => {
    switch(status) {
      case 'requested': return 'primary';
      case 'approved': return 'warning';
      case 'ordered': return 'info';
      case 'received': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };
  
  // Get icon for status
  const getStatusIcon = (status) => {
    switch(status) {
      case 'requested': return <InventoryIcon fontSize="small" />;
      case 'approved': return <CheckIcon fontSize="small" />;
      case 'ordered': return <ShippingIcon fontSize="small" />;
      case 'received': return <PaidIcon fontSize="small" />;
      case 'cancelled': return <CancelIcon fontSize="small" />;
      default: return null;
    }
  };
  
  // Get available actions based on current status
  const getAvailableActions = (status) => {
    switch(status) {
      case 'requested':
        return [
          { label: 'Approve', action: 'approved', icon: <CheckIcon /> },
          { label: 'Cancel', action: 'cancelled', icon: <CancelIcon /> }
        ];
      case 'approved':
        return [
          { label: 'Mark as Ordered', action: 'ordered', icon: <ShippingIcon /> },
          { label: 'Cancel', action: 'cancelled', icon: <CancelIcon /> }
        ];
      case 'ordered':
        return [
          { label: 'Mark as Received', action: 'received', icon: <PaidIcon /> },
          { label: 'Cancel', action: 'cancelled', icon: <CancelIcon /> }
        ];
      case 'received':
        return [];
      case 'cancelled':
        return [
          { label: 'Reopen as Requested', action: 'requested', icon: <InventoryIcon /> }
        ];
      default:
        return [];
    }
  };
  
  if (partsRequests.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <InventoryIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">
            Parts Requests
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Typography variant="body1" align="center" color="textSecondary" sx={{ my: 4 }}>
          No parts requests found for this work order.
        </Typography>
      </Paper>
    );
  }
  
  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <InventoryIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6">
          Parts Requests
        </Typography>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      {/* Alert for status updates */}
      <Collapse in={alertInfo.show}>
        <Alert 
          severity={alertInfo.severity} 
          sx={{ mb: 2 }}
          onClose={() => setAlertInfo(prev => ({ ...prev, show: false }))}
        >
          {alertInfo.message}
        </Alert>
      </Collapse>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="30px"></TableCell>
              <TableCell>Part Name</TableCell>
              <TableCell align="center">Quantity</TableCell>
              <TableCell align="center">Est. Cost</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {partsRequests.map((request) => (
              <React.Fragment key={request._id}>
                <TableRow hover>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      onClick={() => handleToggleExpand(request._id)}
                    >
                      {expandedId === request._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </TableCell>
                  <TableCell>{request.name}</TableCell>
                  <TableCell align="center">{request.quantity}</TableCell>
                  <TableCell align="center">
                    <Typography
                      variant="body2"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <MoneyIcon 
                        fontSize="small" 
                        sx={{ 
                          color: theme.palette.success.main,
                          mr: 0.5,
                          opacity: 0.7
                        }} 
                      />
                      ${request.estimatedCost.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={request.status.toUpperCase()} 
                      color={getStatusColor(request.status)}
                      size="small"
                      icon={getStatusIcon(request.status)}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      aria-label="more actions"
                      onClick={(e) => handleMenuOpen(e, request._id)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
                
                {/* Expanded row for details */}
                <TableRow>
                  <TableCell 
                    colSpan={6} 
                    sx={{ 
                      p: 0, 
                      borderBottom: expandedId === request._id ? `1px solid ${theme.palette.divider}` : 'none'
                    }}
                  >
                    <Collapse in={expandedId === request._id} timeout="auto" unmountOnExit>
                      <Box p={3} bgcolor={theme.palette.action.hover}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" gutterBottom>
                              Description
                            </Typography>
                            <Typography variant="body2" paragraph>
                              {request.description || 'No description provided'}
                            </Typography>
                            
                            {request.notes && (
                              <>
                                <Typography variant="subtitle2" gutterBottom>
                                  Additional Notes
                                </Typography>
                                <Typography variant="body2" paragraph>
                                  {request.notes}
                                </Typography>
                              </>
                            )}
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" gutterBottom>
                              Request Details
                            </Typography>
                            <Typography variant="body2">
                              Created: {format(new Date(request.created), 'MMM d, yyyy')}
                            </Typography>
                            {request.updated && (
                              <Typography variant="body2">
                                Last Updated: {format(new Date(request.updated), 'MMM d, yyyy')}
                              </Typography>
                            )}
                            <Typography variant="body2">
                              Total Cost: ${(request.estimatedCost * request.quantity).toFixed(2)}
                            </Typography>
                            
                            {/* Status action buttons */}
                            {getAvailableActions(request.status).length > 0 && (
                              <Box mt={2} display="flex" gap={1} flexWrap="wrap">
                                {getAvailableActions(request.status).map((action) => (
                                  <Button
                                    key={action.action}
                                    size="small"
                                    variant="outlined"
                                    startIcon={action.icon}
                                    onClick={() => handleStatusUpdateConfirm(action.action)}
                                    color={action.action === 'cancelled' ? 'error' : 'primary'}
                                  >
                                    {action.label}
                                  </Button>
                                ))}
                              </Box>
                            )}
                          </Grid>
                        </Grid>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        {selectedRequestId && getSelectedRequest() && (
          <>
            <MenuItem onClick={handleEdit}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit Request</ListItemText>
            </MenuItem>
            
            {getAvailableActions(getSelectedRequest().status).map((action) => (
              <MenuItem
                key={action.action}
                onClick={() => handleStatusUpdateConfirm(action.action)}
              >
                <ListItemIcon>
                  {action.icon}
                </ListItemIcon>
                <ListItemText>{action.label}</ListItemText>
              </MenuItem>
            ))}
            
            <Divider />
            
            <MenuItem onClick={handleDeleteConfirm}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText sx={{ color: theme.palette.error.main }}>
                Delete Request
              </ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleConfirmDialogClose}
      >
        <DialogTitle>
          {confirmAction?.type === 'status'
            ? `Update Status to ${confirmAction.value.toUpperCase()}`
            : 'Delete Part Request'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmAction?.type === 'status'
              ? `Are you sure you want to change the status of this part request to "${confirmAction.value}"?`
              : 'Are you sure you want to delete this part request? This action cannot be undone.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmDialogClose} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmAction} 
            color={confirmAction?.type === 'delete' ? 'error' : 'primary'} 
            autoFocus
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default PartRequestList;