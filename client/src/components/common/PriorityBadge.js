import React from 'react';
import { Chip, Tooltip, Box } from '@mui/material';
import { 
  FiberManualRecord as CircleIcon,
  ArrowUpward as HighIcon,
  ArrowDownward as LowIcon,
  Remove as MediumIcon,
  PriorityHigh as UrgentIcon
} from '@mui/icons-material';

/**
 * Component to display work order priority with consistent styling
 * 
 * @param {Object} props
 * @param {string} props.priority - Priority level ('low', 'medium', 'high', 'urgent')
 * @param {string} props.size - Size of the badge ('small', 'medium')
 * @param {string} props.variant - Variant of the chip ('filled', 'outlined')
 * @param {boolean} props.showIcon - Whether to show the priority icon
 * @param {boolean} props.showLabel - Whether to show the priority text label
 * @param {boolean} props.uppercase - Whether to display text in uppercase
 * @param {Object} props.sx - Additional styles to apply
 */
const PriorityBadge = ({ 
  priority, 
  size = 'small', 
  variant = 'filled', 
  showIcon = true,
  showLabel = true,
  uppercase = true,
  sx = {}
}) => {
  // Default to medium if priority is invalid
  const normalizedPriority = ['low', 'medium', 'high', 'urgent'].includes(priority?.toLowerCase()) 
    ? priority.toLowerCase() 
    : 'medium';
  
  // Define colors and icons for each priority level
  const priorityConfig = {
    low: {
      color: 'success',
      icon: <LowIcon fontSize="inherit" />,
      label: 'Low',
      description: 'Low priority - can be addressed when convenient'
    },
    medium: {
      color: 'info',
      icon: <MediumIcon fontSize="inherit" />,
      label: 'Medium',
      description: 'Medium priority - should be addressed in normal operations'
    },
    high: {
      color: 'warning',
      icon: <HighIcon fontSize="inherit" />,
      label: 'High',
      description: 'High priority - requires prompt attention'
    },
    urgent: {
      color: 'error',
      icon: <UrgentIcon fontSize="inherit" />,
      label: 'Urgent',
      description: 'Urgent priority - requires immediate attention'
    }
  };
  
  const config = priorityConfig[normalizedPriority];
  
  // Format label text based on uppercase prop
  const formattedLabel = uppercase 
    ? config.label.toUpperCase() 
    : config.label;
  
  // For dot-only display (no label, just icon)
  if (showIcon && !showLabel) {
    return (
      <Tooltip title={config.description}>
        <Box 
          component="span" 
          sx={{ 
            display: 'inline-block',
            color: `${config.color}.main`,
            ...sx
          }}
        >
          <CircleIcon
            fontSize={size === 'small' ? 'small' : 'medium'}
          />
        </Box>
      </Tooltip>
    );
  }
  
  // For standard chip display
  return (
    <Tooltip title={config.description}>
      <Chip
        label={showLabel ? formattedLabel : ''}
        color={config.color}
        size={size}
        variant={variant}
        icon={showIcon ? config.icon : undefined}
        sx={sx}
      />
    </Tooltip>
  );
};

export default PriorityBadge;