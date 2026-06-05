import React from 'react';
import { FaExclamationTriangle, FaSync } from 'react-icons/fa';

function ErrorDisplay({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-red-50 rounded-full p-4 mb-4">
        <FaExclamationTriangle className="text-red-600 text-5xl" />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h3>
      <p className="text-gray-600 text-center mb-4">{error || 'Failed to load data'}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200 flex items-center gap-2"
        >
          <FaSync className="animate-spin-on-hover" />
          Try Again
        </button>
      )}
    </div>
  );
}

export default ErrorDisplay;