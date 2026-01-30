import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-toastify';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState({
    member_id: '',
    notes: ''
  });

  useEffect(() => {
    loadAttendance();
    loadMembers();
  }, []);

  const loadAttendance = async (filter = {}) => {
    try {
      const result = await window.electron.getAttendance(filter);
      if (result.success) {
        setAttendance(result.data);
      }
    } catch (error) {
      toast.error('Error loading attendance');
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    try {
      const result = await window.electron.getMembers({ status: 'active' });
      if (result.success) {
        setMembers(result.data);
      }
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const handleFilterByDate = () => {
    loadAttendance({ date: filterDate });
  };

  const handleMarkAttendance = () => {
    setFormData({
      member_id: '',
      notes: ''
    });
    setShowModal(true);
  };

  const handleGenerateQR = async (member) => {
    try {
      setSelectedMember(member);
      const result = await window.electron.generateQRCode(member.id);
      if (result.success) {
        setQrCode(result.qrCode);
        setShowQRModal(true);
      } else {
        toast.error('Failed to generate QR code');
      }
    } catch (error) {
      toast.error('Error generating QR code');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const result = await window.electron.markAttendance(formData);

      if (result.success) {
        toast.success('Attendance marked successfully');
        setShowModal(false);
        loadAttendance();
      } else {
        toast.error(result.message || 'Operation failed');
      }
    } catch (error) {
      toast.error('Error marking attendance');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getTodayAttendance = () => {
    const today = new Date().toISOString().split('T')[0];
    return attendance.filter(a => a.date === today).length;
  };

  return (
    <Layout role="admin">
      <div className="page-header">
        <h1 className="page-title">Attendance Management</h1>
        <div className="header-actions">
          <button onClick={handleMarkAttendance} className="btn btn-primary">
            ✅ Mark Attendance
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Today's Attendance</div>
          <div className="stat-value">{getTodayAttendance()}</div>
          <div className="stat-icon">📅</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Records</div>
          <div className="stat-value">{attendance.length}</div>
          <div className="stat-icon">📊</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Active Members</div>
          <div className="stat-value">{members.length}</div>
          <div className="stat-icon">👥</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">This Month</div>
          <div className="stat-value">
            {attendance.filter(a => {
              const date = new Date(a.date);
              const now = new Date();
              return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            }).length}
          </div>
          <div className="stat-icon">📈</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '15px' }}>Quick QR Check-in</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
          {members.slice(0, 6).map(member => (
            <button
              key={member.id}
              onClick={() => handleGenerateQR(member)}
              className="btn btn-outline"
              style={{ padding: '12px' }}
            >
              📱 {member.name}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label">Filter by Date</label>
            <input
              type="date"
              className="form-input"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
          <button onClick={handleFilterByDate} className="btn btn-primary">
            🔍 Filter
          </button>
          <button onClick={() => loadAttendance()} className="btn btn-outline">
            🔄 Show All
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
                  <th>Check-in Time</th>
                  <th>Date</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {attendance.length > 0 ? (
                  attendance.map((record) => (
                    <tr key={record.id}>
                      <td>{record.id}</td>
                      <td>{record.member_name}</td>
                      <td>{new Date(record.check_in_time).toLocaleTimeString()}</td>
                      <td>{new Date(record.check_in_time).toLocaleDateString()}</td>
                      <td>{record.notes || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No attendance records found
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
              <h2 className="modal-title">Mark Attendance</h2>
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
                <label className="form-label">Notes</label>
                <textarea
                  name="notes"
                  className="form-textarea"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Optional notes..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Mark Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showQRModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2 className="modal-title">QR Code - {selectedMember?.name}</h2>
              <button onClick={() => setShowQRModal(false)} className="modal-close">×</button>
            </div>

            <div style={{ textAlign: 'center', padding: '20px' }}>
              {qrCode && (
                <img src={qrCode} alt="QR Code" style={{ maxWidth: '300px', width: '100%' }} />
              )}
              <p style={{ marginTop: '20px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                Scan this QR code to mark attendance for {selectedMember?.name}
              </p>
            </div>

            <div className="modal-actions">
              <button onClick={() => setShowQRModal(false)} className="btn btn-primary" style={{ width: '100%' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Attendance;
