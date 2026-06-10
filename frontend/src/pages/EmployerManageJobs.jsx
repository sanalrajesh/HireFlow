import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { Briefcase, PlusCircle, AlertCircle, XCircle, Trash2, Edit } from 'lucide-react';

const EmployerManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/jobs/employer');
      setJobs(res.data || []);
    } catch (err) {
      console.error('Fetch employer jobs error:', err.message);
      setError('Failed to load your job listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCloseJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to close this job listing? It will no longer accept applications.')) {
      return;
    }
    setError('');
    setMessage('');
    try {
      const res = await API.patch(`/jobs/${jobId}/close`);
      if (res.data.success) {
        setMessage('Job closed successfully.');
        fetchJobs(); // reload listings
      }
    } catch (err) {
      console.error('Close job error:', err.message);
      setError(err.response?.data?.message || 'Failed to close job listing.');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job listing permanently?')) {
      return;
    }
    setError('');
    setMessage('');
    try {
      await API.delete(`/jobs/${jobId}`);
      setMessage('Job deleted successfully.');
      fetchJobs(); // reload listings
    } catch (err) {
      console.error('Delete job error:', err.message);
      setError(err.response?.data?.message || 'Failed to delete job listing.');
    }
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Manage Job Postings</h1>
          <p className="text-slate-500 text-sm mt-1">Review applicant volumes, update status, or close postings.</p>
        </div>
        <Link
          to="/employer/jobs/create"
          className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-all-200 hover-scale shadow-sm"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Post New Job</span>
        </Link>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-danger-light text-danger p-4 rounded-xl border border-red-200">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {message && (
        <div className="bg-success-light text-success p-4 rounded-xl border border-green-200">
          <p className="text-sm font-medium">{message}</p>
        </div>
      )}

      {/* Jobs Listing */}
      {jobs.length === 0 ? (
        <div className="min-h-[300px] bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 text-center">
          <Briefcase className="h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No Jobs Posted</h3>
          <p className="text-slate-500 text-sm max-w-sm mt-1">
            You haven't posted any job openings yet. Start hiring by posting your first job!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover-scale group"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                    job.status === 'Open' ? 'bg-success-light text-success' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {job.status}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    ${job.salary.toLocaleString()}/yr
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-800 line-clamp-1">{job.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{job.location} • {job.employmentType || 'Full-time'}</p>
                
                {/* Stats badge */}
                <div className="mt-4 bg-slateBg rounded-xl p-3 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                    <span>Applicants:</span>
                    <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs">
                      {job.applicationCount}
                    </span>
                  </div>
                  <Link
                    to={`/employer/applicants?jobId=${job._id}`}
                    className="text-xs text-primary font-bold hover:underline"
                  >
                    View Applicants
                  </Link>
                </div>
              </div>

              {/* Operations Footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <Link
                  to={`/employer/jobs/edit/${job._id}`}
                  disabled={job.status === 'Closed'}
                  className={`flex items-center gap-1 text-xs font-bold border px-3 py-1.5 rounded transition-all-200 ${
                    job.status === 'Closed'
                      ? 'border-slate-100 text-slate-300 cursor-not-allowed bg-slate-50'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </Link>
                
                {job.status === 'Open' && (
                  <button
                    onClick={() => handleCloseJob(job._id)}
                    className="flex items-center gap-1 text-xs font-bold border border-danger/20 text-danger px-3 py-1.5 rounded hover:bg-danger/5 transition-all-200"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Close</span>
                  </button>
                )}

                <button
                  onClick={() => handleDeleteJob(job._id)}
                  className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-danger border border-transparent hover:border-danger/10 px-2.5 py-1.5 rounded transition-all-200"
                  title="Delete Job"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployerManageJobs;
