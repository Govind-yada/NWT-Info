# NWT Info (Next World Tech) – Digital Services & Project Booking Platform

[![Node.js Version](https://img.shields.io/badge/Node.js-v24.x-339933?logo=node.js)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Verified%20Integration-02042B?logo=razorpay)](https://razorpay.com/)

A complete, production-ready full-stack MERN application for **NWT Info (Next World Tech)**, a premier digital services agency. Customers can browse dynamically configured digital services, select package tiers, submit requirements with attachments, schedule kickoff slots, and pay a transparent **30% advance via Razorpay**. The platform includes a full-featured customer portal, administrative command center with **Recharts** analytics, Google Calendar / MongoDB slot engine, and multi-step modal booking.

---

## 🚀 Key Features

### 1. Customer-Facing Digital Agency Website
- **Modern Dark Navy UI/UX**: Electric blue (`#3B82F6`) & violet (`#8B5CF6`) accents with glassmorphism and smooth micro-interactions.
- **Dynamic Services & Pricing**: All 7 service categories, pricing packages (Static, Classic, Premium), and features are loaded live from MongoDB—never hardcoded.
- **Rich Sections**: High-impact Hero, Services Showcase, Dynamic Package Comparison Cards, Why Choose Us, Portfolio Gallery, Client Reviews, FAQ Accordion, and Architectural Inquiry form.

### 2. Multi-Step Interactive Project Booking Engine
- **Step 1: Contact Information**: Name, Email, Phone, Company.
- **Step 2: Project Specifications**: Dynamic Service & Package selector, Project Title, Proposed Domain, Detailed Description, Feature tags, Reference websites.
- **Step 3: Document Uploads**: Up to 15MB file uploads (images, PDFs, DOCX, archives) handled via Multer and Cloudinary.
- **Step 4: Scheduling & Real-time Slot Availability**: Real-time conflict checks against `/api/bookings/check-availability` and Google Calendar to prevent double-booking.
- **Step 5: Authoritative 30% Advance Calculation**: Backend calculates `advanceAmount = Math.round(totalAmount * 0.30)` and `remainingAmount = totalAmount - advanceAmount` based on MongoDB prices.
- **Step 6: Razorpay Checkout & Confirmation**: Generates Razorpay Order, verifies cryptographic HMAC SHA-256 signature on backend, confirms booking, and generates an order reference number (`NWT-ORD-YYYYMM-XXXX`).

### 3. Customer Portal Dashboard
- **Overview**: 4 High-level metric cards, active deliverables, upcoming kickoff bookings.
- **My Projects & Orders**: Live tracking of deliverables with status badges (`Pending`, `Confirmed`, `In Progress`, `Review`, `Completed`, `Cancelled`).
- **Milestone Audit Trail**: Visual stepper and timestamped audit logs for every project update.
- **70% Balance Payment Collection**: If requested by admin, customers can settle their remaining 70% balance via one-click Razorpay checkout.
- **Scheduled Kickoffs**: Booked dates and time slots.
- **Payment History**: Audited transaction table with Razorpay payment IDs.
- **Profile & Password Settings**: Update contact information, address, and credentials.

### 4. Admin Command Center
- **Executive Analytics**: Recharts Monthly Revenue Area Chart (Advance vs Remaining Balances) and Project Status Distribution Donut Chart.
- **8 Core Operational Metrics**: Total Customers, Total Orders, New Orders, Active Projects, Completed, Total Revenue, 30% Advance Received, and 70% Balances Pending.
- **Service Management**: Full CRUD, category assignment, starting price, image upload, status toggle.
- **Package Management**: CRUD for package tiers (Static Website ₹6,999, Classic Website ₹9,999, Premium Website ₹18,999, etc.), feature checklists, delivery estimates, popularity badge.
- **Order Management**: Status updater with audit notes, kickoff date rescheduling (with calendar sync), and one-click remaining balance request generator.
- **Financial Ledger**: Complete audit trail of all transactions with Razorpay IDs.
- **Calendar & Slot Management**: Interactive monthly calendar with slot blocking/blackout tool.
- **Customer Directory**: Customer profiles, purchase history, and lifetime investment metrics.
- **Content CMS**: Full manager for Portfolio Case Studies, Client Testimonials, and FAQs.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, Framer Motion, Recharts, React Router DOM v6, Axios |
| **Backend** | Node.js (v24), Express.js, MongoDB / Mongoose, JWT, bcryptjs, Multer, Cloudinary, Razorpay Node.js SDK, googleapis |
| **Security** | Helmet, CORS, Express-Rate-Limit, HMAC SHA-256 Signature Verification, Role-Based Route Guards |
| **Database** | 10 Mongoose Collections (User, Service, Package, Order, Payment, Booking, CalendarEvent, Portfolio, Testimonial, FAQ) |

---

## 📁 Project Directory Structure

```text
nwt-info/
├── package.json               # Root scripts (dev:server, dev:client, seed, test, build)
├── README.md                  # Comprehensive platform documentation
├── .gitignore
│
├── client/                    # Frontend React + Vite SPA
│   ├── index.html             # Google Fonts & Razorpay SDK script
│   ├── package.json
│   ├── vite.config.js         # API proxy to http://localhost:5000
│   ├── tailwind.config.js     # Custom Navy & Electric accents design system
│   ├── postcss.config.js
│   ├── .env.example
│   └── src/
│       ├── assets/
│       ├── components/        # Navbar, Footer, ServiceCard, PackagePricingCard,
│       │                      # MultiStepBookingModal, ProjectTimeline, ProtectedRoute
│       ├── context/           # AuthContext (JWT/roles), BookingContext (6-step modal & Razorpay)
│       ├── layouts/           # CustomerLayout, AdminLayout
│       ├── pages/             # Home, About, Services, ServiceDetail, Portfolio, Contact,
│       │                      # Login, Register, ForgotPassword, ResetPassword
│       │   ├── customer/      # Overview, MyProjects, ProjectDetail, MyBookings,
│       │   │                  # PaymentHistory, CustomerCalendar, ProfileSettings
│       │   └── admin/         # AdminDashboard, AdminServices, AdminPackages, AdminOrders,
│       │                      # AdminPayments, AdminCalendar, AdminCustomers, AdminContent
│       ├── services/          # Axios instance with JWT interceptors
│       ├── utils/
│       ├── App.jsx            # Routing system
│       └── main.jsx
│
└── server/                    # Backend Express REST API
    ├── package.json
    ├── server.js              # Express app entry, security headers, rate limiting, routes
    ├── test-api.js            # Automated integration test suite
    ├── .env.example
    ├── uploads/               # Local fallback storage for uploaded specs & media
    └── src/
        ├── config/            # db.js (Atlas + Memory fallback), razorpay.js, cloudinary.js, googleCalendar.js
        ├── controllers/       # auth, service, package, booking, order, payment, calendar, admin, content
        ├── middleware/        # auth (protect/optionalAuth), admin, upload (Multer), error
        ├── models/            # 10 Mongoose schemas with validation and indexes
        ├── routes/            # REST API route handlers
        ├── seeds/             # seedDatabase.js (Initial services, packages, admin, customer, reviews)
        ├── services/          # Razorpay, Cloudinary, and Calendar integration services
        └── utils/             # Helpers, tokens, reference number generators
```

---

## 🔑 Default Credentials & Initial Data

The initial database seed script configures:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@nwtinfo.com` | `Admin@Nwt2026!` | Full Admin Command Center (`/admin`) |
| **Demo Customer** | `aarav@techventure.in` | `Customer@123` | Customer Portal (`/dashboard`) |

> **Note on Initial Setup:**  
> When the server starts for the first time, it automatically detects if the database is empty and auto-seeds all 7 digital services, package tiers, initial admin credentials, portfolio case studies, reviews, and FAQs!

---

## ⚙️ Environment Variables

### Server (`server/.env`)

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/nwt_info
JWT_SECRET=supersecretjwtkey_nwt_info_987654321_secure
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Razorpay Configuration (Test Mode Keys)
RAZORPAY_KEY_ID=rzp_test_mockKeyId12345
RAZORPAY_KEY_SECRET=mockRazorpaySecretKey987654
RAZORPAY_WEBHOOK_SECRET=mockWebhookSecretKey54321

# Cloudinary Storage Configuration
CLOUDINARY_CLOUD_NAME=mock_cloud
CLOUDINARY_API_KEY=mock_api_key
CLOUDINARY_API_SECRET=mock_api_secret

# Google Calendar API (Optional - local calendar fallback will activate if empty)
GOOGLE_CALENDAR_CLIENT_ID=
GOOGLE_CALENDAR_CLIENT_SECRET=
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:5000/api/calendar/oauth2callback
GOOGLE_CALENDAR_REFRESH_TOKEN=
GOOGLE_CALENDAR_ID=primary

# Initial Admin Credentials
ADMIN_EMAIL=admin@nwtinfo.com
ADMIN_PASSWORD=Admin@Nwt2026!
ADMIN_NAME=NWT System Administrator
```

### Client (`client/.env`)

```env
VITE_API_URL=/api
VITE_RAZORPAY_KEY_ID=rzp_test_mockKeyId12345
VITE_APP_NAME=NWT Info
```

---

## 🏁 Quickstart & Local Development

### 1. Install Dependencies
```bash
# From repository root
npm run install:all
```

### 2. Run Database Seeding
```bash
npm run seed
```

### 3. Run Automated Integration Test Suite
```bash
npm test
```

### 4. Start Development Servers
In two separate terminals:

```bash
# Terminal 1: Backend API Server (Port 5000)
npm run dev:server

# Terminal 2: Frontend Vite App (Port 5173)
npm run dev:client
```

Open your browser at **`http://localhost:5173`**.

---

## 💳 Razorpay & 30% Advance Architecture

1. **Package Price Integrity**: Package prices are strictly queried from MongoDB on the server. Frontend client prices are never trusted.
2. **Advance Calculation**: The server calculates `advanceAmount = Math.round(package.price * 0.30)`.
3. **Razorpay Order**: The backend creates an order with the amount in paise (`amount * 100`).
4. **Signature Verification**: Upon checkout completion, the frontend submits `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`. The backend verifies the HMAC SHA-256 signature using `RAZORPAY_KEY_SECRET`.
5. **Confirmation**: Only upon verified signature is the project marked `confirmed`, the booking date locked, and the customer receipt stored.
6. **Remaining Balance**: When a project reaches delivery, the admin triggers a remaining balance request. The customer sees an instant "Pay Remaining 70%" button in their portal.

---

## 📅 Google Calendar & Slot Engine

- If Google Calendar API OAuth credentials (`GOOGLE_CALENDAR_CLIENT_ID`, `GOOGLE_CALENDAR_CLIENT_SECRET`, `GOOGLE_CALENDAR_REFRESH_TOKEN`) are configured, bookings and rescheduled dates automatically synchronize with Google Calendar.
- If Google credentials are not set, the built-in **MongoDB-backed calendar** operates seamlessly with full slot conflict checking and admin blackout support.

---

## 🚢 Deployment Guide

### Frontend Deployment (Vercel)
1. Push repository to GitHub.
2. Import project into [Vercel](https://vercel.com/).
3. Set **Root Directory** to `client`.
4. Configure Environment Variables:
   - `VITE_API_URL` = `https://your-backend.onrender.com/api`
   - `VITE_RAZORPAY_KEY_ID` = `your_live_or_test_key_id`
5. Deploy.

### Backend Deployment (Render)
1. Create a **Web Service** on [Render](https://render.com/).
2. Set **Root Directory** to `server`.
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Configure Environment Variables (from `server/.env.example`).
6. Set `NODE_ENV` to `production`.

### Database (MongoDB Atlas)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a database user and whitelist IP `0.0.0.0/0`.
3. Copy connection string to `MONGODB_URI` on Render.

---

## 🛡️ License & Credits

Developed with precision for **NWT Info (Next World Tech)**.  
All rights reserved © 2026 Next World Tech.
