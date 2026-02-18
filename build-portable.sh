#!/bin/bash
# Manual build script to create portable EXE without code signing

cd "c:\Users\MikeT\Documents\DVAULT"

# Download Electron prebuilt binary if not exists
ELECTRON_VER="25.9.8"
ELECTRON_ZIP="electron-v${ELECTRON_VER}-win32-x64.zip"
ELECTRON_URL="https://github.com/electron/electron/releases/download/v${ELECTRON_VER}/${ELECTRON_ZIP}"

# Create build output directory
mkdir -p dist/dvault-win-portable

echo "Creating portable Dvault executable..."

# If Electron binary exists, package it
if [ -d "node_modules/.bin" ]; then
  echo "Found node modules, creating executable..."
  # Using the Electron binary from electron npm package
  ELECTRON_PATH="node_modules/electron/dist"
  
  if [ -d "$ELECTRON_PATH" ]; then
    echo "Packaging with Electron from node_modules"
    cp -r "$ELECTRON_PATH"/* dist/dvault-win-portable/
    cp dist/main/main.js dist/dvault-win-portable/resources/app/
    cp -r dist/renderer/* dist/dvault-win-portable/resources/app/
    cp package.json dist/dvault-win-portable/resources/app/
    
    echo "EXE should be at: dist/dvault-win-portable/electron.exe"
  fi
fi
