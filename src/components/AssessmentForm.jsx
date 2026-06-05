import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_URL } from '../config';

function AssessmentForm() {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classStreams, setClassStreams] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [formData, setFormData] = useState({
    continuous_assessment_score: '',
    examination_score: '',
    academic_term: '',
    academic_year: new Date().getFullYear().toString()
  });

  useEffect(() => {
    fetchClassStreams();
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudentsByClass();
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

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/subjects`);
      setSubjects(response.data);
    } catch (error) {
      toast.error('Error fetching subjects');
    }
  };

  const fetchStudentsByClass = async () => {
    try {
      const response = await axios.get(`${API_URL}/students/class/${selectedClass}`);
      setStudents(response.data);
    } catch (error) {
      toast.error('Error fetching students');
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

    if (continuousScore < 0 || continuousScore > 30) {
      toast.error('Continuous assessment score must be between 0 and 30');
      return;
    }

    if (examScore < 0 || examScore > 70) {
      toast.error('Examination score must be between 0 and 70');
      return;
    }

    try {
      await axios.post(`${API_URL}/assessments`, {
        student_id: selectedStudent,
        subject_id: selectedSubject,
        class_stream_id: selectedClass,
        continuous_assessment_score: continuousScore,
        examination_score: examScore,
        academic_term: formData.academic_term,
        academic_year: formData.academic_year
      });
      toast.success('Assessment recorded successfully');
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error recording assessment');
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

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Record Student Assessment</h2>
      
      <form onSubmit={handleSubmit} className="card">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Class Stream *</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              required
              className="input-field"
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
            <label className="block text-sm font-medium mb-2">Student *</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              required
              disabled={!selectedClass}
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
            <label className="block text-sm font-medium mb-2">Subject *</label>
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
          
          <div>
            <label className="block text-sm font-medium mb-2">Continuous Assessment Score (0-30) *</label>
            <input
              type="number"
              step="0.01"
              value={formData.continuous_assessment_score}
              onChange={(e) => setFormData({ ...formData, continuous_assessment_score: e.target.value })}
              required
              className="input-field"
              placeholder="e.g., 25.5"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Examination Score (0-70) *</label>
            <input
              type="number"
              step="0.01"
              value={formData.examination_score}
              onChange={(e) => setFormData({ ...formData, examination_score: e.target.value })}
              required
              className="input-field"
              placeholder="e.g., 65.5"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Academic Term *</label>
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
            <label className="block text-sm font-medium mb-2">Academic Year *</label>
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
        
        <div className="flex justify-end space-x-3 mt-6">
          <button type="button" onClick={resetForm} className="btn-secondary">
            Reset
          </button>
          <button type="submit" className="btn-primary">
            Record Assessment
          </button>
        </div>
      </form>
    </div>
  );
}

export default AssessmentForm;