# Healthcare Appointment Booking System

A comprehensive web-based platform for managing healthcare appointments with role-based access for patients, doctors, and administrators.

## 🚀 Features

### For Patients
- Search and book appointments with doctors
- View appointment history and medical records
- Manage personal profile and preferences
- Cancel or reschedule appointments

### For Doctors
- Manage availability and time slots
- View and manage patient appointments
- Access patient medical history
- Update professional profile and specializations

### For Administrators
- Manage doctors and patients
- View system analytics and reports
- Monitor platform usage and performance
- Handle user management and permissions

## 🛠️ Technology Stack

### Frontend
- **React.js** - User interface library
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcrypt.js** - Password hashing

## 📁 Project Structure

```
healthcare-booking-system/
├── backend/                 # Node.js/Express backend
│   ├── config/             # Database and app configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   └── server.js          # Entry point
├── frontend/              # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── redux/         # Redux store and slices
│   │   ├── services/      # API service functions
│   │   ├── utils/         # Utility functions
│   │   └── App.js         # Main app component
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd healthcare-booking-system
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Set up environment variables
```bash
# In backend directory, create .env file
cp .env.example .env
# Update with your MongoDB URI and JWT secret
```

5. Start the development servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

## 🔧 Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/healthcare-booking
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
NODE_ENV=development
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Doctor Endpoints
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get doctor by ID
- `PUT /api/doctors/availability` - Update doctor availability

### Appointment Endpoints
- `POST /api/appointments` - Book appointment
- `GET /api/appointments` - Get user appointments
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

### Admin Endpoints
- `GET /api/admin/users` - Get all users
- `GET /api/admin/analytics` - Get system analytics

## 🎨 UI/UX Features

- Responsive design for all devices
- Modern and clean interface
- Intuitive navigation
- Loading states and error handling
- Professional healthcare theme

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- CORS protection

## 📈 Future Enhancements

- Telemedicine integration
- Payment gateway integration
- SMS/Email notifications
- Prescription management
- Medical report uploads
- Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Developer

Built with ❤️ for modern healthcare management.
