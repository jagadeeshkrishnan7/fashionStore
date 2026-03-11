const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const themeDataPath = path.join(__dirname, '../data/theme.json');
const adsDataPath = path.join(__dirname, '../data/ads.json');

// Admin credentials
// admin credentials and settings stored in JSON
const adminDataPath = path.join(__dirname, '../data/admin.json');

const readAdminData = () => {
  try {
    const data = fs.readFileSync(adminDataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { users: [{ username: 'admin', password: 'adminpass' }], upi: { phonepe: '', googlepay: '' } };
  }
};

const writeAdminData = (data) => {
  fs.writeFileSync(adminDataPath, JSON.stringify(data, null, 2));
};

// Read theme
const readTheme = () => {
  try {
    const data = fs.readFileSync(themeDataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
};

// Write theme
const writeTheme = (theme) => {
  fs.writeFileSync(themeDataPath, JSON.stringify(theme, null, 2));
};

// Read ads
const readAds = () => {
  try {
    const data = fs.readFileSync(adsDataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { banners: [] };
  }
};

// Write ads
const writeAds = (ads) => {
  fs.writeFileSync(adsDataPath, JSON.stringify(ads, null, 2));
};

// POST admin login
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const adminData = readAdminData();
    const match = adminData.users.find(u => u.username === username && u.password === password);
    if (match) {
      res.json({
        success: true,
        token: 'admin_token_' + Date.now(),
        message: 'Login successful'
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET theme
router.get('/theme', (req, res) => {
  try {
    const theme = readTheme();
    res.json(theme);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch theme' });
  }
});

// PUT update theme
router.put('/theme', (req, res) => {
  try {
    const { storeName, backgroundColor, watermarkText, colors, fonts, contact } = req.body;
    const theme = readTheme();

    const updatedTheme = {
      ...theme,
      storeName: storeName || theme.storeName,
      backgroundColor: backgroundColor || theme.backgroundColor,
      watermarkText: watermarkText || theme.watermarkText,
      colors: colors || theme.colors,
      fonts: fonts || theme.fonts,
      contact: contact || theme.contact
    };

    writeTheme(updatedTheme);
    res.json({ message: 'Theme updated successfully', theme: updatedTheme });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update theme' });
  }
});

// GET ads
router.get('/ads', (req, res) => {
  try {
    const ads = readAds();
    res.json(ads);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ads' });
  }
});

// POST add ad banner
router.post('/ads', (req, res) => {
  try {
    const { title, image, link } = req.body;

    if (!title || !image) {
      return res.status(400).json({ error: 'Title and image are required' });
    }

    const ads = readAds();
    const newAd = {
      id: Date.now(),
      title,
      image,
      link: link || '#',
      active: true,
      createdAt: new Date().toISOString()
    };

    ads.banners.push(newAd);
    writeAds(ads);
    res.status(201).json(newAd);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add ad' });
  }
});

// DELETE ad banner
router.delete('/ads/:id', (req, res) => {
  try {
    const ads = readAds();
    const index = ads.banners.findIndex(b => b.id == req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    const deleted = ads.banners.splice(index, 1);
    writeAds(ads);
    res.json({ message: 'Ad deleted', ad: deleted[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete ad' });
  }
});

// GET admin settings (upi and user list without passwords)
router.get('/settings', (req, res) => {
  try {
    const adminData = readAdminData();
    const safeUsers = adminData.users.map(u => ({ username: u.username }));
    res.json({ users: safeUsers, upi: adminData.upi });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT update admin settings (add user or change password or upi)
router.put('/settings', (req, res) => {
  try {
    const { newUser, username, password, upi } = req.body;
    const adminData = readAdminData();
    if (newUser) {
      // newUser should be { username, password }
      adminData.users.push(newUser);
    }
    if (username && password) {
      const user = adminData.users.find(u => u.username === username);
      if (user) user.password = password;
    }
    if (upi) adminData.upi = upi;
    writeAdminData(adminData);
    res.json({ message: 'Settings updated', settings: { upi } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Admin order management
router.get('/orders', (req, res) => {
  try {
    const ordersData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/orders.json'), 'utf8'));
    // return sorted by creation desc
    ordersData.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
    res.json(ordersData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.put('/orders/:id', (req, res) => {
  try {
    // allow admin to modify any order field; also support clearing payment data
    const { status, paymentMethod, customerName, mobileNumber, address, items, totalAmount, clearPayment } = req.body;
    const ordersPath = path.join(__dirname, '../data/orders.json');
    const orders = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
    const order = orders.find(o => o.id == req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const allowedStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (status) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
      }
      order.status = status;
    }

    if (paymentMethod) {
      order.paymentMethod = paymentMethod;
    }

    if (customerName) order.customerName = customerName;
    if (mobileNumber) order.mobileNumber = mobileNumber;
    if (address) order.address = address;
    if (items) order.items = items;
    if (totalAmount !== undefined) order.totalAmount = parseFloat(totalAmount);

    if (clearPayment) {
      // admin removed payment screenshot, revert status
      order.paymentScreenshot = null;
      order.paymentMethod = null;
      order.status = 'pending';
    }

    fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

router.delete('/orders/:id', (req, res) => {
  try {
    const ordersPath = path.join(__dirname, '../data/orders.json');
    const orders = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
    const idx = orders.findIndex(o=>o.id==req.params.id);
    if (idx===-1) return res.status(404).json({ error: 'Order not found' });
    const deleted = orders.splice(idx,1);
    fs.writeFileSync(ordersPath, JSON.stringify(orders,null,2));
    res.json({ message:'Order deleted', order:deleted[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

module.exports = router;
