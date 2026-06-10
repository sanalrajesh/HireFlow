const express = require('express');
const router = express.Router();
const {
  createJob,
  updateJob,
  closeJob,
  getEmployerJobs,
  getJobById,
  getAllJobs,
  searchJobs,
  deleteJob,
} = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');
const { requireEmployer } = require('../middleware/roleMiddleware');

// Public routes
router.get('/search', searchJobs);
router.get('/employer', protect, requireEmployer, getEmployerJobs); // Placed before /:id to prevent param matching conflict
router.get('/:id', getJobById);
router.get('/', getAllJobs);

// Protected routes (Employer only)
router.post('/', protect, requireEmployer, createJob);
router.put('/:id', protect, requireEmployer, updateJob);
router.patch('/:id/close', protect, requireEmployer, closeJob);
router.delete('/:id', protect, requireEmployer, deleteJob);

module.exports = router;
