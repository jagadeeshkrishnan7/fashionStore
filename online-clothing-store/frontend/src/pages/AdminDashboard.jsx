import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, {
  getProducts,
  getCategories,
  addProduct,
  updateProduct,
  deleteProduct,
  addCategory,
  deleteCategory,
  getTheme,
  updateTheme,
  getAds,
  addAd,
  deleteAd,
  getAdminSettings,
  updateAdminSettings,
  IMAGE_BASE
} from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [ordersList, setOrdersList] = useState([]);
  const [settings, setSettings] = useState({ users: [], upi: {} });
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [ads, setAds] = useState(null);
  const [theme, setTheme] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    stock: '',
    files: []
  });
  const [categoryForm, setCategoryForm] = useState({ name: '', icon: '', image: '', file: null });
  const [themeForm, setThemeForm] = useState({});
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [orderForm, setOrderForm] = useState({
    customerName: '',
    mobileNumber: '',
    address: '',
    totalAmount: '',
    items: [] // array of {id, name, price, quantity}
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin');
      return;
    }
    loadData();
    loadSettings();
    loadOrders();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, categoriesRes, adsRes, themeRes] = await Promise.all([
        getProducts(),
        getCategories(),
        getAds(),
        getTheme()
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
      setAds(adsRes.data);
      setTheme(themeRes.data);
      setThemeForm(themeRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const res = await getAdminSettings();
      setSettings(res.data);
    } catch (err) {
      console.error('Error loading settings', err);
    }
  };

  const loadOrders = async () => {
    try {
      const res = await api.get('/admin/orders');
      setOrdersList(res.data);
    } catch (err) {
      console.error('Error loading orders', err);
    }
  };

  // order editing helpers
  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setOrderForm({
      customerName: order.customerName,
      mobileNumber: order.mobileNumber,
      address: order.address,
      totalAmount: order.totalAmount,
      items: Array.isArray(order.items) ? order.items : []
    });
  };

  // Calculate total from items
  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
  };

  const handleAddItem = () => {
    const newItems = [...orderForm.items, { id: Date.now(), name: '', price: 0, quantity: 1 }];
    const newTotal = calculateTotal(newItems);
    setOrderForm({ ...orderForm, items: newItems, totalAmount: newTotal });
  };

  const handleRemoveItem = (itemId) => {
    const newItems = orderForm.items.filter(item => item.id !== itemId);
    const newTotal = calculateTotal(newItems);
    setOrderForm({ ...orderForm, items: newItems, totalAmount: newTotal });
  };

  const handleUpdateItem = (itemId, field, value) => {
    const newItems = orderForm.items.map(item =>
      item.id === itemId ? { ...item, [field]: field === 'quantity' || field === 'price' ? parseFloat(value) : value } : item
    );
    const newTotal = calculateTotal(newItems);
    setOrderForm({ ...orderForm, items: newItems, totalAmount: newTotal });
  };

  const handleUpdateOrder = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        customerName: orderForm.customerName,
        mobileNumber: orderForm.mobileNumber,
        address: orderForm.address,
        totalAmount: parseFloat(orderForm.totalAmount),
        items: orderForm.items
      };
      await api.put(`/admin/orders/${editingOrder.id}`, payload);
      setEditingOrder(null);
      loadOrders();
      alert('Order updated successfully');
    } catch (error) {
      alert('Error updating order: ' + error.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingOrder(null);
  };

  const handleClearPayment = async (id) => {
    if (window.confirm('Remove payment screenshot and set status back to pending?')) {
      try {
        await api.put(`/admin/orders/${id}`, { clearPayment: true });
        loadOrders();
      } catch (err) {
        alert('Error clearing payment: ' + err.message);
      }
    }
  };

  // Product handlers
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(productForm).forEach(([key, value]) => {
        if (key === 'files') return;
        formData.append(key, value);
      });
      // Add multiple files
      if (productForm.files && productForm.files.length > 0) {
        productForm.files.forEach((file) => {
          formData.append('images', file);
        });
      }
      await addProduct(formData);
      setProductForm({
        name: '',
        description: '',
        price: '',
        category: '',
        image: '',
        stock: '',
        files: []
      });
      loadData();
      alert('Product added successfully!');
    } catch (error) {
      alert('Error adding product: ' + error.message);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(productForm).forEach(([key, value]) => {
        if (key === 'files') return;
        formData.append(key, value);
      });
      // Add multiple files
      if (productForm.files && productForm.files.length > 0) {
        productForm.files.forEach((file) => {
          formData.append('images', file);
        });
      }
      await updateProduct(editingProduct.id, formData);
      setProductForm({
        name: '',
        description: '',
        price: '',
        category: '',
        image: '',
        stock: '',
        files: []
      });
      setEditingProduct(null);
      loadData();
      alert('Product updated successfully!');
    } catch (error) {
      alert('Error updating product: ' + error.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await deleteProduct(id);
        loadData();
        alert('Product deleted successfully!');
      } catch (error) {
        alert('Error deleting product: ' + error.message);
      }
    }
  };

  // Category handlers
  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(categoryForm).forEach(([key, value]) => {
        if (key === 'file') return;
        formData.append(key, value);
      });
      if (categoryForm.file) {
        formData.append('image', categoryForm.file);
      }
      await addCategory(formData);
      setCategoryForm({ name: '', icon: '', image: '', file: null });
      loadData();
      alert('Category added successfully!');
    } catch (error) {
      alert('Error adding category: ' + error.message);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await deleteCategory(id);
        loadData();
        alert('Category deleted successfully!');
      } catch (error) {
        alert('Error deleting category: ' + error.message);
      }
    }
  };

  // Theme handlers
  const handleUpdateTheme = async (e) => {
    e.preventDefault();
    try {
      await updateTheme(themeForm);
      loadData();
      alert('Theme updated successfully!');
    } catch (error) {
      alert('Error updating theme: ' + error.message);
    }
  };

  // Ad handlers
  const handleAddAd = async (e) => {
    e.preventDefault();
    const adForm = new FormData(e.target);
    try {
      await addAd({
        title: adForm.get('title'),
        image: adForm.get('image'),
        link: adForm.get('link')
      });
      e.target.reset();
      loadData();
      alert('Ad added successfully!');
    } catch (error) {
      alert('Error adding ad: ' + error.message);
    }
  };

  const handleDeleteAd = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await deleteAd(id);
        loadData();
        alert('Ad deleted successfully!');
      } catch (error) {
        alert('Error deleting ad: ' + error.message);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin');
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-2xl">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-black text-white p-4 flex justify-between items-center sticky top-0 z-40">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {['home','products', 'categories', 'orders', 'settings', 'theme', 'ads', 'payments'].map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded font-bold capitalize ${
                activeTab === tab
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-gray-200'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tab}
            </motion.button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {/* Home Tab */}
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-lg shadow-lg p-6 text-center"
            >
              <h2 className="text-2xl font-bold mb-6">Welcome Admin</h2>
              {/* navigate to homepage in same tab so state refreshes */}
              <button
                onClick={() => navigate('/')}
                className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
              >
                Go to Homepage
              </button>
            </motion.div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <motion.div
              key="products"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold mb-6">Manage Products</h2>

              {/* Add/Edit Product Form */}
              <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="mb-8 p-4 bg-gray-50 rounded-lg border">
                <h3 className="text-xl font-bold mb-4">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="Product Name"
                    className="px-3 py-2 border rounded"
                    required
                  />
                  <input
                    type="text"
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Description"
                    className="px-3 py-2 border rounded"
                  />
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="Price"
                    className="px-3 py-2 border rounded"
                    required
                  />
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="px-3 py-2 border rounded"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {/* preview current or selected images */}
                  {(productForm.image || productForm.files.length > 0) && (
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium mb-2">Image Previews (Up to 5):</p>
                      <div className="flex gap-2 flex-wrap">
                        {/* Show selected images */}
                        {productForm.files.map((file, idx) => (
                          <div key={idx} className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`preview ${idx + 1}`}
                              className="w-24 h-24 object-cover rounded"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newFiles = productForm.files.filter((_, i) => i !== idx);
                                setProductForm({ ...productForm, files: newFiles });
                              }}
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ✕
                            </button>
                            <span className="absolute bottom-0 left-0 bg-black bg-opacity-70 text-white text-xs px-1 rounded-tr">{idx + 1}</span>
                          </div>
                        ))}
                        {/* Show existing image if editing */}
                        {editingProduct && productForm.image && productForm.files.length === 0 && (
                          <div>
                            <img
                              src={productForm.image + (editingProduct.updatedAt ? `?v=${new Date(editingProduct.updatedAt).getTime()}` : '')}
                              alt="current"
                              className="w-24 h-24 object-cover rounded border-2 border-blue-500"
                            />
                            <span className="text-xs text-gray-600">Current</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []).slice(0, 5);
                      setProductForm({ ...productForm, files });
                    }}
                    className="px-3 py-2 border rounded md:col-span-2"
                    placeholder="Select up to 5 images"
                  />
                  <p className="text-xs text-gray-600 md:col-span-2">Upload up to 5 images for the product (PNG, JPG, GIF)</p>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    placeholder="Stock Quantity"
                    className="px-3 py-2 border rounded"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                  {editingProduct && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProduct(null);
                        setProductForm({
                          name: '',
                          description: '',
                          price: '',
                          category: '',
                          image: '',
                          stock: '',
                          files: []
                        });
                      }}
                      className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              {/* Products List */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="p-2 text-left">Image</th>
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Category</th>
                      <th className="p-2 text-left">Price</th>
                      <th className="p-2 text-left">Stock</th>
                      <th className="p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          {(product.images && product.images.length > 0) || product.image ? (
                            <div className="flex items-center gap-2 flex-wrap">
                              {(product.images || [product.image]).map((img, idx) => (
                                <div key={idx} className="relative">
                                  <img
                                    src={
                                      img +
                                      (product.updatedAt ? `?v=${new Date(product.updatedAt).getTime()}` : '')
                                    }
                                    alt={`${product.name} ${idx + 1}`}
                                    className="w-12 h-12 object-cover rounded"
                                    title={`Image ${idx + 1}`}
                                  />
                                  <span className="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white text-xs px-1 rounded-tl">{idx + 1}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-500">No images</span>
                          )}
                        </td>
                        <td className="p-2">{product.name}</td>
                        <td className="p-2">{product.category}</td>
                        <td className="p-2">₹{product.price}</td>
                        <td className="p-2">{product.stock}</td>
                        <td className="p-2 space-x-2">
                          <button
                            onClick={() => {
                              setEditingProduct(product);
                              setProductForm(product);
                            }}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <motion.div
              key="categories"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold mb-6">Manage Categories</h2>

              <form onSubmit={handleAddCategory} className="mb-8 p-4 bg-gray-50 rounded-lg border">
                <h3 className="text-xl font-bold mb-4">Add New Category</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    placeholder="Category Name"
                    className="px-3 py-2 border rounded"
                    required
                  />
                  <input
                    type="text"
                    value={categoryForm.icon}
                    onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                    placeholder="Icon Emoji"
                    className="px-3 py-2 border rounded"
                  />
                  <input
                    type="text"
                    value={categoryForm.image}
                    onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                    placeholder="Image URL"
                    className="px-3 py-2 border rounded"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCategoryForm({ ...categoryForm, file: e.target.files[0] })}
                    className="px-3 py-2 border rounded"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Add Category
                </button>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <motion.div
                    key={category.id}
                    className="p-4 bg-gray-50 rounded-lg border"
                    whileHover={{ scale: 1.02 }}
                  >
                    <p className="text-3xl mb-2">{category.icon}</p>
                    <h3 className="font-bold text-lg mb-2">{category.name}</h3>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="w-full bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold mb-6">Manage Orders</h2>
              {editingOrder && (
                <form onSubmit={handleUpdateOrder} className="mb-6 p-4 bg-gray-50 rounded-lg border">
                  <h3 className="text-xl font-bold mb-4">Edit Order {editingOrder.orderNumber}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={orderForm.customerName}
                      onChange={(e) => setOrderForm({ ...orderForm, customerName: e.target.value })}
                      placeholder="Customer Name"
                      className="px-3 py-2 border rounded"
                    />
                    <input
                      type="text"
                      value={orderForm.mobileNumber}
                      onChange={(e) => setOrderForm({ ...orderForm, mobileNumber: e.target.value })}
                      placeholder="Mobile Number"
                      className="px-3 py-2 border rounded"
                    />
                    <input
                      type="text"
                      value={orderForm.address}
                      onChange={(e) => setOrderForm({ ...orderForm, address: e.target.value })}
                      placeholder="Address"
                      className="px-3 py-2 border rounded"
                    />
                    <input
                      type="number"
                      value={orderForm.totalAmount}
                      onChange={(e) => setOrderForm({ ...orderForm, totalAmount: e.target.value })}
                      placeholder="Total Amount"
                      className="px-3 py-2 border rounded"
                    />
                    <textarea
                      value={orderForm.items}
                      onChange={(e) => setOrderForm({ ...orderForm, items: e.target.value })}
                      placeholder="Items JSON"
                      className="px-3 py-2 border rounded col-span-2"
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="p-2 text-left">Order #</th>
                      <th className="p-2 text-left">Customer</th>
                      <th className="p-2 text-left">Total</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-left">Payment</th>
                      <th className="p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersList.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">{order.orderNumber}</td>
                        <td className="p-2">{order.customerName}</td>
                        <td className="p-2">₹{order.totalAmount}</td>
                        <td className="p-2">{order.status}</td>
                        <td className="p-2">
                          {order.paymentScreenshot ? (
                            (() => {
                              const base =
                                order.paymentScreenshot.startsWith('http')
                                  ? ''
                                  : IMAGE_BASE;
                              return (
                                <a
                                  href={base + order.paymentScreenshot}
                                  download
                                  className="text-blue-600 hover:underline"
                                >
                                  Screenshot
                                </a>
                              );
                            })()
                          ) : (
                            <span className="text-gray-500">—</span>
                          )}
                        </td>
                        <td className="p-2 space-x-2">
                          <button
                            onClick={() => handleEditOrder(order)}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              const allowed = ['pending','confirmed','shipped','delivered','cancelled'];
                              const newStatus = prompt('Enter new status (pending, confirmed, shipped, delivered, cancelled)', order.status);
                              if (newStatus && allowed.includes(newStatus)) {
                                api.put(`/admin/orders/${order.id}`, { status: newStatus })
                                  .then(loadOrders);
                              } else if (newStatus) {
                                alert('Invalid status entered');
                              }
                            }}
                            className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                          >
                            Change Status
                          </button>
                          {order.paymentScreenshot && (
                            <button
                              onClick={() => handleClearPayment(order.id)}
                              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                            >
                              Remove Payment
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Theme Tab */}
          {activeTab === 'theme' && (
            <motion.div
              key="theme"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold mb-6">Customize Theme</h2>

              <form onSubmit={handleUpdateTheme} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Store Name</label>
                  <input
                    type="text"
                    value={themeForm.storeName || ''}
                    onChange={(e) => setThemeForm({ ...themeForm, storeName: e.target.value })}
                    placeholder="Store Name"
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Watermark Text</label>
                  <input
                    type="text"
                    value={themeForm.watermarkText || ''}
                    onChange={(e) => setThemeForm({ ...themeForm, watermarkText: e.target.value })}
                    placeholder="Watermark Text"
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Contact Email</label>
                  <input
                    type="email"
                    value={themeForm.contact?.email || ''}
                    onChange={(e) => setThemeForm({
                      ...themeForm,
                      contact: { ...themeForm.contact, email: e.target.value }
                    })}
                    placeholder="email@example.com"
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Contact Phone</label>
                  <input
                    type="text"
                    value={themeForm.contact?.phone || ''}
                    onChange={(e) => setThemeForm({
                      ...themeForm,
                      contact: { ...themeForm.contact, phone: e.target.value }
                    })}
                    placeholder="+1 800-123-456"
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Contact Address</label>
                  <textarea
                    value={themeForm.contact?.address || ''}
                    onChange={(e) => setThemeForm({
                      ...themeForm,
                      contact: { ...themeForm.contact, address: e.target.value }
                    })}
                    className="w-full px-4 py-2 border rounded"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Background Color</label>
                  <input
                    type="color"
                    value={themeForm.backgroundColor || '#ffffff'}
                    onChange={(e) => setThemeForm({ ...themeForm, backgroundColor: e.target.value })}
                    className="w-16 h-10 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Primary Color</label>
                  <input
                    type="color"
                    value={themeForm.colors?.primary || '#000000'}
                    onChange={(e) => setThemeForm({
                      ...themeForm,
                      colors: { ...themeForm.colors, primary: e.target.value }
                    })}
                    className="w-16 h-10 border rounded"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 font-bold"
                >
                  Update Theme
                </button>
              </form>
            </motion.div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold mb-6">Admin Settings</h2>
              <div className="mb-6">
                <h3 className="font-bold mb-2">Existing Users</h3>
                <ul className="list-disc ml-6">
                  {settings.users.map(u => <li key={u.username}>{u.username}</li>)}
                </ul>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const uname = e.target.username.value;
                  const pwd = e.target.password.value;
                  if (uname && pwd) {
                    updateAdminSettings({ newUser: { username: uname, password: pwd } })
                      .then(loadSettings);
                    e.target.reset();
                    alert('User added');
                  }
                }}
                className="mb-6"
              >
                <h3 className="font-bold mb-2">Add Admin User</h3>
                <div className="flex gap-2">
                  <input name="username" placeholder="username" className="px-3 py-2 border rounded" required />
                  <input name="password" type="password" placeholder="password" className="px-3 py-2 border rounded" required />
                  <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Add</button>
                </div>
              </form>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const uname = e.target.changeUser.value;
                  const pwd = e.target.changePass.value;
                  if (uname && pwd) {
                    updateAdminSettings({ username: uname, password: pwd }).then(loadSettings);
                    e.target.reset();
                    alert('Password changed');
                  }
                }}
                className="mb-6"
              >
                <h3 className="font-bold mb-2">Change Password</h3>
                <div className="flex gap-2">
                  <input name="changeUser" placeholder="username" className="px-3 py-2 border rounded" required />
                  <input name="changePass" type="password" placeholder="new password" className="px-3 py-2 border rounded" required />
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Update</button>
                </div>
              </form>

            </motion.div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <motion.div
              key="payments"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold mb-6">Update UPI Numbers</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const phonepe = e.target.phonepe.value;
                  const googlepay = e.target.googlepay.value;
                  updateAdminSettings({ upi: { phonepe, googlepay } }).then(loadSettings);
                  alert('UPI updated');
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm">PhonePe UPI</label>
                    <input
                      name="phonepe"
                      defaultValue={settings.upi?.phonepe || ''}
                      className="px-3 py-2 border rounded w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm">Google Pay UPI</label>
                    <input
                      name="googlepay"
                      defaultValue={settings.upi?.googlepay || ''}
                      className="px-3 py-2 border rounded w-full"
                    />
                  </div>
                </div>
                <button className="mt-4 bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700">
                  Save UPI
                </button>
              </form>
            </motion.div>
          )}

          {/* Ads Tab */}
          {activeTab === 'ads' && (
            <motion.div
              key="ads"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold mb-6">Manage Advertisements</h2>

              <form onSubmit={handleAddAd} className="mb-8 p-4 bg-gray-50 rounded-lg border">
                <h3 className="text-xl font-bold mb-4">Add Banner</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <input
                    type="text"
                    name="title"
                    placeholder="Banner Title"
                    className="px-3 py-2 border rounded"
                    required
                  />
                  <input
                    type="text"
                    name="image"
                    placeholder="Image URL"
                    className="px-3 py-2 border rounded"
                    required
                  />
                  <input
                    type="text"
                    name="link"
                    placeholder="Link"
                    className="px-3 py-2 border rounded"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Add Banner
                </button>
              </form>

              {ads && ads.banners && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {ads.banners.map((ad) => (
                    <motion.div
                      key={ad.id}
                      className="border rounded-lg overflow-hidden"
                      whileHover={{ scale: 1.02 }}
                    >
                      <img
                        src={ad.image}
                        alt={ad.title}
                        className="w-full h-40 object-cover"
                      />
                      <div className="p-3">
                        <h3 className="font-bold">{ad.title}</h3>
                        <button
                          onClick={() => handleDeleteAd(ad.id)}
                          className="mt-2 w-full bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;
