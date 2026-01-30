import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { toast } from 'react-toastify';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    date_of_birth: '',
    gender: '',
    emergency_contact: '',
    plan_id: '',
    trainer_id: '',
    membership_status: 'active'
  });

  useEffect(() => {
    loadMembers();
    loadTrainers();
    loadPlans();
  }, []);

  const loadMembers = async (filter = {}) => {
    try {
      const result = await window.electron.getMembers(filter);
      if (result.success) {
        setMembers(result.data);
      }
    } catch (error) {
      toast.error('Error loading members');
    } finally {
      setLoading(false);
    }
  };

  const loadTrainers = async () => {
    try {
      const result = await window.electron.getTrainers();
      if (result.success) {
        setTrainers(result.data);
      }
    } catch (error) {
      console.error('Error loading trainers:', error);
    }
  };

  const loadPlans = async () => {
    try {
      const result = await window.electron.getPlans();
      if (result.success) {
        setPlans(result.data);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
    }
  };

  const handleSearch = () => {
    loadMembers({ search: searchTerm, status: filterStatus });
  };

  const handleAddMember = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      date_of_birth: '',
      gender: '',
      emergency_contact: '',
      plan_id: '',
      trainer_id: '',
      membership_status: 'active'
    });
    setShowModal(true);
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      address: member.address || '',
      date_of_birth: member.date_of_birth || '',
      gender: member.gender || '',
      emergency_contact: member.emergency_contact || '',
      plan_id: member.plan_id || '',
      trainer_id: member.trainer_id || '',
      membership_status: member.membership_status || 'active'
    });
    setShowModal(true);
  };

  const handleDeleteMember = async (id) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        const result = await window.electron.deleteMember(id);
        if (result.success) {
          toast.success('Member deleted successfully');
          loadMembers();
        } else {
          toast.error('Failed to delete member');
        }
      } catch (error) {
        toast.error('Error deleting member');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let result;
      if (editingMember) {
        result = await window.electron.updateMember(editingMember.id, formData);
      } else {
        result = await window.electron.createMember(formData);
      }

      if (result.success) {
        toast.success(`Member ${editingMember ? 'updated' : 'added'} successfully`);
        setShowModal(false);
        loadMembers();
      } else {
        toast.error(result.message || 'Operation failed');
      }
    } catch (error) {
      toast.error('Error saving member');
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
        <h1 className="page-title">Members Management</h1>
        <div className="header-actions">
          <button onClick={handleAddMember} className="btn btn-primary">
            ➕ Add Member
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label">Search</label>
            <input
              type="text"
              className="form-input"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ width: '200px', marginBottom: 0 }}>
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <button onClick={handleSearch} className="btn btn-primary">
            🔍 Search
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
                  <th>Plan</th>
                  <th>Trainer</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.length > 0 ? (
                  members.map((member) => (
                    <tr key={member.id}>
                      <td>{member.id}</td>
                      <td>{member.name}</td>
                      <td>{member.email || '-'}</td>
                      <td>{member.phone || '-'}</td>
                      <td>{member.plan_name || '-'}</td>
                      <td>{member.trainer_name || '-'}</td>
                      <td>
                        <span className={`badge badge-${
                          member.membership_status === 'active' ? 'success' : 
                          member.membership_status === 'expired' ? 'danger' : 'warning'
                        }`}>
                          {member.membership_status}
                        </span>
                      </td>
                      <td>
                        <button 
                          onClick={() => handleEditMember(member)}
                          className="btn btn-outline"
                          style={{ marginRight: '5px', padding: '6px 12px' }}
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteMember(member.id)}
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
                      No members found
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
                {editingMember ? 'Edit Member' : 'Add New Member'}
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
                <label className="form-label">Address</label>
                <input
                  type="text"
                  name="address"
                  className="form-input"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    className="form-input"
                    value={formData.date_of_birth}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    name="gender"
                    className="form-select"
                    value={formData.gender}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Emergency Contact</label>
                <input
                  type="text"
                  name="emergency_contact"
                  className="form-input"
                  value={formData.emergency_contact}
                  onChange={handleInputChange}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Membership Plan</label>
                  <select
                    name="plan_id"
                    className="form-select"
                    value={formData.plan_id}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Plan</option>
                    {plans.map(plan => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} - ₹{plan.price}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Assigned Trainer</label>
                  <select
                    name="trainer_id"
                    className="form-select"
                    value={formData.trainer_id}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Trainer</option>
                    {trainers.map(trainer => (
                      <option key={trainer.id} value={trainer.id}>
                        {trainer.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Membership Status</label>
                <select
                  name="membership_status"
                  className="form-select"
                  value={formData.membership_status}
                  onChange={handleInputChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingMember ? 'Update' : 'Add'} Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Members;
