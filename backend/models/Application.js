const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Candidate ID is required'],
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job ID is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['Applied', 'Shortlisted', 'Rejected'],
        message: 'Status must be Applied, Shortlisted, or Rejected',
      },
      default: 'Applied',
    },
  },
  {
    // Map standard timestamps to requested field names
    timestamps: {
      createdAt: 'appliedAt',
      updatedAt: 'updatedAt',
    },
  }
);

// Define single-field indexes
applicationSchema.index({ candidateId: 1 });
applicationSchema.index({ jobId: 1 });
applicationSchema.index({ status: 1 });

// Define compound unique index to prevent duplicate applications for a job
applicationSchema.index({ candidateId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
