import axios from 'axios';

// Create an axios instance
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Work Order API functions
export const workOrderAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return api.get(`/workorders?${params}`);
  },
  
  getById: async (id) => {
    return api.get(`/workorders/${id}`);
  },
  
  create: async (workOrderData) => {
    const formData = new FormData();
    
    // Add text fields
    Object.keys(workOrderData).forEach(key => {
      if (key !== 'images') {
        formData.append(key, workOrderData[key]);
      }
    });
    
    // Add images if any
    if (workOrderData.images && workOrderData.images.length) {
      workOrderData.images.forEach(image => {
        formData.append('images', image);
      });
    }
    
    return api.post('/workorders', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  update: async (id, workOrderData) => {
    if (workOrderData.images && workOrderData.images.length) {
      const formData = new FormData();
      
      Object.keys(workOrderData).forEach(key => {
        if (key !== 'images') {
          formData.append(key, workOrderData[key]);
        }
      });
      
      workOrderData.images.forEach(image => {
        if (typeof image === 'string') {
          // Existing image URL
          formData.append('existingImages', image);
        } else {
          // New file
          formData.append('images', image);
        }
      });
      
      return api.put(`/workorders/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } else {
      return api.put(`/workorders/${id}`, workOrderData);
    }
  },
  
  delete: async (id) => {
    return api.delete(`/workorders/${id}`);
  }
};

// Time Entry API functions
export const timeEntryAPI = {
  startWork: async (workOrderId, userId) => {
    return api.post('/timeentries/start', { workOrderId, userId });
  },
  
  pauseWork: async (timeEntryId) => {
    return api.put(`/timeentries/${timeEntryId}/pause`);
  },
  
  resumeWork: async (timeEntryId) => {
    return api.put(`/timeentries/${timeEntryId}/resume`);
  },
  
  stopWork: async (timeEntryId, notes = '') => {
    return api.put(`/timeentries/${timeEntryId}/stop`, { notes });
  },
  
  getForWorkOrder: async (workOrderId) => {
    return api.get(`/timeentries/workorder/${workOrderId}`);
  }
};

// User API functions
export const userAPI = {
  getAll: async () => {
    return api.get('/users');
  },
  
  getById: async (id) => {
    return api.get(`/users/${id}`);
  },
  
  create: async (userData) => {
    return api.post('/users', userData);
  },
  
  update: async (id, userData) => {
    return api.put(`/users/${id}`, userData);
  },
  
  delete: async (id) => {
    return api.delete(`/users/${id}`);
  }
};

// Comments API functions
export const commentAPI = {
  getForWorkOrder: async (workOrderId) => {
    return api.get(`/comments/workorder/${workOrderId}`);
  },
  
  create: async (commentData) => {
    return api.post('/comments', commentData);
  },
  
  delete: async (id) => {
    return api.delete(`/comments/${id}`);
  }
};

// Parts Request API functions
export const partsAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return api.get(`/parts?${params}`);
  },
  
  getForWorkOrder: async (workOrderId) => {
    return api.get(`/parts/workorder/${workOrderId}`);
  },
  
  create: async (partData) => {
    return api.post('/parts', partData);
  },
  
  update: async (id, partData) => {
    return api.put(`/parts/${id}`, partData);
  },
  
  delete: async (id) => {
    return api.delete(`/parts/${id}`);
  }
};

// Recurring Tasks API functions
export const recurringAPI = {
  getAll: async () => {
    return api.get('/recurring');
  },
  
  getById: async (id) => {
    return api.get(`/recurring/${id}`);
  },
  
  create: async (taskData) => {
    return api.post('/recurring', taskData);
  },
  
  update: async (id, taskData) => {
    return api.put(`/recurring/${id}`, taskData);
  },
  
  delete: async (id) => {
    return api.delete(`/recurring/${id}`);
  }
};

// Analytics API functions
export const analyticsAPI = {
  getDailyStats: async (date) => {
    return api.get(`/analytics/daily?date=${date}`);
  },
  
  getWorkOrdersByPriority: async (startDate, endDate) => {
    return api.get(`/analytics/priority?startDate=${startDate}&endDate=${endDate}`);
  },
  
  getTimeSpentByDepartment: async (startDate, endDate) => {
    return api.get(`/analytics/time-spent?startDate=${startDate}&endDate=${endDate}`);
  },
  
  getCompletionStats: async (startDate, endDate) => {
    return api.get(`/analytics/completion?startDate=${startDate}&endDate=${endDate}`);
  }
};