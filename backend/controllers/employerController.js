const EmployerProfile = require('../models/EmployerProfile');

// @desc    Get employer profile details
// @route   GET /api/employer/profile
// @access  Private (Employer only)
const getEmployerProfile = async (req, res) => {
  try {
    let profile = await EmployerProfile.findOne({ userId: req.user._id });

    if (!profile) {
      return res.json({
        companyName: '',
        companyDescription: '',
        companyWebsite: '',
        companyLocation: '',
        companyEmail: req.user.email, // default to employer's registered email
        companyPhone: '',
      });
    }

    res.json({
      companyName: profile.companyName || '',
      companyDescription: profile.companyDescription || '',
      companyWebsite: profile.companyWebsite || '',
      companyLocation: profile.companyLocation || '',
      companyEmail: profile.companyEmail || '',
      companyPhone: profile.companyPhone || '',
    });
  } catch (error) {
    console.error('Get Employer Profile Error:', error.message);
    res.status(500).json({ message: 'Server error while fetching employer profile' });
  }
};

// @desc    Create or update employer profile details
// @route   PUT /api/employer/profile
// @access  Private (Employer only)
const upsertEmployerProfile = async (req, res) => {
  const {
    companyName,
    companyDescription,
    companyWebsite,
    companyLocation,
    companyEmail,
    companyPhone,
  } = req.body;

  if (
    !companyName || !companyName.trim() ||
    !companyDescription || !companyDescription.trim() ||
    !companyWebsite || !companyWebsite.trim() ||
    !companyLocation || !companyLocation.trim() ||
    !companyEmail || !companyEmail.trim() ||
    !companyPhone || !companyPhone.trim()
  ) {
    return res.status(400).json({ message: 'All company details (Company Name, Website, Location, Contact Email, Contact Number, and Description) are required.' });
  }

  try {
    const profileData = {
      companyName,
      companyDescription,
      companyWebsite,
      companyLocation,
      companyEmail,
      companyPhone,
    };

    let profile = await EmployerProfile.findOne({ userId: req.user._id });

    if (profile) {
      profile = await EmployerProfile.findOneAndUpdate(
        { userId: req.user._id },
        { $set: profileData },
        { new: true, runValidators: true }
      );
    } else {
      profile = await EmployerProfile.create({
        userId: req.user._id,
        ...profileData,
      });
    }

    res.json({
      success: true,
      message: 'Company profile updated successfully',
      profile: {
        companyName: profile.companyName,
        companyDescription: profile.companyDescription || '',
        companyWebsite: profile.companyWebsite || '',
        companyLocation: profile.companyLocation || '',
        companyEmail: profile.companyEmail || '',
        companyPhone: profile.companyPhone || '',
      },
    });
  } catch (error) {
    console.error('Update Employer Profile Error:', error.message);
    res.status(500).json({ message: 'Server error while updating company profile' });
  }
};

module.exports = {
  getEmployerProfile,
  upsertEmployerProfile,
};
