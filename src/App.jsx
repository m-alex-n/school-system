import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { FaUsers, FaBook, FaChalkboard, FaChartLine, FaFileAlt, FaBars, FaTimes } from 'react-icons/fa';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import StudentForm from './components/StudentForm';
import ClassStreamList from './components/ClassStreamList';
import SubjectList from './components/SubjectList';
import AssessmentForm from './components/AssessmentForm';
import ClassPerformance from './components/ClassPerformance';
import StudentDetails from './components/StudentDetails';

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: '/', name: 'Dashboard', icon: FaChartLine },
    { path: '/students', name: 'Students', icon: FaUsers },
    { path: '/classes', name: 'Classes', icon: FaChalkboard },
    { path: '/subjects', name: 'Subjects', icon: FaBook },
    { path: '/assessments', name: 'Assessments', icon: FaFileAlt },
  ];

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-blue-800 text-white shadow-lg">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-xl md:text-2xl font-bold">Ikonex Academy - SMS</h1>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex space-x-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="hover:bg-blue-700 px-3 py-2 rounded transition"
                  >
                    <link.icon className="inline mr-1" /> {link.name}
                  </Link>
                ))}
              </div>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
              <div className="md:hidden pb-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="block hover:bg-blue-700 px-3 py-2 rounded transition"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <link.icon className="inline mr-2" /> {link.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>
        
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<StudentList />} />
            <Route path="/students/new" element={<StudentForm />} />
            <Route path="/students/edit/:id" element={<StudentForm />} />
            <Route path="/classes" element={<ClassStreamList />} />
            <Route path="/subjects" element={<SubjectList />} />
            <Route path="/assessments" element={<AssessmentForm />} />
            <Route path="/performance/class/:classId" element={<ClassPerformance />} />
            <Route path="/students/:id" element={<StudentDetails />} />
          </Routes>
        </div>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;