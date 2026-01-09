# KALAMAR - Setup Guide

## 📋 Prerequisites

Before you begin, make sure you have:
- Node.js 18+ installed
- A Google account for Firebase
- (Optional) Google AI Studio account for Gemini integration

## 🔥 Firebase Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `kalamar-home` (or your preferred name)
4. Disable Google Analytics (optional)
5. Click "Create project"

### Step 2: Enable Authentication

1. In your Firebase project, go to **Build** → **Authentication**
2. Click "Get started"
3. Enable **Email/Password** sign-in method
4. Click "Save"

### Step 3: Create Firestore Database

1. Go to **Build** → **Firestore Database**
2. Click "Create database"
3. Select **Start in production mode**
4. Choose a location (preferably closest to your users)
5. Click "Enable"

### Step 4: Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click the web icon `</>`
4. Register your app with nickname: "KALAMAR Web"
5. Copy the `firebaseConfig` object

### Step 5: Configure Environment Variables

1. In your KALAMAR project, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
   ```

### Step 6: Deploy Firestore Rules and Indexes

1. Install Firebase CLI if you haven't:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:
   ```bash
   firebase init
   ```
   - Select **Firestore** and **Hosting**
   - Choose **Use an existing project**
   - Select your project
   - Accept default files (firestore.rules, firestore.indexes.json)
   - Set public directory to: `dist`
   - Configure as single-page app: **Yes**
   - Don't overwrite existing files

4. Deploy Firestore configuration:
   ```bash
   firebase deploy --only firestore:rules
   firebase deploy --only firestore:indexes
   ```

## 🤖 Google Gemini AI Setup (Optional)

### Step 1: Get API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the generated key

### Step 2: Add to Environment

Add to your `.env` file:
```env
VITE_GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

## 🚀 Running the Application

### Development Mode

```bash
# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

Open http://localhost:5173/ in your browser.

### Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

## 📦 Deployment to Firebase Hosting

### First Time Deployment

```bash
# Build the application
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

### Subsequent Deployments

```bash
npm run build && firebase deploy --only hosting
```

Your app will be available at: `https://your-project-id.web.app`

## 🔧 Troubleshooting

### Blank Screen After Login

**Issue**: Application shows blank screen
**Cause**: Firebase credentials not configured
**Solution**: Make sure `.env` file exists with correct Firebase credentials

### Firebase Errors in Console

**Issue**: "Firebase: Error (auth/invalid-api-key)"
**Cause**: Incorrect API key in `.env`
**Solution**: Double-check your Firebase configuration values

### Firestore Permission Denied

**Issue**: "Missing or insufficient permissions"
**Cause**: Firestore rules not deployed
**Solution**: Run `firebase deploy --only firestore:rules`

### Build Errors

**Issue**: TypeScript compilation errors
**Cause**: Missing dependencies or type definitions
**Solution**: 
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📱 Testing the Application

### Create Your First User

1. Navigate to http://localhost:5173/
2. Click "Regístrate" (Register)
3. Fill in:
   - Name: Your name
   - Email: your@email.com
   - Password: At least 6 characters
4. Click "Crear Cuenta"

### Add Family Members

1. Go to Calendar module
2. Click "Familia" button
3. Click "Agregar Miembro"
4. Fill in name, role, and select a color
5. Click "Agregar"

### Create Your First Event

1. In Calendar view, click any day or "Nuevo Evento"
2. Fill in event details:
   - Title
   - Category
   - Date and time
   - Location (optional)
   - Assign to family members
3. Click "Crear Evento"

## 🎯 Next Steps

After successful setup:

1. ✅ Create your user account
2. ✅ Add family members
3. ✅ Create some test events
4. ✅ Explore the calendar features
5. 🔜 Wait for upcoming modules (Finances, Inventory, etc.)

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [date-fns Documentation](https://date-fns.org/)

## 🆘 Need Help?

If you encounter any issues:

1. Check the browser console for errors (F12)
2. Verify all environment variables are set correctly
3. Ensure Firebase rules and indexes are deployed
4. Check that your Firebase project has Authentication and Firestore enabled

---

**Happy organizing! 🏠✨**
