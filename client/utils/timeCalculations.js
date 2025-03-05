/**
 * This utility provides functions for time tracking calculations
 * Used in work order time tracking features
 */

/**
 * Calculate the total minutes spent on a time entry, accounting for pauses
 * 
 * @param {Object} timeEntry - The time entry object
 * @param {Date|string} timeEntry.startTime - When the time tracking started
 * @param {Date|string} timeEntry.endTime - When the time tracking ended (null if still running)
 * @param {Array} timeEntry.pausedIntervals - Array of pause intervals
 * @returns {number} Total minutes spent (excluding pauses)
 */
export const calculateTimeSpent = (timeEntry) => {
    if (!timeEntry || !timeEntry.startTime) {
      return 0;
    }
    
    const start = new Date(timeEntry.startTime);
    const end = timeEntry.endTime ? new Date(timeEntry.endTime) : new Date();
    
    // Calculate total duration in milliseconds
    let totalMs = end - start;
    
    // Subtract paused time
    if (timeEntry.pausedIntervals && timeEntry.pausedIntervals.length > 0) {
      const pausedMs = timeEntry.pausedIntervals.reduce((total, interval) => {
        if (interval.startPause) {
          const pauseStart = new Date(interval.startPause);
          const pauseEnd = interval.endPause ? new Date(interval.endPause) : new Date();
          return total + (pauseEnd - pauseStart);
        }
        return total;
      }, 0);
      
      totalMs -= pausedMs;
    }
    
    // Convert to minutes and round to nearest integer
    return Math.round(totalMs / (1000 * 60));
  };
  
  /**
   * Format minutes as hours and minutes string (e.g., "2h 15m")
   * 
   * @param {number} minutes - Total minutes to format
   * @returns {string} Formatted time string
   */
  export const formatMinutes = (minutes) => {
    if (typeof minutes !== 'number' || isNaN(minutes)) {
      return '0m';
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    
    if (hours === 0) {
      return `${remainingMinutes}m`;
    } else if (remainingMinutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${remainingMinutes}m`;
    }
  };
  
  /**
   * Format seconds as hours, minutes, and seconds (e.g., "02:15:30")
   * 
   * @param {number} seconds - Total seconds to format
   * @returns {string} Time string in HH:MM:SS format
   */
  export const formatSeconds = (seconds) => {
    if (typeof seconds !== 'number' || isNaN(seconds)) {
      return '00:00:00';
    }
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    return [hours, minutes, remainingSeconds]
      .map(val => val.toString().padStart(2, '0'))
      .join(':');
  };
  
  /**
   * Format a time duration in milliseconds into a human-readable string
   * 
   * @param {number} ms - Duration in milliseconds
   * @returns {string} Human-readable duration
   */
  export const formatDuration = (ms) => {
    if (typeof ms !== 'number' || isNaN(ms)) {
      return '0 seconds';
    }
    
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''} ${hours % 24} hour${hours % 24 !== 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes % 60} minute${minutes % 60 !== 1 ? 's' : ''}`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ${seconds % 60} second${seconds % 60 !== 1 ? 's' : ''}`;
    } else {
      return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    }
  };
  
  /**
   * Calculate the current timer value for an active time entry
   * 
   * @param {Object} timeEntry - The time entry object
   * @returns {number} Current timer value in seconds
   */
  export const calculateTimerValue = (timeEntry) => {
    if (!timeEntry || !timeEntry.startTime) {
      return 0;
    }
    
    const start = new Date(timeEntry.startTime);
    const now = new Date();
    
    // Calculate paused time
    let pausedTime = 0;
    if (timeEntry.pausedIntervals && timeEntry.pausedIntervals.length > 0) {
      pausedTime = timeEntry.pausedIntervals.reduce((total, interval) => {
        if (interval.startPause) {
          const pauseStart = new Date(interval.startPause);
          const pauseEnd = interval.endPause ? new Date(interval.endPause) : now;
          return total + (pauseEnd - pauseStart);
        }
        return total;
      }, 0);
    }
    
    // Calculate active time in seconds
    return Math.floor((now - start - pausedTime) / 1000);
  };
  
  /**
   * Check if a time entry is currently paused
   * 
   * @param {Object} timeEntry - The time entry object
   * @returns {boolean} True if the time entry is currently paused
   */
  export const isTimeEntryPaused = (timeEntry) => {
    if (!timeEntry || !timeEntry.pausedIntervals || timeEntry.pausedIntervals.length === 0) {
      return false;
    }
    
    const lastPauseInterval = timeEntry.pausedIntervals[timeEntry.pausedIntervals.length - 1];
    return Boolean(lastPauseInterval.startPause && !lastPauseInterval.endPause);
  };
  
  /**
   * Group time entries by date for reporting
   * 
   * @param {Array} timeEntries - Array of time entry objects
   * @returns {Object} Grouped time entries by date
   */
  export const groupTimeEntriesByDate = (timeEntries) => {
    if (!timeEntries || !Array.isArray(timeEntries)) {
      return {};
    }
    
    return timeEntries.reduce((grouped, entry) => {
      // Format date as YYYY-MM-DD for grouping
      const date = new Date(entry.startTime);
      const dateKey = date.toISOString().split('T')[0];
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      
      grouped[dateKey].push(entry);
      return grouped;
    }, {});
  };
  
  /**
   * Calculate total time spent across multiple time entries
   * 
   * @param {Array} timeEntries - Array of time entry objects
   * @returns {number} Total minutes spent
   */
  export const calculateTotalTimeSpent = (timeEntries) => {
    if (!timeEntries || !Array.isArray(timeEntries)) {
      return 0;
    }
    
    return timeEntries.reduce((total, entry) => {
      const entryMinutes = calculateTimeSpent(entry);
      return total + entryMinutes;
    }, 0);
  };
  
  /**
   * Calculate labor cost based on time spent and hourly rate
   * 
   * @param {number} minutes - Time spent in minutes
   * @param {number} hourlyRate - Hourly rate in dollars
   * @returns {number} Total labor cost
   */
  export const calculateLaborCost = (minutes, hourlyRate) => {
    if (typeof minutes !== 'number' || typeof hourlyRate !== 'number') {
      return 0;
    }
    
    const hours = minutes / 60;
    return hours * hourlyRate;
  };
  
  export default {
    calculateTimeSpent,
    formatMinutes,
    formatSeconds,
    formatDuration,
    calculateTimerValue,
    isTimeEntryPaused,
    groupTimeEntriesByDate,
    calculateTotalTimeSpent,
    calculateLaborCost
  };