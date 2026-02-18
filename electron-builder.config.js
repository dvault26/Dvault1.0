const path = require('path');

// Minimal builder config to avoid ALL signing and ffmpeg issues
const config = {
  appId: 'com.example.dvault',
  productName: 'Dvault',
  files: [
    'dist/main/**',
    'dist/renderer/**',
    'dist/preload/**',
    'package.json',
    'node_modules/**'
  ],
  directories: {
    buildResources: 'build',
    output: 'dist/release'
  },
  win: {
    target: ['nsis'],
    icon: path.join(__dirname, 'build', 'icon.ico'),
    sign: false,
    signAndEditExecutable: false,
    certificateFile: false,
    certificatePassword: false,
    certificateSubjectName: false,
    rfc3161TimeStampServer: false,
    signDlls: false,
    verifyUpdateCodeSignature: false,
    forceCodeSigning: false
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: 'Dvault'
  },
  publish: null
};

module.exports = config;
