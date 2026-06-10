const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const EmployerProfile = require('../models/EmployerProfile');
const CandidateProfile = require('../models/CandidateProfile');
const { sendStatusUpdateEmail, sendApplicationNotificationEmail } = require('../services/emailService');

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private (Candidate only)
const applyForJob = async (req, res) => {
  const { jobId } = req.body;

  if (!jobId) {
    return res.status(400).json({ message: 'Job ID is required' });
  }

  try {
    // 1. Verify job exists and check its status
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status === 'Closed') {
      return res.status(400).json({ message: 'Cannot apply to a closed job posting' });
    }

    // 2. Verify candidate has completed their profile details and uploaded a resume
    const profile = await CandidateProfile.findOne({ userId: req.user._id });
    if (
      !profile ||
      !profile.phone ||
      !profile.location ||
      !profile.resumeUrl ||
      !profile.summary ||
      !profile.skills || profile.skills.length === 0 ||
      !profile.education || profile.education.length === 0 ||
      !profile.experience || profile.experience.length === 0
    ) {
      return res.status(400).json({
        message: 'Please complete all details in your profile (phone, location, skills, summary, education, experience) and upload a resume before applying.'
      });
    }

    // 3. Check if candidate already applied (Mongoose compound unique index will catch this, but checking first gives a cleaner response)
    const alreadyApplied = await Application.findOne({
      candidateId: req.user._id,
      jobId,
    });

    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // 3. Create the application
    const application = await Application.create({
      candidateId: req.user._id,
      jobId,
      status: 'Applied',
    });

    // 4. Atomically increment applicationCount on Job
    job.applicationCount += 1;
    await job.save();

    // 5. Fetch employer user details and notify them with candidate profile details
    const employerUser = await User.findById(job.employerId);
    if (employerUser) {
      const candidateDetails = {
        fullName: req.user.fullName,
        email: req.user.email,
        phone: profile.phone,
        location: profile.location,
        skills: profile.skills,
        summary: profile.summary,
        education: profile.education,
        experience: profile.experience,
        resumeUrl: profile.resumeUrl,
      };

      // Send application notification to the employer asynchronously
      sendApplicationNotificationEmail(
        employerUser.email,
        employerUser.fullName,
        job.title,
        candidateDetails
      );
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application,
    });
  } catch (error) {
    console.error('Apply Job Error:', error.message);
    res.status(500).json({ message: 'Server error while applying for job' });
  }
};

// @desc    Get logged-in candidate's applications
// @route   GET /api/applications/my
// @access  Private (Candidate only)
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidateId: req.user._id })
      .populate({
        path: 'jobId',
        select: 'title location salary status employerId employmentType experienceLevel',
      })
      .sort({ appliedAt: -1 });

    // We want to attach company name to each application if possible
    const detailedApps = await Promise.all(
      applications.map(async (app) => {
        if (!app.jobId) return app;
        
        // Find EmployerProfile to get companyName
        const employerProfile = await EmployerProfile.findOne({ userId: app.jobId.employerId });
        
        // Return a plain object with companyName added
        const appObj = app.toObject();
        appObj.jobId.companyName = employerProfile ? employerProfile.companyName : 'Unknown Company';
        return appObj;
      })
    );

    res.json(detailedApps);
  } catch (error) {
    console.error('Get My Applications Error:', error.message);
    res.status(500).json({ message: 'Server error while fetching applications' });
  }
};

// @desc    Get all applications for a specific job
// @route   GET /api/applications/job/:jobId
// @access  Private (Employer only, Owner only)
const getJobApplications = async (req, res) => {
  const { jobId } = req.params;

  try {
    // 1. Verify job exists and belongs to logged-in employer
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied: You do not own this job listing' });
    }

    // 2. Fetch applications and populate candidate user details
    const applications = await Application.find({ jobId })
      .populate('candidateId', 'fullName email')
      .sort({ appliedAt: -1 });

    // 3. For each application, fetch candidate profile details (phone, location, resumeUrl, etc.)
    const detailedApplicants = await Promise.all(
      applications.map(async (app) => {
        const candidateProfile = await CandidateProfile.findOne({ userId: app.candidateId._id });
        const appObj = app.toObject();
        appObj.candidateProfile = candidateProfile || null;
        return appObj;
      })
    );

    res.json(detailedApplicants);
  } catch (error) {
    console.error('Get Job Applications Error:', error.message);
    res.status(500).json({ message: 'Server error while fetching job applications' });
  }
};

// @desc    Update application status (Shortlist / Reject)
// @route   PATCH /api/applications/:id/status
// @access  Private (Employer only)
const updateApplicationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['Shortlisted', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status. Must be Shortlisted or Rejected' });
  }

  try {
    // 1. Find the application and populate Job details
    const application = await Application.findById(id).populate('jobId');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // 2. Verify logged-in employer owns the job listing associated with this application
    const job = application.jobId;
    if (!job || job.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied: You are not the owner of this job posting' });
    }

    // 3. Update the application status
    application.status = status;
    await application.save();

    // 4. Fetch candidate user details to send email
    const candidateUser = await User.findById(application.candidateId);
    
    // Fetch EmployerProfile for company name
    const employerProfile = await EmployerProfile.findOne({ userId: job.employerId });
    const companyName = employerProfile ? employerProfile.companyName : 'HireFlow Client';

    if (candidateUser) {
      // Trigger Nodemailer notification asynchronously (so response is not blocked)
      sendStatusUpdateEmail(
        candidateUser.email,
        candidateUser.fullName,
        job.title,
        companyName,
        status
      );
    }

    res.json({
      success: true,
      message: `Application status successfully updated to ${status}`,
      application,
    });
  } catch (error) {
    console.error('Update Status Error:', error.message);
    res.status(500).json({ message: 'Server error while updating application status' });
  }
};

// @desc    Get dashboard stats for both Employers and Candidates
// @route   GET /api/applications/dashboard-stats
// @access  Private (Both)
const getDashboardStats = async (req, res) => {
  try {
    if (req.user.role === 'Employer') {
      // Employer Dashboard stats:
      // Total Jobs, Open Jobs, Closed Jobs, Total Applicants
      const totalJobs = await Job.countDocuments({ employerId: req.user._id });
      const openJobs = await Job.countDocuments({ employerId: req.user._id, status: 'Open' });
      const closedJobs = await Job.countDocuments({ employerId: req.user._id, status: 'Closed' });

      // Get count of all applicants across all employer's jobs
      const employerJobs = await Job.find({ employerId: req.user._id }, '_id');
      const jobIds = employerJobs.map((j) => j._id);
      
      const totalApplicants = await Application.countDocuments({ jobId: { $in: jobIds } });

      return res.json({
        role: 'Employer',
        totalJobs,
        openJobs,
        closedJobs,
        totalApplicants,
      });
    } else {
      // Candidate Dashboard stats:
      // Total Applications, Applied Jobs, Shortlisted, Rejected
      const totalApplications = await Application.countDocuments({ candidateId: req.user._id });
      const appliedCount = await Application.countDocuments({ candidateId: req.user._id, status: 'Applied' });
      const shortlistedCount = await Application.countDocuments({ candidateId: req.user._id, status: 'Shortlisted' });
      const rejectedCount = await Application.countDocuments({ candidateId: req.user._id, status: 'Rejected' });

      return res.json({
        role: 'Candidate',
        totalApplications,
        appliedCount,
        shortlistedCount,
        rejectedCount,
      });
    }
  } catch (error) {
    console.error('Dashboard Stats Error:', error.message);
    res.status(500).json({ message: 'Server error while fetching dashboard statistics' });
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  getDashboardStats,
};
