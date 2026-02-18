const path = require('path');

// Minimal builder config to avoid ALL signing and ffmpeg issues
const config = {
  appId: 'com.example.dvault',
  productName: 'Dvault',
  files: [
    'dist/**/*',
    'package.json',
    'node_modules/**/*'
  ],
  directories: {
    buildResources: 'build',
    output: 'dist/release'
  },
  win: {
    target: ['portable'],
    icon: path.join(__dirname, 'build', 'icon.ico'),
    // Completely disable all signing
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
  portable: {
    artifactName: '${productName}-${version}.${ext}'
  },
  publish: null
};

module.exports = config;
