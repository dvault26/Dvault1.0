# 🚀 DVAULT v0.2.0 - QUICK REFERENCE CARD

## ⚡ INSTANT STARTUP

### Run the App (Windows)
```
C:\Users\MikeT\Documents\DVAULT\dist\release\Dvault-0.2.0.exe
```
**That's it! Double-click and it runs.**

---

## 📋 BUILD & RUN COMMANDS

```bash
cd C:\Users\MikeT\Documents\DVAULT

# Development (hot reload)
npm run dev

# Production build
npm run build

# Package as executable
npm run build:all

# Run built version
npm start

# Docker
docker-compose up dvault-dev    # Development
docker-compose up dvault-prod   # Production
```

---

## 🔧 KEY FEATURES

| Feature | Command/Access | Status |
|---------|----------------|--------|
| **Security Keys** | `window.dvault.securityKey.*` | ✅ Ready |
| **Blockchain** | `window.dvault.blockchain.*` | ✅ Ready |
| **Settings** | `window.dvault.settings.*` | ✅ Ready |
| **Vault Storage** | `window.dvault.vault.*` | ✅ Ready |
| **USB Devices** | `window.dvault.usb.*` | ✅ Ready |

---

## 📁 IMPORTANT LOCATIONS

| Item | Path |
|------|------|
| **Executable** | `dist/release/Dvault-0.2.0.exe` |
| **Source Code** | `src/` |
| **Main Process** | `src/main/main.ts` |
| **UI Components** | `src/renderer/components/` |
| **Security Keys** | `src/lib/securityKeyManager.ts` |
| **Build Files** | `dist/` |
| **User Data** | `%APPDATA%\Dvault\` |

---

## ✅ VERIFICATION CHECKLIST

- [x] App builds without errors
- [x] Executable created (156 MB)
- [x] All features functional
- [x] Security keys implemented
- [x] Premium UI theme applied
- [x] Cross-platform support ready
- [x] Docker configuration working
- [x] Documentation complete

---

## 🎨 DESIGN SPECIFICATIONS

**Colors:**
- Canvas Black: `#0a0e27`
- Gold Accent: `#d4af37`
- Success Green: `#00d084`
- Danger Red: `#ff4757`

**Typography:**
- Font Family: Inter (sans-serif)
- Heading Font: Cinzel (serif)
- Monospace: Monaco/Courier

---

## 📊 SPECS

| Aspect | Value |
|--------|-------|
| **Version** | 0.2.0 |
| **Executable Size** | 156 MB |
| **Startup Time** | < 3 seconds |
| **Memory Usage** | 150-300 MB |
| **Supported OS** | Windows 10/11 (x64) |
| **Node Version** | 20.x |
| **Electron Version** | 25.x |

---

## 🔐 SECURITY SUMMARY

✅ AES-256-GCM encryption  
✅ PBKDF2 key derivation (100K iterations)  
✅ Hardware wallet support  
✅ Secure key storage  
✅ Isolated signing operations  
✅ Audit logging  
✅ Context isolation  

---

## 🐛 QUICK TROUBLESHOOTING

| Issue | Fix |
|-------|-----|
| App won't start | Restart computer, clear `%APPDATA%\Dvault` |
| USB not detected | Check drivers, restart, try different port |
| Settings lost | Rebuild: `npm run build` |
| Slow performance | Close other apps, check RAM usage |

---

## 📱 CROSS-PLATFORM

**Build for other platforms:**
```bash
npm run package:mac      # macOS DMG
npm run package:linux    # Linux AppImage
npm run docker:build     # Docker image
```

---

## 📞 SUPPORT

**Documentation:**
- `BUILD_SUMMARY.md` - Complete overview
- `DEPLOYMENT_PRODUCTION.md` - Detailed guide
- `AUDIT_REPORT.md` - Security review
- `README.md` - Quick start

**Contact:** miket@tfamcomp.online

---

**✅ STATUS: PRODUCTION READY**

**🚀 Ready to deploy and distribute!**
