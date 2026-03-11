# Fashion Store - Online Clothing E-commerce Application

A full-stack e-commerce application for selling clothing items with React frontend and Node.js Express backend.

## Features

- 🛍️ Product catalog with categories
- 🛒 Shopping cart functionality
- 💳 Online payment integration
- 📱 Responsive design with Tailwind CSS
- 🎨 Smooth animations with Framer Motion
- 🖼️ Product image gallery with Swiper
- 👨‍💼 Admin dashboard for product/order management
- 🔐 Admin authentication

## Tech Stack

### Frontend
- React 18.2
- Vite (Build tool)
- Tailwind CSS (Styling)
- Framer Motion (Animations)
- Swiper (Image carousel)
- Axios (API calls)

### Backend
- Node.js with Express
- Multer (File uploads)
- CORS enabled
- RESTful API

## Project Structure

```
online-clothing-store/
├── frontend/               # React Vite app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── context/       # Cart context
│   │   ├── services/      # API services
│   │   └── main.jsx
│   ├── public/            # Static files
│   └── package.json
└── backend/               # Node.js Express app
    ├── routes/            # API routes
    ├── data/              # JSON data files
    ├── public/images/     # Product & category images
    ├── server.js
    └── package.json
```

## Installation & Setup

### Backend Setup
```bash
cd online-clothing-store/backend
npm install
npm start          # or npm run dev for development
```
Backend runs on: `http://localhost:5000`

### Frontend Setup
```bash
cd online-clothing-store/frontend
npm install
npm run dev        # development mode
npm run build      # production build
npm run preview    # preview production build
```
Frontend runs on: `http://localhost:3000`

## Environment Configuration

### API Base URL
The frontend API calls are configured to use a remote backend server. To change the API URL:

Edit `online-clothing-store/frontend/src/services/api.js`:
```javascript
const API_BASE = 'https://your-api-url/api';
```

## GitHub Pages Deployment

The frontend is configured for automatic deployment to GitHub Pages.

### Prerequisites
1. GitHub Pages is enabled in repository settings
2. Deploy from: `gh-pages` branch (automatic)
3. Base path: `/fashionStore/`

### Automatic Deployment
The project includes a GitHub Actions workflow that automatically builds and deploys the frontend when you push to the `main` branch.

### Manual Build & Deploy
```bash
cd online-clothing-store/frontend
npm run build
# Deploy the dist/ folder to GitHub Pages
```

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/category/:category` - Get products by category
- `POST /api/products/add` - Add new product (admin)
- `PUT /api/products/update/:id` - Update product (admin)

### Categories
- `GET /api/categories` - Get all categories

### Orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders/create` - Create new order

### Admin
- `POST /api/admin/login` - Admin login

## Product Images

Product images are stored in:
```
backend/public/images/products/
```

Current products:
- prod-1773149846401.png - Blue T-Shirt
- prod-1773150584271.png - Cotton Shirt
- black-jeans.jpg
- summer-dress.jpg
- white-tee.jpg
- polo-shirt.jpg
- womens-blazer.jpg
- blue-shorts.jpg

## Configuration Files

### Frontend
- `vite.config.js` - Vite configuration with base path for GitHub Pages
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration

### Backend
- `server.js` - Express server setup
- Data files in `data/` directory

## License

MIT
