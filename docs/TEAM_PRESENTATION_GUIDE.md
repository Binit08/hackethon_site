# Team Presentation Guide - Hackathon Portal 2026

## Project Overview
A full-stack online hackathon platform with real-time proctoring, code execution, and automated assessment.

**Tech Stack**: Next.js 14, TypeScript, MongoDB Atlas, NextAuth.js, Judge0 API, face-api.js

---

## Team Member Assignments (7 People)

### 👤 **Person 1: Authentication & User Management**

**Your Responsibility**: User authentication, registration, role-based access control

#### What You Built:
- **Registration System** (`/app/auth/register/page.tsx`)
  - Multi-step form with validation
  - Team creation (up to 4 members)
  - Password hashing with bcrypt
  - Email verification support

- **Login System** (`/app/auth/signin/page.tsx`)
  - Credential-based authentication
  - Session management with JWT tokens
  - Remember me functionality

#### Technologies You Used:
1. **NextAuth.js 4.24**
   - Handles authentication flow
   - JWT session strategy
   - Credentials provider for email/password
   - Session cookies with secure flags

2. **MongoDB + Mongoose**
   - User model: email, password, role, teamId
   - Account model: OAuth integrations (future)
   - Session model: active sessions tracking

3. **bcrypt**
   - Password hashing with 10 salt rounds
   - Secure password comparison

#### How It Works:
```typescript
// Registration Flow:
1. User fills form → validates email/password
2. Check if email exists in MongoDB
3. Hash password with bcrypt
4. Create User document in database
5. Create Team document (if team members added)
6. Auto-login with NextAuth session

// Login Flow:
1. User submits credentials
2. NextAuth calls authorize() function
3. Fetch user from MongoDB by email
4. Compare password hash with bcrypt.compare()
5. Return user object → JWT token created
6. Session cookie set → redirect to dashboard
```

#### API Endpoints You Own:
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth handlers (signin/signout/session)

#### Key Files:
- `/lib/auth.ts` - NextAuth configuration
- `/models/User.ts` - User schema
- `/models/Team.ts` - Team schema
- `/app/api/auth/register/route.ts` - Registration endpoint

#### Demo Points:
- Show registration with team members
- Show login with wrong/correct password
- Show session persistence (refresh page)
- Show admin vs participant role routing

---

### 👤 **Person 2: MCQ Round & Submission System**

**Your Responsibility**: Multiple-choice questions, answer submission, scoring

#### What You Built:
- **MCQ Round Interface** (`/app/rounds/mcq/page.tsx`)
  - Radio button question display
  - Real-time answer selection
  - Timer countdown
  - Auto-submission on timeout
  - Navigation protection (back button handling)

- **MCQ Answer Processing**
  - Instant score calculation
  - Answer validation
  - Submission history

#### Technologies You Used:
1. **React Client Components**
   - useState for answer tracking
   - useEffect for timer logic
   - Radio groups from shadcn/ui

2. **MongoDB Models**
   - Problem model: question, options, correctAnswer, points
   - MCQOption model: option text, isCorrect flag
   - MCQAnswer model: user answers with timestamps
   - Submission model: final scores

3. **Navigator API**
   - `navigator.sendBeacon()` for reliable auto-submission
   - Works even when page is closing

#### How It Works:
```typescript
// MCQ Flow:
1. Fetch problems from /api/problems (type: MCQ)
2. Display questions with radio buttons
3. User selects answers → store in local state
4. Timer counts down (useEffect interval)
5. On submit/timeout:
   - Send answers to /api/submissions/auto
   - Calculate score: correct answers × points
   - Store in Submission collection
   - Update user's total score

// Auto-submission triggers:
- Timer reaches 0:00
- User clicks "Submit" button
- User navigates away (beforeunload event)
- Tab close (visibilitychange event)
```

#### API Endpoints You Own:
- `GET /api/problems` - Fetch MCQ questions (filtered by round)
- `POST /api/submissions` - Submit answers
- `POST /api/submissions/auto` - Batch auto-submission

#### Database Schema:
```typescript
Problem {
  title: String
  description: String
  type: "MCQ" | "CODING"
  difficulty: "EASY" | "MEDIUM" | "HARD"
  points: Number
  round: "MCQ" | "CODING" | "ROUND3"
  options: [MCQOption]
  correctAnswer: String
}

Submission {
  userId: ObjectId
  problemId: ObjectId
  answer: String  // Selected option
  isCorrect: Boolean
  score: Number
  submittedAt: Date
}
```

#### Key Files:
- `/app/rounds/mcq/page.tsx` - MCQ UI
- `/app/api/problems/route.ts` - Problem fetching
- `/app/api/submissions/route.ts` - Answer submission
- `/models/Problem.ts` - Problem schema
- `/models/Submission.ts` - Submission schema

#### Demo Points:
- Show MCQ questions loading
- Select answers and submit
- Show score calculation
- Trigger auto-submit (close tab)
- Show submission history in admin panel

---

### 👤 **Person 3: Coding Round & Judge0 Integration**

**Your Responsibility**: Code editor, test execution, online judging

#### What You Built:
- **Monaco Code Editor** (`/app/rounds/coding/page.tsx`)
  - Syntax highlighting for 5 languages
  - Auto-completion
  - Theme: VS Dark
  - Language switcher (C, C++, Java, Python, JavaScript)

- **Code Execution System**
  - Submit code to Judge0 API
  - Run against hidden test cases
  - Real-time result display
  - Score calculation based on passed tests

#### Technologies You Used:
1. **Monaco Editor** (VS Code's editor)
   - `@monaco-editor/react`
   - Language modes: cpp, java, python, javascript
   - Intellisense and syntax validation

2. **Judge0 API** (via RapidAPI)
   - Cloud-based code execution
   - Supports 40+ languages
   - Sandboxed execution environment
   - CPU/memory limits enforcement

3. **Next.js API Routes**
   - Proxy to Judge0 (hides API key)
   - Test case validation
   - Score aggregation

#### How It Works:
```typescript
// Code Execution Flow:
1. User writes code in Monaco editor
2. Selects language (maps to Judge0 language_id)
3. Clicks "Run Code" or "Submit"
4. Frontend sends to /api/run:
   {
     problemId: "...",
     code: "user code",
     language: "python"
   }

5. Backend:
   - Fetches test cases from Problem collection
   - For each test case:
     a. Send to Judge0: POST /submissions
        {
          source_code: base64(code),
          language_id: 71 (Python),
          stdin: base64(testInput),
          expected_output: testOutput
        }
     b. Poll Judge0: GET /submissions/{token}
     c. Compare output with expected
   
6. Calculate score:
   - Passed tests / Total tests × Problem points
   
7. Store Submission:
   - Code, language, results, score
   - Timestamp for leaderboard ranking

8. Return results to frontend:
   {
     results: [
       { input, expected, actual, passed, time, memory }
     ],
     score: 80,
     totalScore: 100
   }
```

#### Judge0 Language Mappings:
```typescript
{
  "c": 50,          // GCC 9.2.0
  "cpp": 54,        // G++ 9.2.0
  "java": 62,       // OpenJDK 13
  "python": 71,     // Python 3.8.1
  "javascript": 63  // Node.js 12.14.0
}
```

#### API Endpoints You Own:
- `POST /api/run` - Execute code with test cases
- Integration with Judge0:
  - `POST https://judge0-ce.p.rapidapi.com/submissions`
  - `GET https://judge0-ce.p.rapidapi.com/submissions/{token}`

#### Database Schema:
```typescript
TestCase {
  problemId: ObjectId
  input: String       // stdin
  expectedOutput: String
  isHidden: Boolean   // Public vs hidden tests
  timeLimit: Number   // milliseconds
  memoryLimit: Number // KB
}

Submission {
  userId: ObjectId
  problemId: ObjectId
  code: String
  language: String
  results: [{
    testCaseId: ObjectId
    passed: Boolean
    actualOutput: String
    executionTime: Number
    memoryUsed: Number
    error: String
  }]
  score: Number
  totalTests: Number
  passedTests: Number
}
```

#### Key Files:
- `/app/rounds/coding/page.tsx` - Editor UI
- `/app/api/run/route.ts` - Execution handler
- `/lib/judge0.ts` - Judge0 client
- `/models/TestCase.ts` - Test case schema

#### Environment Variables:
```env
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=52c70b0eccmsh340f70d06561d59p1fc9ebjsn922e489ee6b1
```

#### Demo Points:
- Open coding round
- Write simple Python program
- Run against test cases
- Show passed/failed results
- Show execution time and memory
- Submit and check leaderboard update

---

### 👤 **Person 4: Proctoring System & face-api.js**

**Your Responsibility**: Real-time exam monitoring, violation detection, face recognition

#### What You Built:
- **Proctoring Component** (`/components/proctoring.tsx`)
  - Live camera feed (mandatory)
  - Real-time face detection
  - Multiple face detection
  - Looking away detection
  - Identity verification
  - Violation logging

- **Admin Monitoring Dashboard** (`/app/admin/proctoring/page.tsx`)
  - View all proctoring sessions
  - Violation list with filters
  - Session details
  - Suspicion score calculation

#### Technologies You Used:
1. **face-api.js** (TensorFlow.js models)
   - **TinyFaceDetector**: Fast face detection (~30ms)
   - **FaceLandmark68Net**: 68 facial landmark points
   - **FaceRecognitionNet**: 128-dimensional face descriptors

2. **Browser APIs**
   - **MediaDevices API**: Camera/mic access
   - **getUserMedia()**: Video stream capture
   - **Page Visibility API**: Tab switching detection
   - **Window Events**: Blur/focus detection
   - **Navigator.sendBeacon()**: Reliable violation logging

3. **MongoDB Collections**
   - ProctoringSession: Session tracking
   - ProctoringViolation: Individual violations
   - User: Face descriptor storage

#### How It Works:
```typescript
// Proctoring Initialization:
1. Component mounts on exam page
2. Load face-api.js models from /public/models/:
   - tiny_face_detector_model (189 KB)
   - face_landmark_68_model (348 KB)
   - face_recognition_model (6.1 MB)
3. Request camera permission (MANDATORY)
4. Start video stream
5. Create ProctoringSession in DB

// Face Detection Loop (every 3 seconds):
1. Capture video frame
2. Run face detection:
   const detections = await faceapi
     .detectAllFaces(video, new TinyFaceDetectorOptions())
     .withFaceLandmarks()
     .withFaceDescriptors()

3. Check violations:
   - detections.length === 0 → NO_FACE (HIGH)
   - detections.length > 1 → MULTIPLE_FACES (HIGH)
   - Nose offset > 30% eye distance → LOOKING_AWAY (MEDIUM)
   - Face descriptor distance > 0.6 → DIFFERENT_PERSON (HIGH)

4. Log violation to /api/proctoring/violations

// Browser Monitoring:
- Tab switch: visibilitychange event
- Window blur: blur event
- Camera disabled: track.ended event
- Network loss: offline event

// Identity Verification:
1. During registration (optional): capture face descriptor
2. Store 128-dimensional vector in User.faceDescriptor
3. During exam: compare current face with stored descriptor
4. Euclidean distance < 0.6 = same person
```

#### Violation Types & Severity:
| Violation | Severity | Description |
|-----------|----------|-------------|
| NO_FACE | HIGH | No face detected for 6+ seconds |
| MULTIPLE_FACES | HIGH | 2+ people in frame |
| LOOKING_AWAY | MEDIUM | Eyes not on screen (3 consecutive) |
| DIFFERENT_PERSON | HIGH | Face mismatch (descriptor distance > 0.6) |
| TAB_SWITCH | HIGH | Switched to another tab |
| WINDOW_BLUR | MEDIUM | Lost window focus |
| CAMERA_BLOCKED | HIGH | Camera disabled/covered |

#### Face Detection Algorithm:
```typescript
// Looking Away Detection:
1. Get facial landmarks (68 points)
2. Calculate eye center: (leftEye[0] + rightEye[3]) / 2
3. Get nose tip position: nose[3]
4. Calculate horizontal offset: |noseTip.x - eyeCenter.x|
5. Get eye distance: |rightEye[3].x - leftEye[0].x|
6. If offset > 30% of eye distance → LOOKING_AWAY

// Identity Verification:
1. Extract current face descriptor (128 floats)
2. Load stored descriptor from User collection
3. Calculate Euclidean distance:
   distance = sqrt(Σ(stored[i] - current[i])²)
4. Threshold: distance > 0.6 → different person
```

#### API Endpoints You Own:
- `POST /api/proctoring/sessions` - Create/update session
- `POST /api/proctoring/violations` - Log violation
- `POST /api/proctoring/events` - Log general events
- `GET /api/proctoring/violations` - Fetch all violations (admin)
- `GET /api/users/[id]/face-descriptor` - Get stored face
- `POST /api/users/[id]/face-descriptor` - Save face

#### Database Schema:
```typescript
ProctoringSession {
  userId: ObjectId
  sessionId: String (UUID)
  startTime: Date
  endTime: Date
  examType: "MCQ" | "CODING"
  status: "ACTIVE" | "COMPLETED" | "TERMINATED"
  totalViolations: Number
  suspicionScore: Number
  deviceInfo: String
  ipAddress: String
}

ProctoringViolation {
  userId: ObjectId
  sessionId: String
  violationType: String
  severity: "LOW" | "MEDIUM" | "HIGH"
  details: String
  timestamp: Date
  metadata: Object
}
```

#### Key Files:
- `/components/proctoring.tsx` - Main proctoring component
- `/app/api/proctoring/violations/route.ts` - Violation API
- `/app/admin/proctoring/page.tsx` - Admin dashboard
- `/models/ProctoringSession.ts` - Session schema
- `/models/ProctoringViolation.ts` - Violation schema
- `/public/models/*` - TensorFlow model weights

#### Demo Points:
- Start exam → camera activates
- Show face detected (green badge)
- Bring another person → MULTIPLE_FACES violation
- Look left/right → LOOKING_AWAY violation
- Switch tab → TAB_SWITCH violation
- Show violations in admin panel
- Show suspicion score calculation

---

### 👤 **Person 5: Dashboard, Leaderboard & Statistics**

**Your Responsibility**: User dashboard, real-time rankings, admin analytics

#### What You Built:
- **User Dashboard** (`/app/dashboard/page.tsx`)
  - Round status cards
  - User profile with team info
  - Score overview
  - Recent submissions
  - Navigation to active rounds

- **Leaderboard** (`/app/leaderboard/page.tsx`)
  - Real-time rankings
  - Score aggregation
  - Pagination (20 per page)
  - User highlighting
  - Team-based filtering

- **Admin Dashboard** (`/app/admin/page.tsx`)
  - Total users count
  - Submission statistics
  - Violation counts
  - Problem breakdown
  - Recent activity

#### Technologies You Used:
1. **Next.js Server Components**
   - Server-side data fetching
   - Automatic caching
   - Streaming with Suspense

2. **MongoDB Aggregation Pipeline**
   - Score calculations
   - Ranking generation
   - Group by user/team
   - Sorting and pagination

3. **React Client Components**
   - Real-time updates
   - Interactive tables
   - Loading states

4. **shadcn/ui Components**
   - Card, Badge, Table
   - Tabs for navigation
   - Skeleton loaders

#### How It Works:
```typescript
// Leaderboard Calculation:
1. Aggregate submissions by userId:
   db.submissions.aggregate([
     { $group: {
       _id: "$userId",
       totalScore: { $sum: "$score" },
       submissionCount: { $sum: 1 },
       lastSubmission: { $max: "$submittedAt" }
     }},
     { $sort: { totalScore: -1, lastSubmission: 1 }},
     { $skip: (page - 1) * 20 },
     { $limit: 20 }
   ])

2. Populate user details (name, team)
3. Assign ranks (1, 2, 3...)
4. Return paginated results

// Dashboard Stats Query:
const stats = {
  totalUsers: await User.countDocuments(),
  totalSubmissions: await Submission.countDocuments(),
  totalViolations: await ProctoringViolation.countDocuments(),
  avgScore: await Submission.aggregate([
    { $group: { _id: null, avg: { $avg: "$score" }}}
  ]),
  problemStats: await Problem.aggregate([
    { $group: {
      _id: "$difficulty",
      count: { $sum: 1 }
    }}
  ])
}

// Round Status Logic:
function getRoundStatus(roundName) {
  const now = new Date()
  const schedule = {
    MCQ: { start: "2026-01-15T10:00", end: "2026-01-15T11:00" },
    CODING: { start: "2026-01-15T14:00", end: "2026-01-15T17:00" },
    ROUND3: { start: "2026-01-16T10:00", end: "2026-01-16T15:00" }
  }
  
  if (now < schedule[roundName].start) return "UPCOMING"
  if (now > schedule[roundName].end) return "COMPLETED"
  return "ACTIVE"
}
```

#### API Endpoints You Own:
- `GET /api/leaderboard` - Fetch rankings
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/submissions` - User's submission history
- `GET /api/rounds/status` - Round scheduling info

#### Leaderboard Algorithm:
```typescript
// Ranking with tie-breaking:
1. Primary sort: totalScore (descending)
2. Secondary sort: lastSubmission (ascending - earlier wins)
3. Tertiary sort: submissionCount (fewer attempts better)

Example:
User A: 450 points at 14:30, 15 submissions
User B: 450 points at 14:25, 12 submissions
Rank: B (1st), A (2nd) - submitted earlier with fewer attempts
```

#### Database Indexes:
```typescript
// For performance
Submission.index({ userId: 1, score: -1 })
Submission.index({ submittedAt: -1 })
User.index({ email: 1 }, { unique: true })
ProctoringViolation.index({ sessionId: 1, timestamp: -1 })
```

#### Key Files:
- `/app/dashboard/dashboard-client.tsx` - Dashboard UI
- `/app/leaderboard/page.tsx` - Leaderboard
- `/app/admin/page.tsx` - Admin stats
- `/app/api/leaderboard/route.ts` - Ranking API
- `/app/api/admin/stats/route.ts` - Stats API
- `/lib/schedule.ts` - Round scheduling logic

#### Demo Points:
- Login → show personalized dashboard
- Display user's current rank
- Show round cards (upcoming/active/completed)
- Navigate to leaderboard
- Show top 20 users
- Highlight current user
- Switch to admin dashboard
- Show statistics cards
- Display violation counts

---

### 👤 **Person 6: Database Design & API Architecture**

**Your Responsibility**: MongoDB schema design, API routes, data models

#### What You Built:
- **Database Schema** (11 collections)
  - User & Team management
  - Problem & TestCase storage
  - Submission tracking
  - Proctoring data
  - Session management

- **API Route Structure** (20+ endpoints)
  - RESTful design
  - Error handling
  - Request validation
  - Response formatting

- **Database Connection Management**
  - Connection pooling
  - Error recovery
  - Atlas integration

#### Technologies You Used:
1. **MongoDB Atlas**
   - Cloud-hosted database
   - Cluster: cluster0.ivipvxa.mongodb.net
   - Automatic backups
   - Scalable infrastructure

2. **Mongoose ODM** (7.9.4)
   - Schema validation
   - Type safety with TypeScript
   - Middleware hooks
   - Query builders
   - Virtual fields
   - Indexes

3. **Next.js API Routes**
   - Serverless functions
   - Edge runtime compatible
   - Automatic API routing

#### Database Schema Design:

**1. User Collection**
```typescript
User {
  email: String (unique, indexed)
  name: String
  password: String (bcrypt hashed)
  role: "PARTICIPANT" | "ADMIN" | "JUDGE"
  emailVerified: Date
  image: String
  teamId: ObjectId → Team
  faceDescriptor: [Number] (128-dim array)
  createdAt: Date
  updatedAt: Date
}

Indexes:
- { email: 1 } (unique)
- { teamId: 1 }
```

**2. Team Collection**
```typescript
Team {
  name: String
  leaderId: ObjectId → User (indexed)
  members: [
    { name, email, role, college, year }
  ]
  maxMembers: Number (default: 4)
  createdAt: Date
}

Indexes:
- { leaderId: 1 }
```

**3. Problem Collection**
```typescript
Problem {
  title: String
  description: String (Markdown supported)
  type: "MCQ" | "CODING"
  difficulty: "EASY" | "MEDIUM" | "HARD"
  points: Number
  round: "MCQ" | "CODING" | "ROUND3"
  
  // For MCQ:
  options: [ObjectId] → MCQOption
  correctAnswer: String
  
  // For Coding:
  inputFormat: String
  outputFormat: String
  constraints: String
  sampleInput: String
  sampleOutput: String
  testCases: [ObjectId] → TestCase
  
  tags: [String]
  createdBy: ObjectId → User
  isActive: Boolean
  createdAt: Date
}

Indexes:
- { round: 1, type: 1, isActive: 1 }
- { difficulty: 1 }
```

**4. Submission Collection**
```typescript
Submission {
  userId: ObjectId → User (indexed)
  problemId: ObjectId → Problem (indexed)
  
  // For MCQ:
  answer: String
  isCorrect: Boolean
  
  // For Coding:
  code: String
  language: String
  results: [{
    testCaseId: ObjectId
    passed: Boolean
    actualOutput: String
    expectedOutput: String
    executionTime: Number (ms)
    memoryUsed: Number (KB)
    error: String
  }]
  
  score: Number (indexed for leaderboard)
  submittedAt: Date (indexed)
  ipAddress: String
  userAgent: String
}

Indexes:
- { userId: 1, score: -1 }
- { problemId: 1 }
- { submittedAt: -1 }
- Compound: { userId: 1, problemId: 1 }
```

**5. ProctoringSession Collection**
```typescript
ProctoringSession {
  sessionId: String (UUID, unique)
  userId: ObjectId → User (indexed)
  examType: "MCQ" | "CODING"
  startTime: Date
  endTime: Date
  status: "ACTIVE" | "COMPLETED" | "TERMINATED"
  totalViolations: Number
  suspicionScore: Number (0-100)
  deviceInfo: {
    browser: String
    os: String
    screen: String
  }
  ipAddress: String
}

Indexes:
- { sessionId: 1 } (unique)
- { userId: 1, startTime: -1 }
```

**6. ProctoringViolation Collection**
```typescript
ProctoringViolation {
  sessionId: String → ProctoringSession (indexed)
  userId: ObjectId → User (indexed)
  violationType: "NO_FACE" | "MULTIPLE_FACES" | ...
  severity: "LOW" | "MEDIUM" | "HIGH"
  details: String
  timestamp: Date (indexed)
  metadata: {
    faceCount: Number
    confidence: Number
    ...
  }
}

Indexes:
- { sessionId: 1, timestamp: -1 }
- { userId: 1 }
- { severity: 1 }
```

#### API Architecture:

**REST Principles:**
- GET: Retrieve data (idempotent)
- POST: Create new resource
- PUT/PATCH: Update existing
- DELETE: Remove resource

**Error Handling Pattern:**
```typescript
try {
  await dbConnect() // Connection pooling
  
  // Validate request
  if (!body.email) {
    return NextResponse.json(
      { error: 'Email required' },
      { status: 400 }
    )
  }
  
  // Process request
  const result = await Model.create(data)
  
  return NextResponse.json({ success: true, data: result })
  
} catch (error) {
  console.error('API Error:', error)
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
```

**Database Connection** (`/lib/mongodb.ts`):
```typescript
// Singleton pattern with connection pooling
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function dbConnect() {
  if (cached.conn) return cached.conn
  
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.DATABASE_URL, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
  }
  
  cached.conn = await cached.promise
  return cached.conn
}
```

#### Key Files:
- `/lib/mongodb.ts` - Connection manager
- `/models/*.ts` - All 11 Mongoose schemas
- `/app/api/**/route.ts` - 20+ API endpoints
- `/.env` - Database credentials

#### Environment Variables:
```env
DATABASE_URL=mongodb+srv://Binit:Rainbow%40123@cluster0.ivipvxa.mongodb.net/hackathon2026?retryWrites=true&w=majority&appName=Cluster0
```

#### Demo Points:
- Show MongoDB Atlas dashboard
- Explain connection string format
- Show User collection structure
- Demonstrate Mongoose schema validation
- Show API error handling
- Explain indexing strategy
- Show aggregation pipeline for leaderboard

---

### 👤 **Person 7: Deployment, Email & Additional Features**

**Your Responsibility**: Vercel deployment, email notifications, UI/UX, extra features

#### What You Built:
- **Vercel Deployment Configuration**
  - Next.js standalone output
  - Environment variable management
  - Serverless function optimization
  - Build caching

- **Email System** (`/lib/email.ts`)
  - Registration confirmations
  - Password reset
  - Exam notifications
  - Results announcement

- **UI Components Library**
  - 12+ shadcn/ui components
  - Dark theme customization
  - Responsive design
  - Accessibility features

- **Additional Features**
  - Certificate generation (PDF)
  - FAQ page
  - Contact form
  - Auto-submission system

#### Technologies You Used:
1. **Vercel Platform**
   - Edge network CDN
   - Serverless functions
   - Automatic HTTPS
   - Preview deployments
   - Analytics

2. **Nodemailer** (7.0.10)
   - SMTP integration
   - HTML email templates
   - Attachment support

3. **shadcn/ui + Tailwind CSS**
   - Pre-built accessible components
   - Customizable themes
   - Responsive utilities

4. **jsPDF** (Certificate generation)
   - PDF creation in browser
   - Custom fonts and styling

#### How It Works:

**Deployment Process:**
```bash
# 1. Build optimization
next build
→ Output: .next/ folder (standalone mode)
→ Size: ~15 MB (optimized)

# 2. Vercel deployment
git push origin main
→ Triggers automatic build
→ Runs: pnpm install + pnpm build
→ Deploys to: https://your-app.vercel.app

# 3. Environment variables (set in Vercel dashboard):
DATABASE_URL
NEXTAUTH_URL
NEXTAUTH_SECRET
JUDGE0_API_KEY
EMAIL_SERVER_*
```

**Email System:**
```typescript
// Send email via Nodemailer
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD // App password
  }
})

async function sendRegistrationEmail(user) {
  await transporter.sendMail({
    from: '"Hackathon 2026" <noreply@hackathon.nits.ac.in>',
    to: user.email,
    subject: "Registration Successful",
    html: `
      <h1>Welcome ${user.name}!</h1>
      <p>Your registration is confirmed.</p>
      <p>Team Code: ${user.team.code}</p>
      <a href="${process.env.NEXTAUTH_URL}/dashboard">
        Go to Dashboard
      </a>
    `
  })
}
```

**Certificate Generation:**
```typescript
import jsPDF from 'jspdf'

function generateCertificate(user, rank, score) {
  const pdf = new jsPDF('landscape')
  
  // Add border
  pdf.setLineWidth(2)
  pdf.rect(10, 10, 277, 190)
  
  // Title
  pdf.setFontSize(40)
  pdf.text('Certificate of Achievement', 148, 50, { align: 'center' })
  
  // User details
  pdf.setFontSize(20)
  pdf.text(`This is awarded to`, 148, 80, { align: 'center' })
  pdf.setFontSize(30)
  pdf.text(user.name, 148, 100, { align: 'center' })
  
  // Rank and score
  pdf.setFontSize(16)
  pdf.text(`Rank: ${rank} | Score: ${score}`, 148, 130, { align: 'center' })
  
  // Download
  pdf.save(`certificate_${user.name}.pdf`)
}
```

**Auto-submission System:**
```typescript
// Triggered on page unload
window.addEventListener('beforeunload', (e) => {
  if (hasUnsavedAnswers) {
    // Reliable submission even during page close
    navigator.sendBeacon(
      '/api/submissions/auto',
      JSON.stringify({ answers, timestamp })
    )
    
    // Stop proctoring
    window.__stopProctoring?.()
  }
})

// Also on back button
window.addEventListener('popstate', () => {
  autoSubmit()
})

// Also on tab hide
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    autoSubmit()
  }
})
```

#### Vercel Configuration (`vercel.json`):
```json
{
  "buildCommand": "pnpm run build",
  "devCommand": "pnpm run dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "DATABASE_URL": "@database_url",
    "NEXTAUTH_SECRET": "@nextauth_secret"
  }
}
```

#### UI Component Library:
- Button, Card, Input, Label
- Dialog, Tabs, Badge
- Select, Radio Group
- Accordion, Toast
- Table, Skeleton loaders

#### Responsive Breakpoints:
```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

#### Key Files:
- `/lib/email.ts` - Email service
- `/lib/certificate.ts` - PDF generation
- `/components/ui/*` - UI components
- `/app/contact/page.tsx` - Contact form
- `/app/faq/page.tsx` - FAQ page
- `/vercel.json` - Deployment config
- `/middleware.ts` - Route protection
- `/tailwind.config.ts` - Theme config

#### Environment Variables (Production):
```env
# Database
DATABASE_URL=mongodb+srv://...

# NextAuth
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=random-64-char-string

# Judge0
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your-rapidapi-key

# Email
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=app-specific-password
EMAIL_FROM=noreply@hackathon.nits.ac.in
```

#### Demo Points:
- Show Vercel dashboard
- Explain deployment process
- Show environment variables setup
- Send test email (registration confirmation)
- Generate certificate PDF
- Show responsive design (resize browser)
- Demonstrate auto-submission
- Show contact form submission
- Navigate FAQ page

---

## Presentation Flow Suggestion

### Introduction (2 minutes)
**All Team Members**: Brief project overview

### Individual Demonstrations (5 minutes each × 7 = 35 minutes)
Each person demonstrates their section with:
1. Quick code walkthrough
2. Live demo of feature
3. Explain technologies used
4. Show database/API interaction

### Q&A Preparation

**Common Questions:**
1. **Security**: "How do you prevent cheating?"
   - Answer: Proctoring with face detection, tab monitoring, auto-submission

2. **Scalability**: "Can it handle 1000+ users?"
   - Answer: MongoDB Atlas auto-scaling, Vercel serverless functions, connection pooling

3. **Face Detection**: "What if someone doesn't have a camera?"
   - Answer: Camera is mandatory - exam cannot proceed without it

4. **Code Execution**: "Is it safe to run user code?"
   - Answer: Judge0 sandboxed environment with CPU/memory limits

5. **Database**: "Why MongoDB over SQL?"
   - Answer: Flexible schema for diverse data types, easy horizontal scaling, JSON-like documents match JavaScript objects

---

## Quick Tech Summary

| Component | Technology | Why? |
|-----------|-----------|------|
| Frontend | Next.js 14 + React | Server-side rendering, SEO, fast performance |
| Language | TypeScript | Type safety, better IDE support |
| Database | MongoDB Atlas | Scalable, cloud-hosted, flexible schema |
| Auth | NextAuth.js | Industry standard, secure JWT |
| Styling | Tailwind CSS | Utility-first, fast development |
| UI Library | shadcn/ui | Accessible, customizable components |
| Code Execution | Judge0 API | Secure sandboxing, 40+ languages |
| Face Detection | face-api.js | Browser-based ML, no backend needed |
| Deployment | Vercel | Automatic deployments, edge network |
| Email | Nodemailer | Simple SMTP integration |

---

**Total Lines of Code**: ~15,000+
**Development Time**: 4-6 weeks
**Team Size**: 7 developers
**Database Collections**: 11
**API Endpoints**: 20+
**Supported Languages**: 5 (C, C++, Java, Python, JavaScript)

Good luck with your presentation! 🚀
