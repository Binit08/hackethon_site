# 🚀 Hackathon 2026 Portal - NIT Silchar

A comprehensive, production-ready hackathon management platform built with modern web technologies. This portal handles the complete hackathon lifecycle from participant registration to automated judging, featuring real-time proctoring, code execution via Judge0, and automated certificate generation.

## ✨ Key Features

### Authentication & Security
- 🔐 **Secure Authentication**: NextAuth.js with JWT-based sessions and credential authentication
- 🔑 **Role-based Access Control**: Admin and participant roles with protected routes
- 🛡️ **Proctoring System**: Real-time violation detection with camera tracking, tab switching alerts, and focus monitoring

### Competition Management
- 🎯 **Multi-Round System**: Sequential progression through MCQ, Coding, and Final rounds
- ⏱️ **Auto-submission**: Automatic submission on navigation, tab close, or round timeout
- 📝 **MCQ Round**: Dynamic multiple-choice questions with instant validation and scoring
- 💻 **Coding Round**: Monaco editor with syntax highlighting and multi-language support
- ⚡ **Live Code Execution**: Real-time code testing via Judge0 API with multiple test cases
- 📊 **Real-time Leaderboard**: Live rankings with score updates and pagination

### Administrative Features
- 👨‍💼 **Admin Dashboard**: Statistics overview, problem management, and submission monitoring
- 🎛️ **Problem Management**: CRUD operations for problems, test cases, and scoring
- 📋 **Submission Tracking**: View, filter, and analyze participant submissions
- 📈 **Analytics**: Real-time stats on participants, submissions, and proctoring violations

### User Experience
- 👥 **Team Management**: Support for individual and team (up to 4 members) participation
- 🏆 **Certificate Generation**: Automatic PDF certificate generation for top performers
- 📧 **Email Notifications**: Automated registration confirmations and announcements
- ❓ **FAQ & Support**: Built-in help system with contact form
- 📱 **Fully Responsive**: Mobile-first design with seamless cross-device experience
- ♿ **Accessibility**: WCAG-compliant UI components from shadcn/ui

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Code Editor**: Monaco Editor
- **State Management**: React Hooks + Context API

### Backend
- **Runtime**: Node.js with Next.js API Routes
- **Authentication**: NextAuth.js 4.24
- **Database**: MongoDB Atlas with Mongoose ODM
- **Code Execution**: Judge0 API via RapidAPI
- **Email**: Nodemailer 7.0 with SMTP

### Infrastructure
- **Deployment**: Vercel (Serverless)
- **Package Manager**: pnpm
- **Database Hosting**: MongoDB Atlas
- **Build System**: Next.js standalone output

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 18.x or higher
- **Package Manager**: pnpm (recommended) or npm
- **Database**: MongoDB Atlas account (or local MongoDB 6.0+)
- **Code Execution**: Judge0 API key from RapidAPI
- **Email**: SMTP server credentials (Gmail recommended)

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/Binit08/hackethon_site.git
cd hackethon_site
```

2. **Install dependencies**:
```bash
pnpm install
# or
npm install
```

3. **Set up environment variables**:
```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Database - MongoDB Atlas
DATABASE_URL="mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/hackathon2026?retryWrites=true&w=majority&appName=Cluster0"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-secure-random-string-here"

# Judge0 API (from RapidAPI)
JUDGE0_API_URL="https://judge0-ce.p.rapidapi.com"
JUDGE0_API_KEY="your-rapidapi-key-here"

# Email Configuration (Gmail example)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-specific-password"
EMAIL_FROM="noreply@hackathon.nits.ac.in"
```

**Important Notes**:
- For MongoDB Atlas: URL-encode special characters in password (e.g., `@` becomes `%40`)
- For Gmail: Use an [App Password](https://support.google.com/accounts/answer/185833), not your regular password
- Generate NEXTAUTH_SECRET with: `openssl rand -base64 32`

4. **Create an admin user**:
```bash
pnpm run create-admin your-email@example.com your-password
```

5. **Run the development server**:
```bash
pnpm run dev
```

6. **Access the application**:
- **User Portal**: [http://localhost:3000](http://localhost:3000)
- **Admin Panel**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## 📦 Available Scripts

- `pnpm dev` - Start development server (port 3000)
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm run create-admin <email> <password>` - Create admin user

## 🌐 Deployment Guide

### Vercel Deployment

1. **Push to GitHub**:
```bash
git push origin main
```

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository

3. **Configure Environment Variables**:

Add the following in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Required |
|----------|-------|----------|
| `DATABASE_URL` | MongoDB Atlas connection string | ✅ Yes |
| `NEXTAUTH_URL` | Your production URL (e.g., https://your-app.vercel.app) | ✅ Yes |
| `NEXTAUTH_SECRET` | Random secure string | ✅ Yes |
| `JUDGE0_API_URL` | https://judge0-ce.p.rapidapi.com | ✅ Yes |
| `JUDGE0_API_KEY` | Your RapidAPI key | ✅ Yes |
| `EMAIL_SERVER_HOST` | smtp.gmail.com | ⚠️ Optional |
| `EMAIL_SERVER_PORT` | 587 | ⚠️ Optional |
| `EMAIL_SERVER_USER` | Your email | ⚠️ Optional |
| `EMAIL_SERVER_PASSWORD` | App password | ⚠️ Optional |
| `EMAIL_FROM` | Sender email | ⚠️ Optional |

4. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Access your live site!

### Post-Deployment Steps

1. Create admin user in production:
```bash
# SSH into your server or use Vercel CLI
pnpm run create-admin admin@example.com secure-password
```

2. Test the following:
   - User registration and login
   - Admin panel access
   - MCQ and coding round submission
   - Code execution with Judge0
   - Proctoring system

## 📂 Project Structure

```
hackathon-2026/
├── app/                        # Next.js App Router
│   ├── api/                    # API Routes (serverless functions)
│   │   ├── auth/               # Authentication endpoints
│   │   │   ├── [...nextauth]/  # NextAuth.js configuration
│   │   │   └── register/       # User registration
│   │   ├── admin/              # Admin-only endpoints
│   │   │   └── stats/          # Dashboard statistics
│   │   ├── problems/           # Problem CRUD operations
│   │   ├── submissions/        # Submission handling
│   │   │   └── auto/           # Auto-submission endpoint
│   │   ├── proctoring/         # Proctoring system
│   │   │   ├── sessions/       # Session management
│   │   │   ├── violations/     # Violation tracking
│   │   │   └── events/         # Real-time events
│   │   ├── run/                # Code execution via Judge0
│   │   ├── leaderboard/        # Rankings and scores
│   │   ├── certificate/        # PDF generation
│   │   └── contact/            # Contact form submission
│   ├── auth/                   # Authentication pages
│   │   ├── signin/             # Login page
│   │   └── register/           # Registration page
│   ├── admin/                  # Admin panel
│   │   ├── login/              # Admin login
│   │   └── proctoring/         # Violation monitoring
│   ├── dashboard/              # User dashboard
│   ├── rounds/                 # Competition rounds
│   │   ├── mcq/                # MCQ round
│   │   ├── coding/             # Coding round
│   │   └── round3/             # Final round
│   ├── leaderboard/            # Public leaderboard
│   ├── submissions/            # Submission history
│   ├── faq/                    # FAQ page
│   ├── contact/                # Contact page
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Homepage
│   ├── globals.css             # Global styles
│   └── providers.tsx           # Context providers
├── components/                 # React components
│   ├── ui/                     # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   └── ...                 # Other UI primitives
│   ├── navbar.tsx              # Navigation bar
│   ├── footer.tsx              # Footer
│   ├── proctoring.tsx          # Proctoring component
│   ├── conditional-navbar.tsx  # Smart navbar
│   └── conditional-footer.tsx  # Smart footer
├── lib/                        # Utility libraries
│   ├── mongodb.ts              # MongoDB connection
│   ├── auth.ts                 # Auth utilities
│   ├── judge0.ts               # Judge0 API client
│   ├── certificate.ts          # PDF generation
│   ├── email.ts                # Email service
│   ├── schedule.ts             # Round scheduling
│   ├── api.ts                  # API helpers
│   └── utils.ts                # General utilities
├── models/                     # Mongoose models
│   ├── User.ts                 # User schema
│   ├── Team.ts                 # Team schema
│   ├── Problem.ts              # Problem schema
│   ├── TestCase.ts             # Test case schema
│   ├── Submission.ts           # Submission schema
│   ├── MCQOption.ts            # MCQ option schema
│   ├── MCQAnswer.ts            # MCQ answer schema
│   ├── ProctoringSession.ts    # Proctoring session schema
│   ├── ProctoringViolation.ts  # Violation schema
│   ├── Session.ts              # NextAuth session
│   └── Account.ts              # NextAuth account
├── types/                      # TypeScript definitions
│   └── next-auth.d.ts          # NextAuth type extensions
├── hooks/                      # Custom React hooks
│   └── use-toast.ts            # Toast notifications
├── scripts/                    # Utility scripts
│   └── create-admin.ts         # Admin user creation
├── public/                     # Static assets
│   ├── images/
│   └── favicon.ico
├── docs/                       # Documentation
│   └── hackathon_2026_srs.md  # Requirements specification
├── middleware.ts               # Next.js middleware
├── next.config.js              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS config
├── tsconfig.json               # TypeScript config
├── package.json                # Dependencies
├── vercel.json                 # Vercel config
└── README.md                   # This file
```

## 🔑 Key Implementation Details

### Authentication Flow
1. Users register with email/password via `/api/auth/register`
2. NextAuth.js handles session management with JWT tokens
3. Credentials provider validates against MongoDB
4. Protected routes check session via middleware
5. Admin role verified on protected admin routes

### Code Execution Flow
1. User submits code in Monaco editor
2. Frontend sends code + language + problem ID to `/api/run`
3. Backend fetches test cases from MongoDB
4. Code execution delegated to Judge0 API
5. Results compared with expected outputs
6. Score calculated and stored in Submission model
7. Results returned to frontend with detailed feedback

### Proctoring System
1. Browser APIs monitor user activity (MediaDevices, Page Visibility)
2. Violations detected: tab switch, camera block, window blur
3. Events sent to `/api/proctoring/violations` via fetch
4. Auto-submission triggered on critical violations
5. Admin dashboard displays violation logs in real-time

### Auto-submission Mechanism
1. Event listeners on: `beforeunload`, `popstate`, `visibilitychange`
2. `navigator.sendBeacon` ensures reliable submission
3. Batched submission to `/api/submissions/auto`
4. Proctoring cleanup via global `__stopProctoring()` hook
5. Works even when page is closing/navigating away

## 🎨 UI/UX Features

- **Dark/Light Mode**: System preference detection with toggle option
- **Loading States**: Skeleton loaders and spinners for async operations
- **Error Handling**: Toast notifications for user feedback
- **Form Validation**: Client and server-side validation
- **Accessibility**: Keyboard navigation, ARIA labels, focus management
- **Mobile Responsive**: Breakpoints for tablet and mobile devices
- **Progressive Enhancement**: Works without JavaScript for basic features

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure session tokens with expiry
- **CSRF Protection**: Built-into NextAuth.js
- **Input Validation**: Zod schemas for API inputs
- **SQL Injection Prevention**: Mongoose ODM parameterized queries
- **XSS Protection**: React automatic escaping
- **Rate Limiting**: API route protection (via middleware)
- **Environment Variables**: Secrets stored in .env (never committed)

## 🧪 Testing

### Manual Testing Checklist

**Authentication**:
- [ ] User registration with validation
- [ ] User login with credentials
- [ ] Session persistence across page refresh
- [ ] Logout functionality
- [ ] Admin login with role verification

**MCQ Round**:
- [ ] Question display and navigation
- [ ] Answer selection and submission
- [ ] Score calculation
- [ ] Auto-submit on timeout

**Coding Round**:
- [ ] Monaco editor syntax highlighting
- [ ] Language selection (C, C++, Java, Python, JavaScript)
- [ ] Code submission with multiple test cases
- [ ] Real-time execution feedback
- [ ] Score update on leaderboard

**Proctoring**:
- [ ] Camera access request
- [ ] Tab switch detection
- [ ] Window blur detection
- [ ] Camera block detection
- [ ] Violation logging to database
- [ ] Auto-submit on violations

**Admin Panel**:
- [ ] Dashboard statistics
- [ ] Problem creation/editing
- [ ] Submission viewing
- [ ] Violation monitoring

## 🐛 Troubleshooting

### Common Issues

**Database Connection Failed**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Ensure MongoDB Atlas connection string is correct and IP whitelist includes your IP (or use `0.0.0.0/0` for development)

**NextAuth Configuration Error**
```
Error: [next-auth][error][NO_SECRET]
```
**Solution**: Set `NEXTAUTH_SECRET` in environment variables using `openssl rand -base64 32`

**Judge0 API Error**
```
Error: 401 Unauthorized
```
**Solution**: Verify `JUDGE0_API_KEY` is valid on RapidAPI dashboard

**Email Sending Failed**
```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```
**Solution**: Use App Password for Gmail (not regular password). Enable 2FA and generate app-specific password.

**Port Already in Use**
```
Error: Port 3000 is already in use
```
**Solution**:
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9
# Or run on different port
pnpm run dev -- -p 3001
```

**Special Characters in MongoDB Password**
```
Error: Invalid connection string
```
**Solution**: URL-encode special characters:
- `@` → `%40`
- `#` → `%23`
- `!` → `%21`
- `%` → `%25`

### Debug Mode

Enable detailed logging:
```env
# Add to .env
NODE_ENV=development
NEXTAUTH_DEBUG=true
```

## 📚 API Documentation

### Authentication Endpoints

**POST** `/api/auth/register`
- **Description**: Register new user
- **Body**: `{ name, email, password, teamMembers? }`
- **Response**: `{ success: true, userId }`

**POST** `/api/auth/[...nextauth]`
- **Description**: NextAuth.js endpoints (signin, signout, session)
- **Handled by**: NextAuth.js

### Problem Endpoints

**GET** `/api/problems`
- **Description**: Get all problems for current round
- **Auth**: Required
- **Response**: `Problem[]`

**GET** `/api/problems/[id]`
- **Description**: Get specific problem with test cases
- **Auth**: Required (Admin for hidden test cases)
- **Response**: `Problem`

### Submission Endpoints

**POST** `/api/run`
- **Description**: Execute code against test cases
- **Auth**: Required
- **Body**: `{ problemId, code, language }`
- **Response**: `{ results: TestResult[], score, totalScore }`

**POST** `/api/submissions/auto`
- **Description**: Batch auto-submission endpoint
- **Auth**: Required
- **Body**: `{ submissions: Array<{problemId, answer}> }`
- **Response**: `{ success: true, count }`

**GET** `/api/submissions`
- **Description**: Get user's submissions
- **Auth**: Required
- **Response**: `Submission[]`

### Proctoring Endpoints

**POST** `/api/proctoring/sessions`
- **Description**: Create proctoring session
- **Auth**: Required
- **Body**: `{ userId, roundType }`
- **Response**: `{ sessionId }`

**POST** `/api/proctoring/violations`
- **Description**: Log proctoring violation
- **Auth**: Required
- **Body**: `{ sessionId, type, details }`
- **Response**: `{ success: true }`

**GET** `/api/proctoring/violations`
- **Description**: Get all violations (Admin only)
- **Auth**: Admin
- **Response**: `ProctoringViolation[]`

### Admin Endpoints

**GET** `/api/admin/stats`
- **Description**: Get dashboard statistics
- **Auth**: Admin
- **Response**: `{ totalUsers, totalSubmissions, violationCount, ... }`

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style
- Follow TypeScript best practices
- Use ESLint and Prettier configurations
- Write descriptive commit messages
- Add comments for complex logic

## 📄 License

This project is licensed under the **MIT License** - see the LICENSE file for details.

## 👥 Authors

- **Binit** - Initial work - [Binit08](https://github.com/Binit08)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Judge0](https://judge0.com/) - Code execution engine
- [MongoDB Atlas](https://www.mongodb.com/atlas) - Database hosting
- [Vercel](https://vercel.com/) - Deployment platform
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Code editor

## 📞 Support

For questions, issues, or support:

- **Email**: support@hackathon.nits.ac.in
- **GitHub Issues**: [Create an issue](https://github.com/Binit08/hackethon_site/issues)
- **Documentation**: See `/docs` folder for additional guides

## 🔮 Future Enhancements

- [ ] Real-time code collaboration for teams
- [ ] AI-powered code plagiarism detection
- [ ] Video recording of proctoring sessions
- [ ] Integration with GitHub for code submission
- [ ] Mobile app for iOS and Android
- [ ] Analytics dashboard for organizers
- [ ] Multi-language support (i18n)
- [ ] Webhook integrations for notifications

---

**Built with ❤️ for NIT Silchar Hackathon 2026**

