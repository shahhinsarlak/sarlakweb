import { useState, useEffect } from 'react';

/**
 * Notification Popup Component
 *
 * Displays temporary notification messages in the top-left corner.
 * Notifications cascade vertically and fade out after a short period.
 *
 * @param {Array} notifications - Array of notification objects: { id, message, timestamp }
 * @param {Function} onDismiss - Callback to dismiss a notification by ID
 */
export default function NotificationPopup({ notifications, onDismiss }) {
  if (!notifications || notifications.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '20px',
      zIndex: 10001,
      display: 'flex',
      flexDirection: 'column-reverse', // Newest on top
      gap: '10px',
      pointerEvents: 'none'
    }}>
      {notifications.map((notification, index) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          index={index}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}

/**
 * Individual notification item with fade animation
 */
function NotificationItem({ notification, index, onDismiss }) {
  const [opacity, setOpacity] = useState(1);
  const fadeOutStart = 3000; // Start fading after 3 seconds
  const fadeOutDuration = 500; // Fade out over 0.5 seconds
  const totalDuration = fadeOutStart + fadeOutDuration;

  useEffect(() => {
    // Start fade out animation after fadeOutStart ms
    const fadeTimer = setTimeout(() => {
      setOpacity(0);
    }, fadeOutStart);

    // Auto-dismiss after total duration
    const dismissTimer = setTimeout(() => {
      onDismiss(notification.id);
    }, totalDuration);

    // Cleanup timers on unmount
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(dismissTimer);
    };
  }, [notification.id, onDismiss, fadeOutStart, totalDuration]);

  return (
    <div style={{
      fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
      fontSize: '13px',
      padding: '12px 16px',
      backgroundColor: 'var(--bg-color)',
      color: 'var(--text-color)',
      border: '1px solid var(--border-color)',
      borderRadius: '4px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      maxWidth: '350px',
      opacity: opacity,
      transition: `opacity ${fadeOutDuration}ms ease-in`,
      pointerEvents: 'auto',
      animation: 'slideInLeft 0.3s ease-out',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word'
    }}>
      {notification.message}
      <style jsx>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
