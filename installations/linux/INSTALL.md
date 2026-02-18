# 🐧 Linux Installation - DVAULT v0.2.0

**Enterprise-grade cold wallet for Linux systems**

---

## ⚡ QUICK START (5 Minutes)

### Three Installation Options:

#### Option 1: AppImage (Easiest)
```bash
cd ~/Downloads
chmod +x Dvault-0.2.0.AppImage
./Dvault-0.2.0.AppImage
```

#### Option 2: Docker (Recommended for Server)
```bash
docker pull dvault:latest
docker run -d \
  -v dvault-data:/root/.config/dvault \
  --device /dev/bus/usb \
  dvault:latest
```

#### Option 3: Source Build
```bash
git clone <repo>
cd DVAULT
npm install
npm run build
npm run dev
```

---

## 📍 WHERE TO FIND FILES

### AppImage File
```
~/Downloads/Dvault-0.2.0.AppImage
or
/path/to/downloads/Dvault-0.2.0.AppImage
```

### From Project Directory
```bash
cd C:\Users\MikeT\Documents\DVAULT
ls dist/release/Dvault-0.2.0.AppImage
```

### Download via Terminal
```bash
wget https://dvault.example.com/Dvault-0.2.0.AppImage
# or
curl -O https://dvault.example.com/Dvault-0.2.0.AppImage
```

---

## 🚀 INSTALLATION METHODS

### Method 1: AppImage (Universal - All Distros)
```bash
# Download
wget Dvault-0.2.0.AppImage
# or
curl -L -o Dvault-0.2.0.AppImage https://...

# Make executable
chmod +x Dvault-0.2.0.AppImage

# Run it
./Dvault-0.2.0.AppImage

# Or integrate into system
sudo mv Dvault-0.2.0.AppImage /usr/local/bin/dvault
```

### Method 2: Docker (Best for Server/Enterprise)
```bash
# Build image
docker build -t dvault:latest .

# Run container
docker run -it \
  -v dvault-data:/root/.config/dvault \
  -v dvault-keys:/root/.dvault/keys \
  --device /dev/bus/usb \
  dvault:latest

# Or use docker-compose
docker-compose up dvault-prod
```

### Method 3: Development Build
```bash
# Clone project
git clone <repository>
cd DVAULT

# Install dependencies
npm install

# Build
npm run build

# Run
npm run dev

# Or create appimage
npm run build:linux
```

---

## 📊 SYSTEM REQUIREMENTS

**Tested Distributions:**
- ✅ Ubuntu 18.04 LTS and newer
- ✅ Debian 10 (Buster) and newer
- ✅ Fedora 30 and newer
- ✅ CentOS 7 and newer
- ✅ Arch Linux
- ✅ Linux Mint
- ✅ Elementary OS

**Hardware Requirements:**
- Processor: x64 (ARM64 coming soon)
- RAM: 2GB minimum (4GB recommended)
- Storage: 500MB free space
- USB port for security keys

**Check Your System:**
```bash
# Linux version
cat /etc/os-release

# Architecture
uname -m        # Should show x86_64

# RAM
free -h

# Disk space
df -h /
```

---

## 🔧 INSTALLATION BY DISTRO

### Ubuntu/Debian
```bash
# Update repos
sudo apt update

# Install dependencies (if not already installed)
sudo apt install -y libgconf-2-4 libnotify4 libxss1 libxtst6

# Download AppImage
wget Dvault-0.2.0.AppImage

# Make executable and run
chmod +x Dvault-0.2.0.AppImage
./Dvault-0.2.0.AppImage
```

### Fedora/CentOS/RHEL
```bash
# Install dependencies
sudo dnf install -y libnotify libXScrnSaver

# Download AppImage
curl -O Dvault-0.2.0.AppImage

# Make executable and run
chmod +x Dvault-0.2.0.AppImage
./Dvault-0.2.0.AppImage
```

### Arch Linux
```bash
# Install dependencies
sudo pacman -S libnotify libxss

# Download AppImage
wget Dvault-0.2.0.AppImage

# Make executable and run
chmod +x Dvault-0.2.0.AppImage
./Dvault-0.2.0.AppImage
```

---

## 🐳 DOCKER INSTALLATION

### Docker Setup
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add to user group (optional, to avoid sudo)
sudo usermod -aG docker $USER
newgrp docker
```

### Run DVAULT in Docker
```bash
# Simple run
docker run -d \
  -v dvault-data:/root/.config/dvault \
  --device /dev/bus/usb \
  dvault:0.2.0

# With port mapping (for web UI, if applicable)
docker run -d \
  -p 5173:5173 \
  -v dvault-data:/root/.config/dvault \
  -v dvault-keys:/dvault-keys \
  --device /dev/bus/usb \
  dvault:0.2.0

# Development mode with hot reload
docker-compose up dvault-dev
```

### Verify Docker Container
```bash
# See running containers
docker ps

# Check logs
docker logs -f <container_id>

# Stop container
docker stop <container_id>

# Remove container
docker rm <container_id>
```

---

## 🎯 CREATE DESKTOP SHORTCUT

### For AppImage
```bash
# Create .desktop file
cat > ~/.local/share/applications/dvault.desktop << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=DVAULT
Exec=/path/to/Dvault-0.2.0.AppImage
Icon=dvault
Categories=Finance;Utility;
EOF

# Or using GUI
# Right-click .AppImage → Make Link → Create Desktop Entry
```

### Quick Launch Alias
```bash
# Add to ~/.bashrc or ~/.zshrc
alias dvault="~/Downloads/Dvault-0.2.0.AppImage"

# Then use:
dvault
```

---

## 🔐 SECURITY & PERMISSIONS

### USB Device Access
```bash
# Add user to USB group
sudo usermod -a -G usb $USER

# Then logout and login, or:
su - $USER

# Verify
groups $USER  # Should show 'usb' in list
```

### File Permissions
```bash
# Ensure proper permissions on config directory
mkdir -p ~/.config/dvault
chmod 700 ~/.config/dvault

# For Docker volumes
mkdir -p ~/dvault-keys
chmod 700 ~/dvault-keys
```

### Secure USB Key Access
```bash
# Grant permission to USB devices
sudo udevadm control --reload-rules
sudo udevadm trigger

# Verify detection
lsusb  # Should show your USB device
```

---

## 🔄 COMMAND REFERENCE

```bash
# Run AppImage
./Dvault-0.2.0.AppImage

# Run with debug output
./Dvault-0.2.0.AppImage --verbose

# Check version
./Dvault-0.2.0.AppImage --version

# Extract AppImage (advanced)
./Dvault-0.2.0.AppImage --appimage-extract

# List available options
./Dvault-0.2.0.AppImage --help
```

---

## 🗂️ FILE LOCATIONS

### Configuration
```
~/.config/dvault/
├── settings.json          (User settings)
├── keys/                  (Encrypted keys)
│   ├── key1.enc
│   ├── key2.enc
│   └── ...
└── cache/                 (Blockchain data)
```

### Application
```
/usr/local/bin/dvault     (After installation)
or
~/Downloads/Dvault-0.2.0.AppImage
```

### Docker
```
dvault-data volume
dvault-keys volume
```

---

## 🐛 TROUBLESHOOTING

### AppImage Won't Run
```bash
# Check permissions
ls -l Dvault-0.2.0.AppImage

# Make executable
chmod +x Dvault-0.2.0.AppImage

# Run with verbose output
./Dvault-0.2.0.AppImage --verbose

# Try extraction
./Dvault-0.2.0.AppImage --appimage-extract
./squashfs-root/AppRun
```

### "No such file or directory"
```bash
# Verify file exists
file Dvault-0.2.0.AppImage

# Check dependencies
ldd ./Dvault-0.2.0.AppImage

# Install missing libraries
sudo apt install libgconf-2-4 libnotify4 libxss1
```

### USB Device Not Recognized
```bash
# List USB devices
lsusb

# Check permissions
groups $USER

# Add to usb group if needed
sudo usermod -a -G usb $USER
# Then logout/login

# Check udev rules
ls -la /etc/udev/rules.d/

# Reload udev
sudo udevadm control --reload-rules
sudo udevadm trigger
```

### Docker Container Won't Start
```bash
# Check logs
docker logs <container_id>

# Verify image
docker images

# Rebuild image
docker build --no-cache -t dvault:latest .

# Check Docker daemon
sudo systemctl status docker
```

### Permission Denied Errors
```bash
# Check file ownership
ls -la ~/.config/dvault/

# Fix permissions
chmod 700 ~/.config/dvault
chown $USER:$USER ~/.config/dvault -R

# For Docker
sudo chown $USER:$USER dvault-* -R
```

---

## 📊 PERFORMANCE TUNING

### Increase Memory Allocation
```bash
# Set environment variable
export NODE_OPTIONS="--max-old-space-size=2048"

# Then run app
./Dvault-0.2.0.AppImage
```

### Enable Swap for Low-Memory Systems
```bash
# Check current swap
free -h

# Create swap file if needed
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

## 🔄 UPDATING

### Update AppImage
```bash
# Download new version
wget Dvault-0.2.1.AppImage

# Backup old version
mv Dvault-0.2.0.AppImage Dvault-0.2.0.AppImage.bak

# Use new version
chmod +x Dvault-0.2.1.AppImage
./Dvault-0.2.1.AppImage
```

### Docker Image Update
```bash
# Pull new image
docker pull dvault:latest

# Rebuild
docker-compose build --no-cache

# Start
docker-compose up -d dvault-prod
```

---

## 🧪 TESTING INSTALLATION

```bash
# Test 1: File integrity
sha256sum Dvault-0.2.0.AppImage

# Test 2: Executable bit
test -x Dvault-0.2.0.AppImage && echo "Executable" || echo "Not executable"

# Test 3: Run app
timeout 10 ./Dvault-0.2.0.AppImage

# Test 4: Check logs
journalctl -f

# Test 5: USB detection
lsusb -t
```

---

## 📞 SUPPORT

### Linux Documentation
- [QUICK_START.md](../../QUICK_START.md)
- [BUILD_SUMMARY.md](../../BUILD_SUMMARY.md)
- [AUDIT_REPORT.md](../../AUDIT_REPORT.md)

### Useful Commands
```bash
# Get system info
uname -a
lsb_release -a

# Get distro info
cat /etc/os-release

# Create debug report
echo "System:" && uname -a && echo "Distro:" && cat /etc/os-release > dvault-debug.txt
```

---

**Created:** January 29, 2026  
**Status:** Production Ready ✅  
**Supported:** All major Linux distributions
