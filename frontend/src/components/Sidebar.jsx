import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  PlusCircle,
  LogOut,
  User,
  Home
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', to: '/employer/dashboard', icon: LayoutDashboard },
    { name: 'Manage Jobs', to: '/employer/jobs', icon: Briefcase, end: true },
    { name: 'Post a Job', to: '/employer/jobs/create', icon: PlusCircle },
    { name: 'Applicants', to: '/employer/applicants', icon: Users },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col justify-between border-r border-slate-800">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-2">
          <Briefcase className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl text-white tracking-tight">HireFlow <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded uppercase">Employer</span></span>
        </div>

        {/* User Info card */}
        {user && (
          <div className="p-4 border-b border-slate-800 bg-slate-950/40">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-lg text-primary">
                <User className="h-5 w-5" />
              </div>
              <div className="truncate">
                <h4 className="text-sm font-semibold text-white truncate">{user.fullName}</h4>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav Links */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all-200 ${
                    isActive
                      ? 'bg-primary text-white shadow-lg shadow-primary/25'
                      : 'hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 hover:text-white text-slate-400"
        >
          <Home className="h-4 w-4" />
          <span>Back to Main Site</span>
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-danger hover:bg-danger/10 hover:text-white transition-all-200 text-left"
        >
          <LogOut className="h-4 w-4" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
