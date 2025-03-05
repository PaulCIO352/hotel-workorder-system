import React from 'react';
import { 
  Box, CircularProgress, Typography, 
  Backdrop, LinearProgress, Paper 
} from '@mui/material';

/**
 * A versatile loading spinner component with multiple display modes
 * 
 * @param {Object} props
 * @param {boolean} props.loading - Whether the spinner is visible
 * @param {string} props.type - Type of spinner ('inline', 'fullscreen', 'overlay', 'linear')
 * @param {string} props.size - Size of the spinner ('small', 'medium', 'large')
 * @param {string} props.color - Color of the spinner
 * @param {string} props.message - Optional message to display with the spinner
 * @param {Object} props.sx - Additional styles to apply
 */
const LoadingSpinner = ({ 
  loading = true, 
  type = 'inline', 
  size = 'medium', 
  color = 'primary',
  message = 'Loading...',
  sx = {}
}) => {
  // Early return if not loading
  if (!loading) return null;
  
  // Map size prop to actual size values
  const sizeMap = {
    small: 24,
    medium: 40,
    large: 60
  };
  
  const spinnerSize = sizeMap[size] || sizeMap.medium;

  // Inline spinner (default)
  if (type === 'inline') {
    return (
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="center" 
        flexDirection="column"
        py={2}
        sx={sx}
      >
        <CircularProgress size={spinnerSize} color={color} />
        {message && (
          <Typography variant="body2" color="textSecondary" mt={1}>
            {message}
          </Typography>
        )}
      </Box>
    );
  }
  
  // Fullscreen spinner with backdrop
  if (type === 'fullscreen') {
    return (
      <Backdrop
        open={loading}
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          ...sx 
        }}
      >
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center"
        >
          <CircularProgress size={spinnerSize} color={color} />
          {message && (
            <Typography variant="body1" color="white" mt={2}>
              {message}
            </Typography>
          )}
        </Box>
      </Backdrop>
    );
  }
  
  // Overlay spinner with container
  if (type === 'overlay') {
    return (
      <Box 
        sx={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          zIndex: 10,
          ...sx
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            py: 3, 
            px: 4, 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <CircularProgress size={spinnerSize} color={color} />
          {message && (
            <Typography variant="body1" color="textSecondary" mt={2}>
              {message}
            </Typography>
          )}
        </Paper>
      </Box>
    );
  }
  
  // Linear progress bar
  if (type === 'linear') {
    return (
      <Box sx={{ width: '100%', ...sx }}>
        <LinearProgress color={color} />
        {message && (
          <Typography variant="caption" color="textSecondary" mt={0.5} display="block">
            {message}
          </Typography>
        )}
      </Box>
    );
  }
  
  // Default fallback
  return (
    <CircularProgress size={spinnerSize} color={color} />
  );
};

export default LoadingSpinner;