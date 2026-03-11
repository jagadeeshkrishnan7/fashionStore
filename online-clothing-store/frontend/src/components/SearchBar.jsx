import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-md">
      <motion.div
        className="relative"
        whileFocus="focused"
        initial="normal"
      >
        <input
          type="text"
          placeholder="Search for products, colors, styles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-black focus:outline-none transition-colors"
        />
        <motion.button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 text-xl hover:text-black transition"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          🔍
        </motion.button>
      </motion.div>
    </form>
  );
};

export default SearchBar;
