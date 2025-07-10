import React from 'react';
import {
  InboxIcon,
  PaperAirplaneIcon,
  DocumentIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  StarIcon,
  TagIcon,
  FunnelIcon,
  ClockIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { GMAIL_LABELS, FILTER_OPTIONS } from '../../utils/constants';

const Sidebar = ({ 
  selectedLabel, 
  onLabelSelect, 
  selectedFilter, 
  onFilterSelect, 
  labels = [],
  unreadCounts = {},
  isLoading = false,
  showImportant = false,
  onShowImportantToggle
}) => {
  const defaultLabels = [
    { id: GMAIL_LABELS.INBOX, name: 'Inbox', icon: InboxIcon },
    { id: GMAIL_LABELS.SENT, name: 'Sent', icon: PaperAirplaneIcon },
    { id: GMAIL_LABELS.DRAFT, name: 'Drafts', icon: DocumentIcon },
    { id: GMAIL_LABELS.STARRED, name: 'Starred', icon: StarIcon },
    { id: GMAIL_LABELS.TRASH, name: 'Trash', icon: TrashIcon },
    { id: GMAIL_LABELS.SPAM, name: 'Spam', icon: ExclamationTriangleIcon }
  ];

  const filterOptions = [
    { id: FILTER_OPTIONS.ALL, name: 'All Messages', icon: InboxIcon },
    { id: FILTER_OPTIONS.UNREAD, name: 'Unread', icon: InboxIcon },
    { id: FILTER_OPTIONS.STARRED, name: 'Starred', icon: StarIcon },
    { id: FILTER_OPTIONS.IMPORTANT, name: 'Important', icon: ExclamationTriangleIcon },
    { id: FILTER_OPTIONS.TODAY, name: 'Today', icon: ClockIcon },
    { id: FILTER_OPTIONS.WEEK, name: 'This Week', icon: CalendarDaysIcon },
    { id: FILTER_OPTIONS.MONTH, name: 'This Month', icon: CalendarDaysIcon }
  ];

  const getUnreadCount = (labelId) => {
    return unreadCounts[labelId] || 0;
  };

  const renderLabelItem = (label, isCustomLabel = false) => {
    const Icon = label.icon;
    const isSelected = selectedLabel === label.id;
    const unreadCount = getUnreadCount(label.id);

    return (
      <button
        key={label.id}
        onClick={() => onLabelSelect(label.id)}
        className={`sidebar-nav-item w-full ${
          isSelected ? 'sidebar-nav-item-active' : 'sidebar-nav-item-inactive'
        }`}
        disabled={isLoading}
      >
        <Icon className="h-5 w-5 mr-3" />
        <span className="flex-1 text-left">{label.name}</span>
        {unreadCount > 0 && (
          <span className="ml-auto bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
    );
  };

  const renderFilterItem = (filter) => {
    const Icon = filter.icon;
    const isSelected = selectedFilter === filter.id;

    return (
      <button
        key={filter.id}
        onClick={() => onFilterSelect(filter.id)}
        className={`sidebar-nav-item w-full ${
          isSelected ? 'sidebar-nav-item-active' : 'sidebar-nav-item-inactive'
        }`}
        disabled={isLoading}
      >
        <Icon className="h-5 w-5 mr-3" />
        <span className="flex-1 text-left">{filter.name}</span>
      </button>
    );
  };

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* AI Important Messages */}
        <div>
          <button
            onClick={onShowImportantToggle}
            className={`w-full flex items-center justify-center px-4 py-3 rounded-lg transition-all duration-200 ${
              showImportant 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                : 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 hover:from-purple-200 hover:to-blue-200'
            }`}
            disabled={isLoading}
          >
            <SparklesIcon className="h-5 w-5 mr-2" />
            <span className="font-medium">Today's Important</span>
          </button>
        </div>

        {/* Main Labels */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <TagIcon className="h-4 w-4 mr-2" />
            Labels
          </h3>
          <nav className="sidebar-nav">
            {defaultLabels.map((label) => renderLabelItem(label))}
          </nav>
        </div>

        {/* Custom Labels */}
        {labels.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Custom Labels</h3>
            <nav className="sidebar-nav">
              {labels
                .filter(label => !defaultLabels.find(dl => dl.id === label.id))
                .map((label) => renderLabelItem({
                  id: label.id,
                  name: label.name,
                  icon: TagIcon
                }, true))}
            </nav>
          </div>
        )}

        {/* Filters */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filters
          </h3>
          <nav className="sidebar-nav">
            {filterOptions.map((filter) => renderFilterItem(filter))}
          </nav>
        </div>

        {/* AI Insights */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <ChartBarIcon className="h-4 w-4 mr-2" />
            AI Insights
          </h3>
          <div className="space-y-2">
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Important</span>
                <span className="text-xs text-gray-500">12 new</span>
              </div>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-600 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Urgent</span>
                <span className="text-xs text-gray-500">3 new</span>
              </div>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;