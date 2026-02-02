import React, { useEffect } from 'react';
import { STATUS_TYPES } from '../utils/constants';
import '../Styles/AdminDashboard.css';

const NotificationBar = ({ message, type, onClose, duration = 5000 }) => {
  useEffect(() => {
    if (message && type === STATUS_TYPES.SUCCESS) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [message, type, onClose, duration]);

  if (!message) return null;

  const icons = {
    [STATUS_TYPES.SUCCESS]: '✅',
    [STATUS_TYPES.ERROR]: '❌',
    [STATUS_TYPES.PROCESSING]: '⏳',
    [STATUS_TYPES.WARNING]: '⚠️'
  };

  return (
    <div className={`notification-bar notification-${type} slide-in-right`}>
      <span className="notification-icon">{icons[type]}</span>
      <span className="notification-text">{message}</span>
      {type !== STATUS_TYPES.PROCESSING && (
        <button className="notification-close" onClick={onClose} aria-label="Close notification">
          ×
        </button>
      )}
      {type === STATUS_TYPES.SUCCESS && (
        <div className="notification-progress"></div>
      )}
    </div>
  );
};

export default NotificationBar;





// import React, { useEffect } from 'react';
// import '../AdminDashboard.css';

// const NotificationBar = ({ message, type, onClose }) => {
//   useEffect(() => {
//     if (message && type === 'success') {
//       const timer = setTimeout(onClose, 5000);
//       return () => clearTimeout(timer);
//     }
//   }, [message, type, onClose]);

//   if (!message) return null;

//   const icons = {
//     success: '✅',
//     error: '❌',
//     processing: '⏳'
//   };

//   return (
//     <div className={`notification-bar notification-${type}`}>
//       <span className="notification-icon">{icons[type]}</span>
//       <span className="notification-text">{message}</span>
//       {type !== 'processing' && (
//         <button className="notification-close" onClick={onClose}>×</button>
//       )}
//     </div>
//   );
// };

// export default NotificationBar;