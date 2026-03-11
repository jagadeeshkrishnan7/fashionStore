const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const router = express.Router();
const dataPath = path.join(__dirname, '../data/products.json');

// multer storage for product images
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.join(__dirname, '../public/images/products');
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueName = `prod-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});
const uploadProductImage = multer({ storage: productStorage });

// helper to convert relative path to absolute URL based on request
const makeUrl = (req, relPath) => {
  if (!relPath) return '';
  if (relPath.startsWith('http')) return relPath;
  return `${req.protocol}://${req.get('host')}${relPath}`;
};

// Read products
const readProducts = () => {
  try {
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Write products
const writeProducts = (products) => {
  fs.writeFileSync(dataPath, JSON.stringify(products, null, 2));
};

// GET all products
router.get('/', (req, res) => {
  const products = readProducts();
  res.json(products);
});

// GET product by category
router.get('/category/:category', (req, res) => {
  const products = readProducts();
  const filtered = products.filter(p => p.category.toLowerCase() === req.params.category.toLowerCase());
  res.json(filtered);
});

// POST add product (admin)
router.post('/add', uploadProductImage.single('image'), (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    let imageUrl = '';
    if (req.file) {
      // saved under /images/products
      imageUrl = `/images/products/${req.file.filename}`;
      imageUrl = makeUrl(req, imageUrl);
    } else if (req.body.image) {
      imageUrl = req.body.image;
    }

    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const products = readProducts();
    const newProduct = {
      id: Date.now(),
      name,
      description: description || '',
      price: parseFloat(price),
      category,
      image: imageUrl,
      stock: stock || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    products.push(newProduct);
    writeProducts(products);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// PUT update product (admin)
router.put('/update/:id', uploadProductImage.single('image'), (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    let imageUrl;
    if (req.file) {
      imageUrl = `/images/products/${req.file.filename}`;
      imageUrl = makeUrl(req, imageUrl);
    } else if (req.body.image) {
      imageUrl = req.body.image;
    }

    const products = readProducts();
    const index = products.findIndex(p => p.id == req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    products[index] = {
      ...products[index],
      name: name || products[index].name,
      description: description || products[index].description,
      price: price !== undefined ? parseFloat(price) : products[index].price,
      category: category || products[index].category,
      image: imageUrl || products[index].image,
      stock: stock !== undefined ? stock : products[index].stock,
      updatedAt: new Date().toISOString()
    };

    writeProducts(products);
    res.json(products[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE product (admin)
router.delete('/delete/:id', (req, res) => {
  try {
    const products = readProducts();
    const index = products.findIndex(p => p.id == req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const deleted = products.splice(index, 1);
    writeProducts(products);
    res.json({ message: 'Product deleted', product: deleted[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
