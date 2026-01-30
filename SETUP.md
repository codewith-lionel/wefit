# WeFit Gym Management - Setup Guide

## 📦 What You'll Need
- Windows 10 or higher
- 4GB RAM minimum (8GB recommended)
- 500MB free disk space
- Internet connection (for initial setup only)

## 🎯 Quick Setup (5 Minutes)

### For End Users

1. **Download the Installer**
   - Get `WeFit-Gym-Management-Setup.exe` from the releases
   - File size: ~150MB

2. **Run the Installer**
   - Double-click the downloaded file
   - Follow the installation wizard
   - Choose installation directory (default: Program Files)

3. **Launch the Application**
   - Find "WeFit Gym Management" in Start Menu
   - Or use desktop shortcut

4. **First Login**
   - Username: `admin`
   - Password: `admin123`
   - **Important**: Change password after first login!

### For Developers

1. **Clone Repository**
   ```bash
   git clone https://github.com/codewith-lionel/wefit.git
   cd wefit
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```
   This may take 3-5 minutes.

3. **Start Development Server**
   ```bash
   npm start
   ```
   - React app: http://localhost:3000
   - Electron launches automatically

4. **Build Production Version**
   ```bash
   npm run build
   npm run build:win
   ```

## 🔐 Default User Accounts

| Role    | Username  | Password    | Access Level |
|---------|-----------|-------------|--------------|
| Admin   | admin     | admin123    | Full Access  |
| Trainer | trainer1  | trainer123  | Limited      |
| Member  | member1   | member123   | View Only    |

## 📊 First Steps After Installation

### As Admin

1. **Change Default Password**
   - Click on profile in sidebar
   - Update password

2. **Add Membership Plans**
   - Navigate to "Plans" section
   - Create your gym's membership packages
   - Set prices and durations

3. **Add Trainers**
   - Go to "Trainers" section
   - Add your gym staff
   - Assign specializations

4. **Add Members**
   - Navigate to "Members" section
   - Enter member details
   - Assign plans and trainers

5. **Setup Payments**
   - Record existing memberships
   - Set up payment tracking

## 🖥️ System Requirements

### Minimum
- OS: Windows 10 (64-bit)
- RAM: 4GB
- Storage: 500MB free space
- Display: 1280x720 resolution

### Recommended
- OS: Windows 11 (64-bit)
- RAM: 8GB
- Storage: 1GB free space
- Display: 1920x1080 resolution

## 📁 Data Location

All data is stored locally:
```
C:\Users\[YourUsername]\AppData\Roaming\wefit-gym-management\
```

Contains:
- `wefit.db` - Main database file
- `logs/` - Application logs
- Configuration files

## 🔧 Configuration

### Backup Your Data

**Important**: Regular backups recommended!

1. Close the application
2. Copy the database file:
   ```
   AppData\Roaming\wefit-gym-management\wefit.db
   ```
3. Store in safe location

### Restore Data

1. Close the application
2. Replace database file with backup
3. Restart application

## 🚨 Troubleshooting

### Application Won't Start

1. Check Windows Defender/Antivirus
2. Run as Administrator
3. Reinstall the application

### Database Issues

1. Close application
2. Delete database file (backup first!)
3. Restart - new database will be created

### Performance Issues

1. Check disk space
2. Close other applications
3. Restart computer
4. Reinstall if problem persists

### Can't Login

1. Use default admin credentials
2. Check Caps Lock
3. Reset database if needed

## 📞 Support

### Get Help

- GitHub Issues: https://github.com/codewith-lionel/wefit/issues
- Documentation: README.md
- Build Guide: BUILD.md

### Report Bugs

Include:
- Windows version
- Application version
- Steps to reproduce
- Screenshots if applicable

## 🔄 Updates

Check for updates:
1. Visit GitHub releases page
2. Download latest version
3. Install over existing installation
4. Your data will be preserved

## 💡 Tips & Best Practices

1. **Regular Backups**
   - Backup database weekly
   - Keep multiple backup copies

2. **Security**
   - Change default passwords
   - Use strong passwords
   - Don't share admin credentials

3. **Data Entry**
   - Add complete member information
   - Keep contact details updated
   - Use notes fields for important info

4. **Attendance**
   - Mark attendance daily
   - Use QR codes for faster check-in
   - Review attendance reports weekly

5. **Payments**
   - Record all payments promptly
   - Send reminders for pending payments
   - Export reports monthly

## 🎓 Training Resources

### Admin Training (30 minutes)
1. Dashboard overview
2. Member management
3. Payment processing
4. Reports generation

### Trainer Training (15 minutes)
1. View assigned members
2. Create workout plans
3. Track progress

### Member Orientation (5 minutes)
1. Login and navigation
2. View membership details
3. Check workout plans

## 📱 Mobile App (Coming Soon)

Mobile companion app features:
- Check-in via QR code
- View workout plans
- Track progress
- Receive notifications

## 🌐 Online Features (Future)

- Cloud backup
- Multi-location support
- Email notifications
- Payment gateway integration
- Mobile app sync

---

**Need more help?** Open an issue on GitHub or check the documentation!
