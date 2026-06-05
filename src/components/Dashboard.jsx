import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUserGraduate, FaChalkboardTeacher, FaBook, FaClipboardList } from 'react-icons/fa';
import { API_URL } from '../config';

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    students: 0,
    classes: 0,
    subjects: 0,
    assessments: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [studentsRes, classesRes, subjectsRes, assessmentsRes] = await Promise.all([
        axios.get(`${API_URL}/students`),
        axios.get(`${API_URL}/class-streams`),
        axios.get(`${API_URL}/subjects`),
        axios.get(`${API_URL}/assessments`)
      ]);
      
      setStats({
        students: studentsRes.data.length,
        classes: classesRes.data.length,
        subjects: subjectsRes.data.length,
        assessments: assessmentsRes?.data?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const statCards = [
    { title: 'Total Students', value: stats.students, icon: FaUserGraduate, color: 'bg-blue-500' },
    { title: 'Class Streams', value: stats.classes, icon: FaChalkboardTeacher, color: 'bg-green-500' },
    { title: 'Subjects', value: stats.subjects, icon: FaBook, color: 'bg-yellow-500' },
    { title: 'Assessments', value: stats.assessments, icon: FaClipboardList, color: 'bg-purple-500' }
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className={`${card.color} p-4`}>
              <card.icon className="text-white text-3xl" />
            </div>
            <div className="p-4">
              <h3 className="text-gray-600 text-sm">{card.title}</h3>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button onClick={() => navigate('/students/new')} className="btn-primary w-full">
              Register New Student
            </button>
            <button onClick={() => navigate('/assessments')} className="btn-primary w-full">
              Record Assessment Scores
            </button>
            <button onClick={() => navigate('/classes')} className="btn-primary w-full">
              View Class Performance
            </button>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Recent Updates</h3>
          <div className="space-y-2">
            <p className="text-gray-600">✓ System ready for new term</p>
            <p className="text-gray-600">✓ Exam period starts next week</p>
            <p className="text-gray-600">✓ Parent-teacher meeting scheduled</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;