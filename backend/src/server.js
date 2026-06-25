require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const urlRoutes = require('./routes/urlRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const redirectRoutes = require('./routes/redirectRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint - useful for k8s liveness/readiness probes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'url-shortener-backend' });
});

// API routes
app.use('/api', urlRoutes);
app.use('/api', analyticsRoutes);

// Redirect route (must be last - catches /:shortCode)
app.use('/', redirectRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}); 

module.exports = app;

//analyticsRoutes
