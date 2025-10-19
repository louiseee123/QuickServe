
import React from 'react';

const statusSteps = [
  'pending_approval',
  'pending_payment',
  'pending_verification',
  'processing',
  'ready_for_pickup',
  'completed'
];

const statusLabels = {
  pending_approval: 'Pending Approval',
  pending_payment: 'Pending Payment',
  pending_verification: 'Pending Verification',
  processing: 'Processing',
  ready_for_pickup: 'Ready for Pickup',
  completed: 'Completed'
};

const ProgressBar = ({ currentStatus }) => {
  const currentIndex = statusSteps.indexOf(currentStatus);

  // Handle denied status
  if (currentStatus === 'denied') {
    return (
      <div className="w-full flex justify-center items-center">
        <div className="bg-red-500 text-white font-bold py-1 px-4 rounded-full">
          Denied
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pt-2">
      <div className="flex justify-between items-center text-xs mb-1 text-gray-500">
        {statusSteps.map((status, index) => (
          <div 
            key={status} 
            className={`flex-1 text-center font-medium ${index <= currentIndex ? 'text-blue-600' : 'text-gray-400'}`}>
            {statusLabels[status]}
          </div>
        ))}
      </div>
      <div className="relative w-full h-2 bg-gray-200 rounded-full">
        <div 
          className="absolute top-0 left-0 h-2 bg-blue-500 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${(currentIndex / (statusSteps.length - 1)) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
