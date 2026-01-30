import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { toast } from 'react-toastify';

const Trainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    experience_years: '',
    status: 'active'
  });

  useEffect(() => {
    loadTrainers();
  }, []);

  const loadTrainers = async () => {
    try {
      const result = await window.electron.getTrainers();
      if (result.success) {
        setTrainers(result.data);
      }
    } catch (error) {
      toast.error('Error loading trainers');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTrainer = () => {
    setEditingTrainer(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      specialization: '',
      experience_years: '',
      status: 'active'
    });
    setShowModal(true);
  };

  const handleEditTrainer = (trainer) => {
    setEditingTrainer(trainer);
    setFormData({
      name: trainer.name || '',
      email: trainer.email || '',
      phone: trainer.phone || '',
      specialization: trainer.specialization || '',
      experience_years: trainer.experience_years || '',
      status: trainer.status || 'active'
    });
    setShowModal(true);
  };

  const handleDeleteTrainer = async (id) => {
    if (window.confirm('Are you sure you want to delete this trainer?')) {
      try {
        const result = await window.electron.deleteTrainer(id);
        if (result.success) {
          toast.success('Trainer deleted successfully');
          loadTrainers();
        } else {
          toast.error('Failed to delete trainer');
        }
      } catch (error) {
        toast.error('Error deleting trainer');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let result;
      if (editingTrainer) {
        result = await window.electron.updateTrainer(editingTrainer.id, formData);
      } else {
        result = await window.electron.createTrainer(formData);
      }

      if (result.success) {
        toast.success(`Trainer ${editingTrainer ? 'updated' : 'added'} successfully`);
        setShowModal(false);
        loadTrainers();
      } else {
        toast.error(result.message || 'Operation failed');
      }
    } catch (error) {
      toast.error('Error saving trainer');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Layout role="admin">
      <div className="page-header">
        <h1 className="page-title">Trainers Management</h1>
        <div className="header-actions">
          <button onClick={handleAddTrainer} className="btn btn-primary">
            ➕ Add Trainer
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div className="spinner" style={{ margin: '0 auto' }}></div>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Specialization</th>
                  <th>Experience (Years)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {trainers.length > 0 ? (
                  trainers.map((trainer) => (
                    <tr key={trainer.id}>
                      <td>{trainer.id}</td>
                      <td>{trainer.name}</td>
                      <td>{trainer.email || '-'}</td>
                      <td>{trainer.phone || '-'}</td>
                      <td>{trainer.specialization || '-'}</td>
                      <td>{trainer.experience_years || '-'}</td>
                      <td>
                        <span className={`badge badge-${trainer.status === 'active' ? 'success' : 'danger'}`}>
                          {trainer.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          onClick={() => handleEditTrainer(trainer)}
                          className="btn btn-outline"
                          style={{ marginRight: '5px', padding: '6px 12px' }}
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteTrainer(trainer.id)}
                          className="btn btn-danger"
                          style={{ padding: '6px 12px' }}
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No trainers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">
                {editingTrainer ? 'Edit Trainer' : 'Add New Trainer'}
              </h2>
              <button onClick={() => setShowModal(false)} className="modal-close">×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Specialization</label>
                <input
                  type="text"
                  name="specialization"
                  className="form-input"
                  placeholder="e.g., Strength Training, Yoga, CrossFit"
                  value={formData.specialization}
                  onChange={handleInputChange}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Experience (Years)</label>
                  <input
                    type="number"
                    name="experience_years"
                    className="form-input"
                    value={formData.experience_years}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    name="status"
                    className="form-select"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTrainer ? 'Update' : 'Add'} Trainer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Trainers;
