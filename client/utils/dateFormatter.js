import { 
    format, 
    formatDistance, 
    formatRelative, 
    isToday, 
    isYesterday,
    isThisWeek,
    isThisMonth,
    isPast,
    differenceInDays,
    differenceInHours,
    differenceInMinutes,
    parseISO
  } from 'date-fns';
  
  /**
   * Formats a date with a standard format
   * 
   * @param {Date|string} date - The date to format
   * @param {string} formatStr - Optional format string, defaults to 'PPpp' (Oct 16, 2023, 3:45 PM)
   * @returns {string} The formatted date
   */
  export const formatDate = (date, formatStr = 'PPpp') => {
    if (!date) return '';
    
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return format(dateObj, formatStr);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };
  
  /**
   * Formats a date as a relative time (e.g., "2 days ago", "in 3 hours")
   * 
   * @param {Date|string} date - The date to format
   * @param {Date} baseDate - The date to use as the base for the relative format
   * @returns {string} The relative time string
   */
  export const formatRelativeTime = (date, baseDate = new Date()) => {
    if (!date) return '';
    
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return formatDistance(dateObj, baseDate, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting relative time:', error);
      return 'Invalid date';
    }
  };
  
  /**
   * Formats a date as a friendly string (Today, Yesterday, This Week, etc.)
   * 
   * @param {Date|string} date - The date to format
   * @returns {string} The friendly date string
   */
  export const formatFriendlyDate = (date) => {
    if (!date) return '';
    
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      
      if (isToday(dateObj)) {
        return `Today at ${format(dateObj, 'h:mm a')}`;
      } else if (isYesterday(dateObj)) {
        return `Yesterday at ${format(dateObj, 'h:mm a')}`;
      } else if (isThisWeek(dateObj)) {
        return format(dateObj, 'EEEE') + ` at ${format(dateObj, 'h:mm a')}`;
      } else if (isThisMonth(dateObj)) {
        return format(dateObj, 'MMMM d') + ` at ${format(dateObj, 'h:mm a')}`;
      } else {
        return format(dateObj, 'MMM d, yyyy') + ` at ${format(dateObj, 'h:mm a')}`;
      }
    } catch (error) {
      console.error('Error formatting friendly date:', error);
      return 'Invalid date';
    }
  };
  
  /**
   * Formats a due date with color and status information
   * 
   * @param {Date|string} dueDate - The due date to format
   * @returns {Object} Object with formatted text, color, and status flags
   */
  export const formatDueDate = (dueDate) => {
    if (!dueDate) return null;
    
    try {
      const dateObj = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
      const now = new Date();
      
      // Calculate status
      const isPastDue = isPast(dateObj) && !isToday(dateObj);
      const isDueToday = isToday(dateObj);
      const isDueSoon = !isPastDue && !isDueToday && differenceInDays(dateObj, now) <= 3;
      
      // Determine color
      let color = 'textSecondary';
      if (isPastDue) color = 'error';
      else if (isDueToday) color = 'warning.main';
      else if (isDueSoon) color = 'warning.light';
      
      // Format text
      let text = format(dateObj, 'MMM d, yyyy');
      let status = '';
      
      if (isPastDue) {
        const daysOverdue = differenceInDays(now, dateObj);
        status = daysOverdue === 1 ? '(1 day overdue)' : `(${daysOverdue} days overdue)`;
      } else if (isDueToday) {
        status = '(Due today)';
      } else if (isDueSoon) {
        const daysUntil = differenceInDays(dateObj, now);
        status = daysUntil === 1 ? '(Due tomorrow)' : `(Due in ${daysUntil} days)`;
      }
      
      return {
        text,
        color,
        status,
        isPastDue,
        isDueToday,
        isDueSoon
      };
    } catch (error) {
      console.error('Error formatting due date:', error);
      return {
        text: 'Invalid date',
        color: 'error',
        status: '',
        isPastDue: false,
        isDueToday: false,
        isDueSoon: false
      };
    }
  };
  
  /**
   * Calculates and formats the time elapsed between two dates
   * 
   * @param {Date|string} startDate - The start date
   * @param {Date|string} endDate - The end date, defaults to now
   * @returns {string} The formatted time elapsed
   */
  export const formatTimeElapsed = (startDate, endDate = new Date()) => {
    if (!startDate) return '';
    
    try {
      const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
      const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
      
      const diffMinutes = differenceInMinutes(end, start);
      
      if (diffMinutes < 60) {
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
      }
      
      const diffHours = differenceInHours(end, start);
      const remainingMinutes = diffMinutes % 60;
      
      if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
      }
      
      const diffDays = differenceInDays(end, start);
      const remainingHours = diffHours % 24;
      
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`;
    } catch (error) {
      console.error('Error calculating time elapsed:', error);
      return 'Invalid time range';
    }
  };
  
  /**
   * Helper function to check if a date string is valid
   * 
   * @param {string} dateStr - The date string to validate
   * @returns {boolean} True if the date string is valid
   */
  export const isValidDateString = (dateStr) => {
    if (!dateStr) return false;
    
    try {
      const date = parseISO(dateStr);
      return !isNaN(date.getTime());
    } catch (error) {
      return false;
    }
  };
  
  /**
   * Creates a date object from a date string
   * 
   * @param {string} dateStr - The date string to convert
   * @returns {Date|null} The Date object or null if invalid
   */
  export const toDate = (dateStr) => {
    if (!dateStr) return null;
    
    try {
      return parseISO(dateStr);
    } catch (error) {
      console.error('Error parsing date string:', error);
      return null;
    }
  };
  
  export default {
    formatDate,
    formatRelativeTime,
    formatFriendlyDate,
    formatDueDate,
    formatTimeElapsed,
    isValidDateString,
    toDate
  };