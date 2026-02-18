# Dvault Testing Guide

## Download & Setup

1. **Get the .exe from GitHub Actions:**
   - Go to https://github.com/dvault26/Dvault1.0/actions
   - Click the latest `Build Windows Portable` workflow run
   - Scroll to **Artifacts** section
   - Download `dvault-windows-portable` (contains `Dvault.exe`)

2. **Run the installer:**
   - Extract or run `Dvault.exe` directly (portable, no installation needed)
   - Windows may ask for SmartScreen approval (click "Run anyway")

## Test Checklist

### Phase 1: Registration & Activation
- [ ] **App starts** → Shows "Registration" screen
- [ ] **Enter Full Name** → Accept input (test: "John Doe")
- [ ] **Enter Email** → Validate format (test: "john@example.com")
- [ ] **Enter License Key** → Input field appears (use test key from your license service)
- [ ] **Device Binding checkbox** → Option visible, can toggle on/off
- [ ] **Click "Register"** → Submits to remote license endpoint (watch for success/error message)
- [ ] **Success screen** → Shows "Your copy of Dvault is now registered and owned by you." with authorization code
- [ ] **Authorization code displays** → Shows 6-8 character code
- [ ] **Click "Continue to Sign‑In"** → Routes to Sign‑In screen

### Phase 2: Persistence & Lock/Unlock
- [ ] **Close and reopen app** → Goes directly to Sign‑In (not Registration)
- [ ] **Sign‑In screen appears** → Email field pre-filled or prompt for credentials
- [ ] **Settings accessible** → Look for Settings icon/tab; click to view settings page
- [ ] **Settings show licenseEndpoint** → Should display your configured remote endpoint (default: https://your-render-app.onrender.com)

### Phase 3: Settings & Configuration
- [ ] **Language selector** → i18n dropdown works (if added; otherwise labeled "Not yet implemented")
- [ ] **Legal/Support tabs** → Links to legal docs and support info visible
- [ ] **USB Device Manager** → Section visible (may show "No devices" or detected hardware)
- [ ] **Update checker** → Auto-checks for updates on startup (may show "Up to date")

### Phase 4: Transfer Flow (if implemented)
- [ ] **Initiate Transfer** → Button visible in main view
- [ ] **Pre-transfer metadata** → Dialog captures transaction details (from/to, amount, network)
- [ ] **Signature request** → Mock signer or HID signer prompts for signing
- [ ] **Signed transaction** → Pre-transfer data encrypted and stored locally

### Phase 5: Brokerage Detection (if UI wired)
- [ ] **Brokerage tab** → Shows detected exchanges/brokers
- [ ] **Detection algorithm** → Matches against `known_exchanges.json` locally
- [ ] **Results display** → List of matched/suggested brokers

## Expected Behavior

### Success Path
- Registration completes → Email stored locally
- App locks on restart until Sign‑In
- All settings persist across sessions
- No crashes on navigation

### Error Handling
- Invalid email → Error message "Invalid email format"
- Invalid license key → Error message "License key not found" or "License expired"
- Network error during activation → Fallback to local validation attempted
- Missing license service → Should display error but app should not crash

## Known Limitations (Current Build)
- Docker dev mode requires Docker Engine running
- Windows portable packaging needs Admin or Developer Mode on host
- HID signer is mocked (uses MockSigner by default)
- Some i18n strings may be English-only
- Plaid sandbox integration requires API keys (not active in this build)

## Troubleshooting

**App won't start:**
- Check Windows Defender allows the .exe
- Try running as Administrator
- Check Windows 10/11 compatibility

**License activation fails:**
- Verify Render endpoint is running and accessible
- Check email/license key format
- Try again in offline mode (will use local fallback)

**Settings don't persist:**
- Check `%APPDATA%\Dvault` folder exists and has write permissions
- Look for `settings.json` file in that folder

**UI looks broken:**
- Ensure Vite build succeeded before packaging
- Try clearing app cache (delete `%APPDATA%\Dvault` and restart)

## Report Results

After testing, note:
- ✅ / ❌ for each test item above
- Any error messages or crashes
- Performance observations (startup time, responsiveness)
- Suggestions for UI/UX improvements

---

**Build Date:** February 18, 2026  
**Version:** 0.2.0  
**Repository:** https://github.com/dvault26/Dvault1.0
