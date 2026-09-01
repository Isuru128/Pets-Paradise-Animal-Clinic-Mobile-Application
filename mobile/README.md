# 🐾 Pets Paradise — Mobile App

A React Native (Expo) mobile application for the **Pets Paradise Animal Clinic**, enabling pet owners to manage their pets, book appointments, browse the shop, and track orders — all from their phone.

---

## 📱 Tech Stack

| Technology | Purpose |
|---|---|
| [React Native](https://reactnative.dev/) | Cross-platform mobile framework |
| [Expo SDK 55](https://expo.dev/) | Managed workflow & native APIs |
| [Expo Router v4](https://docs.expo.dev/router/introduction/) | File-based routing |
| [Axios](https://axios-http.com/) | HTTP client for API calls |
| [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) | Local token storage |
| [React Navigation](https://reactnavigation.org/) | Bottom tabs & stack navigation |
| [EAS Build](https://docs.expo.dev/build/introduction/) | Cloud build service (APK / IPA) |

---

## 🗂️ Project Structure

```
mobile/
├── app/                        # File-based routes (Expo Router)
│   ├── _layout.js              # Root layout (SafeArea + StatusBar)
│   ├── index.js                # Login screen
│   ├── register.js             # Registration screen
│   ├── profile.js              # User profile management
│   ├── HomeScreen.js           # Home screen
│   ├── user/                   # Authenticated user screens
│   │   ├── dashboard.js        # User dashboard
│   │   ├── pets.js             # Pet management
│   │   ├── appointments.js     # Appointment booking
│   │   ├── shop.js             # Product shop
│   │   ├── cart.js             # Shopping cart
│   │   ├── checkout.js         # Order checkout
│   │   └── orders.js           # Order history
│   └── admin/                  # Admin-only screens
│       ├── dashboard.js        # Admin dashboard
│       ├── appointments.js     # Manage appointments
│       ├── pets.js             # Manage all pets
│       ├── product.js          # Manage products
│       ├── inventory.js        # Inventory management
│       └── orders.js           # Manage orders
├── src/
│   ├── services/
│   │   └── api.js              # Axios instance + auth interceptor
│   ├── context/
│   │   └── AuthContext.js      # Authentication state provider
│   ├── components/             # Reusable UI components
│   │   ├── CustomButton.js
│   │   ├── CustomInput.js
│   │   ├── cards/
│   │   ├── common/
│   │   └── home/
│   ├── data/                   # Static/mock data
│   └── navigation/             # Navigation helpers
├── assets/
│   └── images/                 # App icons, splash screen, etc.
├── .env                        # Environment variables (not committed)
├── .env.example                # Environment variable template
├── app.json                    # Expo app configuration
├── eas.json                    # EAS Build profiles
└── package.json
```

---

## ⚙️ Environment Setup

### 1. Clone & install dependencies

```bash
git clone <repo-url>
cd mobile
npm install
```

### 2. Configure environment variables

Copy the example env file and set your backend URL:

```bash
cp .env.example .env
```

Edit `.env`:

```env
EXPO_PUBLIC_API_URL=https://pets-paradise-mobile-application-ba.vercel.app/api
```

> **Note:** The app automatically uses the local dev server URL in development (`__DEV__` mode). The `EXPO_PUBLIC_API_URL` is used for **production/preview builds**.

---

## 🚀 Running Locally

### Start the Expo dev server

```bash
npx expo start
```

Then choose one of:

| Option | Command |
|---|---|
| Expo Go (phone) | Scan QR code with [Expo Go app](https://expo.dev/go) |
| Android Emulator | Press `a` in terminal |
| iOS Simulator (macOS) | Press `i` in terminal |
| Web browser | Press `w` in terminal |

### Platform-specific shortcuts

```bash
npm run android   # Open directly on Android emulator
npm run ios       # Open directly on iOS simulator
npm run web       # Open in browser
```

---

## 📦 Building the App (EAS Build)

This project uses [EAS Build](https://docs.expo.dev/build/introduction/) for cloud-based builds. You'll need an [Expo account](https://expo.dev/signup) and EAS CLI installed:

```bash
npm install -g eas-cli
eas login
```

### Build profiles (`eas.json`)

| Profile | Distribution | Notes |
|---|---|---|
| `development` | Internal | Includes dev client for debugging |
| `preview` | Internal | APK/IPA for internal testing |
| `production` | Store | Auto-increments version; APK for Android |

### Build commands

```bash
# Development build (with dev client)
eas build --profile development --platform android

# Preview APK (internal testing)
eas build --profile preview --platform android

# Production APK
eas build --profile production --platform android

# iOS builds (requires Apple Developer account)
eas build --profile production --platform ios
```

> 💡 **Tip:** For a local Android build without EAS cloud:
> ```bash
> npx expo run:android
> ```

---

## 🔐 Authentication Flow

1. User logs in → JWT token received from backend
2. Token stored in `AsyncStorage` via `AuthContext`
3. All API requests automatically attach the token via Axios interceptor in `src/services/api.js`
4. Role-based routing directs users to `/user/*` or `/admin/*` screens

---

## 🌐 Backend

The mobile app connects to the **Pets Paradise backend** deployed on Vercel:

```
https://pets-paradise-mobile-application-ba.vercel.app
```

> The backend handles authentication, pet records, appointments, products, orders, and inventory.

---

## 🔑 Key Features

- 🐶 **Pet Management** — Add, edit, and view pet profiles
- 📅 **Appointment Booking** — Schedule vet appointments with date/time picker
- 🛒 **Shop & Cart** — Browse products, add to cart, and checkout
- 📦 **Order Tracking** — View order history and status
- 👤 **User Profile** — Manage account details and profile photo
- 🛡️ **Admin Panel** — Full CRUD for appointments, pets, products, inventory, and orders

---

## 🛠️ Useful Scripts

```bash
npm run lint          # Run ESLint
npm run reset-project # Reset to blank app (moves starter code to app-example/)
```

---

## 📋 Requirements

- Node.js ≥ 18
- npm ≥ 9
- Expo CLI / EAS CLI
- Android Studio (for Android emulator) or Xcode (for iOS simulator, macOS only)

---

## 📄 License

This project is part of the **Pets Paradise Animal Clinic Mobile Application** academic project.
