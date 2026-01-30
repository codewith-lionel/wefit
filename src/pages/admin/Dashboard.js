import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { toast } from 'react-toastify';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    inactiveMembers: 0,
    monthlyRevenue: 0,
    totalTrainers: 0,
    recentPayments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const result = await window.electron.getDashboardStats();
      if (result.success) {
        setStats(result.data);
      } else {
        toast.error('Failed to load dashboard stats');
      }
    } catch (error) {
      toast.error('Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  const membershipData = {
    labels: ['Active Members', 'Inactive Members'],
    datasets: [
      {
        data: [stats.activeMembers, stats.inactiveMembers],
        backgroundColor: ['#00b894', '#d63031'],
        borderWidth: 0
      }
    ]
  };

  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Monthly Revenue (₹)',
        data: [12000, 19000, 15000, 25000, 22000, stats.monthlyRevenue],
        backgroundColor: '#6c5ce7',
        borderRadius: 8
      }
    ]
  };

  if (loading) {
    return (
      <Layout role="admin">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="admin">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <div className="header-actions">
          <span style={{ color: 'var(--text-secondary)' }}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Members</div>
          <div className="stat-value">{stats.totalMembers}</div>
          <div className="stat-icon">👥</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Active Members</div>
          <div className="stat-value">{stats.activeMembers}</div>
          <div className="stat-icon">✅</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Trainers</div>
          <div className="stat-value">{stats.totalTrainers}</div>
          <div className="stat-icon">🏋️</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Monthly Revenue</div>
          <div className="stat-value">₹{stats.monthlyRevenue.toLocaleString()}</div>
          <div className="stat-icon">💰</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Membership Status</h3>
          <div style={{ maxWidth: '300px', margin: '0 auto' }}>
            <Pie data={membershipData} options={{ maintainAspectRatio: true }} />
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Revenue Trend</h3>
          <Bar 
            data={revenueData} 
            options={{
              responsive: true,
              plugins: {
                legend: { display: false }
              },
              scales: {
                y: { 
                  beginAtZero: true,
                  ticks: { color: '#a8a8b3' },
                  grid: { color: '#2d3561' }
                },
                x: {
                  ticks: { color: '#a8a8b3' },
                  grid: { display: false }
                }
              }
            }} 
          />
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '20px' }}>Recent Payments</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentPayments && stats.recentPayments.length > 0 ? (
                stats.recentPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.member_name}</td>
                    <td>{payment.plan_name}</td>
                    <td>₹{payment.amount}</td>
                    <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge badge-${payment.status === 'paid' ? 'success' : 'warning'}`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No recent payments
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
