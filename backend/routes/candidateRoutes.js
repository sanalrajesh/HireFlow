const express = require('express');
const router = express.Router();
const {
  getCandidateProfile,
  upsertCandidateProfile,
  uploadResume,
  deleteResume,
} = require('../controllers/candidateController');
const { protect } = require('../middleware/authMiddleware');
const { requireCandidate } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

// All candidate routes require authentication and the Candidate role
router.use(protect);
router.use(requireCandidate);

router.get('/profile', getCandidateProfile);
router.post('/profile', upsertCandidateProfile);
router.put('/profile', upsertCandidateProfile);

// Resume endpoints
router.post('/resume', upload.single('resume'), uploadResume);
router.delete('/resume', deleteResume);

module.exports = router;
