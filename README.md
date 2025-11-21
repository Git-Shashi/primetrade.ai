# PrimeTrade - Backend Developer Assignment

A production-grade REST API with authentication, role-based access control, and task management built with Node.js, Express, MongoDB, and JWT.

## 🚀 Features

### Backend (Primary Focus)
- ✅ User registration & login with JWT authentication
- ✅ Role-based access control (user vs admin)
- ✅ CRUD APIs for tasks with owner association
- ✅ API versioning (`/api/v1`)
- ✅ Input validation with Zod
- ✅ Custom error handling with extended Error classes
- ✅ MongoDB with Mongoose ODM
- ✅ Password hashing with bcryptjs
- ✅ Security middleware (Helmet, CORS, rate limiting)
- ✅ Request logging with Morgan
- ✅ Microservices-style architecture (services, controllers, models)

### Frontend (Supportive)
- ✅ Next.js 14 with App Router
- ✅ TailwindCSS + shadcn/ui components
- ✅ User registration & login pages
- ✅ Protected dashboard with JWT
- ✅ Task CRUD operations UI
- ✅ Toast notifications for feedback
- ✅ Responsive design

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

## 🛠️ Technology Stack

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

## 📦 Installation & Setup

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

## 🔌 API Endpoints

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

## 📝 API Request Examples

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

## 🔒 Security Features

1. **Password Hashing:** bcryptjs with salt rounds of 12
2. **JWT Authentication:** Secure token-based auth with configurable expiry
3. **Input Validation:** Zod schemas for all inputs
4. **Rate Limiting:** 100 requests per 15 minutes per IP
5. **CORS:** Configured for frontend origin
6. **Helmet:** Security headers
7. **Error Handling:** Custom error classes with proper status codes
8. **MongoDB Injection Protection:** Mongoose schema validation

## 📊 Database Schema

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

## 🎯 Role-Based Access Control

- **User Role:**
  - Can create tasks
  - Can view own tasks
  - Can update/delete own tasks
  
- **Admin Role:**
  - Can view all tasks
  - Can update/delete any task
  - Has full system access

## 🚀 Scalability Notes

### Current Architecture
- **Microservices Pattern:** Separated concerns (controllers, services, models)
- **Stateless Authentication:** JWT enables horizontal scaling
- **Database Indexing:** Indexes on frequently queried fields
- **Connection Pooling:** MongoDB connection pool (max 10)

### Recommendations for Production Scale

1. **Caching Layer:**
   ```javascript
   // Add Redis for session/query caching
   - Cache frequently accessed tasks
   - Cache user sessions
   - Implement cache invalidation strategy
   ```

2. **Load Balancing:**
   ```nginx
   upstream backend {
     server backend1:5000;
     server backend2:5000;
     server backend3:5000;
   }
   ```

3. **Database Optimization:**
   - Implement MongoDB replica sets for high availability
   - Add read replicas for read-heavy operations
   - Use MongoDB sharding for large datasets
   - Add compound indexes for complex queries

4. **API Gateway:**
   - Implement API gateway (Kong, AWS API Gateway)
   - Centralized authentication
   - Rate limiting per user/endpoint
   - Request/response transformation

5. **Monitoring & Logging:**
   - Implement ELK stack (Elasticsearch, Logstash, Kibana)
   - Add APM tools (New Relic, Datadog)
   - Set up health check endpoints
   - Implement distributed tracing

6. **Containerization:**
   ```dockerfile
   # Dockerfile example
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   EXPOSE 5000
   CMD ["node", "src/server.js"]
   ```

7. **Message Queue:**
   - Add RabbitMQ/Kafka for async operations
   - Background job processing
   - Email notifications
   - Task assignment notifications

## 🧪 Testing

To add tests, create a `tests/` directory and use Jest:

```bash
npm install --save-dev jest supertest
```

Example test structure:
```javascript
// tests/auth.test.js
describe('Auth API', () => {
  test('should register new user', async () => {
    // Test implementation
  });
});
```

## 🐳 Docker Deployment (Optional)

```yaml
# docker-compose.yml
version: '3.8'
services:
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
  
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/primetrade
    depends_on:
      - mongodb
  
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  mongo-data:
```

## 📄 Environment Variables

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

## 🤝 Contributing

This is an assignment project. For production use:
1. Add comprehensive test coverage
2. Implement CI/CD pipeline
3. Add API documentation (Swagger/OpenAPI)
4. Implement proper logging and monitoring
5. Add Docker support
6. Implement refresh token rotation

## 📝 License

MIT

## 👨‍💻 Author

Built for Backend Developer Internship Assignment

---

**Note:** This is a demonstration project showcasing production-grade coding practices, microservices architecture, security best practices, and scalability considerations.
