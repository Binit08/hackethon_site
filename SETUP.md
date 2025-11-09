# Local Development Setup Guide

## Prerequisites

- Node.js 18+ installed
- MongoDB installed locally OR MongoDB Atlas account
- npm or yarn package manager

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up MongoDB

**Option A: Local MongoDB**
- Install MongoDB from https://www.mongodb.com/try/download/community
- Start MongoDB service:
  ```bash
  # macOS (if installed via Homebrew)
  brew services start mongodb-community
  
  # Linux
  sudo systemctl start mongod
  
  # Windows
  # Start MongoDB from Services or run mongod.exe
  ```

**Option B: MongoDB Atlas (Cloud)**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Get your connection string

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Database - Use one of these:
# Local MongoDB:
DATABASE_URL="mongodb://localhost:27017/hackathon2026?retryWrites=true&w=majority"

# OR MongoDB Atlas:
# DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/hackathon2026?retryWrites=true&w=majority"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-generate-a-random-string"

# Email Configuration (for notifications)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@hackathon.nits.ac.in"

# Environment
NODE_ENV="development"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Database Setup

Mongoose will automatically create collections when you first run the application. No manual schema migration needed!

### 6. (Optional) Seed Database with Sample Data

```bash
npm run db:seed
```

This creates:
- Admin user: `admin@hackathon.nits.ac.in` / password: `admin123`
- Sample coding problems
- Sample MCQ problems

### 7. Start Development Server

```bash
npm run dev
```

The application will be available at **http://localhost:3000**

## Quick Start (All Commands)

```bash
# 1. Install dependencies
npm install

# 2. (Optional) Seed database with sample data
npm run db:seed

# 3. Start dev server
npm run dev
```

## Accessing the Application

- **Home Page**: http://localhost:3000
- **Sign In**: http://localhost:3000/auth/signin
- **Register**: http://localhost:3000/auth/register
- **Dashboard**: http://localhost:3000/dashboard (requires login)
- **Admin Panel**: http://localhost:3000/admin (requires admin role)

## Default Admin Credentials

After seeding:
- **Email**: admin@hackathon.nits.ac.in
- **Password**: admin123

⚠️ **Change the admin password in production!**

## Troubleshooting

### MongoDB Connection Issues

1. **Check if MongoDB is running:**
   ```bash
   # macOS/Linux
   mongosh
   
   # Should connect successfully
   ```

2. **Verify connection string:**
   - Local: `mongodb://localhost:27017/hackathon2026`
   - Atlas: Check your cluster connection string

### Database Issues

1. **Clear database and reseed:**
   ```bash
   # Connect to MongoDB and drop the database
   mongosh
   use hackathon2026
   db.dropDatabase()
   exit
   
   # Then reseed
   npm run db:seed
   ```

### Port Already in Use

If port 3000 is busy:
```bash
# Kill process on port 3000
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

## Useful Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:seed` - Seed database with sample data
- `npm run lint` - Run ESLint

## Next Steps

1. Create your first user account via registration
2. Add problems via the admin panel
3. Test MCQ and coding rounds
4. Check leaderboard functionality

## Database GUI

You can use MongoDB Compass or any MongoDB GUI tool to view and edit your database:

- **MongoDB Compass**: https://www.mongodb.com/products/compass
- Connect using: `mongodb://localhost:27017/hackathon2026`

