import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { User, Phone, MapPin, FileText, Upload, Trash2, Save, AlertCircle, CheckCircle2, Award, BookOpen, GraduationCap } from 'lucide-react';

const CandidateProfile = () => {
  const { user, setUser } = useContext(AuthContext);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState('');
  const [summary, setSummary] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');

  const [selectedFile, setSelectedFile] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingResume, setDeletingResume] = useState(false);
  
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await API.get('/candidate/profile');
        const data = res.data;

        setFullName(data.fullName || '');
        setPhone(data.phone || '');
        setLocation(data.location || '');
        setSkills(data.skills ? data.skills.join(', ') : '');
        setEducation(data.education ? data.education.join('\n') : '');
        setExperience(data.experience ? data.experience.join('\n') : '');
        setSummary(data.summary || '');
        setResumeUrl(data.resumeUrl || '');
      } catch (err) {
        console.error('Fetch profile error:', err.message);
        setError('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Full Name is required');
      return;
    }
    if (!phone.trim()) {
      setError('Phone Number is required');
      return;
    }
    if (!location.trim()) {
      setError('Location is required');
      return;
    }
    if (!skills.trim()) {
      setError('Skills are required');
      return;
    }
    if (!summary.trim()) {
      setError('Professional Summary is required');
      return;
    }
    if (!experience.trim()) {
      setError('Work Experience is required');
      return;
    }
    if (!education.trim()) {
      setError('Education is required');
      return;
    }

    setUpdating(true);
    setError('');
    setMessage('');

    try {
      // Split newline fields into arrays of strings
      const eduArray = education
        ? education.split('\n').map((line) => line.trim()).filter(Boolean)
        : [];
      
      const expArray = experience
        ? experience.split('\n').map((line) => line.trim()).filter(Boolean)
        : [];

      const res = await API.put('/candidate/profile', {
        fullName,
        phone,
        location,
        skills,
        education: eduArray,
        experience: expArray,
        summary,
      });

      if (res.data.success) {
        setMessage('Profile updated successfully.');
        
        // Update user state context
        if (user) {
          setUser((prev) => ({ ...prev, fullName }));
        }
      }
    } catch (err) {
      console.error('Update profile error:', err.message);
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setUpdating(false);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setError('');
    setMessage('');
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError('');
    setMessage('');

    const formData = new FormData();
    formData.append('resume', selectedFile);

    try {
      const res = await API.post('/candidate/resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        setMessage('Resume uploaded successfully.');
        setResumeUrl(res.data.resumeUrl);
        setSelectedFile(null);
      }
    } catch (err) {
      console.error('Resume upload error:', err.message);
      setError(err.response?.data?.message || 'Failed to upload resume. PDF, DOC, DOCX files under 5MB only.');
    } finally {
      setUploading(false);
    }
  };

  const handleResumeDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your uploaded resume?')) {
      return;
    }

    setDeletingResume(true);
    setError('');
    setMessage('');

    try {
      const res = await API.delete('/candidate/resume');
      if (res.data.success) {
        setMessage('Resume deleted successfully.');
        setResumeUrl('');
      }
    } catch (err) {
      console.error('Resume deletion error:', err.message);
      setError(err.response?.data?.message || 'Failed to delete resume.');
    } finally {
      setDeletingResume(false);
    }
  };

  const getResumeDownloadUrl = () => {
    if (!resumeUrl) return '';
    const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${apiHost}${resumeUrl}`;
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-4 text-left grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Left Column: Alerts & Resume Upload */}
      <div className="lg:col-span-1 space-y-6">
        
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

        {/* Resume Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>My Resume</span>
            {!resumeUrl && <span className="text-danger text-sm font-bold">*</span>}
          </h3>

          {resumeUrl ? (
            <div className="space-y-4">
              <div className="p-4 bg-slateBg rounded-xl border border-slate-200 flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary shrink-0" />
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-800 truncate">Resume Document</p>
                  <a
                    href={getResumeDownloadUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-primary font-bold hover:underline"
                  >
                    View / Download
                  </a>
                </div>
              </div>

              <button
                onClick={handleResumeDelete}
                disabled={deletingResume}
                className="w-full flex items-center justify-center gap-1.5 border border-danger/20 hover:bg-danger/5 text-danger font-semibold text-xs py-2.5 rounded-lg transition-all-200"
              >
                <Trash2 className="h-4 w-4" />
                <span>{deletingResume ? 'Deleting...' : 'Delete Resume'}</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleResumeUpload} className="space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Uploading your resume is required to apply for jobs. <span className="text-danger font-bold">(Required)</span> Supported formats: PDF, DOC, DOCX (Max 5MB).
              </p>
              
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50/50 transition-all-200 relative">
                <input
                  type="file"
                  required
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <span className="text-xs font-semibold text-slate-600 block">
                  {selectedFile ? selectedFile.name : 'Select Resume File'}
                </span>
              </div>

              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="w-full flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-semibold text-xs py-2.5 rounded-lg transition-all-200 hover-scale shadow-sm"
              >
                <Upload className="h-4 w-4" />
                <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Right Column: Profile Form Details */}
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-6 flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <span>Profile Details</span>
        </h3>

        <form onSubmit={handleProfileSubmit} className="space-y-6">
          
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Full Name <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                required
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-slate-800"
                placeholder="Jane Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>

          {/* Double Column: Phone & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Phone Number <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Phone className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-slate-800"
                  placeholder="555-555-5555"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Location <span className="text-danger">*</span>
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
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Skills (comma-separated) <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Award className="h-4 w-4" />
              </span>
              <input
                type="text"
                required
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-slate-800"
                placeholder="e.g. React, Node.js, Python, SQL"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </div>
          </div>

          {/* Summary */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Professional Summary <span className="text-danger">*</span>
            </label>
            <textarea
              rows={4}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-slate-800"
              placeholder="Tell employers about your career goals and what makes you a great candidate..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>

          {/* Experience */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Work Experience (one entry per line) <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <textarea
                rows={4}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-slate-800"
                placeholder="Software Engineer at TechCorp (2022 - Present)&#10;Junior Developer at StartupInc (2020 - 2022)"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              />
            </div>
          </div>

          {/* Education */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Education (one entry per line) <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <textarea
                rows={4}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-slate-800"
                placeholder="M.S. in Computer Science, Stanford University (2020)&#10;B.S. in Software Engineering, UT Austin (2018)"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
              />
            </div>
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

export default CandidateProfile;
