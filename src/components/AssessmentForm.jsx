import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaSave, FaUndo, FaSpinner } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';
import { API_URL } from '../config';

function AssessmentForm() {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classStreams, setClassStreams] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    continuous_assessment_score: '',
    examination_score: '',
    academic_term: '',
    academic_year: new Date().getFullYear().toString()
  });


  const fetchClassStreams = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/class-streams`, { timeout: 10000 });
      setClassStreams(response.data);
    } catch (error) {
      console.error('Error fetching class streams:', error);
      setError('Failed to load class streams');
      toast.error('Error fetching class streams');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/subjects`, { timeout: 10000 });
      setSubjects(response.data);
    } catch (error) {
      toast.error('Error fetching subjects');
    }
  };

  const fetchStudentsByClass = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/students/class/${selectedClass}`, { timeout: 10000 });
      setStudents(response.data);
    } catch (error) {
      toast.error('Error fetching students');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedStudent || !selectedSubject) {
      toast.error('Please select student and subject');
      return;
    }

    const continuousScore = parseFloat(formData.continuous_assessment_score);
    const examScore = parseFloat(formData.examination_score);

    if (isNaN(continuousScore) || continuousScore < 0 || continuousScore > 30) {
      toast.error('Continuous assessment score must be between 0 and 30');
      return;
    }

    if (isNaN(examScore) || examScore < 0 || examScore > 70) {
      toast.error('Examination score must be between 0 and 70');
      return;
    }

    if (!formData.academic_term) {
      toast.error('Please select academic term');
      return;
    }

    if (!formData.academic_year) {
      toast.error('Please enter academic year');
      return;
    }

    setSaving(true);
    try {
      await axios.post(`${API_URL}/assessments`, {
        student_id: selectedStudent,
        subject_id: selectedSubject,
        class_stream_id: selectedClass,
        continuous_assessment_score: continuousScore,
        examination_score: examScore,
        academic_term: formData.academic_term,
        academic_year: formData.academic_year
      }, { timeout: 15000 });
      toast.success('Assessment recorded successfully');
      resetForm();
    } catch (error) {
      console.error('Error recording assessment:', error);
      toast.error(error.response?.data?.error || 'Error recording assessment');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setSelectedStudent('');
    setSelectedSubject('');
    setFormData({
      continuous_assessment_score: '',
      examination_score: '',
      academic_term: '',
      academic_year: new Date().getFullYear().toString()
    });
  };

  useEffect(() => {
    fetchClassStreams();
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudentsByClass();
    } else {
      setStudents([]);
      setSelectedStudent('');
    }
  }, [selectedClass]);

  if (loading && !classStreams.length) {
    return <LoadingSpinner message="Loading form data..." />;
  }

  if (error && !classStreams.length) {
    return <ErrorDisplay error={error} onRetry={fetchClassStreams} />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Record Student Assessment
        </h2>
        <p className="text-gray-600 mt-1">Record continuous assessment and examination scores</p>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Class Stream *</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              required
              className="input-field"
              disabled={loading}
            >
              <option value="">Select Class</option>
              {classStreams.map((stream) => (
                <option key={stream.id} value={stream.id}>
                  {stream.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Student *</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              required
              disabled={!selectedClass || loading}
              className="input-field"
            >
              <option value="">Select Student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.admission_number} - {student.first_name} {student.last_name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              required
              className="input-field"
            >
              <option value="">Select Subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.code} - {subject.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Continuous Assessment Score (0-30) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.continuous_assessment_score}
                onChange={(e) => setFormData({ ...formData, continuous_assessment_score: e.target.value })}
                required
                className="input-field"
                placeholder="e.g., 25.5"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum: 30 points</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Examination Score (0-70) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.examination_score}
                onChange={(e) => setFormData({ ...formData, examination_score: e.target.value })}
                required
                className="input-field"
                placeholder="e.g., 65.5"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum: 70 points</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Academic Term *</label>
              <select
                value={formData.academic_term}
                onChange={(e) => setFormData({ ...formData, academic_term: e.target.value })}
                required
                className="input-field"
              >
                <option value="">Select Term</option>
                <option value="Term 1">Term 1</option>
                <option value="Term 2">Term 2</option>
                <option value="Term 3">Term 3</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year *</label>
              <input
                type="text"
                value={formData.academic_year}
                onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                required
                className="input-field"
                placeholder="e.g., 2024"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-8 pt-4 border-t">
          <button 
            type="button" 
            onClick={resetForm} 
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200"
          >
            <FaUndo className="mr-2" /> Reset
          </button>
          <button 
            type="submit" 
            disabled={saving}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <FaSpinner className="animate-spin mr-2" /> Saving...
              </>
            ) : (
              <>
                <FaSave className="mr-2" /> Record Assessment
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AssessmentForm;