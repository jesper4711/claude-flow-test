import React, { useState, useEffect } from 'react';
import { SparklesIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import MessageCard from '../Email/MessageCard';
import LoadingSpinner from '../UI/LoadingSpinner';
import ImportanceScore from '../AI/ImportanceScore';
import { apiService } from '../../services/api';
import { toast } from 'react-hot-toast';

const ImportantMessages = ({ onMessageSelect, onMessageAction }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [minImportance, setMinImportance] = useState(7);
  const [stats, setStats] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState(new Set());

  useEffect(() => {
    loadImportantMessages();
  }, [minImportance]);

  const loadImportantMessages = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getTodayImportantMessages(minImportance);
      
      if (response.success) {
        setMessages(response.messages);
        setStats({
          total: response.totalMessages,
          important: response.importantMessages,
          threshold: response.threshold
        });
      }
    } catch (error) {
      console.error('Error loading important messages:', error);
      toast.error('Failed to load important messages');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessageSelect = (messageId) => {
    const newSelected = new Set(selectedMessages);
    if (newSelected.has(messageId)) {
      newSelected.delete(messageId);
    } else {
      newSelected.add(messageId);
    }
    setSelectedMessages(newSelected);
  };

  const handleThresholdChange = (e) => {
    setMinImportance(parseInt(e.target.value));
  };

  const renderInsights = () => {
    if (!messages.length) return null;

    const criticalCount = messages.filter(m => m.aiAnalysis?.importance?.importance >= 9).length;
    const hasDeadlines = messages.filter(m => m.aiAnalysis?.actionItems?.hasDeadlines).length;
    const requiresResponse = messages.filter(m => m.aiAnalysis?.actionItems?.requiresResponse).length;

    return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-4">
        <div className="flex items-start space-x-3">
          <SparklesIcon className="h-6 w-6 text-purple-600 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-purple-900 mb-2">
              AI Insights for Today
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              {criticalCount > 0 && (
                <div className="bg-red-100 rounded-md p-2">
                  <span className="font-medium text-red-800">{criticalCount} Critical</span>
                  <span className="text-red-700"> emails need immediate attention</span>
                </div>
              )}
              {hasDeadlines > 0 && (
                <div className="bg-orange-100 rounded-md p-2">
                  <span className="font-medium text-orange-800">{hasDeadlines} emails</span>
                  <span className="text-orange-700"> contain deadlines</span>
                </div>
              )}
              {requiresResponse > 0 && (
                <div className="bg-blue-100 rounded-md p-2">
                  <span className="font-medium text-blue-800">{requiresResponse} emails</span>
                  <span className="text-blue-700"> require your response</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Today's Important Messages
            </h2>
            {stats && (
              <p className="text-sm text-gray-600 mt-1">
                Showing {stats.important} of {stats.total} messages with importance ≥ {stats.threshold}
              </p>
            )}
          </div>
          
          {/* Importance Threshold Slider */}
          <div className="flex items-center space-x-3">
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-400" />
            <label className="text-sm text-gray-600">
              Min Importance:
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={minImportance}
              onChange={handleThresholdChange}
              className="w-32"
            />
            <span className="text-sm font-medium text-gray-900 w-8">
              {minImportance}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {renderInsights()}
        
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <SparklesIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No important messages for today
            </h3>
            <p className="text-sm text-gray-600">
              Try lowering the importance threshold to see more messages
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((message) => (
              <MessageCard
                key={message.id}
                message={message}
                isSelected={selectedMessages.has(message.id)}
                onSelect={handleMessageSelect}
                onClick={() => onMessageSelect(message.id)}
                onAction={onMessageAction}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportantMessages;