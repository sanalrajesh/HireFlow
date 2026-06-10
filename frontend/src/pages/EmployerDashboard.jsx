import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Briefcase, Users, PlusCircle, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

const EmployerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch stats
        const statsRes = await API.get('/applications/dashboard-stats');
        setStats(statsRes.data);

        // Fetch employer jobs
        const jobsRes = await API.get('/jobs/employer');
        setRecentJobs(jobsRes.data.slice(0, 3) || []); // show top 3 recent jobs
      } catch (err) {
        console.error('Fetch dashboard error:', err.message);
        setError('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Employer Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Hello, {user?.fullName || 'Employer'}. Here is your recruitment overview.</p>
        </div>
        <Link
          to="/employer/jobs/create"
          className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-all-200 hover-scale shadow-sm"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Post New Job</span>
        </Link>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-danger-light text-danger p-4 rounded-xl border border-red-200">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Statistics Grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Total Jobs */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover-scale flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Postings</span>
              <h3 className="text-3xl font-extrabold text-slate-800">{stats.totalJobs}</h3>
            </div>
            <div className="bg-primary/10 text-primary p-3.5 rounded-xl">
              <Briefcase className="h-6 w-6" />
            </div>
          </div>

          {/* Card 2: Open Jobs */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover-scale flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Jobs</span>
              <h3 className="text-3xl font-extrabold text-slate-800">{stats.openJobs}</h3>
            </div>
            <div className="bg-success/10 text-success p-3.5 rounded-xl">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>

          {/* Card 3: Closed Jobs */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover-scale flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Closed Jobs</span>
              <h3 className="text-3xl font-extrabold text-slate-800">{stats.closedJobs}</h3>
            </div>
            <div className="bg-slate-100 text-slate-500 p-3.5 rounded-xl">
              <XCircle className="h-6 w-6" />
            </div>
          </div>

          {/* Card 4: Total Applicants */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover-scale flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Applicants</span>
              <h3 className="text-3xl font-extrabold text-slate-800">{stats.totalApplicants}</h3>
            </div>
            <div className="bg-amber-50 text-amber-500 p-3.5 rounded-xl">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>
      )}

      {/* Recent Jobs Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">Recent Postings</h3>
          <Link to="/employer/jobs" className="text-xs font-bold text-primary hover:underline">
            Manage All Jobs
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {recentJobs.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">
              You haven't posted any jobs yet. Get started by clicking "Post New Job".
            </div>
          ) : (
            recentJobs.map((job) => (
              <div key={job._id} className="py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 group">
                <div>
                  <h4 className="font-bold text-slate-800 group-hover:text-primary transition-all-200">{job.title}</h4>
                  <div className="flex gap-4 text-xs text-slate-400 mt-1">
                    <span>{job.location}</span>
                    <span>•</span>
                    <span>${job.salary.toLocaleString()}/yr</span>
                    <span>•</span>
                    <span className={`font-semibold ${job.status === 'Open' ? 'text-success' : 'text-slate-400'}`}>
                      {job.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-6 self-start sm:self-center">
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-800">{job.applicationCount}</p>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Applicants</p>
                  </div>
                  <Link
                    to={`/employer/jobs/edit/${job._id}`}
                    className="text-xs font-semibold text-primary border border-slate-200 px-3 py-1.5 rounded hover:bg-slate-50 transition-all-200"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;
