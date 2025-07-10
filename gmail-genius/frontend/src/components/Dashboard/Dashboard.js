import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import Header from '../Layout/Header';
import Sidebar from '../Layout/Sidebar';
import MessageList from '../Email/MessageList';
import MessageDetail from '../Email/MessageDetail';
import ImportantMessages from './ImportantMessages';
import { apiService } from '../../services/api';
import { 
  GMAIL_LABELS, 
  FILTER_OPTIONS, 
  UI_CONSTANTS, 
  ERROR_MESSAGES,
  SUCCESS_MESSAGES 
} from '../../utils/constants';

const Dashboard = ({ user, onLogout }) => {
  // State management
  const [messages, setMessages] = useState([]);
  const [labels, setLabels] = useState([]);
  const [selectedLabel, setSelectedLabel] = useState(GMAIL_LABELS.INBOX);
  const [selectedFilter, setSelectedFilter] = useState(FILTER_OPTIONS.ALL);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageToken, setPageToken] = useState(null);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [showImportant, setShowImportant] = useState(false);
  
  // Loading states
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingMessage, setIsLoadingMessage] = useState(false);
  const [isLoadingLabels, setIsLoadingLabels] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Error states
  const [error, setError] = useState(null);

  // Load initial data
  useEffect(() => {
    loadLabels();
    loadMessages();
  }, []);

  // Load messages when label/filter changes
  useEffect(() => {
    if (!showImportant) {
      loadMessages();
    }
  }, [selectedLabel, selectedFilter, showImportant]);

  // Search messages
  useEffect(() => {
    if (searchQuery) {
      searchMessages();
    } else {
      loadMessages();
    }
  }, [searchQuery]);

  // Auto-refresh messages
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoadingMessages && !selectedMessageId) {
        loadMessages(true); // Silent refresh
      }
    }, UI_CONSTANTS.REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isLoadingMessages, selectedMessageId]);

  const loadLabels = async () => {
    try {
      setIsLoadingLabels(true);
      const response = await apiService.getLabels();
      
      if (response.success) {
        setLabels(response.labels);
        
        // Calculate unread counts
        const counts = {};
        response.labels.forEach(label => {
          counts[label.id] = label.messagesUnread || 0;
        });
        setUnreadCounts(counts);
      }
    } catch (error) {
      console.error('Error loading labels:', error);
      toast.error(ERROR_MESSAGES.FETCH_ERROR);
    } finally {
      setIsLoadingLabels(false);
    }
  };

  const loadMessages = async (silent = false) => {
    try {
      if (!silent) {
        setIsLoadingMessages(true);
        setError(null);
      }
      
      const options = {
        labelIds: [selectedLabel],
        maxResults: UI_CONSTANTS.MESSAGES_PER_PAGE,
        pageToken: currentPage > 1 ? pageToken : null
      };
      
      // Apply filters
      if (selectedFilter !== FILTER_OPTIONS.ALL) {
        switch (selectedFilter) {
          case FILTER_OPTIONS.UNREAD:
            options.q = 'is:unread';
            break;
          case FILTER_OPTIONS.STARRED:
            options.q = 'is:starred';
            break;
          case FILTER_OPTIONS.IMPORTANT:
            options.q = 'is:important';
            break;
          case FILTER_OPTIONS.TODAY:
            options.q = 'newer_than:1d';
            break;
          case FILTER_OPTIONS.WEEK:
            options.q = 'newer_than:7d';
            break;
          case FILTER_OPTIONS.MONTH:
            options.q = 'newer_than:30d';
            break;
        }
      }
      
      const response = await apiService.getMessages(options);
      
      if (response.success) {
        setMessages(response.messages || []);
        setNextPageToken(response.nextPageToken);
        
        if (!silent) {
          // Update unread counts
          await loadLabels();
        }
      } else {
        setError(response.error || ERROR_MESSAGES.FETCH_ERROR);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setError(ERROR_MESSAGES.FETCH_ERROR);
      
      if (!silent) {
        toast.error(ERROR_MESSAGES.FETCH_ERROR);
      }
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const searchMessages = useCallback(async () => {
    if (!searchQuery.trim()) {
      loadMessages();
      return;
    }
    
    try {
      setIsSearching(true);
      setError(null);
      
      const response = await apiService.searchMessages(searchQuery, {
        maxResults: UI_CONSTANTS.MESSAGES_PER_PAGE
      });
      
      if (response.success) {
        setMessages(response.messages || []);
        setNextPageToken(response.nextPageToken);
      } else {
        setError(response.error || ERROR_MESSAGES.FETCH_ERROR);
      }
    } catch (error) {
      console.error('Error searching messages:', error);
      setError(ERROR_MESSAGES.FETCH_ERROR);
      toast.error(ERROR_MESSAGES.FETCH_ERROR);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const loadMessage = async (messageId) => {
    try {
      setIsLoadingMessage(true);
      const response = await apiService.getMessage(messageId);
      
      if (response.success) {
        setSelectedMessage(response.message);
        
        // Mark as read if unread
        if (response.message.isUnread) {
          await handleMessageAction({
            action: 'markAsRead',
            messageId: messageId
          });
        }
      } else {
        toast.error(response.error || ERROR_MESSAGES.FETCH_ERROR);
      }
    } catch (error) {
      console.error('Error loading message:', error);
      toast.error(ERROR_MESSAGES.FETCH_ERROR);
    } finally {
      setIsLoadingMessage(false);
    }
  };

  const handleLabelSelect = (labelId) => {
    setSelectedLabel(labelId);
    setSelectedMessageId(null);
    setSelectedMessage(null);
    setCurrentPage(1);
    setPageToken(null);
    setSearchQuery('');
    setShowImportant(false);
  };

  const handleFilterSelect = (filterId) => {
    setSelectedFilter(filterId);
    setSelectedMessageId(null);
    setSelectedMessage(null);
    setCurrentPage(1);
    setPageToken(null);
    setShowImportant(false);
  };

  const handleMessageSelect = (messageId) => {
    setSelectedMessageId(messageId);
    loadMessage(messageId);
  };

  const handleMessageAction = async ({ action, messageId, messageIds }) => {
    try {
      let result;
      
      switch (action) {
        case 'star':
          result = await apiService.modifyMessage(messageId, {
            addLabelIds: [GMAIL_LABELS.STARRED]
          });
          break;
          
        case 'unstar':
          result = await apiService.modifyMessage(messageId, {
            removeLabelIds: [GMAIL_LABELS.STARRED]
          });
          break;
          
        case 'markAsRead':
          result = await apiService.modifyMessage(messageId, {
            removeLabelIds: [GMAIL_LABELS.UNREAD]
          });
          break;
          
        case 'markAsUnread':
          result = await apiService.modifyMessage(messageId, {
            addLabelIds: [GMAIL_LABELS.UNREAD]
          });
          break;
          
        case 'delete':
          result = await apiService.deleteMessage(messageId);
          break;
          
        default:
          if (messageIds && messageIds.length > 0) {
            // Batch operation
            const labelChanges = {
              addLabelIds: [],
              removeLabelIds: []
            };
            
            switch (action) {
              case 'markAsRead':
                labelChanges.removeLabelIds = [GMAIL_LABELS.UNREAD];
                break;
              case 'markAsUnread':
                labelChanges.addLabelIds = [GMAIL_LABELS.UNREAD];
                break;
              case 'star':
                labelChanges.addLabelIds = [GMAIL_LABELS.STARRED];
                break;
              case 'delete':
                // For batch delete, we need to handle each message individually
                for (const id of messageIds) {
                  await apiService.deleteMessage(id);
                }
                result = { success: true };
                break;
            }
            
            if (action !== 'delete') {
              result = await apiService.batchModifyMessages(messageIds, labelChanges);
            }
          }
          break;
      }
      
      if (result && result.success) {
        // Refresh messages and labels
        await loadMessages();
        await loadLabels();
        
        // If current message was deleted, go back to list
        if (action === 'delete' && messageId === selectedMessageId) {
          setSelectedMessageId(null);
          setSelectedMessage(null);
        }
        
        toast.success(SUCCESS_MESSAGES.LABELS_UPDATED);
      }
    } catch (error) {
      console.error('Error performing message action:', error);
      toast.error(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
  };

  const handlePageChange = (page, token = null) => {
    setCurrentPage(page);
    setPageToken(token);
  };

  const handleBackToList = () => {
    setSelectedMessageId(null);
    setSelectedMessage(null);
  };

  const handleRefresh = () => {
    loadMessages();
    loadLabels();
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
    setPageToken(null);
    setShowImportant(false);
  };
  
  const handleShowImportantToggle = () => {
    setShowImportant(!showImportant);
    setSelectedMessageId(null);
    setSelectedMessage(null);
  };

  const handleReply = (message) => {
    // TODO: Implement reply functionality
    toast.info('Reply functionality coming soon!');
  };

  const handleForward = (message) => {
    // TODO: Implement forward functionality
    toast.info('Forward functionality coming soon!');
  };

  return (
    <div className="h-screen flex flex-col">
      <Header 
        user={user} 
        onLogout={onLogout}
        onSearch={handleSearch}
        searchQuery={searchQuery}
        isSearching={isSearching}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar 
          selectedLabel={selectedLabel}
          onLabelSelect={handleLabelSelect}
          selectedFilter={selectedFilter}
          onFilterSelect={handleFilterSelect}
          labels={labels}
          unreadCounts={unreadCounts}
          isLoading={isLoadingLabels}
          showImportant={showImportant}
          onShowImportantToggle={handleShowImportantToggle}
        />
        
        {selectedMessageId ? (
          <MessageDetail 
            message={selectedMessage}
            isLoading={isLoadingMessage}
            onBack={handleBackToList}
            onAction={handleMessageAction}
            onReply={handleReply}
            onForward={handleForward}
          />
        ) : showImportant ? (
          <ImportantMessages
            onMessageSelect={handleMessageSelect}
            onMessageAction={handleMessageAction}
          />
        ) : (
          <MessageList 
            messages={messages}
            isLoading={isLoadingMessages}
            error={error}
            selectedMessageId={selectedMessageId}
            onMessageSelect={handleMessageSelect}
            onMessageAction={handleMessageAction}
            currentPage={currentPage}
            nextPageToken={nextPageToken}
            onPageChange={handlePageChange}
            onRefresh={handleRefresh}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;