// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './src/components/Sidebar';
import ResumeUpload from './src/components/HR/ResumeUpload';
import InterviewScheduler from './src/components/HR/InterviewScheduler';
import ProjectCreation from './src/components/PM/ProjectCreation';
import EmployeeAssignment from './src/components/PM/EmployeeAssignment';
import ProjectList from './src/components/ProjectList';
import DashboardHome from './src/components/DashboardHome'; // New default dashboard component
function App() {
  return (
    <Router>
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <div style={{ flex: 1, padding: '20px' }}>
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/resume-upload" element={<ResumeUpload />} />
            <Route path="/interview-scheduler" element={<InterviewScheduler />} />
            <Route path="/project-creation" element={<ProjectCreation />} />
            <Route path="/employee-assignment" element={<EmployeeAssignment />} />
            <Route path="/projects" element={<ProjectList />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
