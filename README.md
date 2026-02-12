# Public Incident Management System (PIMS)

A full-stack GIS application for reporting and managing public incidents in Maharashtra, India. Built with React, Node.js, Express, and Oracle Database.

![PIMS Application](https://img.shields.io/badge/Status-Production%20Ready-success)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18+-blue)
![Oracle](https://img.shields.io/badge/Oracle-Database-red)

## 🌟 Features

### Public Interface
- **Interactive Map**: Leaflet-based map centered on Maharashtra
- **Incident Reporting**: Click-to-report incidents with categorization
- **Real-time Updates**: View all reported incidents on the map
- **Location Services**: "Locate Me" feature for precise positioning
- **Responsive Design**: Optimized for mobile and desktop

### Admin Dashboard
- **Secure Authentication**: JWT-based admin login
- **Incident Management**: View, resolve, and delete incidents
- **Filtering**: Filter incidents by status (Open/Resolved)
- **Interactive Map**: Click incidents to view details and take action
- **Glassmorphism UI**: Modern, premium design aesthetic

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Leaflet** - Interactive maps
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Oracle Database** - Data persistence
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
ADM/
├── backend/
│   ├── config/
│   │   └── db.js                 # Oracle DB connection
│   ├── controllers/
│   │   ├── authController.js     # Admin authentication
│   │   └── incidentController.js # Incident CRUD operations
│   ├── db/
│   │   ├── schema.sql            # Incidents table schema
│   │   └── admin_schema.sql      # Admins table schema
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verification
│   ├── routes/
│   │   ├── authRoutes.js         # Auth endpoints
│   │   └── incidentRoutes.js     # Incident endpoints
│   ├── scripts/
│   │   ├── init_db.js            # Initialize incidents table
│   │   └── init_admin.js         # Create admin user
│   ├── server.js                 # Express server entry point
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── _redirects            # SPA routing config
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Badge.jsx     # Status badge component
│   │   │   │   ├── Button.jsx    # Reusable button
│   │   │   │   ├── GlassCard.jsx # Glassmorphism card
│   │   │   │   ├── Input.jsx     # Form input & textarea
│   │   │   │   └── Select.jsx    # Form select dropdown
│   │   │   ├── Map.jsx           # Main map component
│   │   │   └── ProtectedRoute.jsx # Auth route wrapper
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx # Admin panel
│   │   │   └── AdminLogin.jsx     # Admin login page
│   │   ├── services/
│   │   │   └── incidentService.js # API client
│   │   ├── config/
│   │   │   └── api.js            # Axios configuration
│   │   ├── App.jsx               # Root component
│   │   ├── main.jsx              # React entry point
│   │   └── index.css             # Global styles
│   ├── package.json
│   └── vite.config.js
├── render.yaml                   # Render.com deployment config
├── package.json                  # Root package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Oracle Database (local installation or Docker)
- Git

### Local Development Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/shantanuuh/ADM.git
cd ADM
```

#### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your Oracle credentials
# DB_USER=your_username
# DB_PASSWORD=your_password
# DB_CONNECT_STRING=localhost:1521/XEPDB1
# JWT_SECRET=your_secret_key
# PORT=5000

# Initialize database schema
node scripts/init_db.js

# Create admin user (default: admin/admin123)
node scripts/init_admin.js

# Start backend server
npm run dev
```

#### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Start frontend dev server
npm run dev
```

#### 4. Access the Application
- **Public Map**: http://localhost:5173
- **Admin Login**: http://localhost:5173/admin/login
- **API**: http://localhost:5000/api

### Using Docker for Oracle Database

```bash
# Pull and run Oracle XE
docker run -d \
  --name oracle-xe \
  -p 1521:1521 \
  -e ORACLE_PASSWORD=yourpassword \
  gvenzl/oracle-xe:latest

# Wait for container to be ready (check logs)
docker logs -f oracle-xe

# Update .env with Docker connection
# DB_CONNECT_STRING=localhost:1521/XEPDB1
```

## 📋 API Documentation

### Public Endpoints

#### Get All Incidents
```http
GET /api/incidents
```
Returns GeoJSON FeatureCollection of all incidents.

#### Create Incident
```http
POST /api/incidents
Content-Type: application/json

{
  "type": "Road Accident",
  "description": "Major accident on highway",
  "latitude": 19.0760,
  "longitude": 72.8777
}
```

### Admin Endpoints (Requires Authentication)

#### Admin Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```
Returns JWT token.

#### Update Incident Status
```http
PUT /api/incidents/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "RESOLVED"
}
```

#### Delete Incident
```http
DELETE /api/incidents/:id
Authorization: Bearer <token>
```

## 🎨 Design System

### Color Palette
- **Primary**: Indigo (`indigo-600`, `indigo-950`)
- **Text**: Slate (`slate-500` to `slate-900`)
- **Success**: Green (`green-500`, `green-600`)
- **Error**: Red (`red-500`, `red-600`)
- **Warning**: Yellow-Orange gradient

### Components
- **Glassmorphism**: `bg-white/70 backdrop-blur-[16px]`
- **Buttons**: Indigo primary, white secondary, red danger
- **Forms**: Consistent styling with focus states
- **Badges**: Color-coded by status

## 🔒 Security

- **JWT Authentication**: Secure admin access
- **Password Hashing**: bcrypt with salt rounds
- **CORS**: Configured for production
- **Input Validation**: Required field validation
- **SQL Injection Protection**: Parameterized queries

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions for:
- Render.com (with Oracle Cloud)
- Render.com (with PostgreSQL migration)
- Other platforms

## 🧪 Testing

### Manual Testing Checklist
- [ ] Map loads and displays Maharashtra
- [ ] Can click to place incident marker
- [ ] Form validation works
- [ ] Incident submission succeeds
- [ ] Success notification appears
- [ ] New incident appears on map
- [ ] Admin login works
- [ ] Admin can view all incidents
- [ ] Admin can resolve incidents
- [ ] Admin can delete incidents
- [ ] Responsive on mobile devices

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
DB_USER=your_oracle_user
DB_PASSWORD=your_oracle_password
DB_CONNECT_STRING=localhost:1521/XEPDB1
JWT_SECRET=your_secret_key_here
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **Shantanu** - [GitHub](https://github.com/shantanuuh)

## 🙏 Acknowledgments

- Leaflet for mapping functionality
- Oracle for database technology
- Render.com for hosting platform
- React and Vite communities

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Contact: shantanuharkulkar125@gmail.com

---

**Built with ❤️ for public safety and community welfare**
