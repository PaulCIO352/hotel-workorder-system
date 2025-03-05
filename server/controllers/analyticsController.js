const WorkOrder = require('../models/WorkOrder');
const TimeEntry = require('../models/TimeEntry');
const User = require('../models/User');
const mongoose = require('mongoose');
const { startOfDay, endOfDay, startOfWeek, endOfWeek, subDays } = require('date-fns');

// Get daily statistics
exports.getDailyStats = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    const dayStart = startOfDay(targetDate);
    const dayEnd = endOfDay(targetDate);
    
    // Count work orders by status
    const openWorkOrders = await WorkOrder.countDocuments({ 
      status: 'open' 
    });
    
    const inProgressWorkOrders = await WorkOrder.countDocuments({ 
      status: 'in-progress' 
    });
    
    const completedToday = await WorkOrder.countDocuments({
      status: 'completed',
      completedDate: { $gte: dayStart, $lte: dayEnd }
    });
    
    // Calculate total minutes worked today
    const timeEntries = await TimeEntry.find({
      $or: [
        { startTime: { $gte: dayStart, $lte: dayEnd } },
        { endTime: { $gte: dayStart, $lte: dayEnd } },
        { 
          startTime: { $lte: dayStart },
          endTime: { $gte: dayEnd }
        }
      ]
    });
    
    let totalMinutesWorkedToday = 0;
    
    timeEntries.forEach(entry => {
      // Handle entries that span across days
      const entryStart = entry.startTime < dayStart ? dayStart : entry.startTime;
      const entryEnd = entry.endTime ? (entry.endTime > dayEnd ? dayEnd : entry.endTime) : new Date();
      
      // Calculate minutes between adjusted start and end
      let minutes = (entryEnd - entryStart) / (1000 * 60);
      
      // Account for paused intervals if any
      if (entry.pausedIntervals && entry.pausedIntervals.length > 0) {
        entry.pausedIntervals.forEach(interval => {
          if (interval.startPause && interval.startPause >= entryStart && interval.startPause <= entryEnd) {
            const pauseEnd = interval.endPause && interval.endPause <= entryEnd ? interval.endPause : entryEnd;
            minutes -= (pauseEnd - interval.startPause) / (1000 * 60);
          }
        });
      }
      
      totalMinutesWorkedToday += Math.max(0, minutes);
    });
    
    // Calculate average completion time (for work orders completed in the last 7 days)
    const completedWorkOrders = await WorkOrder.find({
      status: 'completed',
      completedDate: { $gte: subDays(new Date(), 7) }
    });
    
    let totalCompletionTime = 0;
    let completionCount = completedWorkOrders.length;
    
    // Assumes totalTimeSpent field is updated when work order is completed
    completedWorkOrders.forEach(workOrder => {
      totalCompletionTime += workOrder.totalTimeSpent || 0;
    });
    
    const averageCompletionTime = completionCount > 0 ? 
      Math.round(totalCompletionTime / completionCount) : 0;
    
    res.json({
      date: targetDate,
      openWorkOrders,
      inProgressWorkOrders,
      completedToday,
      totalMinutesWorkedToday: Math.round(totalMinutesWorkedToday),
      averageCompletionTime
    });
  } catch (err) {
    console.error('Error getting daily stats:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get work orders by priority
exports.getWorkOrdersByPriority = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        created: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }
    
    const priorityCounts = await WorkOrder.aggregate([
      { $match: dateFilter },
      { $group: {
          _id: '$priority',
          value: { $sum: 1 }
        }
      },
      { $project: {
          _id: 0,
          name: '$_id',
          value: 1
        }
      }
    ]);
    
    res.json(priorityCounts);
  } catch (err) {
    console.error('Error getting work orders by priority:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get time spent by department
exports.getTimeSpentByDepartment = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        startTime: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }
    
    // Get time entries with user information
    const timeEntries = await TimeEntry.find(dateFilter).populate({
      path: 'userId',
      select: 'department'
    });
    
    // Group time by department
    const departmentTime = {};
    
    timeEntries.forEach(entry => {
      if (!entry.userId || !entry.userId.department) return;
      
      const department = entry.userId.department;
      const minutes = entry.totalMinutes || 0;
      
      if (!departmentTime[department]) {
        departmentTime[department] = 0;
      }
      
      departmentTime[department] += minutes;
    });
    
    // Convert to array format for charts
    const result = Object.keys(departmentTime).map(department => ({
      name: department.charAt(0).toUpperCase() + department.slice(1),
      timeSpent: Math.round(departmentTime[department])
    }));
    
    res.json(result);
  } catch (err) {
    console.error('Error getting time spent by department:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get work order completion statistics over time
exports.getCompletionStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {
      status: 'completed'
    };
    
    if (startDate && endDate) {
      dateFilter.completedDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const completionData = await WorkOrder.aggregate([
      { $match: dateFilter },
      { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedDate' } },
          completed: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $project: {
          _id: 0,
          date: '$_id',
          completed: 1
        }
      }
    ]);
    
    res.json(completionData);
  } catch (err) {
    console.error('Error getting completion stats:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};