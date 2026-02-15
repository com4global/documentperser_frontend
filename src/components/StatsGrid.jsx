import React from 'react';
import { formatFileSize } from '../utils/helpers';
import '../Styles/AdminDashboard.css';

const StatsGrid = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="stats-grid">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="stat-card skeleton">
            <div className="skeleton-icon"></div>
            <div className="skeleton-value"></div>
            <div className="skeleton-label"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      icon: '📁',
      value: stats?.total_files || 0,
      label: 'Total Files',
      color: 'blue',
      trend: stats?.files_this_week > 0 ? `+${stats.files_this_week} this week` : null
    },
    {
      icon: '✅',
      value: stats?.processed_files || 0,
      label: 'Processed',
      color: 'green',
      percentage: (stats?.total_files > 0) ? Math.round((stats.processed_files / stats.total_files) * 100) : 0
    },
    {
      icon: '📦',
      value: (stats?.total_chunks || 0).toLocaleString(),
      label: 'Total Chunks',
      color: 'purple',
      average: (stats?.total_files > 0) ? Math.round((stats.total_chunks || 0) / stats.total_files) : 0
    },
    {
      icon: '💾',
      value: formatFileSize(stats?.total_size_bytes || 0),
      label: 'Total Size',
      color: 'orange'
    }
  ];

  return (
    <div className="stats-grid">
      {statCards.map((stat, idx) => (
        <div key={idx} className={`stat-card stat-${stat.color} fade-in-up`} style={{ animationDelay: `${idx * 0.1}s` }}>
          <div className="stat-icon-wrapper">
            <div className="stat-icon">{stat.icon}</div>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
            {stat.trend && <div className="stat-trend">📈 {stat.trend}</div>}
            {stat.percentage !== undefined && <div className="stat-percentage">{stat.percentage}% complete</div>}
            {stat.average !== undefined && stat.average > 0 && <div className="stat-average">~{stat.average} chunks/file</div>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;




// import React from 'react';
// import '../AdminDashboard.css';

// import { formatFileSize } from '../utils/helpers';

// const StatsGrid = ({ stats }) => {
//   if (!stats) return null;

//   const statCards = [
//     { icon: '📁', value: stats.total_files, label: 'Total Files', color: 'blue' },
//     { icon: '✅', value: stats.processed_files, label: 'Processed', color: 'green' },
//     { icon: '📦', value: stats.total_chunks, label: 'Total Chunks', color: 'purple' },
//     { icon: '💾', value: formatFileSize(stats.total_size_bytes), label: 'Total Size', color: 'orange' }
//   ];

//   return (
//     <div className="stats-grid">
//       {statCards.map((stat, idx) => (
//         <div key={idx} className={`stat-card stat-${stat.color}`}>
//           <div className="stat-icon">{stat.icon}</div>
//           <div className="stat-value">{stat.value}</div>
//           <div className="stat-label">{stat.label}</div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default StatsGrid;