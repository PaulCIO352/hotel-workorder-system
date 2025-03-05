import React from 'react';
import { 
  Box, Typography, Link, Divider, 
  useTheme, Container
} from '@mui/material';
import { 
  Hotel as HotelIcon
} from '@mui/icons-material';

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();
  
  return (
    <Box 
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900],
      }}
    >
      <Divider sx={{ mb: 3 }} />
      <Container maxWidth="lg">
        <Box 
          display="flex" 
          flexDirection={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
        >
          <Box display="flex" alignItems="center" mb={{ xs: 2, sm: 0 }}>
            <HotelIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="body2" color="text.secondary">
              Hotel Work Order System
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" align="center">
            © {currentYear} Your Hotel Name. All rights reserved.
          </Typography>
          
          <Box>
            <Link href="#" variant="body2" color="text.secondary" sx={{ mx: 1 }}>
              Privacy
            </Link>
            <Link href="#" variant="body2" color="text.secondary" sx={{ mx: 1 }}>
              Terms
            </Link>
            <Link href="#" variant="body2" color="text.secondary" sx={{ mx: 1 }}>
              Help
            </Link>
          </Box>
        </Box>
        
        <Typography 
          variant="caption" 
          color="text.secondary" 
          align="center"
          display="block"
          sx={{ mt: 2 }}
        >
          Version 1.0.0 • Built with React and Material UI
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;