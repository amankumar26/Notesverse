# Noteverse 🚀

**Noteverse** is a premium, full-stack web application built using the **MERN Stack**. It serves as a comprehensive platform for students to share, discover, and exchange academic resources, specifically study notes.

## ✨ Key Features

- **📚 Smart Note Management**: Upload and organize your study materials with ease.
- **🔍 Advanced Search**: Find exactly what you need with our intelligent research assistant.
- **💬 Real-time Collaboration**: Built-in chat system with custom "Offer" features for seamless negotiation between buyers and sellers.
- **🔒 Secure Authentication**: Robust security using JWT and Bcryptjs for user data protection.
- **☁️ Cloud Storage**: Seamlessly manage files and profile images with Cloudinary integration.
- **🛡️ Data Security**: Implementation of AES-256-CBC encryption for sensitive data handling.
- **🌟 Dynamic UI/UX**: A stunning, modern interface powered by React 19, Tailwind CSS 4, and Framer Motion.
- **🎮 Guided Onboarding**: Step-by-step tours for new users powered by Driver.js.
- **🌌 Immersive Visuals**: Beautiful background effects using tsparticles.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Visuals**: tsparticles
- **Onboarding**: Driver.js
- **Routing**: React Router 7
- **Real-time**: Socket.io-client

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT & Bcryptjs
- **File Uploads**: Multer & Cloudinary
- **Real-time**: Socket.io

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account or local installation
- Cloudinary account (for file management)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/noteverse.git
   cd noteverse
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory and add the following:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```
   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   VITE_SOCKET_URL=http://localhost:5000
   ```

4. **Run the Application**

   Start the Backend:
   ```bash
   cd backend
   npm run dev
   ```

   Start the Frontend:
   ```bash
   cd frontend
   npm run dev
   ```

## 📂 Project Structure

```text
noteverse/
├── backend/            # Express.js backend
│   ├── controllers/    # API logic
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express routes
│   └── server.js       # Entry point
├── frontend/           # React frontend
│   ├── src/            # Components, pages, hooks
│   ├── public/         # Static assets
│   └── index.html      # Entry point
└── METHODOLOGY.md      # Detailed project documentation
```

## 📖 Methodology
For a deep dive into the system architecture and development process, please refer to the [METHODOLOGY.md](./METHODOLOGY.md) file.

## 📝 License
This project is licensed under the ISC License.

---
Built with ❤️ by [Amankumar](https://github.com/amankumar26)
