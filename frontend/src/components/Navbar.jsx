import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Briefcase, LogOut, User, LayoutDashboard, FileText, Building } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-primary font-bold text-2xl tracking-tight">
              <Briefcase className="h-7 w-7 text-primary" />
              <span>Hire<span className="text-slate-800">Flow</span></span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link
              to="/jobs"
              className="text-slate-600 hover:text-primary font-medium text-sm transition-all-200"
            >
              Browse Jobs
            </Link>

            {user ? (
              <div className="flex items-center gap-4">
                {/* Dashboard Shortcut */}
                <Link
                  to={user.role === 'Employer' ? '/employer/dashboard' : '/candidate/dashboard'}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-primary font-medium text-sm transition-all-200"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>

                {/* Profile Shortcut */}
                {user.role === 'Candidate' ? (
                  <Link
                    to="/candidate/profile"
                    className="flex items-center gap-1.5 text-slate-600 hover:text-primary font-medium text-sm transition-all-200"
                  >
                    <User className="h-4 w-4" />
                    <span>My Profile</span>
                  </Link>
                ) : (
                  <Link
                    to="/employer/profile"
                    className="flex items-center gap-1.5 text-slate-600 hover:text-primary font-medium text-sm transition-all-200"
                  >
                    <Building className="h-4 w-4" />
                    <span>Company Profile</span>
                  </Link>
                )}

                {/* Separator */}
                <span className="h-5 w-px bg-slate-200" />

                {/* User Info & Logout */}
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-semibold text-slate-800">{user.fullName}</p>
                    <p className="text-[10px] text-slate-500 capitalize">{user.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 bg-slate-100 hover:bg-danger-light text-slate-700 hover:text-danger p-2 rounded-lg transition-all-200"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-slate-600 hover:text-primary font-medium text-sm px-3 py-2 rounded-md transition-all-200"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="bg-primary hover:bg-primary-hover text-white font-medium text-sm px-4 py-2 rounded-lg transition-all-200 hover-scale shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
