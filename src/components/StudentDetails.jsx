import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaDownload, FaEdit, FaSpinner, FaUserGraduate } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';
import EmptyState from './EmptyState';
import { API_URL } from '../config';

function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchStudentDetails();
  }, [id]);

  const fetchStudentDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching student with ID:', id);
      const response = await axios.get(`${API_URL}/students/${id}`, {
        timeout: 15000
      });
      console.log('Student data received:', response.data);
      setStudent(response.data);
    } catch (error) {
      console.error('Error fetching student details:', error);
      let errorMessage = 'Error fetching student details';
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please check your connection.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Student not found';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const downloadReportCard = async () => {
    setDownloading(true);
    try {
      toast.loading('Generating report card...', { id: 'report' });
      const response = await axios.get(`${API_URL}/reports/student/${id}/pdf`, {
        responseType: 'blob',
        timeout: 30000
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_card_${student?.admission_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Report card downloaded', { id: 'report' });
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Error generating report card', { id: 'report' });
    } finally {
      setDownloading(false);
    }
  };

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
    return <LoadingSpinner message="Loading student details..." />;
  }

  if (error || !student) {
    return (
      <ErrorDisplay 
        error={error || 'Student not found'} 
        onRetry={fetchStudentDetails}
      />
    );
  }

  // Calculate totals safely
  const totalMarks = student.performance?.reduce((sum, p) => sum + (parseFloat(p.total_score) || 0), 0) || 0;
  const averageScore = student.performance?.length 
    ? (totalMarks / student.performance.length).toFixed(2) 
    : '0.00';
  const overallGrade = (() => {
    if (!student.performance?.length) return 'N/A';
    const avg = totalMarks / student.performance.length;
    if (avg >= 80) return 'A';
    if (avg >= 70) return 'B';
    if (avg >= 60) return 'C';
    if (avg >= 50) return 'D';
    if (avg >= 40) return 'E';
    return 'F';
  })();

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <button
          onClick={() => navigate('/students')}
          className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200"
        >
          <FaArrowLeft className="mr-2" /> Back to Students
        </button>
        <div className="space-x-3">
          <button 
            onClick={downloadReportCard} 
            disabled={downloading}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading ? (
              <FaSpinner className="animate-spin mr-2" />
            ) : (
              <FaDownload className="mr-2" />
            )}
            Download Report Card
          </button>
          <Link 
            to={`/students/edit/${id}`} 
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200"
          >
            <FaEdit className="mr-2" /> Edit Student
          </Link>
        </div>
      </div>

      {/* Student Information Card */}
      <div className="bg-white rounded-lg shadow-lg mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center space-x-3">
            <FaUserGraduate className="text-white text-2xl" />
            <h2 className="text-2xl font-bold text-white">Student Information</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Admission Number</p>
              <p className="text-lg font-semibold text-gray-900">{student.admission_number}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Full Name</p>
              <p className="text-lg font-semibold text-gray-900">{student.first_name} {student.last_name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Class</p>
              <p className="text-lg font-semibold text-blue-600">{student.class_stream_name || 'Not Assigned'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Gender</p>
              <p className="text-lg font-semibold text-gray-900">{student.gender || 'Not specified'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Date of Birth</p>
              <p className="text-lg font-semibold text-gray-900">
                {student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'Not specified'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Phone</p>
              <p className="text-lg font-semibold text-gray-900">{student.phone || 'Not specified'}</p>
            </div>
            <div className="space-y-1 md:col-span-2">
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-lg font-semibold text-gray-900">{student.email || 'Not specified'}</p>
            </div>
            <div className="space-y-1 md:col-span-3">
              <p className="text-sm font-medium text-gray-500">Address</p>
              <p className="text-lg font-semibold text-gray-900">{student.address || 'Not specified'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Summary Card */}
      <div className="bg-white rounded-lg shadow-lg mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
          <h2 className="text-2xl font-bold text-white">Performance Summary</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
              <p className="text-sm font-medium text-gray-600 mb-2">Total Marks</p>
              <p className="text-3xl font-bold text-blue-600">{totalMarks}</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl">
              <p className="text-sm font-medium text-gray-600 mb-2">Average Score</p>
              <p className="text-3xl font-bold text-green-600">{averageScore}%</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
              <p className="text-sm font-medium text-gray-600 mb-2">Overall Grade</p>
              <p className={`text-3xl font-bold inline-flex items-center justify-center w-16 h-16 rounded-full ${getGradeColor(overallGrade)}`}>
                {overallGrade}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Subject Performance Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-4">
          <h2 className="text-2xl font-bold text-white">Subject Performance</h2>
        </div>
        <div className="p-6">
          {student.performance && student.performance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CA (30%)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Exam (70%)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grade
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {student.performance.map((subject, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition duration-150">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{subject.subject_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-mono bg-gray-100 rounded">{subject.subject_code}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">{subject.continuous_assessment_score || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">{subject.examination_score || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">{subject.total_score || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(subject.grade)}`}>
                          {subject.grade || '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No Assessment Records"
              message="No assessment records found for this student."
              actionText="Record Assessment"
              onAction={() => navigate('/assessments')}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentDetails;