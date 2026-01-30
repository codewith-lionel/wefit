const { getDatabase } = require('../database');

module.exports = function(ipcMain) {
  // Get all trainers
  ipcMain.handle('trainers:getAll', async () => {
    try {
      const db = getDatabase();
      
      return new Promise((resolve, reject) => {
        db.all(
          'SELECT * FROM trainers ORDER BY created_at DESC',
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

  // Get trainer by ID
  ipcMain.handle('trainers:getById', async (event, id) => {
    try {
      const db = getDatabase();
      
      return new Promise((resolve, reject) => {
        db.get('SELECT * FROM trainers WHERE id = ?', [id], (err, row) => {
          if (err) {
            reject({ success: false, message: err.message });
          } else {
            resolve({ success: true, data: row });
          }
        });
      });
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  // Create trainer
  ipcMain.handle('trainers:create', async (event, data) => {
    try {
      const db = getDatabase();
      
      return new Promise((resolve, reject) => {
        const query = `
          INSERT INTO trainers (name, email, phone, specialization, experience_years, status)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        db.run(
          query,
          [data.name, data.email, data.phone, data.specialization, data.experience_years, data.status || 'active'],
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

  // Update trainer
  ipcMain.handle('trainers:update', async (event, { id, data }) => {
    try {
      const db = getDatabase();
      
      return new Promise((resolve, reject) => {
        const query = `
          UPDATE trainers 
          SET name = ?, email = ?, phone = ?, specialization = ?, experience_years = ?, 
              status = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `;
        
        db.run(
          query,
          [data.name, data.email, data.phone, data.specialization, data.experience_years, data.status, id],
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

  // Delete trainer
  ipcMain.handle('trainers:delete', async (event, id) => {
    try {
      const db = getDatabase();
      
      return new Promise((resolve, reject) => {
        db.run('DELETE FROM trainers WHERE id = ?', [id], function(err) {
          if (err) {
            reject({ success: false, message: err.message });
          } else {
            resolve({ success: true, changes: this.changes });
          }
        });
      });
    } catch (error) {
      return { success: false, message: error.message };
    }
  });
};
