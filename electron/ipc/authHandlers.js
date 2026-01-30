const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDatabase } = require('../database');

const JWT_SECRET = 'wefit-secret-key-change-in-production';
let currentUser = null;

module.exports = function(ipcMain) {
  ipcMain.handle('auth:login', async (event, { username, password }) => {
    try {
      const db = getDatabase();
      
      return new Promise((resolve, reject) => {
        db.get(
          'SELECT * FROM users WHERE username = ?',
          [username],
          async (err, user) => {
            if (err) {
              reject({ success: false, message: 'Database error' });
              return;
            }

            if (!user) {
              reject({ success: false, message: 'Invalid credentials' });
              return;
            }

            const isValidPassword = await bcrypt.compare(password, user.password);
            
            if (!isValidPassword) {
              reject({ success: false, message: 'Invalid credentials' });
              return;
            }

            // Generate JWT token
            const token = jwt.sign(
              { id: user.id, username: user.username, role: user.role },
              JWT_SECRET,
              { expiresIn: '24h' }
            );

            currentUser = {
              id: user.id,
              username: user.username,
              role: user.role,
              email: user.email,
              token
            };

            resolve({
              success: true,
              user: currentUser
            });
          }
        );
      });
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('auth:logout', async () => {
    currentUser = null;
    return { success: true };
  });

  ipcMain.handle('auth:getCurrentUser', async () => {
    return { success: true, user: currentUser };
  });
};
