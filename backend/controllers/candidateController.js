const CandidateProfile = require('../models/CandidateProfile');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// @desc    Get candidate profile
// @route   GET /api/candidate/profile
// @access  Private (Candidate only)
const getCandidateProfile = async (req, res) => {
  try {
    let profile = await CandidateProfile.findOne({ userId: req.user._id });

    // If profile doesn't exist, return empty fields with user name and email
    if (!profile) {
      return res.json({
        fullName: req.user.fullName,
        email: req.user.email,
        phone: '',
        location: '',
        skills: [],
        education: [],
        experience: [],
        summary: '',
        resumeUrl: '',
      });
    }

    res.json({
      fullName: req.user.fullName,
      email: req.user.email,
      phone: profile.phone || '',
      location: profile.location || '',
      skills: profile.skills || [],
      education: profile.education || [],
      experience: profile.experience || [],
      summary: profile.summary || '',
      resumeUrl: profile.resumeUrl || '',
    });
  } catch (error) {
    console.error('Get Profile Error:', error.message);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
};

// @desc    Create or Update candidate profile
// @route   POST /api/candidate/profile AND PUT /api/candidate/profile
// @access  Private (Candidate only)
const upsertCandidateProfile = async (req, res) => {
  const { phone, location, skills, education, experience, summary, fullName } = req.body;

  // 1. Validate that all required fields are present
  if (!fullName || !phone || !location || !skills || !education || !experience || !summary) {
    return res.status(400).json({ message: 'All profile details (Full Name, Phone, Location, Skills, Summary, Education, Experience) are required.' });
  }

  try {
    // 2. Update User name if provided
    if (fullName) {
      await User.findByIdAndUpdate(req.user._id, { fullName });
    }

    // 3. Format inputs (skills, education, and experience might be strings or arrays)
    const skillsArray = Array.isArray(skills)
      ? skills
      : skills
      ? skills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const eduArray = Array.isArray(education)
      ? education
      : education
      ? (typeof education === 'string' ? education.split('\n').map(s => s.trim()).filter(Boolean) : [education])
      : [];

    const expArray = Array.isArray(experience)
      ? experience
      : experience
      ? (typeof experience === 'string' ? experience.split('\n').map(s => s.trim()).filter(Boolean) : [experience])
      : [];

    if (skillsArray.length === 0 || eduArray.length === 0 || expArray.length === 0) {
      return res.status(400).json({ message: 'Please provide at least one entry for Skills, Education, and Experience.' });
    }

    const profileData = {
      phone,
      location,
      skills: skillsArray,
      education: eduArray,
      experience: expArray,
      summary,
    };

    let profile = await CandidateProfile.findOne({ userId: req.user._id });

    if (profile) {
      profile = await CandidateProfile.findOneAndUpdate(
        { userId: req.user._id },
        { $set: profileData },
        { new: true, runValidators: true }
      );
    } else {
      profile = await CandidateProfile.create({
        userId: req.user._id,
        ...profileData,
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: {
        fullName: fullName || req.user.fullName,
        email: req.user.email,
        phone: profile.phone || '',
        location: profile.location || '',
        skills: profile.skills || [],
        education: profile.education || [],
        experience: profile.experience || [],
        summary: profile.summary || '',
        resumeUrl: profile.resumeUrl || '',
      },
    });
  } catch (error) {
    console.error('Update Profile Error:', error.message);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};

// @desc    Upload candidate resume
// @route   POST /api/candidate/resume
// @access  Private (Candidate only)
const uploadResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a file' });
  }

  try {
    let profile = await CandidateProfile.findOne({ userId: req.user._id });
    const fileUrl = `/uploads/${req.file.filename}`;

    // If an old resume exists on disk, delete it
    if (profile && profile.resumeUrl) {
      const oldPath = path.join(__dirname, '..', profile.resumeUrl);
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch (err) {
          console.error('Failed to delete old resume file:', err.message);
        }
      }
    }

    if (profile) {
      profile.resumeUrl = fileUrl;
      await profile.save();
    } else {
      profile = await CandidateProfile.create({
        userId: req.user._id,
        resumeUrl: fileUrl,
      });
    }

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      resumeUrl: fileUrl,
    });
  } catch (error) {
    console.error('Upload Resume Error:', error.message);
    res.status(500).json({ message: 'Server error during resume upload' });
  }
};

// @desc    Delete candidate resume
// @route   DELETE /api/candidate/resume
// @access  Private (Candidate only)
const deleteResume = async (req, res) => {
  try {
    const profile = await CandidateProfile.findOne({ userId: req.user._id });

    if (!profile || !profile.resumeUrl) {
      return res.status(400).json({ message: 'No resume found to delete' });
    }

    // Delete the file from the uploads folder
    const filePath = path.join(__dirname, '..', profile.resumeUrl);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Failed to delete file from disk:', err.message);
      }
    }

    profile.resumeUrl = '';
    await profile.save();

    res.json({
      success: true,
      message: 'Resume deleted successfully',
    });
  } catch (error) {
    console.error('Delete Resume Error:', error.message);
    res.status(500).json({ message: 'Server error during resume deletion' });
  }
};

module.exports = {
  getCandidateProfile,
  upsertCandidateProfile,
  uploadResume,
  deleteResume,
};
