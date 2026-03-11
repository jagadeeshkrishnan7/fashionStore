import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const BannerSlider = ({ ads }) => {
  const [activeAds, setActiveAds] = useState([]);

  useEffect(() => {
    if (ads && ads.banners) {
      setActiveAds(ads.banners.filter(ad => ad.active));
    }
  }, [ads]);

  if (!activeAds.length) {
    return null;
  }

  return (
    <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        className="w-full h-96"
      >
        {activeAds.map((ad) => (
          <SwiperSlide key={ad.id}>
            <a href={ad.link} className="block w-full h-full">
              <img
                src={ad.image || 'https://via.placeholder.com/1200x400?text=' + ad.title}
                alt={ad.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center hover:bg-opacity-20 transition">
                <h2 className="text-white text-4xl font-bold">{ad.title}</h2>
              </div>
            </a>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default BannerSlider;
