'use client';

import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [cages, setCages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCage, setCurrentCage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    researcher: '',
    status: 'Connected',
    stream_url: '',
    cleaning_frequency: 24,
    cleaning_speed: 50,
    youtube_url: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchCages();
  }, []);

  const fetchCages = async () => {
    try {
      const response = await fetch('/api/cages');
      if (!response.ok) {
        throw new Error('Failed to fetch cages');
      }
      const data = await response.json();
      // Ensure cages is always an array
      setCages(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching cages:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.researcher.trim()) errors.researcher = 'Researcher is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openModal = (cage = null) => {
    if (cage) {
      // Edit mode
      setCurrentCage(cage);
      setFormData({
        name: cage.name || '',
        researcher: cage.researcher || '',
        status: cage.status || 'Connected',
        stream_url: cage.stream_url || '',
        cleaning_frequency: cage.cleaning_frequency || 24,
        cleaning_speed: cage.cleaning_speed || 50,
        youtube_url: cage.youtube_url || ''
      });
    } else {
      // Create mode
      setCurrentCage(null);
      setFormData({
        name: '',
        researcher: '',
        status: 'Connected',
        stream_url: '',
        cleaning_frequency: 24,
        cleaning_speed: 50,
        youtube_url: ''
      });
    }
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      let response;
      
      if (currentCage) {
        // Update existing cage
        response = await fetch(`/api/cages/${currentCage.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      } else {
        // Create new cage
        response = await fetch('/api/cages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      }
      
      if (!response.ok) {
        throw new Error(currentCage ? 'Failed to update cage' : 'Failed to create cage');
      }
      
      // Refresh the cage list
      fetchCages();
      
      // Show success message
      setSuccessMessage(currentCage ? 'Cage updated successfully!' : 'Cage created successfully!');
      
      // Close modal after a delay
      setTimeout(() => {
        closeModal();
      }, 2000);
      
    } catch (err) {
      console.error('Error:', err);
      setFormErrors({ submit: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this cage?')) return;
    
    try {
      const response = await fetch(`/api/cages/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete cage');
      }
      
      // Refresh the cage list
      fetchCages();
      
    } catch (err) {
      console.error('Error deleting cage:', err);
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cage Management</h1>
        <button 
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          onClick={() => openModal()}
        >
          Add New Cage
        </button>
      </div>
      
      {cages.length === 0 ? (
        <div className="bg-white p-6 rounded shadow">
          <p className="text-center text-gray-500">No cages found. Click "Add New Cage" to create one.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Researcher</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cleaning Freq.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cages.map((cage) => (
                <tr key={cage.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cage.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cage.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cage.researcher}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      cage.status === 'Connected' ? 'bg-green-100 text-green-800' : 
                      cage.status === 'Disconnected' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {cage.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cage.cleaning_frequency}h</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cage.last_update_time ? new Date(cage.last_update_time).toLocaleString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                      onClick={() => openModal(cage)}
                    >
                      Edit
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDelete(cage.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Modal for Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{currentCage ? 'Edit Cage' : 'Create New Cage'}</h2>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={closeModal}
              >
                ✕
              </button>
            </div>
            
            {successMessage && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                {successMessage}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {formErrors.name && <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Researcher *</label>
                  <input
                    type="text"
                    name="researcher"
                    value={formData.researcher}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${formErrors.researcher ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {formErrors.researcher && <p className="mt-1 text-sm text-red-500">{formErrors.researcher}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="Connected">Connected</option>
                    <option value="Disconnected">Disconnected</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stream URL</label>
                  <input
                    type="text"
                    name="stream_url"
                    value={formData.stream_url}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cleaning Frequency (hours)</label>
                  <input
                    type="number"
                    name="cleaning_frequency"
                    value={formData.cleaning_frequency}
                    onChange={handleInputChange}
                    min="1"
                    max="168"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cleaning Speed (%)</label>
                  <input
                    type="number"
                    name="cleaning_speed"
                    value={formData.cleaning_speed}
                    onChange={handleInputChange}
                    min="10"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
                  <input
                    type="text"
                    name="youtube_url"
                    value={formData.youtube_url}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              {formErrors.submit && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                  {formErrors.submit}
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  type="button"
                  className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={closeModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : currentCage ? 'Update Cage' : 'Create Cage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
