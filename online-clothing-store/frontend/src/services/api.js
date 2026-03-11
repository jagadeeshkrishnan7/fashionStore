import axios from 'axios';

const API_BASE = 'https://61bc-2401-4900-7b9e-b174-b444-5d60-a2f8-982e.ngrok-free.app/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// when displaying images stored on backend we need base URL (without /api)
export const IMAGE_BASE = API_BASE.replace(/\/api$/, '');

// Products API
export const getProducts = () => api.get('/products');
export const getProductsByCategory = (category) => api.get(`/products/category/${category}`);
export const addProduct = (productData) => {
  if (productData instanceof FormData) {
    return api.post('/products/add', productData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
  return api.post('/products/add', productData);
};
export const updateProduct = (id, productData) => {
  if (productData instanceof FormData) {
    return api.put(`/products/update/${id}`, productData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
  return api.put(`/products/update/${id}`, productData);
};
export const deleteProduct = (id) => api.delete(`/products/delete/${id}`);

// Categories API
export const getCategories = () => api.get('/categories');
export const addCategory = (categoryData) => {
  if (categoryData instanceof FormData) {
    return api.post('/categories/add', categoryData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
  return api.post('/categories/add', categoryData);
};
export const deleteCategory = (id) => api.delete(`/categories/delete/${id}`);

// Orders API
export const createOrder = (orderData) => api.post('/orders', orderData);
export const getOrders = (mobileNumber) => api.get('/orders', { params: { mobile: mobileNumber } });
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const uploadPaymentScreenshot = (orderId, screenshotFile, paymentMethod) => {
  const formData = new FormData();
  formData.append('screenshot', screenshotFile);
  formData.append('paymentMethod', paymentMethod);
  return api.post(`/orders/${orderId}/upload-payment`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// Admin API
export const adminLogin = (username, password) => api.post('/admin/login', { username, password });
export const getTheme = () => api.get('/theme');
export const updateTheme = (themeData) => api.put('/admin/theme', themeData);
export const getAds = () => api.get('/ads');
export const addAd = (adData) => api.post('/admin/ads', adData);
export const deleteAd = (id) => api.delete(`/admin/ads/${id}`);

// Settings
export const getAdminSettings = () => api.get('/admin/settings');
export const updateAdminSettings = (settings) => api.put('/admin/settings', settings);

export default api;
