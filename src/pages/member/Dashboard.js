import React from 'react';
import Layout from '../../components/Layout';

const MemberDashboard = () => {
  return (
    <Layout role="member">
      <div className="page-header">
        <h1 className="page-title">Member Dashboard</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Membership Status</div>
          <div className="stat-value">Active</div>
          <div className="stat-icon">✅</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Days Left</div>
          <div className="stat-value">25</div>
          <div className="stat-icon">📅</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">This Month Attendance</div>
          <div className="stat-value">18</div>
          <div className="stat-icon">🏋️</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Current Weight</div>
          <div className="stat-value">75 kg</div>
          <div className="stat-icon">⚖️</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '15px' }}>Membership Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '5px' }}>Plan</p>
            <p style={{ fontSize: '16px', fontWeight: '500' }}>Monthly Basic</p>
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '5px' }}>Assigned Trainer</p>
            <p style={{ fontSize: '16px', fontWeight: '500' }}>John Doe</p>
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '5px' }}>Start Date</p>
            <p style={{ fontSize: '16px', fontWeight: '500' }}>Jan 1, 2024</p>
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '5px' }}>End Date</p>
            <p style={{ fontSize: '16px', fontWeight: '500' }}>Jan 31, 2024</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="card">
          <h3 style={{ marginBottom: '15px' }}>My Workout Plan</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '15px' }}>
            No active workout plan. Contact your trainer to get one.
          </p>
          <button className="btn btn-outline">View Plans</button>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '15px' }}>My Diet Plan</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '15px' }}>
            No active diet plan. Contact your trainer to get one.
          </p>
          <button className="btn btn-outline">View Plans</button>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '15px' }}>Recent Announcements</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ 
            padding: '15px', 
            backgroundColor: 'var(--dark-bg)', 
            borderRadius: '8px',
            borderLeft: '3px solid var(--primary-color)'
          }}>
            <h4 style={{ fontSize: '16px', marginBottom: '5px' }}>Welcome to WeFit!</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              We're excited to have you. Check out our facilities and meet your trainer.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MemberDashboard;
