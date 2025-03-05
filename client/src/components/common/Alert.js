import React, { useState, useEffect } from 'react';
import { 
  Alert as MuiAlert, 
  AlertTitle, 
  Snackbar, 
  IconButton,
  Collapse
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

/**
 * Custom Alert component that can be used as a standalone alert or as a snackbar notification
 * 
 * @param {Object} props
 * @param {string} props.severity - The severity of the alert ('error', 'warning', 'info', 'success')
 * @param {string} props.title - Optional title for the alert
 * @param {string|React.ReactNode} props.message - The alert message
 * @param {boolean} props.open - Whether the alert is visible (for snackbar mode)
 * @param {function} props.onClose - Function to call when the alert is closed
 * @param {boolean} props.isSnackbar - Whether to display as a snackbar
 * @param {number} props.autoHideDuration - Time in ms before auto-hiding (for snackbar)
 * @param {boolean} props.showIcon - Whether to show the severity icon
 * @param {Object} props.sx - Additional styles to apply
 */
const Alert = ({ 
  severity = 'info', 
  title,
  message, 
  open = true, 
  onClose, 
  isSnackbar = false,
  autoHideDuration = 6000,
  showIcon = true,
  sx = {}
}) => {
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    setVisible(open);
  }, [open]);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    
    setVisible(false);
    
    if (onClose) {
      onClose();
    }
  };

  const alertContent = (
    <MuiAlert
      severity={severity}
      variant="filled"
      iconMapping={{
        error: showIcon ? undefined : null,
        warning: showIcon ? undefined : null,
        info: showIcon ? undefined : null,
        success: showIcon ? undefined : null,
      }}
      action={
        <IconButton
          aria-label="close"
          color="inherit"
          size="small"
          onClick={handleClose}
        >
          <CloseIcon fontSize="inherit" />
        </IconButton>
      }
      sx={sx}
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      {message}
    </MuiAlert>
  );

  // For snackbar mode
  if (isSnackbar) {
    return (
      <Snackbar
        open={visible}
        autoHideDuration={autoHideDuration}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {alertContent}
      </Snackbar>
    );
  }

  // For regular inline alert
  return (
    <Collapse in={visible}>
      {alertContent}
    </Collapse>
  );
};

export default Alert;