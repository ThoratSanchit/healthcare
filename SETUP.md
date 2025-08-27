# Healthcare Appointment Booking System - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### 1. Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Database will be created automatically

#### Option B: MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/atlas
2. Create a new cluster
3. Get connection string
4. Update MONGODB_URI in backend/.env

### 3. Environment Configuration

The backend/.env file is already created with default values. Update as needed:

```env
# Update these values
MONGODB_URI=mongodb://localhost:27017/healthcare-booking
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-healthcare-2024
```

### 4. Start the Application

#### Option A: Start Both Services Together
```bash
# From root directory
npm run dev
```

#### Option B: Start Services Separately
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health

## 🔐 Demo Accounts

Use these accounts to test the application:

### Patient Account
- **Email**: patient@demo.com
- **Password**: password123

### Doctor Account
- **Email**: doctor@demo.com
- **Password**: password123

### Admin Account
- **Email**: admin@demo.com
- **Password**: password123

## 📁 Project Structure

```
healthcare-booking-system/
├── backend/                 # Node.js/Express backend
│   ├── config/             # Database configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   └── server.js          # Entry point
├── frontend/              # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── redux/         # Redux store and slices
│   │   ├── services/      # API service functions
│   │   └── App.js         # Main app component
└── README.md
```

## 🛠️ Available Scripts

### Root Directory
- `npm run dev` - Start both frontend and backend
- `npm run server` - Start backend only
- `npm run client` - Start frontend only
- `npm run install-all` - Install all dependencies

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests

### Frontend
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get user profile
- `PUT /api/auth/update-profile` - Update profile
- `PUT /api/auth/update-password` - Update password

### Appointments
- `GET /api/appointments` - Get appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get doctor by ID
- `PUT /api/doctors/availability` - Update availability

### Admin
- `GET /api/admin/dashboard` - Get dashboard stats
- `GET /api/admin/analytics` - Get analytics data

## 🎨 Features Implemented

### ✅ Completed Features
- User authentication (JWT)
- Role-based access control (Patient/Doctor/Admin)
- Responsive design with Tailwind CSS
- Redux state management
- Professional UI components
- Database models and relationships
- API endpoints structure
- Error handling and validation

### 🚧 In Progress / Coming Soon
- Complete appointment booking flow
- Doctor availability management
- Patient medical history
- Admin analytics dashboard
- Email notifications
- File upload functionality
- Payment integration
- Real-time notifications

## 🔒 Security Features

- JWT authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- Rate limiting
- Helmet security headers

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in .env file
   - Verify network access for MongoDB Atlas

2. **Port Already in Use**
   - Change PORT in backend/.env
   - Kill existing processes: `lsof -ti:5000 | xargs kill -9`

3. **Dependencies Issues**
   - Delete node_modules and package-lock.json
   - Run `npm install` again

4. **CORS Errors**
   - Verify CLIENT_URL in backend/.env
   - Check if frontend is running on correct port

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check console logs for error details

## 🚀 Deployment

### Backend Deployment (Heroku/Railway/Render)
1. Set environment variables
2. Update MONGODB_URI for production database
3. Set NODE_ENV=production

### Frontend Deployment (Netlify/Vercel)
1. Build the project: `npm run build`
2. Deploy the build folder
3. Set REACT_APP_API_URL to backend URL

## 📄 License

This project is licensed under the MIT License.

---

**Happy Coding! 🎉**

For a professional job interview project, this demonstrates:
- Full-stack development skills
- Modern React with Redux
- Node.js/Express API development
- MongoDB database design
- Authentication and authorization
- Professional UI/UX design
- Code organization and best practices
