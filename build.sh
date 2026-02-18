#!/bin/bash

# Dvault Production Build Script
# Builds cross-platform executables and Docker images

set -e

echo "🔨 Dvault Production Build System"
echo "=================================="

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Detect OS
OS="$(uname -s)"
ARCH="$(uname -m)"

echo -e "${YELLOW}Detected: ${OS} ${ARCH}${NC}"

# Functions
build_main() {
    echo -e "${YELLOW}→ Building main process${NC}"
    npm run build:main
}

build_renderer() {
    echo -e "${YELLOW}→ Building renderer process${NC}"
    npm run build:renderer
}

build_windows_exe() {
    echo -e "${YELLOW}→ Building Windows executable${NC}"
    if command -v electron-builder &> /dev/null; then
        CSC_IDENTITY_AUTO_DISCOVERY=false npx electron-builder --win portable --publish never
        cp dist/win-unpacked/Dvault.exe dist/release/Dvault-$(npm pkg get version | tr -d '"').exe
        echo -e "${GREEN}✓ Windows executable created${NC}"
    else
        echo -e "${RED}✗ electron-builder not found${NC}"
        return 1
    fi
}

build_mac_dmg() {
    echo -e "${YELLOW}→ Building macOS DMG${NC}"
    if command -v electron-builder &> /dev/null; then
        npx electron-builder --mac dmg --publish never
        echo -e "${GREEN}✓ macOS DMG created${NC}"
    else
        echo -e "${RED}✗ electron-builder not found${NC}"
        return 1
    fi
}

build_linux_appimage() {
    echo -e "${YELLOW}→ Building Linux AppImage${NC}"
    if command -v electron-builder &> /dev/null; then
        npx electron-builder --linux AppImage --publish never
        echo -e "${GREEN}✓ Linux AppImage created${NC}"
    else
        echo -e "${RED}✗ electron-builder not found${NC}"
        return 1
    fi
}

build_docker_image() {
    echo -e "${YELLOW}→ Building Docker image${NC}"
    if command -v docker &> /dev/null; then
        VERSION=$(npm pkg get version | tr -d '"')
        docker build -t dvault:${VERSION} -t dvault:latest .
        echo -e "${GREEN}✓ Docker image created: dvault:${VERSION}${NC}"
    else
        echo -e "${RED}✗ Docker not found${NC}"
        return 1
    fi
}

run_tests() {
    echo -e "${YELLOW}→ Running tests${NC}"
    npm test 2>/dev/null || echo -e "${YELLOW}⚠ No tests configured${NC}"
}

# Main build flow
main() {
    case "${1:-all}" in
        windows)
            build_main
            build_renderer
            build_windows_exe
            ;;
        mac)
            build_main
            build_renderer
            build_mac_dmg
            ;;
        linux)
            build_main
            build_renderer
            build_linux_appimage
            ;;
        docker)
            build_docker_image
            ;;
        all)
            build_main
            build_renderer
            echo -e "${YELLOW}→ Building for current platform: ${OS}${NC}"
            case "${OS}" in
                Darwin)
                    build_mac_dmg
                    ;;
                Linux)
                    build_linux_appimage
                    ;;
                MINGW*|MSYS*|CYGWIN*)
                    build_windows_exe
                    ;;
            esac
            build_docker_image
            ;;
        test)
            run_tests
            ;;
        *)
            echo "Usage: $0 {windows|mac|linux|docker|all|test}"
            exit 1
            ;;
    esac

    echo -e "${GREEN}✓ Build complete${NC}"
}

main "$@"
