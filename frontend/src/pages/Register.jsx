import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Lock, UserPlus, AlertCircle } from 'lucide-react';

const Register = () => {
  const { register, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Seed the role from search param if valid (candidate/employer)
  const queryRole = searchParams.get('role');
  const initialRole = queryRole && ['candidate', 'employer'].includes(queryRole.toLowerCase())
    ? (queryRole.toLowerCase() === 'candidate' ? 'Candidate' : 'Employer')
    : 'Candidate';
    
  const [role, setRole] = useState(initialRole);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      const fallbackPath = user.role === 'Employer' ? '/employer/dashboard' : '/candidate/dashboard';
      navigate(fallbackPath, { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password || !role) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    setError('');
    setSubmitting(true);

    const result = await register(fullName, email, password, role);
    setSubmitting(false);

    if (result.success) {
      // Navigation is handled by the useEffect redirecting on 'user' change
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white border border-slate-200 p-8 rounded-2xl shadow-sm space-y-6 text-left hover-scale">
        
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-800">Create Account</h2>
          <p className="mt-2 text-sm text-slate-500">
            Join HireFlow to find talent or your next tech job.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-danger-light text-danger p-4 rounded-xl flex items-start gap-3 border border-red-200">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <User className="h-5 w-5" />
              </span>
              <input
                type="text"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-slate-800"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Mail className="h-5 w-5" />
              </span>
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-slate-800"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Password (Min. 8 characters)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Lock className="h-5 w-5" />
              </span>
              <input
                type="password"
                required
                minLength={8}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-slate-800"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Role selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Join As
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('Candidate')}
                className={`py-2.5 rounded-lg border font-semibold text-sm transition-all-200 text-center ${
                  role === 'Candidate'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-slate-300 hover:bg-slate-50 text-slate-600'
                }`}
              >
                Candidate (Seeker)
              </button>
              <button
                type="button"
                onClick={() => setRole('Employer')}
                className={`py-2.5 rounded-lg border font-semibold text-sm transition-all-200 text-center ${
                  role === 'Employer'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-slate-300 hover:bg-slate-50 text-slate-600'
                }`}
              >
                Employer (Hiring)
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex justify-center items-center gap-2 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-medium py-3 rounded-lg shadow-md transition-all-200 hover-scale"
          >
            <UserPlus className="h-5 w-5" />
            <span>{submitting ? 'Registering...' : 'Sign Up'}</span>
          </button>
        </form>

        {/* Toggle to Login */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-semibold">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
