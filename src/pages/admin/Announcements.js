import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'general',
    target_audience: 'all'
  });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const result = await window.electron.getAnnouncements();
      if (result.success) {
        setAnnouncements(result.data);
      }
    } catch (error) {
      toast.error('Error loading announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnnouncement = () => {
    setFormData({
      title: '',
      content: '',
      type: 'general',
      target_audience: 'all'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const result = await window.electron.createAnnouncement({
        ...formData,
        created_by: user.id
      });

      if (result.success) {
        toast.success('Announcement created successfully');
        setShowModal(false);
        loadAnnouncements();
      } else {
        toast.error(result.message || 'Operation failed');
      }
    } catch (error) {
      toast.error('Error creating announcement');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'offer': return '🎁';
      case 'event': return '🎉';
      case 'maintenance': return '🔧';
      default: return '📢';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'offer': return 'var(--secondary-color)';
      case 'event': return 'var(--primary-color)';
      case 'maintenance': return 'var(--warning-color)';
      default: return 'var(--text-primary)';
    }
  };

  return (
    <Layout role="admin">
      <div className="page-header">
        <h1 className="page-title">Announcements</h1>
        <div className="header-actions">
          <button onClick={handleAddAnnouncement} className="btn btn-primary">
            ➕ New Announcement
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Announcements</div>
          <div className="stat-value">{announcements.length}</div>
          <div className="stat-icon">📢</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Offers</div>
          <div className="stat-value">{announcements.filter(a => a.type === 'offer').length}</div>
          <div className="stat-icon">🎁</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Events</div>
          <div className="stat-value">{announcements.filter(a => a.type === 'event').length}</div>
          <div className="stat-icon">🎉</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">This Month</div>
          <div className="stat-value">
            {announcements.filter(a => {
              const date = new Date(a.created_at);
              const now = new Date();
              return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            }).length}
          </div>
          <div className="stat-icon">📅</div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div className="spinner" style={{ margin: '0 auto' }}></div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {announcements.length > 0 ? (
            announcements.map((announcement) => (
              <div key={announcement.id} className="card">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                  <div style={{ 
                    fontSize: '40px',
                    color: getTypeColor(announcement.type)
                  }}>
                    {getTypeIcon(announcement.type)}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <h3 style={{ fontSize: '20px', marginBottom: '5px' }}>
                          {announcement.title}
                        </h3>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <span className={`badge badge-${
                            announcement.type === 'offer' ? 'success' : 
                            announcement.type === 'event' ? 'warning' : 'danger'
                          }`} style={{ textTransform: 'capitalize' }}>
                            {announcement.type}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            Target: {announcement.target_audience}
                          </span>
                        </div>
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {new Date(announcement.created_at).toLocaleDateString()} {new Date(announcement.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <p style={{ 
                      color: 'var(--text-secondary)', 
                      lineHeight: '1.6',
                      fontSize: '14px',
                      marginTop: '10px'
                    }}>
                      {announcement.content}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="card">
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                No announcements yet. Create one to notify your members!
              </p>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Create Announcement</h2>
              <button onClick={() => setShowModal(false)} className="modal-close">×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  name="title"
                  className="form-input"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., New Year Special Offer"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Content *</label>
                <textarea
                  name="content"
                  className="form-textarea"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Enter announcement details..."
                  rows="5"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select
                    name="type"
                    className="form-select"
                    value={formData.type}
                    onChange={handleInputChange}
                  >
                    <option value="general">General</option>
                    <option value="offer">Offer</option>
                    <option value="event">Event</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Target Audience</label>
                  <select
                    name="target_audience"
                    className="form-select"
                    value={formData.target_audience}
                    onChange={handleInputChange}
                  >
                    <option value="all">All</option>
                    <option value="members">Members Only</option>
                    <option value="trainers">Trainers Only</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Announcements;
