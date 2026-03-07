import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../lib/utils';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  variant = 'danger'
}: ConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden"
        >
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center",
                variant === 'danger' ? "bg-red-50 text-red-600" : 
                variant === 'warning' ? "bg-amber-50 text-amber-600" : 
                "bg-blue-50 text-blue-600"
              )}>
                <AlertTriangle size={28} />
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">{title}</h3>
            <p className="text-gray-500 leading-relaxed">{message}</p>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Button 
                variant="secondary" 
                onClick={onClose}
                className="flex-1 py-4 rounded-2xl font-bold"
              >
                {cancelLabel}
              </Button>
              <Button 
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={cn(
                  "flex-1 py-4 rounded-2xl font-bold shadow-lg",
                  variant === 'danger' ? "bg-red-600 hover:bg-red-700 shadow-red-100" : 
                  variant === 'warning' ? "bg-amber-600 hover:bg-amber-700 shadow-amber-100" : 
                  "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100"
                )}
              >
                {confirmLabel}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
