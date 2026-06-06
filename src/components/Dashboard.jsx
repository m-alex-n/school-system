import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaUserGraduate, 
  FaChalkboardTeacher, 
  FaBook, 
  FaClipboardList, 
  FaSpinner, 
  FaSchool,
  FaTrophy,
  FaMedal,
  FaChartLine,
  FaUsers
} from 'react-icons/fa';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';
import { API_URL } from '../config';
import { parseScore, calculateGrade, calculateAverage } from '../utils/gradeCalculator';

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
  const [gradeDistribution, setGradeDistribution] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [subjectPerformance, setSubjectPerformance] = useState([]);
  const [classPerformance, setClassPerformance] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    checkHealth();
    fetchStats();
    fetchGradeDistribution();
    fetchTopPerformers();
    fetchSubjectPerformance();
    fetchClassPerformance();
    fetchRecentActivities();
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

  const GRADE_COLORS = {
    A: '#10b981',
    B: '#3b82f6',
    C: '#f59e0b',
    D: '#f97316',
    E: '#ef4444',
    F: '#dc2626',
  };

  const fetchGradeDistribution = async () => {
    try {
      const response = await axios.get(`${API_URL}/assessments`);
      const assessments = response.data;
      
      const grades = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
      assessments.forEach((assessment) => {
        const grade = calculateGrade(assessment.total_score);
        grades[grade]++;
      });
      
      const total = assessments.length;
      const distribution = Object.entries(grades)
        .map(([grade, count]) => ({
          grade,
          count,
          percentage: total > 0 ? ((count / total) * 100).toFixed(1) : '0.0',
          color: GRADE_COLORS[grade],
        }))
        .filter((entry) => entry.count > 0);
      
      setGradeDistribution(distribution);
    } catch (error) {
      console.error('Error fetching grade distribution:', error);
    }
  };

  const fetchTopPerformers = async () => {
    try {
      const [studentsRes, assessmentsRes] = await Promise.all([
        axios.get(`${API_URL}/students`),
        axios.get(`${API_URL}/assessments`),
      ]);
      const students = studentsRes.data;
      const assessments = assessmentsRes.data;
      
      const studentAverages = students
        .map((student) => {
          const studentAssessments = assessments.filter((a) => a.student_id === student.id);
          if (studentAssessments.length === 0) return null;

          const scores = studentAssessments.map((a) => parseScore(a.total_score));
          const average = calculateAverage(scores);
          const totalMarks = scores.reduce((sum, s) => sum + s, 0);

          return {
            ...student,
            average,
            totalMarks,
            assessmentCount: studentAssessments.length,
            grade: calculateGrade(average),
          };
        })
        .filter(Boolean)
        .sort((a, b) => b.average - a.average)
        .slice(0, 5);
      
      setTopPerformers(studentAverages);
    } catch (error) {
      console.error('Error fetching top performers:', error);
    }
  };

  const fetchSubjectPerformance = async () => {
    try {
      const [subjectsRes, assessmentsRes] = await Promise.all([
        axios.get(`${API_URL}/subjects`),
        axios.get(`${API_URL}/assessments`),
      ]);
      const subjects = subjectsRes.data;
      const assessments = assessmentsRes.data;
      
      const subjectData = subjects
        .map((subject) => {
          const subjectAssessments = assessments.filter((a) => a.subject_id === subject.id);
          if (subjectAssessments.length === 0) return null;

          const scores = subjectAssessments.map((a) => parseScore(a.total_score));
          const average = calculateAverage(scores);

          return {
            name: subject.name,
            average: parseFloat(average.toFixed(2)),
            assessmentCount: subjectAssessments.length,
          };
        })
        .filter(Boolean)
        .sort((a, b) => b.average - a.average);
      
      setSubjectPerformance(subjectData);
    } catch (error) {
      console.error('Error fetching subject performance:', error);
    }
  };

  const fetchClassPerformance = async () => {
    try {
      const [classesRes, assessmentsRes, studentsRes] = await Promise.all([
        axios.get(`${API_URL}/class-streams`),
        axios.get(`${API_URL}/assessments`),
        axios.get(`${API_URL}/students`),
      ]);
      const classes = classesRes.data;
      const assessments = assessmentsRes.data;
      const students = studentsRes.data;
      
      const classData = classes
        .map((cls) => {
          const classStudents = students.filter((s) => s.class_stream_id === cls.id);
          let totalAverage = 0;
          let studentCount = 0;

          classStudents.forEach((student) => {
            const studentAssessments = assessments.filter((a) => a.student_id === student.id);
            if (studentAssessments.length > 0) {
              const scores = studentAssessments.map((a) => parseScore(a.total_score));
              totalAverage += calculateAverage(scores);
              studentCount++;
            }
          });

          if (studentCount === 0) return null;

          const classAverage = totalAverage / studentCount;
          return {
            name: cls.name,
            average: parseFloat(classAverage.toFixed(2)),
            studentCount,
            totalStudents: classStudents.length,
          };
        })
        .filter(Boolean)
        .sort((a, b) => b.average - a.average);
      
      setClassPerformance(classData);
    } catch (error) {
      console.error('Error fetching class performance:', error);
    }
  };

  const formatActivityTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return date.toLocaleString();
  };

  const fetchRecentActivities = async () => {
    try {
      const [studentsRes, assessmentsRes, subjectsRes] = await Promise.all([
        axios.get(`${API_URL}/students`),
        axios.get(`${API_URL}/assessments`),
        axios.get(`${API_URL}/subjects`),
      ]);

      const studentsById = Object.fromEntries(studentsRes.data.map((s) => [s.id, s]));
      const subjectsById = Object.fromEntries(subjectsRes.data.map((s) => [s.id, s]));
      const activities = [];

      studentsRes.data.forEach((student) => {
        activities.push({
          id: `student-${student.id}`,
          type: 'student',
          timestamp: new Date(student.created_at || 0).getTime(),
          message: `New student registered: ${student.first_name} ${student.last_name} (${student.admission_number})${student.class_stream_name ? ` — ${student.class_stream_name}` : ''}`,
          time: formatActivityTime(student.created_at),
          icon: '👨‍🎓',
        });
      });

      assessmentsRes.data.forEach((assessment) => {
        const student = studentsById[assessment.student_id];
        const subject = subjectsById[assessment.subject_id];
        const studentName = student
          ? `${student.first_name} ${student.last_name}`
          : `Student #${assessment.student_id}`;
        const subjectName = subject ? subject.name : 'Unknown subject';
        const score = parseScore(assessment.total_score).toFixed(1);

        activities.push({
          id: `assessment-${assessment.id}`,
          type: 'assessment',
          timestamp: new Date(assessment.created_at || 0).getTime(),
          message: `Assessment recorded for ${studentName} in ${subjectName}: ${score}% (${assessment.academic_term || 'N/A'} ${assessment.academic_year || ''})`.trim(),
          time: formatActivityTime(assessment.created_at),
          icon: '📝',
        });
      });

      const recent = activities
        .filter((a) => a.timestamp > 0)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10);

      setRecentActivities(recent);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    }
  };

  const statCards = [
    { title: 'Total Students', value: stats.students, icon: FaUserGraduate, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500' },
    { title: 'Class Streams', value: stats.classes, icon: FaChalkboardTeacher, color: 'from-green-500 to-green-600', bgColor: 'bg-green-500' },
    { title: 'Subjects', value: stats.subjects, icon: FaBook, color: 'from-yellow-500 to-yellow-600', bgColor: 'bg-yellow-500' },
    { title: 'Assessments', value: stats.assessments, icon: FaClipboardList, color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-500' }
  ];

  const getGradeColor = (grade) => {
    const colors = {
      'A': 'bg-green-100 text-green-800',
      'B': 'bg-blue-100 text-blue-800',
      'C': 'bg-yellow-100 text-yellow-800',
      'D': 'bg-orange-100 text-orange-800',
      'E': 'bg-red-100 text-red-800',
      'F': 'bg-red-200 text-red-900'
    };
    return colors[grade] || 'bg-gray-100 text-gray-800';
  };

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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Grade Distribution Pie Chart */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FaChartLine /> Grade Distribution
            </h3>
            <p className="text-purple-100 text-sm mt-1">
              Breakdown of all recorded assessment grades (A: 80+, B: 70–79, C: 60–69, D: 50–59, E: 40–49, F: below 40)
            </p>
          </div>
          <div className="p-6">
            {gradeDistribution.length > 0 ? (
              <>
                <p className="text-sm text-gray-500 mb-4 text-center">
                  {gradeDistribution.reduce((sum, g) => sum + g.count, 0)} total assessments recorded
                </p>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={gradeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ grade, percentage }) => `${grade}: ${percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="grade"
                    >
                      {gradeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name, props) => [
                        `${value} assessments (${props.payload.percentage}%)`,
                        `Grade ${props.payload.grade}`,
                      ]}
                    />
                    <Legend formatter={(value) => `Grade ${value}`} />
                  </PieChart>
                </ResponsiveContainer>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No assessment data available for grade distribution
              </div>
            )}
          </div>
        </div>

        {/* Top Performers Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FaTrophy /> Top Performing Students
            </h3>
            <p className="text-yellow-100 text-sm mt-1">
              Top 5 students ranked by average score across all their recorded assessments
            </p>
          </div>
          <div className="p-6">
            {topPerformers.length > 0 ? (
              <div className="space-y-4">
                {topPerformers.map((student, index) => (
                  <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {index === 0 && <FaTrophy className="text-yellow-500 text-2xl" />}
                        {index === 1 && <FaMedal className="text-gray-400 text-2xl" />}
                        {index === 2 && <FaMedal className="text-amber-600 text-2xl" />}
                        {index > 2 && <span className="text-2xl font-bold text-blue-400">#{index + 1}</span>}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {student.first_name} {student.last_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {student.admission_number}
                          {student.class_stream_name ? ` · ${student.class_stream_name}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-800">{student.average.toFixed(1)}%</p>
                      <p className="text-xs text-gray-400">
                        {student.assessmentCount} subject{student.assessmentCount !== 1 ? 's' : ''} · {student.totalMarks.toFixed(0)} total marks
                      </p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${getGradeColor(student.grade)}`}>
                        Grade {student.grade}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No assessment data available for top performers
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Second Row of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Subject Performance Bar Chart */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FaBook /> Subject Performance
            </h3>
            <p className="text-green-100 text-sm mt-1">
              Average score per subject across all students (green: 70%+, amber: 50–69%, red: below 50%)
            </p>
          </div>
          <div className="p-6">
            {subjectPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    formatter={(value, name, props) => [
                      `${value}% avg (${props.payload.assessmentCount} assessments)`,
                      'Average Score',
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="average" fill="#3b82f6" name="Average Score (%)">
                    {subjectPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.average >= 70 ? '#10b981' : entry.average >= 50 ? '#f59e0b' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No assessment data available for subject performance
              </div>
            )}
          </div>
        </div>

        {/* Class Performance Bar Chart */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FaUsers /> Class Performance Comparison
            </h3>
            <p className="text-indigo-100 text-sm mt-1">
              Average student score per class stream (only students with recorded assessments are included)
            </p>
          </div>
          <div className="p-6">
            {classPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={classPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value, name, props) => [
                      `${value}% avg`,
                      `${props.payload.studentCount} of ${props.payload.totalStudents} students assessed`,
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="average" fill="#8b5cf6" name="Average Score (%)">
                    {classPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.average >= 70 ? '#10b981' : entry.average >= 50 ? '#f59e0b' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No assessment data available for class performance
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions and Recent Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
        
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4">
            <h3 className="text-xl font-bold text-white">Recent Activity</h3>
            <p className="text-orange-100 text-sm mt-1">
              Latest student registrations and assessment updates across the school
            </p>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="p-4 hover:bg-gray-50 transition duration-150">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{activity.icon}</div>
                    <div className="flex-1 min-w-0">
                      <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded mb-1 ${
                        activity.type === 'student' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {activity.type === 'student' ? 'Registration' : 'Assessment'}
                      </span>
                      <p className="text-sm text-gray-700">{activity.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                No recent activities to display
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* System Status */}
      <div className="mt-6 bg-white rounded-xl shadow-lg overflow-hidden">
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
  );
}

export default Dashboard;