import React from 'react';
import { ArrowLeft, Shield, Eye, Lock, Database, Users, AlertTriangle } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export default function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors group touch-manipulation"
        >
          <ArrowLeft className="w-5 h-5 group-hover:transform group-hover:-translate-x-1 transition-transform" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/50">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">Privacy Policy</h2>
        <p className="text-gray-400 text-sm sm:text-lg">Your privacy and data protection are our top priority</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 shadow-xl shadow-blue-500/10">
          <div className="flex items-center space-x-3 mb-4">
            <Eye className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-bold text-white">Information We Collect</h3>
          </div>
          <div className="space-y-4 text-gray-300">
            <div>
              <h4 className="text-white font-semibold mb-2">Account Information:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Email address (for account creation and communication)</li>
                <li>Username (for identification in games and forums)</li>
                <li>Country (optional, for regional features)</li>
                <li>Profile preferences (notifications, sound settings)</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Gaming Data:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Game statistics (wins, losses, scores, achievements)</li>
                <li>Virtual currency balances (chips, points)</li>
                <li>Purchase history and transaction records</li>
                <li>Game progress and unlocked content</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Community Activity:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Forum posts, comments, and discussions</li>
                <li>Chat messages and social interactions</li>
                <li>User-generated content (images, screenshots)</li>
                <li>Reports and moderation actions</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 shadow-xl shadow-blue-500/10">
          <div className="flex items-center space-x-3 mb-4">
            <Database className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-bold text-white">How We Use Your Information</h3>
          </div>
          <div className="space-y-4 text-gray-300">
            <div>
              <h4 className="text-white font-semibold mb-2">Service Provision:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Maintain your account and gaming progress</li>
                <li>Process virtual currency transactions</li>
                <li>Enable cross-game authentication and data sync</li>
                <li>Provide customer support and technical assistance</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Community Features:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Enable forum discussions and social interactions</li>
                <li>Moderate content and enforce community rules</li>
                <li>Display leaderboards and achievements</li>
                <li>Facilitate friend connections and messaging</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Improvement & Analytics:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Analyze game performance and user engagement</li>
                <li>Improve game balance and user experience</li>
                <li>Develop new features and content</li>
                <li>Prevent fraud and ensure fair play</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 shadow-xl shadow-blue-500/10">
          <div className="flex items-center space-x-3 mb-4">
            <Lock className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-bold text-white">Data Protection & Security</h3>
          </div>
          <div className="space-y-4 text-gray-300">
            <div>
              <h4 className="text-white font-semibold mb-2">Security Measures:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>End-to-end encryption for all data transmission</li>
                <li>Secure database storage with row-level security</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Multi-factor authentication options</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Data Retention:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Account data retained while account is active</li>
                <li>Game progress saved for account recovery</li>
                <li>Forum posts retained for community continuity</li>
                <li>Deleted accounts purged within 30 days</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 shadow-xl shadow-blue-500/10">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-bold text-white">Your Rights & Choices</h3>
          </div>
          <div className="space-y-4 text-gray-300">
            <div>
              <h4 className="text-white font-semibold mb-2">Account Control:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Update or correct your personal information</li>
                <li>Adjust privacy and notification settings</li>
                <li>Download your data in portable format</li>
                <li>Delete your account and associated data</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Communication Preferences:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Opt out of promotional emails</li>
                <li>Control push notification settings</li>
                <li>Manage forum and chat visibility</li>
                <li>Block or report other users</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-800/20 to-red-900/20 border border-red-500/30 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <h3 className="text-xl font-bold text-red-400">Important Notice</h3>
          </div>
          <div className="text-red-300 space-y-2 text-sm">
            <p>
              <strong>Account Suspension Policy:</strong> Violations of our community rules, including swearing, bullying, or harassment, will result in immediate account suspension for 1 month.
            </p>
            <p>
              <strong>Permanent Ban Policy:</strong> Second violations will result in permanent account termination with complete loss of all game progress, virtual currency, cards, and achievements.
            </p>
            <p>
              <strong>Zero Tolerance:</strong> We maintain a family-friendly environment and enforce these policies strictly to protect all community members.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 shadow-xl shadow-blue-500/10">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-bold text-white">Contact & Updates</h3>
          </div>
          <div className="space-y-4 text-gray-300 text-sm">
            <p>
              <strong>Contact Us:</strong> For privacy concerns, data requests, or questions about this policy, contact us at privacy@gamehub.com
            </p>
            <p>
              <strong>Policy Updates:</strong> We may update this privacy policy periodically. Users will be notified of significant changes via email and in-app notifications.
            </p>
            <p>
              <strong>Effective Date:</strong> This privacy policy is effective as of January 15, 2025.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}