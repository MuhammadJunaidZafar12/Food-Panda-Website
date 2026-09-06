# 🐼 FoodPanda Clone — Full-Stack Food & Grocery Delivery Platform

[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101?style=flat-square&logo=socketdotio&logoColor=white)](https://socket.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38B2AC?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.x-764ABC?style=flat-square&logo=redux&logoColor=white)](https://redux-toolkit.js.org/)

A production-grade, full-stack food delivery application inspired by Foodpanda. Built with a modern decoupled architecture featuring **React 19**, **Redux Toolkit**, **Express 5**, **MongoDB**, **Leaflet Maps (OSRM Routing)**, **Cloudinary Media Storage**, and **Socket.IO** for live real-time order tracking.

---

## 📑 Table of Contents

- [✨ Key Features](#-key-features)
- [👥 User Roles & Permissions (RBAC)](#-user-roles--permissions-rbac)
- [🗺️ Interactive Maps & Geo-location](#️-interactive-maps--geo-location)
- [⚡ Real-Time Engine (WebSockets)](#-real-time-engine-websockets)
- [💰 Pricing & GST Calculation Engine](#-pricing--gst-calculation-engine)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Directory Structure](#-directory-structure)
- [🔌 REST API Reference](#-rest-api-reference)
- [⚙️ Environment Variables](#️-environment-variables)
- [🚀 Getting Started & Local Setup](#-getting-started--local-setup)
- [📦 Deployment](#-deployment)

---

## ✨ Key Features

### 🛒 Customer Experience
- **Geo-located Discovery**: Detect user location via GPS or browse by city and cuisine.
- **Dynamic Restaurant Menus**: Filter dishes by category, view dietary tags, and search products.
- **Cart Management**: Single-restaurant cart validation with automated conflict prompts, item quantity controls, and live subtotal calculations.
- **Seamless Checkout**: Pin delivery address directly on an interactive Leaflet map with geocoding, choose payment methods (Cash on Delivery, Card, Digital Wallet), and add delivery instructions.
- **Live Order Tracking**: Visual progress timeline, driver location on interactive map, and real-time status updates via WebSockets.
- **Order History & Invoices**: Detailed order review, status badges, price breakdown, and cancellation workflows.

### 🍽️ Restaurant Owner Hub
- **Store Management**: Create and manage restaurant profiles (logo, banner, delivery fee, minimum order, opening hours, delivery radius).
- **Product & Menu CRUD**: Add, edit, toggle availability, and delete menu items with Cloudinary image uploads.
- **Live Order Management**: Real-time incoming order dashboard with stage-by-stage transitions (`Pending` ➔ `Accepted` ➔ `Preparing` ➔ `Ready` ➔ `Out for Delivery` ➔ `Delivered`).
- **Interactive Analytics**: Revenue trends, peak ordering hours, top-selling dishes, and order status distribution powered by Recharts.

### 🛵 Delivery Rider Portal
- **Delivery Job Queue**: View and claim available unassigned deliveries in the active operational zone.
- **Turn-by-Turn Navigation**: Real-time pickup and dropoff coordinates with OSRM routing and directions.
- **Status Workflow**: Direct actions for pickup confirmation and cash-on-delivery collection verification.
- **Live GPS Broadcasting**: Continuous background coordinate updates broadcasted to customers.

### 🛡️ Super Admin Control Center
- **Restaurant Moderation**: Review pending merchant registrations with direct "Approve", "Reject", and detailed "View" preview capabilities.
- **System-Wide Order Oversight**: Manage all platform orders, inspect rider assignments, and reassign orders if necessary.
- **User & Rider Management**: Manage customer and rider accounts, toggle active/blocked statuses, and monitor system performance.
- **Executive Dashboard**: Gross Merchandise Value (GMV), daily volume, active users, and restaurant metrics.

---

## 👥 User Roles & Permissions (RBAC)

| Role | Permissions & Access Scope |
| :--- | :--- |
| `customer` | Browse restaurants, add items to cart, checkout, view personal order history, live order tracking. |
| `owner` | Create/edit restaurants, manage menu items, process kitchen orders, access restaurant business analytics. |
| `rider` | View delivery assignments, accept/reject deliveries, update delivery progress, broadcast live GPS. |
| `admin` | Full platform oversight, approve/reject restaurants, user administration, manual order assignment, system metrics. |

---

## 🗺️ Interactive Maps & Geo-location

- **Leaflet & OpenStreetMap**: Integrated via `react-leaflet` with custom pinned icons for restaurants, customers, and riders.
- **Live Route Planning (OSRM)**: Calculates exact driving distance (km) and estimated travel duration (ETA).
- **Reverse Geocoding**: Automatically resolves human-readable addresses from map pin coordinates (Nominatim API).
- **Geo-Radius Filtering**: Validates restaurant delivery radius coverage based on customer GPS coordinates (Haversine formula).

---

## ⚡ Real-Time Engine (WebSockets)

Powered by **Socket.IO** with isolated room-based event channels:

```
[Customer Client] ─── connects to ───► Room: `order:{orderId}`
[Restaurant Owner] ── broadcasts ────► `order:status` event
[Delivery Rider]  ── broadcasts ────► `rider:location` event
```

- **`order:status`**: Pushes immediate status changes (Accepted, Preparing, Out for Delivery, Delivered, Cancelled).
- **`rider:location`**: Streams high-frequency rider GPS coordinates (`{ latitude, longitude, heading }`) straight to the tracking map.

---

## 💰 Pricing & GST Calculation Engine

All pricing calculations are enforced server-side and mirrored on the client:

$$\text{Subtotal} = \sum (\text{item.price} \times \text{item.quantity})$$
$$\text{GST (Sales Tax)} = \text{round}(\text{Subtotal} \times 0.05)$$
$$\text{Grand Total} = \text{Subtotal} + \text{Delivery Fee} + \text{GST} - \text{Discount}$$

- **5% GST**: Flat, transparent sales tax computed consistently across Cart Drawer, Checkout, Backend Database, Invoices, and Admin/Owner views.
- **Delivery Fee**: Configured individually per restaurant (or free delivery threshold).

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite 8
- **State Management**: Redux Toolkit (Thunks & Slices)
- **Styling**: Tailwind CSS 4 + Material UI (MUI 9) + Lucide Icons
- **Mapping**: Leaflet 1.9 + React-Leaflet + OpenStreetMap + OSRM
- **Charts & Data Viz**: Recharts 3
- **Notifications**: React Hot Toast

### Backend
- **Runtime & Framework**: Node.js 20+ & Express 5
- **Database & ODM**: MongoDB Atlas & Mongoose 9
- **Authentication**: JWT (JSON Web Tokens) with HTTP-only cookies & Bearer fallback
- **Real-Time Communication**: Socket.IO 4
- **File Uploads & Media Storage**: Multer & Cloudinary SDK
- **Security**: Bcrypt password hashing, CORS, Helmet protection, input sanitization

---

## 📁 Directory Structure

```text
FoodPanda/
├── backend/
│   ├── src/
│   │   ├── config/             # DB connection, Cloudinary config
│   │   ├── controllers/        # Express route handlers
│   │   ├── middleware/         # Auth, RBAC, Multer upload
│   │   ├── models/             # Mongoose schemas (User, Restaurant, Product, Cart, Order)
│   │   ├── routes/             # REST API routes
│   │   ├── services/           # Core business logic & database queries
│   │   ├── socket.js           # Socket.IO initialization & handlers
│   │   ├── app.js              # Express app setup & middleware
│   │   └── index.js            # Server entry point
│   └── package.json
│
├── frontend/
│   ├── public/                 # Static assets & Foodpanda SVG favicon
│   ├── src/
│   │   ├── api/                # Axios instance & interceptors
│   │   ├── assets/             # Logos, SVGs, static illustrations
│   │   ├── components/         # Reusable UI components
│   │   │   ├── admin/          # Admin tables & moderations
│   │   │   ├── analytics/      # Metric cards & Recharts graphs
│   │   │   ├── cart/           # CartDrawer & cart widgets
│   │   │   ├── map/            # Leaflet LocationPicker & LiveMap
│   │   │   ├── order/          # OrderSummary, OrderTimeline
│   │   │   ├── product/        # ProductCard, ProductModal
│   │   │   └── restaurant/     # RestaurantCard, RestaurantForm
│   │   ├── hooks/              # Custom React hooks (e.g. useUserLocation)
│   │   ├── pages/              # Application views
│   │   │   ├── admin/          # Admin dashboard, restaurant lists, orders
│   │   │   ├── auth/           # Login, Register
│   │   │   ├── home/           # Landing page
│   │   │   ├── order/          # Checkout, OrderDetails, Tracking
│   │   │   ├── owner/          # Owner dashboard, products, analytics
│   │   │   ├── restaurant/     # Restaurants catalog, RestaurantDetails
│   │   │   └── rider/          # Rider dashboard, active delivery
│   │   ├── redux/              # Redux slices & async thunks
│   │   ├── routes/             # AppRoutes & protected route guards
│   │   ├── services/           # API service modules
│   │   └── utils/              # Socket client, formatters, helpers
│   ├── index.html
│   └── package.json
│
├── vercel.json                 # Vercel deployment configuration
└── README.md
```

---

## 🔌 REST API Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user (`customer`, `owner`, `rider`) |
| `POST` | `/api/auth/login` | Public | Authenticate user and receive JWT cookie/token |
| `POST` | `/api/auth/logout` | Authenticated | Clear authentication token |
| `GET` | `/api/auth/me` | Authenticated | Get current logged-in user profile |
| `PUT` | `/api/auth/profile` | Authenticated | Update profile details and password |

### 🏪 Restaurants (`/api/restaurants`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/restaurants` | Public | List approved active restaurants (supports search/filter) |
| `GET` | `/api/restaurants/public/:id` | Public / Admin / Owner | Get restaurant details & menu items |
| `GET` | `/api/restaurants/my-restaurants` | Owner | Get all restaurants owned by the current user |
| `POST` | `/api/restaurants` | Owner | Create a new restaurant profile |
| `PUT` | `/api/restaurants/:id` | Owner | Update restaurant details, logo, or banner |
| `GET` | `/api/restaurants/pending` | Admin | Get list of restaurants pending approval |
| `PATCH` | `/api/restaurants/:id/approve` | Admin | Approve restaurant registration |
| `PATCH` | `/api/restaurants/:id/reject` | Admin | Reject restaurant registration |

### 🍔 Products (`/api/products`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Public | List products (filterable by `?restaurant=id`) |
| `POST` | `/api/products` | Owner | Add new product to restaurant menu |
| `PUT` | `/api/products/:id` | Owner | Update product details, pricing, or image |
| `DELETE` | `/api/products/:id` | Owner | Remove product from menu |

### 🛍️ Cart (`/api/cart`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/cart` | Customer | Fetch current user cart with totals & 5% GST |
| `POST` | `/api/cart` | Customer | Add item to cart (validates restaurant conflicts) |
| `PUT` | `/api/cart/:productId` | Customer | Update item quantity |
| `DELETE` | `/api/cart/:productId` | Customer | Remove specific item |
| `DELETE` | `/api/cart/clear` | Customer | Clear cart completely |

### 📦 Orders (`/api/orders`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | Customer | Create order from cart with delivery address & coordinates |
| `GET` | `/api/orders/my-orders` | Customer | Get customer's order history |
| `GET` | `/api/orders/:id` | Authenticated | Get order details by ID |
| `PUT` | `/api/orders/:id/cancel` | Customer / Admin | Cancel pending order |
| `GET` | `/api/orders/restaurant/:restaurantId` | Owner | Get incoming restaurant orders |
| `PUT` | `/api/orders/:id/status` | Owner / Admin | Update order status (`accepted`, `preparing`, etc.) |
| `GET` | `/api/orders/admin/all` | Admin | List all orders on the platform |

### 🛵 Rider Operations (`/api/riders`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/riders/available` | Rider | View available delivery assignments |
| `PUT` | `/api/riders/accept/:orderId` | Rider | Accept delivery job |
| `PUT` | `/api/riders/status/:orderId` | Rider | Update delivery status (`picked_up`, `delivered`) |
| `PUT` | `/api/riders/location` | Rider | Broadcast current GPS coordinates |

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
Create a `.env` file in the `backend` directory:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/foodpanda?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Cloudinary Media Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional: CORS & DNS
CORS_ORIGIN=http://localhost:5173
MONGO_DNS_SERVERS=8.8.8.8,8.8.4.4
```

### Frontend (`frontend/.env`)
Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn**
- **MongoDB Atlas** database connection string
- **Cloudinary** account credentials

### 1. Clone the Repository
```bash
git clone https://github.com/MuhammadJunaidZafar12/Food-Panda-Website.git
cd Food-Panda-Website
```

### 2. Backend Setup
```bash
cd backend
npm install

# Configure environment variables
cp .env.example .env   # Or create .env manually with required keys

# Start development server with nodemon
npm run dev
```
Backend will be running on `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Start Vite development server
npm run dev
```
Frontend will be running on `http://localhost:5173`.

---

## 📦 Deployment

### Production Build
To create an optimized production build of the frontend:
```bash
cd frontend
npm run build
```

### Full-Stack Vercel Deployment
The repository includes a configured [vercel.json](vercel.json) enabling seamless deployment to Vercel with serverless API proxy routing.

---

## 📄 License

This project is licensed under the **ISC License**. Developed as a modern full-stack web application.

---

## 👨‍💻 Author & Contact

**Muhammad Junaid Zafar**  
*MERN Stack / Full-Stack Developer*

- 📧 **Email:** [junaidzafar434@gmail.com](mailto:junaidzafar434@gmail.com)
- 📱 **Phone / WhatsApp:** [+92 346 1255799](tel:+923461255799)
- 🌐 **GitHub:** [https://github.com/MuhammadJunaidZafar12](https://github.com/MuhammadJunaidZafar12)
- 💼 **LinkedIn:** [https://www.linkedin.com/in/junaid-zafar70](https://www.linkedin.com/in/junaid-zafar70)
- 📍 **Location:** Pakistan
