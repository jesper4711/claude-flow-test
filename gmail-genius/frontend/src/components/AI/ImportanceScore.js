import React from 'react';
import { 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  InformationCircleIcon,
  FireIcon,
  SparklesIcon 
} from '@heroicons/react/24/outline';

const ImportanceScore = ({ score, urgency, reasoning, size = 'md', showLabel = true, showReasoningTooltip = false }) => {
  if (!score) return null;

  // Determine level from 1-10 score
  const getImportanceLevel = () => {
    if (score >= 9) return { level: 'critical', label: 'Critical', icon: FireIcon };
    if (score >= 7) return { level: 'high', label: 'High Priority', icon: ExclamationTriangleIcon };
    if (score >= 4) return { level: 'medium', label: 'Medium Priority', icon: SparklesIcon };
    return { level: 'low', label: 'Low Priority', icon: CheckCircleIcon };
  };

  const importance = getImportanceLevel();
  const IconComponent = importance.icon;

  const getColors = () => {
    switch (importance.level) {
      case 'critical':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          icon: 'text-red-600'
        };
      case 'high':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-700',
          icon: 'text-orange-600'
        };
      case 'medium':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-700',
          icon: 'text-yellow-600'
        };
      default:
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-700',
          icon: 'text-green-600'
        };
    }
  };

  const colors = getColors();
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const urgencyColors = {
    critical: 'bg-red-100 text-red-700',
    high: 'bg-orange-100 text-orange-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-green-100 text-green-700'
  };

  return (
    <div className="inline-flex items-center space-x-2">
      <div 
        className={`inline-flex items-center px-2 py-1 rounded-full border ${colors.bg} ${colors.border}`}
        title={showReasoningTooltip && reasoning ? reasoning : undefined}
      >
        <IconComponent className={`${sizeClasses[size]} ${colors.icon} mr-1`} />
        {showLabel && (
          <span className={`${textSizeClasses[size]} font-medium ${colors.text}`}>
            {importance.label}
          </span>
        )}
        <span className={`${textSizeClasses[size]} ${colors.text} ml-1`}>
          ({score}/10)
        </span>
      </div>
      
      {urgency && urgency !== 'low' && (
        <div className={`inline-flex items-center px-2 py-0.5 rounded-full ${urgencyColors[urgency] || urgencyColors.medium} ${textSizeClasses.sm}`}>
          <span className="font-medium capitalize">{urgency} Urgency</span>
        </div>
      )}
    </div>
  );
};

export default ImportanceScore;