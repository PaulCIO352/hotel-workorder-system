import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, IconButton,
  Tooltip, TextField, InputAdornment, Divider,
  Menu, MenuItem, ListItemIcon, ListItemText,
  Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, Button, CircularProgress, Alert,
  useTheme
} from '@mui/material';
import { 
  Person as PersonIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  VisibilityOff as VisibilityOffIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const UserList = ({ 
  users = [], 
  onEdit, 
  onDelete, 
  onToggleActive,
  loading = false
}) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Handle menu open
  const handleMenuOpen = (event, userId) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedUserId(userId);
  };
  
  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  // Handle edit user
  const handleEditUser = () => {
    handleMenuClose();
    if (onEdit) {
      onEdit(selectedUserId);
    }
  };
  
  // Handle view user profile
  const handleViewProfile = () => {
    // This would typically navigate to a user profile page
    handleMenuClose();
  };
  
  // Handle delete confirmation dialog
  const handleDeleteConfirm = () => {
    handleMenuClose();
    setDialogAction('delete');
    setConfirmDialogOpen(true);
  };
  
  // Handle toggle active confirmation dialog
  const handleToggleActiveConfirm = () => {
    handleMenuClose();
    setDialogAction('toggleActive');
    setConfirmDialogOpen(true);
  };
  
  // Close confirmation dialog
  const handleConfirmDialogClose = () => {
    setConfirmDialogOpen(false);
    setDialogAction(null);
  };
  
  // Execute confirmed action
  const handleConfirmAction = async () => {
    if (!dialogAction || !selectedUserId) return;
    
    setActionLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (dialogAction === 'delete') {
        await onDelete(selectedUserId);
        setSuccess('User deleted successfully');
      } else if (dialogAction === 'toggleActive') {
        const user = users.find(u => u._id === selectedUserId);
        if (user) {
          await onToggleActive(selectedUserId, !user.active);
          setSuccess(`User ${user.active ? 'deactivated' : 'activated'} successfully`);
        }
      }
    } catch (err) {
      console.error('Action failed:', err);
      setError(err.message || 'Action failed. Please try again.');
    } finally {
      setActionLoading(false);
      handleConfirmDialogClose();
      
      // Clear messages after 3 seconds
      setTimeout(() => {
        setError('');
        setSuccess('');
      }, 3000);
    }
  };
  
  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.username.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower) ||
      user.department.toLowerCase().includes(searchLower)
    );
  });
  
  // Role display mapping
  const roleDisplay = {
    admin: { label: 'Admin', color: 'error' },
    manager: { label: 'Manager', color: 'warning' },
    maintenance: { label: 'Maintenance', color: 'info' },
    housekeeping: { label: 'Housekeeping', color: 'success' },
    staff: { label: 'Staff', color: 'default' }
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center">
          <PersonIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">
            User Management
          </Typography>
        </Box>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      {/* Alert messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}
      
      {/* Search and filter bar */}
      <Box mb={3}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search users by name, email, role, etc."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="Filter">
                  <IconButton edge="end">
                    <FilterIcon />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            )
          }}
          size="small"
        />
      </Box>
      
      {/* Users table */}
      {filteredUsers.length === 0 ? (
        <Typography variant="body1" align="center" color="textSecondary" sx={{ my: 4 }}>
          No users found matching your search criteria.
        </Typography>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Department</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user._id} hover>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={roleDisplay[user.role]?.label || user.role} 
                      color={roleDisplay[user.role]?.color || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {user.department.charAt(0).toUpperCase() + user.department.slice(1)}
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={user.active ? 'Active' : 'Inactive'} 
                      color={user.active ? 'success' : 'default'}
                      size="small"
                      icon={user.active ? <CheckCircleIcon /> : <BlockIcon />}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      aria-label="more actions"
                      onClick={(e) => handleMenuOpen(e, user._id)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* User actions menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewProfile}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Profile</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleEditUser}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit User</ListItemText>
        </MenuItem>
        
        {selectedUserId && (
          <MenuItem onClick={handleToggleActiveConfirm}>
            <ListItemIcon>
              {users.find(u => u._id === selectedUserId)?.active ? (
                <VisibilityOffIcon fontSize="small" />
              ) : (
                <CheckCircleIcon fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText>
              {users.find(u => u._id === selectedUserId)?.active ? 'Deactivate' : 'Activate'} User
            </ListItemText>
          </MenuItem>
        )}
        
        <Divider />
        
        <MenuItem onClick={handleDeleteConfirm}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: theme.palette.error.main }}>
            Delete User
          </ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Confirmation dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleConfirmDialogClose}
      >
        <DialogTitle>
          {dialogAction === 'delete' 
            ? 'Delete User' 
            : users.find(u => u._id === selectedUserId)?.active 
              ? 'Deactivate User' 
              : 'Activate User'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dialogAction === 'delete'
              ? 'Are you sure you want to delete this user? This action cannot be undone.'
              : users.find(u => u._id === selectedUserId)?.active
                ? 'Are you sure you want to deactivate this user? They will no longer be able to log in.'
                : 'Are you sure you want to activate this user? They will be able to log in again.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmDialogClose} disabled={actionLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmAction} 
            color={dialogAction === 'delete' ? 'error' : 'primary'} 
            autoFocus
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default UserList;