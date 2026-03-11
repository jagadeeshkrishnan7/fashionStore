import React from 'react';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import { IMAGE_BASE } from '../services/api';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <motion.div
      className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Image Container */}
      <motion.div
        className="relative overflow-hidden bg-gray-200 h-48"
        whileHover={{ scale: 1.05 }}
      >
        {/* image src may include timestamp to bust cache when updatedAt changes */}
        <img
          src={
            (() => {
              let src;
              if (product.image) {
                const base = product.image.startsWith('http') ? '' : IMAGE_BASE;
                src = base + product.image;
                if (product.updatedAt) src += `?v=${new Date(product.updatedAt).getTime()}`;
              } else {
                src = 'https://via.placeholder.com/300x200?text=' + product.name;
              }
              return src;
            })()
          }
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {product.stock > 0 && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
            In Stock
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
            Out of Stock
          </div>
        )}
      </motion.div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-gray-900">
            ₹{product.price}
          </span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {product.category}
          </span>
        </div>

        {/* Add to Cart Button */}
        <motion.button
          onClick={() => addToCart(product)}
          disabled={product.stock === 0}
          className={`w-full py-2 rounded font-bold text-white transition-colors duration-200 ${
            product.stock > 0
              ? 'bg-black hover:bg-gray-800 active:bg-gray-900'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
          whileHover={product.stock > 0 ? { scale: 1.02 } : {}}
          whileTap={product.stock > 0 ? { scale: 0.98 } : {}}
        >
          {product.stock > 0 ? '🛒 Add to Cart' : 'Out of Stock'}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
