import React from 'react';
import { ArrowLeft, Users, Heart, Shield, AlertTriangle, Ban, Clock, Trash2, Flag, MessageCircle } from 'lucide-react';

interface CommunityRulesProps {
  onBack: () => void;
}

export default function CommunityRules({ onBack }: CommunityRulesProps) {
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
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/50">
          <Users className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">Community Rules</h2>
        <p className="text-gray-400 text-sm sm:text-lg">Building a safe, fun, and respectful gaming community</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-gradient-to-br from-green-800/20 to-emerald-900/20 border border-green-500/30 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Heart className="w-6 h-6 text-green-400" />
            <h3 className="text-xl font-bold text-green-400">Our Mission</h3>
          </div>
          <div className="text-green-200 space-y-3 text-sm">
            <p>
              GameHub is committed to providing a <strong>family-friendly gaming environment</strong> where players of all ages can enjoy our games safely. We believe that gaming should be fun, inclusive, and free from harassment or inappropriate behavior.
            </p>
            <p>
              Our community thrives on <strong>respect, sportsmanship, and positive interactions</strong>. Every player deserves to feel welcome and safe while gaming with us.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6 shadow-xl shadow-green-500/10">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-6 h-6 text-green-400" />
            <h3 className="text-xl font-bold text-white">Golden Rules</h3>
          </div>
          <div className="space-y-4">
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <h4 className="text-green-300 font-bold mb-2">✅ DO:</h4>
              <ul className="list-disc list-inside space-y-1 text-green-200 text-sm">
                <li><strong>Be Respectful:</strong> Treat all players with kindness and courtesy</li>
                <li><strong>Play Fair:</strong> Follow game rules and maintain good sportsmanship</li>
                <li><strong>Help Others:</strong> Share strategies and welcome new players</li>
                <li><strong>Use Appropriate Language:</strong> Keep all communication family-friendly</li>
                <li><strong>Report Issues:</strong> Help us maintain a safe environment by reporting violations</li>
                <li><strong>Have Fun:</strong> Enjoy the games and celebrate others' successes</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-800/20 to-red-900/20 border border-red-500/30 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Ban className="w-6 h-6 text-red-400" />
            <h3 className="text-xl font-bold text-red-400">STRICTLY PROHIBITED</h3>
          </div>
          <div className="space-y-4">
            <div className="bg-red-900/30 border border-red-500/40 rounded-lg p-4">
              <h4 className="text-red-300 font-bold mb-2">❌ NEVER ALLOWED:</h4>
              <ul className="list-disc list-inside space-y-1 text-red-200 text-sm">
                <li><strong>Swearing or Profanity:</strong> Any offensive language, including abbreviations, symbols, or implied profanity</li>
                <li><strong>Bullying or Harassment:</strong> Intimidating, threatening, or repeatedly targeting other players</li>
                <li><strong>Hate Speech:</strong> Discriminatory language based on race, gender, religion, nationality, or other characteristics</li>
                <li><strong>Sexual Content:</strong> Inappropriate sexual references, images, or discussions</li>
                <li><strong>Personal Attacks:</strong> Insulting or attacking other players personally</li>
                <li><strong>Doxxing:</strong> Sharing personal information about other players</li>
                <li><strong>Cheating:</strong> Using exploits, bots, or unfair advantages</li>
                <li><strong>Spam:</strong> Flooding chat or forums with repetitive messages</li>
                <li><strong>Impersonation:</strong> Pretending to be staff members or other players</li>
                <li><strong>Advertising:</strong> Promoting external services, websites, or products</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-800/20 to-red-900/20 border border-orange-500/30 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-400" />
            <h3 className="text-xl font-bold text-orange-400">ENFORCEMENT POLICY</h3>
          </div>
          <div className="space-y-4">
            <div className="bg-orange-900/30 border border-orange-500/40 rounded-lg p-4">
              <h4 className="text-orange-300 font-bold mb-3 flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>FIRST VIOLATION: 30-Day Suspension</span>
              </h4>
              <div className="space-y-2 text-orange-200 text-sm">
                <p><strong>Immediate Actions:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Account suspended for exactly 30 days</li>
                  <li>All access to games, forum, and chat blocked</li>
                  <li>Violation recorded in permanent account history</li>
                  <li>Email notification sent with violation details</li>
                </ul>
                <p><strong>During Suspension:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Cannot log into any GameHub services</li>
                  <li>Game progress and virtual currency preserved</li>
                  <li>Friends and social features disabled</li>
                  <li>No refunds for any purchases during suspension period</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-red-900/40 border border-red-500/50 rounded-lg p-4">
              <h4 className="text-red-300 font-bold mb-3 flex items-center space-x-2">
                <Trash2 className="w-5 h-5" />
                <span>SECOND VIOLATION: PERMANENT TERMINATION</span>
              </h4>
              <div className="space-y-2 text-red-200 text-sm">
                <p><strong>⚠️ COMPLETE ACCOUNT DESTRUCTION:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Account permanently deleted - NO RECOVERY POSSIBLE</strong></li>
                  <li><strong>ALL game progress lost forever</strong></li>
                  <li><strong>ALL virtual currency forfeited (chips, points, tokens)</strong></li>
                  <li><strong>ALL cards, decks, and collections deleted</strong></li>
                  <li><strong>ALL achievements and trophies removed</strong></li>
                  <li><strong>ALL purchased content lost (NO REFUNDS)</strong></li>
                  <li><strong>ALL premium features and subscriptions cancelled</strong></li>
                  <li><strong>IP address permanently banned</strong></li>
                  <li><strong>Cannot create new accounts</strong></li>
                  <li><strong>All associated email addresses blacklisted</strong></li>
                </ul>
                <div className="mt-3 p-3 bg-red-800/50 border border-red-600/50 rounded">
                  <p className="text-red-100 font-semibold text-center">
                    🚨 THIS IS IRREVERSIBLE - NO APPEALS, NO EXCEPTIONS 🚨
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 shadow-xl shadow-blue-500/10">
          <div className="flex items-center space-x-3 mb-4">
            <Flag className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-bold text-white">Reporting System</h3>
          </div>
          <div className="space-y-4 text-gray-300">
            <div>
              <h4 className="text-white font-semibold mb-2">How to Report Violations:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>In Games:</strong> Use the report button in game menus</li>
                <li><strong>In Forum:</strong> Click the flag icon on posts or comments</li>
                <li><strong>In Chat:</strong> Right-click usernames for report option</li>
                <li><strong>Email:</strong> Send detailed reports to moderation@gamehub.com</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">What to Include in Reports:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Username of the violating player</li>
                <li>Specific rule violation (swearing, bullying, etc.)</li>
                <li>Screenshots or evidence when possible</li>
                <li>Date and time of the incident</li>
                <li>Location where it occurred (which game, forum section, etc.)</li>
              </ul>
            </div>
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
              <p className="text-blue-200 text-sm">
                <strong>⚡ Fast Response:</strong> All reports are reviewed within 24 hours. Serious violations are addressed immediately.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 shadow-xl shadow-purple-500/10">
          <div className="flex items-center space-x-3 mb-4">
            <MessageCircle className="w-6 h-6 text-purple-400" />
            <h3 className="text-xl font-bold text-white">Communication Guidelines</h3>
          </div>
          <div className="space-y-4 text-gray-300">
            <div>
              <h4 className="text-white font-semibold mb-2">Forum & Chat Etiquette:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Stay on topic in forum discussions</li>
                <li>Use clear, descriptive thread titles</li>
                <li>Search before posting to avoid duplicates</li>
                <li>Quote appropriately when replying</li>
                <li>Respect different skill levels and experience</li>
                <li>Keep conversations constructive and helpful</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Image & Content Sharing:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Only share appropriate, game-related images</li>
                <li>No personal photos or identifying information</li>
                <li>Screenshots should be relevant to discussions</li>
                <li>Respect copyright when sharing external content</li>
                <li>Keep file sizes reasonable for other users</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-800/20 to-emerald-900/20 border border-green-500/30 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Heart className="w-6 h-6 text-green-400" />
            <h3 className="text-xl font-bold text-green-400">Building Our Community</h3>
          </div>
          <div className="space-y-4 text-green-200 text-sm">
            <p>
              <strong>We're all here to have fun!</strong> GameHub is more than just games - it's a community of players who share a love for strategic thinking, friendly competition, and good sportsmanship.
            </p>
            <p>
              <strong>Help us grow:</strong> Welcome new players, share your knowledge, celebrate others' achievements, and contribute to a positive gaming environment that everyone can enjoy.
            </p>
            <p>
              <strong>Remember:</strong> Behind every username is a real person who deserves respect and kindness. Let's make GameHub the best gaming community on the internet!
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-gray-500/20 rounded-2xl p-6 shadow-xl shadow-gray-500/10">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-6 h-6 text-gray-400" />
            <h3 className="text-xl font-bold text-white">Questions & Support</h3>
          </div>
          <div className="space-y-4 text-gray-300 text-sm">
            <p>
              <strong>Need Help?</strong> Contact our support team at support@gamehub.com for assistance with games, account issues, or technical problems.
            </p>
            <p>
              <strong>Rule Questions?</strong> If you're unsure whether something violates our rules, ask first! Email moderation@gamehub.com for clarification.
            </p>
            <p>
              <strong>Community Feedback:</strong> We value your input on how to improve our community. Share suggestions at feedback@gamehub.com.
            </p>
            <div className="text-center mt-6 p-4 bg-gray-700/30 rounded-lg">
              <p className="text-white font-semibold">
                🎮 Welcome to GameHub - Let's Play Fair and Have Fun! 🎮
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}