# PrimeTrade - Task Management API

A REST API with authentication, role-based access, and task management. Built with Node.js, Express, MongoDB, and JWT.

## Features

### Backend
- User registration & login with JWT
- Role-based access (user/admin)
- Task CRUD operations
- API versioning (`/api/v1`)
- Input validation with Zod
- Error handling
- Password hashing with bcryptjs
- Security middleware (Helmet, CORS, rate limiting)
- Request logging

### Frontend
- Next.js 14 with App Router
- TailwindCSS + shadcn/ui
- Login & registration pages
- Protected dashboard
- Task management UI
- Toast notifications
- Responsive design

## 📁 Project Structure

```
primetrade/
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth, error handling, async wrapper
│   │   ├── models/         # Mongoose schemas (User, Task)
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic layer
│   │   ├── utils/          # Utilities (errors, jwt, logger)
│   │   ├── validators/     # Zod schemas
│   │   ├── app.js          # Express app setup
│   │   └── server.js       # Server entry point
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── app/            # Next.js app router pages
    │   ├── components/     # React components
    │   ├── contexts/       # Auth context
    │   └── lib/            # API client, utilities
    ├── package.json
    └── .env.local
```

## Tech Stack

### Backend
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** Zod
- **Security:** Helmet, CORS, bcryptjs, express-rate-limit
- **Logging:** Morgan

### Frontend
- **Framework:** Next.js 14 (App Router)
- **UI:** TailwindCSS + shadcn/ui (Radix UI)
- **HTTP Client:** Axios
- **Icons:** Lucide React

## Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your MongoDB URI and secrets:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/primetrade
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_token_secret_key
JWT_REFRESH_EXPIRE=30d
```

5. Start MongoDB (if running locally):
```bash
# macOS
brew services start mongodb-community

# Or using mongod directly
mongod --dbpath /path/to/your/data/directory
```

6. Run the backend server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Update `.env.local` if needed (default points to `http://localhost:5000`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

4. Run the frontend:
```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

Frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication (`/api/v1/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| GET | `/auth/profile` | Get user profile | Yes |
| PUT | `/auth/profile` | Update profile | Yes |
| POST | `/auth/logout` | Logout user | Yes |

### Tasks (`/api/v1/tasks`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/tasks` | Get all tasks | Yes |
| POST | `/tasks` | Create new task | Yes |
| GET | `/tasks/stats` | Get task statistics | Yes |
| GET | `/tasks/:id` | Get single task | Yes |
| PUT | `/tasks/:id` | Update task | Yes (owner/admin) |
| DELETE | `/tasks/:id` | Delete task | Yes (owner/admin) |

## Example Requests

### Register User
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Task (with JWT)
```bash
curl -X POST http://localhost:5000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Complete project",
    "description": "Finish the backend assignment",
    "status": "in-progress",
    "priority": "high"
  }'
```

### Get All Tasks
```bash
curl -X GET http://localhost:5000/api/v1/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Security

- Password hashing with bcryptjs (12 rounds)
- JWT authentication with configurable expiry
- Input validation using Zod schemas
- Rate limiting (100 req/15min per IP)
- CORS configured for frontend
- Helmet security headers
- Custom error handling
- Mongoose validation to prevent injection

## Database Schema

### User Model
```javascript
{
  name: String (required, 2-50 chars),
  email: String (required, unique, validated),
  password: String (required, hashed, min 6 chars),
  role: String (enum: 'user', 'admin', default: 'user'),
  isActive: Boolean (default: true),
  timestamps: true
}
```

### Task Model
```javascript
{
  title: String (required, 3-100 chars),
  description: String (required, max 1000 chars),
  status: String (enum: ['pending', 'in-progress', 'completed', 'cancelled']),
  priority: String (enum: ['low', 'medium', 'high', 'urgent']),
  dueDate: Date (optional),
  owner: ObjectId (ref: User, required),
  assignedTo: ObjectId (ref: User, optional),
  timestamps: true
}
```

## Role-Based Access

- **User Role:**
  - Can create tasks
  - Can view own tasks
  - Can update/delete own tasks
  
- **Admin Role:**
  - Can view all tasks
  - Can update/delete any task
  - Has full system access

## Scalability

### Current Setup
- Separated concerns (controllers, services, models)
- Stateless JWT authentication for horizontal scaling
- Database indexes on frequently queried fields
- MongoDB connection pool (max 10)

### For Production

Some things to consider when scaling:

- Add Redis for caching frequently accessed data
- Use load balancer to distribute traffic
- Set up MongoDB replica sets for high availability
- Implement API gateway for centralized auth and rate limiting
- Add monitoring (ELK stack, APM tools)
- Containerize with Docker
- Use message queue (RabbitMQ/Kafka) for async tasks

## Testing

Tests can be added using Jest and Supertest:

```bash
npm install --save-dev jest supertest
```

## Docker Deployment

Basic `docker-compose.yml` setup:

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
  
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
  
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
```

## Environment Variables

### Backend `.env`
```env
NODE_ENV=development|production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/primetrade
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRE=30d
CLIENT_URL=http://localhost:3000
```

## Contributing

Feel free to open issues or submit PRs.

## License

MIT
