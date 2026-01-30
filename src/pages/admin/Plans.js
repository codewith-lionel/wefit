import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { toast } from 'react-toastify';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    duration_months: '',
    price: '',
    description: '',
    features: '',
    status: 'active'
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const result = await window.electron.getPlans();
      if (result.success) {
        setPlans(result.data);
      }
    } catch (error) {
      toast.error('Error loading plans');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlan = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      duration_months: '',
      price: '',
      description: '',
      features: '',
      status: 'active'
    });
    setShowModal(true);
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name || '',
      duration_months: plan.duration_months || '',
      price: plan.price || '',
      description: plan.description || '',
      features: plan.features || '',
      status: plan.status || 'active'
    });
    setShowModal(true);
  };

  const handleDeletePlan = async (id) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        const result = await window.electron.deletePlan(id);
        if (result.success) {
          toast.success('Plan deleted successfully');
          loadPlans();
        } else {
          toast.error('Failed to delete plan');
        }
      } catch (error) {
        toast.error('Error deleting plan');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let result;
      if (editingPlan) {
        result = await window.electron.updatePlan(editingPlan.id, formData);
      } else {
        result = await window.electron.createPlan(formData);
      }

      if (result.success) {
        toast.success(`Plan ${editingPlan ? 'updated' : 'added'} successfully`);
        setShowModal(false);
        loadPlans();
      } else {
        toast.error(result.message || 'Operation failed');
      }
    } catch (error) {
      toast.error('Error saving plan');
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
        <h1 className="page-title">Membership Plans</h1>
        <div className="header-actions">
          <button onClick={handleAddPlan} className="btn btn-primary">
            ➕ Add Plan
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div className="spinner" style={{ margin: '0 auto' }}></div>
        </div>
      ) : (
        <div className="stats-grid">
          {plans.map((plan) => (
            <div key={plan.id} className="card" style={{ padding: '25px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <h3 style={{ fontSize: '20px', margin: 0 }}>{plan.name}</h3>
                <span className={`badge badge-${plan.status === 'active' ? 'success' : 'danger'}`}>
                  {plan.status}
                </span>
              </div>
              
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--primary-color)', marginBottom: '10px' }}>
                ₹{plan.price}
              </div>
              
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '15px' }}>
                {plan.duration_months} Month{plan.duration_months > 1 ? 's' : ''}
              </p>

              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '15px', minHeight: '40px' }}>
                {plan.description}
              </p>

              <div style={{ 
                backgroundColor: 'var(--dark-bg)', 
                padding: '12px', 
                borderRadius: '8px',
                marginBottom: '15px',
                minHeight: '60px'
              }}>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {plan.features}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => handleEditPlan(plan)}
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  ✏️ Edit
                </button>
                <button 
                  onClick={() => handleDeletePlan(plan.id)}
                  className="btn btn-danger"
                  style={{ flex: 1 }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">
                {editingPlan ? 'Edit Plan' : 'Add New Plan'}
              </h2>
              <button onClick={() => setShowModal(false)} className="modal-close">×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Plan Name *</label>
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
                  <label className="form-label">Duration (Months) *</label>
                  <input
                    type="number"
                    name="duration_months"
                    className="form-input"
                    value={formData.duration_months}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    className="form-input"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-textarea"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Features</label>
                <textarea
                  name="features"
                  className="form-textarea"
                  value={formData.features}
                  onChange={handleInputChange}
                  placeholder="Enter features separated by commas"
                  rows="3"
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

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingPlan ? 'Update' : 'Add'} Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Plans;
