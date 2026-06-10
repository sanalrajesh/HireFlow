const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const employerRoutes = require('./routes/employerRoutes');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://hire-flow-khaki.vercel.app'
  ],
  credentials: true
}));
// Serve static uploaded files (resumes)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/candidate', candidateRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/employer', employerRoutes);

// Base route for API check
app.get('/', (req, res) => {
  res.send('HireFlow API is running...');
});

// Fallback Page Not Found Handler
app.use((req, res, next) => {
  res.status(404);
  const error = new Error(`Not Found - ${req.originalUrl}`);
  next(error);
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
