const { getDatabase } = require('../database');

module.exports = function(ipcMain) {
  // Get all members
  ipcMain.handle('members:getAll', async (event, filter = {}) => {
    try {
      const db = getDatabase();
      let query = `
        SELECT m.*, mp.name as plan_name, t.name as trainer_name 
        FROM members m
        LEFT JOIN membership_plans mp ON m.plan_id = mp.id
        LEFT JOIN trainers t ON m.trainer_id = t.id
      `;
      
      const conditions = [];
      const params = [];
      
      if (filter.status) {
        conditions.push('m.membership_status = ?');
        params.push(filter.status);
      }
      
      if (filter.search) {
        conditions.push('(m.name LIKE ? OR m.email LIKE ? OR m.phone LIKE ?)');
        const searchParam = `%${filter.search}%`;
        params.push(searchParam, searchParam, searchParam);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' ORDER BY m.created_at DESC';
      
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

  // Get member by ID
  ipcMain.handle('members:getById', async (event, id) => {
    try {
      const db = getDatabase();
      
      return new Promise((resolve, reject) => {
        db.get(
          `SELECT m.*, mp.name as plan_name, t.name as trainer_name 
           FROM members m
           LEFT JOIN membership_plans mp ON m.plan_id = mp.id
           LEFT JOIN trainers t ON m.trainer_id = t.id
           WHERE m.id = ?`,
          [id],
          (err, row) => {
            if (err) {
              reject({ success: false, message: err.message });
            } else {
              resolve({ success: true, data: row });
            }
          }
        );
      });
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  // Create member
  ipcMain.handle('members:create', async (event, data) => {
    try {
      const db = getDatabase();
      
      return new Promise((resolve, reject) => {
        const query = `
          INSERT INTO members (name, email, phone, address, date_of_birth, gender, 
                             emergency_contact, plan_id, trainer_id, membership_status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        db.run(
          query,
          [
            data.name, data.email, data.phone, data.address, data.date_of_birth,
            data.gender, data.emergency_contact, data.plan_id, data.trainer_id,
            data.membership_status || 'active'
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

  // Update member
  ipcMain.handle('members:update', async (event, { id, data }) => {
    try {
      const db = getDatabase();
      
      return new Promise((resolve, reject) => {
        const query = `
          UPDATE members 
          SET name = ?, email = ?, phone = ?, address = ?, date_of_birth = ?, 
              gender = ?, emergency_contact = ?, plan_id = ?, trainer_id = ?, 
              membership_status = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `;
        
        db.run(
          query,
          [
            data.name, data.email, data.phone, data.address, data.date_of_birth,
            data.gender, data.emergency_contact, data.plan_id, data.trainer_id,
            data.membership_status, id
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

  // Delete member
  ipcMain.handle('members:delete', async (event, id) => {
    try {
      const db = getDatabase();
      
      return new Promise((resolve, reject) => {
        db.run('DELETE FROM members WHERE id = ?', [id], function(err) {
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

  // Get dashboard stats
  ipcMain.handle('dashboard:getStats', async () => {
    try {
      const db = getDatabase();
      
      return new Promise((resolve, reject) => {
        const stats = {};
        
        // Total members
        db.get('SELECT COUNT(*) as count FROM members', (err, row) => {
          if (err) {
            reject({ success: false, message: err.message });
            return;
          }
          stats.totalMembers = row.count;
          
          // Active members
          db.get('SELECT COUNT(*) as count FROM members WHERE membership_status = "active"', (err, row) => {
            if (err) {
              reject({ success: false, message: err.message });
              return;
            }
            stats.activeMembers = row.count;
            stats.inactiveMembers = stats.totalMembers - stats.activeMembers;
            
            // Monthly revenue
            db.get(
              `SELECT SUM(amount) as revenue 
               FROM payments 
               WHERE strftime('%Y-%m', payment_date) = strftime('%Y-%m', 'now')`,
              (err, row) => {
                if (err) {
                  reject({ success: false, message: err.message });
                  return;
                }
                stats.monthlyRevenue = row.revenue || 0;
                
                // Total trainers
                db.get('SELECT COUNT(*) as count FROM trainers WHERE status = "active"', (err, row) => {
                  if (err) {
                    reject({ success: false, message: err.message });
                    return;
                  }
                  stats.totalTrainers = row.count;
                  
                  // Recent payments
                  db.all(
                    `SELECT p.*, m.name as member_name, mp.name as plan_name
                     FROM payments p
                     LEFT JOIN members m ON p.member_id = m.id
                     LEFT JOIN membership_plans mp ON p.plan_id = mp.id
                     ORDER BY p.payment_date DESC
                     LIMIT 5`,
                    (err, rows) => {
                      if (err) {
                        reject({ success: false, message: err.message });
                        return;
                      }
                      stats.recentPayments = rows;
                      
                      resolve({ success: true, data: stats });
                    }
                  );
                });
              }
            );
          });
        });
      });
    } catch (error) {
      return { success: false, message: error.message };
    }
  });
};
