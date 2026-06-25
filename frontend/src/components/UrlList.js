import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAllUrls } from '../api';
import ShortenForm from './ShortenForm';

export default function UrlList() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUrls = useCallback(async () => {
    try {
      const { data } = await getAllUrls();
      setUrls(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUrls();
  }, [fetchUrls]);

  // SonarQube fix: replace nested ternary with if...else
  let content;

  if (loading) {
    content = <div className="loading">Loading...</div>;
  } else if (urls.length === 0) {
    content = (
      <div className="empty">
        No URLs shortened yet. Create one above.
      </div>
    );
  } else {
    content = (
      <table>
        <thead>
          <tr>
            <th>Short Code</th>
            <th>Original URL</th>
            <th>Clicks</th>
            <th>Created</th>
          </tr>
        </thead>

        <tbody>
          {urls.map((u) => (
            <tr key={u.shortCode}>
              <td>
                <Link to={`/analytics/${u.shortCode}`}>
                  {u.shortCode}
                </Link>
              </td>

              <td
                style={{
                  maxWidth: '300px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {u.originalUrl}
              </td>

              <td>
                <span className="badge">{u.clicks}</span>
              </td>

              <td>{new Date(u.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <>
      <ShortenForm onCreated={fetchUrls} />

      <div className="card">
        <h3 style={{ marginTop: 0 }}>All Short Links</h3>

        {content}

      </div>
    </>
  );
}