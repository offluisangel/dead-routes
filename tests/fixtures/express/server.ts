// Express server with dead routes

import express from 'express';

const app = express();

// Route that IS used
app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});

// Route that IS used
app.post('/api/users', (req, res) => {
  res.json({ created: true });
});

// DEAD ROUTE - never called
app.get('/api/v1/export', (req, res) => {
  res.json({ data: [] });
});

// DEAD ROUTE - never called
app.put('/api/settings/theme', (req, res) => {
  res.json({ theme: 'dark' });
});

export default app;
