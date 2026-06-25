import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUrlAnalytics } from '../api';

export default function UrlAnalyticsDetail() {
  const { shortCode } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUrlAnalytics(shortCode)
      .then(({ data }) => setData(data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [shortCode]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!data) return null;

  return (
    <>
      <Link to="/">&larr; Back to all links</Link>

      <div className="card" style={{ marginTop: '1rem' }}>
        <h2 style={{ marginTop: 0 }}>/{data.shortCode}</h2>
        <p style={{ color: '#94a3b8', wordBreak: 'break-all' }}>{data.originalUrl}</p>
        <div className="stat-box" style={{ display: 'inline-block', minWidth: '150px' }}>
          <div className="value">{data.totalClicks}</div>
          <div className="label">Total Clicks</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Breakdown</h3>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <BreakdownTable title="Browser" data={data.browserBreakdown} />
          <BreakdownTable title="OS" data={data.osBreakdown} />
          <BreakdownTable title="Device" data={data.deviceBreakdown} />
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Recent Clicks</h3>
        {data.recentClicks.length === 0 ? (
          <div className="empty">No clicks yet.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Browser</th>
                <th>OS</th>
                <th>Device</th>
              </tr>
            </thead>
            <tbody>
              {data.recentClicks.map((c) => (
                <tr key={c.timestamp}>
                  <td>{new Date(c.timestamp).toLocaleString()}</td>
                  <td>{c.browser}</td>
                  <td>{c.os}</td>
                  <td>{c.deviceType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function BreakdownTable({ title, data }) {
  const entries = Object.entries(data || {});
  return (
    <div style={{ minWidth: '150px' }}>
      <h4 style={{ marginBottom: '0.5rem', color: '#94a3b8' }}>{title}</h4>
      {entries.length === 0 ? (
        <span style={{ color: '#64748b', fontSize: '0.85rem' }}>No data</span>
      ) : (
        entries.map(([key, count]) => (
          <div key={key} style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
            {key}: <span className="badge">{count}</span>
          </div>
        ))
      )}
    </div>
  );
}
