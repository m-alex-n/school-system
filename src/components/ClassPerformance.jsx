import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaDownload, FaChartLine, FaUsers, FaBook } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';
import EmptyState from './EmptyState';
import { API_URL } from '../config';

function ClassPerformance() {
  const { classId } = useParams();
  const [classInfo, setClassInfo] = useState(null);
  const [overallPerformance, setOverallPerformance] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [subjectPerformance, setSubjectPerformance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchClassInfo();
    fetchOverallPerformance();
    fetchSubjects();
  }, [classId]);

  useEffect(() => {
    if (selectedSubject) {
      fetchSubjectPerformance();
    }
  }, [selectedSubject]);

  const fetchClassInfo = async () => {
    try {
      const response = await axios.get(`${API_URL}/class-streams/${classId}`);
      setClassInfo(response.data);
    } catch (error) {
      console.error('Error fetching class info:', error);
      toast.error('Error fetching class information');
    }
  };

  const fetchOverallPerformance = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/assessments/performance/class/${classId}`);
      console.log('Overall Performance Data:', response.data);
      setOverallPerformance(response.data);
    } catch (error) {
      console.error('Error fetching performance data:', error);
      setError(error.response?.data?.error || 'Failed to load performance data');
      toast.error('Error fetching performance data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/subjects`);
      setSubjects(response.data);
    } catch (error) {
      toast.error('Error fetching subjects');
    }
  };

  const fetchSubjectPerformance = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/assessments/performance/class/${classId}/subject/${selectedSubject}`);
      setSubjectPerformance(response.data);
    } catch (error) {
      console.error('Error fetching subject performance:', error);
      setError(error.response?.data?.error || 'Failed to load subject performance');
      toast.error('Error fetching subject performance');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = async () => {
    setDownloading(true);
    try {
      const response = await axios.get(`${API_URL}/reports/class/${classId}/csv`, {
        responseType: 'blob',
        timeout: 30000
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `class_performance_${classInfo?.name}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('CSV Report downloaded');
    } catch (error) {
      console.error('Error downloading CSV:', error);
      toast.error('Error downloading report');
    } finally {
      setDownloading(false);
    }
  };

  const downloadPDF = async () => {
    setDownloading(true);
    try {
      const response = await axios.get(`${API_URL}/reports/class/${classId}/pdf`, {
        responseType: 'blob',
        timeout: 30000
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `class_performance_${classInfo?.name}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF Report downloaded');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Error downloading PDF report');
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

  // Calculate class average safely
  const calculateClassAverage = () => {
    const studentsWithScores = overallPerformance.filter(s => s.average_score && !isNaN(s.average_score));
    if (studentsWithScores.length === 0) return 0;
    const sum = studentsWithScores.reduce((sum, s) => sum + parseFloat(s.average_score), 0);
    return (sum / studentsWithScores.length).toFixed(2);
  };

  if (loading && !overallPerformance.length && !subjectPerformance.length) {
    return <LoadingSpinner message="Loading performance data..." />;
  }

  if (error && !overallPerformance.length && !subjectPerformance.length) {
    return <ErrorDisplay error={error} onRetry={selectedSubject ? fetchSubjectPerformance : fetchOverallPerformance} />;
  }

  const displayData = selectedSubject ? subjectPerformance : overallPerformance;
  const isEmpty = displayData.length === 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Class Performance
          </h2>
          {classInfo && (
            <p className="text-gray-600 mt-1 flex items-center gap-2">
              <FaUsers className="text-blue-500" />
              {classInfo.name}
            </p>
          )}
        </div>
        <div className="space-x-2">
          <button 
            onClick={downloadCSV} 
            disabled={downloading || isEmpty}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaDownload className="mr-2" /> Export CSV
          </button>
          <button 
            onClick={downloadPDF} 
            disabled={downloading || isEmpty}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaDownload className="mr-2" /> Export PDF
          </button>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <FaBook className="text-blue-500" />
          Filter by Subject
        </label>
        <select
          className="input-field w-64"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          <option value="">Overall Performance</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
      </div>

      {loading && (selectedSubject ? subjectPerformance.length === 0 : overallPerformance.length === 0) ? (
        <LoadingSpinner message="Loading performance data..." />
      ) : isEmpty ? (
        <EmptyState
          title="No Performance Data"
          message={selectedSubject ? "No assessment records found for this subject." : "No assessment records found for this class."}
          actionText="Record Assessment"
          onAction={() => window.location.href = '/assessments'}
        />
      ) : (
        <>
          {!selectedSubject && overallPerformance.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Class Average</p>
                    <p className="text-3xl font-bold mt-1">{calculateClassAverage()}%</p>
                  </div>
                  <FaChartLine className="text-4xl text-blue-200" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Total Students</p>
                    <p className="text-3xl font-bold mt-1">{overallPerformance.length}</p>
                  </div>
                  <FaUsers className="text-4xl text-green-200" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Top Student</p>
                    <p className="text-lg font-bold mt-1 truncate">
                      {overallPerformance[0]?.first_name} {overallPerformance[0]?.last_name}
                    </p>
                    <p className="text-sm text-purple-200">{overallPerformance[0]?.average_score || 0}%</p>
                  </div>
                  <FaChartLine className="text-4xl text-purple-200" />
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Admission No.
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Student Name
                  </th>
                  {selectedSubject ? (
                    <>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        CA (30%)
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Exam (70%)
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Grade
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Total Marks
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Average
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Grade
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayData.map((item, index) => (
                  <tr key={item.student_id} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold text-sm">
                        {item.position || index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.admission_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {item.first_name} {item.last_name}
                    </td>
                    {selectedSubject ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {item.continuous_assessment_score || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {item.examination_score || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                          {item.total_score || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(item.grade)}`}>
                            {item.grade || '-'}
                          </span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                          {item.total_marks || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium">{item.average_score ? `${item.average_score}%` : '0%'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(item.grade)}`}>
                            {item.grade || 'N/A'}
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default ClassPerformance;