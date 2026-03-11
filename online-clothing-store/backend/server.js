const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));
// serve public images (products/categories)
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Routes
const productsRoute = require('./routes/products');
const categoriesRoute = require('./routes/categories');
const ordersRoute = require('./routes/orders');
const adminRoute = require('./routes/admin');

app.use('/api/products', productsRoute);
app.use('/api/categories', categoriesRoute);
app.use('/api/orders', ordersRoute);
app.use('/api/admin', adminRoute);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Get theme
app.get('/api/theme', (req, res) => {
  try {
    const themeData = fs.readFileSync(path.join(__dirname, 'data/theme.json'), 'utf8');
    res.json(JSON.parse(themeData));
  } catch (error) {
    console.error('Error reading theme:', error);
    res.status(500).json({ error: 'Failed to read theme' });
  }
});

// Get ads
app.get('/api/ads', (req, res) => {
  try {
    const adsData = fs.readFileSync(path.join(__dirname, 'data/ads.json'), 'utf8');
    res.json(JSON.parse(adsData));
  } catch (error) {
    console.error('Error reading ads:', error);
    res.status(500).json({ error: 'Failed to read ads' });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
