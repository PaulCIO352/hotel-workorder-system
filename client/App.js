import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { 
  Box, CssBaseline, Toolbar, useMediaQuery,
  ThemeProvider, createTheme
} from '@mui/material';

// Layout components
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import MobileNavbar from './components/layout/MobileNavbar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import WorkOrders from './pages/WorkOrders';
import WorkOrderDetail from './pages/WorkOrderDetail';
import Users from './pages/Users';
import Analytics from './pages/Analytics';
import PartsRequests from './pages/PartsRequests';
import RecurringTasks from './pages/RecurringTasks';

// Context providers
import { AuthProvider } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  
  // Update dark mode preference in localStorage when it changes
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Create theme based on dark mode preference
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
      background: {
        default: darkMode ? '#121212' : '#f5f5f5',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.1)',
            backgroundImage: 'none'
          }
        }
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&.MuiTableRow-hover:hover': {
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'
            }
          }
        }
      }
    }
  });

  // Toggle sidebar for mobile view
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <AlertProvider>
          <BrowserRouter>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <CssBaseline />
              
              {/* App Header */}
              <Header 
                handleDrawerToggle={handleDrawerToggle} 
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
              />
              
              {/* Sidebar - temporary drawer on mobile, permanent on desktop */}
              <Sidebar 
                open={mobileOpen} 
                onClose={handleDrawerToggle} 
              />
              
              {/* Main Content */}
              <Box component="main" sx={{ 
                flexGrow: 1, 
                p: 3, 
                width: '100%',
                mt: 8, // Space for the AppBar
                mb: { xs: 7, sm: 0 }, // Space for the MobileNavbar on small screens
                ml: { sm: '240px' } // Space for the sidebar on desktop
              }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/workorders" element={<WorkOrders />} />
                  <Route path="/workorders/:id" element={<WorkOrderDetail />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/parts" element={<PartsRequests />} />
                  <Route path="/recurring" element={<RecurringTasks />} />
                </Routes>
              </Box>
              
              {/* Footer */}
              <Footer />
              
              {/* Mobile Bottom Navigation */}
              <MobileNavbar 
                openDrawer={handleDrawerToggle} 
              />
            </Box>
          </BrowserRouter>
        </AlertProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;