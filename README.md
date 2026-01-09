# KALAMAR 🦑

**KALAMAR** is a premium home management system built with React, TypeScript, and Firebase. It features a sophisticated Family Calendar with AI-powered assistant and recurring event support.

## ✨ Features

- **Family Calendar**: Manage household events and activities.
- **AI Assistant**: Create events using natural language (Powered by Google Gemini 2.0).
- **Recurring Events**: Support for daily, weekly, monthly, and yearly recurrences.
- **Family Management**: Assign members to events and manage roles.
- **Deep Dark UI**: High-fidelity obsidian aesthetic with glassmorphism and glow effects.

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite + TypeScript
- **Backend/DB**: Firebase Authentication & Firestore
- **AI**: Google Gemini Pro (via Generative AI SDK)
- **Styling**: Vanilla CSS with Universal Deep Dark design system

## 🚀 Getting Started

1. **Clone the repo**
2. **Install dependencies**: `npm install`
3. **Setup Environment**:
   - Copy `.env.example` to `.env`
   - Fill in your Firebase and Gemini API keys.
4. **Run Dev**: `npm run dev`

## 📦 Deployment (CI/CD)

The project is configured for automatic deployment to **Firebase Hosting** via GitHub Actions.

### Setup Deployment
1. Go to your GitHub Repository > Settings > Secrets and variables > Actions.
2. Add the following secrets:
   - `FIREBASE_SERVICE_ACCOUNT_KALAMAR_CENTRAL`: Content of your Firebase Service Account JSON.
   - `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, etc. (for the build process).
   - `VITE_GEMINI_API_KEY`.

Pushing to the `main` branch will trigger the `firebase-deploy.yml` workflow.
