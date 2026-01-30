import React from 'react';
import Layout from '../../components/Layout';

const TrainerDashboard = () => {
  return (
    <Layout role="trainer">
      <div className="page-header">
        <h1 className="page-title">Trainer Dashboard</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Assigned Members</div>
          <div className="stat-value">12</div>
          <div className="stat-icon">👥</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Active Workout Plans</div>
          <div className="stat-value">8</div>
          <div className="stat-icon">💪</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Active Diet Plans</div>
          <div className="stat-value">6</div>
          <div className="stat-icon">🥗</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">This Month Sessions</div>
          <div className="stat-value">45</div>
          <div className="stat-icon">📅</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '20px' }}>My Assigned Members</h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          View and manage members assigned to you, create workout and diet plans, and track their progress.
        </p>
        <div style={{ marginTop: '20px' }}>
          <button className="btn btn-primary">View Members</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="card">
          <h3 style={{ marginBottom: '15px' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button className="btn btn-outline">Create Workout Plan</button>
            <button className="btn btn-outline">Create Diet Plan</button>
            <button className="btn btn-outline">Record Progress</button>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '15px' }}>Recent Activity</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            No recent activity to display
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default TrainerDashboard;
