import { useEffect } from "react";

function Notification({
  message,
  type = "success",
  onClose,
  duration = 3000,
}) {
  useEffect(() => {
    if (!message) {
      return;
    }

    const timer = setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [message, onClose, duration]);

  if (!message) {
    return null;
  }

  const icons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  };

  return (
    <div className={`notification notification-${type}`}>
      <div className="notification-content">
        <span className="notification-icon">
          {icons[type] || icons.info}
        </span>

        <span className="notification-message">
          {message}
        </span>

        <button
          type="button"
          className="notification-close"
          onClick={onClose}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default Notification;