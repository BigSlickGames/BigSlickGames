import React, { useState } from 'react';
import { ArrowLeft, User, Bell, Shield, Save, Database } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  chips: number;
  created_at: string;
  country?: string | null;
  level?: number;
  experience?: number;
}

interface ProfileSettingsProps {
  profile: UserProfile;
  onBack: () => void;
  onProfileUpdate: (updatedProfile: UserProfile) => void;
}

export default function ProfileSettings({ profile, onBack, onProfileUpdate }: ProfileSettingsProps) {
  const [username, setUsername] = useState(profile.username);
  const [country, setCountry] = useState(profile.country || '');
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    try {
      // Update local profile state
      const updatedProfile = {
        ...profile,
        username,
        country: country || null
      };
      
      onProfileUpdate(updatedProfile);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error updating profile. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

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
        <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">Profile Settings</h2>
        <p className="text-gray-400 text-sm sm:text-lg">Customize your gaming experience</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-center ${
          message.includes('successfully') 
            ? 'bg-green-500/20 border border-green-500/30 text-green-400' 
            : 'bg-red-500/20 border border-red-500/30 text-red-400'
        }`}>
          {message}
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        {/* Profile Information */}
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-6 shadow-xl shadow-orange-500/10">
          <div className="flex items-center space-x-3 mb-6">
            <User className="w-6 h-6 text-orange-400" />
            <h3 className="text-xl font-bold text-white">Profile Information</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 transition-all"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Country (Optional)</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 transition-all"
                placeholder="Enter your country"
              />
            </div>

            <div className="pt-4">
              <div className="flex items-center space-x-3 mb-2">
                <Bell className="w-5 h-5 text-orange-400" />
                <span className="text-white font-medium">Notifications</span>
              </div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="w-5 h-5 text-orange-500 bg-gray-800 border-gray-600 rounded focus:ring-orange-500"
                />
                <span className="text-gray-400">Enable push notifications</span>
              </label>
            </div>

            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-white font-medium">🔊 Sound Effects</span>
              </div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="w-5 h-5 text-orange-500 bg-gray-800 border-gray-600 rounded focus:ring-orange-500"
                />
                <span className="text-gray-400">Enable sound effects</span>
              </label>
            </div>
          </div>
        </div>

        {/* Account Security */}
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-6 shadow-xl shadow-orange-500/10 mt-8">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="w-6 h-6 text-orange-400" />
            <h3 className="text-xl font-bold text-white">Account Security</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <p className="text-gray-400 text-sm mb-1">Account Created</p>
              <p className="text-white font-semibold">{new Date(profile.created_at).toLocaleDateString()}</p>
            </div>
            
            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <p className="text-gray-400 text-sm mb-1">Last Login</p>
              <p className="text-white font-semibold">{new Date(profile.last_login).toLocaleDateString()}</p>
            </div>
            
            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <p className="text-gray-400 text-sm mb-1">Account Status</p>
              <p className="text-green-400 font-semibold">Active</p>
            </div>
          </div>
        </div>


        {/* Save Button */}
        <div className="text-center">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-400/20 flex items-center space-x-2 mx-auto"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}