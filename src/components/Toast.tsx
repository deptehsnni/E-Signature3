import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, XCircle, Shield, X } from 'lucide-react';
import { cn } from '../lib/utils';

export const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) => {
  const icons = {
    success: <CheckCircle2 className="text-emerald-500" size={20} />,
    error: <XCircle className="text-red-500" size={20} />,
    info: <Shield className="text-indigo-500" size={20} />,
  };

  const bgColors = {
    success: 'bg-emerald-50 border-emerald-100',
    error: 'bg-red-50 border-red-100',
    info: 'bg-indigo-50 border-indigo-100',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        "fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-md",
        bgColors[type]
      )}
    >
      {icons[type]}
      <p className="text-sm font-bold text-gray-800">{message}</p>
      <button onClick={onClose} className="ml-2 text-gray-400 hover:text-gray-600">
        <X size={16} />
      </button>
    </motion.div>
  );
};
