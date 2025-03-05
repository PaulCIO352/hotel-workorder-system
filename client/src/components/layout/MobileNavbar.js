import React from 'react';
import { 
  Paper, BottomNavigation, BottomNavigationAction, 
  Badge, Tooltip, useTheme
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Assignment as WorkOrderIcon,
  Assessment as AnalyticsIcon,
  Add as AddIcon,
  Inventory as PartsIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

const MobileNavbar = ({ openDrawer }) => {
  const location = useLocation();
  const theme = useTheme();
  
  // Determine which navigation item is active
  const getActiveValue = () => {
    const path = location.pathname;
    
    if (path === '/') return 'dashboard';
    if (path.startsWith('/workorders')) return 'workorders';
    if (path.startsWith('/analytics')) return 'analytics';
    if (path.startsWith('/parts')) return 'parts';
    
    return '';
  };
  
  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0,
        zIndex: theme.zIndex.appBar,
        borderTop: `1px solid ${theme.palette.divider}`
      }} 
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={getActiveValue()}
      >
        <BottomNavigationAction 
          label="Dashboard" 
          value="dashboard"
          icon={<DashboardIcon />} 
          component={Link}
          to="/"
        />
        
        <BottomNavigationAction 
          label="Work Orders" 
          value="workorders"
          icon={
            <Badge color="error" badgeContent={0} showZero={false}>
              <WorkOrderIcon />
            </Badge>
          } 
          component={Link}
          to="/workorders"
        />
        
        <BottomNavigationAction 
          label="New"
          value="new"
          icon={
            <Tooltip title="Create New Work Order">
              <AddIcon />
            </Tooltip>
          }
          component={Link}
          to="/workorders/new"
          sx={{
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.75rem'
            },
            '& .MuiSvgIcon-root': {
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              borderRadius: '50%',
              padding: '4px',
              fontSize: '2rem',
              transform: 'translateY(-8px)',
              transition: 'all 0.2s ease',
              boxShadow: theme.shadows[2],
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
                transform: 'translateY(-10px)'
              }
            }
          }}
        />
        
        <BottomNavigationAction 
          label="Parts" 
          value="parts"
          icon={<PartsIcon />} 
          component={Link}
          to="/parts"
        />
        
        <BottomNavigationAction 
          label="More"
          value="more"
          icon={<MenuIcon />}
          onClick={openDrawer}
        />
      </BottomNavigation>
    </Paper>
  );
};

export default MobileNavbar;