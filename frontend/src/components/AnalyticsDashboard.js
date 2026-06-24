import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOverallAnalytics } from '../api';

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOverallAnalytics()
      .then(({ data }) => setStats(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading analytics...</div>;
  if (!stats) return <div className="empty">No data available.</div>;

  return (
    <>
      <div className="stats-grid">
        <div className="stat-box">
          <div className="value">{stats.totalUrls}</div>
          <div className="label">Total Short URLs</div>
        </div>
        <div className="stat-box">
          <div className="value">{stats.totalClicks}</div>
          <div className="label">Total Clicks</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Top Performing Links</h3>
        {stats.topUrls.length === 0 ? (
          <div className="empty">No clicks recorded yet.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Short Code</th>
                <th>Original URL</th>
                <th>Clicks</th>
              </tr>
            </thead>
            <tbody>
              {stats.topUrls.map((u) => (
                <tr key={u.shortCode}>
                  <td><Link to={`/analytics/${u.shortCode}`}>{u.shortCode}</Link></td>
                  <td style={{ maxWidth: '350px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {u.originalUrl}
                  </td>
                  <td><span className="badge">{u.clicks}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
