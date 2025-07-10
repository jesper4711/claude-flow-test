import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, SparklesIcon } from '@heroicons/react/24/outline';

const Summary = ({ summary, expanded = false, maxLength = 200 }) => {
  const [isExpanded, setIsExpanded] = useState(expanded);

  if (!summary) return null;

  const shouldTruncate = summary.length > maxLength;
  const displaySummary = shouldTruncate && !isExpanded 
    ? summary.substring(0, maxLength) + '...' 
    : summary;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <SparklesIcon className="h-5 w-5 text-purple-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-purple-900">
              AI Summary
            </h4>
            {shouldTruncate && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center text-xs text-purple-600 hover:text-purple-800 transition-colors duration-200"
              >
                {isExpanded ? (
                  <>
                    <span className="mr-1">Show less</span>
                    <ChevronUpIcon className="h-3 w-3" />
                  </>
                ) : (
                  <>
                    <span className="mr-1">Show more</span>
                    <ChevronDownIcon className="h-3 w-3" />
                  </>
                )}
              </button>
            )}
          </div>
          <p className="text-sm text-purple-800 leading-relaxed">
            {displaySummary}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Summary;