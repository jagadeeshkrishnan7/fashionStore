import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { getTheme } from './services/api';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';

import Home from './pages/Home';
import SearchPage from './pages/SearchPage';
import CartPage from './pages/CartPage';
import OrderSearch from './pages/OrderSearch';
import PaymentPage from './pages/PaymentPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const response = await getTheme();
      setTheme(response.data);
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  return (
    <CartProvider>
      <Router>
        <div style={{ backgroundColor: theme?.backgroundColor || '#ffffff' }}>
          <Routes>
            {/* Admin routes without navbar */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />

            {/* Regular routes with navbar */}
            <Route
              path="/*"
              element={
                <>
                  <Navbar theme={theme} />
                  <CartDrawer />
                  <div className="min-h-screen">
                    <Routes>
                      <Route path="/" element={<Home theme={theme} />} />
                      <Route path="/search" element={<SearchPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/orders" element={<OrderSearch />} />
                      <Route path="/payment" element={<PaymentPage />} />
                    </Routes>
                  </div>
                  <Footer theme={theme} />
                </>
              }
            />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
