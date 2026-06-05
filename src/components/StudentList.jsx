import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaEdit, FaTrash, FaDownload, FaEye } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';
import EmptyState from './EmptyState';
import { API_URL } from '../config';

function StudentList() {
  const [students, setStudents] = useState([]);
  const [classStreams, setClassStreams] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    fetchClassStreams();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudentsByClass();
    } else {
      fetchAllStudents();
    }
  }, [selectedClass]);

  const fetchClassStreams = async () => {
    try {
      const response = await axios.get(`${API_URL}/class-streams`);
      setClassStreams(response.data);
    } catch (error) {
      toast.error('Error fetching class streams');
    }
  };

  const fetchAllStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/students`);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError(error.response?.data?.error || 'Failed to load students. Please check your connection.');
      toast.error('Error fetching students');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsByClass = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/students/class/${selectedClass}`);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError(error.response?.data?.error || 'Failed to load students for this class.');
      toast.error('Error fetching students');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await axios.delete(`${API_URL}/students/${id}`);
        toast.success('Student deleted successfully');
        if (selectedClass) {
          fetchStudentsByClass();
        } else {
          fetchAllStudents();
        }
      } catch (error) {
        toast.error('Error deleting student');
      }
    }
  };

  const downloadReportCard = async (studentId) => {
    setDownloadingId(studentId);
    try {
      toast.loading('Generating report card...', { id: 'report' });
      const response = await axios.get(`${API_URL}/reports/student/${studentId}/pdf`, {
        responseType: 'blob',
        timeout: 30000
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_card_${studentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Report card downloaded', { id: 'report' });
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Error generating report card', { id: 'report' });
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading students..." />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={selectedClass ? fetchStudentsByClass : fetchAllStudents} />;
  }

  if (students.length === 0) {
    return (
      <>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Students</h2>
          <Link to="/students/new" className="btn-primary">
            Register New Student
          </Link>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Filter by Class</label>
          <select
            className="input-field w-64"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">All Classes</option>
            {classStreams.map((stream) => (
              <option key={stream.id} value={stream.id}>
                {stream.name}
              </option>
            ))}
          </select>
        </div>
        <EmptyState
          title="No Students Found"
          message={selectedClass ? "No students registered in this class yet." : "No students registered in the system yet."}
          actionText="Register New Student"
          onAction={() => window.location.href = '/students/new'}
        />
      </>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h2 className="text-3xl font-bold">Students</h2>
        <Link to="/students/new" className="btn-primary">
          Register New Student
        </Link>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Filter by Class</label>
        <select
          className="input-field w-64"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option value="">All Classes</option>
          {classStreams.map((stream) => (
            <option key={stream.id} value={stream.id}>
              {stream.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Admission No.
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Class
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Gender
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50 transition duration-150">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{student.admission_number}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                  {student.first_name} {student.last_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {student.class_stream_name || 'Not Assigned'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">{student.gender || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">{student.email || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <Link
                      to={`/students/${student.id}`}
                      className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                      title="View Details"
                    >
                      <FaEye className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => downloadReportCard(student.id)}
                      disabled={downloadingId === student.id}
                      className="text-green-600 hover:text-green-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Download Report Card"
                    >
                      {downloadingId === student.id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                      ) : (
                        <FaDownload className="w-5 h-5" />
                      )}
                    </button>
                    <Link
                      to={`/students/edit/${student.id}`}
                      className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                      title="Edit Student"
                    >
                      <FaEdit className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(student.id)}
                      className="text-red-600 hover:text-red-800 transition-colors duration-200"
                      title="Delete Student"
                    >
                      <FaTrash className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StudentList;