# Setup Instructions

## Prerequisites

- Node.js 18+ 
- MongoDB 6.0+ (local or Atlas)
- npm or yarn

## Quick Start

### 1. Clone and Install Dependencies

```bash
# Navigate to project directory
cd project-management

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration

#### Backend (.env)

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/projectmgmt
JWT_ACCESS_SECRET=your_random_secret_key_here_min_32_chars
JWT_REFRESH_SECRET=another_random_secret_key_different_from_above
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Generate secrets (optional):**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### Frontend (.env)

```bash
cd frontend
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

### 3. Start MongoDB

**Local MongoDB:**
```bash
# Make sure MongoDB is running
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

**Or use MongoDB Atlas:**
Update `MONGODB_URI` in backend `.env` with your Atlas connection string.

### 4. Seed Database (Optional)

```bash
cd backend
npm run seed
```

This creates sample users:
- `admin@example.com` / `password123`
- `john@example.com` / `password123`
- `jane@example.com` / `password123`

### 5. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Server runs on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Client runs on http://localhost:5173

### 6. Access the Application

Open http://localhost:5173 in your browser.

---

## Production Deployment

### Backend

```bash
cd backend
npm start
```

### Frontend Build

```bash
cd frontend
npm run build
```

Static files will be in `frontend/dist/`. Serve with Nginx or any static file server.

---

## Project Structure

```
project-management/
├── backend/
│   ├── src/
│   │   ├── config/         # Database config
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Seeder, helpers
│   │   ├── app.js          # Express app setup
│   │   └── server.js       # Server entry
│   ├── .env                # Environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   │   └── board/      # Kanban board components
│   │   ├── context/        # Auth context
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── App.jsx         # Main app
│   │   └── main.jsx        # Entry point
│   ├── index.html
│   └── package.json
│
├── API_ENDPOINTS.md        # API documentation
├── SCHEMA_DESIGN.md        # Database design
└── SETUP.md               # This file
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find and kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or change port in .env
PORT=5001
```

### MongoDB Connection Error

```bash
# Check MongoDB status
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod
```

### CORS Errors

Make sure `FRONTEND_URL` in backend `.env` matches your frontend URL.

### JWT Errors

Ensure `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are set and different from each other.

---

## Features

- **Authentication**: JWT-based with refresh tokens
- **Authorization**: Role-based (Admin, Member, Viewer)
- **Projects**: Create and manage multiple projects
- **Boards**: Kanban boards with customizable columns
- **Tasks**: Drag-and-drop task management
- **Comments**: Task-level discussions
- **Real-time**: Optimistic UI updates

---

## Tech Stack

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs for password hashing

**Frontend:**
- React 18
- React Router 6
- Tailwind CSS
- @hello-pangea/dnd (drag-and-drop)
- Axios
- Lucide React (icons)
