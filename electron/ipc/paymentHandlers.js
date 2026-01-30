const { getDatabase } = require('../database');

module.exports = function(ipcMain) {
  // Get all payments
  ipcMain.handle('payments:getAll', async (event, filter = {}) => {
    try {
      const db = getDatabase();
      
      let query = `
        SELECT p.*, m.name as member_name, mp.name as plan_name 
        FROM payments p
        LEFT JOIN members m ON p.member_id = m.id
        LEFT JOIN membership_plans mp ON p.plan_id = mp.id
      `;
      
      const conditions = [];
      const params = [];
      
      if (filter.status) {
        conditions.push('p.status = ?');
        params.push(filter.status);
      }
      
      if (filter.memberId) {
        conditions.push('p.member_id = ?');
        params.push(filter.memberId);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' ORDER BY p.payment_date DESC';
      
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

  // Create payment
  ipcMain.handle('payments:create', async (event, data) => {
    try {
      const db = getDatabase();
      
      return new Promise((resolve, reject) => {
        const query = `
          INSERT INTO payments (member_id, plan_id, amount, payment_method, status, 
                              start_date, end_date, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        db.run(
          query,
          [
            data.member_id, data.plan_id, data.amount, data.payment_method,
            data.status || 'paid', data.start_date, data.end_date, data.notes
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

  // Update payment
  ipcMain.handle('payments:update', async (event, { id, data }) => {
    try {
      const db = getDatabase();
      
      return new Promise((resolve, reject) => {
        const query = `
          UPDATE payments 
          SET status = ?, payment_method = ?, notes = ?
          WHERE id = ?
        `;
        
        db.run(
          query,
          [data.status, data.payment_method, data.notes, id],
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
};
