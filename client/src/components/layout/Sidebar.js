import React from 'react';
import { 
  Drawer, List, ListItem, ListItemButton, ListItemIcon, 
  ListItemText, Divider, Box, Toolbar, Collapse,
  useTheme, Tooltip
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Assignment as WorkOrderIcon,
  Person as UserIcon,
  Assessment as AnalyticsIcon,
  Inventory as PartsIcon,
  Event as RecurringIcon,
  Settings as SettingsIcon,
  ExpandLess, ExpandMore,
  Build as MaintenanceIcon,
  CleaningServices as HousekeepingIcon,
  LocalDining as FoodServiceIcon,
  RecordVoiceOver as ConciergeIcon,
  ReceiptLong as ReportsIcon,
  Storage as InventoryIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

// Sidebar width
const DRAWER_WIDTH = 240;

const Sidebar = ({ open, onClose, variant = "permanent" }) => {
  const theme = useTheme();
  const location = useLocation();
  const [openSubMenu, setOpenSubMenu] = React.useState('');
  
  // Define main navigation items
  const mainNavItems = [
    { 
      text: 'Dashboard', 
      icon: <DashboardIcon />, 
      path: '/' 
    },
    { 
      text: 'Work Orders', 
      icon: <WorkOrderIcon />, 
      path: '/workorders',
      hasSubMenu: true,
      subMenuKey: 'workorders',
      subItems: [
        { text: 'Maintenance', icon: <MaintenanceIcon />, path: '/workorders?department=maintenance' },
        { text: 'Housekeeping', icon: <HousekeepingIcon />, path: '/workorders?department=housekeeping' },
        { text: 'Food Service', icon: <FoodServiceIcon />, path: '/workorders?department=food-service' },
        { text: 'Concierge', icon: <ConciergeIcon />, path: '/workorders?department=concierge' },
      ]
    },
    { 
      text: 'Parts Requests', 
      icon: <PartsIcon />, 
      path: '/parts' 
    },
    { 
      text: 'Recurring Tasks', 
      icon: <RecurringIcon />, 
      path: '/recurring' 
    },
    { 
      text: 'Analytics', 
      icon: <AnalyticsIcon />, 
      path: '/analytics',
      hasSubMenu: true,
      subMenuKey: 'analytics',
      subItems: [
        { text: 'Dashboard', icon: <AnalyticsIcon />, path: '/analytics' },
        { text: 'Reports', icon: <ReportsIcon />, path: '/analytics/reports' },
      ]
    },
  ];
  
  // Define admin navigation items
  const adminNavItems = [
    { 
      text: 'Users', 
      icon: <UserIcon />, 
      path: '/users' 
    },
    { 
      text: 'Inventory', 
      icon: <InventoryIcon />, 
      path: '/inventory' 
    },
    { 
      text: 'Settings', 
      icon: <SettingsIcon />, 
      path: '/settings' 
    },
  ];
  
  // Helper function to check if a path is active
  const isActive = (path) => {
    // Exact match for dashboard
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    // For other paths, check if location starts with the path
    // This keeps parent items highlighted when on sub-pages
    return path !== '/' && location.pathname.startsWith(path);
  };
  
  // Toggle submenu open/closed
  const handleSubMenuToggle = (key) => {
    setOpenSubMenu(openSubMenu === key ? '' : key);
  };
  
  // Handle item click (for mobile drawer)
  const handleItemClick = () => {
    if (variant === 'temporary' && onClose) {
      onClose();
    }
  };
  
  const renderNavItems = (items) => (
    <>
      {items.map((item) => (
        <React.Fragment key={item.text}>
          <ListItem disablePadding>
            {item.hasSubMenu ? (
              // Item with submenu
              <ListItemButton 
                onClick={() => handleSubMenuToggle(item.subMenuKey)}
                selected={isActive(item.path)}
                sx={{
                  pl: 2,
                  py: 1,
                  '&.Mui-selected': {
                    backgroundColor: 'action.selected',
                  }
                }}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
                {openSubMenu === item.subMenuKey ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            ) : (
              // Regular item
              <ListItemButton 
                component={Link} 
                to={item.path}
                selected={isActive(item.path)}
                onClick={handleItemClick}
                sx={{
                  pl: 2,
                  py: 1,
                  '&.Mui-selected': {
                    backgroundColor: 'action.selected',
                  }
                }}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            )}
          </ListItem>
          
          {/* Render submenu if applicable */}
          {item.hasSubMenu && (
            <Collapse in={openSubMenu === item.subMenuKey} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {item.subItems.map((subItem) => (
                  <ListItemButton 
                    key={subItem.text}
                    component={Link} 
                    to={subItem.path}
                    selected={location.pathname === subItem.path}
                    onClick={handleItemClick}
                    sx={{ pl: 4 }}
                  >
                    <ListItemIcon>
                      {subItem.icon}
                    </ListItemIcon>
                    <ListItemText primary={subItem.text} />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
          )}
        </React.Fragment>
      ))}
    </>
  );
  
  const drawerContent = (
    <>
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List component="nav">
          {renderNavItems(mainNavItems)}
        </List>
        
        <Divider sx={{ my: 1 }} />
        
        <List component="nav">
          {renderNavItems(adminNavItems)}
        </List>
        
        <Divider sx={{ my: 1 }} />
        
        {/* Help and support */}
        <List component="nav">
          <ListItemButton 
            component={Link} 
            to="/help"
            onClick={handleItemClick}
          >
            <ListItemIcon>
              <HelpIcon />
            </ListItemIcon>
            <ListItemText primary="Help & Support" />
          </ListItemButton>
        </List>
      </Box>
    </>
  );
  
  // Render permanent drawer for desktop
  if (variant === 'permanent') {
    return (
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: DRAWER_WIDTH, 
            boxSizing: 'border-box',
            backgroundColor: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }
  
  // Render temporary drawer for mobile
  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better performance on mobile
      }}
      sx={{
        display: { xs: 'block', sm: 'none' },
        '& .MuiDrawer-paper': { 
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.paper
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;