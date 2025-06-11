const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

// Import routes
const userRoutes = require('./backend/routes/userRoutes');
const groupRoutes = require('./backend/routes/groupRoutes');
const expenseRoutes = require('./backend/routes/expenseRoutes');
const authRoutes = require('./backend/routes/auth');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:8081', 'http://localhost:3000', 'http://127.0.0.1:8081'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/auth', authRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    message: 'SplitWise API is running!',
    timestamp: new Date().toISOString(),
    status: 'healthy'
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API test successful',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: `Route ${req.originalUrl} not found` 
  });
});

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 API available at http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/`);
});

module.exports = app;