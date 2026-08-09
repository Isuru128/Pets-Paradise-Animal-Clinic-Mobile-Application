# Pets Paradise – Animal Clinic Mobile Application

Pets Paradise is a mobile application for an animal clinic, built as a monorepo containing a React Native mobile app and a Node.js backend API.

## Project Structure

```
pets-paradise-app/
├── backend/          # Node.js/Express backend API
│   ├── src/
│   ├── uploads/
│   ├── server.js
│   ├── .env.example
│   └── package.json
├── mobile/           # React Native mobile application
└── .gitignore
```

## Tech Stack

**Backend**
- Node.js
- Express.js
- MongoDB (via Mongoose)
- JWT-based authentication

**Mobile**
- React Native (Expo)

> Note: Update this section with additional libraries in use (e.g. navigation, state management) if relevant.

## Features

- User authentication (register/login)
- Pet profile creation
- Add pet records to the relevant pet profile
- Appointment booking
- Pet item ordering

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- MongoDB instance (local or Atlas)
- React Native development environment ([setup guide](https://reactnative.dev/docs/environment-setup))

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env   # then fill in your actual values
npm start
```

### Mobile Setup

```bash
cd mobile
npm install
npx expo start
```

Then scan the QR code with the Expo Go app, or press `a` / `i` to launch on an Android/iOS simulator.

## Environment Variables

See `backend/.env.example` for the required environment variables (database connection string, JWT secret, port, etc.).

## Contributing

This is a student project developed as part of a BSc (Hons) in Information Technology coursework.

## License