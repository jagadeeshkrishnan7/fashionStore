import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper';
import { IMAGE_BASE } from '../services/api';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

SwiperCore.use([Navigation, Pagination, Autoplay]);

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [swiperRef, setSwiperRef] = useState(null);

  // Handle both single image and multiple images format
  const images = product.images && product.images.length > 0 
    ? product.images 
    : product.image 
    ? [product.image] 
    : [];

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/300x200?text=' + product.name;
    const base = imagePath.startsWith('http') ? '' : IMAGE_BASE;
    let url = base + imagePath;
    if (product.updatedAt) url += `?v=${new Date(product.updatedAt).getTime()}`;
    return url;
  };

  return (
    <motion.div
      className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Image Carousel */}
      <div className="relative bg-gray-200 h-48 group">
        {images.length > 0 ? (
          <Swiper
            spaceBetween={0}
            slidesPerView={1}
            navigation={images.length > 1}
            pagination={{ clickable: true }}
            autoplay={images.length > 1 ? { delay: 4000 } : false}
            className="h-full"
            onSwiper={setSwiperRef}
          >
            {images.map((image, index) => (
              <SwiperSlide key={index} className="flex items-center justify-center">
                <img
                  src={getImageUrl(image)}
                  alt={`${product.name} - ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300">
            <img
              src={'https://via.placeholder.com/300x200?text=' + product.name}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Stock Badge */}
        {product.stock > 0 && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold z-10">
            In Stock
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold z-10">
            Out of Stock
          </div>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs z-10">
            1 / {images.length}
          </div>
        )}
      </div>

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
