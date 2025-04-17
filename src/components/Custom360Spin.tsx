import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Custom360SpinProps } from '../types/vehicle';

export function Custom360Spin({ images, onClose }: Custom360SpinProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const mainImage = images[selectedIndex] || '';

  const handlePrev = () => setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  const handleNext = () => setSelectedIndex((prev) => (prev + 1) % images.length);

  // Close on ESC
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black bg-opacity-60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-4xl"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          transition={{ duration: 0.2 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white p-2 rounded-full shadow hover:bg-gray-100 transition-colors"
          >
            <X size={24} className="text-red-600" />
          </button>

          {/* Main Image Area */}
          <div className="relative bg-gray-100 flex items-center justify-center" style={{ height: '500px' }}>
            {images.length > 1 && (
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            <motion.img
              key={selectedIndex}
              src={mainImage}
              alt={`360 view ${selectedIndex}`}
              className="object-contain max-h-full max-w-full"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              onError={(e: any) => {
                e.target.src = 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80';
              }}
            />

            {images.length > 1 && (
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>

          {/* Thumbnail Strip */}
          <div className="flex gap-2 overflow-x-auto p-4 bg-white">
            {images.map((imgUrl, idx) => (
              <motion.div
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className={`flex-shrink-0 p-1 rounded-lg cursor-pointer transition-all ${
                  idx === selectedIndex
                    ? 'border-2 border-indigo-500 bg-indigo-50'
                    : 'border border-gray-200 hover:border-gray-400'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <img
                  src={imgUrl}
                  alt={`Thumb ${idx}`}
                  className="h-16 w-16 object-cover rounded"
                  onError={(e: any) => {
                    e.target.src = 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80';
                  }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
