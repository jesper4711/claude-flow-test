import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import MessageCard from './MessageCard';
import LoadingSpinner from '../UI/LoadingSpinner';
import { UI_CONSTANTS } from '../../utils/constants';

const MessageList = ({ 
  messages = [], 
  isLoading = false, 
  error = null,
  selectedMessageId = null,
  onMessageSelect,
  onMessageAction,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  pageToken = null,
  nextPageToken = null,
  onRefresh
}) => {
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Reset selection when messages change
  useEffect(() => {
    setSelectedMessages(new Set());
    setSelectAll(false);
  }, [messages]);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedMessages(new Set());
    } else {
      setSelectedMessages(new Set(messages.map(msg => msg.id)));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectMessage = (messageId) => {
    const newSelected = new Set(selectedMessages);
    if (newSelected.has(messageId)) {
      newSelected.delete(messageId);
    } else {
      newSelected.add(messageId);
    }
    setSelectedMessages(newSelected);
    setSelectAll(newSelected.size === messages.length);
  };

  const handleBulkAction = async (action) => {
    if (selectedMessages.size === 0) return;
    
    try {
      await onMessageAction({
        action,
        messageIds: Array.from(selectedMessages)
      });
      setSelectedMessages(new Set());
      setSelectAll(false);
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (nextPageToken && currentPage < totalPages) {
      onPageChange(currentPage + 1, nextPageToken);
    }
  };

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={onRefresh}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header with bulk actions */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                {selectedMessages.size > 0 
                  ? `${selectedMessages.size} selected` 
                  : `${messages.length} messages`
                }
              </span>
            </div>

            {selectedMessages.size > 0 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="btn btn-outline btn-sm"
                >
                  Delete
                </button>
                <button
                  onClick={() => handleBulkAction('markAsRead')}
                  className="btn btn-outline btn-sm"
                >
                  Mark as Read
                </button>
                <button
                  onClick={() => handleBulkAction('markAsUnread')}
                  className="btn btn-outline btn-sm"
                >
                  Mark as Unread
                </button>
                <button
                  onClick={() => handleBulkAction('star')}
                  className="btn btn-outline btn-sm"
                >
                  Star
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="btn btn-outline btn-sm"
            >
              {isLoading ? <LoadingSpinner size="small" /> : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && messages.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="large" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-gray-500 mb-4">No messages found</p>
              <button
                onClick={onRefresh}
                className="btn btn-primary"
              >
                Refresh
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-1 p-4">
            {messages.map((message) => (
              <MessageCard
                key={message.id}
                message={message}
                isSelected={selectedMessages.has(message.id)}
                isActive={selectedMessageId === message.id}
                onSelect={handleSelectMessage}
                onClick={() => onMessageSelect(message.id)}
                onAction={onMessageAction}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {messages.length > 0 && (
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {messages.length} messages
              {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1 || isLoading}
                className="pagination-button rounded-l-md"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              
              <span className="px-4 py-2 text-sm text-gray-700">
                {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={handleNextPage}
                disabled={!nextPageToken || currentPage >= totalPages || isLoading}
                className="pagination-button rounded-r-md"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageList;