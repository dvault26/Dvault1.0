# 🪟 Windows PC Installation - DVAULT v0.2.0

**Easiest installation - Just 2 steps! Takes less than 2 minutes.**

---

## ⚡ FASTEST INSTALLATION (2 Minutes)

### Step 1: Download Executable
```
File Location: 
C:\Users\MikeT\Documents\DVAULT\dist\release\Dvault-0.2.0.exe

File Size: 156 MB
No installation required!
```

### Step 2: Run It!
1. Open File Explorer
2. Navigate to: `C:\Users\MikeT\Documents\DVAULT\dist\release\`
3. **Double-click:** `Dvault-0.2.0.exe`
4. **Done!** App launches in < 3 seconds

---

## 📍 WHERE TO FIND THE .EXE FILE

### Direct Path
```
C:\Users\MikeT\Documents\DVAULT\dist\release\Dvault-0.2.0.exe
```

### Using File Explorer
1. Open **File Explorer** (Win + E)
2. Copy-paste path: `C:\Users\MikeT\Documents\DVAULT\dist\release\`
3. Find file: `Dvault-0.2.0.exe`

### Using Command Line
```bash
cd C:\Users\MikeT\Documents\DVAULT\dist\release
dir
# You'll see: Dvault-0.2.0.exe (156 MB)
```

### Quick Access Shortcut
Create a shortcut on your Desktop:
1. Right-click desktop → New → Shortcut
2. Location: `C:\Users\MikeT\Documents\DVAULT\dist\release\Dvault-0.2.0.exe`
3. Name: `DVAULT`
4. Finish

Now you can just double-click the desktop shortcut to launch!

---

## 🚀 STARTING THE APP

### Method 1: Double-Click (Easiest)
1. Navigate to exe file (see above)
2. Double-click `Dvault-0.2.0.exe`
3. App launches instantly

### Method 2: Command Line
```bash
C:\Users\MikeT\Documents\DVAULT\dist\release\Dvault-0.2.0.exe
```

### Method 3: PowerShell
```powershell
& 'C:\Users\MikeT\Documents\DVAULT\dist\release\Dvault-0.2.0.exe'
```

---

## 🔐 FIRST TIME SETUP

### When App Launches
1. **License Registration**
   - Enter your license key
   - Or use test key: `TEST-ABCDE-12345`

2. **Security Settings**
   - Create password (remember this!)
   - This protects your wallet

3. **USB Security Key (Optional)**
   - Connect USB device
   - Register as security key
   - For offline signing

4. **Blockchain Connection**
   - App auto-connects to networks
   - May take 10-30 seconds first time

---

## 📊 SYSTEM REQUIREMENTS

✅ **Windows 10 or later**  
✅ **2GB RAM minimum (4GB recommended)**  
✅ **500MB free disk space**  
✅ **No admin rights needed**  
✅ **No installation required**  

---

## 🎮 USAGE GUIDE

### Dashboard
- View wallet balances
- See transaction history
- Check connected keys

### Send Transaction
1. Click "Send"
2. Enter recipient address
3. Set amount
4. Confirm with USB key
5. Done!

### Add Security Key
1. Click "Settings"
2. Select "Security Keys"
3. Click "Add New Key"
4. Connect USB device
5. Create password
6. Confirm registration

### View Balances
1. Click "Wallet"
2. See all your assets
3. Real-time blockchain data

---

## ⚙️ CONFIGURATION

### Settings Location
```
C:\Users\MikeT\AppData\Roaming\dvault\
├── settings.json          (App settings)
├── keys/                  (Encrypted keys)
│   ├── key1.enc
│   ├── key2.enc
│   └── ...
└── cache/                 (Transaction cache)
```

### Backing Up Your Keys
1. Open app
2. Settings → Security Keys
3. Click export on any key
4. Save encrypted backup file
5. Keep it safe!

### Restoring From Backup
1. Open app
2. Settings → Security Keys
3. Click "Import Key"
4. Select backup file
5. Enter password
6. Key restored!

---

## 🐛 TROUBLESHOOTING

### App Won't Start
**Problem:** Clicking exe does nothing  
**Solution:**
```bash
# Try via command line to see error:
cd C:\Users\MikeT\Documents\DVAULT\dist\release
Dvault-0.2.0.exe

# Check if Windows Defender is blocking it:
Settings → Virus & threat protection
→ Allowed apps → Allow dvault
```

### "Application Failed to Initialize"
**Problem:** App crashes on startup  
**Solution:**
1. Delete cache folder:
   ```
   C:\Users\MikeT\AppData\Roaming\dvault\cache\
   ```
2. Restart app
3. If still fails, reinstall: delete whole `dvault\` folder in AppData

### USB Key Not Recognized
**Problem:** Can't see security key  
**Solution:**
1. Unplug USB key
2. Wait 5 seconds
3. Plug back in
4. Restart app
5. Check Device Manager: Start → Device Manager → look for USB devices

### App Runs Slowly
**Problem:** Freezes or lags  
**Solution:**
1. Close other apps
2. Ensure 2GB+ free RAM: Task Manager → Performance
3. Check disk space: 500MB+ free
4. Restart computer
5. Restart app

### Settings Won't Save
**Problem:** Changes disappear after restart  
**Solution:**
1. Close app completely
2. Check folder permissions:
   - Right-click: `C:\Users\MikeT\AppData\Roaming\dvault\`
   - Properties → Security
   - Ensure your user has Write permission
3. Run as Administrator:
   - Right-click exe → Run as administrator

---

## 🔄 UPDATING THE APP

### Check Current Version
1. Click settings icon (⚙️)
2. Look for "Version: 0.2.0"

### Update to New Version
When new version available:
1. Download new exe file
2. Replace old exe
3. Run new exe
4. Settings auto-migrate

---

## 📦 PORTABLE VS INSTALLER

**This is a PORTABLE executable:**
- ✅ No installation needed
- ✅ Works from USB drive
- ✅ No registry entries
- ✅ Can delete anytime
- ✅ Super fast startup

**Want an installer instead?**
See: [Creating NSIS Installer](../windows-pc/CREATE_INSTALLER.md)

---

## 🔗 RELATED FILES

- **Main App:** [Dvault-0.2.0.exe](../../dist/release/Dvault-0.2.0.exe)
- **Quick Start:** [QUICK_START.md](../../QUICK_START.md)
- **Build Info:** [BUILD_SUMMARY.md](../../BUILD_SUMMARY.md)
- **Troubleshooting:** [AUDIT_REPORT.md](../../AUDIT_REPORT.md)

---

## ✅ VERIFICATION CHECKLIST

After installation, verify:

- [ ] Exe file found at: `C:\Users\MikeT\Documents\DVAULT\dist\release\Dvault-0.2.0.exe`
- [ ] File size is exactly 156 MB
- [ ] App launches when double-clicked
- [ ] Dashboard loads within 3 seconds
- [ ] Settings accessible from menu
- [ ] USB key detection works (if connected)
- [ ] License validation passes
- [ ] All blockchain networks connect

**All checked?** → You're good to go! 🎉

---

## 🆘 STILL HAVING ISSUES?

### Debug Information
Collect this info for support:
```
Windows Version: (Settings → System → About)
RAM: (Task Manager → Performance)
Disk Space: (File Explorer → Properties of C: drive)
Error Message: (Write down exact message)
Steps to Reproduce: (What you were doing when it failed)
```

### Contact Support
- Email: miket@tfamcomp.online
- Reference: DVAULT v0.2.0 Windows
- Attach: Error screenshot if possible

---

## 🎉 NEXT STEPS

1. ✅ Download and run executable
2. ✅ Complete license registration
3. ✅ Create security password
4. ✅ (Optional) Register USB security key
5. ✅ Explore dashboard and features

**You're all set!** Happy secure wallet usage! 🔐

---

**Created:** January 29, 2026  
**Status:** Production Ready ✅  
**Support:** 24/7 Documentation Available
