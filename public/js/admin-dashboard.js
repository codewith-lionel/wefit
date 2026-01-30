const { ipcRenderer } = require('electron');

// Check authentication
const user = JSON.parse(localStorage.getItem('user') || '{}');
const token = localStorage.getItem('token');

if (!token || !user || user.role !== 'admin') {
  window.location.href = 'login.html';
}

document.getElementById('userInfo').textContent = `${user.full_name} (Admin)`;

// Navigation
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const page = link.dataset.page;
    
    if (page === 'logout') {
      logout();
      return;
    }

    // Update active state
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');

    // Show selected page
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById(page + 'Page').classList.remove('hidden');

    // Load page data
    loadPageData(page);
  });
});

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

// Load dashboard stats
async function loadDashboardStats() {
  try {
    const stats = await ipcRenderer.invoke('dashboard:getStats');
    if (stats) {
      document.getElementById('totalMembers').textContent = stats.totalMembers;
      document.getElementById('activeMembers').textContent = stats.activeMembers;
      document.getElementById('totalTrainers').textContent = stats.totalTrainers;
      document.getElementById('monthlyRevenue').textContent = `$${stats.monthlyRevenue.toFixed(2)}`;
      document.getElementById('todayAttendance').textContent = stats.todayAttendance;
    }

    // Load recent payments
    const payments = await ipcRenderer.invoke('payments:getAll');
    const tbody = document.querySelector('#recentPaymentsTable tbody');
    tbody.innerHTML = payments.slice(0, 5).map(p => `
      <tr>
        <td>${p.member_name}</td>
        <td>$${p.amount.toFixed(2)}</td>
        <td>${new Date(p.payment_date).toLocaleDateString()}</td>
        <td><span class="badge badge-${p.status === 'paid' ? 'success' : 'warning'}">${p.status}</span></td>
      </tr>
    `).join('') || '<tr><td colspan="4" class="text-center">No payments found</td></tr>';
  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
}

// Load members
async function loadMembers() {
  try {
    const members = await ipcRenderer.invoke('users:getAll', 'member');
    const tbody = document.querySelector('#membersTable tbody');
    tbody.innerHTML = members.map(m => `
      <tr>
        <td>${m.id}</td>
        <td>${m.full_name}</td>
        <td>${m.email}</td>
        <td>${m.phone || '-'}</td>
        <td><span class="badge badge-${m.status === 'active' ? 'success' : 'danger'}">${m.status}</span></td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="viewMember(${m.id})">View</button>
          <button class="btn btn-sm btn-danger" onclick="deleteMember(${m.id})">Delete</button>
        </td>
      </tr>
    `).join('') || '<tr><td colspan="6" class="text-center">No members found</td></tr>';
  } catch (error) {
    console.error('Error loading members:', error);
  }
}

// Load trainers
async function loadTrainers() {
  try {
    const trainers = await ipcRenderer.invoke('users:getAll', 'trainer');
    const tbody = document.querySelector('#trainersTable tbody');
    tbody.innerHTML = trainers.map(t => `
      <tr>
        <td>${t.id}</td>
        <td>${t.full_name}</td>
        <td>${t.email}</td>
        <td>${t.phone || '-'}</td>
        <td><span class="badge badge-${t.status === 'active' ? 'success' : 'danger'}">${t.status}</span></td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="viewTrainer(${t.id})">View</button>
          <button class="btn btn-sm btn-danger" onclick="deleteTrainer(${t.id})">Delete</button>
        </td>
      </tr>
    `).join('') || '<tr><td colspan="6" class="text-center">No trainers found</td></tr>';
  } catch (error) {
    console.error('Error loading trainers:', error);
  }
}

// Load membership plans
async function loadPlans() {
  try {
    const plans = await ipcRenderer.invoke('plans:getAll');
    const grid = document.getElementById('plansGrid');
    grid.innerHTML = plans.map(p => {
      const features = JSON.parse(p.features || '[]');
      return `
        <div class="stat-card">
          <h3>${p.name}</h3>
          <div class="stat-value">$${p.price}</div>
          <div class="stat-label">${p.duration_months} month${p.duration_months > 1 ? 's' : ''}</div>
          <p style="margin: 10px 0; color: var(--text-secondary); font-size: 14px;">${p.description || ''}</p>
          <ul style="list-style: none; padding: 0; font-size: 12px; color: var(--text-secondary);">
            ${features.map(f => `<li>✓ ${f}</li>`).join('')}
          </ul>
          <div class="mt-2">
            <button class="btn btn-sm btn-danger" onclick="deletePlan(${p.id})">Delete</button>
          </div>
        </div>
      `;
    }).join('') || '<p>No plans found</p>';
  } catch (error) {
    console.error('Error loading plans:', error);
  }
}

// Load payments
async function loadPayments() {
  try {
    const payments = await ipcRenderer.invoke('payments:getAll');
    const tbody = document.querySelector('#paymentsTable tbody');
    tbody.innerHTML = payments.map(p => `
      <tr>
        <td>${p.member_name}</td>
        <td>$${p.amount.toFixed(2)}</td>
        <td>${new Date(p.payment_date).toLocaleDateString()}</td>
        <td>${p.payment_method || '-'}</td>
        <td><span class="badge badge-${p.status === 'paid' ? 'success' : p.status === 'pending' ? 'warning' : 'danger'}">${p.status}</span></td>
      </tr>
    `).join('') || '<tr><td colspan="5" class="text-center">No payments found</td></tr>';
  } catch (error) {
    console.error('Error loading payments:', error);
  }
}

// Load attendance
async function loadAttendance() {
  try {
    const attendance = await ipcRenderer.invoke('attendance:getAll');
    const tbody = document.querySelector('#attendanceTable tbody');
    tbody.innerHTML = attendance.map(a => `
      <tr>
        <td>${a.member_name}</td>
        <td>${new Date(a.check_in_time).toLocaleString()}</td>
        <td>${a.check_out_time ? new Date(a.check_out_time).toLocaleString() : '-'}</td>
        <td><span class="badge badge-primary">${a.method}</span></td>
        <td>
          ${!a.check_out_time ? `<button class="btn btn-sm btn-success" onclick="checkOut(${a.id})">Check Out</button>` : ''}
        </td>
      </tr>
    `).join('') || '<tr><td colspan="5" class="text-center">No attendance records found</td></tr>';
  } catch (error) {
    console.error('Error loading attendance:', error);
  }
}

// Load announcements
async function loadAnnouncements() {
  try {
    const announcements = await ipcRenderer.invoke('announcements:getAll');
    const grid = document.getElementById('announcementsGrid');
    grid.innerHTML = announcements.map(a => `
      <div class="stat-card" style="margin-bottom: 20px;">
        <h3>${a.title}</h3>
        <p style="margin: 10px 0; color: var(--text-secondary); font-size: 14px;">${a.message}</p>
        <div class="flex-between">
          <span class="badge badge-primary">${a.target_role}</span>
          <small style="color: var(--text-secondary);">${new Date(a.created_at).toLocaleDateString()}</small>
        </div>
      </div>
    `).join('') || '<p>No announcements found</p>';
  } catch (error) {
    console.error('Error loading announcements:', error);
  }
}

// Load page data based on current page
function loadPageData(page) {
  switch (page) {
    case 'dashboard':
      loadDashboardStats();
      break;
    case 'members':
      loadMembers();
      break;
    case 'trainers':
      loadTrainers();
      break;
    case 'plans':
      loadPlans();
      break;
    case 'payments':
      loadPayments();
      loadMembersForPayment();
      break;
    case 'attendance':
      loadAttendance();
      loadMembersForCheckIn();
      break;
    case 'announcements':
      loadAnnouncements();
      break;
  }
}

// Modal functions
function showAddMemberModal() {
  document.getElementById('addMemberModal').classList.add('active');
}

function showAddTrainerModal() {
  document.getElementById('addTrainerModal').classList.add('active');
}

function showAddPlanModal() {
  document.getElementById('addPlanModal').classList.add('active');
}

function showAddPaymentModal() {
  document.getElementById('addPaymentModal').classList.add('active');
}

function showCheckInModal() {
  document.getElementById('checkInModal').classList.add('active');
}

function showAddAnnouncementModal() {
  document.getElementById('addAnnouncementModal').classList.add('active');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

// Form submissions
document.getElementById('addMemberForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const memberData = {
    username: formData.get('username'),
    password: formData.get('password'),
    full_name: formData.get('full_name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    role: 'member',
    status: 'active'
  };

  try {
    const result = await ipcRenderer.invoke('users:create', memberData);
    if (result.success) {
      alert('Member added successfully!');
      closeModal('addMemberModal');
      e.target.reset();
      loadMembers();
    } else {
      alert('Error: ' + result.message);
    }
  } catch (error) {
    console.error('Error adding member:', error);
    alert('Failed to add member');
  }
});

document.getElementById('addTrainerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const trainerData = {
    username: formData.get('username'),
    password: formData.get('password'),
    full_name: formData.get('full_name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    role: 'trainer',
    status: 'active'
  };

  try {
    const result = await ipcRenderer.invoke('users:create', trainerData);
    if (result.success) {
      alert('Trainer added successfully!');
      closeModal('addTrainerModal');
      e.target.reset();
      loadTrainers();
    } else {
      alert('Error: ' + result.message);
    }
  } catch (error) {
    console.error('Error adding trainer:', error);
    alert('Failed to add trainer');
  }
});

document.getElementById('addPlanForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const featuresStr = formData.get('features');
  const features = featuresStr ? featuresStr.split(',').map(f => f.trim()) : [];
  
  const planData = {
    name: formData.get('name'),
    description: formData.get('description'),
    duration_months: parseInt(formData.get('duration_months')),
    price: parseFloat(formData.get('price')),
    features: features,
    status: 'active'
  };

  try {
    const result = await ipcRenderer.invoke('plans:create', planData);
    if (result.success) {
      alert('Plan added successfully!');
      closeModal('addPlanModal');
      e.target.reset();
      loadPlans();
    } else {
      alert('Error: ' + result.message);
    }
  } catch (error) {
    console.error('Error adding plan:', error);
    alert('Failed to add plan');
  }
});

document.getElementById('addPaymentForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  
  const paymentData = {
    member_id: parseInt(formData.get('member_id')),
    membership_id: parseInt(formData.get('membership_id')),
    amount: parseFloat(formData.get('amount')),
    payment_date: formData.get('payment_date'),
    payment_method: formData.get('payment_method'),
    notes: formData.get('notes'),
    status: 'paid'
  };

  try {
    const result = await ipcRenderer.invoke('payments:create', paymentData);
    if (result.success) {
      alert('Payment recorded successfully!');
      closeModal('addPaymentModal');
      e.target.reset();
      loadPayments();
    } else {
      alert('Error: ' + result.message);
    }
  } catch (error) {
    console.error('Error recording payment:', error);
    alert('Failed to record payment');
  }
});

document.getElementById('checkInForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  
  const checkInData = {
    memberId: parseInt(formData.get('member_id')),
    method: formData.get('method')
  };

  try {
    const result = await ipcRenderer.invoke('attendance:checkIn', checkInData);
    if (result.success) {
      alert('Member checked in successfully!');
      closeModal('checkInModal');
      e.target.reset();
      loadAttendance();
    } else {
      alert('Error: ' + result.message);
    }
  } catch (error) {
    console.error('Error checking in:', error);
    alert('Failed to check in member');
  }
});

document.getElementById('addAnnouncementForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  
  const announcementData = {
    title: formData.get('title'),
    message: formData.get('message'),
    target_role: formData.get('target_role'),
    created_by: user.id,
    status: 'active'
  };

  try {
    const result = await ipcRenderer.invoke('announcements:create', announcementData);
    if (result.success) {
      alert('Announcement posted successfully!');
      closeModal('addAnnouncementModal');
      e.target.reset();
      loadAnnouncements();
    } else {
      alert('Error: ' + result.message);
    }
  } catch (error) {
    console.error('Error posting announcement:', error);
    alert('Failed to post announcement');
  }
});

// Load members for payment form
async function loadMembersForPayment() {
  try {
    const members = await ipcRenderer.invoke('users:getAll', 'member');
    const select = document.getElementById('paymentMemberSelect');
    select.innerHTML = '<option value="">Select Member</option>' + 
      members.map(m => `<option value="${m.id}">${m.full_name}</option>`).join('');
    
    // Load memberships when member is selected
    select.addEventListener('change', async (e) => {
      const memberId = e.target.value;
      if (memberId) {
        const memberships = await ipcRenderer.invoke('memberships:getByMemberId', parseInt(memberId));
        const membershipSelect = document.getElementById('membershipSelect');
        membershipSelect.innerHTML = '<option value="">Select Membership</option>' +
          memberships.map(m => `<option value="${m.id}">${m.plan_name} - $${m.price}</option>`).join('');
      }
    });
  } catch (error) {
    console.error('Error loading members for payment:', error);
  }
}

// Load members for check-in
async function loadMembersForCheckIn() {
  try {
    const members = await ipcRenderer.invoke('users:getAll', 'member');
    const select = document.querySelector('#checkInForm select[name="member_id"]');
    select.innerHTML = '<option value="">Select Member</option>' + 
      members.map(m => `<option value="${m.id}">${m.full_name}</option>`).join('');
  } catch (error) {
    console.error('Error loading members for check-in:', error);
  }
}

// Delete functions
async function deleteMember(id) {
  if (confirm('Are you sure you want to delete this member?')) {
    try {
      const result = await ipcRenderer.invoke('users:delete', id);
      if (result.success) {
        alert('Member deleted successfully!');
        loadMembers();
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      console.error('Error deleting member:', error);
      alert('Failed to delete member');
    }
  }
}

async function deleteTrainer(id) {
  if (confirm('Are you sure you want to delete this trainer?')) {
    try {
      const result = await ipcRenderer.invoke('users:delete', id);
      if (result.success) {
        alert('Trainer deleted successfully!');
        loadTrainers();
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      console.error('Error deleting trainer:', error);
      alert('Failed to delete trainer');
    }
  }
}

async function deletePlan(id) {
  if (confirm('Are you sure you want to delete this plan?')) {
    try {
      const result = await ipcRenderer.invoke('plans:delete', id);
      if (result.success) {
        alert('Plan deleted successfully!');
        loadPlans();
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      alert('Failed to delete plan');
    }
  }
}

async function checkOut(attendanceId) {
  try {
    const result = await ipcRenderer.invoke('attendance:checkOut', attendanceId);
    if (result.success) {
      alert('Member checked out successfully!');
      loadAttendance();
    } else {
      alert('Error: ' + result.message);
    }
  } catch (error) {
    console.error('Error checking out:', error);
    alert('Failed to check out member');
  }
}

function viewMember(id) {
  alert('View member details - Feature to be implemented');
}

function viewTrainer(id) {
  alert('View trainer details - Feature to be implemented');
}

// Initialize
loadDashboardStats();
