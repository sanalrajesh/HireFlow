const Job = require('../models/Job');
const User = require('../models/User');

// @desc    Create a new job listing
// @route   POST /api/jobs
// @access  Private (Employer only)
const createJob = async (req, res) => {
  const {
    title,
    description,
    location,
    salary,
    requiredSkills,
    employmentType,
    experienceLevel,
  } = req.body;

  // Basic validations
  if (!title || !description || !location || !salary) {
    return res.status(400).json({ message: 'Title, description, location, and salary are required' });
  }

  const numericSalary = Number(salary);
  if (isNaN(numericSalary) || numericSalary <= 0) {
    return res.status(400).json({ message: 'Salary must be a positive number' });
  }

  try {
    const job = await Job.create({
      employerId: req.user._id,
      title,
      description,
      location,
      salary: numericSalary,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
      employmentType: employmentType || 'Full-time',
      experienceLevel: experienceLevel || 'Mid-level',
      status: 'Open', // default status
    });

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      job,
    });
  } catch (error) {
    console.error('Create Job Error:', error.message);
    res.status(500).json({ message: 'Server error while creating job' });
  }
};

// @desc    Update a job listing
// @route   PUT /api/jobs/:id
// @access  Private (Employer only, Owner only)
const updateJob = async (req, res) => {
  const {
    title,
    description,
    location,
    salary,
    requiredSkills,
    employmentType,
    experienceLevel,
    status,
  } = req.body;

  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Authorization check: Verify ownership
    if (job.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied: You are not the owner of this job posting' });
    }

    // Rule: Closed job update attempts should fail
    if (job.status === 'Closed') {
      return res.status(400).json({ message: 'Cannot update a closed job listing' });
    }

    // Validate salary if provided
    if (salary !== undefined) {
      const numericSalary = Number(salary);
      if (isNaN(numericSalary) || numericSalary <= 0) {
        return res.status(400).json({ message: 'Salary must be a positive number' });
      }
      job.salary = numericSalary;
    }

    // Apply updates
    if (title) job.title = title;
    if (description) job.description = description;
    if (location) job.location = location;
    if (requiredSkills) job.requiredSkills = Array.isArray(requiredSkills) ? requiredSkills : [];
    if (employmentType) job.employmentType = employmentType;
    if (experienceLevel) job.experienceLevel = experienceLevel;
    if (status) {
      if (status !== 'Open' && status !== 'Closed') {
        return res.status(400).json({ message: 'Invalid status. Must be Open or Closed' });
      }
      job.status = status;
    }

    const updatedJob = await job.save();

    res.json({
      success: true,
      message: 'Job updated successfully',
      job: updatedJob,
    });
  } catch (error) {
    console.error('Update Job Error:', error.message);
    res.status(500).json({ message: 'Server error while updating job' });
  }
};

// @desc    Close a job listing
// @route   PATCH /api/jobs/:id/close
// @access  Private (Employer only, Owner only)
const closeJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Authorization check: Verify ownership
    if (job.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied: You are not the owner of this job posting' });
    }

    job.status = 'Closed';
    const updatedJob = await job.save();

    res.json({
      success: true,
      message: 'Job closed successfully',
      job: updatedJob,
    });
  } catch (error) {
    console.error('Close Job Error:', error.message);
    res.status(500).json({ message: 'Server error while closing job' });
  }
};

// @desc    Get all jobs created by the logged-in employer
// @route   GET /api/jobs/employer
// @access  Private (Employer only)
const getEmployerJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ employerId: req.user._id, status: { $ne: 'Deleted' } }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error('Get Employer Jobs Error:', error.message);
    res.status(500).json({ message: 'Server error while fetching employer jobs' });
  }
};

// @desc    Get complete details of a single job
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('employerId', 'fullName email');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Get Job By ID Error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid Job ID format' });
    }
    res.status(500).json({ message: 'Server error while fetching job details' });
  }
};

// @desc    Get all open jobs (with pagination)
// @route   GET /api/jobs
// @access  Public
const getAllJobs = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    // Only return Open jobs
    const count = await Job.countDocuments({ status: 'Open' });
    const jobs = await Job.find({ status: 'Open' })
      .populate('employerId', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      jobs,
      page,
      pages: Math.ceil(count / limit),
      totalJobs: count,
    });
  } catch (error) {
    console.error('Get All Jobs Error:', error.message);
    res.status(500).json({ message: 'Server error while fetching jobs' });
  }
};

// @desc    Search and filter jobs
// @route   GET /api/jobs/search
// @access  Public
const searchJobs = async (req, res) => {
  const { keyword, location, salary, status } = req.query;

  // Build query
  const query = {};

  // Only allow Open or Closed status query, default to Open, never retrieve Deleted status
  if (status && ['Open', 'Closed'].includes(status)) {
    query.status = status;
  } else {
    query.status = 'Open';
  }

  // Search by title or skills
  if (keyword) {
    query.$or = [
      { title: { $regex: keyword, $options: 'i' } },
      { requiredSkills: { $in: [new RegExp(keyword, 'i')] } },
    ];
  }

  // Filter by location
  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }

  // Filter by salary (match if salary is greater than or equal to requested minimum)
  if (salary) {
    const minSalary = Number(salary);
    if (!isNaN(minSalary)) {
      query.salary = { $gte: minSalary };
    }
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const count = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('employerId', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      jobs,
      page,
      pages: Math.ceil(count / limit),
      totalJobs: count,
    });
  } catch (error) {
    console.error('Search Jobs Error:', error.message);
    res.status(500).json({ message: 'Server error during job search' });
  }
};

// @desc    Delete a job listing (optional)
// @route   DELETE /api/jobs/:id
// @access  Private (Employer only, Owner only)
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Authorization check: Verify ownership
    if (job.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied: You are not the owner of this job posting' });
    }

    // Soft delete: change status to 'Deleted' instead of physical removal
    job.status = 'Deleted';
    await job.save();

    res.json({
      success: true,
      message: 'Job deleted successfully',
    });
  } catch (error) {
    console.error('Delete Job Error:', error.message);
    res.status(500).json({ message: 'Server error while deleting job' });
  }
};

module.exports = {
  createJob,
  updateJob,
  closeJob,
  getEmployerJobs,
  getJobById,
  getAllJobs,
  searchJobs,
  deleteJob,
};
