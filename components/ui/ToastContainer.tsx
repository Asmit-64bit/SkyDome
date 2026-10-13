'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSkyDoStore } from '../../store/useSkyDoStore';
import { PixelButton } from './PixelButton';

export const ToastContainer: React.FC = () => {
  const undoToast = useSkyDoStore((state) => state.undoToast);
  const setUndoToast = useSkyDoStore((state) => state.setUndoToast);
  const performUndo = useSkyDoStore((state) => state.performUndo);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!undoToast) return;
    setProgress(100);

    const startTime = Date.now();
    const duration = 5000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (elapsed >= duration) {
        clearInterval(interval);
        setUndoToast(null);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [undoToast, setUndoToast]);

  return (
    <div className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 z-50 pointer-events-none">
      <AnimatePresence>
        {undoToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="pixel-panel-stone p-3 flex flex-col gap-2 min-w-[280px] max-w-sm pointer-events-auto shadow-lg"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs sm:text-sm font-sans text-[#F4EFE6] truncate">
                {undoToast.title}
              </span>
              <PixelButton
                variant="primary"
                size="sm"
                onClick={performUndo}
                className="text-xs shrink-0"
              >
                Undo
              </PixelButton>
            </div>

            {/* Countdown progress line */}
            <div className="w-full h-1 bg-[#4B4E52] overflow-hidden rounded-xs">
              <div
                className="h-full bg-[#E3B341] transition-all duration-75"
                style={{ width: `${progress}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
