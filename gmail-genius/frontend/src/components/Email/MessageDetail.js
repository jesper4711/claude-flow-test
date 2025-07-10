import React, { useState } from 'react';
import { 
  ArrowLeftIcon, 
  StarIcon, 
  PaperClipIcon, 
  EllipsisVerticalIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  PrinterIcon,
  TrashIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import ImportanceScore from '../AI/ImportanceScore';
import Summary from '../AI/Summary';
import LoadingSpinner from '../UI/LoadingSpinner';
import { formatDate, formatEmailAddress } from '../../utils/helpers';

const MessageDetail = ({ 
  message,
  isLoading = false,
  onBack,
  onAction,
  onReply,
  onForward
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showRawContent, setShowRawContent] = useState(false);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!message) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No message selected</p>
          <button onClick={onBack} className="btn btn-primary">
            Back to Messages
          </button>
        </div>
      </div>
    );
  }

  const {
    id,
    subject = '(No Subject)',
    sender = {},
    recipients = [],
    cc = [],
    bcc = [],
    timestamp,
    isUnread = false,
    isStarred = false,
    hasAttachments = false,
    attachments = [],
    body = '',
    labelIds = [],
    aiAnalysis = {}
  } = message;

  const handleStarClick = async () => {
    try {
      await onAction({
        action: isStarred ? 'unstar' : 'star',
        messageId: id
      });
    } catch (error) {
      console.error('Error toggling star:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await onAction({
          action: 'delete',
          messageId: id
        });
        onBack();
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleMarkAsRead = async () => {
    try {
      await onAction({
        action: isUnread ? 'markAsRead' : 'markAsUnread',
        messageId: id
      });
    } catch (error) {
      console.error('Error toggling read status:', error);
    }
  };

  const renderEmailAddressList = (addresses, label) => {
    if (!addresses || addresses.length === 0) return null;
    
    return (
      <div className="flex items-start space-x-2 text-sm">
        <span className="text-gray-500 font-medium min-w-0">{label}:</span>
        <div className="flex-1 min-w-0">
          {addresses.map((addr, index) => (
            <span key={index} className="text-gray-700">
              {formatEmailAddress(addr)}
              {index < addresses.length - 1 && ', '}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderAttachments = () => {
    if (!hasAttachments || !attachments || attachments.length === 0) return null;

    return (
      <div className="mt-4 border-t border-gray-200 pt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
          <PaperClipIcon className="h-4 w-4 mr-2" />
          Attachments ({attachments.length})
        </h4>
        <div className="space-y-2">
          {attachments.map((attachment, index) => (
            <div key={index} className="attachment-item">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {attachment.filename}
                </p>
                <p className="text-xs text-gray-500">
                  {attachment.mimeType} • {attachment.size ? `${Math.round(attachment.size / 1024)}KB` : 'Unknown size'}
                </p>
              </div>
              <button className="btn btn-outline btn-sm">
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              {subject}
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleStarClick}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              {isStarred ? (
                <StarIconSolid className="h-5 w-5 text-yellow-500" />
              ) : (
                <StarIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <EllipsisVerticalIcon className="h-5 w-5" />
              </button>
              
              {showDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowDropdown(false)}
                  />
                  <div className="dropdown-menu">
                    <button
                      onClick={handleMarkAsRead}
                      className="dropdown-item"
                    >
                      {isUnread ? 'Mark as read' : 'Mark as unread'}
                    </button>
                    <button
                      onClick={handlePrint}
                      className="dropdown-item"
                    >
                      <PrinterIcon className="h-4 w-4 mr-2" />
                      Print
                    </button>
                    <button
                      onClick={() => setShowRawContent(!showRawContent)}
                      className="dropdown-item"
                    >
                      {showRawContent ? 'Hide' : 'Show'} raw content
                    </button>
                    <button
                      onClick={handleDelete}
                      className="dropdown-item text-red-600 hover:bg-red-50"
                    >
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Message Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-6">
          {/* AI Analysis */}
          {aiAnalysis && Object.keys(aiAnalysis).length > 0 && (
            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-3">AI Analysis</h3>
                <div className="space-y-3">
                  {aiAnalysis.importance && (
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-blue-700">Importance:</span>
                      <ImportanceScore 
                        score={aiAnalysis.importance.score} 
                        level={aiAnalysis.importance.level}
                      />
                    </div>
                  )}
                  {aiAnalysis.summary && (
                    <Summary summary={aiAnalysis.summary} />
                  )}
                  {aiAnalysis.category && (
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-blue-700">Category:</span>
                      <span className="badge badge-primary">{aiAnalysis.category}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Message Header */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">{subject}</h2>
                <span className="text-sm text-gray-500">
                  {formatDate(timestamp)}
                </span>
              </div>
              
              <div className="text-sm text-gray-600">
                <strong>From:</strong> {formatEmailAddress(sender)}
              </div>
              
              {renderEmailAddressList(recipients, 'To')}
              {renderEmailAddressList(cc, 'Cc')}
              {renderEmailAddressList(bcc, 'Bcc')}
              
              {labelIds.length > 0 && (
                <div className="flex items-center space-x-2">
                  <TagIcon className="h-4 w-4 text-gray-400" />
                  <div className="flex flex-wrap gap-1">
                    {labelIds.map((labelId) => (
                      <span key={labelId} className="badge badge-secondary">
                        {labelId}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Message Body */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            {showRawContent ? (
              <pre className="text-sm font-mono text-gray-700 whitespace-pre-wrap">
                {body}
              </pre>
            ) : (
              <div 
                className="email-content"
                dangerouslySetInnerHTML={{ __html: body }}
              />
            )}
          </div>

          {/* Attachments */}
          {renderAttachments()}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onReply(message)}
              className="btn btn-primary"
            >
              <ArrowUturnLeftIcon className="h-4 w-4 mr-2" />
              Reply
            </button>
            <button
              onClick={() => onForward(message)}
              className="btn btn-outline"
            >
              <ArrowUturnRightIcon className="h-4 w-4 mr-2" />
              Forward
            </button>
          </div>
          
          <div className="text-sm text-gray-500">
            Message ID: {id}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageDetail;