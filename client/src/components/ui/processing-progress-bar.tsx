
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

interface ProcessingProgressBarProps {
  processingTimeDays: number;
  estimatedCompletionDays: number;
}

const ProcessingProgressBar: React.FC<ProcessingProgressBarProps> = ({
  processingTimeDays,
  estimatedCompletionDays,
}) => {
  const progress = useMemo(() => {
    if (!estimatedCompletionDays) return 0;
    return (processingTimeDays / estimatedCompletionDays) * 100;
  }, [processingTimeDays, estimatedCompletionDays]);

  const milestones = [
    { name: 'Encoding', progress: 0 },
    { name: 'Reviewing', progress: 25 },
    { name: 'Preparing', progress: 75 },
    { name: 'Ready for Pickup', progress: 100 },
  ];

  return (
    <div className="w-full px-4 py-8">
      <div className="relative h-4 bg-gray-200 rounded-full">
        <motion.div
          className="absolute top-0 left-0 h-4 bg-blue-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -top-3"
          initial={{ left: '0%' }}
          animate={{ left: `${progress}%` }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        >
          <FileText className="w-8 h-8 text-blue-600" />
        </motion.div>
      </div>
      <div className="flex justify-between mt-4">
        {milestones.map((milestone) => (
          <div key={milestone.name} className="flex flex-col items-center">
            <div
              className={`w-3 h-3 rounded-full ${
                progress >= milestone.progress ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
            <span className="text-xs mt-2 text-gray-500">{milestone.name}</span>
          </div>
        ))}
      </div>
      <div className="text-center mt-4 text-lg font-semibold text-blue-800">
        {Math.round(progress)}% complete
      </div>
    </div>
  );
};

export default ProcessingProgressBar;
