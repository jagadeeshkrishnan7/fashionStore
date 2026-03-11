const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const router = express.Router();
const dataPath = path.join(__dirname, '../data/orders.json');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // make sure upload directory exists
    const destDir = path.join(__dirname, '../uploads/payments');
    fs.mkdirSync(destDir, { recursive: true });
    cb(null, destDir);
  },
  filename: (req, file, cb) => {
    cb(null, `payment-${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// helper to convert relative paths to an absolute URL
const makeUrl = (req, relPath) => {
  if (!relPath) return '';
  if (relPath.startsWith('http')) return relPath;
  return `${req.protocol}://${req.get('host')}${relPath}`;
};

// Read orders
const readOrders = () => {
  try {
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Write orders
const writeOrders = (orders) => {
  fs.writeFileSync(dataPath, JSON.stringify(orders, null, 2));
};

// Generate order number
const generateOrderNumber = () => {
  const now = new Date();
  const date = now.getFullYear().toString().slice(2) + 
    (now.getMonth() + 1).toString().padStart(2, '0') + 
    now.getDate().toString().padStart(2, '0');
  const time = now.getHours().toString().padStart(2, '0') + 
    now.getMinutes().toString().padStart(2, '0');
  return `ORD${date}${time}`;
};

// POST create order
router.post('/', (req, res) => {
  try {
    const { customerName, mobileNumber, address, items, totalAmount } = req.body;

    if (!customerName || !mobileNumber || !address || !items) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const orders = readOrders();
    const newOrder = {
      id: Date.now(),
      orderNumber: generateOrderNumber(),
      customerName,
      mobileNumber,
      address,
      items,
      totalAmount: parseFloat(totalAmount),
      status: 'pending',
      paymentMethod: null,
      paymentScreenshot: null,
      createdAt: new Date().toISOString()
    };

    orders.push(newOrder);
    writeOrders(orders);
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// GET orders by mobile number
router.get('/', (req, res) => {
  try {
    const { mobile } = req.query;
    const orders = readOrders();

    if (!mobile) {
      return res.status(400).json({ error: 'Mobile number is required' });
    }

    const filtered = orders.filter(o => o.mobileNumber === mobile);
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET order by ID
router.get('/:id', (req, res) => {
  try {
    const orders = readOrders();
    const order = orders.find(o => o.id == req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// POST upload payment screenshot
router.post('/:id/upload-payment', upload.single('screenshot'), (req, res) => {
  try {
    const { paymentMethod } = req.body;
    const orders = readOrders();
    const order = orders.find(o => o.id == req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.paymentMethod = paymentMethod || 'Manual Payment';
    if (req.file) {
      order.paymentScreenshot = makeUrl(req, `/payments/${req.file.filename}`);
    }
    order.status = 'confirmed';

    writeOrders(orders);
    res.json({ message: 'Payment uploaded successfully', order });
  } catch (error) {
    console.error('Error uploading payment:', error);
    res.status(500).json({ error: 'Failed to upload payment' });
  }
});

module.exports = router;
