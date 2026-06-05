import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaDownload } from 'react-icons/fa';
import { API_URL } from '../config';

function ClassPerformance() {
  const { classId } = useParams();
  const [classInfo, setClassInfo] = useState(null);
  const [overallPerformance, setOverallPerformance] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [subjectPerformance, setSubjectPerformance] = useState([]);
  const [loading, setLoading] = useState(false);

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
      toast.error('Error fetching class information');
    }
  };

  const fetchOverallPerformance = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/performance/class/${classId}/overall`);
      console.log('Overall Performance Data:', response.data); // Debug log
      setOverallPerformance(response.data);
    } catch (error) {
      console.error('Error fetching performance data:', error);
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
    try {
      const response = await axios.get(`${API_URL}/performance/class/${classId}/subject/${selectedSubject}`);
      setSubjectPerformance(response.data);
    } catch (error) {
      toast.error('Error fetching subject performance');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = async () => {
    try {
      const response = await axios.get(`${API_URL}/reports/class/${classId}/csv`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `class_performance_${classInfo?.name}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('CSV Report downloaded');
    } catch (error) {
      toast.error('Error downloading report');
    }
  };

  const downloadPDF = async () => {
    try {
      const response = await axios.get(`${API_URL}/reports/class/${classId}/pdf`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `class_performance_${classInfo?.name}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF Report downloaded');
    } catch (error) {
      toast.error('Error downloading PDF report');
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

  // Calculate class average safely
  const calculateClassAverage = () => {
    const studentsWithScores = overallPerformance.filter(s => s.average_score && !isNaN(s.average_score));
    if (studentsWithScores.length === 0) return 0;
    const sum = studentsWithScores.reduce((sum, s) => sum + parseFloat(s.average_score), 0);
    return (sum / studentsWithScores.length).toFixed(2);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold">Class Performance</h2>
          {classInfo && <p className="text-gray-600 mt-1">{classInfo.name}</p>}
        </div>
        <div className="space-x-2">
          <button onClick={downloadCSV} className="btn-primary">
            <FaDownload className="inline mr-2" /> Export CSV
          </button>
          <button onClick={downloadPDF} className="btn-primary">
            <FaDownload className="inline mr-2" /> Export PDF
          </button>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Filter by Subject</label>
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

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <>
          {!selectedSubject && overallPerformance.length > 0 && (
            <div className="card mb-6">
              <h3 className="text-xl font-bold mb-4">Class Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold">{calculateClassAverage()}%</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold">{overallPerformance.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600">Top Student</p>
                  <p className="text-lg font-semibold">
                    {overallPerformance[0]?.first_name} {overallPerformance[0]?.last_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {overallPerformance[0]?.average_score || 0}%
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admission No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Name
                  </th>
                  {selectedSubject ? (
                    <>
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
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Marks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Average
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grade
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(selectedSubject ? subjectPerformance : overallPerformance).map((item, index) => (
                  <tr key={item.student_id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      {item.position || index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.admission_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.first_name} {item.last_name}
                    </td>
                    {selectedSubject ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.continuous_assessment_score || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.examination_score || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold">
                          {item.total_score || '-'}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${getGradeColor(item.grade)}`}>
                          {item.grade || '-'}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold">
                          {item.total_marks || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.average_score ? `${item.average_score}%` : '0%'}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${getGradeColor(item.grade)}`}>
                          {item.grade || 'N/A'}
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