'use client';

import { useEffect, useState } from 'react';

const MobileWarning = () => {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      const isMobile = window.innerWidth <= 768;
      setShowWarning(isMobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm mx-auto shadow-xl">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Desktop or Tablet Recommended</h2>
        <p className="text-gray-600 mb-6">
          Our app is designed to provide the best experience on computers and tablets. We recommend accessing the site from a device with a larger screen for optimal functionality.
        </p>
        <div className="flex justify-end">
          <button
            onClick={() => setShowWarning(false)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileWarning; 