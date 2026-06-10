import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { ArrowLeft, Save, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';

const EmployerCreateJob = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [experienceLevel, setExperienceLevel] = useState('Mid-level');

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleReset = () => {
    setTitle('');
    setDescription('');
    setLocation('');
    setSalary('');
    setSkillsInput('');
    setEmploymentType('Full-time');
    setExperienceLevel('Mid-level');
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !location || !salary) {
      setError('Please fill in all required fields (Title, Description, Location, and Salary)');
      return;
    }
    const numericSalary = Number(salary);
    if (isNaN(numericSalary) || numericSalary <= 0) {
      setError('Salary must be a positive number');
      return;
    }

    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      // Split requiredSkills by comma and clean up whitespace
      const requiredSkills = skillsInput
        ? skillsInput.split(',').map((skill) => skill.trim()).filter(Boolean)
        : [];

      const res = await API.post('/jobs', {
        title,
        description,
        location,
        salary: numericSalary,
        requiredSkills,
        employmentType,
        experienceLevel,
      });

      if (res.data.success) {
        setMessage('Job posting created successfully!');
        // Redirect to Manage Jobs dashboard after 1.5 seconds
        setTimeout(() => {
          navigate('/employer/jobs');
        }, 1500);
      }
    } catch (err) {
      console.error('Create job error:', err.message);
      setError(err.response?.data?.message || 'Failed to create job posting.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-4 text-left space-y-6">
      
      {/* Back link */}
      <Link to="/employer/jobs" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-primary transition-all-200">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Manage Jobs</span>
      </Link>

      {/* Alerts */}
      {error && (
        <div className="bg-danger-light text-danger p-4 rounded-xl border border-red-200 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {message && (
        <div className="bg-success-light text-success p-4 rounded-xl border border-green-200 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" />
          <span className="text-sm font-medium">{message}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Post a New Position</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Job Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Job Title <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-slate-800"
              placeholder="e.g. Senior Frontend Developer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Job Description <span className="text-danger">*</span>
            </label>
            <textarea
              required
              rows={6}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-slate-800 whitespace-pre-wrap"
              placeholder="Outline the responsibilities, project scope, and daily tasks..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Double Column: Location & Salary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Location <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-slate-800"
                placeholder="e.g. San Francisco, CA or Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            {/* Salary */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Annual Salary (USD) <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                required
                min={0}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-slate-800"
                placeholder="e.g. 120000"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
              />
            </div>
          </div>

          {/* Double Column: Employment Type & Experience Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Employment Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Employment Type
              </label>
              <select
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-slate-800 bg-white"
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Temporary">Temporary</option>
              </select>
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Experience Level
              </label>
              <select
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-slate-800 bg-white"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
              >
                <option value="Entry-level">Entry-level</option>
                <option value="Mid-level">Mid-level</option>
                <option value="Senior-level">Senior-level</option>
                <option value="Lead / Management">Lead / Management</option>
              </select>
            </div>
          </div>

          {/* Required Skills */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Required Skills (comma-separated)
            </label>
            <input
              type="text"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-slate-800"
              placeholder="e.g. React, Node.js, Mongoose, Tailwind CSS"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 px-4 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all-200"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset Form</span>
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition-all-200 hover-scale shadow-sm"
            >
              <Save className="h-4 w-4" />
              <span>{submitting ? 'Saving...' : 'Save Job'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EmployerCreateJob;
