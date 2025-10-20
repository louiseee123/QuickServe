
import React, { useState, useEffect } from 'react';
import { motion, useSpring, useTransform, useMotionValueEvent } from 'framer-motion';
import {
  FileText,
  ClipboardList,
  ScanLine,
  FileSearch,
  Package,
  Archive,
} from 'lucide-react';

interface ProcessingProgressBarProps {
  processingStartedAt?: string;
  estimatedCompletionDays?: number;
  isCompleted?: boolean;
}

const ProcessingProgressBar: React.FC<ProcessingProgressBarProps> = ({
  processingStartedAt,
  estimatedCompletionDays,
  isCompleted = false,
}) => {
  const initialProgress = isCompleted ? 100 : 10;
  const [progress, setProgress] = useState(initialProgress);

  const springProgress = useSpring(initialProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useMotionValueEvent(springProgress, "change", (latest) => {
    setProgress(latest);
  });

  useEffect(() => {
    if (isCompleted) {
      springProgress.set(100);
      return;
    }

    if (!processingStartedAt) {
      springProgress.set(10);
      return;
    }

    const startDate = new Date(processingStartedAt).getTime();
    const totalDurationMs = estimatedCompletionDays * 24 * 60 * 60 * 1000;

    if (isNaN(startDate) || !totalDurationMs || totalDurationMs <= 0 || startDate === 0) {
      springProgress.set(10);
      return;
    }

    const calculateAndSetProgress = () => {
      const now = Date.now();
      const elapsedMs = now - startDate;
      let currentProgress = (elapsedMs / totalDurationMs) * 100;
      currentProgress = Math.min(currentProgress, 100);

      let displayProgress = 10 + (currentProgress / 100) * 90;
      displayProgress = Math.min(displayProgress, 99);

      springProgress.set(displayProgress);
    };

    calculateAndSetProgress();

    const interval = setInterval(calculateAndSetProgress, 30000);

    return () => clearInterval(interval);
  }, [processingStartedAt, estimatedCompletionDays, springProgress, isCompleted]);

  const milestones = [
    { name: 'Preparing', progress: 10, icon: <ClipboardList className="w-5 h-5" /> },
    { name: 'Encoding', progress: 25, icon: <ScanLine className="w-5 h-5" /> },
    { name: 'Reviewing', progress: 50, icon: <FileSearch className="w-5 h-5" /> },
    { name: 'Packaging', progress: 75, icon: <Package className="w-5 h-5" /> },
    { name: 'Ready', progress: 100, icon: <Archive className="w-5 h-5" /> },
  ];

  const width = useTransform(springProgress, val => `${val}%`);
  const roundedProgress = useTransform(springProgress, latest => Math.round(latest));

  return (
    <div className="w-full px-4 sm:px-6 py-8 bg-white rounded-3xl shadow-2xl">
      <div className="text-center mb-8">
        <span className="text-3xl font-bold text-gray-800">
          <motion.span>{roundedProgress}</motion.span>%
        </span>
        <p className="text-base text-gray-500">Processing your request...</p>
      </div>

      <div className="relative h-4 bg-gray-200/70 rounded-full">
        <motion.div
          className="absolute top-0 left-0 h-4 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
          style={{ width }}
        />
        <motion.div
          className="absolute top-1/2 -translate-y-1/2"
          style={{ left: width, x: '-50%' }}
        >
          <motion.div
            className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center"
            animate={{
              scale: [1, 1.1, 1],
              boxShadow: [
                "0 0 0px 0px rgba(59, 130, 246, 0.5)",
                "0 0 0px 8px rgba(59, 130, 246, 0)",
                "0 0 0px 0px rgba(59, 130, 246, 0.5)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            <FileText className="w-5 h-5 text-blue-600" />
          </motion.div>
        </motion.div>
      </div>

      <div className="flex justify-between mt-12 -mx-2">
        {milestones.map((milestone) => (
          <motion.div
            key={milestone.name}
            className="flex flex-col items-center text-center w-1/5"
            initial={{ opacity: 0.4 }}
            animate={{ opacity: progress >= milestone.progress ? 1 : 0.4 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="w-12 h-12 flex items-center justify-center rounded-full border-2"
              animate={{
                borderColor: progress >= milestone.progress ? '#3b82f6' : '#d1d5db',
                backgroundColor: progress >= milestone.progress ? '#3b82f6' : '#f3f4f6',
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
