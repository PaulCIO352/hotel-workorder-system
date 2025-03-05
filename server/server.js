const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Initialize Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
const connectDB = require('./config/db');
connectDB();

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/workorders', require('./routes/workOrders'));
app.use('/api/timeentries', require('./routes/timeEntries'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/parts', require('./routes/partsRequests'));
app.use('/api/recurring', require('./routes/recurringTasks'));
app.use('/api/analytics', require('./routes/analytics'));

// Serve static files from the React frontend app in production
app.use(express.static(path.join(__dirname, '../client/build')));

// Anything that doesn't match the above, send back the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Set up scheduled tasks
const scheduler = require('./utils/scheduler');
scheduler.initScheduledJobs();

// Set port and start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));