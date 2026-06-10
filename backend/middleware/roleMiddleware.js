const requireCandidate = (req, res, next) => {
  if (req.user && req.user.role === 'Candidate') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Candidate role required' });
  }
};

const requireEmployer = (req, res, next) => {
  if (req.user && req.user.role === 'Employer') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Employer role required' });
  }
};

module.exports = { requireCandidate, requireEmployer };
