const express = require('express');
const router = express.Router();
const {
  getEmployerProfile,
  upsertEmployerProfile,
} = require('../controllers/employerController');
const { protect } = require('../middleware/authMiddleware');
const { requireEmployer } = require('../middleware/roleMiddleware');

// All employer profile routes require authentication & employer role verification
router.use(protect);
router.use(requireEmployer);

router.get('/profile', getEmployerProfile);
router.put('/profile', upsertEmployerProfile);

module.exports = router;
