const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = 'wefit-gym-secret-key-change-in-production';
const JWT_EXPIRY = '24h';

class AuthService {
  constructor(db) {
    this.db = db;
  }

  // Login user
  login(username, password) {
    try {
      const user = this.db.prepare('SELECT * FROM users WHERE username = ? AND status = ?')
        .get(username, 'active');

      if (!user) {
        return { success: false, message: 'Invalid username or password' };
      }

      const isValidPassword = bcrypt.compareSync(password, user.password);
      
      if (!isValidPassword) {
        return { success: false, message: 'Invalid username or password' };
      }

      // Remove password from user object
      delete user.password;

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
      );

      return {
        success: true,
        token,
        user
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed' };
    }
  }

  // Verify token
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return { success: true, user: decoded };
    } catch (error) {
      return { success: false, message: 'Invalid or expired token' };
    }
  }

  // Change password
  changePassword(userId, oldPassword, newPassword) {
    try {
      const user = this.db.prepare('SELECT password FROM users WHERE id = ?').get(userId);
      
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      const isValidPassword = bcrypt.compareSync(oldPassword, user.password);
      
      if (!isValidPassword) {
        return { success: false, message: 'Current password is incorrect' };
      }

      const hashedPassword = bcrypt.hashSync(newPassword, 10);
      this.db.prepare('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(hashedPassword, userId);

      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, message: 'Failed to change password' };
    }
  }
}

module.exports = { AuthService, JWT_SECRET };
