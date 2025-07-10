import React from 'react';
import { 
  StarIcon, 
  PaperClipIcon, 
  ExclamationTriangleIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import ImportanceScore from '../AI/ImportanceScore';
import { formatDate, truncateText, extractTextFromHtml } from '../../utils/helpers';

const MessageCard = ({ 
  message, 
  isSelected = false, 
  isActive = false,
  onSelect,
  onClick,
  onAction
}) => {
  if (!message) return null;

  const {
    id,
    threadId,
    subject = '(No Subject)',
    from = 'Unknown Sender',
    snippet = '',
    date,
    isUnread = false,
    isStarred = false,
    attachments = [],
    labelIds = [],
    aiAnalysis = {}
  } = message;

  // Extract sender name and email from the 'from' field
  const fromMatch = from.match(/^(.*?)\s*<(.+)>$/);
  const senderName = fromMatch ? fromMatch[1].trim() : from.split('@')[0];
  const senderEmail = fromMatch ? fromMatch[2] : from;
  const formattedDate = formatDate(date);
  const cleanSnippet = extractTextFromHtml(snippet);
  const truncatedSnippet = truncateText(cleanSnippet, 120);
  const hasAttachments = attachments && attachments.length > 0;

  const handleCheckboxChange = (e) => {
    e.stopPropagation();
    onSelect(id);
  };

  const handleStarClick = async (e) => {
    e.stopPropagation();
    try {
      await onAction({
        action: isStarred ? 'unstar' : 'star',
        messageId: id
      });
    } catch (error) {
      console.error('Error toggling star:', error);
    }
  };

  const handleMarkAsRead = async (e) => {
    e.stopPropagation();
    try {
      await onAction({
        action: isUnread ? 'markAsRead' : 'markAsUnread',
        messageId: id
      });
    } catch (error) {
      console.error('Error toggling read status:', error);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    try {
      await onAction({
        action: 'delete',
        messageId: id
      });
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const cardClasses = `
    message-card
    ${isUnread ? 'message-card-unread' : ''}
    ${isActive ? 'message-card-selected' : ''}
    ${isSelected ? 'ring-2 ring-blue-500' : ''}
    group
  `;

  return (
    <div className={cardClasses} onClick={onClick}>
      <div className="flex items-start space-x-3">
        {/* Checkbox */}
        <div className="flex items-center pt-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleCheckboxChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>

        {/* Star */}
        <div className="flex items-center pt-1">
          <button
            onClick={handleStarClick}
            className="p-1 rounded hover:bg-gray-100 transition-colors duration-200"
          >
            {isStarred ? (
              <StarIconSolid className="h-4 w-4 text-yellow-500" />
            ) : (
              <StarIcon className="h-4 w-4 text-gray-400 hover:text-yellow-500" />
            )}
          </button>
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Sender */}
              <div className="flex items-center space-x-2 mb-1">
                <span className={`text-sm font-medium truncate ${
                  isUnread ? 'text-gray-900' : 'text-gray-700'
                }`}>
                  {senderName}
                </span>
                {senderEmail && senderEmail !== senderName && (
                  <span className="text-xs text-gray-500 truncate">
                    {senderEmail}
                  </span>
                )}
              </div>

              {/* Subject */}
              <div className="mb-1">
                <span className={`text-sm font-medium ${
                  isUnread ? 'text-gray-900' : 'text-gray-700'
                }`}>
                  {subject}
                </span>
              </div>

              {/* Snippet */}
              <div className="mb-2">
                <span className="text-sm text-gray-600">
                  {truncatedSnippet}
                </span>
              </div>

              {/* Labels and Attachments */}
              <div className="flex items-center space-x-2">
                {hasAttachments && (
                  <PaperClipIcon className="h-4 w-4 text-gray-400" />
                )}
                {labelIds.includes('IMPORTANT') && (
                  <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
                )}
                {aiAnalysis?.importance && (
                  <ImportanceScore 
                    score={aiAnalysis.importance.importance} 
                    urgency={aiAnalysis.importance.urgency}
                    reasoning={aiAnalysis.importance.reasoning}
                    size="sm"
                    showLabel={false}
                  />
                )}
              </div>
            </div>

            {/* Right side - Date and Actions */}
            <div className="flex items-start space-x-2 ml-4">
              <div className="text-xs text-gray-500 whitespace-nowrap">
                {formattedDate}
              </div>
              
              {/* Hover Actions */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center space-x-1">
                <button
                  onClick={handleMarkAsRead}
                  className="p-1 rounded hover:bg-gray-100 transition-colors duration-200"
                  title={isUnread ? 'Mark as read' : 'Mark as unread'}
                >
                  {isUnread ? (
                    <EyeSlashIcon className="h-4 w-4 text-gray-400 hover:text-blue-500" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-gray-400 hover:text-blue-500" />
                  )}
                </button>
                
                <button
                  onClick={handleDelete}
                  className="p-1 rounded hover:bg-gray-100 transition-colors duration-200"
                  title="Delete"
                >
                  <TrashIcon className="h-4 w-4 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageCard;