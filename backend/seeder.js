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

const seedData = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing collections
    console.log('Clearing database tables...');
    await User.deleteMany();
    await CandidateProfile.deleteMany();
    await EmployerProfile.deleteMany();
    await Job.deleteMany();
    await Application.deleteMany();
    console.log('Database tables cleared.');

    // 1. Create Employers
    console.log('Creating Employers...');
    const employer1 = await User.create({
      fullName: 'John Doe',
      email: 'john.doe@techcorp.com',
      password: 'password123',
      role: 'Employer',
    });

    const employer2 = await User.create({
      fullName: 'Jane Smith',
      email: 'jane.smith@designco.com',
      password: 'password123',
      role: 'Employer',
    });

    await EmployerProfile.create([
      {
        userId: employer1._id,
        companyName: 'TechCorp Solutions',
        companyDescription: 'Leading software development firm.',
        companyWebsite: 'https://techcorp.com',
        companyLocation: 'San Francisco, CA',
      },
      {
        userId: employer2._id,
        companyName: 'DesignCo Agency',
        companyDescription: 'Creative UI/UX design and branding agency.',
        companyWebsite: 'https://designco.agency',
        companyLocation: 'New York, NY',
      },
    ]);
    console.log('Employers and their profiles created.');

    // 2. Create Candidates
    console.log('Creating Candidates...');
    const candidate1 = await User.create({
      fullName: 'Alice Johnson',
      email: 'alice.j@gmail.com',
      password: 'password123',
      role: 'Candidate',
    });

    const candidate2 = await User.create({
      fullName: 'Bob Smith',
      email: 'bob.smith@yahoo.com',
      password: 'password123',
      role: 'Candidate',
    });

    const candidate3 = await User.create({
      fullName: 'Charlie Brown',
      email: 'charlie.b@outlook.com',
      password: 'password123',
      role: 'Candidate',
    });

    await CandidateProfile.create([
      {
        userId: candidate1._id,
        phone: '123-456-7890',
        location: 'Austin, TX',
        skills: ['React', 'Node.js', 'Express', 'MongoDB'],
        resumeUrl: 'https://resumes.hireflow.com/alice_johnson.pdf',
        summary: 'Experienced full-stack software engineer looking for a React/Node role.',
        education: ['B.S. in Computer Science, UT Austin (2018)'],
        experience: ['Software Engineer at TechCorp (2020 - 2024)', 'Intern at WebApps Inc (2018)'],
      },
      {
        userId: candidate2._id,
        phone: '987-654-3210',
        location: 'Seattle, WA',
        skills: ['Python', 'Django', 'PostgreSQL', 'Docker'],
        resumeUrl: 'https://resumes.hireflow.com/bob_smith.pdf',
        summary: 'Backend developer with 4 years of experience focusing on scalable APIs.',
        education: ['M.S. in Computer Science, Stanford University (2020)'],
        experience: ['Backend Lead at MicroServices Co (2020 - Present)'],
      },
      {
        userId: candidate3._id,
        phone: '555-555-5555',
        location: 'Remote',
        skills: ['UI/UX Design', 'Figma', 'HTML/CSS', 'Tailwind'],
        resumeUrl: 'https://resumes.hireflow.com/charlie_brown.pdf',
        summary: 'Creative designer focused on crafting interactive and intuitive interfaces.',
        education: ['B.F.A. in Graphic Design, Rhode Island School of Design (2019)'],
        experience: ['UI/UX Designer at CreativeHub (2019 - Present)'],
      },
    ]);
    console.log('Candidates and their profiles created.');

    // 3. Create Jobs
    console.log('Creating Jobs...');
    const job1 = await Job.create({
      employerId: employer1._id,
      title: 'Full Stack Engineer',
      description: 'Build backend and frontend features for our core SaaS product using MERN stack.',
      location: 'San Francisco, CA',
      salary: 120000,
      requiredSkills: ['React', 'Node.js', 'MongoDB', 'Express'],
      employmentType: 'Full-time',
      experienceLevel: 'Mid-level',
      status: 'Open',
    });

    const job2 = await Job.create({
      employerId: employer1._id,
      title: 'Backend Developer',
      description: 'Design and deploy robust REST APIs using Node.js, Express, and microservices.',
      location: 'Remote (US)',
      salary: 110000,
      requiredSkills: ['Node.js', 'Express', 'MongoDB', 'Docker'],
      employmentType: 'Full-time',
      experienceLevel: 'Mid-level',
      status: 'Open',
    });

    const job3 = await Job.create({
      employerId: employer1._id,
      title: 'DevOps Engineer',
      description: 'Manage CI/CD pipelines, cloud infrastructure on AWS, and orchestration using Kubernetes.',
      location: 'San Francisco, CA',
      salary: 135000,
      requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
      employmentType: 'Contract',
      experienceLevel: 'Senior-level',
      status: 'Closed',
    });

    const job4 = await Job.create({
      employerId: employer2._id,
      title: 'UI/UX Designer',
      description: 'Collaborate with product teams to design web and mobile mockups in Figma.',
      location: 'New York, NY',
      salary: 95000,
      requiredSkills: ['Figma', 'UI/UX Design', 'Wireframing'],
      employmentType: 'Full-time',
      experienceLevel: 'Mid-level',
      status: 'Open',
    });

    const job5 = await Job.create({
      employerId: employer2._id,
      title: 'Frontend Developer',
      description: 'Build polished web interfaces from design mockups using HTML, CSS, React, and Tailwind.',
      location: 'Remote',
      salary: 90000,
      requiredSkills: ['React', 'Figma', 'Tailwind', 'HTML/CSS'],
      employmentType: 'Part-time',
      experienceLevel: 'Entry-level',
      status: 'Open',
    });
    console.log('Jobs created.');

    // 4. Create Applications
    console.log('Creating Applications...');
    const applications = [
      { candidateId: candidate1._id, jobId: job1._id, status: 'Applied' },
      { candidateId: candidate1._id, jobId: job2._id, status: 'Shortlisted' },
      { candidateId: candidate2._id, jobId: job2._id, status: 'Applied' },
      { candidateId: candidate3._id, jobId: job4._id, status: 'Applied' },
      { candidateId: candidate3._id, jobId: job5._id, status: 'Shortlisted' },
    ];

    for (const app of applications) {
      await Application.create(app);
      await Job.findByIdAndUpdate(app.jobId, { $inc: { applicationCount: 1 } });
    }
    console.log('Applications created successfully.');

    console.log('Database seeded successfully! 🎉');
    process.exit(0);
  } catch (error) {
    console.error(`Seeding error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
