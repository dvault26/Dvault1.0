import React, { useState, useMemo } from 'react'
import '../styles/OnboardingGuide.css'

interface GuideStep {
  id: string
  title: string
  description: string
  details: string[]
  icon: string
}

interface OnboardingGuideProps {
  onClose: () => void
}

export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedStep, setExpandedStep] = useState<string | null>(null)

  const steps: GuideStep[] = [
    {
      id: 'registration',
      title: 'Getting Started - Registration',
      description: 'Register your Dvault license and activate your account',
      details: [
        'Enter your full name as it appears on your license',
        'Provide your registered email address',
        'Enter your 16-character license key',
        'Optional: Bind this device for enhanced security',
        'Click "Activate License" to proceed',
      ],
      icon: '📝',
    },
    {
      id: 'signin',
      title: 'Signing In',
      description: 'Access your wallet with secure credentials',
      details: [
        'Use your registered email address to sign in',
        'Enter your secure password',
        'Enable biometric authentication for faster access (optional)',
        'Two-factor authentication (2FA) available for extra security',
        'Check "Remember me" to stay logged in on this device',
      ],
      icon: '🔑',
    },
    {
      id: 'usb-setup',
      title: 'Setting Up USB Devices',
      description: 'Connect and manage your hardware wallets',
      details: [
        'Insert your USB hardware wallet or security key',
        'Go to Settings > Devices > Add Device',
        'Confirm the device name and serial number',
        'Set as primary device for default operations',
        'Your device is now ready to sign transactions',
      ],
      icon: '🔌',
    },
    {
      id: 'add-chains',
      title: 'Adding Blockchain Networks',
      description: 'Configure networks and custom tokens',
      details: [
        'Navigate to Settings > Chains & Tokens',
        'Click "Add Chain" for new blockchain networks',
        'Enter the RPC URL for the network',
        'Verify the chain ID matches the network',
        'For custom tokens, provide the contract address',
        'Validate configuration before saving',
      ],
      icon: '⛓️',
    },
    {
      id: 'transfer-setup',
      title: 'Making a Transfer',
      description: 'Send crypto securely with pre-transfer verification',
      details: [
        'Enter recipient address (will verify against known exchanges)',
        'Select the asset and amount to transfer',
        'Review the network fee estimate',
        'Confirm the transfer details match your intent',
        'Approve with your USB device or PIN',
        'Transaction is signed offline for maximum security',
      ],
      icon: '💸',
    },
    {
      id: 'security-pin',
      title: 'Security & PIN Setup',
      description: 'Protect your transactions with a PIN',
      details: [
        'Go to Settings > Security',
        'Set a 4-6 digit PIN for transaction confirmation',
        'Enable require PIN for all transfers',
        'PIN is stored securely and never transmitted',
        'Regenerate PIN periodically for best security',
        'Enable auto-lock to secure idle sessions',
      ],
      icon: '🔐',
    },
    {
      id: 'backup',
      title: 'Backup & Recovery',
      description: 'Protect your recovery phrase',
      details: [
        'Go to Settings > Security > Backup Recovery Phrase',
        'Write down your 24-word recovery phrase in order',
        'Store it in a safe location (NOT digital)',
        'Never share this phrase with anyone',
        'Use it to restore your wallet if device is lost',
        'Consider using multiple physical copies',
      ],
      icon: '💾',
    },
    {
      id: 'language',
      title: 'Language Settings',
      description: 'Customize your interface language',
      details: [
        'Go to Settings > General > Language',
        'Choose from available languages: English, Español, Deutsch, Français',
        'Language preference is saved automatically',
        'Interface updates immediately on selection',
        'Suitable for international users and teams',
      ],
      icon: '🌍',
    },
    {
      id: 'updates',
      title: 'Software Updates',
      description: 'Keep Dvault secure and up-to-date',
      details: [
        'Go to Settings > Software Updates',
        'Click "Check for Updates" to find new versions',
        'Enable auto-check for automatic background checks',
        'Updates include security patches and new features',
        'Restart application to apply updates',
        'Always backup before major version updates',
      ],
      icon: '🔄',
    },
    {
      id: 'legal',
      title: 'Legal & Compliance',
      description: 'Review important legal documents',
      details: [
        'Access Settings > Legal for all documents',
        'Review Terms of Service before using Dvault',
        'Understand Privacy Policy regarding data handling',
        'Review License Agreement for usage rights',
        'Read Disclaimer regarding investment decisions',
        'Documents available in your preferred language',
      ],
      icon: '⚖️',
    },
  ]

  const filteredSteps = useMemo(() => {
    if (!searchTerm.trim()) return steps
    const term = searchTerm.toLowerCase()
    return steps.filter(
      step =>
        step.title.toLowerCase().includes(term) ||
        step.description.toLowerCase().includes(term) ||
        step.details.some(detail => detail.toLowerCase().includes(term))
    )
  }, [searchTerm])

  return (
    <div className="onboarding-guide">
      <div className="guide-header">
        <h1>📚 Dvault Onboarding Guide</h1>
        <p>Learn how to use Dvault securely and efficiently</p>
        <button className="close-btn" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>

      <div className="guide-search">
        <input
          type="text"
          placeholder="Search guide steps..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <span className="search-icon">🔍</span>
      </div>

      <div className="guide-steps">
        {filteredSteps.length > 0 ? (
          filteredSteps.map(step => (
            <div
              key={step.id}
              className={`guide-step ${expandedStep === step.id ? 'expanded' : ''}`}
            >
              <div
                className="step-header"
                onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
              >
                <div className="step-title-section">
                  <span className="step-icon">{step.icon}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                </div>
                <span className="expand-icon">
                  {expandedStep === step.id ? '▼' : '▶'}
                </span>
              </div>

              {expandedStep === step.id && (
                <div className="step-details">
                  <ol>
                    {step.details.map((detail, idx) => (
                      <li key={idx}>{detail}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>No steps match "{searchTerm}"</p>
            <p>Try searching for keywords like "USB", "PIN", "transfer", or "backup"</p>
          </div>
        )}
      </div>

      <div className="guide-footer">
        <p>
          Need help? Check the Support & Help section in Settings or visit our documentation.
        </p>
      </div>
    </div>
  )
}
