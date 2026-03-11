import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getAdminSettings, uploadPaymentScreenshot } from '../services/api';

const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  const [order, setOrder] = useState(null);
  const [upiSettings, setUpiSettings] = useState({ phonepe: '', googlepay: '' });
  const [paymentMethod, setPaymentMethod] = useState('PhonePe');
  const [paymentUploaded, setPaymentUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(false);

  useEffect(() => {
    // Get order details from localStorage
    const currentOrder = localStorage.getItem('currentOrder');
    if (currentOrder) {
      setOrder(JSON.parse(currentOrder));
    }
    // Fetch UPI settings from admin
    loadUpiSettings();
  }, []);

  const loadUpiSettings = async () => {
    try {
      const res = await getAdminSettings();
      setUpiSettings(res.data?.upi || { phonepe: 'store@upi', googlepay: 'store@upi' });
    } catch (error) {
      console.error('Error loading UPI settings:', error);
      setUpiSettings({ phonepe: 'store@upi', googlepay: 'store@upi' });
    }
  };

  const handlePayment = (method) => {
    setPaymentMethod(method);
    const storeName = 'Online Clothing Store';
    const upiLinks = {
      phonepe: `phonepe://pay?pa=${upiSettings.phonepe}&pn=${storeName}&am=${amount}&tn=Order ${order?.orderNumber}`,
      googlepay: `upi://pay?pa=${upiSettings.googlepay}&pn=${storeName}&am=${amount}&tn=Order ${order?.orderNumber}`,
      paytm: `paytmmp://pay?pa=${upiSettings.phonepe}&pn=${storeName}&am=${amount}&tn=Order ${order?.orderNumber}`
    };

    window.location.href = upiLinks[method];
  };

  const handleUploadPayment = async (e) => {
    e.preventDefault();
    const fileInput = e.target.querySelector('input[type="file"]');

    if (!fileInput.files.length) {
      alert('Please select a payment screenshot');
      return;
    }

    setUploading(true);
    try {
      await uploadPaymentScreenshot(order.id, fileInput.files[0], paymentMethod);
      setPaymentUploaded(true);
      setConfirmationModal(true);
      // Auto-hide modal after 3 seconds
      setTimeout(() => {
        setConfirmationModal(false);
      }, 3000);
    } catch (error) {
      alert('Error uploading payment: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  if (!order) {
    return <div className="flex items-center justify-center min-h-screen text-2xl">Loading...</div>;
  }

  return (
    <div className="min-h-screen container mx-auto px-4 py-8">
      <AnimatePresence>
        {/* Confirmation Modal */}
        {confirmationModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-8 rounded-lg shadow-2xl max-w-sm w-full text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
              <p className="text-gray-600 mb-4">Your payment has been received successfully.</p>
              <p className="text-sm text-gray-500">Order Number: {order.orderNumber}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {!paymentUploaded ? (
          <>
            <h1 className="text-3xl font-bold mb-6 text-center">Complete Your Payment</h1>

            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-2">
                <p><strong>Order Number:</strong> {order.orderNumber}</p>
                <p><strong>Total Amount:</strong> ₹{order.totalAmount}</p>
                <p><strong>Customer:</strong> {order.customerName}</p>
                <p><strong>Mobile:</strong> {order.mobileNumber}</p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Step 1: Choose Payment Method & Pay</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.button
                  onClick={() => handlePayment('phonepe')}
                  className="p-4 border-2 border-gray-300 rounded-lg hover:border-green-500 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">📱</div>
                    <div className="font-bold">PhonePe</div>
                  </div>
                </motion.button>

                <motion.button
                  onClick={() => handlePayment('googlepay')}
                  className="p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">💰</div>
                    <div className="font-bold">Google Pay</div>
                  </div>
                </motion.button>

                <motion.button
                  onClick={() => handlePayment('paytm')}
                  className="p-4 border-2 border-gray-300 rounded-lg hover:border-blue-600 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">💳</div>
                    <div className="font-bold">Paytm</div>
                  </div>
                </motion.button>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Step 2: Upload Payment Screenshot</h2>
              <form onSubmit={handleUploadPayment} className="p-4 bg-gray-50 rounded-lg border">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-black"
                  >
                    <option value="PhonePe">PhonePe</option>
                    <option value="GooglePay">Google Pay</option>
                    <option value="Paytm">Paytm</option>
                    <option value="Manual">Manual Payment</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Screenshot</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400"
                >
                  {uploading ? 'Uploading...' : 'Upload Screenshot'}
                </button>
              </form>
            </div>

            <div className="text-center text-gray-600 text-sm">
              <p>After completing the payment on your UPI app, take a screenshot and upload it above to confirm your order.</p>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold mb-4 text-green-600">Order Confirmed!</h1>
            <p className="text-gray-600 mb-6">Your payment has been received. Your order is now being processed.</p>
            
            <div className="mb-8 p-4 bg-green-50 rounded-lg">
              <p className="text-lg"><strong>Order Number:</strong> {order.orderNumber}</p>
              <p className="text-lg"><strong>Amount:</strong> ₹{order.totalAmount}</p>
            </div>

            <div className="space-y-3">
              <motion.button
                onClick={() => navigate('/')}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                🛍️ Shop More
              </motion.button>

              <motion.button
                onClick={() => navigate(`/orders?mobile=${order.mobileNumber}`)}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                📋 Track Your Order
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentPage;
