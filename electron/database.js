const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { app } = require('electron');
const bcrypt = require('bcryptjs');

const dbPath = path.join(app.getPath('userData'), 'wefit.db');
let db;

function initDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Database opening error: ', err);
        reject(err);
        return;
      }
      
      console.log('Database connected successfully');
      createTables()
        .then(() => seedInitialData())
        .then(resolve)
        .catch(reject);
    });
  });
}

function createTables() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table (for authentication)
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL CHECK(role IN ('admin', 'trainer', 'member')),
          email TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Members table
      db.run(`
        CREATE TABLE IF NOT EXISTS members (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          name TEXT NOT NULL,
          email TEXT,
          phone TEXT,
          address TEXT,
          date_of_birth DATE,
          gender TEXT,
          emergency_contact TEXT,
          photo TEXT,
          membership_status TEXT DEFAULT 'active' CHECK(membership_status IN ('active', 'inactive', 'expired')),
          plan_id INTEGER,
          trainer_id INTEGER,
          join_date DATE DEFAULT CURRENT_DATE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (plan_id) REFERENCES membership_plans(id),
          FOREIGN KEY (trainer_id) REFERENCES trainers(id)
        )
      `);

      // Trainers table
      db.run(`
        CREATE TABLE IF NOT EXISTS trainers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          name TEXT NOT NULL,
          email TEXT,
          phone TEXT,
          specialization TEXT,
          experience_years INTEGER,
          photo TEXT,
          status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
          join_date DATE DEFAULT CURRENT_DATE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

      // Membership Plans table
      db.run(`
        CREATE TABLE IF NOT EXISTS membership_plans (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          duration_months INTEGER NOT NULL,
          price REAL NOT NULL,
          description TEXT,
          features TEXT,
          status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Payments table
      db.run(`
        CREATE TABLE IF NOT EXISTS payments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          member_id INTEGER NOT NULL,
          plan_id INTEGER NOT NULL,
          amount REAL NOT NULL,
          payment_date DATE DEFAULT CURRENT_DATE,
          payment_method TEXT,
          status TEXT DEFAULT 'paid' CHECK(status IN ('paid', 'pending', 'failed')),
          start_date DATE,
          end_date DATE,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (member_id) REFERENCES members(id),
          FOREIGN KEY (plan_id) REFERENCES membership_plans(id)
        )
      `);

      // Attendance table
      db.run(`
        CREATE TABLE IF NOT EXISTS attendance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          member_id INTEGER NOT NULL,
          check_in_time DATETIME DEFAULT CURRENT_TIMESTAMP,
          check_out_time DATETIME,
          date DATE DEFAULT CURRENT_DATE,
          notes TEXT,
          FOREIGN KEY (member_id) REFERENCES members(id)
        )
      `);

      // Workout Plans table
      db.run(`
        CREATE TABLE IF NOT EXISTS workout_plans (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          member_id INTEGER NOT NULL,
          trainer_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          exercises TEXT,
          frequency TEXT,
          start_date DATE DEFAULT CURRENT_DATE,
          end_date DATE,
          status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'paused')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (member_id) REFERENCES members(id),
          FOREIGN KEY (trainer_id) REFERENCES trainers(id)
        )
      `);

      // Diet Plans table
      db.run(`
        CREATE TABLE IF NOT EXISTS diet_plans (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          member_id INTEGER NOT NULL,
          trainer_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          meal_plan TEXT,
          calories INTEGER,
          start_date DATE DEFAULT CURRENT_DATE,
          end_date DATE,
          status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'paused')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (member_id) REFERENCES members(id),
          FOREIGN KEY (trainer_id) REFERENCES trainers(id)
        )
      `);

      // Progress table
      db.run(`
        CREATE TABLE IF NOT EXISTS progress (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          member_id INTEGER NOT NULL,
          weight REAL,
          body_fat_percentage REAL,
          measurements TEXT,
          notes TEXT,
          photos TEXT,
          date DATE DEFAULT CURRENT_DATE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (member_id) REFERENCES members(id)
        )
      `);

      // Announcements table
      db.run(`
        CREATE TABLE IF NOT EXISTS announcements (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          type TEXT DEFAULT 'general' CHECK(type IN ('general', 'offer', 'event', 'maintenance')),
          target_audience TEXT DEFAULT 'all' CHECK(target_audience IN ('all', 'members', 'trainers')),
          created_by INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (created_by) REFERENCES users(id)
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('All tables created successfully');
          resolve();
        }
      });
    });
  });
}

async function seedInitialData() {
  return new Promise(async (resolve, reject) => {
    try {
      // Check if admin exists
      db.get('SELECT * FROM users WHERE role = "admin"', async (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        if (!row) {
          console.log('Seeding initial data...');
          
          // Create default admin
          const adminPassword = await bcrypt.hash('admin123', 10);
          db.run(
            'INSERT INTO users (username, password, role, email) VALUES (?, ?, ?, ?)',
            ['admin', adminPassword, 'admin', 'admin@wefit.com']
          );

          // Create sample membership plans
          const plans = [
            { name: 'Monthly Basic', duration_months: 1, price: 999, description: 'Basic gym access', features: 'Gym access, Locker facility' },
            { name: 'Quarterly Premium', duration_months: 3, price: 2499, description: 'Premium membership', features: 'Gym access, Trainer support, Diet plan, Progress tracking' },
            { name: 'Yearly Elite', duration_months: 12, price: 8999, description: 'Elite membership', features: 'All premium features, Personal trainer, Nutrition counseling, Free merchandise' }
          ];

          plans.forEach(plan => {
            db.run(
              'INSERT INTO membership_plans (name, duration_months, price, description, features) VALUES (?, ?, ?, ?, ?)',
              [plan.name, plan.duration_months, plan.price, plan.description, plan.features]
            );
          });

          // Create sample trainer
          const trainerPassword = await bcrypt.hash('trainer123', 10);
          db.run(
            'INSERT INTO users (username, password, role, email) VALUES (?, ?, ?, ?)',
            ['trainer1', trainerPassword, 'trainer', 'trainer@wefit.com'],
            function(err) {
              if (err) {
                console.error('Error creating trainer user:', err);
                return;
              }
              
              db.run(
                'INSERT INTO trainers (user_id, name, email, phone, specialization, experience_years) VALUES (?, ?, ?, ?, ?, ?)',
                [this.lastID, 'John Doe', 'trainer@wefit.com', '1234567890', 'Strength Training', 5]
              );
            }
          );

          // Create sample member
          const memberPassword = await bcrypt.hash('member123', 10);
          db.run(
            'INSERT INTO users (username, password, role, email) VALUES (?, ?, ?, ?)',
            ['member1', memberPassword, 'member', 'member@wefit.com'],
            function(err) {
              if (err) {
                console.error('Error creating member user:', err);
                return;
              }

              db.run(
                'INSERT INTO members (user_id, name, email, phone, gender, plan_id, trainer_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [this.lastID, 'Jane Smith', 'member@wefit.com', '9876543210', 'Female', 1, 1]
              );
            }
          );

          console.log('Initial data seeded successfully');
        }
        
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}

function getDatabase() {
  return db;
}

module.exports = {
  initDatabase,
  getDatabase
};
