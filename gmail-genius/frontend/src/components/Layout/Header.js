import React, { useState } from 'react';
import { MagnifyingGlassIcon, BellIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import Profile from '../Auth/Profile';
import LoadingSpinner from '../UI/LoadingSpinner';

const Header = ({ user, onLogout, onSearch, searchQuery, isSearching }) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || '');
  const [searchTimeout, setSearchTimeout] = useState(null);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearchQuery(value);

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for debounced search
    const newTimeout = setTimeout(() => {
      onSearch(value);
    }, 300);

    setSearchTimeout(newTimeout);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    onSearch(localSearchQuery);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Gmail Genius</h1>
              <p className="text-xs text-gray-500">AI-powered email management</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {isSearching ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <input
                type="text"
                className="search-input"
                placeholder="Search emails..."
                value={localSearchQuery}
                onChange={handleSearchChange}
              />
            </form>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200">
              <BellIcon className="h-6 w-6" />
            </button>

            {/* Settings */}
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200">
              <Cog6ToothIcon className="h-6 w-6" />
            </button>

            {/* Profile */}
            <Profile user={user} onLogout={onLogout} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;