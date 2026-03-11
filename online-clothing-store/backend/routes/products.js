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

// Store product images metadata
const storeProductImagesMetadata = (productId, images) => {
  try {
    const metadataDir = path.join(__dirname, '../data/product-images');
    fs.mkdirSync(metadataDir, { recursive: true });
    const metadataPath = path.join(metadataDir, `${productId}.json`);
    const metadata = {
      productId,
      images: images.map((img, idx) => ({
        index: idx + 1,
        url: img,
        uploadedAt: new Date().toISOString()
      })),
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    return metadata;
  } catch (error) {
    console.error('Error storing image metadata:', error);
  }
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
    const productId = Date.now();
    const newProduct = {
      id: productId,
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
    if (imageUrls.length > 0) {
      storeProductImagesMetadata(productId, imageUrls);
    }
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({ error: 'Failed to add product: ' + error.message });
  }
});

// PUT update product (admin) - supports single or multiple images
router.put('/update/:id', uploadProductImage.array('images', 5), (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    const productId = parseInt(req.params.id);
    
    const products = readProducts();
    const index = products.findIndex(p => p.id == productId);

    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const existingProduct = products[index];
    let imageUrls = existingProduct.images || [];

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => 
        makeUrl(req, `/images/products/${file.filename}`)
      );
    } else if (req.body.images) {
      // Handle images passed as string array
      imageUrls = Array.isArray(req.body.images) 
        ? req.body.images.filter(img => img)
        : [req.body.images].filter(img => img);
    }

    // Validate and convert price and stock
    const parsedPrice = price && price.trim() ? parseFloat(price) : existingProduct.price;
    const parsedStock = stock && stock.toString().trim() ? parseInt(stock) : existingProduct.stock;

    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ error: 'Invalid price value' });
    }
    if (isNaN(parsedStock) || parsedStock < 0) {
      return res.status(400).json({ error: 'Invalid stock value' });
    }

    const updatedProduct = {
      id: existingProduct.id,
      name: name && name.trim() ? name : existingProduct.name,
      description: description && description.trim() ? description : existingProduct.description,
      price: parsedPrice,
      category: category && category.trim() ? category : existingProduct.category,
      stock: parsedStock,
      images: imageUrls && imageUrls.length > 0 ? imageUrls : existingProduct.images || [],
      image: (imageUrls && imageUrls.length > 0 ? imageUrls[0] : existingProduct.image) || '',
      createdAt: existingProduct.createdAt,
      updatedAt: new Date().toISOString()
    };

    products[index] = updatedProduct;
    writeProducts(products);
    
    // Store image metadata if images exist
    if (updatedProduct.images && updatedProduct.images.length > 0) {
      storeProductImagesMetadata(productId, updatedProduct.images);
    }
    
    res.json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product: ' + error.message });
  }
});

// DELETE product (admin)
router.delete('/delete/:id', (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const products = readProducts();
    const index = products.findIndex(p => p.id == productId);

    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const deleted = products.splice(index, 1);
    writeProducts(products);
    
    // Clean up metadata file
    try {
      const metadataPath = path.join(__dirname, '../data/product-images', `${productId}.json`);
      if (fs.existsSync(metadataPath)) {
        fs.unlinkSync(metadataPath);
      }
    } catch (err) {
      console.error('Error deleting metadata:', err);
    }
    
    res.json({ message: 'Product deleted', product: deleted[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
