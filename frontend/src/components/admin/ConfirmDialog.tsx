import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-950 border border-white/10 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xl font-serif font-bold flex items-center gap-2">
            {type === 'danger' && <AlertTriangle className="text-red-500" size={20} />}
            {title}
          </h2>
          <button onClick={onCancel} className="text-white/40 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <div className="p-8">
          <p className="text-white/60 leading-relaxed">{message}</p>
        </div>
        <div className="p-6 bg-white/5 border-t border-white/10 flex gap-4">
          <button 
            onClick={onCancel}
            className="flex-1 py-3 bg-white/5 text-white font-bold uppercase tracking-widest hover:bg-white/10 transition-all rounded-lg text-xs"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className={`flex-1 py-3 font-bold uppercase tracking-widest transition-all rounded-lg text-xs ${
              type === 'danger' ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gold text-black hover:bg-gold-light'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
