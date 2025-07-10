import React, { useState } from 'react';
import { ChevronDownIcon, ArrowRightOnRectangleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { authService } from '../../services/auth';
import toast from 'react-hot-toast';
import LoadingSpinner from '../UI/LoadingSpinner';

const Profile = ({ user, onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      toast.success('Logged out successfully!');
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
    } finally {
      setIsLoading(false);
      setShowDropdown(false);
    }
  };

  const handleRevokeAccess = async () => {
    if (!window.confirm('Are you sure you want to revoke access? This will log you out and remove all permissions.')) {
      return;
    }

    try {
      setIsLoading(true);
      await authService.revokeTokens();
      toast.success('Access revoked successfully!');
      onLogout();
    } catch (error) {
      console.error('Revoke access error:', error);
      toast.error('Error revoking access');
    } finally {
      setIsLoading(false);
      setShowDropdown(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-3 text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors duration-200"
        disabled={isLoading}
      >
        <img
          className="h-8 w-8 rounded-full"
          src={user.picture || '/default-avatar.png'}
          alt={user.name || user.email}
          onError={(e) => {
            e.target.src = '/default-avatar.png';
          }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {user.name || 'User'}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {user.email}
          </p>
        </div>
        {isLoading ? (
          <LoadingSpinner size="small" />
        ) : (
          <ChevronDownIcon className="h-4 w-4 text-gray-400" />
        )}
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          <div className="dropdown-menu">
            <div className="px-4 py-3 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-900">
                {user.name || 'User'}
              </p>
              <p className="text-xs text-gray-500">
                {user.email}
              </p>
            </div>
            
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="dropdown-item w-full text-left flex items-center space-x-3"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              <span>Sign out</span>
            </button>
            
            <button
              onClick={handleRevokeAccess}
              disabled={isLoading}
              className="dropdown-item w-full text-left flex items-center space-x-3 text-red-600 hover:bg-red-50"
            >
              <TrashIcon className="h-4 w-4" />
              <span>Revoke access</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;