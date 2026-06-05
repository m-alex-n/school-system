import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaEdit, FaTrash, FaDownload, FaEye } from 'react-icons/fa';
import { API_URL } from '../config';

function StudentList() {
  const [students, setStudents] = useState([]);
  const [classStreams, setClassStreams] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(false);

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
    try {
      const response = await axios.get(`${API_URL}/students`);
      setStudents(response.data);
    } catch (error) {
      toast.error('Error fetching students');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsByClass = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/students/class/${selectedClass}`);
      setStudents(response.data);
    } catch (error) {
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
    try {
      toast.loading('Generating report card...', { id: 'report' });
      const response = await axios.get(`${API_URL}/reports/student/${studentId}/pdf`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_card_${studentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report card downloaded', { id: 'report' });
    } catch (error) {
      toast.error('Error generating report card', { id: 'report' });
    }
  };

  return (
    <div>
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

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admission No.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{student.admission_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {student.first_name} {student.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.class_stream_name || 'Not Assigned'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.gender || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.email || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/students/${student.id}`}
                        className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                        title="View Details"
                      >
                        <FaEye className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => downloadReportCard(student.id)}
                        className="text-green-600 hover:text-green-900 transition-colors duration-200"
                        title="Download Report Card"
                      >
                        <FaDownload className="w-5 h-5" />
                      </button>
                      <Link
                        to={`/students/edit/${student.id}`}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
                        title="Edit Student"
                      >
                        <FaEdit className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="text-red-600 hover:text-red-900 transition-colors duration-200"
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
      )}
    </div>
  );
}

export default StudentList;