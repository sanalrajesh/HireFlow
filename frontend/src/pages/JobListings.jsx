import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { Search, MapPin, DollarSign, Briefcase, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';

const JobListings = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search/Filter states
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  
  // Active search/filter states sent to API
  const [queryKeyword, setQueryKeyword] = useState('');
  const [queryLocation, setQueryLocation] = useState('');
  const [querySalary, setQuerySalary] = useState('');

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch jobs when search queries or page changes
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError('');
      try {
        const params = {
          page,
          limit: 6,
        };
        if (queryKeyword) params.keyword = queryKeyword;
        if (queryLocation) params.location = queryLocation;
        if (querySalary) params.salary = querySalary;

        const res = await API.get('/jobs/search', { params });
        setJobs(res.data.jobs || []);
        setTotalPages(res.data.pages || 1);
      } catch (err) {
        console.error('Fetch jobs error:', err.message);
        setError('Failed to load job listings. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [queryKeyword, queryLocation, querySalary, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on search trigger
    setQueryKeyword(keyword);
    setQueryLocation(location);
    setQuerySalary(salary);
  };

  const handleReset = () => {
    setKeyword('');
    setLocation('');
    setSalary('');
    setQueryKeyword('');
    setQueryLocation('');
    setQuerySalary('');
    setPage(1);
  };

  return (
    <div className="space-y-8 text-left py-4">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800">Explore Opportunities</h1>
        <p className="text-slate-500 text-sm mt-1">Discover your next role from our verified list of companies.</p>
      </div>

      {/* Search & Filter Bar */}
      <form onSubmit={handleSearchSubmit} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Keyword Search */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Search className="h-5 w-5" />
            </span>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-slate-800"
              placeholder="Search title, keywords or skills..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          {/* Location Filter */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <MapPin className="h-5 w-5" />
            </span>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-slate-800"
              placeholder="Filter by city, state, or Remote..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Salary Filter */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <DollarSign className="h-5 w-5" />
            </span>
            <input
              type="number"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-slate-800"
              placeholder="Minimum Annual Salary (USD)..."
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all-200"
          >
            Reset Filters
          </button>
          <button
            type="submit"
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition-all-200 hover-scale shadow-sm"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Search Jobs</span>
          </button>
        </div>
      </form>

      {/* Error State */}
      {error && (
        <div className="bg-danger-light text-danger p-4 rounded-xl border border-red-200">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Main Grid content */}
      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="min-h-[300px] bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 text-center">
          <Briefcase className="h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No Jobs Found</h3>
          <p className="text-slate-500 text-sm max-w-sm mt-1">
            We couldn't find any open job listings matching your search parameters. Try expanding your filters.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-white border border-slate-200 hover:border-primary/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all-200 flex flex-col justify-between hover-scale group"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
                      {job.employmentType || 'Full-time'}
                    </span>
                    <span className="text-xs text-primary font-bold">
                      ${job.salary.toLocaleString()}/yr
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-primary transition-all-200 line-clamp-1">
                    {job.title}
                  </h3>
                  
                  {/* Location & Experience */}
                  <div className="flex items-center gap-4 text-slate-500 text-xs mt-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{job.location}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5" />
                      <span>{job.experienceLevel || 'Mid-level'}</span>
                    </span>
                  </div>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {job.requiredSkills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="text-[10px] bg-primary/5 text-primary border border-primary/10 px-2 py-0.5 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.requiredSkills.length > 3 && (
                      <span className="text-[10px] text-slate-400 self-center">
                        +{job.requiredSkills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Posted on {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                  <Link
                    to={`/jobs/${job._id}`}
                    className="text-xs font-bold text-primary group-hover:underline flex items-center gap-0.5"
                  >
                    <span>View Details</span>
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-50 transition-all-200"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm font-semibold text-slate-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-50 transition-all-200"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobListings;
