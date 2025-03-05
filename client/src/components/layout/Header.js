import React, { useState } from 'react';
import { 
  AppBar, Toolbar, Typography, Button, IconButton, 
  Box, Menu, MenuItem, Avatar, Tooltip, Divider,
  Badge, useTheme, useMediaQuery
} from '@mui/material';
import { 
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Logout as LogoutIcon,
  Hotel as HotelIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';

const Header = ({ handleDrawerToggle, darkMode, toggleDarkMode }) => {
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotifications, setAnchorElNotifications] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  
  // Mock user data - in a real app, this would come from authentication context
  const user = {
    name: 'Admin User',
    role: 'Administrator',
    avatar: null
  };
  
  // Mock notifications - in a real app, these would come from an API
  const notifications = [
    { id: 1, message: 'New work order created', read: false, time: '10 minutes ago' },
    { id: 2, message: 'Work order #1234 updated', read: false, time: '1 hour ago' },
    { id: 3, message: 'Part request approved', read: true, time: 'Yesterday' }
  ];
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  
  const handleOpenNotifications = (event) => {
    setAnchorElNotifications(event.currentTarget);
  };
  
  const handleCloseNotifications = () => {
    setAnchorElNotifications(null);
  };
  
  const handleLogout = () => {
    // In a real app, this would call your logout function
    // For now, we'll just redirect to login
    navigate('/login');
    handleCloseUserMenu();
  };
  
  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: theme.palette.primary.main
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        
        <HotelIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
        <Typography
          variant="h6"
          noWrap
          component={Link}
          to="/"
          sx={{
            mr: 2,
            display: { xs: 'none', md: 'flex' },
            fontWeight: 700,
            color: 'inherit',
            textDecoration: 'none',
          }}
        >
          Hotel Work Order System
        </Typography>
        
        <Typography
          variant="h6"
          noWrap
          component={Link}
          to="/"
          sx={{
            mr: 2,
            display: { xs: 'flex', md: 'none' },
            flexGrow: 1,
            fontWeight: 700,
            color: 'inherit',
            textDecoration: 'none',
          }}
        >
          HWOS
        </Typography>
        
        <Box sx={{ flexGrow: 1 }} />
        
        {/* Right side toolbar items */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Theme toggle */}
          {toggleDarkMode && (
            <Tooltip title={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
              <IconButton 
                color="inherit" 
                onClick={toggleDarkMode}
                size="large"
              >
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
          )}
          
          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              color="inherit"
              onClick={handleOpenNotifications}
              size="large"
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          {/* Settings shortcut */}
          {!isMobile && (
            <Tooltip title="Settings">
              <IconButton 
                color="inherit"
                component={Link}
                to="/settings"
                size="large"
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          )}
          
          {/* User menu */}
          <Box sx={{ ml: 1 }}>
            <Tooltip title="Account settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                {user.avatar ? (
                  <Avatar alt={user.name} src={user.avatar} />
                ) : (
                  <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                    {user.name.charAt(0)}
                  </Avatar>
                )}
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle1">{user.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.role}
                </Typography>
              </Box>
              <Divider />
              <MenuItem component={Link} to="/profile" onClick={handleCloseUserMenu}>
                <AccountIcon sx={{ mr: 2 }} />
                My Profile
              </MenuItem>
              <MenuItem component={Link} to="/settings" onClick={handleCloseUserMenu}>
                <SettingsIcon sx={{ mr: 2 }} />
                Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 2 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Toolbar>
      
      {/* Notifications Menu */}
      <Menu
        sx={{ mt: '45px' }}
        id="notifications-menu"
        anchorEl={anchorElNotifications}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorElNotifications)}
        onClose={handleCloseNotifications}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1">Notifications</Typography>
        </Box>
        <Divider />
        {notifications.length === 0 ? (
          <MenuItem>
            <Typography variant="body2">No notifications</Typography>
          </MenuItem>
        ) : (
          notifications.map((notification) => (
            <MenuItem 
              key={notification.id}
              onClick={handleCloseNotifications}
              sx={{ 
                borderLeft: notification.read ? 'none' : `4px solid ${theme.palette.primary.main}`,
                backgroundColor: notification.read ? 'inherit' : theme.palette.action.hover
              }}
            >
              <Box>
                <Typography variant="body2">
                  {notification.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {notification.time}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
        <Divider />
        <MenuItem 
          onClick={handleCloseNotifications}
          component={Link}
          to="/notifications"
          sx={{ justifyContent: 'center' }}
        >
          <Typography variant="body2" color="primary">
            View All Notifications
          </Typography>
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Header;