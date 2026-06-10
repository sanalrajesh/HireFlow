import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, Building, ArrowRight, CheckCircle } from 'lucide-react';

const Home = () => {
  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="bg-white rounded-2xl border border-slate-200 p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 shadow-sm">
        <div className="space-y-6 max-w-xl text-left">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            <CheckCircle className="h-3.5 w-3.5" />
            Empowering Talent & Employers
          </span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-800 leading-tight">
            Find Your Dream Job <br />
            <span className="text-primary font-extrabold">Track Your Progress</span>
          </h1>
          <p className="text-slate-600 text-lg">
            HireFlow is a professional job board and application tracking platform. Connect with top tech companies, submit applications, and monitor status updates in real-time.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to="/jobs"
              className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-medium px-6 py-3 rounded-lg shadow-lg shadow-primary/20 transition-all-200 hover-scale"
            >
              <span>Explore Jobs</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/register"
              className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-medium px-6 py-3 rounded-lg transition-all-200"
            >
              Post a Position
            </Link>
          </div>
        </div>
        <div className="hidden md:flex flex-1 justify-center relative">
          <div className="w-80 h-80 rounded-full bg-primary/5 absolute blur-3xl -z-10" />
          <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl shadow-xl max-w-sm border border-slate-800 text-left hover-scale">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <span className="text-xs bg-success/10 text-success px-2.5 py-0.5 rounded font-medium">Platform Stats</span>
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            </div>
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4">
                <div className="bg-slate-800 p-2.5 rounded-lg text-primary">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">500+</h4>
                  <p className="text-xs text-slate-400">Active Job Postings</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-slate-800 p-2.5 rounded-lg text-success">
                  <Building className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">120+</h4>
                  <p className="text-xs text-slate-400">Verified Companies</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-slate-800 p-2.5 rounded-lg text-amber-500">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">15k+</h4>
                  <p className="text-xs text-slate-400">Talented Candidates</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portal Category Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Candidate Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-left space-y-4 hover-scale shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="bg-primary/10 text-primary w-12 h-12 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">For Candidates</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Create your profile, upload your resume, apply for open positions, and track status updates (Applied, Shortlisted, Rejected) directly from your dashboard.
            </p>
          </div>
          <Link
            to="/register?role=candidate"
            className="inline-flex items-center gap-1.5 text-primary hover:text-primary-hover font-semibold text-sm pt-4"
          >
            <span>Create Candidate Account</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Employer Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-left space-y-4 hover-scale shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="bg-success/10 text-success w-12 h-12 rounded-xl flex items-center justify-center">
              <Building className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">For Employers</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Post job openings, specify skills and salaries, view applicants, download resumes, and manage hiring pipeline status with email notification support.
            </p>
          </div>
          <Link
            to="/register?role=employer"
            className="inline-flex items-center gap-1.5 text-success hover:text-green-600 font-semibold text-sm pt-4"
          >
            <span>Create Employer Account</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
