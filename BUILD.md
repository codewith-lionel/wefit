# Build Instructions

## Prerequisites
- Node.js 16+ installed
- npm package manager
- Windows OS (for .exe build)

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run in development**
   ```bash
   npm start
   ```

3. **Build for production**
   ```bash
   npm run build
   npm run build:win
   ```

## Detailed Steps

### Development Mode
```bash
# Start both React dev server and Electron
npm start
```
- React app runs on http://localhost:3000
- Electron window opens automatically
- Changes hot-reload in real-time
- DevTools open by default

### Production Build

#### Step 1: Build React App
```bash
npm run build
```
Creates optimized production build in `build/` folder.

#### Step 2: Build Windows Executable
```bash
npm run build:win
```
Creates Windows installer in `dist/` folder.

### Alternative Build Commands

```bash
# Pack without creating installer
npm run pack

# Build for all platforms (if configured)
npm run dist
```

## Troubleshooting

### SQLite3 Issues
If you encounter SQLite3 build errors:
```bash
npm rebuild sqlite3 --build-from-source
```

### Webpack Issues
Clear cache and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Electron Build Issues
```bash
npm run postinstall
```

## Testing the Build

1. Navigate to `dist/` folder
2. Find the installer executable
3. Run the installer
4. Application will be installed in Program Files
5. Launch from Start Menu or Desktop shortcut

## Build Output

- **Installer**: `dist/WeFit Gym Management Setup.exe`
- **Unpacked**: `dist/win-unpacked/` (portable version)

## Configuration

Edit `package.json` build section to customize:
- App name
- Icon
- Output directory
- Target platforms
- File associations

## Security Note

Before distributing:
1. Change JWT secret in `electron/ipc/authHandlers.js`
2. Update default passwords
3. Add code signing certificate
4. Enable auto-update server
