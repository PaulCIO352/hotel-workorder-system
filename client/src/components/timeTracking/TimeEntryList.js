import React from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, IconButton,
  Divider, Tooltip, useTheme, Collapse, Alert
} from '@mui/material';
import { 
  AccessTime as AccessTimeIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Pause as PauseIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { format, formatDistance, formatDuration, intervalToDuration } from 'date-fns';

const TimeEntryList = ({ 
  timeEntries = [], 
  onDeleteEntry,
  onEditEntry,
  onResumeEntry,
  onPauseEntry,
  onStopEntry
}) => {
  const theme = useTheme();
  
  // Helper function to format duration
  const formatTimeSpent = (entry) => {
    // For completed entries
    if (entry.endTime) {
      return formatDuration(
        intervalToDuration({
          start: 0,
          end: entry.totalMinutes * 60 * 1000 // Convert minutes to milliseconds
        }),
        { format: ['hours', 'minutes'] }
      );
    }
    
    // For in-progress entries
    const start = new Date(entry.startTime);
    const end = new Date();
    
    // Account for pause time
    let pausedTime = 0;
    if (entry.pausedIntervals && entry.pausedIntervals.length > 0) {
      pausedTime = entry.pausedIntervals.reduce((total, interval) => {
        if (interval.endPause) {
          return total + (new Date(interval.endPause) - new Date(interval.startPause));
        } else {
          // Currently paused
          return total + (end - new Date(interval.startPause));
        }
      }, 0);
    }
    
    const activeTime = end - start - pausedTime;
    
    return formatDuration(
      intervalToDuration({
        start: 0,
        end: activeTime
      }),
      { format: ['hours', 'minutes'] }
    );
  };
  
  // Helper function to check if entry is currently paused
  const isCurrentlyPaused = (entry) => {
    if (!entry || !entry.pausedIntervals || entry.pausedIntervals.length === 0) {
      return false;
    }
    
    const lastPauseInterval = entry.pausedIntervals[entry.pausedIntervals.length - 1];
    return Boolean(lastPauseInterval.startPause && !lastPauseInterval.endPause);
  };
  
  // Helper function to get entry status
  const getEntryStatus = (entry) => {
    if (entry.endTime) {
      return { label: 'Completed', color: 'success', icon: <StopIcon /> };
    } else if (isCurrentlyPaused(entry)) {
      return { label: 'Paused', color: 'warning', icon: <PauseIcon /> };
    } else {
      return { label: 'In Progress', color: 'info', icon: <PlayIcon /> };
    }
  };
  
  if (timeEntries.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">
            Time Entries
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Typography variant="body1" align="center" color="textSecondary" sx={{ my: 4 }}>
          No time entries recorded yet.
        </Typography>
      </Paper>
    );
  }
  
  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6">
          Time Entry History
        </Typography>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Started</TableCell>
              <TableCell>Ended</TableCell>
              <TableCell>Time Spent</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {timeEntries.map((entry) => {
              const status = getEntryStatus(entry);
              
              return (
                <TableRow key={entry._id} hover>
                  <TableCell>
                    <Tooltip title={format(new Date(entry.startTime), 'PPpp')}>
                      <Typography variant="body2">
                        {format(new Date(entry.startTime), 'MMM d, yyyy')}
                        <Typography variant="caption" display="block" color="textSecondary">
                          {format(new Date(entry.startTime), 'h:mm a')}
                        </Typography>
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  
                  <TableCell>
                    {entry.endTime ? (
                      <Tooltip title={format(new Date(entry.endTime), 'PPpp')}>
                        <Typography variant="body2">
                          {format(new Date(entry.endTime), 'MMM d, yyyy')}
                          <Typography variant="caption" display="block" color="textSecondary">
                            {format(new Date(entry.endTime), 'h:mm a')}
                          </Typography>
                        </Typography>
                      </Tooltip>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        --
                      </Typography>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {formatTimeSpent(entry)}
                    </Typography>
                    {entry.pausedIntervals && entry.pausedIntervals.length > 0 && (
                      <Tooltip title={`Contains ${entry.pausedIntervals.length} pause interval(s)`}>
                        <Typography 
                          variant="caption" 
                          display="flex" 
                          alignItems="center" 
                          color="textSecondary"
                        >
                          <InfoIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                          Includes pauses
                        </Typography>
                      </Tooltip>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <Chip 
                      label={status.label} 
                      color={status.color}
                      size="small"
                      icon={status.icon}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      color={entry.notes ? 'textPrimary' : 'textSecondary'}
                      sx={{
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {entry.notes || 'No notes'}
                    </Typography>
                  </TableCell>
                  
                  <TableCell align="right">
                    <Box display="flex" justifyContent="flex-end">
                      {/* Show different actions based on status */}
                      {entry.endTime ? (
                        // Completed entries can only be deleted
                        <Tooltip title="Delete Entry">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => onDeleteEntry && onDeleteEntry(entry._id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : isCurrentlyPaused(entry) ? (
                        // Paused entries can be resumed or stopped
                        <>
                          <Tooltip title="Resume Work">
                            <IconButton 
                              size="small" 
                              color="success"
                              onClick={() => onResumeEntry && onResumeEntry(entry._id)}
                              sx={{ mr: 1 }}
                            >
                              <PlayIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Stop Work">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => onStopEntry && onStopEntry(entry._id)}
                            >
                              <StopIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      ) : (
                        // In-progress entries can be paused or stopped
                        <>
                          <Tooltip title="Pause Work">
                            <IconButton 
                              size="small" 
                              color="warning"
                              onClick={() => onPauseEntry && onPauseEntry(entry._id)}
                              sx={{ mr: 1 }}
                            >
                              <PauseIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Stop Work">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => onStopEntry && onStopEntry(entry._id)}
                            >
                              <StopIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default TimeEntryList;