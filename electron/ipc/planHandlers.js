const { getDatabase } = require('../database');

module.exports = function(ipcMain) {
  // Get all plans
  ipcMain.handle('plans:getAll', async () => {
    try {
      const db = getDatabase();
      
      return new Promise((resolve, reject) => {
        db.all('SELECT * FROM membership_plans ORDER BY price ASC', (err, rows) => {
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

  // Get plan by ID
  ipcMain.handle('plans:getById', async (event, id) => {
    try {
      const db = getDatabase();
      
      return new Promise((resolve, reject) => {
        db.get('SELECT * FROM membership_plans WHERE id = ?', [id], (err, row) => {
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

  // Create plan
  ipcMain.handle('plans:create', async (event, data) => {
    try {
      const db = getDatabase();
      
      return new Promise((resolve, reject) => {
        const query = `
          INSERT INTO membership_plans (name, duration_months, price, description, features, status)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        db.run(
          query,
          [data.name, data.duration_months, data.price, data.description, data.features, data.status || 'active'],
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

  // Update plan
  ipcMain.handle('plans:update', async (event, { id, data }) => {
    try {
      const db = getDatabase();
      
      return new Promise((resolve, reject) => {
        const query = `
          UPDATE membership_plans 
          SET name = ?, duration_months = ?, price = ?, description = ?, features = ?, 
              status = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `;
        
        db.run(
          query,
          [data.name, data.duration_months, data.price, data.description, data.features, data.status, id],
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

  // Delete plan
  ipcMain.handle('plans:delete', async (event, id) => {
    try {
      const db = getDatabase();
      
      return new Promise((resolve, reject) => {
        db.run('DELETE FROM membership_plans WHERE id = ?', [id], function(err) {
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
