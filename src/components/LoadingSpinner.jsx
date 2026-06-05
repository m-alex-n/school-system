import React from 'react';
import { FaSpinner } from 'react-icons/fa';

function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        <FaSpinner className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-600 text-2xl animate-pulse" />
      </div>
      <p className="mt-4 text-gray-600 font-medium">{message}</p>
      <p className="text-sm text-gray-400 mt-2">Please wait while we fetch your data...</p>
    </div>
  );
}

export default LoadingSpinner;