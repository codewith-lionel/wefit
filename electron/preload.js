const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // Authentication
  login: (credentials) => ipcRenderer.invoke('auth:login', credentials),
  logout: () => ipcRenderer.invoke('auth:logout'),
  getCurrentUser: () => ipcRenderer.invoke('auth:getCurrentUser'),
  
  // Members
  getMembers: (filter) => ipcRenderer.invoke('members:getAll', filter),
  getMember: (id) => ipcRenderer.invoke('members:getById', id),
  createMember: (data) => ipcRenderer.invoke('members:create', data),
  updateMember: (id, data) => ipcRenderer.invoke('members:update', { id, data }),
  deleteMember: (id) => ipcRenderer.invoke('members:delete', id),
  
  // Trainers
  getTrainers: () => ipcRenderer.invoke('trainers:getAll'),
  getTrainer: (id) => ipcRenderer.invoke('trainers:getById', id),
  createTrainer: (data) => ipcRenderer.invoke('trainers:create', data),
  updateTrainer: (id, data) => ipcRenderer.invoke('trainers:update', { id, data }),
  deleteTrainer: (id) => ipcRenderer.invoke('trainers:delete', id),
  
  // Membership Plans
  getPlans: () => ipcRenderer.invoke('plans:getAll'),
  getPlan: (id) => ipcRenderer.invoke('plans:getById', id),
  createPlan: (data) => ipcRenderer.invoke('plans:create', data),
  updatePlan: (id, data) => ipcRenderer.invoke('plans:update', { id, data }),
  deletePlan: (id) => ipcRenderer.invoke('plans:delete', id),
  
  // Payments
  getPayments: (filter) => ipcRenderer.invoke('payments:getAll', filter),
  createPayment: (data) => ipcRenderer.invoke('payments:create', data),
  updatePayment: (id, data) => ipcRenderer.invoke('payments:update', { id, data }),
  
  // Attendance
  getAttendance: (filter) => ipcRenderer.invoke('attendance:getAll', filter),
  markAttendance: (data) => ipcRenderer.invoke('attendance:mark', data),
  generateQRCode: (memberId) => ipcRenderer.invoke('attendance:generateQR', memberId),
  scanQRCode: (qrData) => ipcRenderer.invoke('attendance:scanQR', qrData),
  
  // Workout Plans
  getWorkoutPlans: (memberId) => ipcRenderer.invoke('workouts:getAll', memberId),
  createWorkoutPlan: (data) => ipcRenderer.invoke('workouts:create', data),
  updateWorkoutPlan: (id, data) => ipcRenderer.invoke('workouts:update', { id, data }),
  
  // Diet Plans
  getDietPlans: (memberId) => ipcRenderer.invoke('diets:getAll', memberId),
  createDietPlan: (data) => ipcRenderer.invoke('diets:create', data),
  updateDietPlan: (id, data) => ipcRenderer.invoke('diets:update', { id, data }),
  
  // Progress
  getProgress: (memberId) => ipcRenderer.invoke('progress:getAll', memberId),
  createProgress: (data) => ipcRenderer.invoke('progress:create', data),
  
  // Announcements
  getAnnouncements: () => ipcRenderer.invoke('announcements:getAll'),
  createAnnouncement: (data) => ipcRenderer.invoke('announcements:create', data),
  
  // Reports
  exportMembersPDF: () => ipcRenderer.invoke('reports:exportMembersPDF'),
  exportMembersExcel: () => ipcRenderer.invoke('reports:exportMembersExcel'),
  exportPaymentsReport: (filter) => ipcRenderer.invoke('reports:exportPayments', filter),
  
  // Dashboard Stats
  getDashboardStats: () => ipcRenderer.invoke('dashboard:getStats')
});
