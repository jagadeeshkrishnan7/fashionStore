# Online Clothing Store

A complete e-commerce solution with React frontend and Node.js backend, featuring product management, cart functionality, payment processing, and admin dashboard.

## Features

### Frontend (React + Vite)
- 🛒 Shopping cart with localStorage persistence
- 🔍 Product search functionality
- 📱 Responsive design with Tailwind CSS
- 🎨 Animated UI with Framer Motion
- 🖼️ Banner slider with Swiper.js
- 🛍️ Category-based product filtering

### Backend (Node.js + Express)
- 📦 Product and category management
- 🛒 Order processing and tracking
- 💳 Payment screenshot upload
- 🔐 Admin authentication
- 🎨 Theme customization
- 📊 Advertisement management

### Admin Features
- ➕ Add/Edit/Delete products (with image upload)
- 📂 Manage categories (including image upload)
- 🎨 Customize store theme and contact information
- 🖼️ Upload advertisement banners
- 📈 View orders and manage inventory

## Project Structure

```
online-clothing-store/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── routes/
│   │   ├── products.js
│   │   ├── categories.js
│   │   ├── orders.js
│   │   └── admin.js
│   ├── data/
│   │   ├── products.json
│   │   ├── categories.json
│   │   ├── orders.json
│   │   ├── theme.json
│   │   └── ads.json
│   ├── uploads/payments/
│   └── middleware/upload.js
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    ├── public/images/
    └── src/
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   ├── ProductCard.jsx
        │   ├── CategoryMenu.jsx
        │   ├── SearchBar.jsx
        │   ├── CartDrawer.jsx
        │   └── BannerSlider.jsx
        ├── pages/
        │   ├── Home.jsx
        │   ├── SearchPage.jsx
        │   ├── CartPage.jsx
        │   ├── OrderSearch.jsx
        │   ├── AdminLogin.jsx
        │   └── AdminDashboard.jsx
        ├── services/api.js
        ├── context/CartContext.jsx
        ├── App.jsx
        ├── main.jsx
        └── index.css
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd online-clothing-store/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the backend server:
   ```bash
   npm start
   ```
   or for development with auto-reload:
   ```bash
   npm run dev
   ```

   The backend will run on `http://localhost:5000`

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd online-clothing-store/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:3000`

## Usage

### Customer Features
- Browse products by category
- Search for products
- Add items to cart
- Proceed to checkout
- Upload payment screenshots
- Track orders by mobile number

### Admin Features
- Access admin panel at `/admin`
- **Login Credentials:**
  - Username: `admin`
  - Password: `adminpass`
- Edit contact details (email, phone, address) shown in footer
- Upload images directly when creating or editing products and categories

### Payment Integration
The app supports UPI payments with deep links for:
- PhonePe
- Google Pay
- Paytm

After order creation, users get payment options with pre-filled UPI links.

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/category/:category` - Get products by category
- `POST /api/products/add` - Add new product (admin)
- `PUT /api/products/update/:id` - Update product (admin)
- `DELETE /api/products/delete/:id` - Delete product (admin)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories/add` - Add category (admin)
- `DELETE /api/categories/delete/:id` - Delete category (admin)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders?mobile=` - Get orders by mobile number
- `POST /api/orders/:id/upload-payment` - Upload payment screenshot

### Admin
- `POST /api/admin/login` - Admin login
- `GET /api/theme` - Get theme settings
- `PUT /api/admin/theme` - Update theme (admin)
- `GET /api/ads` - Get advertisements
- `POST /api/admin/ads` - Add advertisement (admin)
- `DELETE /api/admin/ads/:id` - Delete advertisement (admin)

## Data Storage

All data is stored in JSON files in the `backend/data/` directory:
- `products.json` - Product catalog
- `categories.json` - Product categories
- `orders.json` - Customer orders
- `theme.json` - Store theme settings
- `ads.json` - Advertisement banners

Payment screenshots are stored in `backend/uploads/payments/`

## Technologies Used

### Frontend
- React 18
- Vite
- Tailwind CSS
- Framer Motion
- Swiper.js
- Axios
- React Router

### Backend
- Node.js
- Express.js
- Multer (file uploads)
- CORS
- fs (file system operations)

## Development

### Adding New Features
1. Backend: Add new routes in `routes/` directory
2. Frontend: Add new components in `components/` directory
3. Update API calls in `services/api.js`

### Customization
- Modify theme colors in admin dashboard
- Update store name and watermark text
- Add new product categories
- Upload custom advertisement banners

## License

MIT License - feel free to use this project for learning and development purposes.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Happy Shopping! 🛍️**
