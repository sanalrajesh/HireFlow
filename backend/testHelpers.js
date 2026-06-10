const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const {
  createUser,
  createJob,
  createApplication,
  updateApplicationStatus,
  closeJob,
} = require('./utils/databaseHelpers');

const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');

const runTests = async () => {
  try {
    console.log('Connecting to database for constraint verification...');
    await connectDB();

    // Clear test collections first to be safe
    console.log('Cleaning test environment...');
    await User.deleteMany({ email: /test-.*@example\.com/ });
    console.log('Test environment cleared.');

    // --- TEST 1: createUser helper ---
    console.log('\n--- Running TEST 1: createUser helper ---');
    const testCandidate = await createUser({
      fullName: 'Test Candidate',
      email: 'test-candidate@example.com',
      password: 'password123',
      role: 'Candidate',
    });
    console.log(`Successfully created test candidate: ${testCandidate.email}`);

    const testEmployer = await createUser({
      fullName: 'Test Employer',
      email: 'test-employer@example.com',
      password: 'password123',
      role: 'Employer',
    });
    console.log(`Successfully created test employer: ${testEmployer.email}`);

    // --- TEST 2: Validation - Negative Salary ---
    console.log('\n--- Running TEST 2: Validation - Negative Salary ---');
    try {
      await createJob({
        employerId: testEmployer._id,
        title: 'Negative Salary Job',
        description: 'Should fail validation',
        location: 'Remote',
        salary: -1000,
        requiredSkills: ['Node.js'],
      });
      console.error('❌ FAIL: Created a job with a negative salary!');
    } catch (error) {
      console.log('✅ SUCCESS: Correctly failed to create job with negative salary.');
      console.log(`Captured Error: ${error.message}`);
    }

    // Create a valid job for subsequent tests
    const validJob = await createJob({
      employerId: testEmployer._id,
      title: 'Software Engineer',
      description: 'Valid job description',
      location: 'Remote',
      salary: 100000,
      requiredSkills: ['Node.js'],
    });
    console.log(`Created valid job: "${validJob.title}" (applicationCount is ${validJob.applicationCount})`);

    // --- TEST 3: createApplication helper and automatic increment ---
    console.log('\n--- Running TEST 3: createApplication & count increment ---');
    const app1 = await createApplication({
      candidateId: testCandidate._id,
      jobId: validJob._id,
    });
    console.log(`Application created successfully. Status: ${app1.status}`);

    const updatedJob = await Job.findById(validJob._id);
    console.log(`After application: job applicationCount is ${updatedJob.applicationCount}`);
    if (updatedJob.applicationCount === 1) {
      console.log('✅ SUCCESS: Job applicationCount incremented to 1.');
    } else {
      console.error(`❌ FAIL: Expected applicationCount to be 1, but got ${updatedJob.applicationCount}`);
    }

    // --- TEST 4: Duplicate application prevention ---
    console.log('\n--- Running TEST 4: Duplicate application prevention ---');
    try {
      await createApplication({
        candidateId: testCandidate._id,
        jobId: validJob._id,
      });
      console.error('❌ FAIL: Allowed duplicate application for the same candidate and job!');
    } catch (error) {
      console.log('✅ SUCCESS: Correctly blocked duplicate application.');
      console.log(`Captured Error: ${error.message}`);
    }

    // --- TEST 5: updateApplicationStatus ---
    console.log('\n--- Running TEST 5: updateApplicationStatus ---');
    const updatedApp = await updateApplicationStatus(app1._id, 'Shortlisted');
    console.log(`Application status updated to: ${updatedApp.status}`);
    if (updatedApp.status === 'Shortlisted') {
      console.log('✅ SUCCESS: Application status updated correctly.');
    } else {
      console.error(`❌ FAIL: Expected status Shortlisted, got ${updatedApp.status}`);
    }

    // --- TEST 6: closeJob ---
    console.log('\n--- Running TEST 6: closeJob ---');
    const closedJob = await closeJob(validJob._id);
    console.log(`Job status updated to: ${closedJob.status}`);
    if (closedJob.status === 'closed') {
      console.log('✅ SUCCESS: Job status closed successfully.');
    } else {
      console.error(`❌ FAIL: Expected job status closed, got ${closedJob.status}`);
    }

    // Clean up test data
    console.log('\nCleaning up test data...');
    await Application.deleteMany({ candidateId: testCandidate._id });
    await Job.deleteMany({ employerId: testEmployer._id });
    await User.deleteMany({ _id: { $in: [testCandidate._id, testEmployer._id] } });
    console.log('Clean up done.');

    console.log('\nAll tests completed! 🎉');
    process.exit(0);
  } catch (error) {
    console.error(`Unexpected test runner error: ${error.message}`);
    process.exit(1);
  }
};

runTests();
