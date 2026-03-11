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
const uploadProductImage = multer({ 
  storage: productStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

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

// POST add product (admin) - supports single or multiple images
router.post('/add', uploadProductImage.array('images', 5), (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    let imageUrls = [];

    // Handle multiple files
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => 
        makeUrl(req, `/images/products/${file.filename}`)
      );
    } else if (req.body.images) {
      // Handle images passed as string array
      imageUrls = Array.isArray(req.body.images) 
        ? req.body.images 
        : [req.body.images];
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
      images: imageUrls,
      image: imageUrls[0] || '', // Keep backward compatibility
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

// PUT update product (admin) - supports single or multiple images
router.put('/update/:id', uploadProductImage.array('images', 5), (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    let imageUrls;

    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => 
        makeUrl(req, `/images/products/${file.filename}`)
      );
    } else if (req.body.images) {
      imageUrls = Array.isArray(req.body.images) 
        ? req.body.images 
        : [req.body.images];
    }

    const products = readProducts();
    const index = products.findIndex(p => p.id == req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updatedProduct = {
      ...products[index],
      name: name || products[index].name,
      description: description || products[index].description,
      price: price !== undefined ? parseFloat(price) : products[index].price,
      category: category || products[index].category,
      stock: stock !== undefined ? stock : products[index].stock,
      updatedAt: new Date().toISOString()
    };

    // Update images if provided
    if (imageUrls && imageUrls.length > 0) {
      updatedProduct.images = imageUrls;
      updatedProduct.image = imageUrls[0]; // Keep backward compatibility
    }

    products[index] = updatedProduct;
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
