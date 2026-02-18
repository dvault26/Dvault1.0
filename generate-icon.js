const path = require('path');
const fs = require('fs');

async function generateIcon() {
  try {
    const inputPath = path.join(__dirname, 'build', 'icon.png');
    const outputPath = path.join(__dirname, 'build', 'icon.ico');
    
    // Check if input exists
    if (!fs.existsSync(inputPath)) {
      console.error('✗ Input file not found:', inputPath);
      process.exit(1);
    }
    
    // If icon.ico already exists, we're good to go
    if (fs.existsSync(outputPath)) {
      console.log('✓ Icon.ico already exists - using Dvault branding for installer');
      process.exit(0);
    }
    
    // Icon.ico should be provided in build/ directory (256x256 recommended)
    // This avoids Sharp/ffmpeg dependencies which can cause native build issues
    console.warn('⚠ Note: icon.ico was not found in build/ directory');
    console.warn('⚠ Dvault will use icon.png for window display and installer');
    console.log('ℹ To use custom installer icon, provide build/icon.ico (256x256 .ico file)');
    console.log('✓ Icon setup complete');
    
    process.exit(0);
  } catch (e) {
    console.error('✗ Error:', e.message);
    process.exit(1);
  }
}

generateIcon();
