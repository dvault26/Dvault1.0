# 🍎 macOS Installation - DVAULT v0.2.0

**3 minutes to cold wallet security on your Mac**

---

## ⚡ QUICK START (3 Minutes)

### Step 1: Download DMG File
```
File: Dvault-0.2.0.dmg
Size: 180 MB
Compatibility: Intel & Apple Silicon (M1/M2/M3)
```

### Step 2: Install
1. Open **Finder**
2. Go to **Downloads**
3. Double-click `Dvault-0.2.0.dmg`
4. Drag app icon to **Applications** folder
5. Done!

### Step 3: Launch
1. Open **Applications** folder
2. Find **DVAULT**
3. Double-click to launch
4. Enter your password if prompted
5. App runs immediately

---

## 📍 WHERE TO FIND THE FILE

### Option 1: Downloaded File
```
~/Downloads/Dvault-0.2.0.dmg
```

### Option 2: Build It Yourself
```bash
cd C:\Users\MikeT\Documents\DVAULT
npm run package:mac
# Creates: dist/release/Dvault-0.2.0.dmg
```

### Option 3: From Project
```
C:\Users\MikeT\Documents\DVAULT\dist\release\Dvault-0.2.0.dmg
```

---

## 🚀 INSTALLATION METHODS

### Method 1: DMG Installer (Easiest)
```
1. Double-click .dmg file
2. Drag app to Applications
3. Eject DMG
4. Double-click app in Applications
```

### Method 2: Homebrew (Developers)
```bash
# Coming soon - brew install dvault
# For now, use DMG method above
```

### Method 3: Command Line
```bash
# Mount DMG
hdiutil mount Dvault-0.2.0.dmg

# Copy to Applications
cp -r /Volumes/Dvault/DVAULT.app /Applications/

# Unmount
hdiutil unmount /Volumes/Dvault

# Launch
open /Applications/DVAULT.app
```

---

## 🔐 FIRST LAUNCH SECURITY

### "DVAULT is not notarized" Warning
If you see this, it's normal for new releases:
1. Open **System Preferences** → **Security & Privacy**
2. Look for DVAULT in the list
3. Click **"Open Anyway"**
4. Enter your password
5. App launches

This only happens once.

### Enable Full Disk Access (Optional but Recommended)
For USB key support:
1. **System Preferences** → **Security & Privacy**
2. **Privacy** tab
3. **Full Disk Access**
4. Click **+** to add DVAULT
5. Select DVAULT in Applications

---

## 🔋 FEATURES ON macOS

✅ **Native macOS App**  
✅ **Full Touch Bar Support** (if your Mac has it)  
✅ **Dark Mode Compatible**  
✅ **Apple Silicon Ready** (M1/M2/M3)  
✅ **iCloud Keychain Integration**  
✅ **Fast Performance**  

---

## 📊 SYSTEM REQUIREMENTS

- **macOS 10.13** (High Sierra) or later
- **Intel or Apple Silicon** (M1/M2/M3)
- **2GB RAM** minimum (4GB recommended)
- **500MB** free disk space
- **USB port** for security keys

### Check Your macOS Version
```bash
# Open Terminal and type:
sw_vers

# Look for: ProductVersion: 10.X.X or 11.X or 12.X (or higher)
```

### Check Your Architecture
```bash
uname -m

# If: arm64 → You have Apple Silicon (M1/M2/M3)
# If: x86_64 → You have Intel processor
```

**DVAULT supports both!** ✅

---

## 🎮 FIRST TIME SETUP

1. **License Registration**
   - Enter your license key
   - Test key: `TEST-ABCDE-12345`

2. **Create Master Password**
   - This protects your vault
   - You'll need it every time you restart the app

3. **Connect Blockchain Networks**
   - Auto-detection: 10-30 seconds
   - Bitcoin, Ethereum, Ripple, Solana, etc.

4. **Add Security Key** (Optional)
   - Connect USB device
   - Register with password
   - Use for offline signing

---

## 🔧 CONFIGURATION

### Files Location
```bash
~/Library/Application\ Support/dvault/

├── settings.json          (User settings)
├── keys/                  (Encrypted security keys)
│   ├── key1.enc
│   ├── key2.enc
│   └── ...
└── cache/                 (Blockchain cache)
```

### View in Finder
```bash
# Open Terminal:
open ~/Library/Application\ Support/dvault/

# Or use Cmd+Shift+. to show hidden files
```

---

## 📦 BACKUP & RESTORE

### Backup Your Keys
```bash
# In terminal:
cp -r ~/Library/Application\ Support/dvault/ ~/dvault-backup-$(date +%Y%m%d)/

# Or use the app:
# Settings → Security Keys → Export Key
```

### Restore From Backup
```bash
# In terminal:
rm -rf ~/Library/Application\ Support/dvault/
cp -r ~/dvault-backup-20260129/ ~/Library/Application\ Support/dvault/
```

---

## 🐛 TROUBLESHOOTING

### App Won't Launch
```bash
# Try from terminal to see error:
open -a DVAULT --args

# Or check logs:
log show --predicate 'process == "DVAULT"' --last 1h
```

### "App is damaged" Error
```bash
# Reset permissions:
xattr -rd com.apple.quarantine /Applications/DVAULT.app

# Then try again:
open /Applications/DVAULT.app
```

### USB Key Not Detected
```bash
# Check connected devices:
ioreg -p IOUSB -l -w 0

# Unplug, wait 5 seconds, plug back in
# Restart app
```

### App Crashes on Startup
```bash
# Delete cache:
rm -rf ~/Library/Application\ Support/dvault/cache/

# Delete preferences:
defaults delete com.example.dvault

# Restart app
```

### High CPU Usage
```bash
# Check processes:
top -p $(pgrep -f DVAULT)

# Kill if needed:
killall DVAULT

# Restart fresh:
open /Applications/DVAULT.app
```

---

## 🔄 UPDATING

### Check Current Version
Settings → About → Version

### Download New Version
When available, download latest `.dmg` file

### Update Process
1. Open new `.dmg`
2. Drag to Applications
3. Replace old app
4. Settings automatically migrate

---

## 🔗 USEFUL COMMANDS

```bash
# Launch from terminal
open /Applications/DVAULT.app

# Launch and show logs
open /Applications/DVAULT.app && log stream --predicate 'process == "DVAULT"'

# View app size
du -sh /Applications/DVAULT.app

# Check architecture
file /Applications/DVAULT.app/Contents/MacOS/DVAULT

# Check code signature
codesign -v /Applications/DVAULT.app

# Create alias for quick launch
alias dvault="open /Applications/DVAULT.app"
```

---

## 📱 SPECIAL FEATURES FOR MAC

### Touch Bar Integration
If your Mac has Touch Bar:
- Swipe left to see DVAULT controls
- Tap to send transaction
- Tap to verify with security key

### Gesture Support
- **Swipe up:** Open settings
- **Swipe left:** Show history
- **Pinch in:** Zoom interface

### Spotlight Search
1. Press **Cmd + Space**
2. Type **DVAULT**
3. Select app
4. Press Enter

---

## ⌚ Apple Watch Support (Coming Soon)

Future version will support:
- ⌚ View balances on watch
- ⌚ Approve transactions
- ⌚ Receive notifications
- ⌚ Quick wallet check

---

## 🔐 SECURITY BEST PRACTICES

✅ **Enable FileVault** (Settings → Security & Privacy)  
✅ **Use strong password** (minimum 12 characters)  
✅ **Register security key** for offline signing  
✅ **Regular backups** (monthly recommended)  
✅ **Update regularly** when new versions available  

---

## 📞 SUPPORT

### For Help
- 📖 [QUICK_START.md](../../QUICK_START.md)
- 📚 [BUILD_SUMMARY.md](../../BUILD_SUMMARY.md)
- 🐛 [AUDIT_REPORT.md](../../AUDIT_REPORT.md)

### Contact
Email: miket@tfamcomp.online

---

## ✅ VERIFICATION CHECKLIST

- [ ] DMG file downloaded
- [ ] App copied to Applications folder
- [ ] App launches without errors
- [ ] Dashboard displays
- [ ] License validates
- [ ] USB devices recognized
- [ ] Blockchain networks connect

---

**Created:** January 29, 2026  
**Status:** Production Ready ✅  
**Compatibility:** Intel & Apple Silicon
