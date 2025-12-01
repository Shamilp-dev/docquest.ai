'use client';

import React, { useState } from 'react';
import { X, User, Lock, Database, LogOut, Check, AlertCircle, Loader2, Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';


interface SettingsModalProps {
  user: {
    id: string;
    email: string;
    username: string;
    avatar?: string;
  };
  onClose: () => void;
  darkMode: boolean;
  onProfileUpdate?: (updatedUser: { username: string; avatar: string }) => void;
}

type Section = 'profile' | 'security' | 'data';

const avatarOptions = [
  '/avatars/avatar1.png',
  '/avatars/avatar2.png',
  '/avatars/avatar3.png',
  '/avatars/avatar4.png',
];

export default function SettingsModal({ user, onClose, darkMode, onProfileUpdate }: SettingsModalProps) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<Section>('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile state
  const [username, setUsername] = useState(user.username);
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar || '');

  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleUpdateProfile = async () => {
    if (!username.trim()) {
      showMessage('error', 'Username cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, avatar: selectedAvatar })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      showMessage('success', 'Profile updated successfully!');
      
      // Notify parent component to update the user state
      if (onProfileUpdate) {
        onProfileUpdate({ username, avatar: selectedAvatar });
      }
    } catch (error: any) {
      showMessage('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showMessage('error', 'All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage('error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      showMessage('error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      showMessage('success', 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      showMessage('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    if (!confirm('Are you sure you want to delete ALL your documents? This action cannot be undone!')) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/profile/clear-data', {
        method: 'DELETE'
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to clear data');
      }

      showMessage('success', `Successfully deleted ${data.deletedCount} document(s)`);
      
      // Refresh page to update document list
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      showMessage('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setShowLogoutModal(false);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const renderProfileSection = () => (
    <div className="space-y-3 md:space-y-6">
      <div>
        <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
          Profile Settings
        </h2>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Update your personal information and avatar
        </p>
      </div>

      {/* Avatar Selection */}
      <div>
        <label className={` block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
          Choose Avatar
        </label>
        <div className="grid grid-cols-4 gap-3 md:gap-4 justify-items-center max-w-md mx-auto">
          {avatarOptions.map((avatar) => (
            <button
              key={avatar}
              onClick={() => setSelectedAvatar(avatar)}
              className={`relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                selectedAvatar === avatar
                  ? 'border-purple-600 ring-4 ring-purple-200 dark:ring-purple-900'
                  : darkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-purple-600'
              }`}
            >
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                  {username.charAt(0).toUpperCase()}
                </div>
              )}
              {selectedAvatar === avatar && (
                <div className="absolute inset-0 bg-purple-600/20 flex items-center justify-center">
                  <Check className="w-6 h-6 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Username */}
      <div>
        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
          Username
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={`w-full px-4 py-2 rounded-lg border ${
            darkMode
              ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
              : 'bg-white border-gray-300 text-gray-900 focus:border-purple-600'
          } focus:ring-2 focus:ring-purple-200 outline-none transition-colors`}
          placeholder="Your username"
        />
      </div>

      {/* Email (read-only) */}
      <div>
        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
          Email
        </label>
        <input
          type="email"
          value={user.email}
          disabled
          className={`w-full px-4 py-2 rounded-lg border ${
            darkMode
              ? 'bg-gray-800 border-gray-700 text-gray-400'
              : 'bg-gray-100 border-gray-300 text-gray-500'
          } cursor-not-allowed`}
        />
        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          Email cannot be changed
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleUpdateProfile}
          disabled={loading}
          className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="w-5 h-5 " />
              Save Changes
            </>
          )}
        </button>
        
        {/* Mobile Logout Button */}
        <button
          onClick={() => setShowLogoutModal(true)}
          className="md:hidden px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="space-y-6">
      <div>
        <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
          Security Settings
        </h2>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Update your password and security preferences
        </p>
      </div>

      {/* Current Password */}
      <div>
        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
          Current Password
        </label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className={`w-full px-4 py-2 rounded-lg border ${
            darkMode
              ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
              : 'bg-white border-gray-300 text-gray-900 focus:border-purple-600'
          } focus:ring-2 focus:ring-purple-200 outline-none transition-colors`}
          placeholder="Enter current password"
        />
      </div>

      {/* New Password */}
      <div>
        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
          New Password
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className={`w-full px-4 py-2 rounded-lg border ${
            darkMode
              ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
              : 'bg-white border-gray-300 text-gray-900 focus:border-purple-600'
          } focus:ring-2 focus:ring-purple-200 outline-none transition-colors`}
          placeholder="Enter new password"
        />
      </div>

      {/* Confirm Password */}
      <div>
        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
          Confirm New Password
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={`w-full px-4 py-2 rounded-lg border ${
            darkMode
              ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
              : 'bg-white border-gray-300 text-gray-900 focus:border-purple-600'
          } focus:ring-2 focus:ring-purple-200 outline-none transition-colors`}
          placeholder="Confirm new password"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleChangePassword}
          disabled={loading}
          className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Changing Password...
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              Change Password
            </>
          )}
        </button>
        
        {/* Mobile Logout Button */}
        <button
          onClick={() => setShowLogoutModal(true)}
          className="md:hidden px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const renderDataSection = () => (
    <div className="space-y-6">
      <div>
        <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
          Data Management
        </h2>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Manage your account data and documents
        </p>
      </div>

      {/* Clear All Data */}
      <div className={`p-4 rounded-lg border-2 ${
        darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-start gap-3">
          <AlertCircle className={`w-5 h-5 mt-0.5 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
          <div className="flex-1">
            <h3 className={`font-medium ${darkMode ? 'text-red-400' : 'text-red-900'} mb-1`}>
              Clear All Data
            </h3>
            <p className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-700'} mb-3`}>
              This will permanently delete all your uploaded documents. This action cannot be undone.
            </p>
            <button
              onClick={handleClearData}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  Delete All Documents
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className={`${
        darkMode ? 'bg-gray-900' : 'bg-white'
      } rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] md:max-h-[90vh] md:h-[600px] flex flex-col md:flex-row overflow-hidden`}>
        
        {/* Left Sidebar */}
        <div className={`w-full md:w-64 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} md:border-r border-b md:border-b-0 flex flex-col`}>
          <div className="p-4 md:p-6">
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Settings
            </h2>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
            <button
              onClick={() => setActiveSection('profile')}
              className={`flex-shrink-0 md:w-full flex items-center gap-3 px-3 py-2.5 rounded-lg md:mb-1 transition-colors cursor-pointer ${
                activeSection === 'profile'
                  ? darkMode
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-600 text-white'
                  : darkMode
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="font-medium">Profile</span>
            </button>

            <button
              onClick={() => setActiveSection('security')}
              className={`flex-shrink-0 md:w-full flex items-center gap-3 px-3 py-2.5 rounded-lg md:mb-1 transition-colors cursor-pointer ${
                activeSection === 'security'
                  ? darkMode
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-600 text-white'
                  : darkMode
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Lock className="w-5 h-5" />
              <span className="font-medium">Security</span>
            </button>

            <button
              onClick={() => setActiveSection('data')}
              className={`flex-shrink-0 md:w-full flex items-center gap-3 px-3 py-2.5 rounded-lg md:mb-1 transition-colors cursor-pointer ${
                activeSection === 'data'
                  ? darkMode
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-600 text-white'
                  : darkMode
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Database className="w-5 h-5" />
              <span className="font-medium">Data</span>
            </button>
          </nav>

          {/* Logout Button at Bottom */}
          <div className="hidden md:block p-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowLogoutModal(true)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                darkMode
                  ? 'text-red-400 hover:bg-red-900/20'
                  : 'text-red-600 hover:bg-red-50'
              }`}
            >
              <LogOut className="w-5 h-5 " />
              <span className="font-medium cursor-pointer">Logout</span>
            </button>
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className={`px-4 md:px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
            <div className="flex items-center gap-3">
  {/* Avatar */}
  <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
    {selectedAvatar ? (
      <img
        src={selectedAvatar}
        alt="User Avatar"
        className="w-full h-full object-cover"
      />
    ) : (
      <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
        {username.charAt(0).toUpperCase()}
      </div>
    )}
  </div>

  {/* Username + Email */}
  <div>
    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      {username}
    </p>
    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
      {user.email}
    </p>
  </div>
</div>


            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600 cursor-pointer'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Message Banner */}
          {message && (
            <div className={`mx-4 md:mx-6 mt-4 p-4 rounded-lg border ${
              message.type === 'success'
                ? darkMode
                  ? 'bg-green-900/20 border-green-800 text-green-400'
                  : 'bg-green-50 border-green-200 text-green-800'
                : darkMode
                ? 'bg-red-900/20 border-red-800 text-red-400'
                : 'bg-red-50 border-red-200 text-red-800'
            } flex items-center gap-2`}>
              {message.type === 'success' ? (
                <Check className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-8">
            {activeSection === 'profile' && renderProfileSection()}
            {activeSection === 'security' && renderSecuritySection()}
            {activeSection === 'data' && renderDataSection()}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm ">
          <div className={`${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } rounded-xl shadow-2xl p-6 max-w-md w-full mx-4`}>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <LogOut className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                  Confirm Logout
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Are you sure you want to log out? You will need to log in again to access your documents.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  darkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors cursor-pointer"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
