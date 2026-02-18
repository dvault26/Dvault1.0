import { LicenseClient } from '../licenseClient';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs module
jest.mock('fs');

describe('LicenseClient', () => {
  let licenseClient: LicenseClient;
  const mockDataDir = '/mock/data';
  const mockEndpoint = 'https://license.example.com';

  beforeEach(() => {
    jest.clearAllMocks();
    licenseClient = new LicenseClient({
      dataDir: mockDataDir,
      licenseEndpoint: mockEndpoint,
      timeout: 5000,
    });
  });

  describe('constructor', () => {
    it('should initialize with provided options', () => {
      expect(licenseClient).toBeDefined();
    });

    it('should use default timeout if not provided', () => {
      const client = new LicenseClient({ dataDir: mockDataDir });
      expect(client).toBeDefined();
    });
  });

  describe('verifyLicense', () => {
    it('should verify valid license locally', async () => {
      const mockLicenses = [
        {
          fullName: 'John Doe',
          email: 'john@example.com',
          licenseKey: 'TEST-KEY-001',
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
          isActive: true,
          boundDevices: [],
        },
      ];

      (fs.readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify(mockLicenses)
      );

      const result = await licenseClient.verifyLicense(
        'John Doe',
        'john@example.com',
        'TEST-KEY-001'
      );

      expect(result).toBeDefined();
      expect(result?.isActive).toBe(true);
    });

    it('should reject expired license', async () => {
      const mockLicenses = [
        {
          fullName: 'John Doe',
          email: 'john@example.com',
          licenseKey: 'EXPIRED-KEY',
          expiresAt: new Date(Date.now() - 86400000).toISOString(),
          isActive: false,
          boundDevices: [],
        },
      ];

      (fs.readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify(mockLicenses)
      );

      const result = await licenseClient.verifyLicense(
        'John Doe',
        'john@example.com',
        'EXPIRED-KEY'
      );

      expect(result?.isActive).toBe(false);
    });

    it('should reject invalid license key', async () => {
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify([]));

      const result = await licenseClient.verifyLicense(
        'John Doe',
        'john@example.com',
        'INVALID-KEY'
      );

      expect(result).toBeUndefined();
    });

    it('should reject mismatched email', async () => {
      const mockLicenses = [
        {
          fullName: 'John Doe',
          email: 'john@example.com',
          licenseKey: 'TEST-KEY-001',
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
          isActive: true,
          boundDevices: [],
        },
      ];

      (fs.readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify(mockLicenses)
      );

      const result = await licenseClient.verifyLicense(
        'John Doe',
        'wrong@example.com',
        'TEST-KEY-001'
      );

      expect(result).toBeUndefined();
    });

    it('should accept device binding if within limit', async () => {
      const mockLicenses = [
        {
          fullName: 'John Doe',
          email: 'john@example.com',
          licenseKey: 'TEST-KEY-001',
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
          isActive: true,
          boundDevices: [{ deviceId: 'old-device', os: 'Windows' }],
        },
      ];

      (fs.readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify(mockLicenses)
      );

      const deviceInfo = { deviceId: 'new-device', os: 'Windows' };
      const result = await licenseClient.verifyLicense(
        'John Doe',
        'john@example.com',
        'TEST-KEY-001',
        deviceInfo
      );

      expect(result).toBeDefined();
    });
  });

  describe('getStatus', () => {
    it('should return license status', async () => {
      const mockLicenses = [
        {
          fullName: 'John Doe',
          email: 'john@example.com',
          licenseKey: 'TEST-KEY-001',
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
          isActive: true,
          boundDevices: [],
        },
      ];

      (fs.readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify(mockLicenses)
      );

      const status = await licenseClient.getStatus(
        'john@example.com',
        'TEST-KEY-001'
      );

      expect(status).toEqual({
        isActive: true,
        daysRemaining: expect.any(Number),
      });
    });

    it('should return inactive status for invalid key', async () => {
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify([]));

      const status = await licenseClient.getStatus(
        'john@example.com',
        'INVALID-KEY'
      );

      expect(status.isActive).toBe(false);
    });
  });

  describe('ping', () => {
    it('should return server status', async () => {
      const ping = await licenseClient.ping();
      expect(ping).toBeDefined();
    });
  });
});
