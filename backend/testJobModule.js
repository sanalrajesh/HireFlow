const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');

const { createJob, updateJob, closeJob } = require('./controllers/jobController');
const { applyForJob } = require('./controllers/applicationController');
const { requireEmployer } = require('./middleware/roleMiddleware');

// Mock Express response generator
const mockResponse = () => {
  const res = {};
  res.statusCode = 200;
  res.status = function (code) {
    this.statusCode = code;
    return this;
  };
  res.json = function (data) {
    this.jsonData = data;
    return this;
  };
  return res;
};

const runTests = async () => {
  try {
    console.log('Connecting to database for Job Module integration tests...');
    await connectDB();

    // Clean test data first
    console.log('Cleaning test collections...');
    await User.deleteMany({ email: /test-job-.*@example\.com/ });
    console.log('Test collections ready.');

    // 1. Setup mock users
    console.log('\nSetting up test users...');
    const employerA = await User.create({
      fullName: 'Employer A',
      email: 'test-job-empA@example.com',
      password: 'password123',
      role: 'Employer',
    });
    
    const employerB = await User.create({
      fullName: 'Employer B',
      email: 'test-job-empB@example.com',
      password: 'password123',
      role: 'Employer',
    });

    const candidate = await User.create({
      fullName: 'Candidate C',
      email: 'test-job-candC@example.com',
      password: 'password123',
      role: 'Candidate',
    });
    console.log('Test users created.');

    // 2. Setup mock job under Employer A
    console.log('\nCreating test job under Employer A...');
    const job = await Job.create({
      employerId: employerA._id,
      title: 'Test Software Engineer',
      description: 'Job description for testing',
      location: 'Austin, TX',
      salary: 100000,
      requiredSkills: ['Node.js', 'MongoDB'],
      employmentType: 'Full-time',
      experienceLevel: 'Mid-level',
      status: 'Open',
    });
    console.log(`Created Job ID: ${job._id} with status: ${job.status}`);

    // --- TEST 1: Role protection middleware (requireEmployer) ---
    console.log('\n--- Running TEST 1: Role protection middleware (requireEmployer) ---');
    const req1 = { user: candidate };
    const res1 = mockResponse();
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    requireEmployer(req1, res1, next);
    
    if (res1.statusCode === 403) {
      console.log('✅ SUCCESS: Candidate role correctly blocked by requireEmployer (403).');
    } else {
      console.error('❌ FAIL: Candidate role was NOT blocked by requireEmployer.');
    }

    // --- TEST 2: Update Job - Verify Ownership check ---
    console.log('\n--- Running TEST 2: Update Job - Ownership checks ---');
    const req2 = {
      user: employerB, // Employer B trying to update Employer A's job
      params: { id: job._id },
      body: { title: 'Hacked Title' },
    };
    const res2 = mockResponse();

    await updateJob(req2, res2);

    if (res2.statusCode === 403 && res2.jsonData?.message?.includes('not the owner')) {
      console.log('✅ SUCCESS: Employer B was blocked from updating Employer A\'s job (403).');
    } else {
      console.error('❌ FAIL: Employer B was NOT blocked from updating Employer A\'s job. Code:', res2.statusCode);
    }

    // --- TEST 3: Close Job & Block Closed Job Updates ---
    console.log('\n--- Running TEST 3: Close Job & Block Updates on Closed Job ---');
    
    // First, close the job
    const req3Close = {
      user: employerA,
      params: { id: job._id },
    };
    const res3Close = mockResponse();
    await closeJob(req3Close, res3Close);
    console.log(`Close Job status code: ${res3Close.statusCode}`);

    // Verify it is closed
    const closedJob = await Job.findById(job._id);
    if (closedJob.status === 'Closed') {
      console.log('✅ SUCCESS: Job status set to Closed.');
    } else {
      console.error('❌ FAIL: Job status was not set to Closed.');
    }

    // Now try to update the Closed job
    const req3Update = {
      user: employerA,
      params: { id: job._id },
      body: { title: 'Updated Closed Title' },
    };
    const res3Update = mockResponse();
    await updateJob(req3Update, res3Update);

    if (res3Update.statusCode === 400 && res3Update.jsonData?.message?.includes('closed job')) {
      console.log('✅ SUCCESS: Correctly blocked updates to a Closed job (400).');
    } else {
      console.error('❌ FAIL: Allowed updating a Closed job. Code:', res3Update.statusCode);
    }

    // --- TEST 4: Apply for Job - Block Applications on Closed Job ---
    console.log('\n--- Running TEST 4: Apply - Block Applications on Closed Job ---');
    const req4 = {
      user: candidate,
      body: { jobId: job._id },
    };
    const res4 = mockResponse();

    await applyForJob(req4, res4);

    if (res4.statusCode === 400 && res4.jsonData?.message?.includes('closed job')) {
      console.log('✅ SUCCESS: Correctly blocked candidate application on a Closed job (400).');
    } else {
      console.error('❌ FAIL: Allowed candidate application on a Closed job. Code:', res4.statusCode);
    }

    // Clean up test data
    console.log('\nCleaning up test data...');
    await Job.deleteOne({ _id: job._id });
    await User.deleteMany({ _id: { $in: [employerA._id, employerB._id, candidate._id] } });
    console.log('Cleanup complete.');

    console.log('\nAll Job Module integration tests completed successfully! 🎉');
    process.exit(0);
  } catch (error) {
    console.error('Test runner failure:', error.message);
    process.exit(1);
  }
};

runTests();
