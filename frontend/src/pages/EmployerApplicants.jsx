import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../services/api';
import { Users, FileText, CheckCircle, XCircle, AlertCircle, Download, ExternalLink } from 'lucide-react';

const EmployerApplicants = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryJobId = searchParams.get('jobId') || '';

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(queryJobId);
  const [applicants, setApplicants] = useState([]);
  
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Fetch all employer's jobs for the dropdown selection
  useEffect(() => {
    const fetchEmployerJobs = async () => {
      setLoadingJobs(true);
      setError('');
      try {
        const res = await API.get('/jobs/employer');
        setJobs(res.data || []);
        
        // Default to first job if no jobId in query and jobs exist
        if (!queryJobId && res.data.length > 0) {
          setSelectedJobId(res.data[0]._id);
          setSearchParams({ jobId: res.data[0]._id });
        }
      } catch (err) {
        console.error('Fetch employer jobs error:', err.message);
        setError('Failed to load your job postings for dropdown list.');
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchEmployerJobs();
  }, []);

  // Fetch applicants when selectedJobId changes
  useEffect(() => {
    const fetchApplicants = async () => {
      if (!selectedJobId) return;
      
      setLoadingApplicants(true);
      setError('');
      try {
        const res = await API.get(`/applications/job/${selectedJobId}`);
        setApplicants(res.data || []);
      } catch (err) {
        console.error('Fetch applicants error:', err.message);
        setError('Failed to load applicants for the selected job position.');
      } finally {
        setLoadingApplicants(false);
      }
    };

    fetchApplicants();
  }, [selectedJobId]);

  const handleJobSelectChange = (e) => {
    const val = e.target.value;
    setSelectedJobId(val);
    setSearchParams({ jobId: val });
    setMessage('');
  };

  const handleStatusChange = async (appId, newStatus) => {
    setError('');
    setMessage('');
    try {
      const res = await API.patch(`/applications/${appId}/status`, { status: newStatus });
      if (res.data.success) {
        setMessage(`Applicant status successfully updated to ${newStatus}.`);
        
        // Update local applicants list state directly to avoid complete re-fetch
        setApplicants((prev) =>
          prev.map((app) => (app._id === appId ? { ...app, status: newStatus } : app))
        );
      }
    } catch (err) {
      console.error('Update status error:', err.message);
      setError(err.response?.data?.message || 'Failed to update applicant status.');
    }
  };

  const getResumeUrl = (url) => {
    if (!url) return '';
    // Resolve relative path against API server host
    const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${apiHost}${url}`;
  };

  if (loadingJobs && jobs.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800">Job Applicants</h1>
        <p className="text-slate-500 text-sm mt-1">Review applicant profiles, download resumes, and manage pipeline status.</p>
      </div>

      {/* Select job dropdown */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="w-full sm:max-w-md">
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Select Job Position
          </label>
          <select
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-slate-800 bg-white"
            value={selectedJobId}
            onChange={handleJobSelectChange}
          >
            {jobs.length === 0 ? (
              <option value="">No jobs posted yet</option>
            ) : (
              jobs.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.title} ({job.location}) — {job.applicationCount} applicants
                </option>
              ))
            )}
          </select>
        </div>
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

      {/* Applicants List */}
      {loadingApplicants ? (
        <div className="min-h-[200px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : !selectedJobId ? (
        <div className="py-8 text-center text-slate-400 text-sm">
          Please select a job position to view applicants.
        </div>
      ) : applicants.length === 0 ? (
        <div className="min-h-[250px] bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 text-center">
          <Users className="h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No Applicants Yet</h3>
          <p className="text-slate-500 text-sm max-w-sm mt-1">
            Nobody has applied for this position yet. Check back later or make sure the posting status is Open.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {applicants.map((app) => (
            <div
              key={app._id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6 hover-scale"
            >
              {/* Applicant details */}
              <div className="space-y-4 max-w-2xl flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-bold text-slate-800">{app.candidateId?.fullName}</h3>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                    app.status === 'Shortlisted'
                      ? 'bg-success-light text-success'
                      : app.status === 'Rejected'
                      ? 'bg-danger-light text-danger'
                      : 'bg-primary/10 text-primary'
                  }`}>
                    {app.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs text-slate-600">
                  <p><strong>Email:</strong> {app.candidateId?.email}</p>
                  <p><strong>Phone:</strong> {app.candidateProfile?.phone || 'Not provided'}</p>
                  <p><strong>Location:</strong> {app.candidateProfile?.location || 'Not provided'}</p>
                  <p><strong>Applied on:</strong> {new Date(app.appliedAt).toLocaleDateString()}</p>
                </div>

                {/* Summary */}
                {app.candidateProfile?.summary && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Candidate Summary</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">{app.candidateProfile.summary}</p>
                  </div>
                )}

                {/* Skills tags */}
                {app.candidateProfile?.skills && app.candidateProfile.skills.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Skills</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {app.candidateProfile.skills.map((skill, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience & Education */}
                {app.candidateProfile?.experience && app.candidateProfile.experience.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Experience</h4>
                    <ul className="list-disc pl-4 text-xs text-slate-600 space-y-0.5">
                      {app.candidateProfile.experience.map((exp, idx) => <li key={idx}>{exp}</li>)}
                    </ul>
                  </div>
                )}
                {app.candidateProfile?.education && app.candidateProfile.education.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Education</h4>
                    <ul className="list-disc pl-4 text-xs text-slate-600 space-y-0.5">
                      {app.candidateProfile.education.map((edu, idx) => <li key={idx}>{edu}</li>)}
                    </ul>
                  </div>
                )}

                {/* Resume Download */}
                {app.candidateProfile?.resumeUrl ? (
                  <a
                    href={getResumeUrl(app.candidateProfile.resumeUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline bg-primary/5 px-3 py-2 rounded-lg"
                  >
                    <FileText className="h-4 w-4" />
                    <span>View Resume Document</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-50 px-3 py-2 rounded-lg">
                    <FileText className="h-4 w-4" />
                    <span>No Resume Uploaded</span>
                  </div>
                )}
              </div>

              {/* Status Actions */}
              <div className="flex md:flex-col justify-end items-end gap-3 self-end md:self-start">
                <button
                  onClick={() => handleStatusChange(app._id, 'Shortlisted')}
                  disabled={app.status === 'Shortlisted'}
                  className="flex items-center gap-1 px-4 py-2.5 rounded-lg text-xs font-bold bg-success hover:bg-green-600 disabled:bg-success/50 text-white shadow-sm transition-all-200 hover-scale"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Shortlist</span>
                </button>
                <button
                  onClick={() => handleStatusChange(app._id, 'Rejected')}
                  disabled={app.status === 'Rejected'}
                  className="flex items-center gap-1 px-4 py-2.5 rounded-lg text-xs font-bold bg-danger hover:bg-red-600 disabled:bg-danger/50 text-white shadow-sm transition-all-200 hover-scale"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployerApplicants;
