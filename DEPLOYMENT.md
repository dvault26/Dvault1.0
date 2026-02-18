# Dvault Deployment Guide

## Desktop Installation (Windows)

### Standalone EXE
A portable executable is built and ready at:
```
dist/Dvault.exe (156MB)
```

**To deploy:**
1. Copy `dist/Dvault.exe` to your release folder
2. Distribute to users for testing
3. No installation required - just run the EXE

**Features:**
- Self-contained application
- No dependencies required (Electron bundled)
- Portable - works on any Windows machine

### Windows Installer (NSIS)
To create a traditional Windows installer:
```bash
npm run package:win
```
Note: Requires proper code signing certificates for production release

## Docker Deployment

### Build Docker Image
```bash
docker build -t dvault:latest .
```

### Run with Docker Compose (Recommended for testing)
```bash
docker-compose up -d
```

**Features:**
- Isolated environment
- Health checks enabled
- Volume persistence for data and logs
- Network isolation
- Non-root user (appuser)

### Manual Docker Deployment
```bash
docker run -d \
  --name dvault \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -v dvault-data:/app/data \
  -v dvault-logs:/app/logs \
  --restart unless-stopped \
  dvault:latest
```

### Docker Environment Variables
- `NODE_ENV`: Set to 'production' for production builds
- `LOG_LEVEL`: Set log verbosity (info, debug, error)

### Health Check
Both Docker and Docker Compose include health checks:
- Interval: 30 seconds
- Timeout: 10 seconds
- Retries: 3
- Start period: 40 seconds

## Project Structure

```
DVAULT/
├── dist/
│   ├── Dvault.exe              # ✓ Portable Windows executable
│   ├── electron.exe            # Electron binary
│   ├── resources/app/          # Application resources
│   ├── main/                   # Compiled main process
│   └── renderer/               # Compiled UI
├── Dockerfile                  # Docker build configuration
├── docker-compose.yml          # Docker Compose setup
├── .dockerignore               # Docker build exclusions
├── build/
│   └── icon.svg               # Application icon
├── package.json               # Project metadata and scripts
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite build configuration
└── src/
    ├── main/                  # Electron main process
    ├── renderer/              # React UI
    ├── preload/               # IPC preload script
    └── lib/                   # Service modules
```

## Security Features

✓ Docker security hardening:
  - No new privileges
  - All capabilities dropped except NET_BIND_SERVICE
  - Non-root user execution
  - Health checks
  - Network isolation

✓ Application level:
  - IPC preload script isolation
  - Hardware signer integration
  - USB device support via node-hid

## Testing Checklist

- [ ] Desktop EXE runs without errors
- [ ] UI renders correctly
- [ ] Signer functionality works
- [ ] Docker build completes without errors
- [ ] Docker container starts successfully
- [ ] Health checks pass
- [ ] Data persistence works
- [ ] Logs are generated correctly

## Performance

- **EXE Size:** ~156MB (uncompressed)
  - Includes full Electron runtime
  - All dependencies bundled
  
- **Docker Image:** ~750MB-1GB
  - Alpine Node.js base
  - Production dependencies only
  - Multi-stage build optimization

## Troubleshooting

### EXE won't start
- Ensure Windows 10+ with latest updates
- Check for missing .NET runtime
- Run with administrator privileges if needed

### Docker build fails
- Ensure Docker Desktop is running
- Check available disk space (>2GB)
- Verify all source files are present

### Container won't start
- Check Docker logs: `docker logs dvault`
- Verify port 3000 is not in use
- Check volume permissions

## Next Steps

1. **Branding:**
   - Replace icon.svg with actual app icon
   - Update icon.png in build/ folder (256x256)

2. **Code Signing (Production):**
   - Obtain Windows code signing certificate
   - Configure in package.json
   - Enable NSIS installer creation

3. **CI/CD Integration:**
   - Add GitHub Actions workflow
   - Automated builds on release
   - Auto-deploy to Docker Hub

4. **Release Process:**
   - Tag version in git
   - Build artifacts
   - Create GitHub release
   - Upload exe and docker images

---

**Version:** 0.1.0  
**Last Updated:** 2026-01-29  
**Status:** Ready for External Testing ✓
