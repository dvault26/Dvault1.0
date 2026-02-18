# 📱 Android Installation - DVAULT v0.2.0

**Cold wallet on your Android phone - 3 minutes to secure crypto**

---

## ⚡ QUICK START (3 Minutes)

### Option 1: Google Play Store (Recommended)
```
1. Open Google Play Store
2. Search: "DVAULT"
3. Tap "Install"
4. Wait 2-3 minutes
5. Tap "Open"
```

### Option 2: Direct APK Installation
```
1. Download: Dvault-0.2.0.apk (120 MB)
2. Open Settings → Security
3. Enable "Unknown Sources"
4. Open downloaded APK file
5. Tap "Install"
6. App ready to use
```

---

## 📍 WHERE TO FIND APK FILE

### Option 1: Google Play Store
Best option - automatic updates:
```
Play Store → Search "DVAULT" → Install
```

### Option 2: Download APK Directly
```
File: Dvault-0.2.0.apk
Size: 120 MB
Location: C:\Users\MikeT\Documents\DVAULT\dist\release\Dvault-0.2.0.apk
```

### Option 3: From Project (Advanced Users)
```bash
cd C:\Users\MikeT\Documents\DVAULT
npm run build:android
# Creates: dist/release/Dvault-0.2.0.apk
```

---

## 🚀 INSTALLATION METHODS

### Method 1: Google Play Store (Easiest)
1. Open **Play Store** app on Android
2. Search for **"DVAULT"**
3. Tap **Install** button
4. Wait for download (2-3 min)
5. Tap **Open**
6. Done! ✅

**Advantages:**
- ✅ Automatic updates
- ✅ One-tap install
- ✅ Reviews visible
- ✅ Secure download

### Method 2: Direct APK Install
1. Download APK file to your phone
   - Via email
   - Via browser
   - Via file transfer
2. Open **Settings** → **Apps & notifications**
3. Enable **Unknown sources** (if not already enabled)
4. Locate downloaded APK file
5. Tap to open it
6. Tap **Install** button
7. Wait for installation
8. Tap **Open** to launch

**Advantages:**
- ✅ Can install older versions
- ✅ Works without Play Store
- ✅ Fast installation
- ✅ Immediate launch

### Method 3: Android Studio (Developers)
```bash
# Connect phone via USB
adb devices

# Install APK
adb install Dvault-0.2.0.apk

# Launch app
adb shell am start -n com.dvault/.MainActivity

# View logs
adb logcat
```

---

## 🔐 ENABLE INSTALLATION FROM UNKNOWN SOURCES

**If you see "Unknown source" warning:**

1. Open **Settings** on your Android phone
2. Go to **Apps & notifications** or **Applications**
3. Find **Unknown sources** or **Install unknown apps**
4. Tap on it
5. Select **DVAULT** or your browser
6. Toggle **Allow from this source**
7. Go back and install the APK

**After installation:**
You can disable this setting again for security.

---

## 📊 SYSTEM REQUIREMENTS

**Minimum Android Version:**
- Android 8.0 (API level 26)

**Recommended:**
- Android 10.0 or newer (API level 29+)

**Device Requirements:**
- **RAM:** 2GB minimum (4GB+ recommended)
- **Storage:** 300MB free space
- **Screen:** Any size (phone or tablet)
- **Processor:** ARM64 or x86

**Check Your Version:**
- Settings → About phone → Android version

---

## 🎮 FIRST TIME SETUP

1. **Grant Permissions**
   - Camera (for QR codes)
   - Storage (for backups)
   - USB access (for security keys)
   - Biometric (optional)

2. **License Registration**
   - Enter license key
   - Or use test: `TEST-ABCDE-12345`

3. **Create Master Password**
   - Minimum 8 characters
   - You'll need this to unlock wallet

4. **Connect USB Security Key** (Optional)
   - Requires USB OTG adapter
   - Tap "Add Security Key"
   - Connect and register

5. **Setup Biometric** (Recommended)
   - Fingerprint
   - Face recognition
   - PIN (fallback)

---

## 🔧 CONFIGURATION

### Settings Location
```
Settings (in app) → System Settings → Files

Files stored in:
/data/data/com.dvault/
├── shared_prefs/       (Settings)
├── cache/              (App cache)
├── databases/          (Transaction history)
└── files/              (Encrypted keys)
```

### File Backups
**In-app backup:**
1. Open app
2. Settings → Backup
3. Tap "Create Backup"
4. Save to cloud or device

**Backup to Google Drive:**
1. Settings → Google Account
2. Enable "Backup to Google Drive"
3. Automatic daily backups

---

## 📱 FEATURES ON ANDROID

### Optimized Mobile UI
- ✅ Touch-optimized buttons
- ✅ Portrait and landscape support
- ✅ Optimized for small screens
- ✅ Dark mode support

### Mobile-Specific Features
- ✅ **QR Code Scanning** - Scan recipient addresses
- ✅ **Biometric Security** - Fingerprint/Face unlock
- ✅ **Push Notifications** - Transaction alerts
- ✅ **NFC Support** - Read NFC tags (future)
- ✅ **Offline Mode** - View balances without internet
- ✅ **Share Shortcuts** - Quick send to contacts

### Blockchain Networks
All supported:
- Bitcoin
- Ethereum
- Ripple (XRP)
- Solana
- Cardano
- Avalanche
- BSC
- Polygon
- Stellar (XLM)

---

## 🔌 USB SECURITY KEY SUPPORT

### Requirements
- **USB OTG Adapter** (USB-C or Micro-USB)
- **Compatible USB device** (hardware wallet or key)
- **App permission** for USB access

### Setup Steps
1. Connect USB OTG adapter to phone
2. Plug USB security key into adapter
3. Open DVAULT app
4. Tap **Settings** → **Security Keys**
5. Tap **Add Security Key**
6. Enter password
7. Confirm registration
8. Key ready to use!

### Security Key Operations
- **Sign transactions** - Use key for signing
- **Verify integrity** - Check key is genuine
- **Export backup** - Create encrypted backup
- **Import from backup** - Restore from backup

---

## 🐛 TROUBLESHOOTING

### App Won't Install
**Problem:** "App not compatible with this device"
```
Solution:
- Check Android version (8.0+)
- Check device architecture (ARM64 or x86)
- Try installing from Play Store instead
- Clear Google Play cache: Settings → Apps → Play Store → Storage → Clear Cache
```

### App Crashes on Launch
```bash
# Solution:
1. Uninstall app: Settings → Apps → DVAULT → Uninstall
2. Clear Play Store cache: Settings → Apps → Play Store → Storage → Clear Cache
3. Restart phone
4. Reinstall from Play Store
```

### "Unknown source" Error
```
Solution:
1. Settings → Apps & notifications
2. Advanced → Install unknown apps
3. Select your browser or file manager
4. Toggle "Allow from this source"
5. Try installing again
```

### USB Device Not Detected
```
Solution:
1. Turn phone off
2. Disconnect USB adapter
3. Restart phone
4. Reconnect USB adapter
5. Open app
6. Try again
```

### Slow Performance
```
Solution:
1. Close background apps
2. Clear app cache: Settings → Apps → DVAULT → Storage → Clear Cache
3. Restart phone
4. Disable live data updates temporarily
5. Restart app
```

### Battery Drain
```
Solution:
1. Disable background sync: Settings (in app) → Background Sync
2. Disable push notifications: Settings → Notifications
3. Reduce blockchain query frequency
4. Check if USB key is draining power
```

---

## 📊 OFFLINE USAGE

### What Works Offline
- ✅ View wallet balances (cached)
- ✅ View transaction history
- ✅ Create transactions (offline mode)
- ✅ Sign with USB key (offline)
- ✅ Generate QR codes

### What Needs Internet
- ❌ Check live prices
- ❌ Send transactions
- ❌ Receive new blockchain data
- ❌ Update balances

### Enable Offline Mode
```
Settings → Network → Offline Mode
- Toggle ON
- All features work without internet
- Transactions created but not sent
- Network automatic when connection returns
```

---

## 🔐 SECURITY BEST PRACTICES

✅ **Enable Biometric Lock** (Fingerprint/Face)  
✅ **Use Strong Master Password** (12+ characters)  
✅ **Enable 2FA** if app supports it  
✅ **Register USB security key** for signing  
✅ **Regular backups** to Google Drive  
✅ **Keep app updated** (automatic on Play Store)  
✅ **Don't share phone** with untrusted people  

---

## 🔄 UPDATING

### Automatic Updates (Play Store)
- Enable auto-updates: Play Store → Settings → Auto-update apps
- Always on → Downloads over any network

### Manual Update
1. Open Play Store
2. Tap profile icon (top right)
3. Manage apps & device
4. Find **DVAULT**
5. Tap **Update** if available

### From APK
1. Download new APK file
2. Tap to open it
3. Tap **Install** (overwrites old version)
4. Settings automatically migrate

---

## 📞 SUPPORT

### In-App Help
- Help menu within app
- Tutorial on first launch
- Settings → Help & Support

### Online Resources
- [QUICK_START.md](../../QUICK_START.md)
- [BUILD_SUMMARY.md](../../BUILD_SUMMARY.md)
- [AUDIT_REPORT.md](../../AUDIT_REPORT.md)

### Contact
Email: miket@tfamcomp.online

---

## ✅ VERIFICATION CHECKLIST

After installation:
- [ ] App launches without errors
- [ ] License registration works
- [ ] Can view dashboard
- [ ] USB device recognized (if connected)
- [ ] Blockchain networks connect
- [ ] Can create transaction (offline mode)
- [ ] Biometric security works

---

## 🎉 NEXT STEPS

1. ✅ Install from Play Store or APK
2. ✅ Register your license
3. ✅ Create master password
4. ✅ Enable biometric security
5. ✅ (Optional) Register USB security key
6. ✅ Start using your cold wallet!

**Your secure mobile wallet is ready!** 🔐

---

**Created:** January 29, 2026  
**Status:** Production Ready ✅  
**Minimum Version:** Android 8.0+
