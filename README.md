<div align="center">

# 💬 SyncTalk

**A full-stack real-time chat application with AI intelligence, live translation, and a built-in code playground.**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Socket.io](https://img.shields.io/badge/Socket.io-4-010101?style=for-the-badge&logo=socket.io)](https://socket.io)
[![Render](https://img.shields.io/badge/Deployed%20on-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com)

[Live Demo](https://real-time-chat-app-04f9.onrender.com) · [Report Bug](https://github.com/ahsan4449/Real-Time-Chat-App/issues) · [Request Feature](https://github.com/ahsan4449/Real-Time-Chat-App/issues)

</div>

---

## 📸 Overview

SyncTalk is a production-grade MERN stack chat application that goes beyond basic messaging. It features **AI-powered conversation analysis** (powered by Gemini), **real-time message translation** (Google Cloud Translate), **group chats**, **image sharing**, and a **built-in code playground** with syntax highlighting — all in a clean, responsive UI.

---

## ✨ Features

### 💬 Core Messaging
- **Real-time 1-on-1 DMs** via Socket.io WebSockets
- **Group chats** — create groups, add/remove members, persistent group rooms
- **Image sharing** via Cloudinary CDN
- **Chat history** persisted in MongoDB

### 🤖 AI Assistant (Gemini)
- **Conversation Summary** — 3-bullet point summary of any chat
- **Smart Reply Suggestions** — 3 context-aware reply ideas
- **Sentiment Analysis** — emoji-based mood detection for the conversation

### 🌐 Real-Time Translation
- Translate incoming messages on-the-fly using **Google Cloud Translation API**
- Supports multiple target languages per user session

### 💻 Code Playground
- Send and receive **code snippets** as a dedicated message type
- Syntax highlighting for multiple languages via `react-syntax-highlighter`
- Messages stored with `messageType: "code"` and `language` metadata

### 🔐 Auth & Security
- JWT-based authentication with **HttpOnly cookies**
- Protected routes via middleware on both frontend and backend
- Password hashing with **Bcrypt**

### 🟢 Presence & UX
- **Online/offline user indicators** (live via Socket.io)
- Auto-join Socket.io group rooms on connection
- Profile picture upload and update (Cloudinary)
- Skeleton loading states

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 7, Zustand, React Router v7, Axios |
| **Styling** | Tailwind CSS v4, DaisyUI v5 |
| **Backend** | Node.js, Express 5, ES Modules |
| **Database** | MongoDB Atlas + Mongoose 8 |
| **Real-Time** | Socket.io v4 (WebSocket) |
| **Auth** | JWT, Bcrypt, Cookie-Parser |
| **AI** | Google Gemini (`gemini-3-flash-preview`), OpenAI |
| **Translation** | Google Cloud Translation API |
| **Media** | Cloudinary (image upload & CDN) |
| **Deployment** | Render (Web Service + Static Site) |

---

## 📁 Project Structure

```
SyncTalk/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── aiController.js        # Gemini AI — summary, reply, sentiment
│   │   │   ├── authController.js      # Register, Login, Logout, Profile
│   │   │   ├── groupController.js     # Group CRUD & group messaging
│   │   │   └── messageController.js  # DM send & fetch
│   │   ├── lib/
│   │   │   ├── db.js                  # MongoDB connection
│   │   │   └── socket.js             # Socket.io server & room management
│   │   ├── middleware/
│   │   │   └── authMiddleware.js      # JWT protect route
│   │   ├── models/
│   │   │   ├── messageModel.js        # text | code, translatedText, groupId
│   │   │   └── ...
│   │   ├── routes/
│   │   │   ├── aiRoute.js
│   │   │   ├── authRoute.js
│   │   │   ├── groupRoute.js
│   │   │   └── messageRoute.js
│   │   └── index.js                   # Entry point, CORS, static serving
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatContainer.jsx      # Main chat window
│   │   │   ├── ChatHeader.jsx         # AI tools, translation, group info
│   │   │   ├── MessageInput.jsx       # Text/code/image input
│   │   │   ├── Sidebar.jsx            # User list + group list
│   │   │   ├── CreateGroupModal.jsx   # Group creation UI
│   │   │   └── Navbar.jsx
│   │   ├── pages/
│   │   ├── store/                     # Zustand stores
│   │   └── lib/
│   └── package.json
│
└── package.json                       # Root build & start scripts for Render
```

---

## ⚙️ Local Development Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account
- Google Cloud project with Translation API enabled
- Google AI Studio API key (Gemini)

### 1. Clone the repo

```bash
git clone https://github.com/ahsan4449/Real-Time-Chat-App.git
cd Real-Time-Chat-App
```

### 2. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configure environment variables

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/?appName=Cluster1

JWT_SECRET=your_strong_random_secret_here

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

GOOGLE_TRANSLATE_API_KEY=your_google_translate_api_key
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key       # Optional
```

### 4. Run the app

```bash
# Terminal 1 — Backend
cd backend
npm run dev       # runs with nodemon on http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev       # Vite dev server on http://localhost:5173
```

---

## 🚀 Deploying to Render

This project is configured for deployment as two separate Render services.

### Backend — Web Service

| Setting | Value |
|---|---|
| **Root Directory** | `backend` |
| **Build Command** | `npm install` |
| **Start Command** | `node src/index.js` |

**Environment Variables on Render:**

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `CLIENT_URL` | `https://<your-frontend>.onrender.com` |
| `MONGODB_URI` | *(your Atlas URI)* |
| `JWT_SECRET` | *(strong random string)* |
| `CLOUDINARY_CLOUD_NAME` | *(your value)* |
| `CLOUDINARY_API_KEY` | *(your value)* |
| `CLOUDINARY_API_SECRET` | *(your value)* |
| `GOOGLE_TRANSLATE_API_KEY` | *(your value)* |
| `GEMINI_API_KEY` | *(your value)* |
| `OPENAI_API_KEY` | *(your value)* |

### Frontend — Static Site

| Setting | Value |
|---|---|
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

**Environment Variables:**

| Key | Value |
|---|---|
| `VITE_BACKEND_URL` | `https://<your-backend>.onrender.com` |

> **Note:** All Vite env vars must be prefixed with `VITE_` to be accessible in the browser bundle.

---

## 🔐 Authentication Flow

```
User signs up / logs in
        │
        ▼
Backend issues JWT → stored in HttpOnly cookie
        │
        ▼
Protected routes validated via authMiddleware.js
        │
        ▼
Socket.io connection established with userId query param
        │
        ▼
Auto-join all group rooms the user is a member of
```

---

## 🤖 AI Feature Architecture

```
Frontend ChatHeader
     │  POST /api/ai/process
     │  { messages[], mode: "summary" | "reply" | "sentiment", groupName? }
     ▼
aiController.js
     │  Builds context-aware prompt from chat history
     ▼
Google Gemini (gemini-3-flash-preview)
     │
     ▼
Response returned and rendered in UI
```

---

## 🛣️ API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | ❌ | Register new user |
| `POST` | `/api/auth/login` | ❌ | Login & get JWT cookie |
| `POST` | `/api/auth/logout` | ✅ | Clear auth cookie |
| `PUT` | `/api/auth/update-profile` | ✅ | Upload profile picture |
| `GET` | `/api/messages/:id` | ✅ | Get DM history |
| `POST` | `/api/messages/send/:id` | ✅ | Send DM (text/image/code) |
| `POST` | `/api/ai/process` | ✅ | AI summary/reply/sentiment |
| `GET` | `/api/groups` | ✅ | Get user's groups |
| `POST` | `/api/groups` | ✅ | Create group |
| `POST` | `/api/groups/:id/messages` | ✅ | Send group message |

---

## 🧑‍💼 Author

**Ahsan Mohd**  
🎓 Computer Science & Engineering  
🔗 [LinkedIn](https://www.linkedin.com/in/ahsan-mohd-964002261/)  
📧 ahsanmohd4449@gmail.com  
🐙 [GitHub](https://github.com/ahsan4449)

---

## 📝 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
