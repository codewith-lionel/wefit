# 💪 WeFit - Gym Management System

A comprehensive desktop Gym Management Application built with Electron.js for Windows. This application helps gym owners manage members, trainers, payments, attendance, and more with an intuitive dark-themed interface.

## 🌟 Features

### 👑 Admin Features
- **Dashboard**: Real-time statistics with charts showing member status, revenue trends, and key metrics
- **Member Management**: Add, edit, delete members with complete profile management
- **Trainer Management**: Manage gym trainers and their specializations
- **Membership Plans**: Create and manage flexible membership plans (monthly, quarterly, yearly)
- **Payment Tracking**: Track all payments with status monitoring (paid/pending/failed)
- **Attendance System**: Manual check-in and QR code-based attendance tracking
- **Announcements**: Send announcements, offers, and event notifications
- **Reports**: Export members and payment reports to PDF and Excel

### 🏋️ Trainer Features
- Dashboard with assigned members overview
- Create and manage workout plans
- Create and manage diet plans
- Track member progress

### 🧑 Member Features
- View membership details and expiry
- Check attendance history
- View workout and diet plans
- Track personal progress
- Receive announcements and notifications

## 🛠️ Tech Stack

- **Frontend**: React.js 18
- **Desktop Framework**: Electron.js 27
- **Database**: SQLite3
- **Bundler**: Webpack 5
- **Charts**: Chart.js with react-chartjs-2
- **Authentication**: JWT with bcrypt
- **QR Code**: qrcode & qrcode.react
- **Reports**: jsPDF & xlsx
- **UI/UX**: Custom CSS with dark theme

## 📋 Prerequisites

- Node.js 16.x or higher
- npm or yarn package manager
- Windows OS (for building .exe)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/codewith-lionel/wefit.git
cd wefit
```

### 2. Install Dependencies
```bash
npm install
```

This will install all required packages including:
- Electron and Electron Builder
- React and React Router
- SQLite3 for database
- All UI and utility libraries

### 3. Development Mode

Run the application in development mode:

```bash
npm start
```

This will:
- Start the Webpack dev server on port 3000
- Launch the Electron application
- Enable hot-reloading for React components
- Open DevTools automatically

### 4. Build for Production

Build the React application:
```bash
npm run build
```

### 5. Create Windows Executable

Build a Windows installer (.exe):
```bash
npm run build:win
```

The installer will be created in the `dist` folder.

## 📁 Project Structure

```
wefit/
├── electron/                  # Electron main process
│   ├── main.js               # Main process entry point
│   ├── preload.js            # Secure IPC bridge
│   ├── database.js           # SQLite database setup
│   ├── is-dev.js             # Development mode checker
│   └── ipc/                  # IPC handlers
│       ├── authHandlers.js
│       ├── memberHandlers.js
│       ├── trainerHandlers.js
│       ├── planHandlers.js
│       ├── paymentHandlers.js
│       ├── attendanceHandlers.js
│       └── reportHandlers.js
├── src/                      # React application
│   ├── components/           # Reusable components
│   │   └── Layout.js
│   ├── contexts/             # React contexts
│   │   └── AuthContext.js
│   ├── pages/                # Page components
│   │   ├── Login.js
│   │   ├── admin/            # Admin pages
│   │   ├── trainer/          # Trainer pages
│   │   └── member/           # Member pages
│   ├── styles/               # Global styles
│   │   └── global.css
│   ├── App.js                # Main App component
│   └── index.js              # React entry point
├── public/                   # Static files
│   └── index.html
├── package.json              # Dependencies and scripts
├── webpack.config.js         # Webpack configuration
└── README.md                 # This file
```

## 🔐 Default Credentials

The application comes with pre-seeded demo accounts:

| Role    | Username  | Password    |
|---------|-----------|-------------|
| Admin   | admin     | admin123    |
| Trainer | trainer1  | trainer123  |
| Member  | member1   | member123   |

## 💾 Database

- **Type**: SQLite3
- **Location**: User data directory (created automatically)
- **Schema**: Includes tables for users, members, trainers, plans, payments, attendance, workout plans, diet plans, progress, and announcements

### Database Tables
1. **users** - Authentication and user roles
2. **members** - Member profiles and details
3. **trainers** - Trainer information
4. **membership_plans** - Subscription plans
5. **payments** - Payment records
6. **attendance** - Check-in/check-out records
7. **workout_plans** - Exercise routines
8. **diet_plans** - Nutrition plans
9. **progress** - Member progress tracking
10. **announcements** - Gym notifications

## 🎨 UI Features

- **Dark Theme**: Modern gym-style dark interface
- **Responsive Design**: Adapts to different screen sizes
- **Interactive Charts**: Visual representation of data
- **Modal Forms**: Clean popup forms for data entry
- **Toast Notifications**: Real-time feedback for user actions
- **Loading States**: Smooth loading indicators
- **Badge System**: Status indicators with color coding

## 📦 Build Configuration

The application uses Electron Builder with the following configuration:
- **App ID**: com.wefit.gym
- **Product Name**: WeFit Gym Management
- **Target**: Windows NSIS installer
- **Output**: dist/ directory

## 🔒 Security Features

- Context isolation enabled
- Node integration disabled
- Secure IPC communication via preload script
- Content Security Policy in place
- JWT-based authentication
- Password hashing with bcryptjs
- No remote module access

## 📱 QR Code Attendance

The system supports QR code-based attendance:
1. Generate QR code for any member
2. Scan QR code to mark attendance
3. Automatic timestamp recording
4. View attendance history

## 📊 Reports & Export

Export data in multiple formats:
- **PDF Reports**: Members list and payment reports with jsPDF
- **Excel Export**: Members data export with xlsx
- Automatic download to system Downloads folder
- Timestamped file names

## 🚧 Future Enhancements

- Cloud sync capability (MongoDB + Node.js API)
- Auto-update mechanism
- Email notifications
- SMS integration
- Biometric attendance
- Mobile app companion
- Multi-gym support
- Advanced analytics

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Developer

Built with ❤️ for gym owners by the WeFit team.

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Note**: This is a desktop application designed for Windows. For other operating systems, modify the build configuration in package.json accordingly.