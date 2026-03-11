import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';

const Navbar = ({ theme }) => {
  const { getTotalItems, setIsCartOpen } = useCart();
  const navigate = useNavigate();

  return (
    <nav
      className="sticky top-0 z-50 shadow-md"
      style={{ backgroundColor: theme?.colors?.primary || '#000' }}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/">
          <motion.div
            className="text-white text-2xl font-bold"
            whileHover={{ scale: 1.05 }}
          >
            {theme?.storeName || 'FASHION STORE'}
          </motion.div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex gap-8 text-white">
          <Link to="/" className="hover:text-gray-300 transition">
            Home
          </Link>
          <Link to="/orders" className="hover:text-gray-300 transition">
            Track Orders
          </Link>
          <Link to="/admin" className="hover:text-gray-300 transition">
            Admin
          </Link>
        </div>

        {/* Cart Icon */}
        <motion.button
          className="relative text-white text-2xl"
          whileHover={{ scale: 1.1 }}
          onClick={() => setIsCartOpen(true)}
        >
          🛒
          {getTotalItems() > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {getTotalItems()}
            </span>
          )}
        </motion.button>
      </div>
    </nav>
  );
};

export default Navbar;
