import React, { useState } from 'react';
import { 
  Box, Typography, Paper, TextField, Button, 
  Alert, Container, Avatar
} from '@mui/material';
import { 
  LockOutlined as LockIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// This is a simplified login without actual authentication
// In a real implementation, you would connect this to your backend
const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Form validation
    if (!formData.username || !formData.password) {
      setError('Please enter both username and password');
      return;
    }
    
    setLoading(true);
    
    try {
      // Placeholder for actual authentication logic
      // In a real app, you would call your auth API here
      
      // For now, we'll simulate a successful login
      setTimeout(() => {
        // Store user info in localStorage (temporary approach)
        // In a production app, you would use proper authentication with JWT or similar
        localStorage.setItem('user', JSON.stringify({
          id: '12345',
          username: formData.username,
          name: 'Demo User',
          role: 'admin'
        }));
        
        // Redirect to homepage
        navigate('/');
        
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      console.error('Login failed', err);
      setError('Login failed. Please check your credentials and try again.');
      setLoading(false);
    }
  };
  
  return (
    <Container component="main" maxWidth="xs">
      <Paper 
        elevation={3} 
        sx={{ 
          mt: 8, 
          p: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center' 
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <LockIcon />
        </Avatar>
        
        <Typography component="h1" variant="h5" gutterBottom>
          Hotel Work Order System
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Sign in to access the management system
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={formData.username}
            onChange={handleChange}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
          
          <Typography variant="body2" align="center" color="text.secondary">
            For demo purposes, enter any username and password
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;