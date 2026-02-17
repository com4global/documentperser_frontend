import React from 'react';
import { getFileCategory } from '../utils/helpers';
import { useLanguage } from '../contexts/LanguageContext';
import '../Styles/AdminDashboard.css';

const FileDistribution = ({ distribution }) => {
  const { t } = useLanguage();

  if (!distribution || Object.keys(distribution).length === 0) return null;

  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);

  const getCategoryColor = (type) => {
    const category = getFileCategory(type);
    const colors = {
      document: '#3b82f6',
      video: '#8b5cf6',
      audio: '#10b981',
      image: '#f59e0b',
      other: '#6b7280'
    };
    return colors[category] || colors.other;
  };

  return (
    <div className="distribution-section fade-in-up">
      <div className="section-header">
        <h3 className="section-title">
          <span className="title-icon">📊</span>
          {t('fileTypeDistribution')}
        </h3>
        <div className="section-subtitle">
          {t('breakdownOf')} {total} {t('totalFilesAcross')} {Object.keys(distribution).length} {t('types')}
        </div>
      </div>

      <div className="distribution-grid">
        {Object.entries(distribution).map(([type, count], index) => {
          const percentage = ((count / total) * 100).toFixed(1);
          return (
            <div
              key={type}
              className="distribution-card hover-lift"
              style={{
                animationDelay: `${index * 0.1}s`,
                background: `linear-gradient(135deg, ${getCategoryColor(type)}dd, ${getCategoryColor(type)})`
              }}
            >
              <div className="dist-header">
                <span className="dist-icon">{getFileCategory(type) === 'document' ? '📄' : getFileCategory(type) === 'video' ? '🎥' : getFileCategory(type) === 'audio' ? '🎵' : '🖼️'}</span>
                <span className="dist-type">{type.toUpperCase()}</span>
              </div>
              <div className="dist-count">{count}</div>
              <div className="dist-footer">
                <div className="dist-percentage">{percentage}% {t('ofTotal')}</div>
                <div className="dist-bar">
                  <div className="dist-bar-fill" style={{ width: `${percentage}%` }}></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FileDistribution;




// import React from "react";
// import '../AdminDashboard.css';

// const FileDistribution = ({ distribution }) => {
//   if (!distribution || Object.keys(distribution).length === 0) return null;

//   return (
//     <div className="distribution-section">
//       <h3 className="section-title">📊 File Type Distribution</h3>
//       <div className="distribution-grid">
//         {Object.entries(distribution).map(([type, count]) => (
//           <div key={type} className="distribution-card">
//             <div className="dist-count">{count}</div>
//             <div className="dist-type">{type.toUpperCase()}</div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default FileDistribution;