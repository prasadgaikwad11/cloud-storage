# ☁️ Cloud Based File Storage System

A full-stack cloud file storage application built with **Node.js**, **Express**, **MongoDB**, **AWS S3**, and a modern **Vanilla JS** frontend.

---

## 📁 Project Structure

```
cloud_/
├── frontend/
│   ├── index.html          # Landing page
│   ├── login.html          # Login page
│   ├── register.html       # Register page
│   ├── dashboard.html      # Main dashboard
│   ├── css/
│   │   ├── style.css       # Global styles + design tokens
│   │   └── dashboard.css   # Dashboard-specific styles
│   └── js/
│       ├── api.js          # Centralized API client + Auth helpers
│       ├── auth.js         # Login/Register page logic
│       ├── dashboard.js    # Dashboard logic
│       └── toast.js        # Toast notification system
│
├── backend/
│   ├── server.js           # Express entry point
│   ├── .env                # Environment variables
│   ├── config/
│   │   ├── db.js           # MongoDB connection
│   │   └── s3.js           # AWS S3 client
│   ├── models/
│   │   ├── User.js         # User schema
│   │   └── File.js         # File metadata schema
│   ├── middleware/
│   │   ├── auth.js         # JWT middleware + token generator
│   │   └── upload.js       # Multer + multer-s3 config
│   ├── controllers/
│   │   ├── authController.js   # Auth logic
│   │   └── fileController.js   # File CRUD + S3 operations
│   └── routes/
│       ├── auth.js         # Auth routes
│       └── files.js        # File routes
│
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

| Requirement | Version |
|---|---|
| Node.js | ≥ 18.x |
| MongoDB | Local or Atlas |
| AWS Account | With S3 bucket created |

---

### 1. Clone & Install Backend

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cloud_storage
JWT_SECRET=your_super_secret_jwt_key_change_in_production

AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your-s3-bucket-name

FRONTEND_URL=http://localhost:5500
```

### 3. Configure AWS S3

1. **Create an S3 Bucket** in the AWS console
2. **Set Bucket Policy** to allow your IAM user access:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "AWS": "arn:aws:iam::YOUR_ACCOUNT_ID:user/YOUR_IAM_USER" },
      "Action": ["s3:GetObject","s3:PutObject","s3:DeleteObject"],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```
3. **Enable CORS** on the S3 bucket:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET","PUT","POST","DELETE","HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### 4. Start the Backend

```bash
cd backend
npm start          # production
npm run dev        # development (with nodemon auto-reload)
```

Backend runs at: **http://localhost:5000**

### 5. Serve the Frontend

Use VS Code **Live Server** extension, or any static file server:

```bash
# Using npx
npx serve frontend

# Or Python
cd frontend && python -m http.server 5500
```

Frontend runs at: **http://localhost:5500**

---

## 🔌 REST API Reference

### Auth Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login + get JWT |
| GET | `/api/auth/me` | Private | Get current user |
| PATCH | `/api/auth/profile` | Private | Update profile |

### File Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/files/upload` | Private | Upload files (multipart/form-data, field: `files`) |
| GET | `/api/files` | Private | List all files (supports `search`, `category`, `sortBy`, `order`, `page`, `limit`) |
| GET | `/api/files/stats` | Private | Storage stats + recent uploads |
| GET | `/api/files/:id/download` | Private | Get pre-signed S3 download URL |
| DELETE | `/api/files/:id` | Private | Delete file from S3 + DB |
| PATCH | `/api/files/:id/rename` | Private | Rename file |
| PATCH | `/api/files/:id/star` | Private | Toggle star |

### Authentication

All private routes require:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔒 Security

- **Passwords** hashed with `bcryptjs` (salt rounds: 12)
- **JWT tokens** expire after 7 days
- **AWS credentials** stored in `.env` — never committed
- **Pre-signed URLs** for downloads expire after 15 minutes
- **File validation** — only allowed MIME types accepted
- **Max file size** — 100 MB per file, 10 files per upload

---

## 🛠️ Tech Stack

### Backend
| Package | Purpose |
|---|---|
| `express` | Web framework |
| `mongoose` | MongoDB ODM |
| `bcryptjs` | Password hashing |
| `jsonwebtoken` | JWT auth |
| `multer` + `multer-s3` | File upload to S3 |
| `@aws-sdk/client-s3` | AWS S3 SDK v3 |
| `@aws-sdk/s3-request-presigner` | Pre-signed URLs |
| `uuid` | Unique S3 keys |
| `dotenv` | Environment variables |
| `cors` | Cross-origin requests |

### Frontend
| Technology | Purpose |
|---|---|
| HTML5 | Structure |
| CSS3 + Custom Properties | Styling + dark theme |
| Vanilla JavaScript | Logic, API calls |
| Inter (Google Fonts) | Typography |
| XHR | File upload with progress |

---

## ✨ Features

- 🔐 **JWT Authentication** — Register, login, logout with persistent sessions
- 📤 **Drag & Drop Upload** — Up to 10 files (100MB each) with real-time progress bars
- ☁️ **AWS S3 Storage** — Files stored securely with unique keys
- 🔗 **Pre-signed Downloads** — Secure time-limited download URLs
- 🔍 **Search & Filter** — Real-time search + category filtering (images, videos, docs, audio, archives)
- 📊 **Storage Dashboard** — Usage stats, file counts, recent uploads
- ✏️ **Rename Files** — Update display names
- ⭐ **Star Files** — Bookmark important files
- 🗑️ **Delete Files** — Removes from both S3 and MongoDB
- 📱 **Responsive Design** — Works on desktop, tablet, and mobile
- 🔔 **Toast Notifications** — Real-time feedback on all actions
- 💀 **Skeleton Loaders** — Smooth loading states

---

## 🌍 Environment Variables Reference

| Variable | Description | Example |
|---|---|---|
| `PORT` | Backend server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/cloud_storage` |
| `JWT_SECRET` | Secret for signing JWTs | `super_secret_key_here` |
| `AWS_ACCESS_KEY_ID` | AWS IAM access key | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key | `wJalrXUtnFEMI/K7MDENG/...` |
| `AWS_REGION` | AWS region of S3 bucket | `us-east-1` |
| `AWS_BUCKET_NAME` | S3 bucket name | `my-cloud-storage-bucket` |
| `FRONTEND_URL` | Frontend origin for CORS | `http://localhost:5500` |

---

## 📝 License

MIT © 2024 CloudVault
"# cloud-storage" 
"# cloud-storage" 
