const { getDatabase } = require('../database');
const QRCode = require('qrcode');

module.exports = function(ipcMain) {
  // Get attendance records
  ipcMain.handle('attendance:getAll', async (event, filter = {}) => {
    try {
      const db = getDatabase();
      
      let query = `
        SELECT a.*, m.name as member_name 
        FROM attendance a
        LEFT JOIN members m ON a.member_id = m.id
      `;
      
      const conditions = [];
      const params = [];
      
      if (filter.memberId) {
        conditions.push('a.member_id = ?');
        params.push(filter.memberId);
      }
      
      if (filter.date) {
        conditions.push('a.date = ?');
        params.push(filter.date);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' ORDER BY a.check_in_time DESC LIMIT 100';
      
      return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
          if (err) {
            reject({ success: false, message: err.message });
          } else {
            resolve({ success: true, data: rows });
          }
        });
      });
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  // Mark attendance
  ipcMain.handle('attendance:mark', async (event, data) => {
    try {
      const db = getDatabase();
      
      return new Promise((resolve, reject) => {
        const query = `
          INSERT INTO attendance (member_id, notes)
          VALUES (?, ?)
        `;
        
        db.run(query, [data.member_id, data.notes || ''], function(err) {
          if (err) {
            reject({ success: false, message: err.message });
          } else {
            resolve({ success: true, id: this.lastID });
          }
        });
      });
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  // Generate QR code for member
  ipcMain.handle('attendance:generateQR', async (event, memberId) => {
    try {
      const qrData = JSON.stringify({
        memberId,
        type: 'attendance',
        timestamp: Date.now()
      });
      
      const qrCode = await QRCode.toDataURL(qrData);
      return { success: true, qrCode };
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  // Scan QR code and mark attendance
  ipcMain.handle('attendance:scanQR', async (event, qrData) => {
    try {
      const data = JSON.parse(qrData);
      
      if (data.type === 'attendance' && data.memberId) {
        const db = getDatabase();
        
        return new Promise((resolve, reject) => {
          db.run(
            'INSERT INTO attendance (member_id, notes) VALUES (?, ?)',
            [data.memberId, 'QR Code Check-in'],
            function(err) {
              if (err) {
                reject({ success: false, message: err.message });
              } else {
                resolve({ success: true, id: this.lastID });
              }
            }
          );
        });
      }
      
      return { success: false, message: 'Invalid QR code' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  // Workout plans handlers
  ipcMain.handle('workouts:getAll', async (event, memberId) => {
    try {
      const db = getDatabase();
      
      return new Promise((resolve, reject) => {
        db.all(
          `SELECT wp.*, t.name as trainer_name 
           FROM workout_plans wp
           LEFT JOIN trainers t ON wp.trainer_id = t.id
           WHERE wp.member_id = ?
           ORDER BY wp.created_at DESC`,
          [memberId],
          (err, rows) => {
            if (err) {
              reject({ success: false, message: err.message });
            } else {
              resolve({ success: true, data: rows });
            }
          }
        );
      });
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('workouts:create', async (event, data) => {
    try {
      const db = getDatabase();
      
      return new Promise((resolve, reject) => {
        const query = `
          INSERT INTO workout_plans (member_id, trainer_id, title, description, 
                                    exercises, frequency, start_date, end_date)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        db.run(
          query,
          [
            data.member_id, data.trainer_id, data.title, data.description,
            data.exercises, data.frequency, data.start_date, data.end_date
          ],
          function(err) {
            if (err) {
              reject({ success: false, message: err.message });
            } else {
              resolve({ success: true, id: this.lastID });
            }
          }
        );
      });
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('workouts:update', async (event, { id, data }) => {
    try {
      const db = getDatabase();
      
      return new Promise((resolve, reject) => {
        const query = `
          UPDATE workout_plans 
          SET title = ?, description = ?, exercises = ?, frequency = ?, 
              start_date = ?, end_date = ?, status = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `;
        
        db.run(
          query,
          [
            data.title, data.description, data.exercises, data.frequency,
            data.start_date, data.end_date, data.status, id
          ],
          function(err) {
            if (err) {
              reject({ success: false, message: err.message });
            } else {
              resolve({ success: true, changes: this.changes });
            }
          }
        );
      });
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  // Diet plans handlers
  ipcMain.handle('diets:getAll', async (event, memberId) => {
    try {
      const db = getDatabase();
      
      return new Promise((resolve, reject) => {
        db.all(
          `SELECT dp.*, t.name as trainer_name 
           FROM diet_plans dp
           LEFT JOIN trainers t ON dp.trainer_id = t.id
           WHERE dp.member_id = ?
           ORDER BY dp.created_at DESC`,
          [memberId],
          (err, rows) => {
            if (err) {
              reject({ success: false, message: err.message });
            } else {
              resolve({ success: true, data: rows });
            }
          }
        );
      });
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('diets:create', async (event, data) => {
    try {
      const db = getDatabase();
      
      return new Promise((resolve, reject) => {
        const query = `
          INSERT INTO diet_plans (member_id, trainer_id, title, description, 
                                 meal_plan, calories, start_date, end_date)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        db.run(
          query,
          [
            data.member_id, data.trainer_id, data.title, data.description,
            data.meal_plan, data.calories, data.start_date, data.end_date
          ],
          function(err) {
            if (err) {
              reject({ success: false, message: err.message });
            } else {
              resolve({ success: true, id: this.lastID });
            }
          }
        );
      });
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('diets:update', async (event, { id, data }) => {
    try {
      const db = getDatabase();
      
      return new Promise((resolve, reject) => {
        const query = `
          UPDATE diet_plans 
          SET title = ?, description = ?, meal_plan = ?, calories = ?, 
              start_date = ?, end_date = ?, status = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `;
        
        db.run(
          query,
          [
            data.title, data.description, data.meal_plan, data.calories,
            data.start_date, data.end_date, data.status, id
          ],
          function(err) {
            if (err) {
              reject({ success: false, message: err.message });
            } else {
              resolve({ success: true, changes: this.changes });
            }
          }
        );
      });
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  // Progress handlers
  ipcMain.handle('progress:getAll', async (event, memberId) => {
    try {
      const db = getDatabase();
      
      return new Promise((resolve, reject) => {
        db.all(
          'SELECT * FROM progress WHERE member_id = ? ORDER BY date DESC',
          [memberId],
          (err, rows) => {
            if (err) {
              reject({ success: false, message: err.message });
            } else {
              resolve({ success: true, data: rows });
            }
          }
        );
      });
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('progress:create', async (event, data) => {
    try {
      const db = getDatabase();
      
      return new Promise((resolve, reject) => {
        const query = `
          INSERT INTO progress (member_id, weight, body_fat_percentage, measurements, notes)
          VALUES (?, ?, ?, ?, ?)
        `;
        
        db.run(
          query,
          [data.member_id, data.weight, data.body_fat_percentage, data.measurements, data.notes],
          function(err) {
            if (err) {
              reject({ success: false, message: err.message });
            } else {
              resolve({ success: true, id: this.lastID });
            }
          }
        );
      });
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  // Announcements handlers
  ipcMain.handle('announcements:getAll', async () => {
    try {
      const db = getDatabase();
      
      return new Promise((resolve, reject) => {
        db.all(
          'SELECT * FROM announcements ORDER BY created_at DESC LIMIT 50',
          (err, rows) => {
            if (err) {
              reject({ success: false, message: err.message });
            } else {
              resolve({ success: true, data: rows });
            }
          }
        );
      });
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('announcements:create', async (event, data) => {
    try {
      const db = getDatabase();
      
      return new Promise((resolve, reject) => {
        const query = `
          INSERT INTO announcements (title, content, type, target_audience, created_by)
          VALUES (?, ?, ?, ?, ?)
        `;
        
        db.run(
          query,
          [data.title, data.content, data.type, data.target_audience, data.created_by],
          function(err) {
            if (err) {
              reject({ success: false, message: err.message });
            } else {
              resolve({ success: true, id: this.lastID });
            }
          }
        );
      });
    } catch (error) {
      return { success: false, message: error.message };
    }
  });
};
