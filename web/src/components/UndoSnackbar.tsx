import { useEffect, useState } from 'react';

interface UndoSnackbarProps {
  isVisible: boolean;
  message: string;
  onUndo: () => void;
  onClose: () => void;
  duration?: number; // milliseconds
}

export default function UndoSnackbar({
  isVisible,
  message,
  onUndo,
  onClose,
  duration = 5000
}: UndoSnackbarProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (!isVisible) {
      setTimeLeft(duration);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 100) {
          onClose();
          return 0;
        }
        return prev - 100;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [isVisible, duration, onClose]);

  const handleUndo = () => {
    onUndo();
    onClose();
  };

  if (!isVisible) return null;

  const progressPercent = (timeLeft / duration) * 100;

  return (
    <div className="undo-snackbar">
      <div className="snackbar-content">
        <span className="snackbar-message">{message}</span>
        <button 
          onClick={handleUndo}
          className="undo-button"
        >
          Undo
        </button>
        <button 
          onClick={onClose}
          className="close-snackbar"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
      <div className="snackbar-progress">
        <div 
          className="progress-bar"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}