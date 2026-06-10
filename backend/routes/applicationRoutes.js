const express = require('express');
const router = express.Router();
const {
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  getDashboardStats,
} = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');
const { requireCandidate, requireEmployer } = require('../middleware/roleMiddleware');

// All application routes require authentication
router.use(protect);

// Dashboard statistics (accessible by both Candidate and Employer)
router.get('/dashboard-stats', getDashboardStats);

// Candidate routes
router.post('/', requireCandidate, applyForJob);
router.get('/my', requireCandidate, getMyApplications);

// Employer routes
router.get('/job/:jobId', requireEmployer, getJobApplications);
router.patch('/:id/status', requireEmployer, updateApplicationStatus);

module.exports = router;
