import React from 'react';
import { motion } from 'framer-motion';

const CategoryMenu = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-8">
      <h2 className="text-xl font-bold mb-4">Categories</h2>
      <div className="flex flex-wrap gap-2">
        {/* All Products Button */}
        <motion.button
          onClick={() => onSelectCategory(null)}
          className={`px-4 py-2 rounded-full font-medium transition-colors ${
            selectedCategory === null
              ? 'bg-black text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          All Products
        </motion.button>

        {/* Category Buttons */}
        {categories.map((category) => (
          <motion.button
            key={category.id}
            onClick={() => onSelectCategory(category.name)}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${
              selectedCategory === category.name
                ? 'bg-black text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {category.icon} {category.name}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default CategoryMenu;
