import React from 'react';

const Footer = ({ theme }) => {
  return (
    <footer
      className="mt-20 text-white py-8"
      style={{ backgroundColor: theme?.colors?.primary || '#000' }}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4">{theme?.storeName || 'Fashion Store'}</h3>
            <p className="text-gray-300 text-sm">
              Your one-stop shop for trendy and stylish clothing. Discover our exclusive collection today!
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="text-gray-300 text-sm space-y-2">
              <li><a href="#" className="hover:text-white">Home</a></li>
              <li><a href="#" className="hover:text-white">About Us</a></li>
              <li><a href="#" className="hover:text-white">Contact</a></li>
              <li><a href="#" className="hover:text-white">FAQs</a></li>
            </ul>
          </div>


          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <p className="text-gray-300 text-sm mb-2">
              Email: {theme?.contact?.email || 'info@fashionstore.com'}
            </p>
            <p className="text-gray-300 text-sm mb-2">
              Phone: {theme?.contact?.phone || '+1 800-FASHION'}
            </p>
            <p className="text-gray-300 text-sm mb-2">
              {theme?.contact?.address || ''}
            </p>
            <div className="flex gap-4 mt-4 text-2xl">
              <a href="#" className="hover:text-gray-300">📘</a>
              <a href="#" className="hover:text-gray-300">📷</a>
              <a href="#" className="hover:text-gray-300">🐦</a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2026 {theme?.storeName || 'Fashion Store'}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
