import React, { useState, useEffect } from 'react';
import { getProducts, getCategories, getAds } from '../services/api';
import ProductCard from '../components/ProductCard';
import CategoryMenu from '../components/CategoryMenu';
import BannerSlider from '../components/BannerSlider';
import SearchBar from '../components/SearchBar';
import { motion } from 'framer-motion';

const Home = ({ theme }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [ads, setAds] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, categoriesRes, adsRes] = await Promise.all([
        getProducts(),
        getCategories(),
        getAds()
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
      setAds(adsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCategory) {
      setFilteredProducts(
        products.filter(p => p.category === selectedCategory)
      );
    } else {
      setFilteredProducts(products);
    }
  }, [selectedCategory, products]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-3xl">Loading...</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27100%27 height=%27100%27%3E%3Ctext x=%2750%27 y=%2750%27 font-size=%2748%27 opacity=%270.05%27 text-anchor=%27middle%27%3E${theme?.watermarkText || 'FASHION STORE'}%3C/text%3E%3C/svg%3E")`,
        backgroundColor: theme?.backgroundColor || '#ffffff'
      }}
    >
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-8">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1
            className="text-5xl font-bold mb-2"
            style={{ color: theme?.colors?.primary || '#000' }}
          >
            Welcome to {theme?.storeName || 'FASHION STORE'}
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            Discover the latest trends and styles
          </p>
          <SearchBar />
        </motion.div>
      </div>

      {/* Banner Slider */}
      <div className="container mx-auto px-4 mt-8">
        <BannerSlider ads={ads} />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Category Menu */}
        <CategoryMenu
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Products Grid */}
        <div>
          <h2 className="text-3xl font-bold mb-6">
            {selectedCategory ? `${selectedCategory} Collection` : 'All Products'}
          </h2>
          {filteredProducts.length === 0 ? (
            <p className="text-center text-gray-500 text-lg">
              No products found in this category
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
