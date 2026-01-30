const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcrypt');
const { app } = require('electron');

class DatabaseManager {
  constructor() {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'wefit.db');
    console.log('Database path:', dbPath);
    this.db = new Database(dbPath);
    this.initializeDatabase();
  }

  initializeDatabase() {
    // Enable foreign keys
    this.db.pragma('foreign_keys = ON');

    // Users table (Admin, Trainers, Members)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        phone TEXT,
        role TEXT NOT NULL CHECK(role IN ('admin', 'trainer', 'member')),
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Membership Plans table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS membership_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        duration_months INTEGER NOT NULL,
        price REAL NOT NULL,
        features TEXT,
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Member Memberships table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS member_memberships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        member_id INTEGER NOT NULL,
        plan_id INTEGER NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'expired', 'cancelled')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (member_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (plan_id) REFERENCES membership_plans(id)
      )
    `);

    // Payments table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        member_id INTEGER NOT NULL,
        membership_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        payment_date DATE NOT NULL,
        payment_method TEXT,
        status TEXT DEFAULT 'paid' CHECK(status IN ('paid', 'pending', 'failed')),
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (member_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (membership_id) REFERENCES member_memberships(id)
      )
    `);

    // Attendance table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        member_id INTEGER NOT NULL,
        check_in_time DATETIME NOT NULL,
        check_out_time DATETIME,
        method TEXT DEFAULT 'manual' CHECK(method IN ('manual', 'qr')),
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (member_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Trainer assignments table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS trainer_assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trainer_id INTEGER NOT NULL,
        member_id INTEGER NOT NULL,
        assigned_date DATE NOT NULL,
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (member_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Workout Plans table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS workout_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        member_id INTEGER NOT NULL,
        trainer_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        plan_data TEXT NOT NULL,
        start_date DATE,
        end_date DATE,
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'cancelled')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (member_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (trainer_id) REFERENCES users(id)
      )
    `);

    // Diet Plans table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS diet_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        member_id INTEGER NOT NULL,
        trainer_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        plan_data TEXT NOT NULL,
        start_date DATE,
        end_date DATE,
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'cancelled')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (member_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (trainer_id) REFERENCES users(id)
      )
    `);

    // Progress Tracking table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS progress_tracking (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        member_id INTEGER NOT NULL,
        recorded_by INTEGER NOT NULL,
        date DATE NOT NULL,
        weight REAL,
        body_fat_percentage REAL,
        measurements TEXT,
        photos TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (member_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (recorded_by) REFERENCES users(id)
      )
    `);

    // Announcements table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        target_role TEXT CHECK(target_role IN ('all', 'member', 'trainer')),
        created_by INTEGER NOT NULL,
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'archived')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);

    console.log('Database initialized successfully');
  }

  // Insert default data
  insertDefaultData() {
    const hasUsers = this.db.prepare('SELECT COUNT(*) as count FROM users').get();
    
    if (hasUsers.count === 0) {
      console.log('Inserting default data...');
      
      // Hash default passwords
      const adminPassword = bcrypt.hashSync('admin123', 10);
      const trainerPassword = bcrypt.hashSync('trainer123', 10);
      const memberPassword = bcrypt.hashSync('member123', 10);

      // Insert default users
      const insertUser = this.db.prepare(`
        INSERT INTO users (username, password, email, full_name, phone, role, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      insertUser.run('admin', adminPassword, 'admin@wefit.com', 'Admin User', '1234567890', 'admin', 'active');
      insertUser.run('trainer1', trainerPassword, 'trainer1@wefit.com', 'John Trainer', '1234567891', 'trainer', 'active');
      insertUser.run('member1', memberPassword, 'member1@wefit.com', 'Jane Member', '1234567892', 'member', 'active');

      // Insert default membership plans
      const insertPlan = this.db.prepare(`
        INSERT INTO membership_plans (name, description, duration_months, price, features, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      insertPlan.run('Monthly Basic', 'Basic gym access', 1, 50, JSON.stringify(['Gym Access', 'Locker']), 'active');
      insertPlan.run('Quarterly Premium', 'Premium gym access with trainer', 3, 140, JSON.stringify(['Gym Access', 'Personal Trainer', 'Diet Plan', 'Locker']), 'active');
      insertPlan.run('Yearly Elite', 'Elite membership with all benefits', 12, 500, JSON.stringify(['Gym Access', 'Personal Trainer', 'Diet Plan', 'Spa Access', 'Locker', 'Guest Pass']), 'active');

      console.log('Default data inserted successfully');
    }
  }

  getDatabase() {
    return this.db;
  }

  close() {
    this.db.close();
  }
}

module.exports = DatabaseManager;
