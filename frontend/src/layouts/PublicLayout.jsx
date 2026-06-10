import React from 'react';
import Navbar from '../components/Navbar';

const PublicLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-slateBg">
      {/* Header Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-start">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500 text-xs">
          <p>© {new Date().getFullYear()} HireFlow Platform. Made for job boards and tracking applications. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
