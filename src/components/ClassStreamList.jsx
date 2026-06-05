import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { FaPlus, FaEye } from 'react-icons/fa';
import { API_URL } from '../config';

function ClassStreamList() {
  const [classStreams, setClassStreams] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassDescription, setNewClassDescription] = useState('');

  useEffect(() => {
    fetchClassStreams();
  }, []);

  const fetchClassStreams = async () => {
    try {
      const response = await axios.get(`${API_URL}/class-streams`);
      setClassStreams(response.data);
    } catch (error) {
      toast.error('Error fetching class streams');
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/class-streams`, {
        name: newClassName,
        description: newClassDescription
      });
      toast.success('Class stream created successfully');
      setNewClassName('');
      setNewClassDescription('');
      setShowForm(false);
      fetchClassStreams();
    } catch (error) {
      toast.error('Error creating class stream');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Class Streams</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          <FaPlus className="inline mr-2" /> Add Class
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h3 className="text-xl font-bold mb-4">Create New Class Stream</h3>
          <form onSubmit={handleCreateClass}>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Class Name *</label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  required
                  className="input-field"
                  placeholder="e.g., Form 1A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newClassDescription}
                  onChange={(e) => setNewClassDescription(e.target.value)}
                  rows="3"
                  className="input-field"
                  placeholder="Class description..."
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Class
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classStreams.map((stream) => (
          <div key={stream.id} className="card hover:shadow-lg transition">
            <h3 className="text-xl font-bold mb-2">{stream.name}</h3>
            <p className="text-gray-600 mb-4">{stream.description || 'No description'}</p>
            <Link
              to={`/performance/class/${stream.id}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <FaEye className="mr-1" /> View Performance
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ClassStreamList;