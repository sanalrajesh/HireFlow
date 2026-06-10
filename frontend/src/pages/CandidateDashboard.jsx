import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { FileText, CheckCircle2, XCircle, Clock, MapPin, Briefcase, ChevronRight } from 'lucide-react';

const CandidateDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        const statsRes = await API.get('/applications/dashboard-stats');
        setStats(statsRes.data);

        const appsRes = await API.get('/applications/my');
        setApplications(appsRes.data.slice(0, 3) || []); // show top 3 recent applications
      } catch (err) {
        console.error('Fetch candidate dashboard error:', err.message);
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
    <div className="space-y-8 text-left py-4">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800">Candidate Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Hello, {user?.fullName || 'Candidate'}. Monitor the progress of your active applications.</p>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-danger-light text-danger p-4 rounded-xl border border-red-200">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Statistics Counter Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Total Applications */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover-scale flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Applications</span>
              <h3 className="text-3xl font-extrabold text-slate-800">{stats.totalApplications}</h3>
            </div>
            <div className="bg-primary/10 text-primary p-3.5 rounded-xl">
              <FileText className="h-6 w-6" />
            </div>
          </div>

          {/* Card 2: Applied Count */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover-scale flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Applied (Pending)</span>
              <h3 className="text-3xl font-extrabold text-slate-800">{stats.appliedCount}</h3>
            </div>
            <div className="bg-blue-50 text-blue-500 p-3.5 rounded-xl">
              <Clock className="h-6 w-6" />
            </div>
          </div>

          {/* Card 3: Shortlisted Count */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover-scale flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Shortlisted</span>
              <h3 className="text-3xl font-extrabold text-slate-800">{stats.shortlistedCount}</h3>
            </div>
            <div className="bg-success/10 text-success p-3.5 rounded-xl">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>

          {/* Card 4: Rejected Count */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover-scale flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rejected</span>
              <h3 className="text-3xl font-extrabold text-slate-800">{stats.rejectedCount}</h3>
            </div>
            <div className="bg-danger/10 text-danger p-3.5 rounded-xl">
              <XCircle className="h-6 w-6" />
            </div>
          </div>
        </div>
      )}

      {/* Recent Applications list */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">Recent Applications</h3>
          <Link to="/candidate/applications" className="text-xs font-bold text-primary hover:underline">
            View All Applications
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {applications.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">
              You haven't submitted any job applications yet.{' '}
              <Link to="/jobs" className="text-primary font-semibold hover:underline">
                Browse open positions.
              </Link>
            </div>
          ) : (
            applications.map((app) => (
              <div key={app._id} className="py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 group">
                <div>
                  <h4 className="font-bold text-slate-800 group-hover:text-primary transition-all-200">
                    {app.jobId?.title || 'Unknown Position'}
                  </h4>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">{app.jobId?.companyName || 'Company'}</p>
                  
                  <div className="flex gap-4 text-xs text-slate-400 mt-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{app.jobId?.location || 'Remote'}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5" />
                      <span>{app.jobId?.employmentType || 'Full-time'}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6 self-start sm:self-center">
                  <div className="text-left sm:text-right">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                      app.status === 'Shortlisted'
                        ? 'bg-success-light text-success'
                        : app.status === 'Rejected'
                        ? 'bg-danger-light text-danger'
                        : 'bg-primary/10 text-primary'
                    }`}>
                      {app.status}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-2">
                      Applied: {new Date(app.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {app.jobId && (
                    <Link
                      to={`/jobs/${app.jobId._id}`}
                      className="p-1 rounded hover:bg-slate-100 transition-all-200"
                    >
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
