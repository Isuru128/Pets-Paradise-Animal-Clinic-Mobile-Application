# 🐾 Pets Paradise – Animal Clinic & Pet Shop Mobile Application

[![Expo](https://img.shields.io/badge/Expo-SDK%2057-000020.svg?style=flat&logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.86-61DAFB.svg?style=flat&logo=react)](https://reactnative.dev)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933.svg?style=flat&logo=node.js)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-000000.svg?style=flat&logo=express)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg?style=flat&logo=mongodb)](https://www.mongodb.com)
[![EAS Build](https://img.shields.io/badge/EAS-Build%20%26%20Update-blueviolet.svg?style=flat&logo=expo)](https://expo.dev/eas)

**Pets Paradise** is a comprehensive, production-ready animal healthcare clinic and e-commerce mobile application. Built as a full-stack monorepo featuring an **Expo React Native mobile client** and a **Node.js/Express REST API**, it delivers modern shopping-app UX (persistent sessions, exit confirmation, and instant Over-The-Air updates) combined with clinical pet management.

---

## 📱 Features

### 🐶 User & Client Features
- **Persistent Session & Shopping App Lifecycle**:
  - Automatically logs in authenticated users on startup without flashing login credentials.
  - Intercepts mobile back navigation on the root dashboard to show an **"Exit App"** confirmation dialog (`Cancel` / `Exit`) without terminating the session.
- **Pet Profiles & Medical History**:
  - Create and manage multiple pet profiles (dog, cat, breed, age, birthday, weight, gender).
  - Digital medical records: attach diagnosis reports, prescription photos, and PDFs.
- **Appointment Scheduling**:
  - Interactive appointment booking with real-time clinic slot availability.
  - Cancel or review upcoming appointments with live status notifications.
- **Online Pet Shop & E-Commerce**:
  - Browse pet food, healthcare products, toys, and accessories with instant search and category filtering.
  - Manage cart items with dynamic quantity adjustments and stock limits.
  - Flexible checkout: auto-load saved shipping address or provide custom delivery details.
  - Multiple payment options: **Cash on Delivery**, **Debit Card**, and **Bank Transfer** (with image/PDF deposit slip upload).
- **Orders & Tracking**:
  - Track order lifecycles in real time: `Confirmed`, `Processing`, `Shipped`, and `Delivered`.
  - Review uploaded payment slips and itemized summaries.
- **Profile & Shipping Management**:
  - Manage contact details, mobile numbers (10-digit validation), and delivery addresses.
  - Secure in-app password changes with live asterisk input previews.

### 🛡️ Admin Management Dashboard
- **Clinic & Business Metrics**: Live statistical cards showing total registered pets, active orders, booked appointments, and catalog counts.
- **Product & Inventory Management**: Add, edit, and delete products, toggle featured listings, update prices, and monitor low-stock/out-of-stock badges.
- **Order Processing**: Review incoming customer orders, verify uploaded bank transfer receipts, and advance order delivery stages.
- **Appointment Control**: Monitor doctor sessions, track appointment dates, and update statuses.
- **Pet Records Oversight**: Search and view all registered patient pets and their medical attachments.

---

## 🎨 Design & Branding
- **Primary Theme**: Electric Brand Cyan (`#5CE1E6`) paired with deep black text (`#111827`) and soft icy tints (`#ECFEFF`, `#CFFAFE`).
- **Adaptive App Icon**: Custom centered dog & cat logo on solid `#5CE1E6` background with transparent foreground padding for Android squircles, circles, and rounded squares.
- **Typography & Components**: Clean typography, card elevations, smooth loaders, and accessible touch targets.

---

## 🏗️ Architecture & Project Structure

```
Pets-Paradise-Animal-Clinic-Mobile-Application/
├── backend/                             # Express REST API
│   ├── src/
│   │   ├── config/                      # Database & Cloudinary config
│   │   ├── controllers/                 # Business logic (auth, pets, appointments, shop, orders)
│   │   ├── middleware/                  # JWT auth, role validation, file upload (Multer)
│   │   ├── models/                      # Mongoose schemas (User, Pet, Appointment, Product, Order)
│   │   └── routes/                      # API endpoint definitions
│   ├── uploads/                         # Temporary upload staging
│   ├── .env.example                     # Backend environment template
│   ├── server.js                        # App entry point
│   └── package.json
│
├── mobile/                              # Expo React Native App
│   ├── app/                             # Expo Router file-based navigation
│   │   ├── _layout.js                   # Root provider and safe area wrapper
│   │   ├── index.js                     # Login & auto-session restore
│   │   ├── register.js                  # User registration
│   │   ├── profile.js                   # Profile & delivery address management
│   │   ├── user/                        # Client screens
│   │   │   ├── dashboard.js             # Client dashboard & quick actions
│   │   │   ├── shop.js                  # Product catalog
│   │   │   ├── cart.js                  # Shopping cart
│   │   │   ├── checkout.js              # Order checkout & payment proof
│   │   │   ├── orders.js                # Order history & receipts
│   │   │   ├── appointments.js          # Appointment scheduler
│   │   │   └── pets.js                  # Pet profiles & medical records
│   │   └── admin/                       # Admin screens
│   │       ├── dashboard.js             # Clinic statistics & navigation
│   │       ├── product.js               # Product catalog management
│   │       ├── orders.js                # Order processing & receipt verification
│   │       ├── appointments.js          # Appointment manager
│   │       └── pets.js                  # Patient directory
│   ├── assets/                          # App icons, splash screens, and images
│   ├── constants/                       # Theme colors and fonts
│   ├── src/
│   │   ├── components/                  # Reusable cards, buttons, banners, headers
│   │   └── services/                    # Axios API client with automatic JWT interceptor
│   ├── app.json                         # Expo configuration (icons, EAS project ID, OTA updates)
│   ├── eas.json                         # EAS Build & EAS Update channel profiles
│   ├── .env.example                     # Mobile environment template
│   └── package.json
│
└── README.md
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| **Mobile Client** | React Native 0.86, Expo SDK 57, Expo Router (file-based navigation) |
| **Mobile Storage & State** | `@react-native-async-storage/async-storage` |
| **Mobile Networking** | `axios` (with Bearer token auto-injection) |
| **Media & Pickers** | `expo-image`, `expo-image-picker`, `expo-document-picker`, `@react-native-community/datetimepicker` |
| **Icons & Styling** | `@expo/vector-icons` (Ionicons, MaterialIcons), StyleSheet API |
| **DevOps / CI** | EAS Build (cloud APK compilation), EAS Update (Over-The-Air JS delivery) |
| **Backend Runtime** | Node.js, Express.js |
| **Database** | MongoDB Atlas with Mongoose ODM |
| **Authentication** | JSON Web Tokens (JWT), `bcryptjs` password hashing |
| **Cloud File Storage** | Cloudinary / local multer multipart storage |
| **API Deployment** | Vercel Serverless / Node.js Server |

---

## 🚀 Getting Started & Setup Guide

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js**: v18.x or v20.x LTS ([Download](https://nodejs.org/))
- **npm** (comes with Node.js) or **yarn**
- **Git**: ([Download](https://git-scm.com/))
- **Expo Go App**: Download on your Android device from the Google Play Store (for local development).
- **EAS CLI** (for cloud APK building and OTA updates):
  ```bash
  npm install --global eas-cli
  ```

---

### 2. Clone the Repository
```bash
git clone https://github.com/Isuru128/Pets-Paradise-Animal-Clinic-Mobile-Application.git
cd Pets-Paradise-Animal-Clinic-Mobile-Application
```

---

### 3. Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the `backend/` directory:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your credentials:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/pets-paradise?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_here
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Start the backend server**:
   ```bash
   npm run dev    # or npm start
   ```
   The backend will be running at `http://localhost:5000`.

---

### 4. Mobile Setup

1. **Navigate to the mobile directory**:
   ```bash
   cd ../mobile
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the `mobile/` directory:
   ```bash
   cp .env.example .env
   ```
   Set your backend API URL (use your deployed Vercel URL or your computer's local IP address if running locally):
   ```env
   EXPO_PUBLIC_API_URL=https://pets-paradise-mobile-application-ba.vercel.app/api
   EXPO_UNSTABLE_HEADLESS=*
   ```
   > ⚠️ **Note for Local Testing**: If testing with a local backend server on a physical phone, replace `localhost` with your computer's local network IP (e.g. `http://192.168.1.100:5000/api`).

4. **Start the local Expo development server**:
   ```bash
   npx expo start
   ```
   - Open **Expo Go** on your Android phone and scan the displayed QR code.
   - Press `a` in the terminal to open on a connected Android emulator.

---

## 📦 Cloud Builds & APK Generation (EAS Build)

You can build standalone, directly installable Android APKs using Expo Application Services (EAS):

### 1. Log in to Expo
```bash
eas login
```

### 2. Build Testing / Preview APK
Produces an APK for internal testing:
```bash
eas build --platform android --profile preview
```

### 3. Build Production APK
Produces an optimized, standalone production APK:
```bash
eas build --platform android --profile production
```

Once the cloud build finishes, EAS provides a direct download link and QR code to install `petsparadise.apk` directly onto any Android device.

---

## ⚡ Over-The-Air (OTA) Updates (EAS Update)

With **EAS Update** configured in `mobile/app.json` and `mobile/eas.json`, you do **not** need to rebuild the APK every time you update JavaScript code, UI components, or fix bugs.

Whenever you make code changes:

### Push to Preview Branch:
```bash
cd mobile
eas update --branch preview --message "Your update description"
```

### Push to Production Branch:
```bash
cd mobile
eas update --branch production --message "Your update description"
```

The next time users open the app on their phones, the app downloads and displays the latest features automatically in the background.

---

## 🔌 API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new user account
- `POST /api/auth/login` - Authenticate user & return JWT token
- `GET /api/auth/me` - Retrieve authenticated user profile
- `PUT /api/auth/me` - Update profile details & delivery address
- `PUT /api/auth/change-password` - Update account password

### Pets & Medical Records (`/api/pets`)
- `GET /api/pets/my-pets` - Retrieve authenticated user's pets
- `POST /api/pets` - Register a new pet profile
- `PUT /api/pets/:id` - Update pet details
- `DELETE /api/pets/:id` - Remove a pet profile
- `POST /api/pets/:id/records` - Add a medical/vaccine record with file attachment
- `GET /api/pets/admin/all` - *(Admin)* Retrieve all clinic patient records

### Appointment Scheduling (`/api/appointments`)
- `GET /api/appointments/my-appointments` - List user's booked appointments
- `GET /api/appointments/slots?date=YYYY-MM-DD` - Get available time slots for a specific date
- `POST /api/appointments` - Book a new appointment
- `PUT /api/appointments/:id/cancel` - Cancel an existing appointment
- `GET /api/appointments/admin/all` - *(Admin)* View all appointments
- `PUT /api/appointments/:id/status` - *(Admin)* Update appointment status

### Products & Shop (`/api/products`)
- `GET /api/products` - List products with optional search, category, and sorting filters
- `GET /api/products/:id` - Get individual product details
- `POST /api/products` - *(Admin)* Create a new product listing
- `PUT /api/products/:id` - *(Admin)* Update product details and stock
- `DELETE /api/products/:id` - *(Admin)* Delete a product

### Shopping Cart (`/api/cart`)
- `GET /api/cart` - View user's current shopping cart
- `POST /api/cart` - Add a product to cart
- `PUT /api/cart/:productId` - Update item quantity
- `DELETE /api/cart/:productId` - Remove an item from cart
- `DELETE /api/cart` - Clear shopping cart

### Orders & Checkout (`/api/orders`)
- `POST /api/orders` - Place a new order with payment method & bank transfer slip attachment
- `GET /api/orders/my-orders` - List customer's order history
- `GET /api/orders/admin/all` - *(Admin)* Retrieve all customer orders
- `PUT /api/orders/:id/status` - *(Admin)* Advance order lifecycle (`Confirmed`, `Processing`, `Shipped`, `Delivered`, `Cancelled`)
- `DELETE /api/orders/:id` - *(Admin)* Remove an order

---

## 👥 Authors & Acknowledgements

- **Developer**: Isuru Dulanjaya ([@Isuru128](https://github.com/Isuru128))
- Developed as part of the **BSc (Hons) in Information Technology** mobile application development coursework.
- Special thanks to the **Google DeepMind / Antigravity** team and the **Expo / React Native community**.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).