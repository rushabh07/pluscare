# 🏥 PlusCare – Hospital Management System

A comprehensive, full-stack hospital management web application that streamlines healthcare operations with role-based dashboards, AI-powered assistance, appointment booking, billing, and more.

---

## 🌐 Live Demo

| Service    | URL                                                |
| ---------- | -------------------------------------------------- |
| 🖥 Frontend | [pluscare-rho.vercel.app](https://pluscare-rho.vercel.app/) |
| ⚙️ Backend  | [pluscare-q7cx.onrender.com](https://pluscare-q7cx.onrender.com/) |

> **Note:** The backend is hosted on Render's free tier and may take ~30 seconds to wake up on the first request.

---

## ✨ Features

### 🔐 Authentication & Authorization
- User registration & login with JWT-based authentication
- Role-based access control (**Admin**, **Doctor**, **Patient**)
- Forgot password with email OTP verification
- Protected routes on both frontend and backend

### 👨‍⚕️ Role-Based Dashboards

| Role    | Capabilities                                                                 |
| ------- | ---------------------------------------------------------------------------- |
| Admin   | Full system control — manage doctors, patients, departments, services, billing, analytics, notifications, reports, and settings |
| Doctor  | View appointments, manage medical records, update patient info               |
| Patient | Book appointments, view medical history, check billing, leave reviews        |

### 📅 Appointment & Booking System
- Browse and book services with real-time availability
- Service detail pages with pricing, descriptions, and provider info
- Booking confirmation emails with professional HTML templates
- Booking status tracking (pending → confirmed → completed)

### 🤖 AI-Powered Health Assistant
- Integrated with **NVIDIA NIM API** (Meta LLaMA 3.1 8B Instruct)
- AI chatbot for symptom checking and health queries
- Smart doctor recommendations based on symptoms
- Intelligent department-aware suggestions

### 💰 Billing & Invoicing
- Create and manage patient invoices
- Track payment status
- Admin billing dashboard with financial overview

### 📋 Medical Records
- Doctors can create and manage patient medical records
- Patients can view their own medical history
- Secure access controls per role

### 📧 Email Notifications
- Booking confirmation & cancellation emails via **Nodemailer** (Gmail SMTP)
- Professional, responsive HTML email templates
- OTP emails for password recovery

### ⭐ Reviews & Ratings
- Patients can rate and review services
- Review aggregation visible on service pages

### 📊 Admin Analytics & Reports
- Dashboard with key stats (patients, doctors, appointments, revenue)
- Visual analytics and reporting tools
- Department and service management

---

## 🛠 Tech Stack

### Frontend
| Technology        | Purpose                    |
| ----------------- | -------------------------- |
| React 19          | UI framework               |
| Vite 8            | Build tool & dev server    |
| React Router v7   | Client-side routing        |
| Tailwind CSS 4    | Utility-first styling      |
| Axios             | HTTP client                |
| React Icons       | Icon library               |

### Backend
| Technology    | Purpose                        |
| ------------- | ------------------------------ |
| Node.js       | Runtime environment            |
| Express 4     | Web framework                  |
| MongoDB       | NoSQL database                 |
| Mongoose 8    | ODM for MongoDB                |
| JWT           | Authentication tokens          |
| bcrypt        | Password hashing               |
| Nodemailer    | Email service                  |
| OpenAI SDK    | NVIDIA NIM API integration     |

### Deployment
| Service | Platform |
| ------- | -------- |
| Frontend | Vercel  |
| Backend  | Render  |
| Database | MongoDB Atlas |

---

## 📁 Project Structure

```
pluscare/
├── public/                     # Static assets
├── src/                        # Frontend source
│   ├── admin/                  # Admin layout component
│   ├── assets/                 # Images & static files
│   ├── components/             # Reusable UI components
│   │   ├── AISection.jsx       # AI health assistant
│   │   ├── BookingModal.jsx    # Service booking modal
│   │   ├── DoctorsSection.jsx  # Doctors listing
│   │   ├── HeroSection.jsx     # Landing hero
│   │   ├── Navbar.jsx          # Navigation bar
│   │   ├── Footer.jsx          # Site footer
│   │   └── ...                 # Other sections
│   ├── pages/
│   │   ├── admin/              # Admin panel pages (12 modules)
│   │   ├── doctor/             # Doctor dashboard & records
│   │   ├── patient/            # Patient dashboard
│   │   ├── homepage.jsx        # Landing page
│   │   ├── ServicesPage.jsx    # All services listing
│   │   ├── ServiceDetailPage.jsx # Service detail + booking
│   │   ├── login.jsx           # Login page
│   │   ├── regestrationpage.jsx # Registration page
│   │   └── forgetpwd.jsx       # Password recovery
│   ├── services/               # API service utilities
│   ├── data/                   # Static data / constants
│   └── utils/                  # Helper utilities
│
├── backend/
│   ├── config/                 # Database connection
│   ├── controllers/            # Route handlers
│   │   ├── aiController.js     # AI chat endpoints
│   │   ├── appointmentController.js
│   │   ├── billingController.js
│   │   ├── bookingController.js
│   │   ├── medicalRecordController.js
│   │   ├── patientController.js
│   │   ├── providerController.js
│   │   ├── serviceController.js
│   │   ├── userController.js
│   │   └── ...
│   ├── models/                 # Mongoose schemas
│   │   ├── userModel.js
│   │   ├── appointmentModel.js
│   │   ├── bookingModel.js
│   │   ├── billingModel.js
│   │   ├── doctorModel.js
│   │   ├── serviceModel.js
│   │   ├── departmentModel.js
│   │   ├── medicalRecordModel.js
│   │   └── ...
│   ├── routes/                 # Express route definitions
│   ├── middleware/              # Auth middleware (JWT)
│   ├── services/               # Business logic
│   │   ├── aiService.js        # NVIDIA NIM AI integration
│   │   └── emailService.js     # Nodemailer email service
│   ├── utils/                  # Token generation, helpers
│   └── server.js               # Express app entry point
│
├── package.json
└── vite.config.js
```

---

## 🔌 API Endpoints

| Base Route              | Description                |
| ----------------------- | -------------------------- |
| `GET /`                 | Health check               |
| `/api/users`            | Auth, registration, profile |
| `/api/appointments`     | Appointment CRUD           |
| `/api/bookings`         | Service booking management |
| `/api/billing`          | Invoice & payment tracking |
| `/api/services`         | Hospital services catalog  |
| `/api/providers`        | Service provider management |
| `/api/medical-records`  | Patient medical records    |
| `/api/reviews`          | Service ratings & reviews  |
| `/api/notifications`    | User notifications         |
| `/api/ai`               | AI health assistant chat   |
| `/api/admin/stats`      | Admin dashboard statistics |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **MongoDB** connection string (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Gmail App Password** (for email notifications)
- **NVIDIA NIM API Key** (optional, for AI features)

### 1. Clone the Repository

```bash
git clone <repo-url>
cd pluscare
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# Email (Gmail SMTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

# AI (Optional)
NVIDIA_API_KEY=your_nvidia_nim_api_key
```

### 3. Setup Frontend

```bash
# From the project root
npm install
```

### 4. Run the Application

```bash
# Start backend (from /backend)
cd backend
npm start          # or: npm run dev (with auto-reload)

# Start frontend (from project root, in a new terminal)
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:5000`.

### 5. Seed Data (Optional)

```bash
# From /backend — populate doctors and services
node seedDoctors.js
node seedServices.js
```

---

## 📄 License

This project is for educational and demonstration purposes.

---

<p align="center">
  Built with ❤️ using React & Node.js
</p>
