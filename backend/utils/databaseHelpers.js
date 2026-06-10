const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

/**
 * Creates a new user in the database.
 * @param {Object} userData - The user details (fullName, email, password, role)
 * @returns {Promise<Object>} The created User document
 */
const createUser = async (userData) => {
  try {
    if (userData.email) {
      userData.email = userData.email.toLowerCase();
    }
    const user = await User.create(userData);
    return user;
  } catch (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }
};

/**
 * Creates a new job posting.
 * @param {Object} jobData - The job details (employerId, title, description, location, salary, requiredSkills)
 * @returns {Promise<Object>} The created Job document
 */
const createJob = async (jobData) => {
  try {
    const job = await Job.create(jobData);
    return job;
  } catch (error) {
    throw new Error(`Failed to create job: ${error.message}`);
  }
};

/**
 * Submits a new job application and atomically increments the job's application count.
 * @param {Object} applicationData - The application details (candidateId, jobId, status)
 * @returns {Promise<Object>} The created Application document
 */
const createApplication = async (applicationData) => {
  try {
    // 1. Create the application document. If duplicate or validation fails, this throws an error.
    const application = await Application.create(applicationData);

    // 2. Increment the application count on the referenced Job document atomically.
    await Job.findByIdAndUpdate(
      applicationData.jobId,
      { $inc: { applicationCount: 1 } },
      { new: true }
    );

    return application;
  } catch (error) {
    // Check for Mongoose / MongoDB duplicate key error (code 11000)
    if (error.code === 11000 || (error.writeErrors && error.writeErrors.some(e => e.code === 11000))) {
      throw new Error('Duplicate application: Candidate has already applied to this job.');
    }
    throw new Error(`Failed to create application: ${error.message}`);
  }
};

/**
 * Updates the status of a job application.
 * @param {string} applicationId - The ID of the application
 * @param {string} status - The new status ('Applied', 'Shortlisted', 'Rejected')
 * @returns {Promise<Object>} The updated Application document
 */
const updateApplicationStatus = async (applicationId, status) => {
  try {
    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      { status },
      { new: true, runValidators: true }
    );
    if (!updatedApplication) {
      throw new Error('Application not found');
    }
    return updatedApplication;
  } catch (error) {
    throw new Error(`Failed to update application status: ${error.message}`);
  }
};

/**
 * Closes a job posting by setting its status to 'closed'.
 * @param {string} jobId - The ID of the job
 * @returns {Promise<Object>} The updated Job document
 */
const closeJob = async (jobId) => {
  try {
    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      { status: 'closed' },
      { new: true, runValidators: true }
    );
    if (!updatedJob) {
      throw new Error('Job not found');
    }
    return updatedJob;
  } catch (error) {
    throw new Error(`Failed to close job: ${error.message}`);
  }
};

module.exports = {
  createUser,
  createJob,
  createApplication,
  updateApplicationStatus,
  closeJob,
};
