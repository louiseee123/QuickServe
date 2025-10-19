
import React, { useMemo } from 'react';
import { motion, useSpring, useTransform, animate } from 'framer-motion';
import {
  FileText,
  ClipboardList,
  ScanLine,
  FileSearch,
  Package,
  Archive,
} from 'lucide-react';

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
    // Cap progress at 100
    return Math.min((processingTimeDays / estimatedCompletionDays) * 100, 100);
  }, [processingTimeDays, estimatedCompletionDays]);

  const springProgress = useSpring(0, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  React.useEffect(() => {
    springProgress.set(progress);
  }, [springProgress, progress]);

  const milestones = [
    { name: 'Preparing', progress: 0, icon: <ClipboardList className="w-5 h-5" /> },
    { name: 'Encoding', progress: 25, icon: <ScanLine className="w-5 h-5" /> },
    { name: 'Reviewing', progress: 50, icon: <FileSearch className="w-5 h-5" /> },
    { name: 'Packaging', progress: 75, icon: <Package className="w-5 h-5" /> },
    { name: 'Ready', progress: 100, icon: <Archive className="w-5 h-5" /> },
  ];

  const width = useTransform(springProgress, val => `${val}%`);

  const Counter = ({ value }) => {
    const [displayValue, setDisplayValue] = React.useState(0);

    React.useEffect(() => {
      const controls = animate(displayValue, value, {
        duration: 1.5,
        ease: 'easeInOut',
        onUpdate: (latest) => setDisplayValue(Math.round(latest)),
      });
      return controls.stop;
    }, [value]);

    return <>{displayValue}</>;
  };

  return (
    <div className="w-full px-2 sm:px-4 py-6 bg-white rounded-2xl shadow-lg">
      <div className="text-center mb-4">
        <span className="text-2xl font-bold text-blue-900">
          <Counter value={progress} />%
        </span>
        <p className="text-sm text-gray-500">Processing your request...</p>
      </div>

      <div className="relative h-3 bg-gray-200/70 rounded-full">
        <motion.div
          className="absolute top-0 left-0 h-3 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500"
          style={{ width }}
        />
        <motion.div
          className="absolute -top-3.5"
          style={{ left: width, transform: 'translateX(-50%)' }}
          whileHover={{ scale: 1.2 }}
        >
          <motion.div
             animate={{
                y: [0, -2, 0],
             }}
             transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: 'loop',
                ease: 'easeInOut'
             }}
          >
            <FileText className="w-10 h-10 text-indigo-600 drop-shadow-lg" />
          </motion.div>
        </motion.div>
      </div>

      <div className="flex justify-between mt-10 -mx-2">
        {milestones.map((milestone, index) => (
          <motion.div
            key={index}
            className="flex flex-col items-center text-center w-1/5"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: progress >= milestone.progress ? 1 : 0.5 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="w-12 h-12 flex items-center justify-center rounded-full border-2"
              animate={{
                borderColor: progress >= milestone.progress ? '#4f46e5' : '#d1d5db',
                backgroundColor: progress >= milestone.progress ? '#6366f1' : '#f3f4f6',
                color: progress >= milestone.progress ? '#ffffff' : '#6b7281',
              }}
              transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
            >
              {milestone.icon}
            </motion.div>
            <span className="text-xs mt-2 font-medium text-gray-600">{milestone.name}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProcessingProgressBar;
