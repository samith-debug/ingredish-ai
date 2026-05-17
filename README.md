# 🍛 IngreDish AI

![React](https://img.shields.io/badge/React-19-blue)
![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)
![AI Powered](https://img.shields.io/badge/AI-Gemini-orange)
![License](https://img.shields.io/badge/License-MIT-yellow)

**IngreDish AI** is a modern, full-stack AI-powered kitchen assistant designed to help you cook authentic Indian meals using the ingredients you already have in your fridge. It generates detailed recipes, complete with steps, nutritional information, and YouTube tutorial links.

![IngreDish AI Preview](https://raw.githubusercontent.com/samith-debug/ingredish-ai/main/public/preview.png)

---

## 🚀 Live Demo

- **Frontend Application:** [https://tanstack-start-app.ingredish-ai.workers.dev](https://tanstack-start-app.ingredish-ai.workers.dev)
- **Backend API:** [https://ingredish-ai.onrender.com](https://ingredish-ai.onrender.com)

---

## ✨ Features

- **🧠 AI Recipe Generation:** Powered by the Google Gemini API to instantly craft authentic recipes based on your available ingredients.
- **🔐 Secure Authentication:** Full user registration and login system using JSON Web Tokens (JWT).
- **❤️ Favorites System:** Save and manage your favorite AI-generated recipes to your personal dashboard.
- **📱 Beautiful & Responsive UI:** Built with Tailwind CSS and Framer Motion for a premium, glassmorphism-inspired, animated user experience.
- **⚡ High Performance:** Server-Side Rendered (SSR) frontend deployed on Cloudflare Workers edge network.

---

## 🏗️ Project Architecture

This project is built using a decoupled Full-Stack architecture for maximum scalability and performance.

```text
ingredish-ai/
├── backend/                  # Express.js REST API
│   ├── src/
│   │   ├── db/               # PostgreSQL Connection Pool & Schema
│   │   ├── middleware/       # JWT Auth Validation & CORS
│   │   ├── routes/           # Auth, Generate, Recipes, Favorites, Stats
│   │   └── app.ts            # Express Server Configuration
├── src/                      # TanStack Start Frontend
│   ├── components/           # Reusable React UI Components (Radix UI)
│   ├── lib/                  # Utility Functions & API Client
│   ├── routes/               # File-based Routing (Home, Login, Generate, Dashboard)
│   └── index.css             # Tailwind Directives & Global Styles
└── public/                   # Static Assets (Images, Icons)
```

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework:** React 19 + [TanStack Start](https://tanstack.com/start/latest) (SSR)
- **Styling:** Tailwind CSS + Radix UI Primitives
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Deployment:** Cloudflare Workers

### **Backend**
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (Hosted on [Neon](https://neon.tech/))
- **Driver:** `pg` (Node-Postgres)
- **AI Integration:** Google Gemini API (`@ai-sdk/openai-compatible`)
- **Deployment:** Render (Web Service)

---

## 🔮 Future Features

- **📸 Fridge Photo Scan:** Take a picture of your fridge, and the AI will automatically identify your ingredients using computer vision.
- **🎙️ Voice Input:** Simply speak your ingredients instead of typing them.
- **📅 Meal Planner:** Generate weekly meal plans and automated grocery lists based on your dietary preferences.
- **🛒 Grocery Store Integration:** One-click ingredient export to Instacart or Amazon Fresh.

---

## 💻 Local Development Setup

If you want to run this project locally on your machine, follow these steps:

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- A PostgreSQL Database (Local or cloud like Neon/Supabase)
- A [Google Gemini API Key](https://aistudio.google.com/)

### 2. Clone the Repository
```bash
git clone https://github.com/samith-debug/ingredish-ai.git
cd ingredish-ai
```

### 3. Backend Setup
The backend is an Express server located in the `/backend` directory.

```bash
cd backend
npm install
```

Create a `.env` file in the `/backend` directory:
```env
# Database Connection String
POSTGRES_URL="postgresql://user:password@host/dbname?sslmode=require"

# AI API Key
GEMINI_API_KEY="your_gemini_api_key_here"

# JWT Secret for Auth (Make this a random 32-character string)
JWT_SECRET="your_secret_key_here"

# Frontend Origin for CORS (Use http://localhost:5173 for local dev)
FRONTEND_ORIGIN="http://localhost:5173"
```

Start the backend development server:
```bash
npm run dev
```

### 4. Frontend Setup
Open a new terminal window and navigate back to the root of the project.

```bash
cd ..
npm install
```

Create a `.env` file in the root directory:
```env
# URL pointing to your backend API
VITE_API_URL="http://localhost:3000"
```

Start the frontend development server:
```bash
npm run dev
```

The application will now be running at `http://localhost:5173`.

---

## 🌍 Production Deployment

This project is configured for cloud deployment:
- The **Frontend** uses `@cloudflare/vite-plugin` and is deployed as a Cloudflare Worker using `npx wrangler deploy`.
- The **Backend** is deployed as a standard Node.js Web Service on Render, executing asynchronous calls to a Neon PostgreSQL database.

Make sure to configure the respective environment variables (`FRONTEND_ORIGIN` and `VITE_API_URL`) on your hosting platforms to ensure CORS and API communication work seamlessly.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
