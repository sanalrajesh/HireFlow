import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { MapPin, DollarSign, Briefcase, Calendar, ChevronLeft, CheckCircle2, ShieldAlert } from 'lucide-react';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(true);
  const [applySuccess, setApplySuccess] = useState('');

  useEffect(() => {
    const fetchJobDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await API.get(`/jobs/${id}`);
        setJob(res.data);

        // Check if candidate already applied & profile completeness if user is logged in as Candidate
        if (user && user.role === 'Candidate') {
          const appsRes = await API.get('/applications/my');
          const hasApplied = appsRes.data.some((app) => app.jobId && app.jobId._id === id);
          setApplied(hasApplied);

          const profileRes = await API.get('/candidate/profile');
          const profile = profileRes.data;
          const complete = (
            profile &&
            profile.phone &&
            profile.location &&
            profile.resumeUrl &&
            profile.summary &&
            profile.skills && profile.skills.length > 0 &&
            profile.education && profile.education.length > 0 &&
            profile.experience && profile.experience.length > 0
          );
          setIsProfileComplete(!!complete);
        }
      } catch (err) {
        console.error('Fetch job details error:', err.message);
        setError(err.response?.data?.message || 'Failed to load job details.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id, user]);

  const handleApply = async () => {
    if (!user) {
      // Direct guest to login page
      navigate('/login');
      return;
    }

    if (user.role !== 'Candidate') {
      setError('Only candidates can apply for job postings.');
      return;
    }

    setApplying(true);
    setError('');
    setApplySuccess('');

    try {
      const res = await API.post('/applications', { jobId: id });
      if (res.data.success) {
        setApplied(true);
        setApplySuccess('Your application has been submitted successfully!');
      }
    } catch (err) {
      console.error('Apply job error:', err.message);
      setError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="max-w-3xl mx-auto py-8 text-left space-y-4">
        <Link to="/jobs" className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-primary">
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Listings</span>
        </Link>
        <div className="bg-danger-light text-danger p-6 border border-red-200 rounded-2xl flex items-start gap-3">
          <ShieldAlert className="h-6 w-6 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-bold">Error Loading Job</h3>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-4 text-left space-y-6">

      {/* Back button */}
      <Link to="/jobs" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-primary transition-all-200">
        <ChevronLeft className="h-4 w-4" />
        <span>Back to Listings</span>
      </Link>

      {/* Messages */}
      {error && (
        <div className="bg-danger-light text-danger p-4 rounded-xl border border-red-200 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 mt-0.5 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {applySuccess && (
        <div className="bg-success-light text-success p-4 rounded-xl border border-green-200 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" />
          <span className="text-sm font-medium">{applySuccess}</span>
        </div>
      )}

      {/* Profile Incomplete Warning Banner */}
      {!isProfileComplete && user && user.role === 'Candidate' && (
        <div className="bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-200 flex items-start gap-3 animate-pulse">
          <ShieldAlert className="h-5 w-5 mt-0.5 shrink-0 text-amber-500" />
          <div>
            <span className="text-sm font-semibold">Profile Incomplete</span>
            <p className="text-xs mt-0.5 text-slate-600">
              You must fill out all profile details (phone, location, skills, summary, education, and experience) and upload a resume before you can apply to job listings. <Link to="/candidate/profile" className="underline font-bold text-primary">Update Profile Now</Link>
            </p>
          </div>
        </div>
      )}

      {/* Main card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">

        {/* Header section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${job.status === 'Open' ? 'bg-success-light text-success' : 'bg-slate-100 text-slate-600'
                }`}>
                {job.status}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
                {job.employmentType || 'Full-time'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mt-2">{job.title}</h1>
            <p className="text-sm font-semibold text-slate-500 mt-1">
              at {job.employerId?.fullName || 'Employer'}
            </p>
          </div>

          {/* Action button */}
          <div className="w-full md:w-auto">
            {job.status === 'Closed' ? (
              <button
                disabled
                className="w-full md:w-auto px-6 py-3 rounded-lg bg-slate-200 text-slate-500 font-semibold text-sm cursor-not-allowed"
              >
                Applications Closed
              </button>
            ) : applied ? (
              <button
                disabled
                className="w-full md:w-auto px-6 py-3 rounded-lg bg-success/10 text-success border border-success/20 font-semibold text-sm flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Applied</span>
              </button>
            ) : !isProfileComplete ? (
              <Link
                to="/candidate/profile"
                className="w-full md:w-auto block text-center px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition-all-200 hover-scale shadow-md"
              >
                Complete Profile to Apply
              </Link>
            ) : (
              <button
                onClick={handleApply}
                disabled={applying}
                className="w-full md:w-auto px-6 py-3 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold text-sm transition-all-200 hover-scale shadow-md"
              >
                {applying ? 'Submitting...' : 'Apply for Job'}
              </button>
            )}
          </div>
        </div>

        {/* Info badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 bg-slateBg rounded-xl p-4 border border-slate-100">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Salary Range</span>
            <div className="flex items-center gap-1 font-bold text-slate-800 text-sm">
              <DollarSign className="h-4 w-4 text-slate-400" />
              <span>${job.salary.toLocaleString()}/yr</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Location</span>
            <div className="flex items-center gap-1 font-bold text-slate-800 text-sm">
              <MapPin className="h-4 w-4 text-slate-400" />
              <span>{job.location}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Experience Level</span>
            <div className="flex items-center gap-1 font-bold text-slate-800 text-sm">
              <Briefcase className="h-4 w-4 text-slate-400" />
              <span>{job.experienceLevel || 'Mid-level'}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Date Posted</span>
            <div className="flex items-center gap-1 font-bold text-slate-800 text-sm">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>{new Date(job.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-slate-800">Job Description</h3>
          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
            {job.description}
          </p>
        </div>

        {/* Required Skills */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">Required Skills</h3>
          <div className="flex flex-wrap gap-2">
            {job.requiredSkills && job.requiredSkills.map((skill, index) => (
              <span
                key={index}
                className="text-xs bg-primary/5 text-primary border border-primary/10 px-3 py-1.5 rounded-lg font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
