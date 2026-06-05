import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_URL } from '../config';

function StudentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [classStreams, setClassStreams] = useState([]);
  const [formData, setFormData] = useState({
    admission_number: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    class_stream_id: ''
  });

  
  const fetchClassStreams = async () => {
    try {
      const response = await axios.get(`${API_URL}/class-streams`);
      setClassStreams(response.data);
    } catch (error) {
      toast.error('Error fetching class streams');
    }
  };

  const fetchStudent = async () => {
    try {
      const response = await axios.get(`${API_URL}/students/${id}`);
      const student = response.data;
      setFormData({
        admission_number: student.admission_number,
        first_name: student.first_name,
        last_name: student.last_name,
        date_of_birth: student.date_of_birth?.split('T')[0] || '',
        gender: student.gender,
        phone: student.phone,
        email: student.email,
        address: student.address,
        class_stream_id: student.class_stream_id || ''
      });
    } catch (error) {
      toast.error('Error fetching student details');
    }
  };
  
  useEffect(() => {
    fetchClassStreams();
    if (id) {
      fetchStudent();
    }
  }, [id]);

  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (id) {
        await axios.put(`${API_URL}/students/${id}`, formData);
        toast.success('Student updated successfully');
      } else {
        await axios.post(`${API_URL}/students`, formData);
        toast.success('Student registered successfully');
      }
      navigate('/students');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error saving student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">
        {id ? 'Edit Student' : 'Register New Student'}
      </h2>
      
      <form onSubmit={handleSubmit} className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Admission Number *</label>
            <input
              type="text"
              name="admission_number"
              value={formData.admission_number}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">First Name *</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Last Name *</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Date of Birth</label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              className="input-field"
            ></textarea>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Class Stream</label>
            <select
              name="class_stream_id"
              value={formData.class_stream_id}
              onChange={handleChange}
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
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={() => navigate('/students')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Saving...' : (id ? 'Update' : 'Register')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default StudentForm;