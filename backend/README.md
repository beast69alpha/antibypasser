# Anti-Bypass Link Protection System - Backend Setup

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Installation Steps

1. **Install Dependencies**
```bash
cd backend
npm install
```

2. **Configure Environment**
```bash
# Copy example env file
copy .env.example .env

# Edit .env with your settings
notepad .env
```

Required settings:
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` - Your MySQL credentials
- `JWT_SECRET` - Change to a random secure string
- `FRONTEND_URL` - Your frontend URL (for CORS)

3. **Setup Database**
```bash
# Create database
mysql -u root -p < database/schema.sql

# Or manually run the SQL commands from schema.sql
```

4. **Start Server**
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:3000`

---

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # Database connection pool
├── models/
│   ├── User.js              # User model
│   ├── Link.js              # Link model
│   ├── Token.js             # Token model
│   └── AccessLog.js         # Access log model
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── links.js             # Link management routes
│   └── protection.js        # Protection validation routes
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── database/
│   └── schema.sql           # Database schema
├── scripts/
│   └── initDatabase.js      # Database initialization script
├── .env.example             # Environment variables template
├── .gitignore
├── package.json
└── server.js                # Main server file
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Links (Protected)
- `POST /api/links` - Create link
- `GET /api/links` - Get all user links
- `GET /api/links/:linkId` - Get single link
- `PUT /api/links/:linkId` - Update link
- `DELETE /api/links/:linkId` - Delete link
- `POST /api/links/:linkId/token` - Generate access token

### Protection (Public)
- `POST /api/protection/validate` - Validate token and get destination
- `GET /api/protection/link/:linkId` - Get link metadata
- `GET /api/protection/logs/:linkId` - Get access logs (protected)

---

## 🗄️ Database Schema

### Tables
- **users** - User accounts
- **links** - Protected links
- **link_tokens** - One-time use tokens
- **access_logs** - Access attempt logs
- **user_settings** - User preferences

---

## 🔒 Security Features

1. **Password Hashing** - bcryptjs with 10 rounds
2. **JWT Authentication** - Secure token-based auth
3. **Rate Limiting** - 100 requests per 15 minutes
4. **CORS Protection** - Configurable origin
5. **Helmet.js** - Security headers
6. **SQL Injection Protection** - Parameterized queries

---

## 🌐 Frontend Integration

Update `js/api-client.js`:
```javascript
const API_BASE_URL = 'https://your-backend-url.com/api';
```

---

## 📊 Monitoring

- Health check: `GET /health`
- Logs: Console output (use PM2 or similar for production)

---

## 🚢 Deployment Options

### Option 1: VPS (DigitalOcean, Linode, AWS EC2)
1. Install Node.js and MySQL
2. Clone repository
3. Setup environment variables
4. Use PM2 for process management
5. Setup nginx as reverse proxy

### Option 2: Heroku
1. Create Heroku app
2. Add ClearDB MySQL addon
3. Set environment variables
4. Deploy via Git

### Option 3: Railway/Render
1. Connect GitHub repository
2. Add MySQL database
3. Configure environment variables
4. Auto-deploys on push

---

## 🔧 Troubleshooting

**Database Connection Failed**
- Check MySQL is running
- Verify credentials in `.env`
- Check firewall settings

**JWT Token Errors**
- Ensure `JWT_SECRET` is set
- Check token expiration settings

**CORS Errors**
- Set correct `FRONTEND_URL` in `.env`
- Verify frontend is using correct API URL

---

## 📝 Environment Variables

```env
PORT=3000
NODE_ENV=production
DB_HOST=localhost
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=antibypasser_db
DB_PORT=3306
JWT_SECRET=your_secret_key
FRONTEND_URL=https://yourdomain.com
JWT_EXPIRES_IN=7d
LINK_TOKEN_EXPIRES_MINUTES=30
```
