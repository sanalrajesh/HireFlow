const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employer ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    salary: {
      type: Number,
      required: [true, 'Salary is required'],
      min: [0, 'Salary must be positive'],
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    employmentType: {
      type: String,
      trim: true,
    },
    experienceLevel: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['Open', 'Closed'],
        message: 'Status must be Open or Closed',
      },
      default: 'Open',
    },
    applicationCount: {
      type: Number,
      default: 0,
      min: [0, 'Application count cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for search and filtering performance
jobSchema.index({ title: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ salary: 1 });
jobSchema.index({ status: 1 });

module.exports = mongoose.model('Job', jobSchema);
