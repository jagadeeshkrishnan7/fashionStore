const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const router = express.Router();
const dataPath = path.join(__dirname, '../data/categories.json');

// multer storage for category images
const categoryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.join(__dirname, '../public/images/categories');
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueName = `cat-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});
const uploadCategoryImage = multer({ storage: categoryStorage });

// Read categories
const readCategories = () => {
  try {
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Write categories
const writeCategories = (categories) => {
  fs.writeFileSync(dataPath, JSON.stringify(categories, null, 2));
};

// GET all categories
router.get('/', (req, res) => {
  const categories = readCategories();
  res.json(categories);
});

// POST add category (admin)
router.post('/add', uploadCategoryImage.single('image'), (req, res) => {
  try {
    const { name, icon } = req.body;
    let imageUrl = '';
    if (req.file) {
      imageUrl = `/images/categories/${req.file.filename}`;
    } else if (req.body.image) {
      imageUrl = req.body.image;
    }

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const categories = readCategories();
    const newCategory = {
      id: Date.now(),
      name,
      icon: icon || '👕',
      image: imageUrl,
      createdAt: new Date().toISOString()
    };

    categories.push(newCategory);
    writeCategories(categories);
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add category' });
  }
});

// DELETE category (admin)
router.delete('/delete/:id', (req, res) => {
  try {
    const categories = readCategories();
    const index = categories.findIndex(c => c.id == req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const deleted = categories.splice(index, 1);
    writeCategories(categories);
    res.json({ message: 'Category deleted', category: deleted[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

module.exports = router;
