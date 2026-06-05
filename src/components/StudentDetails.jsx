import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaDownload, FaEdit, FaSpinner } from 'react-icons/fa';
import { API_URL } from '../config';

function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudentDetails();
  }, [id]);

  const fetchStudentDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching student with ID:', id);
      const response = await axios.get(`${API_URL}/students/${id}`);
      console.log('Student data received:', response.data);
      setStudent(response.data);
    } catch (error) {
      console.error('Error fetching student details:', error);
      setError(error.response?.data?.error || 'Error fetching student details');
      toast.error('Error fetching student details');
    } finally {
      setLoading(false);
    }
  };

  const downloadReportCard = async () => {
    try {
      toast.loading('Generating report card...', { id: 'report' });
      const response = await axios.get(`${API_URL}/reports/student/${id}/pdf`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_card_${student?.admission_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report card downloaded', { id: 'report' });
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Error generating report card', { id: 'report' });
    }
  };

  const getGradeColor = (grade) => {
    switch(grade) {
      case 'A': return 'text-green-600 font-bold';
      case 'B': return 'text-blue-600';
      case 'C': return 'text-yellow-600';
      case 'D': return 'text-orange-600';
      case 'E': return 'text-red-600';
      case 'F': return 'text-red-800 font-bold';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <FaSpinner className="animate-spin text-4xl text-blue-600 mb-4" />
        <p className="text-gray-600">Loading student details...</p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="text-center py-16">
        <div className="text-red-600 text-xl mb-4">⚠️ {error || 'Student not found'}</div>
        <button onClick={() => navigate('/students')} className="btn-primary">
          <FaArrowLeft className="inline mr-2" /> Back to Students
        </button>
      </div>
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
          className="btn-secondary flex items-center"
        >
          <FaArrowLeft className="mr-2" /> Back to Students
        </button>
        <div className="space-x-3">
          <button onClick={downloadReportCard} className="btn-primary">
            <FaDownload className="inline mr-2" /> Download Report Card
          </button>
          <Link to={`/students/edit/${id}`} className="btn-primary inline-block">
            <FaEdit className="inline mr-2" /> Edit Student
          </Link>
        </div>
      </div>

      {/* Student Information Card */}
      <div className="card mb-6">
        <h2 className="text-2xl font-bold mb-4">Student Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600 text-sm">Admission Number</p>
            <p className="font-semibold">{student.admission_number}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Full Name</p>
            <p className="font-semibold">{student.first_name} {student.last_name}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Class</p>
            <p className="font-semibold">{student.class_stream_name || 'Not Assigned'}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Gender</p>
            <p className="font-semibold">{student.gender || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Date of Birth</p>
            <p className="font-semibold">{student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'Not specified'}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Phone</p>
            <p className="font-semibold">{student.phone || 'Not specified'}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-gray-600 text-sm">Email</p>
            <p className="font-semibold">{student.email || 'Not specified'}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-gray-600 text-sm">Address</p>
            <p className="font-semibold">{student.address || 'Not specified'}</p>
          </div>
        </div>
      </div>

      {/* Performance Summary Card */}
      <div className="card mb-6">
        <h2 className="text-2xl font-bold mb-4">Performance Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600 text-sm">Total Marks</p>
            <p className="text-2xl font-bold">{totalMarks}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600 text-sm">Average Score</p>
            <p className="text-2xl font-bold">{averageScore}%</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600 text-sm">Overall Grade</p>
            <p className={`text-2xl font-bold ${getGradeColor(overallGrade)}`}>{overallGrade}</p>
          </div>
        </div>
      </div>

      {/* Subject Performance Table */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Subject Performance</h2>
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
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{subject.subject_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{subject.subject_code}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{subject.continuous_assessment_score || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{subject.examination_score || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold">{subject.total_score || '-'}</td>
                    <td className={`px-6 py-4 whitespace-nowrap ${getGradeColor(subject.grade)}`}>
                      {subject.grade || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No assessment records found for this student.</p>
            <button 
              onClick={() => navigate('/assessments')} 
              className="btn-primary"
            >
              Record Assessment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentDetails;