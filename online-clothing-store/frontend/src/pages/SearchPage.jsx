import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import { motion } from 'framer-motion';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const queryString = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await getProducts();
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!queryString.trim()) {
      setFilteredProducts([]);
      return;
    }

    const query = queryString.toLowerCase();
    const results = products.filter(
      product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
    );
    setFilteredProducts(results);
  }, [queryString, products]);

  return (
    <div className="min-h-screen container mx-auto px-4 py-8">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold mb-4">Search Results</h1>
        <p className="text-gray-600 mb-6">
          {queryString && `Search results for: "${queryString}"`}
        </p>
        <SearchBar />
      </motion.div>

      {loading ? (
        <div className="text-center text-2xl">Loading...</div>
      ) : filteredProducts.length === 0 ? (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-2xl text-gray-500">No products found</p>
          <p className="text-gray-400 mt-2">
            Try searching for different keywords
          </p>
        </motion.div>
      ) : (
        <div>
          <p className="text-lg text-gray-600 mb-6">
            Found {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
