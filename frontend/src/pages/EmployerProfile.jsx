import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Building, Globe, MapPin, Mail, Phone, FileText, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

const EmployerProfile = () => {
  const [companyName, setCompanyName] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyLocation, setCompanyLocation] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await API.get('/employer/profile');
        const data = res.data;

        setCompanyName(data.companyName || '');
        setCompanyDescription(data.companyDescription || '');
        setCompanyWebsite(data.companyWebsite || '');
        setCompanyLocation(data.companyLocation || '');
        setCompanyEmail(data.companyEmail || '');
        setCompanyPhone(data.companyPhone || '');
      } catch (err) {
        console.error('Fetch employer profile error:', err.message);
        setError('Failed to load company profile details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setError('Company Name is required');
      return;
    }
    if (!companyWebsite.trim()) {
      setError('Company Website is required');
      return;
    }
    if (!companyLocation.trim()) {
      setError('Company Location is required');
      return;
    }
    if (!companyEmail.trim()) {
      setError('Contact Email is required');
      return;
    }
    if (!companyPhone.trim()) {
      setError('Contact Number is required');
      return;
    }
    if (!companyDescription.trim()) {
      setError('Company Description & Details are required');
      return;
    }

    setUpdating(true);
    setError('');
    setMessage('');

    try {
      const res = await API.put('/employer/profile', {
        companyName,
        companyDescription,
        companyWebsite,
        companyLocation,
        companyEmail,
        companyPhone,
      });

      if (res.data.success) {
        setMessage('Company profile updated successfully.');
      }
    } catch (err) {
      console.error('Update company profile error:', err.message);
      setError(err.response?.data?.message || 'Failed to update company profile.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-4 text-left space-y-6">
      
      {/* Alerts */}
      {error && (
        <div className="bg-danger-light text-danger p-4 rounded-xl border border-red-200 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {message && (
        <div className="bg-success-light text-success p-4 rounded-xl border border-green-200 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" />
          <span className="text-sm font-medium">{message}</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-6 flex items-center gap-2">
          <Building className="h-5 w-5 text-primary" />
          <span>Company Profile Details</span>
        </h3>

        <form onSubmit={handleProfileSubmit} className="space-y-6">
          
          {/* Company Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Company Name <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Building className="h-4 w-4" />
              </span>
              <input
                type="text"
                required
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-slate-800"
                placeholder="e.g. Acme Corporation"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
          </div>

          {/* Double Column: Website & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Website */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Company Website <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Globe className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-slate-800"
                  placeholder="e.g. https://acme.com"
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Company Location <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <MapPin className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-slate-800"
                  placeholder="e.g. Seattle, WA or Remote"
                  value={companyLocation}
                  onChange={(e) => setCompanyLocation(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Double Column: Contact Email & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Contact Email <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-slate-800"
                  placeholder="e.g. contact@acme.com"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Contact Number <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Phone className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-slate-800"
                  placeholder="e.g. +1 (555) 123-4567"
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Company Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Company Description & Details <span className="text-danger">*</span>
            </label>
            <textarea
              rows={6}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-slate-800 font-normal"
              placeholder="Provide a comprehensive summary of your company, domain, size, and values..."
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
            />
          </div>

          {/* Action button */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={updating}
              className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition-all-200 hover-scale shadow-sm"
            >
              <Save className="h-4 w-4" />
              <span>{updating ? 'Saving changes...' : 'Save Profile'}</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};

export default EmployerProfile;
