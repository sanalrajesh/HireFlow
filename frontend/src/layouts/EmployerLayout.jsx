import React from 'react';
import Sidebar from '../components/Sidebar';

const EmployerLayout = ({ children }) => {
  return (
    <div className="flex bg-slateBg min-h-screen">
      {/* Sidebar Navigation */}
      <div className="hidden md:block sticky top-0 h-screen">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default EmployerLayout;
