import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { toast } from 'react-toastify';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState({
    member_id: '',
    plan_id: '',
    amount: '',
    payment_method: 'cash',
    status: 'paid',
    start_date: '',
    end_date: '',
    notes: ''
  });

  useEffect(() => {
    loadPayments();
    loadMembers();
    loadPlans();
  }, []);

  const loadPayments = async (filter = {}) => {
    try {
      const result = await window.electron.getPayments(filter);
      if (result.success) {
        setPayments(result.data);
      }
    } catch (error) {
      toast.error('Error loading payments');
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    try {
      const result = await window.electron.getMembers({});
      if (result.success) {
        setMembers(result.data);
      }
    } catch (error) {
      console.error('Error loading members:', error);
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

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    loadPayments({ status: status || undefined });
  };

  const handleAddPayment = () => {
    setFormData({
      member_id: '',
      plan_id: '',
      amount: '',
      payment_method: 'cash',
      status: 'paid',
      start_date: '',
      end_date: '',
      notes: ''
    });
    setShowModal(true);
  };

  const handlePlanChange = (e) => {
    const planId = e.target.value;
    const selectedPlan = plans.find(p => p.id === parseInt(planId));
    
    if (selectedPlan) {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + selectedPlan.duration_months);
      
      setFormData({
        ...formData,
        plan_id: planId,
        amount: selectedPlan.price,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      });
    } else {
      setFormData({
        ...formData,
        plan_id: planId
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const result = await window.electron.createPayment(formData);

      if (result.success) {
        toast.success('Payment added successfully');
        setShowModal(false);
        loadPayments();
      } else {
        toast.error(result.message || 'Operation failed');
      }
    } catch (error) {
      toast.error('Error saving payment');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleExportPDF = async () => {
    try {
      const result = await window.electron.exportPaymentsReport({ status: filterStatus || undefined });
      if (result.success) {
        toast.success(`Report exported to: ${result.path}`);
      } else {
        toast.error('Failed to export report');
      }
    } catch (error) {
      toast.error('Error exporting report');
    }
  };

  const getTotalAmount = () => {
    return payments.reduce((sum, payment) => sum + payment.amount, 0);
  };

  return (
    <Layout role="admin">
      <div className="page-header">
        <h1 className="page-title">Payments Management</h1>
        <div className="header-actions">
          <button onClick={handleExportPDF} className="btn btn-secondary">
            📄 Export PDF
          </button>
          <button onClick={handleAddPayment} className="btn btn-primary">
            ➕ Add Payment
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Payments</div>
          <div className="stat-value">{payments.length}</div>
          <div className="stat-icon">💳</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Amount</div>
          <div className="stat-value">₹{getTotalAmount().toLocaleString()}</div>
          <div className="stat-icon">💰</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Paid</div>
          <div className="stat-value">{payments.filter(p => p.status === 'paid').length}</div>
          <div className="stat-icon">✅</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Pending</div>
          <div className="stat-value">{payments.filter(p => p.status === 'pending').length}</div>
          <div className="stat-icon">⏳</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => handleFilterChange('')}
            className={`btn ${!filterStatus ? 'btn-primary' : 'btn-outline'}`}
          >
            All
          </button>
          <button 
            onClick={() => handleFilterChange('paid')}
            className={`btn ${filterStatus === 'paid' ? 'btn-primary' : 'btn-outline'}`}
          >
            Paid
          </button>
          <button 
            onClick={() => handleFilterChange('pending')}
            className={`btn ${filterStatus === 'pending' ? 'btn-primary' : 'btn-outline'}`}
          >
            Pending
          </button>
          <button 
            onClick={() => handleFilterChange('failed')}
            className={`btn ${filterStatus === 'failed' ? 'btn-primary' : 'btn-outline'}`}
          >
            Failed
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
                  <th>Member</th>
                  <th>Plan</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Date</th>
                  <th>Period</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.length > 0 ? (
                  payments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{payment.id}</td>
                      <td>{payment.member_name}</td>
                      <td>{payment.plan_name}</td>
                      <td>₹{payment.amount}</td>
                      <td style={{ textTransform: 'capitalize' }}>{payment.payment_method || '-'}</td>
                      <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                      <td>
                        {payment.start_date && payment.end_date ? (
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {new Date(payment.start_date).toLocaleDateString()} - {new Date(payment.end_date).toLocaleDateString()}
                          </span>
                        ) : '-'}
                      </td>
                      <td>
                        <span className={`badge badge-${
                          payment.status === 'paid' ? 'success' : 
                          payment.status === 'failed' ? 'danger' : 'warning'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No payments found
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
              <h2 className="modal-title">Add New Payment</h2>
              <button onClick={() => setShowModal(false)} className="modal-close">×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Member *</label>
                <select
                  name="member_id"
                  className="form-select"
                  value={formData.member_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Member</option>
                  {members.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.email || member.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Membership Plan *</label>
                <select
                  name="plan_id"
                  className="form-select"
                  value={formData.plan_id}
                  onChange={handlePlanChange}
                  required
                >
                  <option value="">Select Plan</option>
                  {plans.map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - ₹{plan.price} ({plan.duration_months} months)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Amount (₹) *</label>
                  <input
                    type="number"
                    name="amount"
                    className="form-input"
                    value={formData.amount}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Method *</label>
                  <select
                    name="payment_method"
                    className="form-select"
                    value={formData.payment_method}
                    onChange={handleInputChange}
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Start Date *</label>
                  <input
                    type="date"
                    name="start_date"
                    className="form-input"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">End Date *</label>
                  <input
                    type="date"
                    name="end_date"
                    className="form-input"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  name="notes"
                  className="form-textarea"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Payments;
