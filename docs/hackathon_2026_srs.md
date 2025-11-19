# Software Requirements Specification  
for  
**Hackathon 2026 Portal – NIT Silchar**

Version 1.0 – Approved  

Prepared by: `<Author Name>`  
Organization: National Institute of Technology Silchar  
Date: `<Date Created>`  

Copyright © 1999 by Karl E. Wiegers.  
Permission is granted to use, modify, and distribute this document.

---

## Revision History

| Name        | Date       | Reason for Changes                   | Version |
|-------------|------------|--------------------------------------|---------|
| `<Author>`  | `<Date>`   | Initial SRS for Hackathon Portal     | 1.0     |

---

# 1. Introduction

## 1.1 Purpose

This Software Requirements Specification (SRS) describes the functional and nonfunctional requirements for the **Hackathon 2026 Portal – NIT Silchar** (version 1.0).  

The portal is a web-based system that manages an online/offline national-level coding and AI/ML hackathon, including registration, authentication, team management, MCQ and coding rounds, automated/scored submissions, proctoring, leaderboards, and certificate generation.

This SRS covers the full web application, including:

- Public marketing site and information pages  
- Participant-facing portal (registration, dashboard, rounds, submissions, leaderboard, certificates)  
- Admin panel (problem management, submissions, proctoring overview, statistics)  
- Backend APIs and database layer (MongoDB + Mongoose)  

Any out-of-scope components (e.g., external payment infrastructure beyond what is configured, external event websites) are not covered here.

## 1.2 Document Conventions

- The words **“shall”** and **“must”** indicate mandatory requirements.  
- The word **“should”** indicates desirable, but not strictly mandatory, requirements.  
- Functional requirements are labeled `REQ-F-<number>`.  
- Nonfunctional requirements are labeled `REQ-NF-<number>`.  
- Business rules are labeled `BR-<number>`.  
- Priorities: **H** (High), **M** (Medium), **L** (Low). Priority is indicated in parentheses at the end of each requirement, e.g., `(H)`.

## 1.3 Intended Audience and Reading Suggestions

- **Developers**: Focus on Sections 2, 3, 4, and 5.  
- **Testers/QA**: Focus on Sections 3, 4, and 5 to derive test cases.  
- **Project Managers / Coordinators**: Focus on Sections 1, 2, and 5 for scope and constraints.  
- **Stakeholders (Faculty, Event Organizers)**: Focus on Sections 1, 2, and 4.  
- **Operations / DevOps**: Focus on Sections 2.4, 2.5, 3, and 5.

Recommended reading sequence:

1. Overview: Sections 1 and 2  
2. Interfaces and features: Sections 3 and 4  
3. Nonfunctional requirements and business rules: Section 5  
4. Additional details / open items: Section 6 and Appendices

## 1.4 Product Scope

The **Hackathon 2026 Portal** is intended to:

- Serve as the central platform for **promotion, registration, and management** of a national-level coding competition hosted by NIT Silchar.  
- Support **multi-round** competitions: MCQ-based screening rounds and coding rounds, with possible offline finale.  
- Provide **secure authentication**, **team management**, **online submissions**, **automated evaluation** (via code runner API), and **leaderboards**.  
- Provide **admin tools** to manage problems, review submissions, oversee proctoring, and export results.  
- Provide **certificate generation** for participants and winners.

Key business objectives:

- Reduce manual effort in managing large-scale hackathon logistics.  
- Ensure fair and secure online evaluation using proctoring mechanisms.  
- Provide a polished participant experience (registration, exams, and results) and a clear view of rankings.  
- Enable reusability of the platform for future editions of the event.

## 1.5 References

1. `README.md` – Hackathon 2026 Portal – NIT Silchar (project root).  
2. `SETUP.md` – Local development setup and environment configuration.  
3. `PROCTORING_GUIDE.md` – Proctoring features and operational guidelines.  
4. `PROCTORING_INTEGRATED.md` – Details and integration points for proctoring in the portal.  
5. Next.js 14 Documentation – https://nextjs.org/docs  
6. MongoDB Documentation – https://www.mongodb.com/docs/  
7. NextAuth.js Documentation – https://next-auth.js.org/  

---

# 2. Overall Description

## 2.1 Product Perspective

The Hackathon 2026 Portal is a **standalone web application** that can be deployed independently (e.g., on Vercel) and backed by a MongoDB database (local or cloud/Atlas).

- The product is a **new system** intended for the 2026 edition and future hackathons.  
- It uses:
  - Next.js App Router (`app/` directory) for frontend and API routes  
  - NextAuth.js for authentication  
  - MongoDB + Mongoose for persistence  
  - Third-party email (SMTP) and code execution service (`lib/judge0.ts`, `/api/run`) for code evaluation  
  - Integrated proctoring (`components/proctoring.tsx`) that uses browser APIs (camera, visibility) and server models (`ProctoringSession`, `ProctoringViolation`).

The system interacts with:

- **Participants’ browsers** (UI, Web APIs, camera/microphone for proctoring).  
- **Email servers** (Nodemailer SMTP).  
- **Code execution service** (Judge0 or similar, via HTTP).  
- **Vercel** (or equivalent) for deployment and hosting.

## 2.2 Product Functions

High-level functions include:

- **Public site**:
  - Present event details, timeline, prizes, registration and payment info, FAQ, and contact page.
- **Authentication & user management**:
  - Participant registration and sign-in (NextAuth, password-based or provider-based).  
  - Session management and role-based access (`USER`, `ADMIN`).
- **Team management**:
  - Create/join teams (1–3 members) and manage team details.
- **Rounds management**:
  - MCQ round (text-based answers or options).  
  - Coding round with Monaco editor and language selection.  
  - Round access gating based on status and qualifications.
- **Submissions and evaluation**:
  - Submit MCQ and coding answers via `/api/submissions`.  
  - Run code with `/api/run` and store results.  
  - Automatic or semi-automatic scoring based on problem configuration.
- **Leaderboard & dashboard**:
  - Compute user/team scores and ranks (`/api/leaderboard`).  
  - Participant dashboard showing status, submissions, and results.
- **Admin panel**:
  - Create and edit problems (`/api/problems`), including MCQ and coding.  
  - View and manage submissions.  
  - View statistics (users, teams, submissions, invalid team names, etc.).  
  - Access proctoring dashboard.
- **Proctoring**:
  - Monitor participants with camera-based and browser activity checks.  
  - Log violations for further review.
- **Certificates & email**:
  - Generate participation and achievement certificates.  
  - Send notification emails (registration confirmation, etc.).

## 2.3 User Classes and Characteristics

1. **Participant (User)**  
   - Typically a student or professional developer.  
   - Uses the system primarily during registration and competition rounds.  
   - Requires a responsive, intuitive UI and clear instructions.  
   - Moderate technical literacy; familiar with coding environments.

2. **Team Leader**  
   - A participant who creates a team and manages members.  
   - May perform administrative actions limited to their team (inviting members, confirming team details).

3. **Administrator (Admin)**  
   - Hackathon organizers and technical staff.  
   - High technical literacy; frequent use of admin dashboard.  
   - Responsible for managing problems, reviewing submissions, handling proctoring data, and finalizing results.

4. **Proctor / Invigilator (could be a subset of Admin)**  
   - Monitors participants during online rounds using proctoring data.  
   - Needs access to proctoring dashboards and violation logs.

## 2.4 Operating Environment

- **Frontend**:
  - Modern desktop and mobile browsers (latest two versions of Chrome, Firefox, Edge, Safari).  
  - Responsive design via Tailwind CSS.

- **Backend**:
  - Next.js 14+ running on Node.js 18+ (e.g., Vercel, Node server).  
  - MongoDB (local or MongoDB Atlas) as configured in `.env`.

- **Other**:
  - SMTP email server (e.g., Gmail SMTP) configured with environment variables.  
  - External code execution service (judge0-compatible API).

## 2.5 Design and Implementation Constraints

- Shall use **Next.js 14**, **React 18**, **TypeScript**, **Tailwind CSS**, and **shadcn/ui** as per existing codebase.  
- Shall use **MongoDB + Mongoose** (see `models/*.ts`) as the data layer.  
- Authentication shall use **NextAuth.js** (see `lib/auth.ts`, `types/next-auth.d.ts`).  
- Deployment environment must support **Node.js 18+** and **Edge/serverless functions** where applicable.  
- Must adhere to institutional security policies and relevant data protection rules (e.g., not storing plain-text passwords).  
- Proctoring must rely on browser APIs only and cannot install native agents.  
- Must be compatible with Vercel’s deployment model/secrets handling.

## 2.6 User Documentation

The following documentation will be provided:

- Participant/Setup documentation:
  - Public landing page sections (“About”, “Timeline”, “Prizes”, “FAQ”, “Contact”).  
  - FAQs in the portal.  

- Internal documentation:
  - `README.md` – at project root (setup, tech stack, basic usage).  
  - `SETUP.md` – detailed local setup, seeding, troubleshooting.  
  - `PROCTORING_GUIDE.md` – how proctoring works and usage notes and limitations.  
  - Admin/docs pages (if implemented) for problem creation and dashboard usage.

## 2.7 Assumptions and Dependencies

Assumptions:

- Participants have stable internet connectivity and a compatible browser.  
- Participants have a working webcam and allow camera access for proctoring rounds.  
- External services (SMTP email, code execution API) are available and correctly configured.

Dependencies:

- MongoDB availability (local or Atlas).  
- SMTP server credentials (environment variables).  
- Judge0 (or equivalent) code runner service.  
- Vercel or other hosting provider for deployment.  
- NextAuth configuration (e.g., `NEXTAUTH_URL`, `NEXTAUTH_SECRET`).

---

# 3. External Interface Requirements

## 3.1 User Interfaces

Key UIs include:

- **Home Page (`/`)**  
  - Hero section describing the hackathon (timeline, prizes, registration).  
  - Sections: About Hackathon, Timeline, Prizes & Recognition, Registration & Payment.  
  - Links to registration (`/auth/register`), FAQ, contact, and other pages.

- **Authentication**  
  - Sign-in page (`/auth/signin`).  
  - Registration page (`/auth/register`) with multi-step registration and validation.

- **Participant Dashboard (`/dashboard`)**  
  - Displays user/team info, access to rounds, and quick actions.  
  - Only accessible to authenticated users.

- **Rounds**  
  - MCQ Round (`/rounds/mcq`):
    - Presents question cards with description and answer textarea (text-based MCQ demo).  
    - Integrated proctoring widget (floating on large screens).  
    - Submit button enabled only when all required answers are filled.
  - Coding Round (`/rounds/coding`):
    - Problem selector (drop-down) with title, points, time/memory limits.  
    - Problem description, constraints, samples (tabs).  
    - Monaco code editor with language selector (JS, Python, Java, C++).  
    - Run button (uses `/api/run`) and console output panel.  
    - Submit button integrated with `/api/submissions`.  
    - Proctoring sidebar.

- **Leaderboard (`/leaderboard`)**  
  - Displays user/team rankings and scores (data from `/api/leaderboard`).

- **Admin Panel (`/admin`)**  
  - Overview dashboard with stats (users, teams, problems, submissions).  
  - Problem management tab: list, create, edit, delete problems (MCQ/Coding).  
  - Links to proctoring panel (`/admin/proctoring`) and other admin tools.

- **Proctoring UI (`/admin/proctoring`, proctoring widget)**  
  - For participants: small UI showing camera status and proctoring info.  
  - For admins: dashboards listing sessions and violations (as described in proctoring guides).

UI design follows Tailwind-based styling and shadcn/ui components with a dark theme.

## 3.2 Hardware Interfaces

- Participant devices:
  - Desktop or laptop with camera (for proctoring).  
  - Mobile devices may be supported for reading information but coding rounds are primarily desktop-oriented.

- No direct hardware integration beyond using **webcam** and **microphone** via browser APIs for proctoring.

## 3.3 Software Interfaces

- **Database** (MongoDB + Mongoose):  
  - Models: `User`, `Team`, `Problem`, `Submission`, `TestCase`, `MCQOption`, `MCQAnswer`, `ProctoringSession`, `ProctoringViolation`, etc.  
  - Connection utility: `lib/mongodb.ts` with `connectDB()`.

- **Authentication** (NextAuth):  
  - Configuration: `lib/auth.ts`, `middleware.ts`.  
  - `getServerSession(authOptions)` used on server/API routes to check and enforce access.

- **Code Execution Service** (Judge0 or similar):  
  - Wrapper: `lib/judge0.ts`.  
  - API route `/api/run` for running user code against input/test cases.

- **Email Service** (Nodemailer):  
  - Wrapper: `lib/email.ts`.  
  - Sends registration/notification emails from configured SMTP server.

- **Certificates**:  
  - `lib/certificate.ts` + `jsPDF` to generate PDF certificates.

- **External APIs/Configs**:  
  - `lib/api.ts`, `lib/utils.ts`, `lib/schedule.ts` for internal utilities and scheduling.

## 3.4 Communications Interfaces

- **HTTP/HTTPS**:  
  - All frontend-backend communication via HTTP(S).  
  - REST-style API routes in `/app/api/*` (Next.js route handlers).

- **Protocols**:
  - HTTPS with TLS (in production).  
  - JSON request/response for APIs (e.g., `/api/problems`, `/api/submissions`, `/api/leaderboard`, `/api/run`).

- **Email (SMTP)**:
  - As configured via environment variables (`EMAIL_SERVER_HOST`, `EMAIL_SERVER_PORT`, etc.).

- **Security**:
  - NextAuth session tokens and JWTs over HTTPS.  
  - No communication via FTP or other legacy protocols.

---

# 4. System Features

Below are the major system features with requirements.

## 4.1 User Registration and Authentication

### 4.1.1 Description and Priority

Provides secure user registration and sign-in for participants and admins, using NextAuth.js.  
Priority: **High**.

### 4.1.2 Stimulus/Response Sequences

1. User visits `/auth/register`, fills in registration form, and submits.  
2. System validates data and creates a `User` entry; sends confirmation email.  
3. User signs in via `/auth/signin` providing credentials.  
4. System authenticates user, creates a session, and redirects to `/dashboard`.

### 4.1.3 Functional Requirements

- `REQ-F-1 (H)`: The system shall allow new users to register with email, password, and required personal details.  
- `REQ-F-2 (H)`: The system shall validate uniqueness of email addresses.  
- `REQ-F-3 (H)`: The system shall hash and securely store passwords (e.g., bcrypt).  
- `REQ-F-4 (H)`: The system shall allow users to sign in with registered credentials via `/auth/signin`.  
- `REQ-F-5 (H)`: The system shall maintain authenticated sessions and restrict access to protected routes (`/dashboard`, `/rounds`, `/admin`, etc.) to authenticated users only.  
- `REQ-F-6 (H)`: The system shall support role-based access control, at minimum distinguishing between `USER` and `ADMIN`.  
- `REQ-F-7 (M)`: The system should send a confirmation or welcome email upon successful registration.

---

## 4.2 Team Management

### 4.2.1 Description and Priority

Allows participants to create teams (1–3 members), join existing teams, and manage team composition.  
Priority: **High**.

### 4.2.2 Stimulus/Response Sequences

1. Authenticated user navigates to team management section in dashboard.  
2. User creates a new team (team leader) or enters an invite code to join a team.  
3. System updates `Team` and `User.teamId` relationships accordingly.

### 4.2.3 Functional Requirements

- `REQ-F-8 (H)`: The system shall allow a user to create a team with a unique team name.  
- `REQ-F-9 (H)`: The system shall restrict team size to between 1 and 3 members.  
- `REQ-F-10 (M)`: The system shall prevent invalid or reserved team names (e.g., via validation rules).  
- `REQ-F-11 (M)`: The system should allow team members to view team information on the dashboard.  

---

## 4.3 MCQ Round

### 4.3.1 Description and Priority

Provides multiple-choice or text-answer questions for a screening round, with proctoring and automatic submission on navigation/visibility changes.  
Priority: **High** for online rounds.

### 4.3.2 Stimulus/Response Sequences

1. Authenticated user enters `/rounds/mcq`.  
2. System fetches all active MCQ problems via `/api/problems?type=MCQ&isActive=true`.  
3. User reads questions and enters answers into text areas.  
4. User clicks **Submit Answers**, system sends submissions via `/api/submissions`.  
5. System stores submissions in `Submission` collection and optionally evaluates answers.

### 4.3.3 Functional Requirements

- `REQ-F-12 (H)`: The system shall retrieve active MCQ problems from the database and present them to the user.  
- `REQ-F-13 (H)`: The system shall allow the user to provide an answer for each MCQ problem.  
- `REQ-F-14 (M)`: The system should prevent submission until all required questions are answered.  
- `REQ-F-15 (H)`: The system shall create a submission record per MCQ answer in the `Submissions` API handler.  
- `REQ-F-16 (H)`: The system shall auto-submit answers when the user closes the tab, navigates away, or hides the tab (via `/api/submissions/auto`) where implemented.  
- `REQ-F-17 (M)`: The system may auto-evaluate answers by comparing to stored `Problem.correctAnswer` where applicable.

---

## 4.4 Coding Round

### 4.4.1 Description and Priority

Provides coding challenges with a Monaco editor, language selection, run capability, and submissions with evaluation via an external code execution API and test cases.  
Priority: **High**.

### 4.4.2 Stimulus/Response Sequences

1. Authenticated user accesses `/rounds/coding`.  
2. System fetches active coding problems via `/api/problems?type=CODING&isActive=true`.  
3. User selects a problem and a language, writes code in Monaco editor.  
4. User clicks **Run**, system sends code and input to `/api/run`, displays console output.  
5. User clicks **Submit**, system sends code to `/api/submissions`, which stores the submission and sets initial status (`PENDING`, `ACCEPTED`, etc.).  
6. Auto-submit behavior may trigger on navigation or visibility changes.

### 4.4.3 Functional Requirements

- `REQ-F-18 (H)`: The system shall provide a list of active coding problems to the user.  
- `REQ-F-19 (H)`: The system shall provide a code editor with language options (JavaScript, Python, Java, C++).  
- `REQ-F-20 (H)`: The system shall allow users to run their code against sample input via `/api/run` and display output, errors, and metrics.  
- `REQ-F-21 (H)`: The system shall allow submission of solutions via `/api/submissions`, storing code, language, problemId, and userId.  
- `REQ-F-22 (M)`: The system should auto-submit the latest code on tab close/navigation when unsaved work exists, using `/api/submissions/auto`.  
- `REQ-F-23 (M)`: The system should prevent users who are not qualified for Round 2 from submitting coding solutions unless `NEXT_PUBLIC_ALLOW_OFFSCHEDULE_SUBMISSIONS` is enabled or user is `ADMIN`.

---

## 4.5 Leaderboard

### 4.5.1 Description and Priority

Shows ranked participants/teams based on scores and accepted submissions.  
Priority: **Medium** (critical for visibility but not for bare functionality).

### 4.5.2 Stimulus/Response Sequences

1. User (participant or admin) accesses `/leaderboard`.  
2. Frontend calls `/api/leaderboard`.  
3. API aggregates scores from `Submission` entries per user/team and returns sorted list.  
4. UI displays the ranking table.

### 4.5.3 Functional Requirements

- `REQ-F-24 (H)`: The system shall compute total scores per user based on their submissions.  
- `REQ-F-25 (M)`: The system shall count accepted and total submissions per user.  
- `REQ-F-26 (H)`: The system shall sort leaderboard entries by total score and accepted submissions.  
- `REQ-F-27 (M)`: The system shall limit leaderboard results to a maximum of 100 entries for performance.  

---

## 4.6 Admin Problem & Submission Management

### 4.6.1 Description and Priority

Provides admin interface to manage problems and view submissions and statistics.  
Priority: **High**.

### 4.6.2 Stimulus/Response Sequences

1. Admin visits `/admin`.  
2. System checks session role; only allows `ADMIN`.  
3. Admin views dashboard stats (users, teams, problems, submissions).  
4. Admin opens “Problems” tab, creates or edits a problem, and saves.  
5. Admin views recent submissions, filters or reviews them as needed.

### 4.6.3 Functional Requirements

- `REQ-F-28 (H)`: The system shall restrict `/admin` access to admin users only.  
- `REQ-F-29 (H)`: The system shall allow admins to create problems (MCQ and CODING) with fields: title, description, difficulty, type, points, round, and optional constraints and samples.  
- `REQ-F-30 (H)`: The system shall allow admins to attach test cases to coding problems and options to MCQ problems.  
- `REQ-F-31 (H)`: The system shall allow admins to view and delete problems.  
- `REQ-F-32 (M)`: The system should provide dashboard statistics (total users, teams, problems, submissions, accepted submissions, etc.).  
- `REQ-F-33 (M)`: The system should show recent submissions with user, problem, status, and score details.

---

## 4.7 Proctoring

### 4.7.1 Description and Priority

Monitors exam integrity by using camera and browser behavior; logs violations for later review.  
Priority: **High** for high-stakes rounds.

### 4.7.2 Stimulus/Response Sequences

1. User opens MCQ or coding round page.  
2. Proctoring widget requests camera permissions and starts monitoring.  
3. On suspicious activity (tab hide, focus loss, or configured violations), system logs proctoring events.  
4. Admin accesses proctoring dashboard to review logs.

### 4.7.3 Functional Requirements

- `REQ-F-34 (H)`: The system shall request and require camera permissions for proctored rounds.  
- `REQ-F-35 (H)`: The system shall log proctoring sessions and violations with timestamps and user IDs.  
- `REQ-F-36 (M)`: The system should auto-stop proctoring when the exam/tab is closed or auto-submission is triggered.  
- `REQ-F-37 (M)`: The system should provide an admin-facing summary of proctoring data (sessions and violations) for investigation.

---

# 5. Other Nonfunctional Requirements

## 5.1 Performance Requirements

- `REQ-NF-1 (H)`: The system shall support at least **N (TBD)** concurrent users during peak periods (e.g., during online rounds) with median API response time below **500 ms** for core endpoints (`/api/problems`, `/api/submissions`, `/api/leaderboard`).  
- `REQ-NF-2 (M)`: The leaderboard API shall respond within **1 second** for up to 100 ranked users.  
- `REQ-NF-3 (M)`: Code run requests (`/api/run`) shall return results within **10 seconds** in typical conditions, subject to external judge limits.  
- `REQ-NF-4 (M)`: UI shall load main pages (home, dashboard, rounds) within **3 seconds** on standard broadband.

## 5.2 Safety Requirements

- `REQ-NF-5 (M)`: The system shall preserve submitted responses and code, even if the user’s browser session ends unexpectedly (submissions must be durable in MongoDB).  
- `REQ-NF-6 (M)`: In case of critical backend failures, the system shall avoid data corruption (MongoDB writes must use proper consistency semantics).  
- `REQ-NF-7 (L)`: The system should allow admins to re-run scoring or regenerate leaderboards after recovery from an incident.

## 5.3 Security Requirements

- `REQ-NF-8 (H)`: All passwords shall be hashed (e.g., bcrypt) and never stored in plain text.  
- `REQ-NF-9 (H)`: All authenticated operations shall require a valid NextAuth session or JWT token.  
- `REQ-NF-10 (H)`: Sensitive routes (e.g., `/admin`, `/api/problems` POST/DELETE) shall be restricted to admin role.  
- `REQ-NF-11 (H)`: All communication in production shall use HTTPS.  
- `REQ-NF-12 (M)`: The system should log critical security events (failed logins, role changes, admin actions) for forensic purposes.  
- `REQ-NF-13 (M)`: The system should protect against common web vulnerabilities (XSS, CSRF, injection) as per Next.js and best-practice configurations.

## 5.4 Software Quality Attributes

- **Usability**  
  - `REQ-NF-14 (M)`: New participants shall be able to register and reach the dashboard in **≤ 5 minutes** without training.  
  - `REQ-NF-15 (M)`: The UI shall be responsive and accessible (WCAG-aligned components from shadcn/ui).

- **Reliability & Availability**  
  - `REQ-NF-16 (M)`: During competition time windows, target availability is **≥ 99%**.  

- **Maintainability**  
  - `REQ-NF-17 (M)`: The codebase shall remain TypeScript-typed and pass `npm run lint` and `npm run type-check` without errors.  

- **Portability**  
  - `REQ-NF-18 (M)`: The system shall run on any Node.js 18+ environment supporting Next.js 14.

## 5.5 Business Rules

- `BR-1`: Only admins may create, edit, or delete problems.  
- `BR-2`: Team size shall be between 1 and 3 members.  
- `BR-3`: Only participants who pass Round 1 may access Round 2 coding submissions, unless explicitly overridden (admin/off-schedule flag).  
- `BR-4`: Registration fee, deadlines, and payment modes displayed on the home page must match official event policy.  
- `BR-5`: Certificates shall only be generated for participants who meet eligibility criteria defined by organizers (e.g., participation or ranking thresholds).

---

# 6. Other Requirements

- Database indexing requirements:
  - Collections such as `Submission` should have indexes on `(userId, problemId)`, `(teamId)`, and `(status)` for efficient leaderboard and stats queries.  
- Internationalization (optional/TBD):
  - UI language defaults to English; further languages may be added in future versions (TBD).  
- Legal/Compliance:
  - Organizers must ensure privacy policy and terms of use are communicated on the site and comply with applicable institutional and regional rules.  
- Reuse:
  - The system should be configurable for future hackathons (e.g., year, theme, rounds) without major code changes (TBD configuration model).

---

## Appendix A: Glossary

- **Admin** – User with elevated privileges to manage problems, submissions, and event configuration.  
- **Participant / User** – Registered user participating in the hackathon.  
- **MCQ** – Multiple Choice Question; in this portal, may be modelled as text-based answers or options.  
- **Coding Round** – Assessment where participants submit solutions in programming languages to algorithmic problems.  
- **Submission** – A record of a user’s answer or code for a problem.  
- **Proctoring** – Monitoring of participants using camera and browser telemetry to detect potential cheating.  
- **Judge0** – External code execution service used to run and evaluate code.  
- **NextAuth** – Authentication library for Next.js.  

---

## Appendix B: Analysis Models

(TBD – may include:)

- Use case diagrams:
  - Register & Login  
  - Participate in MCQ Round  
  - Participate in Coding Round  
  - Manage Problems (Admin)  
  - View Leaderboard

- Data model overview:
  - ERD or class diagram for `User`, `Team`, `Problem`, `Submission`, `TestCase`, `MCQOption`, `ProctoringSession`, `ProctoringViolation`.

---

## Appendix C: To Be Determined (TBD) List

| TBD ID | Description                                              | Section | Owner      | Target Date |
|--------|----------------------------------------------------------|---------|------------|-------------|
| TBD-1  | Exact peak concurrent user requirement (N)               | 5.1     | `<Owner>`  | `<Date>`    |
| TBD-2  | Detailed scoring rules per round and tie-breaking policy | 4.3/4.4 | `<Owner>`  | `<Date>`    |
| TBD-3  | Finalized certificate eligibility criteria               | 5.5     | `<Owner>`  | `<Date>`    |
| TBD-4  | Additional supported languages for coding round          | 4.4     | `<Owner>`  | `<Date>`    |
| TBD-5  | Internationalization/localization requirements           | 6       | `<Owner>`  | `<Date>`    |
