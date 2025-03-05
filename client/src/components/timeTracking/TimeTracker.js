import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Button, Typography, Paper, Divider, 
  TextField, CircularProgress, Alert, 
  Dialog, DialogTitle, DialogContent, DialogActions,
  Card, CardContent, Grid, useTheme
} from '@mui/material';
import { 
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  AccessTime as ClockIcon,
  Timer as TimerIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

// Import time entry list component
import TimeEntryList from './TimeEntryList';

// API
import { timeEntryAPI } from '../../utils/api';

const TimeTracker = ({ workOrderId, workOrderStatus }) => {
  const [timeEntries, setTimeEntries] = useState([]);
  const [activeEntry, setActiveEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timer, setTimer] = useState(0);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState(null);
  const timerRef = useRef(null);
  const theme = useTheme();
  
  // Mock user ID - in a real app, this would come from auth context
  const userId = '12345';
  
  // Fetch time entries on component mount
  useEffect(() => {
    const fetchTimeEntries = async () => {
      try {
        setLoading(true);
        const res = await timeEntryAPI.getForWorkOrder(workOrderId);
        setTimeEntries(res.data);
        
        // Check if there's an active entry (no endTime)
        const active = res.data.find(entry => !entry.endTime);
        if (active) {
          setActiveEntry(active);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch time entries', err);
        setError('Failed to load time tracking data');
        setLoading(false);
      }
    };
    
    fetchTimeEntries();
    
    // Clean up timer on component unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [workOrderId]);
  
  // Timer effect for active entry
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (activeEntry) {
      // Calculate elapsed time in seconds
      const calculateElapsedTime = () => {
        const start = new Date(activeEntry.startTime);
        const now = new Date();
        
        // Calculate paused time
        let pausedTime = 0;
        if (activeEntry.pausedIntervals && activeEntry.pausedIntervals.length > 0) {
          pausedTime = activeEntry.pausedIntervals.reduce((total, interval) => {
            if (interval.endPause) {
              return total + (new Date(interval.endPause) - new Date(interval.startPause));
            } else {
              // Currently paused
              return total + (now - new Date(interval.startPause));
            }
          }, 0);
        }
        
        return Math.floor((now - start - pausedTime) / 1000);
      };
      
      // Initial calculation
      setTimer(calculateElapsedTime());
      
      // Update timer every second
      timerRef.current = setInterval(() => {
        setTimer(calculateElapsedTime());
      }, 1000);
    } else {
      // Reset timer if no active entry
      setTimer(0);
    }
  }, [activeEntry]);
  
  // Format timer display
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Check if currently paused
  const isCurrentlyPaused = () => {
    if (!activeEntry || !activeEntry.pausedIntervals || activeEntry.pausedIntervals.length === 0) {
      return false;
    }
    
    const lastPauseInterval = activeEntry.pausedIntervals[activeEntry.pausedIntervals.length - 1];
    return Boolean(lastPauseInterval.startPause && !lastPauseInterval.endPause);
  };
  
  // Handle start work
  const handleStartWork = async () => {
    if (workOrderStatus === 'completed' || workOrderStatus === 'cancelled') {
      setError('Cannot start work on a completed or cancelled work order');
      setTimeout(() => setError(''), 5000);
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      const res = await timeEntryAPI.startWork({
        workOrderId,
        userId
      });
      
      setActiveEntry(res.data);
      setTimeEntries([res.data, ...timeEntries]);
      setSuccess('Time tracking started');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to start work', err);
      setError('Failed to start time tracking');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle pause work
  const handlePauseWork = async () => {
    if (!activeEntry) return;
    
    try {
      setSubmitting(true);
      setError('');
      
      const res = await timeEntryAPI.pauseWork(activeEntry._id);
      
      setActiveEntry(res.data);
      // Update the entry in the list
      setTimeEntries(timeEntries.map(entry => 
        entry._id === activeEntry._id ? res.data : entry
      ));
      
      setSuccess('Time tracking paused');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to pause work', err);
      setError('Failed to pause time tracking');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle resume work
  const handleResumeWork = async (entryId = null) => {
    const targetEntryId = entryId || (activeEntry ? activeEntry._id : null);
    if (!targetEntryId) return;
    
    try {
      setSubmitting(true);
      setError('');
      
      const res = await timeEntryAPI.resumeWork(targetEntryId);
      
      setActiveEntry(res.data);
      // Update the entry in the list
      setTimeEntries(timeEntries.map(entry => 
        entry._id === targetEntryId ? res.data : entry
      ));
      
      setSuccess('Time tracking resumed');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to resume work', err);
      setError('Failed to resume time tracking');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Open stop work dialog
  const handleOpenStopDialog = (entryId = null) => {
    setDialogAction({
      type: 'stop',
      entryId: entryId || (activeEntry ? activeEntry._id : null)
    });
    setDialogOpen(true);
  };
  
  // Open delete entry dialog
  const handleOpenDeleteDialog = (entryId) => {
    setDialogAction({
      type: 'delete',
      entryId
    });
    setDialogOpen(true);
  };
  
  // Close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setDialogAction(null);
  };
  
  // Handle stop work (from dialog)
  const handleStopWork = async () => {
    if (!dialogAction || dialogAction.type !== 'stop') return;
    
    const entryId = dialogAction.entryId;
    if (!entryId) return;
    
    try {
      setSubmitting(true);
      setError('');
      
      const res = await timeEntryAPI.stopWork(entryId, { notes });
      
      // Update the entry in the list
      setTimeEntries(timeEntries.map(entry => 
        entry._id === entryId ? res.data : entry
      ));
      
      // If this was the active entry, clear it
      if (activeEntry && activeEntry._id === entryId) {
        setActiveEntry(null);
      }
      
      setNotes('');
      setSuccess('Time tracking stopped');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to stop work', err);
      setError('Failed to stop time tracking');
    } finally {
      setSubmitting(false);
      handleCloseDialog();
    }
  };
  
  // Handle delete time entry
  const handleDeleteEntry = async () => {
    if (!dialogAction || dialogAction.type !== 'delete') return;
    
    const entryId = dialogAction.entryId;
    if (!entryId) return;
    
    try {
      setSubmitting(true);
      setError('');
      
      await timeEntryAPI.delete(entryId);
      
      // Remove the entry from the list
      setTimeEntries(timeEntries.filter(entry => entry._id !== entryId));
      
      // If this was the active entry, clear it
      if (activeEntry && activeEntry._id === entryId) {
        setActiveEntry(null);
      }
      
      setSuccess('Time entry deleted');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to delete time entry', err);
      setError('Failed to delete time entry');
    } finally {
      setSubmitting(false);
      handleCloseDialog();
    }
  };
  
  // Handle confirmation dialog actions
  const handleConfirmAction = () => {
    if (!dialogAction) return;
    
    if (dialogAction.type === 'stop') {
      handleStopWork();
    } else if (dialogAction.type === 'delete') {
      handleDeleteEntry();
    }
  };
  
  // Handle time entry list actions
  const handlePauseEntry = (entryId) => {
    if (entryId === activeEntry?._id) {
      handlePauseWork();
    }
  };
  
  const handleResumeEntry = (entryId) => {
    handleResumeWork(entryId);
  };
  
  const handleStopEntry = (entryId) => {
    handleOpenStopDialog(entryId);
  };
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center">
          <ClockIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">
            Time Tracking
          </Typography>
        </Box>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      {/* Error and Success Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}
      
      {/* Timer Card */}
      <Card elevation={3} sx={{ mb: 4, overflow: 'visible' }}>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={5}>
              <Box textAlign={{ xs: 'center', md: 'left' }}>
                <Typography variant="h2" fontFamily="monospace" color="primary" sx={{ mb: 1 }}>
                  {formatTime(timer)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {activeEntry ? (
                    isCurrentlyPaused() ? 
                      '⏸️ Currently paused' : 
                      '⏱️ Time tracking in progress'
                  ) : (
                    '⏰ Ready to start tracking'
                  )}
                </Typography>
                {activeEntry && (
                  <Typography variant="caption" display="block" color="textSecondary" sx={{ mt: 1 }}>
                    Started: {format(new Date(activeEntry.startTime), 'PPp')}
                  </Typography>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={7}>
              <Box 
                display="flex" 
                flexDirection={{ xs: 'column', sm: 'row' }} 
                gap={2} 
                justifyContent={{ xs: 'center', md: 'flex-end' }}
                alignItems="center"
              >
                {activeEntry ? (
                  // Controls for active time entry
                  isCurrentlyPaused() ? (
                    // Paused controls
                    <>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<PlayIcon />}
                        onClick={() => handleResumeWork()}
                        disabled={submitting || workOrderStatus === 'completed' || workOrderStatus === 'cancelled'}
                        fullWidth={!activeEntry}
                        sx={{ minWidth: 120 }}
                      >
                        {submitting ? <CircularProgress size={24} /> : 'Resume'}
                      </Button>
                      
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<StopIcon />}
                        onClick={() => handleOpenStopDialog()}
                        disabled={submitting}
                        sx={{ minWidth: 120 }}
                      >
                        Stop
                      </Button>
                    </>
                  ) : (
                    // Active controls
                    <>
                      <Button
                        variant="contained"
                        color="warning"
                        startIcon={<PauseIcon />}
                        onClick={handlePauseWork}
                        disabled={submitting || workOrderStatus === 'completed' || workOrderStatus === 'cancelled'}
                        sx={{ minWidth: 120 }}
                      >
                        {submitting ? <CircularProgress size={24} /> : 'Pause'}
                      </Button>
                      
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<StopIcon />}
                        onClick={() => handleOpenStopDialog()}
                        disabled={submitting}
                        sx={{ minWidth: 120 }}
                      >
                        Stop
                      </Button>
                    </>
                  )
                ) : (
                  // Start button
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<PlayIcon />}
                    onClick={handleStartWork}
                    disabled={submitting || workOrderStatus === 'completed' || workOrderStatus === 'cancelled'}
                    fullWidth
                    sx={{ py: 1.5 }}
                  >
                    {submitting ? <CircularProgress size={24} /> : 'Start Working'}
                  </Button>
                )}
              </Box>
              
              {workOrderStatus === 'completed' || workOrderStatus === 'cancelled' ? (
                <Typography 
                  variant="body2" 
                  color="error" 
                  align="center" 
                  sx={{ mt: 2 }}
                >
                  Time tracking unavailable for {workOrderStatus} work orders
                </Typography>
              ) : null}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Time Entry History */}
      {!loading && (
        <TimeEntryList
          timeEntries={timeEntries}
          onDeleteEntry={handleOpenDeleteDialog}
          onPauseEntry={handlePauseEntry}
          onResumeEntry={handleResumeEntry}
          onStopEntry={handleStopEntry}
        />
      )}
      
      {/* Confirmation Dialog for Stop Work or Delete */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>
          {dialogAction?.type === 'stop' ? 'Stop Time Tracking' : 'Delete Time Entry'}
        </DialogTitle>
        <DialogContent>
          {dialogAction?.type === 'stop' ? (
            <Box>
              <Typography variant="body1" paragraph>
                Are you sure you want to stop time tracking for this work order?
              </Typography>
              <TextField
                label="Notes"
                multiline
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
                placeholder="Add notes about what you worked on..."
                variant="outlined"
              />
            </Box>
          ) : (
            <Typography variant="body1">
              Are you sure you want to delete this time entry? This action cannot be undone.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmAction} 
            color={dialogAction?.type === 'delete' ? 'error' : 'primary'}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : dialogAction?.type === 'stop' ? 'Stop Tracking' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TimeTracker;