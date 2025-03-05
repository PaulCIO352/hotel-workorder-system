import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

// Layout Components
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

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 960);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 960);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <AuthProvider>
      <AlertProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Header handleDrawerToggle={handleDrawerToggle} />
              <Box sx={{ display: 'flex', flex: 1 }}>
                {!isMobile && <Sidebar />}
                <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
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
              </Box>
              {isMobile && <MobileNavbar />}
              <Footer />
            </Box>
          </Router>
        </ThemeProvider>
      </AlertProvider>
    </AuthProvider>
  );
}

export default App;