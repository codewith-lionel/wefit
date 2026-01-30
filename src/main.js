const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const DatabaseManager = require('./database/database');
const { AuthService } = require('./utils/auth');
const QRCode = require('qrcode');

let mainWindow;
let dbManager;
let authService;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, '../build/icon.png')
  });

  mainWindow.loadFile('public/pages/login.html');

  // Open DevTools in development
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Initialize database
  dbManager = new DatabaseManager();
  dbManager.insertDefaultData();
  authService = new AuthService(dbManager.getDatabase());
  
  createWindow();
  setupIPC();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    if (dbManager) {
      dbManager.close();
    }
    app.quit();
  }
});

// IPC Handlers
function setupIPC() {
  const db = dbManager.getDatabase();

  // Authentication
  ipcMain.handle('auth:login', async (event, { username, password }) => {
    return authService.login(username, password);
  });

  ipcMain.handle('auth:verify', async (event, token) => {
    return authService.verifyToken(token);
  });

  ipcMain.handle('auth:changePassword', async (event, { userId, oldPassword, newPassword }) => {
    return authService.changePassword(userId, oldPassword, newPassword);
  });

  // Users Management
  ipcMain.handle('users:getAll', async (event, role) => {
    try {
      let query = 'SELECT id, username, email, full_name, phone, role, status, created_at FROM users';
      if (role) {
        query += ' WHERE role = ?';
        return db.prepare(query).all(role);
      }
      return db.prepare(query).all();
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  });

  ipcMain.handle('users:getById', async (event, id) => {
    try {
      return db.prepare('SELECT id, username, email, full_name, phone, role, status, created_at FROM users WHERE id = ?').get(id);
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  });

  ipcMain.handle('users:create', async (event, userData) => {
    try {
      const bcrypt = require('bcrypt');
      const hashedPassword = bcrypt.hashSync(userData.password, 10);
      
      const result = db.prepare(`
        INSERT INTO users (username, password, email, full_name, phone, role, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        userData.username,
        hashedPassword,
        userData.email,
        userData.full_name,
        userData.phone,
        userData.role,
        userData.status || 'active'
      );

      return { success: true, id: result.lastInsertRowid };
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('users:update', async (event, { id, userData }) => {
    try {
      db.prepare(`
        UPDATE users 
        SET email = ?, full_name = ?, phone = ?, status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(userData.email, userData.full_name, userData.phone, userData.status, id);

      return { success: true };
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('users:delete', async (event, id) => {
    try {
      db.prepare('DELETE FROM users WHERE id = ?').run(id);
      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { success: false, message: error.message };
    }
  });

  // Membership Plans
  ipcMain.handle('plans:getAll', async () => {
    try {
      return db.prepare('SELECT * FROM membership_plans WHERE status = ?').all('active');
    } catch (error) {
      console.error('Error fetching plans:', error);
      return [];
    }
  });

  ipcMain.handle('plans:create', async (event, planData) => {
    try {
      const result = db.prepare(`
        INSERT INTO membership_plans (name, description, duration_months, price, features, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        planData.name,
        planData.description,
        planData.duration_months,
        planData.price,
        JSON.stringify(planData.features),
        planData.status || 'active'
      );

      return { success: true, id: result.lastInsertRowid };
    } catch (error) {
      console.error('Error creating plan:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('plans:update', async (event, { id, planData }) => {
    try {
      db.prepare(`
        UPDATE membership_plans 
        SET name = ?, description = ?, duration_months = ?, price = ?, features = ?, status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        planData.name,
        planData.description,
        planData.duration_months,
        planData.price,
        JSON.stringify(planData.features),
        planData.status,
        id
      );

      return { success: true };
    } catch (error) {
      console.error('Error updating plan:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('plans:delete', async (event, id) => {
    try {
      db.prepare('DELETE FROM membership_plans WHERE id = ?').run(id);
      return { success: true };
    } catch (error) {
      console.error('Error deleting plan:', error);
      return { success: false, message: error.message };
    }
  });

  // Member Memberships
  ipcMain.handle('memberships:create', async (event, membershipData) => {
    try {
      const result = db.prepare(`
        INSERT INTO member_memberships (member_id, plan_id, start_date, end_date, status)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        membershipData.member_id,
        membershipData.plan_id,
        membershipData.start_date,
        membershipData.end_date,
        membershipData.status || 'active'
      );

      return { success: true, id: result.lastInsertRowid };
    } catch (error) {
      console.error('Error creating membership:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('memberships:getByMemberId', async (event, memberId) => {
    try {
      return db.prepare(`
        SELECT mm.*, mp.name as plan_name, mp.price 
        FROM member_memberships mm
        JOIN membership_plans mp ON mm.plan_id = mp.id
        WHERE mm.member_id = ?
        ORDER BY mm.created_at DESC
      `).all(memberId);
    } catch (error) {
      console.error('Error fetching memberships:', error);
      return [];
    }
  });

  // Payments
  ipcMain.handle('payments:create', async (event, paymentData) => {
    try {
      const result = db.prepare(`
        INSERT INTO payments (member_id, membership_id, amount, payment_date, payment_method, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        paymentData.member_id,
        paymentData.membership_id,
        paymentData.amount,
        paymentData.payment_date,
        paymentData.payment_method,
        paymentData.status || 'paid',
        paymentData.notes
      );

      return { success: true, id: result.lastInsertRowid };
    } catch (error) {
      console.error('Error creating payment:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('payments:getAll', async () => {
    try {
      return db.prepare(`
        SELECT p.*, u.full_name as member_name 
        FROM payments p
        JOIN users u ON p.member_id = u.id
        ORDER BY p.payment_date DESC
      `).all();
    } catch (error) {
      console.error('Error fetching payments:', error);
      return [];
    }
  });

  ipcMain.handle('payments:getByMemberId', async (event, memberId) => {
    try {
      return db.prepare('SELECT * FROM payments WHERE member_id = ? ORDER BY payment_date DESC').all(memberId);
    } catch (error) {
      console.error('Error fetching member payments:', error);
      return [];
    }
  });

  // Attendance
  ipcMain.handle('attendance:checkIn', async (event, { memberId, method }) => {
    try {
      const result = db.prepare(`
        INSERT INTO attendance (member_id, check_in_time, method)
        VALUES (?, CURRENT_TIMESTAMP, ?)
      `).run(memberId, method || 'manual');

      return { success: true, id: result.lastInsertRowid };
    } catch (error) {
      console.error('Error checking in:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('attendance:checkOut', async (event, attendanceId) => {
    try {
      db.prepare('UPDATE attendance SET check_out_time = CURRENT_TIMESTAMP WHERE id = ?').run(attendanceId);
      return { success: true };
    } catch (error) {
      console.error('Error checking out:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('attendance:getByMemberId', async (event, memberId) => {
    try {
      return db.prepare('SELECT * FROM attendance WHERE member_id = ? ORDER BY check_in_time DESC LIMIT 30').all(memberId);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      return [];
    }
  });

  ipcMain.handle('attendance:getAll', async () => {
    try {
      return db.prepare(`
        SELECT a.*, u.full_name as member_name 
        FROM attendance a
        JOIN users u ON a.member_id = u.id
        ORDER BY a.check_in_time DESC
        LIMIT 100
      `).all();
    } catch (error) {
      console.error('Error fetching all attendance:', error);
      return [];
    }
  });

  // Generate QR code for member
  ipcMain.handle('qr:generate', async (event, memberId) => {
    try {
      const qrData = JSON.stringify({ memberId, type: 'checkin' });
      const qrCodeUrl = await QRCode.toDataURL(qrData);
      return { success: true, qrCode: qrCodeUrl };
    } catch (error) {
      console.error('Error generating QR code:', error);
      return { success: false, message: error.message };
    }
  });

  // Workout Plans
  ipcMain.handle('workouts:create', async (event, workoutData) => {
    try {
      const result = db.prepare(`
        INSERT INTO workout_plans (member_id, trainer_id, title, description, plan_data, start_date, end_date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        workoutData.member_id,
        workoutData.trainer_id,
        workoutData.title,
        workoutData.description,
        JSON.stringify(workoutData.plan_data),
        workoutData.start_date,
        workoutData.end_date,
        workoutData.status || 'active'
      );

      return { success: true, id: result.lastInsertRowid };
    } catch (error) {
      console.error('Error creating workout plan:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('workouts:getByMemberId', async (event, memberId) => {
    try {
      return db.prepare(`
        SELECT w.*, u.full_name as trainer_name 
        FROM workout_plans w
        JOIN users u ON w.trainer_id = u.id
        WHERE w.member_id = ?
        ORDER BY w.created_at DESC
      `).all(memberId);
    } catch (error) {
      console.error('Error fetching workout plans:', error);
      return [];
    }
  });

  // Diet Plans
  ipcMain.handle('diets:create', async (event, dietData) => {
    try {
      const result = db.prepare(`
        INSERT INTO diet_plans (member_id, trainer_id, title, description, plan_data, start_date, end_date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        dietData.member_id,
        dietData.trainer_id,
        dietData.title,
        dietData.description,
        JSON.stringify(dietData.plan_data),
        dietData.start_date,
        dietData.end_date,
        dietData.status || 'active'
      );

      return { success: true, id: result.lastInsertRowid };
    } catch (error) {
      console.error('Error creating diet plan:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('diets:getByMemberId', async (event, memberId) => {
    try {
      return db.prepare(`
        SELECT d.*, u.full_name as trainer_name 
        FROM diet_plans d
        JOIN users u ON d.trainer_id = u.id
        WHERE d.member_id = ?
        ORDER BY d.created_at DESC
      `).all(memberId);
    } catch (error) {
      console.error('Error fetching diet plans:', error);
      return [];
    }
  });

  // Progress Tracking
  ipcMain.handle('progress:create', async (event, progressData) => {
    try {
      const result = db.prepare(`
        INSERT INTO progress_tracking (member_id, recorded_by, date, weight, body_fat_percentage, measurements, photos, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        progressData.member_id,
        progressData.recorded_by,
        progressData.date,
        progressData.weight,
        progressData.body_fat_percentage,
        JSON.stringify(progressData.measurements),
        progressData.photos,
        progressData.notes
      );

      return { success: true, id: result.lastInsertRowid };
    } catch (error) {
      console.error('Error creating progress record:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('progress:getByMemberId', async (event, memberId) => {
    try {
      return db.prepare('SELECT * FROM progress_tracking WHERE member_id = ? ORDER BY date DESC').all(memberId);
    } catch (error) {
      console.error('Error fetching progress:', error);
      return [];
    }
  });

  // Announcements
  ipcMain.handle('announcements:create', async (event, announcementData) => {
    try {
      const result = db.prepare(`
        INSERT INTO announcements (title, message, target_role, created_by, status)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        announcementData.title,
        announcementData.message,
        announcementData.target_role,
        announcementData.created_by,
        announcementData.status || 'active'
      );

      return { success: true, id: result.lastInsertRowid };
    } catch (error) {
      console.error('Error creating announcement:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('announcements:getAll', async () => {
    try {
      return db.prepare(`
        SELECT a.*, u.full_name as created_by_name 
        FROM announcements a
        JOIN users u ON a.created_by = u.id
        WHERE a.status = 'active'
        ORDER BY a.created_at DESC
      `).all();
    } catch (error) {
      console.error('Error fetching announcements:', error);
      return [];
    }
  });

  // Dashboard Statistics
  ipcMain.handle('dashboard:getStats', async () => {
    try {
      const totalMembers = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('member');
      const activeMembers = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ? AND status = ?').get('member', 'active');
      const totalTrainers = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('trainer');
      
      const currentMonth = new Date().toISOString().slice(0, 7);
      const monthlyRevenue = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total 
        FROM payments 
        WHERE strftime('%Y-%m', payment_date) = ? AND status = 'paid'
      `).get(currentMonth);

      const todayAttendance = db.prepare(`
        SELECT COUNT(*) as count 
        FROM attendance 
        WHERE DATE(check_in_time) = DATE('now')
      `).get();

      return {
        totalMembers: totalMembers.count,
        activeMembers: activeMembers.count,
        inactiveMembers: totalMembers.count - activeMembers.count,
        totalTrainers: totalTrainers.count,
        monthlyRevenue: monthlyRevenue.total,
        todayAttendance: todayAttendance.count
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return null;
    }
  });

  // Trainer Assignments
  ipcMain.handle('assignments:create', async (event, assignmentData) => {
    try {
      const result = db.prepare(`
        INSERT INTO trainer_assignments (trainer_id, member_id, assigned_date, status)
        VALUES (?, ?, ?, ?)
      `).run(
        assignmentData.trainer_id,
        assignmentData.member_id,
        assignmentData.assigned_date,
        assignmentData.status || 'active'
      );

      return { success: true, id: result.lastInsertRowid };
    } catch (error) {
      console.error('Error creating assignment:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('assignments:getByTrainerId', async (event, trainerId) => {
    try {
      return db.prepare(`
        SELECT ta.*, u.full_name as member_name, u.email as member_email 
        FROM trainer_assignments ta
        JOIN users u ON ta.member_id = u.id
        WHERE ta.trainer_id = ? AND ta.status = 'active'
        ORDER BY ta.assigned_date DESC
      `).all(trainerId);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      return [];
    }
  });
}

module.exports = { app, createWindow };
