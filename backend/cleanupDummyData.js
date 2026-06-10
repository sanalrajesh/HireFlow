const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

const User = require('./models/User');
const CandidateProfile = require('./models/CandidateProfile');
const EmployerProfile = require('./models/EmployerProfile');
const Job = require('./models/Job');
const Application = require('./models/Application');
const connectDB = require('./config/db');

const cleanupDummyData = async () => {
  try {
    // Connect to database
    console.log('Connecting to MongoDB database...');
    await connectDB();

    // Default seeder account emails
    const dummyEmails = [
      // Employers
      'john.doe@techcorp.com',
      'jane.smith@designco.com',
      // Candidates
      'alice.j@gmail.com',
      'bob.smith@yahoo.com',
      'charlie.b@outlook.com'
    ];

    console.log('Finding dummy users in the database...');
    const dummyUsers = await User.find({ email: { $in: dummyEmails } });
    
    if (dummyUsers.length === 0) {
      console.log('No dummy seeder data found. Your database is already clean!');
      process.exit(0);
    }

    const dummyUserIds = dummyUsers.map(u => u._id);
    const employerIds = dummyUsers.filter(u => u.role === 'Employer').map(u => u._id);
    const candidateIds = dummyUsers.filter(u => u.role === 'Candidate').map(u => u._id);

    console.log(`Found ${dummyUsers.length} dummy users. Starting deletion of associated records...`);

    // 1. Delete associated Applications (where candidate is dummy OR the job belongs to dummy employer)
    const dummyJobs = await Job.find({ employerId: { $in: employerIds } });
    const dummyJobIds = dummyJobs.map(j => j._id);

    const deletedApps = await Application.deleteMany({
      $or: [
        { candidateId: { $in: candidateIds } },
        { jobId: { $in: dummyJobIds } }
      ]
    });
    console.log(`Deleted ${deletedApps.deletedCount} dummy application records.`);

    // 2. Delete dummy Candidate Profiles
    const deletedCandProfiles = await CandidateProfile.deleteMany({ userId: { $in: candidateIds } });
    console.log(`Deleted ${deletedCandProfiles.deletedCount} dummy candidate profile records.`);

    // 3. Delete dummy Employer Profiles
    const deletedEmpProfiles = await EmployerProfile.deleteMany({ userId: { $in: employerIds } });
    console.log(`Deleted ${deletedEmpProfiles.deletedCount} dummy employer profile records.`);

    // 4. Delete dummy Job postings
    const deletedJobs = await Job.deleteMany({ _id: { $in: dummyJobIds } });
    console.log(`Deleted ${deletedJobs.deletedCount} dummy job posting records.`);

    // 5. Delete the User accounts themselves
    const deletedUsers = await User.deleteMany({ _id: { $in: dummyUserIds } });
    console.log(`Deleted ${deletedUsers.deletedCount} dummy user accounts.`);

    console.log('\nDummy data clean-up completed successfully! 🎉');
    process.exit(0);
  } catch (error) {
    console.error(`Clean-up error: ${error.message}`);
    process.exit(1);
  }
};

cleanupDummyData();
