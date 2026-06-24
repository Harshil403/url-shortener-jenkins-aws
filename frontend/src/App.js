import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import UrlList from './components/UrlList';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import UrlAnalyticsDetail from './components/UrlAnalyticsDetail';

export default function App() {
  return (
    <BrowserRouter>
      <div className="container">
        <h1>🔗 URL Shortener</h1>
        <p className="subtitle">Shorten links and track click analytics</p>

        <nav>
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Shorten
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
            Dashboard
          </NavLink>
        </nav>

        <Routes>
          <Route path="/" element={<UrlList />} />
          <Route path="/dashboard" element={<AnalyticsDashboard />} />
          <Route path="/analytics/:shortCode" element={<UrlAnalyticsDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
