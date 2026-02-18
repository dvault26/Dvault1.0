# Dvault (prototype)

This workspace contains a minimal scaffold for the Dvault desktop app (Electron + React + TypeScript),
plus a `HardwareSigner` interface and a `MockSigner` software implementation for early development.

What I added:
- Electron main process (`src/main/main.ts`) with IPC handlers for a mock signer
- Preload script (`src/preload/preload.ts`) exposing a small `dvault.signer` API to the renderer
- React renderer (`src/renderer/*`) with a tiny UI to connect the mock signer and generate a key
- `HardwareSigner` interface and `MockSigner` implementation in `src/lib`
- `BlockchainService` abstraction stub

Next steps (suggested):
- Build the real USB hardware signer protocol and replace `MockSigner` with a USB-backed implementation
- Implement chain-specific `BlockchainService` clients for XRP and XLM
- Implement encrypted blob storage and vault UI
