import React, { useState } from 'react';
import { shortenUrl } from '../api';

export default function ShortenForm({ onCreated }) {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const { data } = await shortenUrl(originalUrl, customCode);
      setResult(data);
      setOriginalUrl('');
      setCustomCode('');
      if (onCreated) onCreated();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Paste a long URL (https://example.com/...)"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Custom code (optional)"
          value={customCode}
          onChange={(e) => setCustomCode(e.target.value)}
          style={{ maxWidth: '180px' }}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Shortening...' : 'Shorten'}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {result && (
        <div className="result">
          <div>
            Short URL:{' '}
            <a href={result.shortUrl} target="_blank" rel="noreferrer">
              {result.shortUrl}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
