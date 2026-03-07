# 🎓 EduPortal — Student Registration System

A full-stack student registration management system built with Node.js, Express, and MongoDB.

**Built by:** Shravani Sherkar & Vishakha Mokate

## 🌟 Features
- 📋 Dynamic registration form (admin can edit fields)
- 📱 QR Code generator with share/download
- 📊 Live admin dashboard with search & delete
- 📥 Export registrations to CSV
- 🔒 Secure admin login
- 🗄️ MongoDB permanent storage
- 🌐 Deploy-ready for Render.com

## 🚀 Run Locally

```bash
# Install dependencies
npm install

# (Optional) Set MongoDB URI in .env
cp .env.example .env
# Edit .env and add your MONGO_URI

# Start server
node server.js
```

Open `http://localhost:3000`

**Admin Login:** `admin` / `admin123`

## 🌐 Deploy on Render.com

1. Push to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Set:
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Environment Variable: `MONGO_URI` = your MongoDB Atlas URI
5. Click Deploy ✅

## 📁 Folder Structure

```
eduportal/
├── server.js
├── package.json
├── .env.example
└── public/
    ├── index.html    ← Home
    ├── about.html    ← About + Team
    ├── register.html ← Registration Form
    ├── login.html    ← Admin Login
    ├── admin.html    ← Admin Panel
    └── style.css
```
