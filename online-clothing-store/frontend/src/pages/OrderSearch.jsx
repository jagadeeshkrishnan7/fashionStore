import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getOrders, uploadPaymentScreenshot } from '../services/api';
import { motion } from 'framer-motion';

const OrderSearch = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mobileFromUrl = searchParams.get('mobile');
  const [mobileNumber, setMobileNumber] = useState(mobileFromUrl || '');
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('PhonePe');

  // Auto-search if mobile is provided via URL
  useEffect(() => {
    if (mobileFromUrl) {
      handleSearch(new Event('submit'));
    }
  }, [mobileFromUrl]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!mobileNumber.trim()) {
      alert('Please enter mobile number');
      return;
    }

    setLoading(true);
    try {
      const response = await getOrders(mobileNumber);
      setOrders(response.data || []);
      if (response.data.length === 0) {
        alert('No orders found for this mobile number');
      }
    } catch (error) {
      alert('Error fetching orders: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPayment = async (e, orderId) => {
    e.preventDefault();
    const fileInput = e.target.querySelector('input[type="file"]');

    if (!fileInput.files.length) {
      alert('Please select a payment screenshot');
      return;
    }

    setUploading(true);
    try {
      await uploadPaymentScreenshot(orderId, fileInput.files[0], paymentMethod);
      alert('Payment screenshot uploaded successfully!');
      const goBack = window.confirm('Go back to order search?');
      if (goBack) {
        setSelectedOrder(null);
        setMobileNumber('');
        setOrders([]);
      }
    } catch (error) {
      alert('Error uploading payment: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
        >
          ← Back to Home
        </button>
        <motion.h1
          className="text-4xl font-bold"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Track Your Order
        </motion.h1>
      </div>

      {!selectedOrder ? (
        <div className="max-w-md mx-auto">
          <form onSubmit={handleSearch} className="bg-white p-6 rounded-lg shadow-lg">
            <label className="block text-sm font-medium mb-2">Mobile Number</label>
            <input
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              pattern="[0-9]{10}"
              placeholder="Enter 10-digit mobile number"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-black mb-4"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2 rounded-lg font-bold hover:bg-gray-800 disabled:bg-gray-400"
            >
              {loading ? 'Searching...' : 'Search Orders'}
            </button>
          </form>

          {orders.length > 0 && (
            <motion.div
              className="mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h2 className="text-2xl font-bold mb-4">Your Orders</h2>
              <div className="space-y-3">
                {orders.map((order) => (
                  <motion.button
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="w-full text-left p-4 bg-white border rounded-lg hover:shadow-lg transition"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold">{order.orderNumber}</p>
                        <p className="text-sm text-gray-600">₹{order.totalAmount}</p>
                        <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-3 py-1 rounded text-xs font-bold text-white ${
                        order.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      ) : (
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <button
            onClick={() => setSelectedOrder(null)}
            className="mb-4 px-4 py-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400"
          >
            ← Back to Orders
          </button>

          <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
            <h2 className="text-2xl font-bold mb-4">Order Details</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-gray-600">Order Number</p>
                <p className="text-lg font-bold">{selectedOrder.orderNumber}</p>
              </div>
              <div>
                <p className="text-gray-600">Total Amount</p>
                <p className="text-lg font-bold">₹{selectedOrder.totalAmount}</p>
              </div>
              <div>
                <p className="text-gray-600">Customer Name</p>
                <p className="text-lg font-bold">{selectedOrder.customerName}</p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <p className={`text-lg font-bold ${selectedOrder.status === 'confirmed' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {selectedOrder.status}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-600">Address</p>
                <p className="text-lg">{selectedOrder.address}</p>
              </div>
            </div>

            {/* Items */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3">Items in Order</h3>
              <div className="space-y-2">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>{item.name} x {item.quantity}</span>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {selectedOrder.status !== 'confirmed' && (
            <form onSubmit={(e) => handleUploadPayment(e, selectedOrder.id)} className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-bold mb-4">Upload Payment Screenshot</h3>

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
          )}
        </motion.div>
      )}
    </div>
  );
};

export default OrderSearch;
