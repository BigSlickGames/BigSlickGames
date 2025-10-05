import React from 'react';
import { ArrowLeft, FileText, AlertTriangle, Ban, Clock, Trash2, Shield } from 'lucide-react';

interface TermsOfUseProps {
  onBack: () => void;
}

export default function TermsOfUse({ onBack }: TermsOfUseProps) {
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
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/50">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">Terms of Use</h2>
        <p className="text-gray-400 text-sm sm:text-lg">Legal agreement for using GameHub services</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 shadow-xl shadow-purple-500/10">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="w-6 h-6 text-purple-400" />
            <h3 className="text-xl font-bold text-white">Agreement to Terms</h3>
          </div>
          <div className="space-y-4 text-gray-300 text-sm">
            <p>
              By accessing and using GameHub services, you agree to be bound by these Terms of Use and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this service.
            </p>
            <p>
              These terms constitute a legally binding agreement between you and GameHub. Your continued use of the service indicates your acceptance of these terms and any updates or modifications.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 shadow-xl shadow-purple-500/10">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-6 h-6 text-purple-400" />
            <h3 className="text-xl font-bold text-white">Account Responsibilities</h3>
          </div>
          <div className="space-y-4 text-gray-300">
            <div>
              <h4 className="text-white font-semibold mb-2">Account Security:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You must notify us immediately of any unauthorized use of your account</li>
                <li>You are liable for all activities that occur under your account</li>
                <li>Sharing accounts or credentials is strictly prohibited</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Accurate Information:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>You must provide accurate and complete information during registration</li>
                <li>You must update your information to keep it current</li>
                <li>False information may result in account termination</li>
                <li>You must be at least 13 years old to create an account</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-800/20 to-red-900/20 border border-red-500/30 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <h3 className="text-xl font-bold text-red-400">ZERO TOLERANCE POLICY</h3>
          </div>
          <div className="space-y-4">
            <div className="bg-red-900/30 border border-red-500/40 rounded-lg p-4">
              <h4 className="text-red-300 font-bold mb-2 flex items-center space-x-2">
                <Ban className="w-5 h-5" />
                <span>Prohibited Behavior</span>
              </h4>
              <ul className="list-disc list-inside space-y-1 text-red-200 text-sm">
                <li><strong>Swearing or Profanity:</strong> Any use of offensive language in any form</li>
                <li><strong>Bullying or Harassment:</strong> Intimidating, threatening, or targeting other users</li>
                <li><strong>Hate Speech:</strong> Discriminatory language based on race, gender, religion, etc.</li>
                <li><strong>Inappropriate Content:</strong> Sexual, violent, or disturbing material</li>
                <li><strong>Spam or Abuse:</strong> Repetitive messages, flooding, or system abuse</li>
              </ul>
            </div>
            
            <div className="bg-orange-900/30 border border-orange-500/40 rounded-lg p-4">
              <h4 className="text-orange-300 font-bold mb-2 flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>First Violation: 1 Month Suspension</span>
              </h4>
              <ul className="list-disc list-inside space-y-1 text-orange-200 text-sm">
                <li>Account suspended for exactly 30 days</li>
                <li>No access to games, forum, or chat during suspension</li>
                <li>Game progress and virtual currency preserved</li>
                <li>Warning email sent with violation details</li>
              </ul>
            </div>
            
            <div className="bg-red-900/40 border border-red-500/50 rounded-lg p-4">
              <h4 className="text-red-300 font-bold mb-2 flex items-center space-x-2">
                <Trash2 className="w-5 h-5" />
                <span>Second Violation: PERMANENT BAN</span>
              </h4>
              <ul className="list-disc list-inside space-y-1 text-red-200 text-sm">
                <li><strong>Account permanently deleted</strong></li>
                <li><strong>ALL game progress lost forever</strong></li>
                <li><strong>ALL virtual currency (chips, points) forfeited</strong></li>
                <li><strong>ALL cards and achievements deleted</strong></li>
                <li><strong>ALL purchases and premium content lost</strong></li>
                <li><strong>IP address banned from creating new accounts</strong></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 shadow-xl shadow-purple-500/10">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="w-6 h-6 text-purple-400" />
            <h3 className="text-xl font-bold text-white">Virtual Currency & Purchases</h3>
          </div>
          <div className="space-y-4 text-gray-300">
            <div>
              <h4 className="text-white font-semibold mb-2">Virtual Currency:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Chips, points, and other virtual currencies have no real-world value</li>
                <li>Virtual currency cannot be exchanged for real money</li>
                <li>Virtual currency balances may be reset for game balance purposes</li>
                <li>Lost virtual currency due to violations will not be restored</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Purchases:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>All purchases are final and non-refundable</li>
                <li>Purchased content is tied to your account and cannot be transferred</li>
                <li>Account termination results in loss of all purchased content</li>
                <li>We reserve the right to modify or discontinue any virtual goods</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 shadow-xl shadow-purple-500/10">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-6 h-6 text-purple-400" />
            <h3 className="text-xl font-bold text-white">Intellectual Property</h3>
          </div>
          <div className="space-y-4 text-gray-300 text-sm">
            <p>
              All content, features, and functionality of GameHub, including but not limited to text, graphics, logos, icons, images, audio clips, video clips, data compilations, and software, are the exclusive property of GameHub and are protected by copyright, trademark, and other intellectual property laws.
            </p>
            <p>
              You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our service without our prior written consent.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 shadow-xl shadow-purple-500/10">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-purple-400" />
            <h3 className="text-xl font-bold text-white">Limitation of Liability</h3>
          </div>
          <div className="space-y-4 text-gray-300 text-sm">
            <p>
              GameHub is provided "as is" without warranties of any kind. We do not guarantee that the service will be uninterrupted, secure, or error-free. Your use of the service is at your own risk.
            </p>
            <p>
              In no event shall GameHub be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or other intangible losses resulting from your use of the service.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 shadow-xl shadow-purple-500/10">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="w-6 h-6 text-purple-400" />
            <h3 className="text-xl font-bold text-white">Modifications & Termination</h3>
          </div>
          <div className="space-y-4 text-gray-300 text-sm">
            <p>
              <strong>Terms Updates:</strong> We reserve the right to modify these terms at any time. Users will be notified of significant changes, and continued use constitutes acceptance of the updated terms.
            </p>
            <p>
              <strong>Service Termination:</strong> We may terminate or suspend your account and access to the service immediately, without prior notice, for conduct that we believe violates these terms or is harmful to other users or the service.
            </p>
            <p>
              <strong>Effective Date:</strong> These terms are effective as of January 15, 2025.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}