import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { FileText, MapPin, Briefcase, DollarSign, Calendar, ChevronRight } from 'lucide-react';

const CandidateApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await API.get('/applications/my');
        setApplications(res.data || []);
      } catch (err) {
        console.error('Fetch applications error:', err.message);
        setError('Failed to load your applications.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left py-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800">My Applications</h1>
        <p className="text-slate-500 text-sm mt-1">Review the status and timeline of all job positions you applied for.</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-danger-light text-danger p-4 rounded-xl border border-red-200">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Applications list */}
      {applications.length === 0 ? (
        <div className="min-h-[300px] bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 text-center">
          <FileText className="h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No Applications Submitted</h3>
          <p className="text-slate-500 text-sm max-w-sm mt-1 mb-6">
            You haven't submitted any job applications yet. Begin your job search today!
          </p>
          <Link
            to="/jobs"
            className="bg-primary hover:bg-primary-hover text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow-sm transition-all-200 hover-scale"
          >
            Search Openings
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((app) => (
            <div
              key={app._id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6 hover-scale group"
            >
              {/* Application Details */}
              <div className="space-y-4 max-w-2xl flex-1">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-primary transition-all-200">
                    {app.jobId?.title || 'Unknown Position'}
                  </h3>
                  <p className="text-sm font-semibold text-slate-500 mt-0.5">{app.jobId?.companyName || 'Company Name'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs text-slate-600 bg-slateBg rounded-xl p-3 border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span>{app.jobId?.location || 'Remote'}</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4 text-slate-400" />
                    <span>${app.jobId?.salary ? app.jobId.salary.toLocaleString() : 'N/A'}/yr</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 text-slate-400" />
                    <span>{app.jobId?.employmentType || 'Full-time'}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Status and Action */}
              <div className="flex md:flex-col justify-between items-end md:items-end gap-3 self-stretch md:self-center">
                <div className="text-left md:text-right">
                  {app.jobId?.status === 'Deleted' || !app.jobId ? (
                    <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-danger-light text-danger">
                      Deleted
                    </span>
                  ) : (
                    <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                      app.status === 'Shortlisted'
                        ? 'bg-success-light text-success'
                        : app.status === 'Rejected'
                        ? 'bg-danger-light text-danger'
                        : 'bg-primary/10 text-primary'
                    }`}>
                      {app.status}
                    </span>
                  )}
                  <p className="text-[10px] text-slate-400 mt-2">
                    Updated: {new Date(app.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                
                {app.jobId && app.jobId.status !== 'Deleted' ? (
                  <Link
                    to={`/jobs/${app.jobId._id}`}
                    className="flex items-center gap-0.5 text-xs font-bold text-primary group-hover:underline"
                  >
                    <span>View Posting</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                ) : (
                  <span className="text-xs font-semibold text-slate-400">
                    Posting Deleted
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CandidateApplications;
