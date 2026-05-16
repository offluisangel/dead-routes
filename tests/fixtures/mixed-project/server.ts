import express from 'express';

const app = express();

// These routes ARE used
app.get('/api/products', async (req, res) => {
  res.json([{ id: 1, name: 'Product 1' }]);
});

app.post('/api/products', async (req, res) => {
  res.json({ id: 2, name: req.body.name });
});

// DEAD ROUTES
app.get('/api/legacy/items', (req, res) => {
  res.json([]);
});

app.delete('/api/legacy/items/:id', (req, res) => {
  res.json({ deleted: true });
});

export default app;
