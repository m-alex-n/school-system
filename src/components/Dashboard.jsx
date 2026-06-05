import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUserGraduate, FaChalkboardTeacher, FaBook, FaClipboardList, FaSpinner, FaSchool } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';
import { API_URL } from '../config';

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    students: 0,
    classes: 0,
    subjects: 0,
    assessments: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [healthCheck, setHealthCheck] = useState(null);

  useEffect(() => {
    checkHealth();
    fetchStats();
  }, []);

  const checkHealth = async () => {
    try {
      const response = await axios.get(`${API_URL}/health`, { timeout: 5000 });
      setHealthCheck(response.data);
    } catch (error) {
      console.error('Health check failed:', error);
      setHealthCheck({ status: 'unhealthy' });
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const [studentsRes, classesRes, subjectsRes, assessmentsRes] = await Promise.allSettled([
        axios.get(`${API_URL}/students`, { timeout: 10000 }),
        axios.get(`${API_URL}/class-streams`, { timeout: 10000 }),
        axios.get(`${API_URL}/subjects`, { timeout: 10000 }),
        axios.get(`${API_URL}/assessments`, { timeout: 10000 })
      ]);
      
      setStats({
        students: studentsRes.status === 'fulfilled' ? studentsRes.value.data.length : 0,
        classes: classesRes.status === 'fulfilled' ? classesRes.value.data.length : 0,
        subjects: subjectsRes.status === 'fulfilled' ? subjectsRes.value.data.length : 0,
        assessments: assessmentsRes.status === 'fulfilled' ? assessmentsRes.value?.data?.length || 0 : 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Students', value: stats.students, icon: FaUserGraduate, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500' },
    { title: 'Class Streams', value: stats.classes, icon: FaChalkboardTeacher, color: 'from-green-500 to-green-600', bgColor: 'bg-green-500' },
    { title: 'Subjects', value: stats.subjects, icon: FaBook, color: 'from-yellow-500 to-yellow-600', bgColor: 'bg-yellow-500' },
    { title: 'Assessments', value: stats.assessments, icon: FaClipboardList, color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-500' }
  ];

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={fetchStats} />;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Dashboard
        </h2>
        <p className="text-gray-600 mt-1">Welcome to Ikonex Academy Student Management System</p>
      </div>

      {healthCheck?.status === 'unhealthy' && (
        <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
          <div className="flex items-center">
            <FaSpinner className="animate-spin text-yellow-600 mr-3" />
            <div>
              <p className="text-yellow-800 font-medium">Database connection may be slow</p>
              <p className="text-yellow-600 text-sm">Data is loading, please wait...</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
            <div className={`bg-gradient-to-r ${card.color} p-4`}>
              <card.icon className="text-white text-3xl" />
            </div>
            <div className="p-6">
              <h3 className="text-gray-600 text-sm font-medium uppercase tracking-wider">{card.title}</h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">{card.value}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
            <h3 className="text-xl font-bold text-white">Quick Actions</h3>
          </div>
          <div className="p-6 space-y-3">
            <button 
              onClick={() => navigate('/students/new')} 
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-lg transition duration-200 font-medium"
            >
              Register New Student
            </button>
            <button 
              onClick={() => navigate('/assessments')} 
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-3 rounded-lg transition duration-200 font-medium"
            >
              Record Assessment Scores
            </button>
            <button 
              onClick={() => navigate('/classes')} 
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-3 rounded-lg transition duration-200 font-medium"
            >
              View Class Performance
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-4">
            <h3 className="text-xl font-bold text-white">System Status</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-green-800">Database Connection</span>
                </div>
                <span className="text-green-600 font-medium">
                  {healthCheck?.status === 'healthy' ? 'Connected' : 'Connecting...'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <FaSchool className="text-blue-500 mr-2" />
                  <span className="text-blue-800">System Ready</span>
                </div>
                <span className="text-blue-600 font-medium">✓ Active</span>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-600 text-sm">Last updated: {new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;